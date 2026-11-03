# Intake: from a design source to a token table

## Ask once, up front

1. **Source**: website URL, screenshots, brand guide / design-tool export, or a written brief (or "from scratch": a purpose and a mood).
2. **Content**: the launchpad's sections and the tiles in each (titles, what each opens: App Designer app, web app, URL, nothing yet).
3. **Appearance**: light, dark, or both (with both, users switch in the launchpad's user settings — not on a public launchpad; with `layout_preference` `0` the device decides first).
4. **Assets the user may use**: logo files (SVG preferred, a light and a dark version if the header colour differs), images, licensed font
   files — for a website source, offer to collect them from the site (below). Use third-party logos, photos and fonts only with the owner's permission; replace a proprietary web font with an
   open-licence lookalike (Google Fonts, OFL) unless licensed files are supplied.
5. **Names**: the launchpad name (it is the URL `/launchpad/<name>`), a short project prefix for every artifact and media file, a package.

## Extract tokens

| Source | How |
|---|---|
| Website URL, client can fetch | Fetch the page HTML, then each `<link rel="stylesheet">`. Read `:root { --… }` custom properties first (they usually are the palette), then the most frequent `color`, `background(-color)`, `border-color`; `font-family` and `@font-face` (family names, weights in use); `border-radius`; `max-width` of the main container (content width); the logo (`<header>` `<svg>` or an `<img>` whose src/class contains "logo"), favicon, hero / section images (lazy images keep the URL in `data-src` / `srcset`). |
| Website URL, browser tool available | Screenshot at 1440 px and 390 px, top to bottom; sample colours and estimate sizes from them as for screenshots below, and take exact values from the fetched stylesheets. |
| Screenshots only | Sample colours in flat areas (not edges, gradients or photos). Estimate sizes from the screenshot width (state the assumed viewport width): heading size, card radius, gutters. Note the font class (geometric / humanist sans, serif, mono) and pick an open-licence match. |
| Brand guide / design-tool export | Take colour, type and radius tokens as written (exported variables or style lists win over sampling). Ask for the SVG logo and font files. |
| Written brief / from scratch | Use the tokens given; fill every missing role with a stated assumption (and keep contrast ≥ the targets below). |

Record per section of the source: what it is (hero, card grid, link list, logo strip, counters, video, FAQ, footer) and its layout
(columns, card sizes, image placement). This drives the mapping (`mapping.md`).

## Collect the site's own assets (website source)

Offer this whenever the source is a website: "Shall I bring the site's logo, artwork and photos into the Media Library?"
Use it only when the user owns or may use the assets (their own site, brand or customers' approved logos).
1. **Find the URLs** (client that can fetch): `<img src>`/`srcset`, CSS `background-image`, inline `<svg>` logos, `og:image`,
   favicon. Lazy-loaded images often show only a 1×1 placeholder in the HTML: on a WordPress site the public media API
   returns the real files (`/wp-json/wp/v2/media?search=<term>&_fields=source_url,title`, featured images via
   `/wp-json/wp/v2/posts?_embed=wp:featuredmedia`); other CMSs: the page's `data-src` / `data-lazy-src` attributes.
2. **Group them** by section (logo light/dark, hero art, logo strip, card icons, section photos, story/post images) — one
   line per asset in the hand-off, with its target tile or setting.
3. **Upload** each with `upload_media_file` and `sourceUrl` = that URL (the DXP server fetches it; nothing is downloaded
   locally) into the build's own top-level media folder (`manage-media` first-folder rule). Prefer SVG for logos and icons;
   keep tile images small (the Cockpit pickers refuse images over 150 KB and icon images over 100 KB).
4. **Re-read** every file with `get_media_file` (size, type) and use the returned `/media/root/<folder>/<file>` URL.
5. Logos come in two variants when the header changes colour between light and dark. A logo for a dark header keeps the
   brand mark's own colours and recolours only the wordmark (e.g. white text, orange symbol) — never an all-white logo
   when the original mark is coloured. If the site offers no such file, make it from the site's SVG (change only the
   wordmark paths' `fill`) and upload it (`upload-files`).

## Token table (fill every row; mark assumptions)

| Group | Token | Value | Source / assumption |
|---|---|---|---|
| Palette | canvas (page background) · surface (cards) · surface border · header background · header text · text · muted text · brand / primary (buttons) · accent / links · focus · selection · success · warning · error · info | hex | |
| Type | family (+ open-licence substitute; is it a variable font?) · weights used (300 / 400 / 500–600 / 700 / 800–900) · H1 · H2 / section title · card title · body size · letter-spacing · case rules | | |
| Shape | card radius · button radius · field radius · border width · shadows (none / soft) | | |
| Space | content width (px) · gutters · header height | | |
| Imagery | logo (light / dark; none → a wordmark) · hero art · card art / watermarks · icon style → SAP icon or Font Awesome name (`sap-icon://…`, `sap-icon://fas/…`) | file / URL | |
| Hero | band (full width) or card · background (colour, image, gradient) · height at 1440 px · headline size, weight, colour · subline · number of buttons and their colours | | |
| Cards | each colour variant (background, title, text, icon, button text, button background) · icon position · visible controls (open button, overflow "…") | | |
| Layout | one page with sections, or several pages · per section: card grid / wide feature / link list | | |
| Navigation | top bar with items · side menu · search on/off · user area · logo position | | |
| Appearance | light · dark · both | | |

## Colour arithmetic

**Hex → HSL with one decimal** (what the UI5 Theme Generator seeds take, as strings): formula and example in `manage-theme-generator` → `CSS_VAR_<SEED>_H` / `_S` / `_L`.

**Contrast ratio** (WCAG): channel c = value / 255, linear = c / 12.92 if c ≤ 0.04045 else ((c + 0.055) / 1.055)^2.4;
luminance Y = 0.2126 R + 0.7152 G + 0.0722 B; ratio = (Y_light + 0.05) / (Y_dark + 0.05).
Targets: **4.5:1** for body text and tile subtitles, **3:1** for large text (≥ 24 px, or ≥ 18.7 px bold), icons and borders that
carry meaning. Check every pair that will actually render: header text on header, section titles on the canvas, tile title and
subtitle on each tile colour, button text on the brand colour, text on any image (use the image's darkest / lightest area under the text).
