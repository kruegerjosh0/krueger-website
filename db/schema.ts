import { pgTable, serial, text, boolean, integer, timestamp } from "drizzle-orm/pg-core";

export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  businessName: text("business_name").notNull().default("Krueger Painting"),
  phone: text("phone").notNull().default("262-443-1199"),
  facebookUrl: text("facebook_url").notNull().default("https://www.facebook.com/share/1EySXfm7FM/"),
  logoUrl: text("logo_url").notNull().default(""),
  footerText: text("footer_text").notNull().default(""),
  heroHeadlineWhite: text("hero_headline_white").notNull().default("Quality Craftsmanship."),
  heroHeadlineYellow: text("hero_headline_yellow").notNull().default("Flawless Finishes."),
  heroDescription: text("hero_description").notNull().default("Professional interior and exterior painting, drywall repair, and pressure washing with quality craftsmanship and durable finishes."),
  heroPrimaryButton: text("hero_primary_button").notNull().default("Tap for Free Estimate"),
  heroSecondaryButton: text("hero_secondary_button").notNull().default("View Gallery"),
  servicesHeading: text("services_heading").notNull().default("What We Do"),
  estimateHeading: text("estimate_heading").notNull().default("Request an Estimate"),
  estimateButtonText: text("estimate_button_text").notNull().default("Submit Request"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const galleryCategories = pgTable("gallery_categories", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  showOnHomepage: boolean("show_on_homepage").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const galleryPhotos = pgTable("gallery_photos", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").notNull().references(() => galleryCategories.id),
  imageUrl: text("image_url").notNull(),
  tag: text("tag").default(""),
  altText: text("alt_text").default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});
