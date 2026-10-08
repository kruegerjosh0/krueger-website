import express from "express";
import { readFile, writeFile } from "node:fs/promises";
import { join, extname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

const app = express();
const PORT = 3000;

// Body parsing with 50mb limit for image uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Ensure HTML files and root pages are never cached by the browser
app.use((req, res, next) => {
  if (req.path.endsWith(".html") || req.path === "/" || req.path === "/admin" || req.path === "/admin/") {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
  }
  next();
});

// In-memory blob stores (AI Studio mock for @netlify/blobs)
const memoryBlobStores = new Map();

function getStore(storeName) {
  if (!memoryBlobStores.has(storeName)) {
    memoryBlobStores.set(storeName, new Map());
  }
  const store = memoryBlobStores.get(storeName);
  return {
    async get(key, options = {}) {
      const val = store.get(key);
      if (val === undefined) return null;
      if (options.type === "json") {
        try {
          return typeof val === "string" ? JSON.parse(val) : val;
        } catch {
          return null;
        }
      }
      return val;
    },
    async set(key, val) {
      store.set(key, val);
    },
    async setJSON(key, val) {
      store.set(key, val);
    },
  };
}

// Fallback JSON loader from /data/
async function loadFallbackJSON(name) {
  try {
    const filePath = join(__dirname, "data", `${name}.json`);
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
  } catch {
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

// Netlify rewrite rule
app.get("/admin.html", (_req, res) => {
  res.redirect(301, "/admin/");
});

// GET /api/content
app.get("/api/content", async (_req, res) => {
  try {
    const baseContent = await getBaseContent();
    // Attempt optional DB overrides if database is connected
    try {
      const { db } = await import("./db/index.js");
      const { siteSettings, galleryCategories, galleryPhotos } = await import("./db/schema.js");
      const { eq, asc } = await import("drizzle-orm");

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

      if (dbCategories && dbCategories.length > 0) {
        const dbPhotos = await db
          .select()
          .from(galleryPhotos)
          .orderBy(asc(galleryPhotos.sortOrder), asc(galleryPhotos.id));

        baseContent.gallery.categories = dbCategories.map((cat) => ({
          id: cat.id,
          title: cat.title,
          show_on_homepage: cat.showOnHomepage,
          photos: (dbPhotos || [])
            .filter((p) => p.categoryId === cat.id)
            .map((p) => ({
              id: p.id,
              image: p.imageUrl,
              tag: p.tag || "",
              alt: p.altText || "",
            })),
        }));
      }
    } catch {
      // DB not connected or optional tables not migrated
    }

    res.json(baseContent);
  } catch (error) {
    console.error("Error reading content:", error);
    const fallbackSettings = (await loadFallbackJSON("settings")) || {};
    const fallbackHero = (await loadFallbackJSON("hero")) || {};
    const fallbackServices = (await loadFallbackJSON("services")) || {};
    const fallbackEstimate = (await loadFallbackJSON("estimate")) || {};
    const fallbackGallery = (await loadFallbackJSON("gallery")) || {};

    res.json({
      settings: fallbackSettings,
      hero: fallbackHero,
      services: fallbackServices,
      estimate: fallbackEstimate,
      gallery: fallbackGallery,
    });
  }
});

// POST /api/content
app.post("/api/content", async (req, res) => {
  try {
    const payload = req.body;
    const current = await getBaseContent();
    const blobStore = getStore("site-data");

    if (payload.action === "update_logo") {
      const logoUrl = typeof payload.logo === "string" ? payload.logo.trim() : "";
      current.settings.logo = logoUrl;
      await blobStore.setJSON("content", current);

      try {
        const { db } = await import("./db/index.js");
        const { siteSettings } = await import("./db/schema.js");
        const { eq } = await import("drizzle-orm");

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
      } catch {
        // Safe fallback
      }

      return res.json({ success: true, logo: logoUrl });
    }

    if (payload.action === "update_settings") {
      const { business_name, phone, facebook_url, footer_text } = payload.settings || {};
      if (business_name) current.settings.business_name = business_name;
      if (phone) current.settings.phone = phone;
      if (facebook_url !== undefined) current.settings.facebook_url = facebook_url;
      if (footer_text) current.settings.footer_text = footer_text;

      await blobStore.setJSON("content", current);

      try {
        const { db } = await import("./db/index.js");
        const { siteSettings } = await import("./db/schema.js");
        const { eq } = await import("drizzle-orm");

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
      } catch {
        // Safe fallback
      }

      return res.json({ success: true });
    }

    if (payload.action === "update_hero") {
      const { background_image, overlay_opacity, headline_white, headline_yellow, description } = payload.hero || {};
      if (background_image !== undefined) current.hero.background_image = background_image;
      if (overlay_opacity !== undefined) current.hero.overlay_opacity = overlay_opacity;
      if (headline_white !== undefined) current.hero.headline_white = headline_white;
      if (headline_yellow !== undefined) current.hero.headline_yellow = headline_yellow;
      if (description !== undefined) current.hero.description = description;

      await blobStore.setJSON("content", current);
      return res.json({ success: true, hero: current.hero });
    }

    if (payload.action === "save_gallery") {
      const categories = Array.isArray(payload.categories) ? payload.categories : [];
      current.gallery.categories = categories;

      await blobStore.setJSON("content", current);

      try {
        const { db } = await import("./db/index.js");
        const { galleryCategories, galleryPhotos } = await import("./db/schema.js");

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
      } catch {
        // Safe fallback
      }

      return res.json({ success: true });
    }

    return res.status(400).json({ error: "Unknown action" });
  } catch (error) {
    console.error("Error updating content:", error);
    return res.status(500).json({ error: "Failed to update content" });
  }
});

// POST /api/upload
app.post("/api/upload", async (req, res) => {
  try {
    const contentType = req.headers["content-type"] || "";
    let fileBuffer;
    let extension = "jpg";

    if (contentType.includes("multipart/form-data")) {
      // Not typically used by the frontend (it posts { data: base64 }), but handled safely
      return res.status(400).json({ error: "Base64 data expected" });
    } else {
      const body = req.body;
      if (!body.data) {
        return res.status(400).json({ error: "Missing data payload" });
      }

      const match = body.data.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
      if (match) {
        extension = match[1] === "jpeg" ? "jpg" : match[1];
        fileBuffer = Buffer.from(match[2], "base64");
      } else {
        return res.status(400).json({ error: "Invalid image format" });
      }
    }

    const safeKey = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${extension}`;
    const store = getStore("site-images");
    await store.set(safeKey, fileBuffer);

    return res.json({
      url: `/api/images/${safeKey}`,
      key: safeKey,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ error: "Upload failed" });
  }
});

// GET /api/images/:key
app.get("/api/images/:key", async (req, res) => {
  const key = req.params.key;
  if (!key) {
    return res.status(400).send("Missing image key");
  }

  const safeKey = basename(key);

  try {
    const store = getStore("site-images");
    let buffer = await store.get(safeKey);

    if (!buffer) {
      // Check if file exists on disk in images/ directory
      try {
        const filePath = join(__dirname, "images", safeKey);
        buffer = await readFile(filePath);
      } catch {
        // Not found
      }
    }

    if (!buffer) {
      return res.status(404).send("Image not found");
    }

    let contentType = "application/octet-stream";
    const lowerKey = key.toLowerCase();
    if (lowerKey.endsWith(".jpg") || lowerKey.endsWith(".jpeg")) {
      contentType = "image/jpeg";
    } else if (lowerKey.endsWith(".png")) {
      contentType = "image/png";
    } else if (lowerKey.endsWith(".webp")) {
      contentType = "image/webp";
    } else if (lowerKey.endsWith(".svg")) {
      contentType = "image/svg+xml";
    } else if (lowerKey.endsWith(".gif")) {
      contentType = "image/gif";
    }

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    return res.send(Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer));
  } catch (error) {
    console.error("Error retrieving image blob:", error);
    return res.status(500).send("Error retrieving image");
  }
});

// Serve static frontend files
app.use(express.static(__dirname));

// Start server on port 3000 and host 0.0.0.0
app.listen(PORT, "0.0.0.0", () => {
  console.log(`> Ready on http://localhost:${PORT}`);
  console.log(`> Local: http://localhost:${PORT}`);
  console.log(`> Network: http://0.0.0.0:${PORT}`);
});
