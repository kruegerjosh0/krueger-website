CREATE TABLE "gallery_categories" (
	"id" serial PRIMARY KEY,
	"title" text NOT NULL,
	"show_on_homepage" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "gallery_photos" (
	"id" serial PRIMARY KEY,
	"category_id" integer NOT NULL,
	"image_url" text NOT NULL,
	"tag" text DEFAULT '',
	"alt_text" text DEFAULT '',
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" serial PRIMARY KEY,
	"key" text NOT NULL UNIQUE,
	"business_name" text DEFAULT 'Krueger Painting' NOT NULL,
	"phone" text DEFAULT '262-339-5822' NOT NULL,
	"facebook_url" text DEFAULT 'https://facebook.com' NOT NULL,
	"logo_url" text DEFAULT '' NOT NULL,
	"footer_text" text DEFAULT '© 2026 Krieger Painting DBA Krueger Painting. All rights reserved.' NOT NULL,
	"hero_headline_white" text DEFAULT 'Quality Craftsmanship.' NOT NULL,
	"hero_headline_yellow" text DEFAULT 'Flawless Finishes.' NOT NULL,
	"hero_description" text DEFAULT 'Professional interior and exterior painting, drywall repair, and pressure washing across Washington County, Wisconsin.' NOT NULL,
	"hero_primary_button" text DEFAULT 'Get Free Estimate' NOT NULL,
	"hero_secondary_button" text DEFAULT 'View Gallery' NOT NULL,
	"services_heading" text DEFAULT 'What We Do' NOT NULL,
	"estimate_heading" text DEFAULT 'Request an Estimate' NOT NULL,
	"estimate_button_text" text DEFAULT 'Submit Request' NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "gallery_photos" ADD CONSTRAINT "gallery_photos_category_id_gallery_categories_id_fkey" FOREIGN KEY ("category_id") REFERENCES "gallery_categories"("id");