import { describe, test, expect, beforeAll, beforeEach } from "bun:test";
import { Window } from "happy-dom";

describe("site.js testing", () => {
  let window;
  let document;
  let site;


  beforeAll(() => {
    window = new Window();
    document = window.document;
    global.window = window;
    global.document = document;

    // Mock fetch to prevent IIFE init from failing on relative URLs
    global.fetch = () => Promise.resolve({ ok: true, json: () => Promise.resolve({}) });

    // Load module containing isolated logic.
    site = require("../js/site.js");
  });


  beforeEach(() => {
    // Reset document state between tests
    document.body.innerHTML = "";
  });

  describe("lookup", () => {
    test("retrieves nested property from object", () => {
      const data = {
        settings: { business_name: "Krueger Painting" },
        hero: { title: "Welcome" }
      };

      expect(site.lookup(data, "settings.business_name")).toBe("Krueger Painting");
      expect(site.lookup(data, "hero.title")).toBe("Welcome");
      expect(site.lookup(data, "services.missing")).toBeUndefined();
    });
  });

  describe("isWebLink", () => {
    test("validates valid and invalid web URLs", () => {
      expect(site.isWebLink("http://example.com")).toBe(true);
      expect(site.isWebLink("https://example.com")).toBe(true);
      expect(site.isWebLink("ftp://example.com")).toBe(false);
      expect(site.isWebLink("")).toBe(false);
      expect(site.isWebLink(null)).toBe(false);
    });
  });

  describe("applySimpleFields", () => {
    test("populates text content correctly", () => {
      document.body.innerHTML = `
        <h1 data-cms="settings.business_name"></h1>
        <p data-cms="hero.description"></p>
      `;

      const data = {
        settings: { business_name: "Acme Corp" },
        hero: { description: "Best products" }
      };

      site.applySimpleFields(data);

      const h1 = document.querySelector("h1");
      const p = document.querySelector("p");

      expect(h1.textContent).toBe("Acme Corp");
      expect(p.textContent).toBe("Best products");
    });

    test("populates image sources correctly", () => {
      document.body.innerHTML = `
        <div class="logo-circle">
          <img data-cms-src="settings.logo" src="" hidden>
          <span class="logo-fallback" hidden>Fallback</span>
        </div>
      `;

      const data = {
        settings: { logo: "https://example.com/logo.png" }
      };

      site.applySimpleFields(data);

      const img = document.querySelector("img");
      const fallback = document.querySelector(".logo-fallback");

      expect(img.src).toBe("https://example.com/logo.png");
      expect(img.hidden).toBe(false);
      expect(fallback.hidden).toBe(true);
    });

    test("handles missing image sources correctly", () => {
        document.body.innerHTML = `
          <div class="logo-circle">
            <img data-cms-src="settings.logo" src="" hidden>
            <span class="logo-fallback" hidden>Fallback</span>
          </div>
        `;

        const data = {
          settings: { logo: "" }
        };

        site.applySimpleFields(data);

        const img = document.querySelector("img");
        const fallback = document.querySelector(".logo-fallback");

        expect(img.hidden).toBe(true);
        expect(fallback.hidden).toBe(false);
      });

    test("populates telephone links correctly", () => {
      document.body.innerHTML = `<a data-cms-tel="settings.phone"></a>`;

      const data = {
        settings: { phone: " 123-456-7890 " }
      };

      site.applySimpleFields(data);

      const a = document.querySelector("a");
      expect(a.href).toBe("tel:123-456-7890");
    });

    test("populates href links correctly", () => {
        document.body.innerHTML = `<a data-cms-href="settings.facebook_url"></a>`;

        const data = {
          settings: { facebook_url: "https://facebook.com/acme" }
        };

        site.applySimpleFields(data);

        const a = document.querySelector("a");
        expect(a.href).toBe("https://facebook.com/acme");
      });
  });

  describe("renderServices", () => {
    test("renders a list of services into the DOM", () => {
      document.body.innerHTML = `<div id="services-list"></div>`;

      const data = {
        services: {
          services: [
            { title: "Painting", description: "Exterior and interior" },
            { title: "Drywall", description: "Repairing holes" }
          ]
        }
      };

      site.renderServices(data);

      const list = document.getElementById("services-list");
      expect(list.children.length).toBe(2);

      const firstCard = list.children[0];
      expect(firstCard.className).toBe("service-card");
      expect(firstCard.querySelector("h4").textContent).toBe("Painting");
      expect(firstCard.querySelector("p").textContent).toBe("Exterior and interior");
    });

    test("does nothing if list element is missing", () => {
      document.body.innerHTML = ``;
      const data = { services: { services: [{ title: "Painting" }] } };

      expect(() => site.renderServices(data)).not.toThrow();
    });
  });

  describe("categoriesWithPhotos", () => {
    test("returns only categories containing valid photos", () => {
      const gallery = {
        categories: [
          { title: "Empty", photos: [] },
          { title: "NoImage", photos: [{ alt: "test" }] },
          { title: "Valid", photos: [{ image: "img1.png" }, { alt: "no img" }] }
        ]
      };

      const result = site.categoriesWithPhotos(gallery);

      expect(result.length).toBe(1);
      expect(result[0].title).toBe("Valid");
    });
  });

  describe("renderHomeGallery", () => {
    test("renders project categories and photos", () => {
      document.body.innerHTML = `<div id="dynamic-gallery"></div>`;

      const data = {
        gallery: {
          categories: [
            {
              title: "Exterior",
              show_on_homepage: true,
              photos: [
                { image: "ext1.png", tag: "House", alt: "A house" }
              ]
            },
            {
              title: "Hidden",
              show_on_homepage: false,
              photos: [{ image: "hidden.png" }]
            }
          ]
        }
      };

      site.renderHomeGallery(data);

      const container = document.getElementById("dynamic-gallery");
      expect(container.children.length).toBe(1); // Only "Exterior" should show

      const categoryBlock = container.children[0];
      expect(categoryBlock.className).toBe("project-category");
      expect(categoryBlock.querySelector(".category-header").textContent).toBe("Exterior");
      expect(categoryBlock.querySelector(".tag").textContent).toBe("House");
      expect(categoryBlock.querySelector("img").src).toBe("ext1.png");
      expect(categoryBlock.querySelector("img").alt).toBe("A house");
    });

    test("renders empty note when no photos", () => {
        document.body.innerHTML = `<div id="dynamic-gallery"></div>`;

        const data = {
          gallery: {
            categories: [
              {
                title: "Empty",
                photos: []
              }
            ]
          }
        };

        site.renderHomeGallery(data);

        const container = document.getElementById("dynamic-gallery");
        expect(container.children[0].className).toBe("empty-note");
        expect(container.children[0].textContent).toBe("Project photos coming soon.");
      });
  });

  describe("renderGalleryPage", () => {
    test("renders gallery page with filters and lightbox interaction", () => {
      document.body.innerHTML = `
        <div id="filter-bar"></div>
        <div id="photo-grid"></div>
        <div id="lightbox" hidden>
            <img>
            <p></p>
        </div>
      `;

      const data = {
        gallery: {
          categories: [
            {
              title: "Exterior",
              photos: [{ image: "ext1.png", tag: "Tag1" }]
            },
            {
                title: "Interior",
                photos: [{ image: "int1.png", tag: "Tag2" }]
            }
          ]
        }
      };

      site.renderGalleryPage(data);

      const grid = document.getElementById("photo-grid");
      expect(grid.children.length).toBe(2); // Two photos total

      const filterBar = document.getElementById("filter-bar");
      expect(filterBar.children.length).toBe(3); // All, Exterior, Interior
      expect(filterBar.children[0].textContent).toBe("All");

      // Test filtering
      filterBar.children[1].click(); // Click Exterior
      expect(grid.children[0].hidden).toBe(false); // Exterior photo
      expect(grid.children[1].hidden).toBe(true);  // Interior photo

      // Test lightbox
      grid.children[0].click();
      const lightbox = document.getElementById("lightbox");
      expect(lightbox.hidden).toBe(false);
      expect(lightbox.querySelector("img").src).toBe("ext1.png");
      expect(lightbox.querySelector("p").textContent).toBe("Exterior · Tag1");

      // Test lightbox close
      lightbox.click();
      expect(lightbox.hidden).toBe(true);
    });
  });
});
