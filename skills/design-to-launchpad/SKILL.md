---
name: design-to-launchpad
description: Build a Neptune DXP launchpad that looks like a given design, end to end over MCP - from a website URL, screenshots, a brand guide, a design-tool export, a written brief, or from scratch. Maps design tokens onto the Theme Generator, Fonts, Media, Tiles, Tile Groups and the Launchpad Designer, plans the layout for desktop and phone, builds in a safe order and checks the result headlessly first. Use when the user says "make our launchpad look like this site", "rebuild this design as a launchpad", "brand the launchpad", "launchpad from this screenshot", "new launchpad from scratch", "match this Figma", "apply the brand guide", and for a single change in plain words such as "dark mode too", "installable on phones", "centre the cards", "our brand font", "users log in with Azure AD". Read this BEFORE the first save of such a build - the order of the steps and a handful of silent traps decide whether the launchpad renders as designed.
---

# Design to launchpad

Turns any design into a launchpad that end users open at `/launchpad/<name>`. This skill owns the **method** — intake,
mapping, order, verification, hand-off. Every field rule lives in the skill that owns the tool; open it before its step.
**A single change asked in plain words** ("dark mode too", "only managers", "hide my name in the header"): find it in
`reference/mapping.md` → Asks in plain words, then follow the owning skill. Change requests and fixes on a built
launchpad: `reference/edit-map.md` (visible part → the setting that controls it).

| Ingredient | Platform piece (Cockpit term) | Skill |
|---|---|---|
| Palette, status colours, radius, font, UI5 controls | UI5 Theme Generator theme | `manage-theme-generator` |
| Brand font | Fonts (+ font files) | `manage-fonts`, `upload-files` |
| Logo, hero and card art, icons, background | Media Library files | `upload-files`, `manage-media` |
| Cards | Tiles | `manage-tiles` |
| Pages and sections | Tile Groups | `manage-tile-groups` |
| Shell: header, logo, menu, canvas, widths, tile and section look, custom CSS, light/dark | Launchpad + Launchpad Designer settings | `manage-launchpads` (keys: its `reference/designer-keys.md`) |
| What a card opens | App Designer apps, web apps | `manage-apps`, `manage-webapps` |

## Step 1 — Intake: a token table

Ask for the source, the sections and tiles (what each opens), light/dark/both, the assets the user may use, the launchpad
name, a short project prefix and a package. Extract the tokens — fetch the page and its stylesheets when the client can
fetch, take screenshots when a browser tool exists, sample flat colours from screenshots, take
tokens as written from a brand guide. Fill the token table in `reference/intake.md` (palette roles, type, shape, space,
imagery, **hero**, layout, navigation, appearance) with every assumption marked. Record the hero exactly: band or card,
background (colour, image, gradient), height, headline size and colour, number of buttons. Show the table and the features
that cannot be reproduced (`reference/mapping.md`) before building when the source is ambiguous.

## Step 2 — Decide the structure

Element-by-element mapping with owners and status: `reference/mapping.md`. The decisions that shape everything:

- **Pages and sections.** Every tile group listed in the launchpad's `cat` is its own **screen** (one page, one menu entry);
  screens open one at a time, the first is the home page. Several sections on **one scrolling page** = one screen tile group
  whose `tilegroups` (child tile groups) are the sections, in order — they render below the screen's header (verified).
  Use several screens only where the source has several pages.
- **Empty tile groups are not shown**: a group without a tile the user can see (directly or in a child group) is left out of
  the menus and the page (verified). Give every section its tiles before judging the look.
- **Hero.** A website hero with buttons → **one section** (screen `hideHeader: true`): `title` = headline, `subTitle` =
  kicker or subline, its tiles = text and button tiles, the artwork on that section's canvas, `SHELL_WIDTH: "Full"` for a
  full-bleed band — text and buttons share one background (`reference/techniques.md` §2, §12, verified). Without buttons →
  the screen group's own header (`image` + `imageHeight` + tablet / mobile heights). A hero card → a first tile `Max` ×
  `Tall` with `image` + `imageType: "B"`. Never plan content for the banner container or the HTML `header` field.
- **Menu labels.** Top-menu items and side-menu roots show each screen's `menuText` (else its `title`): set `menuText` on
  every screen whose `title` is a hero headline, or the headline becomes the menu label.
- **Navigation.** Top bar: `config.enableTopMenu: true` + `oneLineTopMenu: true`; `noSubmenuHover: false` lists a screen's
  sections on hover (source). Side menu: `enableTopMenu: false` + `verticalMenu: true` (a tree of screens, sections and action
  tiles, open on load from 1024 px — verified at desktop). One screen only: both `false` shows it without a menu (source).
- **Where colour lives.** UI5 palette → the theme. Shell look (header, logo, menu, canvas, widths, section headers, card
  colours and layout) → the Launchpad Designer settings, which win over the theme. One card or a set → the tile's
  `styleClass` + a `CUSTOM_CSS` rule on `:root .<class> .nepFCard` (`manage-tiles` → Content and look).
- **The "…" button.** Non-clickable tiles with an action show an overflow button (the user's tile menu) next to the open
  button; hide it launchpad-wide with `tileLayout` `HIDE_CONTEXT_BTN: "X"` (verified).
- **Appearance.** One appearance → one theme, that Designer bucket only, `layout_preference` `3` / `4`. Both → a Light and
  a Dark theme, both buckets filled completely (they never inherit, logo included), `layout_preference` `0`, `1` or `2`.
  Decide before publishing: a later change does not move returning visitors (`manage-launchpads`).

## Step 2b — Layout plan (before any save)

A headless build cannot see clipped text, off-centre rows or collapsed tiles, so plan them away with numbers. Write one
line per section — tiles with `cardWidth`/`cardHeight`, the group width — and check it at 1440 px **and** 390 px:

1. **Rows fill their grid** — each row's spans add up to the grid's column count at both widths (rule and spans:
   `manage-tile-groups` → Layout rules); otherwise change the group width or the tile widths. A lone last tile at phone
   width: make it `Max` or keep the count even.
2. **Rows are consistent** — one card treatment and one `cardHeight` per row, sized for the tallest content; a different
   card only for a deliberate primary/secondary button pair or one highlighted card (`manage-tiles` → Layout rules).
   Every card variant and every link/button you add (header, footer, FAQ) sets its hover and pressed colours — otherwise
   the theme's hover colour applies and labels vanish on dark surfaces.
3. **Texts fit** — labels, subtitles and big numbers within budget at 390 px (characters × 0.55 × font size ≤ content
   width); titles ≤ 3 lines, subtitles ≤ 2; no icon font on `Tiny` tiles. Button labels on one line at the size you set
   (pills: 16 px, side padding ≥ half the button height). No hard line breaks in running text copied from a site
   (orphan words) — cap the measure with `max-width: 60ch`.
4. **Big type keeps its descenders** — headings and numbers from about 32 px up get `line-height` ≥ 1.1 and a little bottom
   padding in `CUSTOM_CSS`; a tighter line height clips g, p and y.
5. **Header heights have phone values** — header heights are minimums; set the tablet and mobile heights too
   (`manage-tile-groups`), otherwise the desktop minimum also applies on a phone. Never give a hero a fixed height in
   `CUSTOM_CSS`: its text wraps to more lines on a phone and runs under the next row.
6. **`CUSTOM_CSS` stays inside the tile** — every rule scoped to a section or tile class, both modes; the grid boundary
   is `manage-tiles` → Layout rule 2; no `100vw`, no negative margins; never pad `.nepGroupHeader…` — use Designer
   `HEAD_TEXT_MARGIN`. Keep `HEADER_WIDTH` `Full` (narrower moves the side menu off the window edge); pad
   `.nepLaunchpadTopInner` instead. Per-section Designer entries carry `screenId`, `catId` and `placement`.
7. **Text cards on phones** — ≥ 240 px of text per card at 390 px: on sections wider than 680 px set the entry's
   `GRID_CELLS_SMALL: "4"` (one per row on phones; `manage-tiles` → Layout rule 12).

## Step 2c — Website-grade details

Before listing a feature as "cannot be reproduced", look it up in **`reference/techniques.md`** (two-colour headings,
full-bleed hero, header links and CTAs, footer, FAQ, badges, logo strips, glows, research block, carousel, type scale,
phone stacking). Each recipe is labelled platform setting, CSS on platform internals or escape hatch (raw `footer`
HTML, spots): prefer them in that order and tell the user when and why an escape hatch is used.

## Step 3 — Build, in this order

Carry every id forward from the create response; record them for the hand-off. Skeletons: `reference/payloads.md`.

1. **Package and names** — pick or create the package; check that launchpad, font and theme names are free
   (`list_launchpads`, `list_fonts` exact and `ILike`, `list_theme_generator`); prefix every name. All files go under one
   new top-level media folder named after the prefix (first-folder rule: `manage-media`); users bound to packages get
   `Upload into a media folder that belongs to a package.` — the folder must be created and assigned in the Cockpit first.
2. **Assets** (`upload-files`) — `upload_media_file` with a direct `sourceUrl` (a website's own files: `reference/intake.md`
   → Collect the site's own assets), or run the returned `curl` once. Always set `TOP_LOGO` (else the Neptune logo and
   favicon show; no logo → a wordmark SVG of the name); light logos for a dark header, one per appearance bucket.
3. **Font** (`manage-fonts`) — `save_font` with `enableWeb: true` and `config` → `upload_font_file` once per weight → slots.
   One **static** `.woff2` per weight (a Google Fonts variable family is one file for every weight and renders them all
   alike; fontsource per-weight files upload directly). Complete the font **before** saving the theme.
4. **Theme(s)** (`manage-theme-generator`) — `brightness` always; every seed you set as a full H/S/L triple; `FONT_FAMILY` =
   the font id; radius = the card radius. Theme name = `neptune-generated-<light|dark>-<id>`.
5. **Targets** (`manage-apps`, `manage-webapps`) — confirm each app or web app a tile opens exists.
6. **Tiles** (`manage-tiles`) — one action target per tile; small sizes hide content. **A `Tiny` tile with an icon font
   hides its title** unless `ICON_PLACEMENT` is `AlignLeft`/`AlignRight`: no icon on button-like tiles and link rows.
7. **Sections, then screens** (`manage-tile-groups`) — each section with its full `tiles`, then the screen group with its
   full `tilegroups` and a short `menuText`. Never send the `*Order` fields; compare each response with what you sent.
8. **Launchpad** (`manage-launchpads`) — one `save_launchpad` with `name`, `title`, `package`, `cat`, `layout_preference` and a
   **complete** `config`: the create defaults, the menu flags, and `designer` with the theme keys, shell keys, `CUSTOM_CSS`,
   `tileLayout` and `tileGroupLayout` in the bucket of each appearance you use. Always set `SHELL_BACK_COLOR` with
   `PAGE_BACK_IMAGE` (`"None"` or a URL; canvas rule: `manage-launchpads`); a CSS gradient works there too (verified).
   `CUSTOM_CSS` loses its line breaks: `/* */` comments only. Never put a double quote, a backslash or a line break into
   `title`, `customLogo`, `startApp`, `startWebApp` or `launchpadFooter`.

Rules for every step: a save response is not proof — re-read; **create without `id`** and update only ids you read (an
unknown id creates a broken artifact or fails, depending on the tool); restyling later = `get_launchpad`, change the copy,
send the complete `config`.

## Step 4 — Verify (headless first)

1. **Baseline, MCP only** — `get_launchpad({ id, includeTiles: true })`: screens in `cat`, tiles and sections in order,
   every section non-empty, `config.designer` as sent; `get_media_file` per file (`size`, `contentType`); `get_font`
   (every `config.web` value a listed file); the theme response's `CSS_VARIABLES` carries your seeds as `hsl(H, S%, L%)`,
   `--sapFontFamily: "<font name>-Regular"` and `--sapTile_BorderCornerRadius`.
2. **HTTP, only when your client can fetch URLs** (no sign-in) — media `200` + image type; fonts
   `/public/fonts/<font name>/<file>` `200 font/woff2`; theme CSS `/public/css-generator/<theme name>.css` `200`;
   `GET /launchpad/<name>` signed out: `200` with your Designer values (`"KEY": "value"`) and the theme CSS link. `500 …
   reading 'languages'` = no `config`; any other `500` = a broken tile group order (`manage-tile-groups`).
3. **Self-review, if the client has a browser tool** — open the launchpad at 1440 px and at 390 px, in each configured
   appearance, next to the reference. Hover one element of every kind: header link, header button, hero buttons, each
   card style and its link, carousel arrows and dots, FAQ question, footer link — none may vanish into its background.
   Open the side menu: it sits flush at the window edge. Check that button labels stay on one line, no line ends with a
   lone word, no text is clipped or overlaps, rows are centred, the hero is one band, nothing scrolls sideways. Then
   compare section by section with the reference. Fix every finding through `reference/edit-map.md`, save, reload,
   re-check. No browser: say the visual check is pending.
4. **Contrast** (`reference/intake.md`) — header text, section titles, hero text, title/subtitle/icon on **each** card
   variant, button text, focus rings and chevrons (3:1). Fix colours, not the threshold.

## Done checklist

- [ ] Token table complete (hero included); assumptions and non-reproducible features listed and accepted.
- [ ] Media in one prefixed top-level folder; `TOP_LOGO` set; static font files per weight; theme CSS carries seeds, radius, font.
- [ ] Every section has tiles; screen groups have short `menuText`; one action target per tile, each target exists.
- [ ] Step 2b plan holds at 1440 and 390 px (rows, card styles and heights, text budgets, descenders, phone heights,
      scoped `CUSTOM_CSS`); site features built from `reference/techniques.md`, not listed as missing.
- [ ] `config` complete; `SHELL_BACK_COLOR` + `PAGE_BACK_IMAGE` set; every key in the right bucket; `layout_preference` matches.
- [ ] Card variants on `:root .<class> .nepFCard` with the whole colour set; "…" button decided.
- [ ] Baseline re-reads match; HTTP checks (if possible); screenshots or "visual check pending"; contrast passes.

## Hand-off summary (give the user exactly this)

```
Launchpad: <name> — https://<host>/launchpad/<name>   (public: <no | https://<host>/public/launchpad/<name>>)
Built: theme <name> (<id>, <Light/Dark>) · font <name> (<id>) · media <folder> (<n> files)
       <n> screens / <n> sections / <n> tiles (ids: <list or "see below">) · package <name> (<id>)
Checked: re-reads ✓ · HTTP <✓ n URLs | not possible> · screenshots <desktop/phone × light/dark | pending> · contrast ✓ (lowest <ratio> on <pair>)
Differs from the design: <feature> → <what was built instead, and why>
Open items: <tile targets to create, licences to confirm, Cockpit-only steps>
```

## What this cannot do

- Reproduce free page layouts, scroll-driven motion, a header that changes on scroll or floats over the hero, or live text without code —
  `reference/mapping.md` lists the closest alternative; headings, heroes, footers, FAQs, carousels and logo strips are
  in `reference/techniques.md`.
- Generate the Launchpad Designer's Custom Theme Override from brand / highlight / font inputs (literal override CSS does
  render — fine for a quick tweak, `manage-launchpads`; a palette belongs in a theme), or create Launchpad Layouts, Tile
  Layouts or Global Styles.
- Preview or screenshot anything through MCP — the checks above, then a browser if the client has one.
- Assign a Media Library folder to a package, or find which launchpads use a theme, font or file.

## Permissions

Edit access to Launchpad, Tile, Tile Group, UI5 Theme Generator, Fonts and Media Library (and App Designer / Web App Manager
for tile targets), plus the package. The owning skills list the exact permission names.

## Related skills

- **`manage-launchpads`** — `config`, the Launchpad Designer keys, menu options, light/dark, opening URLs.
- **`manage-tile-groups`** / **`manage-tiles`** — sections, screens, cards, sizes, images, actions.
- **`manage-theme-generator`** — seeds, Sass overrides, applying a theme.
- **`manage-fonts`**, **`manage-media`**, **`upload-files`** — fonts, files, URLs, uploads.
- **`manage-apps`**, **`manage-webapps`** — what tiles open; a web app for a page the grid cannot express.
