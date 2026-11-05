---
name: manage-theme-generator
description: Create, update, inspect, apply or delete Neptune DXP UI5 Theme Generator themes - colors, status colors, corner radius, font and custom Sass or CSS compiled into a UI5 theme on Horizon Light or Dark - via the MCP tools `list_theme_generator`, `get_theme_generator`, `save_theme_generator`, `delete_theme_generator`. Use when the user wants a branded UI5 theme, to match a palette or a website, to change header, button, link, background, tile or text colors, to round corners, to use a custom font in UI5, to put a theme on a launchpad or app, or to remove a theme. Trigger phrases include "create a theme", "theme generator", "brand colors", "dark theme", "light and dark theme", "dark mode", "rounder corners", "Sass variables", "apply the theme to the launchpad", "delete the theme". Read this BEFORE any `save_theme_generator` payload - colors are HSL number strings, a create needs `brightness`, and get and save responses carry the full compiled CSS.
---

# Managing UI5 Theme Generator themes via MCP

A **theme** (Cockpit: UI5 Theme Generator) holds seed colors, status colors, a base corner radius, an optional font and optional custom Sass and CSS. **Every save compiles them** on top of Neptune's Horizon Light or Horizon Dark into one stylesheet of about 1,400 UI5 CSS variables (`--sapBrandColor`, `--sapShellColor`, …). Launchpads and apps refer to a theme by its **theme name** `neptune-generated-<light|dark>-<id>`, and the stylesheet is served without login at `https://<host>/public/css-generator/<theme name>.css`.

## What the user asks → what to set

| Ask | Set |
|---|---|
| "Use our brand colors" | `BRAND` (+ `HIGHLIGHT`) triples → Workflows |
| "Also in dark mode" / "light and dark" | Two themes from one brand, one per brightness → Light and dark |
| "Header in our color" | `SHELLHD` triple (a Launchpad Designer header color, if set, wins) |
| "Change the page background" | Apps: `BACKGROUND` triple. Launchpad: Designer `SHELL_BACK_COLOR` (manage-launchpads) |
| "Rounder" / "square corners" | `CSS_VAR_BORDER_RADIUS` (`0` … `1rem`); one element type only: its `$nep…BorderCornerRadius` in custom Sass |
| "Bigger text" / "bigger icons" / "thicker borders" | Custom Sass `$nepFontLargeSize`, `$nepIconHeight`, `$nepBorderWidth` |
| "Our font" | `FONT_FAMILY` (upload with manage-fonts first) |
| "Less colorful" / "darker surfaces" | `$nepBrandSaturationFactor` / `$nepBrandLightnessFactor` in custom Sass |
| "Success / warning / error colors" | Status color fields; message-strip backgrounds `$nepSuccessBackground` etc. |
| "Button text is hard to read" | `$sapButton_Emphasized_TextColor` or `$sapContent_ContrastTextThreshold` |
| "Only the tiles in this color" | `$sapTile_Background` |
| "Uppercase buttons" or any rule no parameter covers | `CSS_VAR_CUSTOM_CSS` |

Every Cockpit input with its field, and all 31 Master SASS Variables: `reference/settings.md`.

## Tools

| Tool | Behavior |
|---|---|
| `list_theme_generator` | Summaries `id`, `name`, `description`, `package`, `updatedAt`; more fields via `select` (see Listing). |
| `get_theme_generator({ id })` | The full record: every field below, `CSS_VARIABLES` (the compiled stylesheet, about 90 KB), `fontObj` (the font record or `null`) and `webFonts` = `[{ id, name }]`, the fonts enabled for the web (verified) — candidates for `FONT_FAMILY`. |
| `save_theme_generator({ … })` | Create (no `id`) or update; compiles, stores and returns the saved record including `CSS_VARIABLES`, without `fontObj` / `webFonts` (verified). The fields go at the top level — there is no wrapper object. |
| `delete_theme_generator({ id })` | Permanent. Returns `{"status":"Successfully deleted theme_generator"}`; an unknown id fails with `Not Found` (verified). **Does not check where the theme is used** (see Applying). |

**Get and save responses carry the ~90 KB stylesheet**: read only the fields you need.

## The `save_theme_generator` contract

An update merges what you send into the stored theme and **recompiles from the merged values** (verified): send `id` plus the fields that change. Fields you leave out keep their value (also `active`, verified); `null` clears a field.

| Field | Rules |
|---|---|
| `id` | Omit to create. **Never send `"id": ""` (verified) or `null` — either creates a new theme**. An unknown id fails with `save_theme_generator failed: Not Found`; an update never creates (verified). |
| `name` | Required on create (missing: `save_theme_generator failed: Error saving theme_generator`). Trimmed, 1–264 characters (verified). **Not unique** — a second theme with the same name is created silently (verified): check with `list_theme_generator` first and refer to themes by `id`. The Cockpit turns typed names into lowercase letters, digits and `_` (its Settings tab also caps them at 50 characters): use that form for themes people will maintain there. |
| `brightness` | `"Light"` or `"Dark"`, exact case (`"light"` fails validation, verified). Picks the base: Horizon Light or Horizon Dark, and their defaults. **Always send it on create**: without it the theme is stored with no brightness and compiled as Light (verified), and the App Designer and Launchpad Designer theme lists expect every theme to have one. The Cockpit fixes it at create; an MCP update can change it (verified). Then rename every reference: the stylesheet URL ignores its `light`/`dark` part, so an old reference silently loads the new colors on the wrong UI5 base. |
| `description` | Up to 1,024 characters. Shown in the designers' theme lists. |
| `package` | Package id. On create without it, your default package applies (if you have one). A nonexistent id fails with `Error saving theme_generator` (verified). |
| `CSS_VAR_<SEED>_H` / `_S` / `_L` | One H/S/L triple per seed (see Seeds). **Bare numbers as strings**: hue `"0"`–`"360"`, saturation and lightness `"0"`–`"100"`; decimals are kept (`"316.2"`). Convert hex colors to HSL yourself **with one decimal place — that reproduces every hex color exactly**; whole numbers miss most colors by up to 5 per channel (`#3a1530` = `316.2` / `46.8` / `15.5`, verified). By hand: R, G, B = channel / 255; L = (max + min) / 2; S = (max − min) / (1 − |2L − 1|) (0 for grey); H = 60 × ((G − B) / (max − min) mod 6) when R is max, 60 × ((B − R) / (max − min) + 2) when G, 60 × ((R − G) / (max − min) + 4) when B; S and L × 100. A number with anything after it (`"50%"`, `"12abc"`) fails with `Error compiling theme`; a value that does not start with a number (`"#ff0000"`) is stored but ignored — the seed keeps its default (verified). |
| `CSS_VAR_POSITIVE_COLOR`, `CSS_VAR_NEGATIVE_COLOR`, `CSS_VAR_CRITICAL_COLOR`, `CSS_VAR_INFORMATION_COLOR` | Status colors as CSS colors — use hex (`"#2e7d32"`, verified). |
| `CSS_VAR_BORDER_RADIUS` | Base corner radius as a CSS length: `"0"`, `"0.25rem"`, `"1rem"` (default `1rem`). Something that is not a length fails with `Error compiling theme` (verified). |
| `FONT_FAMILY` | Id of a font from the Fonts tool — pick one from `webFonts`. **The font needs a web regular file**, otherwise the id is stored and the theme silently keeps the default font (verified). A nonexistent id fails with `Error saving theme_generator`, a non-UUID with `Invalid uuid at FONT_FAMILY` (verified). |
| `CSS_VAR_CUSTOM` | Custom Sass, compiled with the theme — see Custom Sass and CSS. |
| `CSS_VAR_CUSTOM_CSS` | Plain CSS appended unchanged to the end of the stylesheet (verified). Not validated. |
| `CSS_VAR_CONTRAST_FOCUS_COLOR_H/_S/_L`, `active` | Stored, but they **change nothing** in the stylesheet (verified). Do not use them. |

Silently ignored — no error, nothing stored (verified): `CSS_VARIABLES` (always regenerated), `NAME`, `title`, `application`, `accessLevel`, `includeDataInPackage`, `ver`, `createdBy`, `changedBy`, `fontObj`, `webFonts` and unknown keys.

Any compile failure returns only `save_theme_generator failed: Error compiling theme`, without detail, and stores nothing (verified): undo the last Sass change or unit you added. When someone holds the theme's lock (Cockpit edit mode or `create_lock`), save and delete fail (see Errors).

## Seeds

| Seed (`CSS_VAR_…_H/_S/_L`) | Main CSS variables | What it colors | Default Light / Dark (H/S/L) |
|---|---|---|---|
| `BRAND_COLOR` | `--sapBrandColor`, `--sapButton_Emphasized_Background` | Emphasized (primary) buttons; its hue also tints every unset seed | 212/100/47 · 212/100/47 |
| `HIGHLIGHT_COLOR` | `--sapHighlightColor`, `--sapLinkColor` (Dark: 15 % darker than the highlight, verified), `--sapSelectedColor`, `--sapButton_TextColor` | Links, selection, selected buttons, default-button text, busy indicator | brand hue/100/42 · brand hue/100/65 |
| `FOCUS_COLOR` | `--sapContent_FocusColor`, `--sapField_Focus_BorderColor` | Keyboard focus outline, focused field border | highlight hue/100/32 · …/100/80 |
| `BASE_COLOR` | `--sapBaseColor`, `--sapTile_Background`, `--sapList_Background`, `--sapGroup_ContentBackground`, `--sapPageHeader_Background`; `--sapField_Background` on Light only (on Dark, inputs follow `BACKGROUND_COLOR`) | Surfaces: tiles, lists and tables, panels, page headers; inputs on Light | brand hue/0/100 · …/18/14 |
| `BACKGROUND_COLOR` | `--sapBackgroundColor`, `--sapButton_Background` | Page background, default-button background, hover tints | brand hue/11/96 · …/22/9 |
| `FOREGROUND_COLOR` | `--sapContent_ForegroundBorderColor`, `--sapField_BorderColor` | Field and list-header borders, scrollbars | highlight hue/21/55 · …/14/70 |
| `SHELLBG_COLOR` | `--sapShell_Background` | Shell background of apps; not the launchpad canvas (see Applying) | brand hue/11/94 · …/22/9 |
| `SHELLHD_COLOR` | `--sapShellColor` and the `--sapShell_*` set | Shell header bar (its text switches to the contrast color automatically); on a launchpad without background image, canvas colour and Designer header colour it also fills the page (verified) | brand hue/0/100 · …/18/14 |
| `LIST_COLOR` | `--sapList_SelectionBackgroundColor` | Selected list and table rows | brand hue/100/96 · …/36/18 |
| `TEXT_COLOR` | `--sapTextColor`, `--sapTitleColor` | Body text and titles | brand hue/37/12 · …/11/96 |
| `CONTRAST_COLOR` | `--sapContent_ContrastTextColor` | Text on dark backgrounds (Light) or bright ones (Dark): shell header, emphasized buttons, tiles | brand hue/0/100 · …/22/9 |
| `LABEL_COLOR` | `--sapContent_LabelColor`, `--sapTile_TextColor` | Labels, placeholders, tile subtitles | brand hue/21/42 · …/18/59 |
| `ICON_COLOR` | `--sapContent_IconColor`, `--sapTile_IconColor` | Content and tile icons | brand hue/21/42 · …/18/59 |

Every seed lands in the stylesheet exactly as sent, as `hsl(H, S%, L%)` (verified for all 13). How unset values are filled (verified):

- An unset seed keeps its default saturation and lightness but **takes the brand hue** — a theme with only `CSS_VAR_BRAND_COLOR_H` re-tints every background, border and text.
- Setting the highlight saturation or lightness also sets focus (lightness − 10) and the border colors unless you set `FOCUS_COLOR` / `FOREGROUND_COLOR` yourself.
- Text on the shell header, tiles and emphasized buttons is Text Color or Contrast Text Color, whichever suits the background. A mid-tone brand such as orange `#f2a552` gets white button text in a Light theme; force another color with the custom Sass `$sapButton_Emphasized_TextColor: <color>;` (verified), or move the switch point for all such text with `$sapContent_ContrastTextThreshold: 0.4;` (default Light `0.65`, Dark `0.386`; in a Light theme a lower value gives dark text on more backgrounds, verified).
- The radius multiplies: tiles × 1, groups and elements × 0.75, buttons and popovers × 0.5, fields × 0.25 (`0.5rem` → tile `0.5rem`, button `0.25rem`, field `0.125rem`).

## Custom Sass and CSS

`CSS_VAR_CUSTOM` holds Sass declarations compiled with the theme, so derived values (hover shades, contrast text) follow:

- **Override any UI5 parameter with a literal value**: `$sapTile_Background: #d9d0fb;`, `$sapAccentColor1: #f2a552;`, even a seed-driven one such as `$sapBrandColor: #f2a552;` — they appear as written (`--sapTile_Background: #d9d0fb`) and dependent parameters follow (`--sapButton_Emphasized_Background: #f2a552`) (verified). This is also the way to give one parameter an exact hex.
- **The 31 Master SASS Variables** of the Cockpit (`reference/settings.md`) are set the same way and land as written on Light and Dark themes (verified): per-element corner radii (`$nepTileBorderCornerRadius: 0.25rem;`), `$nepFontLargeSize: 1.125rem;` (scales every font size; `--sapFontSize` went from `0.875rem` to `0.984375rem`, verified), `$nepIconHeight`, `$nepBorderWidth`, the neutral color and the four message-strip backgrounds (`$nepErrorBackground` …). A master color set here (`$nepBrandColor: #…;`) **wins over the Theme Colors field**, while that field's hue still tints the seeds you left unset (verified) — keep the 13 seed colors in their fields.
- **Mute the brand tint or darken/lighten every surface in one line**: `$nepBrandSaturationFactor` and `$nepBrandLightnessFactor` (percent, default `100`) scale the saturation and lightness of every brand-derived seed you left unset (base, background, shell, list, text, contrast, label, icon); `$nepHighlightSaturationFactor` / `$nepHighlightLightnessFactor` do the same for focus and foreground border. `$nepBrandSaturationFactor: 0; $nepBrandLightnessFactor: 90;` gave grey surfaces 10 % darker (`--sapBackgroundColor: hsl(212, 0%, 86.4%)`); brand and highlight themselves do not change. They work on Dark themes; on Light themes only some instances apply them — after the save check that `--sapBackgroundColor` changed, otherwise set the seeds' `_S` / `_L` by hand. On Light keep a lightness factor at `100` or below (above it every surface turns white).
- **Never reference a UI5 (`$sap…`) parameter** (`$sapShellColor: $sapBrandColor;`): it fails with `Error compiling theme` (verified). The seed colours can be referenced: `$nepBrandColor`, `$nepHighlightColor`, `$nepFocusColor`, `$nepBaseColor`, `$nepBackgroundColor`, `$nepShellBackgroundColor`, `$nepShellHeaderBackgroundColor`, `$nepListSelectionBackgroundColor`, `$nepTextColor`, `$nepContrastTextColor`, `$nepLabelColor`, `$nepIconColor`, `$nepForegroundBorderColor`, and `$nepBorderRadius` (`$sapTile_Background: $nepBrandColor;` verified). Any other `$nep…` variable (status colors, backgrounds, radii, sizes) can be read only after you set it earlier in the same custom Sass, otherwise `Error compiling theme` (verified).

`CSS_VAR_CUSTOM_CSS` is for rules no parameter covers, e.g. `.sapMBtn { text-transform: uppercase; }` (verified, appended last).

## Fonts

Upload the font with the Fonts tool and enable it for the web (`manage-fonts`), then set `FONT_FAMILY` to its id. The stylesheet then carries seven `@font-face` rules pointing at `/public/fonts/<font name>/<file>` and `--sapFontFamily: "<font name>-Regular", Arial, Helvetica, sans-serif` (bold, semibold, light and black variants likewise; missing variants reuse the regular file) (verified). If neither appears, the font has no web regular file. `FONT_FAMILY: null` returns to the default font.

The font is built into the stylesheet when the theme is saved. After the font's files, style slots or name change, re-save the theme — `save_theme_generator({ "id": "…" })` recompiles with all stored fields (verified). Use woff2 files: every face is declared as `format('woff2')`.

## Applying a theme

The theme name is `neptune-generated-` + `light` or `dark` (the theme's `brightness`, lowercase) + `-` + `id`. **Use the prefix that matches `brightness`**: it picks the UI5 base theme the browser loads under the generated colors. If you change a theme's `brightness`, update the names where it is used.

- **Launchpad** — through its Launchpad Designer theme settings, written with `save_launchpad`. Values to hand to `manage-launchpads` (Themes; it lists the six theme keys and how to send `config` complete): theme name `neptune-generated-<b>-<id>`, base `sap_horizon` / `sap_horizon_dark`, stylesheet `/public/css-generator/neptune-generated-<b>-<id>.css`. Light theme → `config.designer.light`, Dark theme → `config.designer.dark`; one theme only → see Light and dark.
- **The theme does not paint the launchpad page.** The canvas is the Launchpad Designer background image or canvas colour (`SHELL_BACK_COLOR`; the canvas rule is in `manage-launchpads` → Launchpad Designer settings). Launchpad Designer colour keys (header, tiles, tile groups) are applied on top of the theme and win where set: leave them out where the theme should decide.
- **Do not use the launchpad's `customTheme` or `ui5Theme`** for a generated theme. Both store the value without complaint, but `customTheme` is the id of a Cockpit Global Style — a Theme Generator id there loads an empty stylesheet (verified) — and `ui5Theme` is not where the launchpad takes its theme from (the sign-in page ignores it, verified).
- **App Designer app** — `save_app` with `ui5_theme` = the theme name, then `activate_app` (`manage-apps`). It applies when the app is opened on its own (verified in a browser); inside a launchpad the launchpad's theme is used.
- **Deleting a theme leaves every reference in place** (verified): the launchpad or app keeps the theme name and its stylesheet URL returns 404, so the generated colors are gone. Repoint the references before you delete.

## Light and dark

A theme is Light or Dark, never both. A launchpad that follows the user's light/dark setting needs **two themes built from one brand**, each in its own appearance.

**Build the pair** (verified with brand `#0f766e`):
- **Same in both**: the brand's hue family, `FONT_FAMILY`, `CSS_VAR_BORDER_RADIUS`, sizes; names `<brand>_light` / `<brand>_dark`.
- **Brand and highlight lightness differ.** Light: dark enough to read on white; Dark: light enough to read on near-black. Example: Light brand and highlight `175.3/77.4/26.1` (`#0f766e`, links 5.0:1); Dark brand `172.5/66/50.4` (`#2dd4bf`, dark button text 9.3:1) and highlight `170.6/76.9/64.3` (links 10.9:1). Dark links are the highlight 15 % darker — check `--sapLinkColor`, not the highlight.
- **No mid-tone brand on Dark**: button text switches by luminance, and `#14b8a6` on a Dark theme got light text at 2.3:1 (verified). Take a brighter step, or set `$sapButton_Emphasized_TextColor`.
- **Leave neutral seeds and status colors unset in both** — each brightness has its own defaults (neutral seeds tinted by the brand hue, status colors fixed per brightness). If you set them, choose them per theme: the Light status defaults reach only 1.9–4.3:1 on a dark surface and the Dark ones 1.3–3.0:1 on white. Never copy a color, status color or custom Sass color from one theme into the other.
- **Check each theme's contrast** in its compiled stylesheet: link on `--sapBackgroundColor`, `--sapButton_Emphasized_TextColor` on `--sapButton_Emphasized_Background`, `--sapShell_TextColor` on `--sapShellColor` — at least 4.5:1.

**Attach** on the launchpad: Light theme in `config.designer.light.launchpadLayout`, Dark theme in `config.designer.dark.launchpadLayout`, and the other Designer keys (canvas, logo, colors) in both buckets (manage-launchpads). The launchpad page then carries both stylesheets (verified).
- **Bucket = brightness.** The bucket sets the launchpad's own light/dark styling, the theme name sets the UI5 base: a Dark theme in the light bucket is stored without complaint and loads a Horizon Dark base under light styling (verified on the sign-in page).
- **Only one theme**: unless the launchpad (`layout_light` / `layout_dark`) or the instance has a Launchpad Layout for that appearance, the other appearance shows standard Horizon or Horizon Dark with Neptune's default background and none of the brand (verified: the dark appearance of a light-only launchpad loads no generated stylesheet). Set `layout_preference` `3` (Only Light) for a Light theme or `4` (Only Dark) for a Dark one, or build the pair.
- Which appearance shows: `layout_preference` `0` the instance default, else the user's device; `1` / `2` start light / dark; with 0–2 users can switch in their launchpad settings; `3` / `4` only light / only dark, no switch.
- Logos and images that sit on a mode-dependent background need a variant per bucket: manage-media → Light and dark images.

An App Designer app takes one `ui5_theme`: choose the brightness the app should have.

## Verify (headless first)

1. **Stored values** — the save response, or `list_theme_generator` with `select` for `brightness` and the brand/focus triples.
2. **Compiled values** — the save response's `CSS_VARIABLES` is exactly the stylesheet the URL serves: find the lines you set — seeds as `--sapShellColor: hsl(316.2, 46.8%, 15.5%);`, hex values (status colors, custom Sass) as written, a font as `--sapFontFamily: "<font name>-Regular", …` plus `@font-face`. If your client can fetch URLs: GET `https://<host>/public/css-generator/neptune-generated-<light|dark>-<id>.css` (no login) → `200`, `text/css; charset=utf-8`, the same text; `404` = deleted or unknown id; a name without `<uuid>.css` → `400`.
3. **Launchpad wiring** — `get_launchpad` → `config.designer.<light|dark>.launchpadLayout.THEME` is the theme name. If your client can fetch URLs: GET `https://<host>/launchpad/<launchpad name>` (no login, sign-in page) contains `/public/css-generator/<theme name>.css` — for a pair both the light and the dark name; a `""` in their place means that appearance has no generated theme (verified).
4. **App wiring** — `get_app` → `ui5_theme` is the theme name and `activate_app` succeeded.
5. **The final look** needs pixels: if a browser is available, open the launchpad or app, take a screenshot and compare it with the target; otherwise say that the look was not checked visually.

## Workflows

**Brand palette → theme**: convert each brand hex to HSL → map roles to seeds (primary → `BRAND`, accent / links → `HIGHLIGHT`, header → `SHELLHD`, page background of apps → `BACKGROUND`, launchpad canvas → the launchpad's `SHELL_BACK_COLOR`, surfaces → `BASE` or `$sapTile_Background`, text → `TEXT`, selection → `LIST`, success/warning/error/info → status colors) → choose `brightness` (both, if users may run dark mode: Light and dark) → `save_theme_generator` with `name`, `brightness`, `package` and the triples → Verify 2 → apply → Verify 3–5. Keep links and accent text readable: contrast ratio against the background at least 4.5:1. Lightness alone does not decide it — yellows and greens need a far lower lightness than blues.

**Change a color**: `{ "id": "…", "CSS_VAR_SHELLHD_COLOR_H": "…", "CSS_VAR_SHELLHD_COLOR_S": "…", "CSS_VAR_SHELLHD_COLOR_L": "…" }` → Verify 2. Launchpads and apps using the theme need no re-save: they load the stylesheet by URL, which always serves the latest compile (a PWA-enabled launchpad may show the old look once).

**Copy a theme**: `get_theme_generator` → keep `brightness`, `description`, `package`, `FONT_FAMILY` and the `CSS_VAR_…` fields → `save_theme_generator` with a new `name` and no `id`.

**Audit**: themes without a brightness — `list_theme_generator({ "listOptions": { "where": { "brightness": { "operation": "IsNull" } } } })` — can break the designers' theme lists; fix each with `{ "id": "…", "brightness": "Light" }` (or `"Dark"`).

**Delete**: find what uses the theme (launchpads: `list_launchpads` with `select: { "id": true, "name": true, "config": true }` (page with `skip`), search `config.designer` for the theme id; apps: `get_app` → `ui5_theme`, apps cannot be filtered by theme) → repoint or confirm with the user → `delete_theme_generator` → `get_theme_generator` returns `Not Found` and the stylesheet URL `404`.

## Listing and filtering

- `select` accepts `id`, `name`, `description`, `package`, `updatedAt`, `changedBy`, `ver`, `brightness`, `CSS_VAR_BRAND_COLOR_H/_S/_L`, `CSS_VAR_FOCUS_COLOR_H/_S/_L` (each `true`). Other keys are dropped without an error: you get `id` plus the valid keys, or the default summary when none is valid (verified) — use `get_theme_generator` for the rest.
- `where` and `order` accept `id`, `name`, `description`, `package`, `brightness`, `changedBy`, `updatedAt`. **Any other `where` key is dropped and the list comes back unfiltered** (verified) — never act on such a result. An `order` key outside the list fails validation (verified).
- Filter `brightness` with `"Light"` / `"Dark"` exactly — `"light"` returned nothing in the test (verified). Use `{ "operation": "ILike", "value": "%text%" }` for names.
- `take` defaults to 25, at most 200; page with `skip` = `nextSkip` while `hasMore` is true, and send `order` when paging.

## Errors

| Signal | Meaning / fix |
|---|---|
| `save_theme_generator failed: Error compiling theme` | A unit in an H/S/L value, a radius that is not a length, or invalid custom Sass (including a reference to another UI5 parameter). Nothing stored. |
| `save_theme_generator failed: Not Found` | `save` with an unknown `id`. |
| `save_theme_generator failed: Error saving theme_generator` | Create without `name`, or a `package` / `FONT_FAMILY` id that does not exist. |
| `MCP error -32602: Input validation error: … Invalid enum value. Expected 'Light' \| 'Dark', received '<x>' at brightness` | Wrong case or value. |
| `… String must contain at least 1 character(s) at name` / `… at most 264 character(s) at name` / `… at most 1024 character(s) at description` | Name empty (also only spaces) or too long; description too long. |
| `… Invalid uuid at FONT_FAMILY` (also `package`, `id`) | Not a UUID. |
| `Not Found` | `get` / `delete` with an unknown id. |
| `save_theme_generator failed: <name> is locked by <user> since <time>` (delete: same text without the prefix) | Someone holds the lock. |
| `No edit access to artifact` / `No access to artifact` | The theme's package is restricted for you. |
| `Package is a required field` | The instance requires a package on create. |
| `MCP error -32602: … Invalid enum value. Expected 'id' \| 'description' \| 'name' \| 'changedBy' \| 'updatedAt' \| 'package' \| 'brightness', received '<key>' at listOptions.order.<key>` | `order` on a field that cannot be sorted (verified). |
| `Access denied: no permission for themegenerator` | Missing UI5 Theme Generator permission. |
| Stylesheet URL returns `404` | Theme deleted or wrong id. |
| Stylesheet URL returns `400 … is missing uuid` | The file name does not end in `<uuid>.css`. |
| Saved fine but a color or font did not change | A non-numeric H/S/L value, a font without a web regular file (or a font changed after the theme's last save — re-save the theme), a `CONTRAST_FOCUS` field, a seed overridden later in custom Sass, or a Launchpad Designer colour key set on the launchpad. |

## What MCP can NOT do

- Show a preview or screenshot of a theme (Cockpit: UI5 Theme Generator preview) — use a browser on a launchpad or app.
- Use a base other than Horizon Light or Horizon Dark.
- Create or edit Cockpit **Global Styles** (Theme Designer: name, description, package and one stylesheet, referenced by a launchpad's `customTheme`) or **UI5 Theme Import** themes (a theme zip exported from SAP UI Theme Designer) — no MCP tool reaches either.
- Return the stylesheet without the whole record — fetch the public URL instead.
- Find the launchpads or apps that use a theme, or stop a delete that breaks them.
- Upload a font (`manage-fonts` / upload tools).
- Generate the Launchpad Designer's per-launchpad Custom Theme Override (brand, highlight, font) — put those colors into a Theme Generator theme and apply it (above).

## Permissions

All four tools need the UI5 Theme Generator permission (`themegenerator`): list with any access, get with display (`Get`), save (`Save`) and delete (`Del`) with edit access. Themes in role-protected packages also need package access. Applying a theme needs the launchpad or app permission (`save_launchpad`, `save_app`, `activate_app`).

## Related skills

- **`manage-launchpads`** — `config.designer` (Launchpad Designer appearance) where a launchpad gets its light and dark theme.
- **`manage-fonts`** / **`upload-files`** — the font behind `FONT_FAMILY`.
- **`manage-apps`** — `ui5_theme` and `activate_app` for App Designer apps.
- **`manage-media`** — files that the theme's custom CSS references by `/media/root/…` URL.
- **`design-to-launchpad`** — rebuilding a design or website end to end; uses this skill for the palette.
- **`dxp-overview`** — packages and the artifact model.
