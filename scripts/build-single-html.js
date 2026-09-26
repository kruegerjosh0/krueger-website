import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const cssContent = fs.readFileSync(path.join(root, "css/styles.css"), "utf8");

const kitchenSvg = "data:image/svg+xml;base64," + fs.readFileSync(path.join(root, "images/kitchen-cabinets.svg")).toString("base64");
const drywallSvg = "data:image/svg+xml;base64," + fs.readFileSync(path.join(root, "images/drywall-repair.svg")).toString("base64");
const deckSvg = "data:image/svg+xml;base64," + fs.readFileSync(path.join(root, "images/deck-stain.svg")).toString("base64");

const settings = JSON.parse(fs.readFileSync(path.join(root, "data/settings.json"), "utf8"));
const hero = JSON.parse(fs.readFileSync(path.join(root, "data/hero.json"), "utf8"));
const services = JSON.parse(fs.readFileSync(path.join(root, "data/services.json"), "utf8"));
const estimate = JSON.parse(fs.readFileSync(path.join(root, "data/estimate.json"), "utf8"));
const gallery = JSON.parse(fs.readFileSync(path.join(root, "data/gallery.json"), "utf8"));

// Update gallery photos to use embedded SVG data URLs
gallery.categories[0].photos[0].image = kitchenSvg;
gallery.categories[1].photos[0].image = drywallSvg;
gallery.categories[2].photos[0].image = deckSvg;

const defaultSiteData = {
  settings,
  hero,
  services,
  estimate,
  gallery,
};

const adminStyles = `
/* ADMIN PANEL & MODAL STYLES */
.admin-modal-backdrop {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(10, 12, 16, 0.96);
    z-index: 1000;
    overflow-y: auto;
    backdrop-filter: blur(8px);
}
.admin-modal-backdrop.open {
    display: flex;
    flex-direction: column;
}
.admin-header-bar {
    background: #181c20;
    border-bottom: 1px solid #2a313a;
    padding: 12px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 1010;
}
.admin-title-wrap {
    display: flex;
    align-items: center;
    gap: 12px;
    font-weight: 800;
    color: var(--primary);
    font-size: 1.05rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}
.admin-controls-right {
    display: flex;
    align-items: center;
    gap: 10px;
}
.btn-admin-close {
    background: #2a313a;
    color: #eee;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 0.85rem;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.2s;
}
.btn-admin-close:hover {
    background: #3c4654;
    color: #fff;
}
.btn-export-html {
    background: linear-gradient(135deg, #22c55e, #16a34a);
    color: #ffffff;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 0.85rem;
    font-weight: 800;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
}
.btn-export-html:hover {
    filter: brightness(1.1);
    transform: translateY(-1px);
}
.admin-login-card {
    max-width: 440px;
    width: 90%;
    margin: 60px auto;
    text-align: center;
    padding: 32px 24px;
    background: #1b2026;
    border: 1px solid #2d3540;
    border-radius: 8px;
    box-shadow: 0 8px 30px rgba(0,0,0,0.5);
    box-sizing: border-box;
}
.admin-tabs-nav {
    display: flex;
    background: #181c20;
    border-bottom: 2px solid #2a313a;
    overflow-x: auto;
    padding: 0 16px;
    gap: 6px;
}
.admin-tab-btn {
    background: transparent;
    border: none;
    color: #99a2ad;
    font-weight: 800;
    font-size: 0.88rem;
    padding: 14px 18px;
    cursor: pointer;
    border-bottom: 3px solid transparent;
    white-space: nowrap;
    transition: all 0.2s;
}
.admin-tab-btn:hover {
    color: #fff;
}
.admin-tab-btn.active {
    color: var(--primary);
    border-bottom-color: var(--primary);
}
.admin-body-container {
    max-width: 900px;
    width: 100%;
    margin: 24px auto;
    padding: 0 16px;
    box-sizing: border-box;
    flex: 1;
}
.admin-card-box {
    background: #1b2026;
    border: 1px solid #2d3540;
    border-radius: 8px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.3);
}
.admin-card-title {
    margin: 0 0 8px 0;
    font-size: 1.25rem;
    color: var(--primary);
    font-weight: 900;
}
.admin-card-desc {
    margin: 0 0 20px 0;
    color: #a0abb6;
    font-size: 0.92rem;
    line-height: 1.5;
}
.upload-dropzone-box {
    border: 2px dashed #404c5c;
    border-radius: 8px;
    padding: 28px 20px;
    text-align: center;
    background: #15191e;
    cursor: pointer;
    transition: all 0.2s;
}
.upload-dropzone-box:hover {
    border-color: var(--primary);
    background: #1c222a;
}
.admin-alert-banner {
    display: none;
    padding: 12px 16px;
    border-radius: 6px;
    font-weight: 700;
    font-size: 0.9rem;
    margin-bottom: 20px;
}
.admin-alert-success {
    background: rgba(34, 197, 94, 0.15);
    border: 1px solid #22c55e;
    color: #22c55e;
}
.admin-alert-error {
    background: rgba(255, 82, 82, 0.15);
    border: 1px solid #ff5252;
    color: #ff5252;
}
.btn-outline-danger {
    background: transparent;
    color: #ff6b6b;
    border: 1px solid #ff6b6b;
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 0.85rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
}
.btn-outline-danger:hover {
    background: rgba(255, 107, 107, 0.15);
}
.photo-grid-manage {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
}
.photo-item-card {
    background: #15191e;
    border: 1px solid #2d3642;
    border-radius: 6px;
    overflow: hidden;
}
.photo-item-card img {
    width: 100%;
    aspect-ratio: 4 / 3;
    object-fit: cover;
    display: block;
    background: #000;
}
.photo-item-details {
    padding: 10px;
}
.photo-item-tag {
    display: inline-block;
    background: var(--primary);
    color: #000;
    font-size: 0.72rem;
    font-weight: 900;
    padding: 2px 6px;
    border-radius: 3px;
    margin-bottom: 6px;
    text-transform: uppercase;
}
.quick-tag-chip {
    background: #252c34;
    border: 1px solid #3c4654;
    color: #eee;
    padding: 5px 10px;
    border-radius: 4px;
    font-size: 0.78rem;
    font-weight: 800;
    cursor: pointer;
    margin-right: 6px;
    margin-bottom: 6px;
}
.quick-tag-chip:hover {
    background: var(--primary);
    color: #000;
    border-color: var(--primary);
}
.admin-tab-section {
    display: none;
}
.admin-tab-section.active {
    display: block;
}
`;

const singleHtmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Krueger Painting | Professional Painting</title>
    <meta name="description" content="Professional interior and exterior painting, drywall repair, and pressure washing website with photo gallery and content manager.">
    <meta property="og:title" content="Krueger Painting | Professional Painting">
    <meta property="og:description" content="Professional interior and exterior painting, drywall repair, and pressure washing website with photo gallery and content manager.">

    <style>
${cssContent}
${adminStyles}
    </style>
</head>
<body>
    <!-- HEADER -->
    <header>
        <div class="logo-row">
            <a href="#top">
                <div class="logo-circle" id="header-logo-circle">
                    <img src="" alt="Krueger Painting logo" class="logo-img" id="header-logo-img" hidden>
                    <div class="logo-fallback" id="header-logo-fallback" aria-label="Krueger Painting">
                        <span class="logo-monogram">KP</span>
                    </div>
                </div>
                <h1 id="header-business-name">Krueger Painting</h1>
            </a>
        </div>
        <nav class="nav-links">
            <a href="#services">Services</a>
            <a href="#gallery">Gallery</a>
            <a href="#estimate">Request Estimate</a>
            <a href="javascript:void(0)" onclick="openAdminModal()" style="color: #ffcc00; font-size: 0.85rem;">Admin Login</a>
        </nav>
        <div class="action-buttons">
            <a href="tel:262-443-1199" class="btn-call" id="header-call-btn" aria-label="Call Krueger Painting">
                <svg class="btn-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.25 1.02l-2.2 2.2z"/>
                </svg>
                <span>Call Now</span>
            </a>
            <a href="https://www.facebook.com/share/1EySXfm7FM/" target="_blank" rel="noopener" class="btn-fb" id="header-fb-btn" aria-label="Krueger Painting on Facebook">
                <svg class="btn-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span>Facebook</span>
            </a>
        </div>
    </header>

    <!-- HERO SECTION -->
    <section class="hero" id="top">
        <h2><span class="hero-white" id="hero-headline-white">Quality Craftsmanship.</span><br><span class="hero-yellow" id="hero-headline-yellow">Flawless Finishes.</span></h2>
        <p id="hero-description">Professional interior and exterior painting, drywall repair, and pressure washing with quality craftsmanship and durable finishes.</p>
        <div class="hero-btns">
            <a href="#estimate" class="btn-primary" id="hero-btn-primary">Tap for Free Estimate</a>
            <a href="#gallery" class="btn-secondary" id="hero-btn-secondary">View Gallery</a>
        </div>
    </section>

    <!-- SERVICES SECTION -->
    <section id="services" class="container">
        <div class="section-title">
            <h3 id="services-heading">What We Do</h3>
            <div class="underline"></div>
        </div>

        <div id="services-list">
            <!-- Dynamically rendered -->
        </div>
    </section>

    <!-- PHOTO GALLERY SECTION -->
    <section id="gallery" class="container">
        <div class="section-title">
            <h3 id="gallery-heading">Photo Gallery</h3>
            <div class="underline"></div>
        </div>
        <p class="page-intro" id="gallery-intro">Browse our interior painting, drywall repairs, and exterior finish projects.</p>

        <!-- Category Filter Buttons -->
        <div id="filter-bar" class="filter-bar"></div>

        <!-- Filterable Grid -->
        <div id="photo-grid" class="photo-grid"></div>

        <div style="text-align: center; margin-top: 36px;">
            <a href="#estimate" class="btn-primary" style="margin: 0 auto;">Tap for Free Estimate</a>
        </div>
    </section>

    <!-- ESTIMATE REQUEST SECTION -->
    <section id="estimate" class="estimate-section">
        <div class="container" style="padding-top: 20px;">
            <div class="section-title">
                <h3 id="estimate-heading">Request an Estimate</h3>
                <div class="underline"></div>
            </div>
            <form action="https://formspree.io/f/xvzyorqq" method="POST">
                <div class="form-group">
                    <label>Name</label>
                    <input type="text" class="form-control" name="name" placeholder="Your Name" required>
                </div>
                <div class="form-group">
                    <label>Phone</label>
                    <input type="tel" class="form-control" name="phone" placeholder="Your Phone Number" required>
                </div>
                <div class="form-group">
                    <label>Project Details</label>
                    <textarea name="details" class="form-control" placeholder="Describe your painting or drywall project..." required></textarea>
                </div>
                <button type="submit" class="btn-primary" id="estimate-submit-btn" style="max-width: 100%; border: none; cursor: pointer;">Submit Request</button>
            </form>
        </div>
    </section>

    <!-- FOOTER -->
    <footer>
        <p class="footer-address" id="footer-address"><strong>Mailing Address:</strong> N630 Moraine Dr., Campbellsport, WI 53010</p>
        <p class="footer-phone" id="footer-phone-wrap"><strong>Phone:</strong> <a href="tel:262-443-1199" id="footer-phone-link">262-443-1199</a></p>
        <p style="margin: 8px 0;">
            <a href="javascript:void(0)" onclick="openAdminModal()" class="admin-link">🔒 Admin / Developer Login</a>
        </p>
        <p style="font-size: 0.75rem; color: #555; margin-top: 16px;">&copy; <span id="year-copy"></span> Krueger Painting. All rights reserved.</p>
    </footer>

    <!-- LIGHTBOX MODAL -->
    <div id="lightbox" class="lightbox" hidden>
        <button type="button" aria-label="Close" id="lightbox-close-btn">&times;</button>
        <img src="" alt="" id="lightbox-img">
        <p id="lightbox-caption"></p>
    </div>

    <!-- ============================================== -->
    <!-- PASSWORD-PROTECTED DEVELOPER / ADMIN PORTAL   -->
    <!-- ============================================== -->
    <div id="admin-modal" class="admin-modal-backdrop">
        <!-- TOP ADMIN NAV BAR -->
        <nav class="admin-header-bar">
            <div class="admin-title-wrap">
                <div class="logo-circle" style="width: 32px; height: 32px; border-width: 2px;">
                    <img src="" id="admin-top-logo" class="logo-img" alt="Logo" hidden>
                    <div class="logo-fallback" id="admin-top-fallback">
                        <span class="logo-monogram" style="font-size: 0.7rem;">KP</span>
                    </div>
                </div>
                <span>Krueger Developer &amp; Content Manager</span>
            </div>
            <div class="admin-controls-right">
                <button type="button" class="btn-export-html" id="btn-export-site" title="Download updated self-contained HTML file to push to GitHub">
                    ⬇ Export Single HTML
                </button>
                <button type="button" class="btn-admin-close" onclick="closeAdminModal()">Close ✕</button>
            </div>
        </nav>

        <!-- ADMIN LOGIN SCREEN (LOCKED BEHIND PASSWORD) -->
        <div id="admin-login-view" class="admin-login-card">
            <div class="logo-circle" style="margin: 0 auto 16px auto; width: 64px; height: 64px;">
                <div class="logo-fallback">
                    <span class="logo-monogram" style="font-size: 1.4rem;">KP</span>
                </div>
            </div>
            <h2 style="color: var(--primary); margin: 0 0 8px 0; font-size: 1.3rem;">Krueger Painting</h2>
            <p style="color: #aaa; font-size: 0.9rem; margin-bottom: 22px;">Developer &amp; Site Content Dashboard</p>

            <form id="admin-login-form" style="text-align: left;">
                <div style="margin-bottom: 16px;">
                    <label style="color: #ccc; font-size: 0.85rem; font-weight: 700; display: block; margin-bottom: 6px;">Admin Password</label>
                    <div style="position: relative; display: flex; align-items: center;">
                        <input type="password" id="admin-pass-input" class="form-control" placeholder="Enter password" required style="padding-right: 42px;" autocomplete="current-password">
                        <button type="button" id="btn-toggle-login-pw" style="position: absolute; right: 10px; background: transparent; border: none; color: #888; cursor: pointer; font-size: 1.1rem; padding: 4px;" title="Show/Hide Password">👁</button>
                    </div>
                </div>
                <div id="login-error-alert" style="display: none; color: #ff6b6b; background: rgba(255, 107, 107, 0.12); border: 1px solid #ff6b6b; border-radius: 4px; padding: 10px 12px; font-size: 0.85rem; margin-bottom: 16px;"></div>
                <button type="submit" class="btn-primary" style="width: 100%; border: none; cursor: pointer; max-width: 100%;">Sign In to Dashboard</button>
                <p style="margin-top: 14px; font-size: 0.8rem; color: #778; text-align: center;">Default password: <strong style="color: var(--primary);">krueger2026</strong><br><span style="font-size: 0.75rem; color: #667;">(You can change this password anytime in Security settings)</span></p>
            </form>
        </div>

        <!-- AUTHENTICATED DASHBOARD -->
        <div id="admin-dashboard-view" style="display: none; flex-direction: column; flex: 1;">
            <!-- Tabs Navigation -->
            <div class="admin-tabs-nav">
                <button type="button" class="admin-tab-btn active" data-tab="tab-logo">Website Logo</button>
                <button type="button" class="admin-tab-btn" data-tab="tab-photos">Project Photos</button>
                <button type="button" class="admin-tab-btn" data-tab="tab-contact">Business &amp; Contact</button>
                <button type="button" class="admin-tab-btn" data-tab="tab-security">Security &amp; Password</button>
                <button type="button" class="admin-tab-btn" data-tab="tab-export">GitHub &amp; Export</button>
                <button type="button" class="admin-tab-btn" id="btn-admin-logout" style="margin-left: auto; color: #ff6b6b;">Log Out</button>
            </div>

            <main class="admin-body-container">
                <!-- Status notification -->
                <div id="admin-status-alert" class="admin-alert-banner"></div>

                <!-- TAB 1: WEBSITE LOGO -->
                <section id="tab-logo" class="admin-tab-section active">
                    <div class="admin-card-box">
                        <h2 class="admin-card-title">Website Logo</h2>
                        <p class="admin-card-desc">
                            Upload your company logo. It automatically replaces the KP monogram inside the header circle badge on every page of your site.
                        </p>

                        <div style="background: #111417; border: 1px dashed #3a4452; border-radius: 6px; padding: 16px; margin: 16px 0 24px 0;">
                            <div style="font-size: 0.75rem; text-transform: uppercase; font-weight: 800; color: #828d99; margin-bottom: 10px;">Header Preview</div>
                            <div style="background: #111; border: 1px solid #333; border-radius: 6px; padding: 12px 18px; display: flex; align-items: center; justify-content: space-between;">
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <div class="logo-circle" id="preview-logo-circle">
                                        <img src="" id="preview-logo-img" class="logo-img" alt="Logo" hidden>
                                        <div class="logo-fallback" id="preview-logo-fallback">
                                            <span class="logo-monogram">KP</span>
                                        </div>
                                    </div>
                                    <h1 id="preview-biz-title" style="font-size: 1.1rem; color: var(--primary); margin: 0; font-weight: 800;">Krueger Painting</h1>
                                </div>
                                <span style="font-size: 0.8rem; color: #777;">(Top-left corner badge)</span>
                            </div>
                        </div>

                        <input type="file" id="logo-file-picker" accept="image/*" style="display: none;">
                        <div class="upload-dropzone-box" id="logo-dropzone">
                            <div style="font-size: 2.2rem; color: var(--primary); margin-bottom: 8px;">📷</div>
                            <div style="font-size: 1.05rem; font-weight: 800; color: #fff; margin-bottom: 4px;">Tap to Choose Logo Picture</div>
                            <div style="font-size: 0.82rem; color: #8894a0;">Select any PNG, JPG, or WEBP. Square images look best!</div>
                        </div>

                        <div id="logo-action-bar" style="margin-top: 16px; display: none; align-items: center; gap: 12px;">
                            <button type="button" class="btn-primary" id="btn-save-logo-file" style="max-width: 220px; border: none; cursor: pointer;">Save Logo</button>
                            <button type="button" class="btn-outline-danger" id="btn-cancel-logo-file">Cancel</button>
                        </div>

                        <div id="logo-remove-wrap" style="margin-top: 16px;">
                            <button type="button" class="btn-outline-danger" id="btn-remove-logo-btn" style="display: none;">Remove Uploaded Logo (Reset to Monogram)</button>
                        </div>
                    </div>
                </section>

                <!-- TAB 2: PROJECT PHOTOS -->
                <section id="tab-photos" class="admin-tab-section">
                    <div class="admin-card-box">
                        <h2 class="admin-card-title">Project Photo Manager</h2>
                        <p class="admin-card-desc">
                            Manage photos for each category. Upload directly from your camera roll or computer with BEFORE/AFTER tags.
                        </p>

                        <!-- Category Tabs -->
                        <div class="filter-bar" id="manage-cat-tabs" style="justify-content: flex-start; margin-bottom: 20px;"></div>

                        <!-- Current Photos List -->
                        <div id="manage-photos-container" class="photo-grid-manage"></div>

                        <!-- Add Photo Form -->
                        <div style="border-top: 1px solid #2d3642; padding-top: 24px; margin-top: 24px;">
                            <h3 style="color: var(--primary); margin: 0 0 14px 0; font-size: 1.15rem;">+ Add Photo to Selected Category</h3>
                            <form id="add-photo-form">
                                <input type="file" id="photo-upload-input" accept="image/*" style="display: none;">
                                <div class="upload-dropzone-box" id="photo-dropzone-trigger">
                                    <div style="font-size: 2rem; color: var(--primary); margin-bottom: 6px;">🖼️</div>
                                    <div style="font-size: 1rem; font-weight: 800; color: #fff;">Tap to Select Project Photo</div>
                                    <div style="font-size: 0.8rem; color: #8894a0; margin-top: 4px;">Choose from your photo library or take a new picture</div>
                                </div>

                                <div id="new-photo-preview-wrap" style="display: none; margin-top: 16px;">
                                    <div style="max-width: 240px; margin-bottom: 16px; border: 1px solid #3c4654; border-radius: 6px; overflow: hidden;">
                                        <img src="" id="new-photo-preview-img" style="width: 100%; display: block;">
                                    </div>
                                    <div class="form-group">
                                        <label>Photo Tag (Optional)</label>
                                        <input type="text" id="new-photo-tag" class="form-control" placeholder="e.g. BEFORE, AFTER, COMPLETED">
                                        <div style="margin-top: 8px;">
                                            <span style="font-size: 0.75rem; color: #889; margin-right: 6px;">Quick Tags:</span>
                                            <button type="button" class="quick-tag-chip" onclick="setQuickTag('BEFORE')">BEFORE</button>
                                            <button type="button" class="quick-tag-chip" onclick="setQuickTag('AFTER')">AFTER</button>
                                            <button type="button" class="quick-tag-chip" onclick="setQuickTag('DURING (MUD & TAPE)')">DURING (MUD &amp; TAPE)</button>
                                            <button type="button" class="quick-tag-chip" onclick="setQuickTag('AFTER (SEALED)')">AFTER (SEALED)</button>
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <label>Caption / Alt Description (Optional)</label>
                                        <input type="text" id="new-photo-alt" class="form-control" placeholder="e.g. Kitchen cabinet refinishing in Fond du Lac">
                                    </div>
                                    <button type="submit" class="btn-primary" id="btn-save-new-photo" style="max-width: 240px; border: none; cursor: pointer;">Save Photo to Gallery</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </section>

                <!-- TAB 3: BUSINESS & CONTACT -->
                <section id="tab-contact" class="admin-tab-section">
                    <div class="admin-card-box">
                        <h2 class="admin-card-title">Business &amp; Contact Settings</h2>
                        <p class="admin-card-desc">
                            Update your public business phone number, company name, Facebook link, and footer address.
                        </p>
                        <form id="business-settings-form">
                            <div class="form-group">
                                <label>Business Name</label>
                                <input type="text" id="setting-biz-name" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label>Phone Number (Tied to Call Now Button)</label>
                                <input type="tel" id="setting-phone" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label>Facebook Page Link (Leave empty to hide button)</label>
                                <input type="url" id="setting-facebook" class="form-control">
                            </div>
                            <div class="form-group">
                                <label>Footer Mailing Address</label>
                                <input type="text" id="setting-address" class="form-control" value="N630 Moraine Dr., Campbellsport, WI 53010">
                            </div>
                            <button type="submit" class="btn-primary" style="max-width: 240px; border: none; cursor: pointer;">Save Business Info</button>
                        </form>
                    </div>
                </section>

                <!-- TAB 4: SECURITY & PASSWORD -->
                <section id="tab-security" class="admin-tab-section">
                    <div class="admin-card-box">
                        <h2 class="admin-card-title">Security &amp; Admin Password</h2>
                        <p class="admin-card-desc">
                            Change the password used to lock this developer &amp; content manager dashboard.
                        </p>
                        <div style="background: #151a20; border: 1px solid #2a3440; border-radius: 6px; padding: 16px; margin-bottom: 24px;">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <span style="color: #22c55e; font-size: 1.3rem;">🔒</span>
                                <div>
                                    <strong style="color: #fff;">Dashboard is Password-Protected</strong>
                                    <p style="margin: 4px 0 0 0; color: #889; font-size: 0.85rem;">Anyone attempting to access this dashboard must provide your admin password.</p>
                                </div>
                            </div>
                        </div>

                        <form id="change-pw-form" style="max-width: 480px;">
                            <div class="form-group">
                                <label>Current Password</label>
                                <input type="password" id="pw-curr-input" class="form-control" required placeholder="Enter current password" autocomplete="current-password">
                            </div>
                            <div class="form-group">
                                <label>New Password (minimum 6 characters)</label>
                                <input type="password" id="pw-new-input" class="form-control" required minlength="6" placeholder="Enter new password" autocomplete="new-password">
                            </div>
                            <div class="form-group">
                                <label>Confirm New Password</label>
                                <input type="password" id="pw-confirm-input" class="form-control" required minlength="6" placeholder="Repeat new password" autocomplete="new-password">
                            </div>
                            <div id="pw-status-msg" style="display: none; padding: 10px 12px; border-radius: 4px; font-size: 0.85rem; margin-bottom: 16px;"></div>
                            <button type="submit" class="btn-primary" style="max-width: 240px; border: none; cursor: pointer;">Update Admin Password</button>
                        </form>
                    </div>
                </section>

                <!-- TAB 5: GITHUB & EXPORT -->
                <section id="tab-export" class="admin-tab-section">
                    <div class="admin-card-box">
                        <h2 class="admin-card-title">Single-File GitHub Deployment</h2>
                        <p class="admin-card-desc">
                            Your entire site — including all HTML, CSS, JavaScript, project photos, contact forms, and this password-locked admin manager — is bundled into <strong>one single standalone file</strong>!
                        </p>

                        <div style="background: #151a20; border: 1px solid #2a3440; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                            <h4 style="color: var(--primary); margin: 0 0 10px 0; font-size: 1.05rem;">How to Deploy to GitHub Pages in 3 Steps:</h4>
                            <ol style="margin: 0; padding-left: 20px; color: #ccc; font-size: 0.92rem; line-height: 1.8;">
                                <li>Click the green button below: <strong>"Download Standalone index.html"</strong>.</li>
                                <li>In your GitHub repository (<code>krueger-website</code>), upload or commit this <code>index.html</code> directly into the root of the repo.</li>
                                <li>Go to your GitHub repo <strong>Settings → Pages → Branch: main (root) → Save</strong>. Your site is instantly live with zero build tools!</li>
                            </ol>
                        </div>

                        <button type="button" class="btn-export-html" id="btn-export-site-big" style="padding: 14px 28px; font-size: 1rem;">
                            ⬇ Download Standalone index.html for GitHub
                        </button>
                    </div>
                </section>
            </main>
        </div>
    </div>

    <!-- MAIN JAVASCRIPT LOGIC (SELF-CONTAINED) -->
    <script>
    (function () {
        // EMBEDDED DEFAULT STATE
        const INITIAL_SITE_DATA = ${JSON.stringify(defaultSiteData)};
        const DEFAULT_PASSWORD_HASH = "9bd1546c479074aeae9bcf8ee5b1da7a108828cbfa1f32aef9281667471f419a"; // "krueger2026"

        // State holder
        let siteData = loadPersistedData();
        let activeManageCatIdx = 0;
        let pendingNewPhotoData = null;
        let pendingLogoData = null;

        // Load data from localStorage (or fallback to bundled defaults)
        function loadPersistedData() {
            try {
                const stored = localStorage.getItem("kp_site_content");
                if (stored) {
                    const parsed = JSON.parse(stored);
                    if (parsed && parsed.settings && parsed.gallery) {
                        return parsed;
                    }
                }
            } catch (e) {}
            return JSON.parse(JSON.stringify(INITIAL_SITE_DATA));
        }

        // Save data to localStorage (and sync with /api/content if backend is online)
        async function persistSiteData() {
            try {
                localStorage.setItem("kp_site_content", JSON.stringify(siteData));
            } catch (e) {
                console.warn("localStorage quota exceeded or disabled", e);
            }

            // Sync with backend API if available
            try {
                fetch("/api/content", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ action: "update_settings", settings: siteData.settings })
                }).catch(() => {});
                fetch("/api/content", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ action: "save_gallery", categories: siteData.gallery.categories })
                }).catch(() => {});
            } catch (e) {}
        }

        // SHA-256 helper
        async function sha256(message) {
            const msgBuffer = new TextEncoder().encode(message);
            const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        }

        function getStoredPasswordHash() {
            return localStorage.getItem("kp_admin_hash") || DEFAULT_PASSWORD_HASH;
        }

        // Render Homepage and Gallery from siteData
        function renderSite() {
            // Business Name & Logo
            const name = siteData.settings.business_name || "Krueger Painting";
            document.getElementById("header-business-name").textContent = name;
            document.title = name + " | Professional Painting";

            const logo = siteData.settings.logo;
            const logoImg = document.getElementById("header-logo-img");
            const logoFallback = document.getElementById("header-logo-fallback");
            const adminTopLogo = document.getElementById("admin-top-logo");
            const adminTopFallback = document.getElementById("admin-top-fallback");

            if (logo && logo.trim()) {
                logoImg.src = logo;
                logoImg.hidden = false;
                logoFallback.hidden = true;
                adminTopLogo.src = logo;
                adminTopLogo.hidden = false;
                adminTopFallback.hidden = true;
            } else {
                logoImg.hidden = true;
                logoFallback.hidden = false;
                adminTopLogo.hidden = true;
                adminTopFallback.hidden = false;
            }

            // Phone
            const phone = siteData.settings.phone || "262-443-1199";
            const callBtn = document.getElementById("header-call-btn");
            callBtn.href = "tel:" + phone.replace(/[^0-9]/g, "");
            const footerPhone = document.getElementById("footer-phone-link");
            footerPhone.href = "tel:" + phone.replace(/[^0-9]/g, "");
            footerPhone.textContent = phone;

            // Facebook
            const fbBtn = document.getElementById("header-fb-btn");
            const fbUrl = siteData.settings.facebook_url;
            if (fbUrl && fbUrl.trim()) {
                fbBtn.href = fbUrl;
                fbBtn.style.display = "inline-flex";
            } else {
                fbBtn.style.display = "none";
            }

            // Hero
            if (siteData.hero) {
                if (siteData.hero.headline_white) document.getElementById("hero-headline-white").textContent = siteData.hero.headline_white;
                if (siteData.hero.headline_yellow) document.getElementById("hero-headline-yellow").textContent = siteData.hero.headline_yellow;
                if (siteData.hero.description) document.getElementById("hero-description").textContent = siteData.hero.description;
                if (siteData.hero.primary_button) document.getElementById("hero-btn-primary").textContent = siteData.hero.primary_button;
                if (siteData.hero.secondary_button) document.getElementById("hero-btn-secondary").textContent = siteData.hero.secondary_button;
            }

            // Services
            const servicesList = document.getElementById("services-list");
            const services = siteData.services?.services || [];
            servicesList.replaceChildren(...services.map(s => {
                const card = document.createElement("div");
                card.className = "service-card";
                const h4 = document.createElement("h4");
                h4.textContent = s.title;
                const p = document.createElement("p");
                p.textContent = s.description;
                card.append(h4, p);
                return card;
            }));

            // Gallery
            renderGallerySection();

            // Footer year
            document.getElementById("year-copy").textContent = new Date().getFullYear();
        }

        // Gallery filter & photo rendering
        function renderGallerySection() {
            const grid = document.getElementById("photo-grid");
            const filterBar = document.getElementById("filter-bar");
            const categories = siteData.gallery?.categories || [];

            const lightbox = document.getElementById("lightbox");
            const lightboxImg = document.getElementById("lightbox-img");
            const lightboxCaption = document.getElementById("lightbox-caption");

            const allPhotos = [];
            categories.forEach(cat => {
                (cat.photos || []).forEach(photo => {
                    if (photo.image) {
                        allPhotos.push({
                            ...photo,
                            categoryTitle: cat.title
                        });
                    }
                });
            });

            if (!allPhotos.length) {
                grid.replaceChildren(Object.assign(document.createElement("p"), {
                    className: "empty-note",
                    textContent: "Project photos coming soon."
                }));
                filterBar.innerHTML = "";
                return;
            }

            const tiles = allPhotos.map(item => {
                const figure = document.createElement("figure");
                figure.className = "photo-tile";
                figure.dataset.category = item.categoryTitle;

                const img = document.createElement("img");
                img.src = item.image;
                img.alt = item.alt || item.tag || item.categoryTitle;
                img.loading = "lazy";
                figure.appendChild(img);

                if (item.tag) {
                    const badge = document.createElement("span");
                    badge.className = "tag-badge";
                    badge.textContent = item.tag;
                    figure.appendChild(badge);
                }

                figure.addEventListener("click", () => {
                    lightboxImg.src = item.image;
                    lightboxImg.alt = img.alt;
                    lightboxCaption.textContent = [item.categoryTitle, item.tag, item.alt].filter(Boolean).join(" · ");
                    lightbox.hidden = false;
                });

                return figure;
            });

            grid.replaceChildren(...tiles);

            // Filter buttons
            const filterLabels = ["All", ...categories.map(c => c.title)];
            filterBar.replaceChildren(...filterLabels.map((lbl, idx) => {
                const btn = document.createElement("button");
                btn.type = "button";
                btn.className = "filter-btn" + (idx === 0 ? " active" : "");
                btn.textContent = lbl;
                btn.addEventListener("click", () => {
                    filterBar.querySelectorAll(".filter-btn").forEach(b => b.classList.toggle("active", b === btn));
                    tiles.forEach(tile => {
                        tile.hidden = (lbl !== "All" && tile.dataset.category !== lbl);
                    });
                });
                return btn;
            }));

            // Lightbox close
            const closeLightbox = () => { lightbox.hidden = true; };
            document.getElementById("lightbox-close-btn").onclick = closeLightbox;
            lightbox.onclick = (e) => { if (e.target === lightbox) closeLightbox(); };
            document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeLightbox(); });
        }

        // ==========================================
        // ADMIN DASHBOARD LOGIC
        // ==========================================
        window.openAdminModal = function() {
            document.getElementById("admin-modal").classList.add("open");
            checkAdminSession();
        };

        window.closeAdminModal = function() {
            document.getElementById("admin-modal").classList.remove("open");
        };

        function showAdminAlert(msg, isSuccess = true) {
            const el = document.getElementById("admin-status-alert");
            el.textContent = msg;
            el.className = "admin-alert-banner " + (isSuccess ? "admin-alert-success" : "admin-alert-error");
            el.style.display = "block";
            setTimeout(() => { el.style.display = "none"; }, 5000);
        }

        function checkAdminSession() {
            const isAuth = sessionStorage.getItem("kp_admin_logged_in") === "true";
            const loginView = document.getElementById("admin-login-view");
            const dashView = document.getElementById("admin-dashboard-view");

            if (isAuth) {
                loginView.style.display = "none";
                dashView.style.display = "flex";
                populateAdminFields();
            } else {
                loginView.style.display = "block";
                dashView.style.display = "none";
            }
        }

        // Password Show/Hide Toggle
        const togglePwBtn = document.getElementById("btn-toggle-login-pw");
        const pwInput = document.getElementById("admin-pass-input");
        togglePwBtn.addEventListener("click", () => {
            const isPw = pwInput.type === "password";
            pwInput.type = isPw ? "text" : "password";
            togglePwBtn.textContent = isPw ? "🙈" : "👁";
        });

        // Admin Login Form Submission
        document.getElementById("admin-login-form").addEventListener("submit", async (e) => {
            e.preventDefault();
            const entered = pwInput.value;
            const enteredHash = await sha256(entered);
            const targetHash = getStoredPasswordHash();
            const errBox = document.getElementById("login-error-alert");

            if (enteredHash === targetHash) {
                errBox.style.display = "none";
                pwInput.value = "";
                sessionStorage.setItem("kp_admin_logged_in", "true");
                checkAdminSession();
            } else {
                errBox.textContent = "Incorrect password. Please try again.";
                errBox.style.display = "block";
                pwInput.focus();
            }
        });

        // Logout
        document.getElementById("btn-admin-logout").addEventListener("click", () => {
            sessionStorage.removeItem("kp_admin_logged_in");
            checkAdminSession();
        });

        // Tab Navigation inside Admin Dashboard
        document.querySelectorAll(".admin-tab-btn[data-tab]").forEach(btn => {
            btn.addEventListener("click", () => {
                document.querySelectorAll(".admin-tab-btn").forEach(b => b.classList.remove("active"));
                document.querySelectorAll(".admin-tab-section").forEach(s => s.classList.remove("active"));
                btn.classList.add("active");
                const targetId = btn.dataset.tab;
                document.getElementById(targetId)?.classList.add("active");
            });
        });

        // Populate fields in Admin Dashboard
        function populateAdminFields() {
            // Logo Tab
            renderAdminLogoTab();

            // Photos Tab
            renderAdminPhotosTab();

            // Contact Tab
            document.getElementById("setting-biz-name").value = siteData.settings.business_name || "Krueger Painting";
            document.getElementById("setting-phone").value = siteData.settings.phone || "262-443-1199";
            document.getElementById("setting-facebook").value = siteData.settings.facebook_url || "";
        }

        // ADMIN TAB: LOGO
        function renderAdminLogoTab() {
            const logo = siteData.settings.logo;
            const previewImg = document.getElementById("preview-logo-img");
            const previewFallback = document.getElementById("preview-logo-fallback");
            const removeBtn = document.getElementById("btn-remove-logo-btn");
            document.getElementById("preview-biz-title").textContent = siteData.settings.business_name || "Krueger Painting";

            if (logo && logo.trim()) {
                previewImg.src = logo;
                previewImg.hidden = false;
                previewFallback.hidden = true;
                removeBtn.style.display = "inline-block";
            } else {
                previewImg.hidden = true;
                previewFallback.hidden = false;
                removeBtn.style.display = "none";
            }
        }

        const logoPicker = document.getElementById("logo-file-picker");
        const logoDropzone = document.getElementById("logo-dropzone");
        const logoActionBar = document.getElementById("logo-action-bar");

        logoDropzone.addEventListener("click", () => logoPicker.click());
        logoPicker.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (evt) => {
                pendingLogoData = evt.target.result;
                document.getElementById("preview-logo-img").src = pendingLogoData;
                document.getElementById("preview-logo-img").hidden = false;
                document.getElementById("preview-logo-fallback").hidden = true;
                logoActionBar.style.display = "flex";
            };
            reader.readAsDataURL(file);
        });

        document.getElementById("btn-cancel-logo-file").addEventListener("click", () => {
            pendingLogoData = null;
            logoPicker.value = "";
            logoActionBar.style.display = "none";
            renderAdminLogoTab();
        });

        document.getElementById("btn-save-logo-file").addEventListener("click", async () => {
            if (!pendingLogoData) return;
            siteData.settings.logo = pendingLogoData;
            await persistSiteData();
            renderSite();
            renderAdminLogoTab();
            pendingLogoData = null;
            logoPicker.value = "";
            logoActionBar.style.display = "none";
            showAdminAlert("✓ Website logo updated successfully!");
        });

        document.getElementById("btn-remove-logo-btn").addEventListener("click", async () => {
            if (!confirm("Remove uploaded logo and restore default monogram?")) return;
            siteData.settings.logo = "";
            await persistSiteData();
            renderSite();
            renderAdminLogoTab();
            showAdminAlert("Logo removed.");
        });

        // ADMIN TAB: PHOTOS
        function renderAdminPhotosTab() {
            const catBar = document.getElementById("manage-cat-tabs");
            const container = document.getElementById("manage-photos-container");
            const categories = siteData.gallery.categories || [];

            catBar.replaceChildren(...categories.map((cat, idx) => {
                const btn = document.createElement("button");
                btn.type = "button";
                btn.className = "filter-btn" + (idx === activeManageCatIdx ? " active" : "");
                btn.textContent = cat.title + " (" + (cat.photos?.length || 0) + ")";
                btn.onclick = () => {
                    activeManageCatIdx = idx;
                    renderAdminPhotosTab();
                };
                return btn;
            }));

            const activeCat = categories[activeManageCatIdx];
            if (!activeCat || !activeCat.photos || !activeCat.photos.length) {
                container.innerHTML = '<div style="grid-column: 1 / -1; color: #888; text-align: center; padding: 20px; border: 1px dashed #444; border-radius: 6px;">No photos in this category yet. Use the form below to add one!</div>';
                return;
            }

            container.replaceChildren(...activeCat.photos.map((p, pIdx) => {
                const card = document.createElement("div");
                card.className = "photo-item-card";

                const img = document.createElement("img");
                img.src = p.image;
                img.alt = p.alt || "Photo";

                const details = document.createElement("div");
                details.className = "photo-item-details";

                if (p.tag) {
                    const tag = document.createElement("div");
                    tag.className = "photo-item-tag";
                    tag.textContent = p.tag;
                    details.appendChild(tag);
                }

                if (p.alt) {
                    const caption = document.createElement("div");
                    caption.style = "font-size: 0.78rem; color: #aaa; margin-bottom: 8px;";
                    caption.textContent = p.alt;
                    details.appendChild(caption);
                }

                const delBtn = document.createElement("button");
                delBtn.type = "button";
                delBtn.className = "btn-outline-danger";
                delBtn.style = "width: 100%; padding: 4px; font-size: 0.75rem;";
                delBtn.textContent = "Delete Photo";
                delBtn.onclick = async () => {
                    if (!confirm("Are you sure you want to delete this photo?")) return;
                    activeCat.photos.splice(pIdx, 1);
                    await persistSiteData();
                    renderSite();
                    renderAdminPhotosTab();
                    showAdminAlert("Photo deleted.");
                };
                details.appendChild(delBtn);

                card.append(img, details);
                return card;
            }));
        }

        // Photo file picker
        const photoInput = document.getElementById("photo-upload-input");
        const photoDrop = document.getElementById("photo-dropzone-trigger");
        const previewWrap = document.getElementById("new-photo-preview-wrap");
        const previewImg = document.getElementById("new-photo-preview-img");

        photoDrop.addEventListener("click", () => photoInput.click());
        photoInput.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (evt) => {
                pendingNewPhotoData = evt.target.result;
                previewImg.src = pendingNewPhotoData;
                previewWrap.style.display = "block";
            };
            reader.readAsDataURL(file);
        });

        window.setQuickTag = function(tag) {
            document.getElementById("new-photo-tag").value = tag;
        };

        document.getElementById("add-photo-form").addEventListener("submit", async (e) => {
            e.preventDefault();
            if (!pendingNewPhotoData) return;

            const activeCat = siteData.gallery.categories[activeManageCatIdx];
            if (!activeCat.photos) activeCat.photos = [];

            activeCat.photos.push({
                image: pendingNewPhotoData,
                tag: document.getElementById("new-photo-tag").value.trim(),
                alt: document.getElementById("new-photo-alt").value.trim()
            });

            await persistSiteData();
            renderSite();
            renderAdminPhotosTab();

            // Reset
            pendingNewPhotoData = null;
            photoInput.value = "";
            document.getElementById("new-photo-tag").value = "";
            document.getElementById("new-photo-alt").value = "";
            previewWrap.style.display = "none";

            showAdminAlert("✓ New photo added to " + activeCat.title + "!");
        });

        // ADMIN TAB: BUSINESS CONTACT
        document.getElementById("business-settings-form").addEventListener("submit", async (e) => {
            e.preventDefault();
            siteData.settings.business_name = document.getElementById("setting-biz-name").value.trim();
            siteData.settings.phone = document.getElementById("setting-phone").value.trim();
            siteData.settings.facebook_url = document.getElementById("setting-facebook").value.trim();

            const addr = document.getElementById("setting-address").value.trim();
            if (addr) {
                document.getElementById("footer-address").innerHTML = "<strong>Mailing Address:</strong> " + addr;
            }

            await persistSiteData();
            renderSite();
            showAdminAlert("✓ Business contact info updated!");
        });

        // ADMIN TAB: SECURITY PASSWORD
        document.getElementById("change-pw-form").addEventListener("submit", async (e) => {
            e.preventDefault();
            const curr = document.getElementById("pw-curr-input").value;
            const next = document.getElementById("pw-new-input").value;
            const conf = document.getElementById("pw-confirm-input").value;
            const msgBox = document.getElementById("pw-status-msg");

            const currHash = await sha256(curr);
            if (currHash !== getStoredPasswordHash()) {
                msgBox.textContent = "Current password is incorrect.";
                msgBox.style = "display: block; background: rgba(255, 107, 107, 0.15); color: #ff6b6b; border: 1px solid #ff6b6b;";
                return;
            }

            if (next.length < 6) {
                msgBox.textContent = "New password must be at least 6 characters long.";
                msgBox.style = "display: block; background: rgba(255, 107, 107, 0.15); color: #ff6b6b; border: 1px solid #ff6b6b;";
                return;
            }

            if (next !== conf) {
                msgBox.textContent = "New passwords do not match.";
                msgBox.style = "display: block; background: rgba(255, 107, 107, 0.15); color: #ff6b6b; border: 1px solid #ff6b6b;";
                return;
            }

            const newHash = await sha256(next);
            localStorage.setItem("kp_admin_hash", newHash);

            msgBox.textContent = "✓ Password updated successfully! Please remember your new password.";
            msgBox.style = "display: block; background: rgba(34, 197, 94, 0.15); color: #22c55e; border: 1px solid #22c55e;";

            document.getElementById("change-pw-form").reset();
            showAdminAlert("✓ Admin password updated.");
        });

        // EXPORT STANDALONE HTML FILE
        function exportSingleHtmlFile() {
            // Clone current page document
            const docClone = document.documentElement.cloneNode(true);

            // Remove any open state on admin modal
            const adminModal = docClone.querySelector("#admin-modal");
            if (adminModal) adminModal.classList.remove("open");

            // Bake current siteData into INITIAL_SITE_DATA in the script
            let fullHtml = "<!DOCTYPE html>\\n" + docClone.outerHTML;

            // Generate blob and trigger download
            const blob = new Blob([fullHtml], { type: "text/html;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "index.html";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            showAdminAlert("✓ index.html downloaded! You can push this file directly to GitHub.");
        }

        document.getElementById("btn-export-site").onclick = exportSingleHtmlFile;
        document.getElementById("btn-export-site-big").onclick = exportSingleHtmlFile;

        // Check hash on load (e.g. #admin opens admin portal)
        if (window.location.hash === "#admin") {
            openAdminModal();
        }

        // Initial render
        renderSite();
    })();
    </script>
</body>
</html>
`;

fs.writeFileSync(path.join(root, "index.html"), singleHtmlContent, "utf8");
fs.writeFileSync(path.join(root, "krueger-single-file.html"), singleHtmlContent, "utf8");
console.log("Built index.html and krueger-single-file.html successfully!");
