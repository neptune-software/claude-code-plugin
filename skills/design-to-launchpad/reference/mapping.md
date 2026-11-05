# Mapping: design element → platform mechanism → owning skill

`LL` = `config.designer.<bucket>.launchpadLayout`, `TL` = `config.designer.<bucket>.tileLayout[0].data`,
`GL` = `config.designer.<bucket>.tileGroupLayout[0].data` (written with `save_launchpad`; key values in manage-launchpads
`reference/designer-keys.md`). (verified) = a live run showed it rendered; (source) = read from the platform code, check it on screen.

## Asks in plain words → owner and setting

One line per ask; values and rules live in the owner's SKILL.md / `reference/settings.md`. `config.*` keys need the
complete `config` in the save (`manage-launchpads`).

| Ask | Owner | Set |
|---|---|---|
| "Use the images / logos from our website" | `upload-files` + `manage-media` | Collect the URLs and upload with `sourceUrl` → `intake.md` § Collect the site's own assets |
| "dark mode too", "add a dark theme" | manage-theme-generator → manage-launchpads | a theme with `brightness: "Dark"`, then fill `config.designer.dark` as fully as `light` (theme keys, colours, light logo, `CUSTOM_CSS`, `tileLayout`, `tileGroupLayout`, login keys); `layout_preference` 0/1/2. A mode with no bucket shows the platform default look |
| "let users switch light and dark" | manage-launchpads | `layout_preference` 0, 1 or 2 with both buckets; users switch in user menu → Settings → Appearance (hidden with 3/4) |
| "light only", "dark only" | manage-launchpads | `layout_preference` 3 / 4, one bucket |
| "a logo for the dark header", "logo in dark mode" | upload-files → manage-launchpads | a light logo file; `TOP_LOGO` (+ `TOP_LOGO_MOBILE`, `FAVICON`) in `config.designer.dark.launchpadLayout` — buckets never inherit from each other |
| "our brand colours" | manage-theme-generator | theme seeds (brand, highlight, base, text); header, canvas and card colours via Designer keys (Palette table below) |
| "our brand font" | manage-fonts → manage-theme-generator | font record + one static `.woff2` per weight + `config.web` slots → theme `FONT_FAMILY`; re-save the theme after any font change |
| "rounder / square corners", "bigger text overall" | manage-theme-generator | `CSS_VAR_BORDER_RADIUS`; custom Sass `$nepFontLargeSize` |
| "centre the cards" | manage-tile-groups | group `cardContentWidth` sized so the row's spans fill the columns (four `Small` → `Large`); `cardContentAlign` / `GL.GRID_ALIGN` only move the capped group |
| "narrower content", "centre the headings" | manage-launchpads | `LL.SHELL_WIDTH`; `GL.HEAD_TEXT_ALIGN: "center"` |
| "bigger hero banner", "banner image" | manage-tile-groups | screen group `image` + `imageHeight` (+ tablet / mobile heights) |
| "all cards white with orange icons" | manage-launchpads | `TL.TILE_BACK`, `TL.TILE_ICON_COLOR` (both buckets) |
| "this card in orange" | manage-tiles + manage-launchpads | tile `styleClass` + `CUSTOM_CSS` on `:root .<class> .nepFCard` |
| "photo on the card", "different photo in dark mode" | manage-tiles | `image` + `imageType`; `imageDark` |
| "whole card clickable, no button" | manage-tiles | `FIORI_STYLE: "X"` (tile or group) |
| "remove the … button" | manage-launchpads | `TL.HIDE_CONTEXT_BTN: "X"` |
| "the button shows only an arrow / the title is gone" | manage-tiles | a `Tiny` tile with an icon hides its title and subtitle unless `ICON_PLACEMENT` is `AlignLeft`/`AlignRight`: drop the icon or raise the height |
| "more tiles per row", "same size for all" | manage-tile-groups | `cardPerRow`; group `cardWidth` / `cardHeight` |
| "hide this tile on phones", "open it in a new tab / popup" | manage-tiles | `hideTileMobile`; `openWindow` / `openDialog` |
| "show a maintenance notice" | manage-tile-groups | `enableMessage: true` + complete `configMessage` (`type: "Warning"`, `text`) on the screen group — the launchpad stays usable |
| "block the launchpad for maintenance" / "take one tile offline" | manage-launchpads / manage-tiles | `config.blackoutEnabled` + `blackoutTitle` / `blackoutMessage`; tile `blackoutEnabled` |
| "menu at the top / on the left", "one-line header" | manage-launchpads | `config.enableTopMenu` / `config.verticalMenu` (one of them); `config.oneLineTopMenu` |
| "shorter menu label", "keep it out of the menu" | manage-tile-groups | `menuText`; `hideFromMenu: true` |
| "hide my name in the header", "hide search / back button / the header" | manage-launchpads | `config.hideUsername` (`oneLineTopMenu` hides it too); `config.hideSearch`, `hideBackButton`, `hideTopHeader` |
| "portal name next to the logo" | manage-launchpads | `config.showLaunchpadTitle: true` + `title` (ignored with `oneLineTopMenu`) |
| "background image on the page" | upload-files → manage-launchpads | `LL.PAGE_BACK_IMAGE` + always `LL.SHELL_BACK_COLOR` |
| "login page in our colours / with our text" | manage-launchpads | `LOGIN_*`, `MOB_*`, `BACK_LOGON_*` in each bucket (same `LOGIN_PLACEMENT` in both); `config.loginTitle` / `loginSubTitle` |
| "users log in with Azure AD", "SSO only" | manage-launchpads | `defaultLoginIDP: <provider id>` + `config.hideLoginSelection: true` (+ `hideLoginLocal`) |
| "only managers" | manage-launchpads / manage-tile-groups / manage-tiles | `roles: [{ id }]` (`list_roles`) on the launchpad, the section or the tile |
| "anyone without login", "let customers sign up" | manage-launchpads | `publicAccess: true`; `isExternal` + `emailPattern` + `extUserRoles` |
| "installable on phones", "app icon" | manage-launchpads (+ upload-files) | `pwa_enable: true`, `pwa_title`, `pwa_displayMode`, `pwa_customImage*`, `pwa_themeColor` |
| "add our AI assistant" | manage-launchpads | `agentId` (`list_ai_agents`) + `config.agentText`, `agentIconSrc`, `chatboxPosition` |
| "English and German only" | manage-launchpads | `config.languages` + `defaultLanguage` / `fallbackLanguage` |
| "cookie banner", "open straight into one app" | manage-launchpads | `config.cookieDialog*`; `startApp` / `startWebApp` |
| "analytics", "run a script at start / on tile click" | manage-launchpads | `header` (a snippet that only loads) or an enhancement spot (`BeforeStartup`, `TileClick`) |
| "one word of the headline in our accent colour" | techniques.md §1 | spot that wraps the phrase, or CSS `::after` |
| "full-width hero with the art behind the text and the buttons" | techniques.md §2 | one section: headline, subline, button tiles, art on `.nepSectionCanvas<id>` |
| "nav links and a Book a Demo button in the header", "header blends into the hero" | techniques.md §3 | `BeforeStartup` spot into the header's right slot; header colour = hero colour |
| "footer with logo, link columns and legal line" | techniques.md §4 | last section, plain tiles with `description` link lists |
| "FAQ that opens and closes", "FAQ heading left, questions right" | techniques.md §5 | `<details name>` in a tile `footer` (first `open`), heading tile left, keyboard guard |
| "badges floating on the card picture" | techniques.md §6 | `::before`/`::after` on the card |
| "bigger card text", "links line up with the text" | techniques.md §7 | `TILE_CONTENT_SIZE`, `--nepH4`, `OPEN_BUTTON_REVERSE_ICON`, button padding 0 |
| "glow / dotted pattern behind a section", "row of customer logos" | techniques.md §8 | canvas gradients; logo row in a tile `footer` |
| "logos scrolling across", "trusted by … marquee" | techniques.md §11 | logo images twice in a tile `footer`, CSS loop, a pause control, stops under reduced motion |
| "kicker line above the headline", "feature strip with dots", "buttons centred under a wide headline" | techniques.md §12 | `subTitle` as kicker; strip in a `description`; `grid-column-start` exception on the first button (conditions in manage-tiles) |
| "Book a Demo and Build Your App Now in the header" | techniques.md §3 | two CTA links in the header spot, the second outlined; header link hover variables |
| "big faint shapes inside the cards" | techniques.md §14 | background image layered on `:root .<class> .nepFCard` |
| "stats beside a report card with floating badges" | techniques.md §15 | text tile `description` + card `footer` badges |
| "customer stories carousel with arrows and dots" | techniques.md §16 | slides in a tile `footer`, scroll-snap, spot for arrows and dots |
| "one card per row on phones" | techniques.md §10, manage-tiles rule 12 | the section entry's `GRID_CELLS_SMALL: "4"` (sections wider than 680 px only) |
| "change X on the built launchpad", "the links vanish on hover", "move / resize this part" | edit-map.md | the visible part → the setting or CSS hook that controls it |
| "this section needs a free layout / live data" | techniques.md §9 | tile `type: "application"` or a web app |

## Palette, shape, type

| Design token | Mechanism | Owner |
|---|---|---|
| Primary / brand (emphasized buttons) | Theme seed `CSS_VAR_BRAND_COLOR_H/S/L` (verified) | manage-theme-generator |
| Accent: links, selection, default-button text | `CSS_VAR_HIGHLIGHT_COLOR_*`; focus `CSS_VAR_FOCUS_COLOR_*` | manage-theme-generator |
| Text · muted text · icons | `CSS_VAR_TEXT_COLOR_*` · `CSS_VAR_LABEL_COLOR_*` (also tile subtitles) · `CSS_VAR_ICON_COLOR_*` | manage-theme-generator |
| Surfaces (tiles, lists, fields) | `CSS_VAR_BASE_COLOR_*`; one exact tile colour: custom Sass `$sapTile_Background: #…;` (verified) | manage-theme-generator |
| Canvas | `LL.SHELL_BACK_COLOR` (verified; a CSS gradient works too, verified). The theme's background seeds do not reach the launchpad canvas — `CSS_VAR_BACKGROUND_COLOR_*` colours apps opened in the launchpad and default buttons | manage-launchpads, manage-theme-generator |
| Header bar | `LL.TOP_BACK_COLOR` / `TOP_TXT_COLOR` (they win over the theme); theme `CSS_VAR_SHELLHD_COLOR_*` for apps opened in the launchpad | manage-launchpads, manage-theme-generator |
| Success / warning / error / info | `CSS_VAR_POSITIVE_COLOR` / `_CRITICAL_` / `_NEGATIVE_` / `_INFORMATION_COLOR` (hex) | manage-theme-generator |
| Corner radius | `CSS_VAR_BORDER_RADIUS` = the card radius (tiles × 1, buttons × 0.5, fields × 0.25; `0.75rem` gave 12 px tiles, verified) | manage-theme-generator |
| Font family | Fonts record + one static `.woff2` per weight + `config.web` slots → theme `FONT_FAMILY` (verified: tiles rendered in the font) | manage-fonts, upload-files, manage-theme-generator |
| Weights | slots `regular` 400 · `semiBold` 600 · `semiBoldDuplex` 600 (buttons) · `bold` 700 (titles) · `black` 800–900 · `light` 300; a slot you leave out falls back to the regular file (never set one to `""`) | manage-fonts |
| A second family for headings | Its `.woff2` in the same font record's `bold` slot: tile titles use the bold face, section titles `--sapFontHeaderFamily` = `"<font name>-Bold"`, body text stays on `regular` (source) | manage-fonts |
| Overall type scale | custom Sass `$nepFontLargeSize: 1.125rem;` scales every UI5 font size (verified in the CSS) | manage-theme-generator |
| Section title size | `GL.HEAD_TEXT_LEVEL` / `HEAD_SUB_LEVEL` `H1`…`H6` (source), or `CUSTOM_CSS` `.nepGroupHeader<id> .nepCatTitle{font-size:…}` for one group | manage-launchpads |
| Letter-spacing, case, a heading face | `CUSTOM_CSS`; the theme CSS declares the families `<font name>-Regular`, `-SemiBold`, `-Bold`, `-Black`, `-Light`, so a rule can use `font-family:'<font name>-SemiBold'` (source) | manage-launchpads |
| Dark appearance | A second theme with `brightness: "Dark"`, applied in the `dark` bucket | manage-theme-generator, manage-launchpads |

## Shell

| Design element | Mechanism | Owner |
|---|---|---|
| Header colours, height, width | `LL.TOP_BACK_COLOR`, `TOP_TXT_COLOR`, `TOP_HOV_COLOR`, `TOP_BOR_COLOR`; `HEADER_HEIGHT` `3rem`–`6rem`; `EXTEND_HEADER_COLOR: true` (full-width colour); `HEADER_WIDTH`; `DISABLE_HEADER_SHADOW` (verified) | manage-launchpads |
| Logo, favicon | `LL.TOP_LOGO`, `TOP_LOGO_MOBILE`, `TOP_LOGO_HEIGHT`, `FAVICON` = `/media/root/<path>`. Always set `TOP_LOGO`: left empty, the header shows the Neptune logo and the favicon follows it (source). No logo in the design → a wordmark SVG of the name | manage-launchpads, manage-media |
| Title next to the logo | `config.showLaunchpadTitle: true` + `title` | manage-launchpads |
| Top navigation bar | `config.enableTopMenu: true` (+ `oneLineTopMenu: true`, verified); one item per screen, label = `menuText` → `title` → `name`; `noSubmenuHover: false` = hover list of the screen's sections (source) | manage-launchpads, manage-tile-groups |
| Side navigation | `enableTopMenu: false` + `verticalMenu: true`; `LL.NAV_BACK_COLOR` / `NAV_TXT_COLOR` / `NAV_HOV_COLOR` (verified at desktop); behind the menu button on phones (source) | manage-launchpads |
| No navigation (one screen) | `enableTopMenu: false`, `verticalMenu: false` (source) | manage-launchpads |
| Search, user name | `config.hideSearch`, `config.hideUsername` (`oneLineTopMenu` also hides the user name) | manage-launchpads |
| Content width | `LL.SHELL_WIDTH` `XSmall`…`XXXLarge`, `Full` (verified); one section narrower: group `cardContentWidth` + `cardContentAlign` | manage-launchpads, manage-tile-groups |
| Canvas image | `LL.PAGE_BACK_IMAGE` URL + `BACK_IMG_SIZE`, `BACK_IMG_REPEA`, `BACK_IMG_PLACE`, `BACK_OPA`; `"None"` = no image (verified) | manage-launchpads |
| Footer | A last section of plain tiles: logo/brand, link columns, legal line (techniques.md §4, verified). `launchpadFooter` = an App Designer app shown as a bar of buttons (not checked) | manage-tiles, manage-tile-groups, manage-launchpads |
| Nav links and a CTA in the header | `BeforeStartup` spot adding links to the header's right slot (techniques.md §3, verified) | manage-launchpads |
| Sign-in page | Login keys `LOGIN_*`, `BACK_LOGON_*`, `MOB_*`; `config.loginTitle` / `loginSubTitle` | manage-launchpads |

## Content

| Design element | Mechanism | Owner |
|---|---|---|
| Page of the site | A **screen** = a tile group in `cat`; give it a short `menuText` | manage-launchpads, manage-tile-groups |
| Section on that page | A **child tile group** in the screen's `tilegroups`, in order: `title`, `subTitle` (kicker), tiles (verified) | manage-tile-groups |
| Hero band with buttons | **One section**: `title` = headline, `subTitle` = subline, tiles = buttons, artwork on its canvas `.nepSectionCanvas<section id>`, `SHELL_WIDTH: "Full"`, screen `hideHeader: true` (techniques.md §2, verified: one background, no seam) | manage-tile-groups, manage-launchpads |
| Hero band without buttons | The screen group's header: `title`, `subTitle`, `image` (+ `imageDark`), `imageHeight` (+ tablet / mobile heights), `imagePlacement`, `imageSize`; colour, title size and wrap in `CUSTOM_CSS` on `.nepGroupHeader<screen id>` (verified). Launchpad-wide `GL` keys style this header too | manage-tile-groups, manage-launchpads |
| Hero card with a button | First tile: `cardWidth: "Max"`, `cardHeight: "Tall"`/`"Tower"`, `image` + `imageType: "B"`, `title`, `subTitle`, `description`, one action + `openText`; screen group `hideHeader: true` if its header would repeat the hero | manage-tiles, manage-tile-groups |
| Section header look (all) | `GL.HEAD_COLOR` (band), `HEAD_TEXT_CLR`, `SUBHEAD_TEXT_CLR`, `HEAD_BORDER_CLR` + `HEAD_BORDER_WDT` (border verified), `HEAD_TEXT_MARGIN` (one length, or `"custom"` + per-side keys) | manage-launchpads |
| Section header look (one) | `CUSTOM_CSS` on `.nepGroupHeader<group id>` | manage-launchpads |
| Card | Tile: `title`, `subTitle`, `description` (HTML subset), `footer`, `icon` (`sap-icon://…`) or `cardImage`; `image` + `imageType` `B` background · `T` top · empty inline · `N` · `C` · `U` (never `X`) | manage-tiles |
| Card size | `cardWidth` `Skinny` 1 · `Narrow` 2 · `Small` 4 · `Medium` 6 · `Wide` 8 · `Wider` 12 · `Max`; `cardHeight` `Tiny` … `Skyscraper` (verified); a section-wide default: group `cardWidth` / `cardHeight`. Small sizes hide content (which sizes: manage-tiles → Content and look). Columns per row follow the section width and `cardPerRow` (a typical desktop content width with `More` gave 16 columns: `Small` = 4 per row, `Wide` = 2); settle widths on the first screenshot | manage-tiles, manage-tile-groups |
| Card colours (all) | `TL.TILE_BACK`, `TILE_TITLE` (verified), `TILE_TEXT`, `TILE_ICON_COLOR`, `TILE_BORDER`, `TILE_HOVER`, `TILE_BUT_*` | manage-launchpads |
| Card layout | `TL.ICON_PLACEMENT`, `TILE_ICON_SIZE`, `TITLE_LEVEL`, `TITLE_ALIGN`, `TILE_PADDING`, `TILE_MARGIN_SHORTHAND`, `PLAIN_BACKGROUND` (`X` = no card) | manage-launchpads |
| Card colour (one card or a set) | tile `styleClass: "<class>"` + `CUSTOM_CSS` on `:root .<class> .nepFCard` (rule and variable set: manage-tiles → Content and look) | manage-tiles, manage-launchpads |
| Card art / watermark | `image` (SVG) + `imageType: "B"`, `imagePlacement`, `imageSize`, `imageRepeat`; B removes the card colour — put the colour in the SVG or on `.<class> .nepTileImageContent` (verified) | manage-tiles, manage-media |
| Card button | An action + `openText` (text button), or `cardButtonIcon` + `cardButtonIconOnly: true` with `openText` empty (icon button); needs a tile ≥ `Small` × `Normal` that is not clickable; shape via `CUSTOM_CSS` on `.<class> .nepCardActionOpen` (verified) | manage-tiles |
| No "…" button | `TL.HIDE_CONTEXT_BTN: "X"` (verified); removes the user's tile menu | manage-launchpads |
| Whole card clickable | `FIORI_STYLE: "X"` (tile or group); `Tiny`/`Short`/`Skinny`/`Narrow` tiles are always clickable (verified) | manage-tiles |
| Link list | `cardWidth: "Max"`, `cardHeight: "Tiny"` tiles in their own section, group `cardPerRow: "One"` (verified); no icon on them unless `ICON_PLACEMENT` is `AlignLeft`/`AlignRight` (a `Tiny` tile with an icon hides its title) | manage-tiles, manage-tile-groups |
| KPI or chart card | Tile `type` `highchart`, `highstock`, `intcard` or `application` (live data) | manage-tiles |
| Announcement strip | Group `enableMessage: true` + complete `configMessage` | manage-tile-groups |
| Side column next to a section | Group `navbarGroups` / `sidebarGroups` + widths (verified) | manage-tile-groups |
| What a card opens | Tile action: `A` app, `W` web app (`/webapp/<name>`), `U` URL, `T` another tile group; one target only | manage-tiles, manage-apps, manage-webapps |

## Cannot be reproduced → closest platform-native alternative

| Design feature | Why | Do instead |
|---|---|---|
| Free page layout (text beside an image, tiles overlapping each other, asymmetric blocks) | Not within the layout rules: every tile gets its own grid cell | Tile sizes (`Wide` + `Small`, `Max` rows); overlap inside one tile (techniques.md §6, §15); one section as an app tile (§9, not built here) or a web app |
| Live text (user name, counts, dates) | Titles and subtitles are stored text | Static wording; live content in a tile of type `application`, `highchart` or `intcard` |
| Several buttons on one card | A tile has one action | One tile per button, side by side; extra text links in the card's `description` (`<a href>`, techniques.md §4) |
| A header that changes on scroll or floats over the hero, scroll-driven motion, parallax, video backgrounds, bottom tab bars on phones | The shell header sits outside the content (it already stays on top); scroll effects were not built or checked | Static layout, hover transitions through `CUSTOM_CSS`; carousels: techniques.md §16 |
| Counters that count up | Needs a script per number | Static numbers in big type (`clamp()`) |
| Italic or variable-axis web fonts in the UI5 theme | One woff2 per weight slot, declared without a weight range; no italic slot | Static files for the weights in use; italics only in `CUSTOM_CSS` with your own `@font-face` |
| Custom Theme Override generated from brand / highlight / font inputs | The Designer generates it client-side; MCP can only store literal CSS there (which renders) | A theme for the palette; literal override CSS only for a quick tweak (`manage-launchpads`) |
| Visible content in the banner container or the HTML `header` field | The banner container is empty in the standard launchpad; `header` HTML goes into `<head>` | The hero options above; header links via a spot (techniques.md §3) |
| Exact per-breakpoint layouts | The grid reflows by the grid's own width | Per-device header image heights; per-section column counts via `GRID_CELLS_*` (techniques.md §10) |

## CSS hooks this method uses

`.nepGroupHeader<group id>` (one section or hero header), `.nepCatTitle` / `.nepCatSubTitle` (+ their `span`),
`:root .<styleClass> .nepFCard` (a card variant), `.<styleClass> .nepTileImageContent` (tile image layer),
`.<styleClass> .nepCardActionOpen` (open button), `.nepSectionCanvas<group id>` (a section's full-width canvas),
`--nepH4` (tile title size), `GRID_CELLS_SMALL` / `--nepGridMoreSmall` (phone columns). Recipes:
`techniques.md`; full selector list and rules: manage-launchpads.
