import type { Config, Context } from "@netlify/functions";
import { getStore } from "@netlify/blobs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { eq, asc } from "drizzle-orm";
import { db } from "../../db/index.js";
import { siteSettings, galleryCategories, galleryPhotos } from "../../db/schema.js";

async function loadFallbackJSON(name: string) {
  try {
    const filePath = join(process.cwd(), "data", `${name}.json`);
    const content = await readFile(filePath, "utf-8");
    return JSON.parse(content);
  } catch (err) {
    return null;
  }
}

async function getBaseContent() {
  const blobStore = getStore("site-data");
  let blobContent = null;
  try {
    blobContent = await blobStore.get("content", { type: "json" });
  } catch (e) {
    // Blob store access fallback
  }

  const fallbackSettings = (await loadFallbackJSON("settings")) || {};
  const fallbackHero = (await loadFallbackJSON("hero")) || {};
  const fallbackServices = (await loadFallbackJSON("services")) || {};
  const fallbackEstimate = (await loadFallbackJSON("estimate")) || {};
  const fallbackGallery = (await loadFallbackJSON("gallery")) || {};

  const defaultContent = {
    settings: fallbackSettings,
    hero: fallbackHero,
    services: fallbackServices,
    estimate: fallbackEstimate,
    gallery: fallbackGallery,
  };

  if (!blobContent) {
    return defaultContent;
  }

  return {
    settings: { ...defaultContent.settings, ...(blobContent.settings || {}) },
    hero: { ...defaultContent.hero, ...(blobContent.hero || {}) },
    services: blobContent.services || defaultContent.services,
    estimate: { ...defaultContent.estimate, ...(blobContent.estimate || {}) },
    gallery: { ...defaultContent.gallery, ...(blobContent.gallery || {}) },
  };
}

export default async (req: Request, _context: Context) => {
  const blobStore = getStore("site-data");

  if (req.method === "GET") {
    try {
      const baseContent = await getBaseContent();

      // Attempt to check if database has overrides
      try {
        const [dbSettings] = await db
          .select()
          .from(siteSettings)
          .where(eq(siteSettings.key, "main"));

        if (dbSettings) {
          if (dbSettings.logoUrl !== undefined) baseContent.settings.logo = dbSettings.logoUrl;
          if (dbSettings.businessName) baseContent.settings.business_name = dbSettings.businessName;
          if (dbSettings.phone) baseContent.settings.phone = dbSettings.phone;
          if (dbSettings.facebookUrl !== undefined) baseContent.settings.facebook_url = dbSettings.facebookUrl;
          if (dbSettings.footerText) baseContent.settings.footer_text = dbSettings.footerText;
          if (dbSettings.heroPrimaryButton) baseContent.hero.primary_button = dbSettings.heroPrimaryButton;
          if (dbSettings.heroDescription) baseContent.hero.description = dbSettings.heroDescription;
        }

        const dbCategories = await db
          .select()
          .from(galleryCategories)
          .orderBy(asc(galleryCategories.sortOrder), asc(galleryCategories.id));

        if (dbCategories.length > 0) {
          const dbPhotos = await db
            .select()
            .from(galleryPhotos)
            .orderBy(asc(galleryPhotos.sortOrder), asc(galleryPhotos.id));

          baseContent.gallery.categories = dbCategories.map((cat) => ({
            id: cat.id,
            title: cat.title,
            show_on_homepage: cat.showOnHomepage,
            photos: dbPhotos
              .filter((p) => p.categoryId === cat.id)
              .map((p) => ({
                id: p.id,
                image: p.imageUrl,
                tag: p.tag || "",
                alt: p.altText || "",
              })),
          }));
        }
      } catch (dbErr) {
        // Table not migrated yet or DB provisioning
      }

      return Response.json(baseContent);
    } catch (error) {
      console.error("Error reading content:", error);
      const fallbackSettings = (await loadFallbackJSON("settings")) || {};
      const fallbackHero = (await loadFallbackJSON("hero")) || {};
      const fallbackServices = (await loadFallbackJSON("services")) || {};
      const fallbackEstimate = (await loadFallbackJSON("estimate")) || {};
      const fallbackGallery = (await loadFallbackJSON("gallery")) || {};

      return Response.json({
        settings: fallbackSettings,
        hero: fallbackHero,
        services: fallbackServices,
        estimate: fallbackEstimate,
        gallery: fallbackGallery,
      });
    }
  }

  if (req.method === "POST") {
    try {
      const payload = await req.json();
      const current = await getBaseContent();

      // Update Logo specifically
      if (payload.action === "update_logo") {
        const logoUrl = typeof payload.logo === "string" ? payload.logo.trim() : "";
        current.settings.logo = logoUrl;
        await blobStore.setJSON("content", current);

        // Try DB update
        try {
          const [existing] = await db
            .select()
            .from(siteSettings)
            .where(eq(siteSettings.key, "main"));

          if (existing) {
            await db
              .update(siteSettings)
              .set({ logoUrl, updatedAt: new Date() })
              .where(eq(siteSettings.key, "main"));
          } else {
            await db.insert(siteSettings).values({
              key: "main",
              logoUrl,
            });
          }
        } catch (dbErr) {
          // Handled gracefully via blob persistence
        }

        return Response.json({ success: true, logo: logoUrl });
      }

      // Update Site Settings
      if (payload.action === "update_settings") {
        const { business_name, phone, facebook_url, footer_text } = payload.settings || {};
        if (business_name) current.settings.business_name = business_name;
        if (phone) current.settings.phone = phone;
        if (facebook_url !== undefined) current.settings.facebook_url = facebook_url;
        if (footer_text) current.settings.footer_text = footer_text;

        await blobStore.setJSON("content", current);

        try {
          const [existing] = await db
            .select()
            .from(siteSettings)
            .where(eq(siteSettings.key, "main"));

          const values = {
            businessName: business_name ?? undefined,
            phone: phone ?? undefined,
            facebookUrl: facebook_url ?? undefined,
            footerText: footer_text ?? undefined,
            updatedAt: new Date(),
          };

          if (existing) {
            await db.update(siteSettings).set(values).where(eq(siteSettings.key, "main"));
          } else {
            await db.insert(siteSettings).values({
              key: "main",
              ...values,
            });
          }
        } catch (dbErr) {
          // Handled gracefully via blob persistence
        }

        return Response.json({ success: true });
      }

      // Update Photo Gallery
      if (payload.action === "save_gallery") {
        const categories = Array.isArray(payload.categories) ? payload.categories : [];
        current.gallery.categories = categories;

        await blobStore.setJSON("content", current);

        try {
          await db.delete(galleryPhotos);
          await db.delete(galleryCategories);

          for (let i = 0; i < categories.length; i++) {
            const cat = categories[i];
            const [insertedCat] = await db
              .insert(galleryCategories)
              .values({
                title: cat.title || "Category",
                showOnHomepage: cat.show_on_homepage !== false,
                sortOrder: i,
              })
              .returning();

            if (Array.isArray(cat.photos)) {
              for (let j = 0; j < cat.photos.length; j++) {
                const photo = cat.photos[j];
                if (photo.image) {
                  await db.insert(galleryPhotos).values({
                    categoryId: insertedCat.id,
                    imageUrl: photo.image,
                    tag: photo.tag || "",
                    altText: photo.alt || "",
                    sortOrder: j,
                  });
                }
              }
            }
          }
        } catch (dbErr) {
          // Handled gracefully via blob persistence
        }

        return Response.json({ success: true });
      }

      return Response.json({ error: "Unknown action" }, { status: 400 });
    } catch (error) {
      console.error("Error updating content:", error);
      return Response.json({ error: "Failed to update content" }, { status: 500 });
    }
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config: Config = {
  path: "/api/content",
};
