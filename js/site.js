// Fills the page with content managed in the admin page (/admin/).
// The HTML already contains default text, so the page still works if a data file can't be loaded.
(function () {
    // Netlify Identity handles invite/password links that land on the site,
    // then sends the logged-in admin to the CMS
    if (window.netlifyIdentity) {
        window.netlifyIdentity.on("init", user => {
            if (!user) {
                window.netlifyIdentity.on("login", () => { document.location.href = "/admin/"; });
            }
        });
    }

    const DATA_FILES = ["settings", "hero", "services", "estimate", "gallery"];

    async function loadJSON(name) {
        try {
            const response = await fetch(`/data/${name}.json`, { cache: "no-cache" });
            return response.ok ? await response.json() : null;
        } catch (error) {
            return null;
        }
    }

    // Expose internal functions for testing environment
    if (typeof window !== "undefined" && window.process && window.process.env && window.process.env.NODE_ENV === "test") {
        window.__TEST_EXPORTS__ = { loadJSON };
    }

    function lookup(data, path) {
        const [file, key] = path.split(".");
        return data[file] ? data[file][key] : undefined;
    }

    function isWebLink(url) {
        return typeof url === "string" && /^https?:\/\//i.test(url);
    }

    function applySimpleFields(data) {
        document.querySelectorAll("[data-cms]").forEach(el => {
            const value = lookup(data, el.dataset.cms);
            if (typeof value === "string" && value.trim()) el.textContent = value;
        });

        document.querySelectorAll("[data-cms-src]").forEach(el => {
            const value = lookup(data, el.dataset.cmsSrc);
            const circle = el.closest(".logo-circle");
            const fallback = circle ? circle.querySelector(".logo-fallback") : null;

            if (value && typeof value === "string" && value.trim()) {
                el.src = value;
                el.hidden = false;
                if (fallback) fallback.hidden = true;

                el.onerror = () => {
                    el.hidden = true;
                    if (fallback) fallback.hidden = false;
                };
            } else {
                el.hidden = true;
                if (fallback) fallback.hidden = false;
            }
        });

        document.querySelectorAll("[data-cms-tel]").forEach(el => {
            const phone = lookup(data, el.dataset.cmsTel);
            if (phone && typeof phone === "string" && phone.trim()) {
                el.href = `tel:${phone.trim()}`;
            }
        });

        document.querySelectorAll("[data-cms-href]").forEach(el => {
            const value = lookup(data, el.dataset.cmsHref);
            if (value === "") el.hidden = true;
            else if (isWebLink(value)) el.href = value;
        });

        const name = lookup(data, "settings.business_name");
        document.querySelectorAll(".logo-row img").forEach(img => { if (name) img.alt = `${name} logo`; });
    }

    function renderServices(data) {
        const list = document.getElementById("services-list");
        const services = data.services && data.services.services;
        if (!list || !Array.isArray(services) || !services.length) return;

        list.replaceChildren(...services.map(service => {
            const card = document.createElement("div");
            card.className = "service-card";
            const title = document.createElement("h4");
            title.textContent = service.title || "";
            const text = document.createElement("p");
            text.textContent = service.description || "";
            card.append(title, text);
            return card;
        }));
    }

    function categoriesWithPhotos(gallery) {
        const categories = (gallery && gallery.categories) || [];
        return categories.filter(c => Array.isArray(c.photos) && c.photos.some(p => p.image));
    }

    function emptyNote(text) {
        const note = document.createElement("p");
        note.className = "empty-note";
        note.textContent = text;
        return note;
    }

    // Homepage: stacked photos per category, with tags above the photos they describe
    function renderHomeGallery(data) {
        const container = document.getElementById("dynamic-gallery");
        if (!container || !data.gallery) return;

        const categories = categoriesWithPhotos(data.gallery).filter(c => c.show_on_homepage !== false);
        if (!categories.length) {
            container.replaceChildren(emptyNote("Project photos coming soon."));
            return;
        }

        container.replaceChildren(...categories.map(category => {
            const block = document.createElement("div");
            block.className = "project-category";

            const header = document.createElement("div");
            header.className = "category-header";
            header.textContent = category.title;
            block.appendChild(header);

            category.photos.filter(p => p.image).forEach(photo => {
                if (photo.tag) {
                    const tag = document.createElement("div");
                    tag.className = "tag";
                    tag.textContent = photo.tag;
                    block.appendChild(tag);
                }
                const img = document.createElement("img");
                img.src = photo.image;
                img.alt = photo.alt || photo.tag || category.title;
                img.className = "gallery-img";
                img.loading = "lazy";
                block.appendChild(img);
            });
            return block;
        }));
    }

    // Gallery page: filterable grid with tag badges and a tap-to-enlarge viewer
    function renderGalleryPage(data) {
        const grid = document.getElementById("photo-grid");
        const filterBar = document.getElementById("filter-bar");
        if (!grid || !data.gallery) return;

        const categories = categoriesWithPhotos(data.gallery);
        if (!categories.length) {
            grid.replaceChildren(emptyNote("Project photos coming soon."));
            return;
        }

        const lightbox = document.getElementById("lightbox");
        const lightboxImg = lightbox.querySelector("img");
        const lightboxCaption = lightbox.querySelector("p");

        const tiles = [];
        categories.forEach(category => {
            category.photos.filter(p => p.image).forEach(photo => {
                const tile = document.createElement("figure");
                tile.className = "photo-tile";
                tile.dataset.category = category.title;

                const img = document.createElement("img");
                img.src = photo.image;
                img.alt = photo.alt || photo.tag || category.title;
                img.loading = "lazy";
                tile.appendChild(img);

                if (photo.tag) {
                    const badge = document.createElement("span");
                    badge.className = "tag-badge";
                    badge.textContent = photo.tag;
                    tile.appendChild(badge);
                }

                tile.addEventListener("click", () => {
                    lightboxImg.src = photo.image;
                    lightboxImg.alt = img.alt;
                    lightboxCaption.textContent = [category.title, photo.tag].filter(Boolean).join(" · ");
                    lightbox.hidden = false;
                });
                tiles.push(tile);
            });
        });
        grid.replaceChildren(...tiles);

        const filters = ["All", ...categories.map(c => c.title)];
        filterBar.replaceChildren(...filters.map((label, index) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "filter-btn" + (index === 0 ? " active" : "");
            button.textContent = label;
            button.addEventListener("click", () => {
                filterBar.querySelectorAll(".filter-btn").forEach(b => b.classList.toggle("active", b === button));
                tiles.forEach(tile => { tile.hidden = label !== "All" && tile.dataset.category !== label; });
            });
            return button;
        }));

        const close = () => { lightbox.hidden = true; };
        lightbox.addEventListener("click", close);
        document.addEventListener("keydown", e => { if (e.key === "Escape") close(); });
    }

    async function init() {
        let data = null;
        try {
            const apiRes = await fetch("/api/content", { cache: "no-cache" });
            if (apiRes.ok) {
                const apiData = await apiRes.json();
                if (apiData && apiData.settings) {
                    data = apiData;
                }
            }
        } catch (e) {
            // Serverless API not available or static fallback
        }

        if (!data) {
            const results = await Promise.all(DATA_FILES.map(loadJSON));
            data = Object.fromEntries(DATA_FILES.map((name, i) => [name, results[i]]));
        }

        applySimpleFields(data);
        renderServices(data);
        renderHomeGallery(data);
        renderGalleryPage(data);
    }

    init();
})();
