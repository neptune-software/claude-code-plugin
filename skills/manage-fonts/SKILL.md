---
name: manage-fonts
description: Create, configure, inspect, or delete Neptune DXP custom fonts — the Fonts tool whose woff2 files style UI5 themes, launchpads and web pages and whose ttf/otf files style PDFs — via the MCP tools `list_fonts`, `get_font`, `save_font`, `delete_font` (font files are added with `upload_font_file`, see upload-files). Use when the user wants a brand or Google font in a UI5 Theme Generator theme, a launchpad or a PDF, to assign the regular, bold, light or italic files, to check which themes or PDFs use a font, to fix a font that does not load, to replace or remove a font file, or to delete a font. Trigger phrases include "add a custom font", "use Inter in the theme", "upload the brand font", "font styles", "woff2", "ttf for PDF", "which themes use this font", "font not loading", "delete the font". Read this BEFORE any `save_font` payload — names are not unique, `config` is replaced on every save, file ids are not checked against the font, and a file rename leaves `config` on the old name.
---

# Managing Neptune DXP custom fonts via MCP

A **font** (Cockpit: Design → Fonts) is a named record holding **font files**, two switches — **Web** (`enableWeb`) and **PDF** (`enablePDF`) — and **style slots** (`config`) that say which file is Regular, Bold, and so on. Its files are served without login at **`/public/fonts/<font name>/<filename>`** (verified); there is no stylesheet per font — the `@font-face` rules live in a UI5 theme's CSS or in your own CSS. Fonts never apply themselves:

| Used by | How it references the font | Needs |
|---|---|---|
| UI5 Theme Generator (`save_theme_generator`, manage-theme-generator) | `FONT_FAMILY` = the font's `id` | A **web regular file** (`config.web.regular` naming one of its `.woff2` files) — without it the theme silently keeps the default font (verified). `enableWeb: true` makes the font pickable (Cockpit, `webFonts`); the compile itself does not check it (verified). |
| Launchpad (`save_launchpad`, manage-launchpads) | through the UI5 Theme Generator theme set in its Launchpad Designer settings, or your own `@font-face` in `CUSTOM_CSS` / `header` | As for the theme or your own CSS. For fonts use a Theme Generator theme, not the Designer's Custom Theme Override (manage-launchpads). |
| PDF Designer | the font's **name** | PDF-enabled font with `.ttf` / `.otf` files. |
| Your own CSS (launchpad `CUSTOM_CSS` or `header`, web app, App Designer app) | `@font-face { src: url('/public/fonts/<name>/<file>') format('woff2') }` | Nothing else — the URL is public. |

Adding files: `upload_font_file` (mechanics and file-name rules in **upload-files**). A font has no light or dark variant: give both themes of a light/dark pair the same `FONT_FAMILY`.

## What the user asks → what to do

| Ask | Do |
|---|---|
| "Use our font / Inter in the UI" | Web font for a UI5 theme (Workflows) → `FONT_FAMILY` on every theme of the launchpad (light and dark) |
| "Use it in PDFs" | PDF font (Workflows); templates refer to the font by name |
| "Bold looks wrong" / "all weights look the same" | One static woff2 per weight, each in its `config.web` slot |
| "Font does not load" | Fix a font that does not load |
| "Hide it from the theme picker" | `enableWeb: false` — themes already using it keep it. (`enablePDF: false` is not a hide: PDFs using the font fall back to Roboto) |
| "Rename the font" | `name` + re-save every theme in `get_font.themes` and fix the PDF templates |
| "Remove a file" / "replace a weight" | `files` with `toDelete` + corrected `config` (Workflows → Replace a font file) |
| "Delete the font" | Workflows → Delete a font |

Every Cockpit input with its field: `reference/settings.md`.

## Tools

| Tool | Behavior |
|---|---|
| `list_fonts({ listOptions? })` | `{ items, hasMore, nextSkip? }`. Every item carries `id`, `files`, `pdfs` and `themes` **whatever `select` says**; `themes` holds each using theme's full record with its compiled CSS (about 90 KB per theme, verified). Always filter by `name`. |
| `get_font({ id })` | Scalars, `config`, `files: [{ id, fontId, filename, mimetype }]` (never the content), `themes` (full UI5 Theme Generator records using it), `pdfs` (PDF templates using it) (verified). Unknown id → `Not Found`. |
| `save_font({ …fields })` | Fields at the top level, no wrapper object. Create (no `id`) or update. The echo is not the stored state: `files` lists only the files sent in this call (`[]` otherwise), and a create without `config` echoes a default `config` while `null` is stored (verified) — re-read with `get_font`. |
| `delete_font({ id })` | Permanent: the font and its files. Returns `{"status":"Successfully deleted font"}` — **also for an id that does not exist** (verified). No check for themes or PDFs using it. |

## The `save_font` contract

An update changes only the fields you send (verified). Booleans, `config` and ids are validated (`MCP error -32602: … Expected boolean, received string at enablePDF`, `… Expected object, received string at config`, `… Invalid uuid at id`).

| Field | Rules |
|---|---|
| `id` | Omit to create. **Never send an id you have not read from `list_fonts` / `get_font`**: an unknown id creates a new font with that id (verified). |
| `name` | Required on create (missing: `save_font failed: Error saving font`). **Not unique, not checked** — a duplicate or an empty name is stored (verified), and two fonts with one name make that name's file URLs answer from only one of them, whichever the server finds first — on the test instance every request returned 404 (verified) — which breaks every theme and PDF template using that name. Before creating, `list_fonts` with `where: { "name": "<name>" }` must return nothing, and `ILike` must show no case variant. Use letters, digits, `_` and `-`: the name is the URL folder and the CSS family prefix (`"<name>-Regular"`). Renaming changes both — afterwards re-save every theme in `get_font.themes`, and fix the PDF templates in `get_font.pdfs`, which refer to the font by its old name (PDF Designer). |
| `enableWeb` / `enablePDF` | Cockpit "Use in UI5 Theme Generator" / "Use in PDF Designer". `enableWeb: true` lists the font in `get_theme_generator` → `webFonts` and in the Cockpit's font picker — set it for every font you put into a theme. Switching it off only hides the font from the pickers: a theme that uses it keeps the font, also after a recompile (verified). `enablePDF: true` offers the font in the PDF Designer; PDF generation loads only PDF-enabled fonts, so `enablePDF: false` makes every PDF that uses the font render in Roboto from its next generation. The Cockpit refuses to switch either off while themes or PDF templates use the font; MCP does not check. Default `false`. |
| `config` | Style slots `{ "web": { "regular", "bold", "semiBold", "light", "semiBoldDuplex", "black" }, "pdf": { "regular", "bold", "italics", "bolditalics" } }`, each the `filename` of one of this font's files. See the rules below. |
| `files` | **Changes only; `[]`, `null` or leaving it out changes no file** (verified). Adding a file is `upload_font_file`. See the rules below. |
| `description`, `type` | Free text; `type` is a label nothing reads (the Cockpit stores `text`). |
| `package` | Package id; the usual package rules (`No edit access to artifact`, `Package is a required field`). |

**`config` rules**
- **Replaced as a whole on every save that contains it** (verified) — send both objects in full.
- **Always send it on create**, at least `{ "web": {}, "pdf": {} }`: without it `null` is stored (verified), and PDF generation fails once such a font is PDF-enabled and has a `.ttf` / `.otf` file. Repair a stored `null` by saving `config` (verified).
- Slots you leave out or set to `null` fall back: web slots to the web regular file (verified), PDF slots to the first `.ttf` / `.otf` file. Never set a slot to `""` — it is used as is.
- **Fill every slot of a switched-on target** (all six web slots with `enableWeb`, all four PDF slots with `enablePDF`), repeating the regular file where a weight is missing: the Cockpit refuses to save the font until they are filled.

**`files` rules**
- Remove: `{ "id": "<file id>", "filename": "<its filename>", "toDelete": true }` — `filename` is required on every entry (`… Required at files[0].filename`, verified). A removal leaves `config` slots that name the file in place (the Cockpit clears them; MCP does not): send the corrected `config` in the same save.
- Rename: `{ "id", "filename": "<new>", "mimetype": "font/woff2" }` — **always resend the `mimetype`** (`font/woff2`, `font/ttf`, `font/otf`): without it the mimetype is cleared and the file then fails with HTTP 500 (verified). **A rename does not touch `config`**: put the new name into `config` in the same save, or every slot that named the old file returns 404 (verified); then re-save the themes in `get_font.themes`.
- **Only use file ids from this font's `get_font`**: nothing checks that a file id belongs to the font you save — another font's file id moves that file to this font (verified), and with `toDelete` deletes it from the other font; the `filename` you send with `toDelete` is not compared (verified).
- An entry without `id` fails the save (`save_font failed: Error saving font`) after the other fields of that save were already stored (verified).

Silently ignored (verified): `NAME`, `title`, `application`, `accessLevel`, `includeDataInPackage`, `createdBy`, `changedBy`, `ver`, `themes`, `pdfs`, unknown keys. Usage cannot be set from the font side.

## Workflows

**Web font for a UI5 theme**:
1. `list_fonts({ "listOptions": { "where": { "name": "acme_sans" } } })` → `items: []` (and no case variant with `ILike`).
2. `save_font({ "name": "acme_sans", "enableWeb": true, "package": "<package id>", "config": { "web": {}, "pdf": {} } })` → font id.
3. `upload_font_file` one **static** `.woff2` per weight, once each (upload-files), e.g. `acme-regular.woff2`, `acme-bold.woff2` — a variable font served as one file for every weight (Google Fonts) makes the theme render every weight as the regular one; per-weight files such as `https://cdn.jsdelivr.net/fontsource/fonts/<family>@<version>/latin-<weight>-normal.woff2` upload directly.
4. `get_font` → every file listed once, `mimetype` `font/woff2`; delete accidental duplicates with `toDelete`.
5. `save_font({ "id": "<font id>", "config": { "web": { "regular": "acme-regular.woff2", "bold": "acme-bold.woff2" }, "pdf": {} } })`.
6. `save_theme_generator` with `"FONT_FAMILY": "<font id>"` (manage-theme-generator) → Verify.

**PDF font**: same steps with `.ttf` / `.otf` files, `"enablePDF": true` and all four `pdf` slots filled; templates refer to the font by its name.

**Replace a font file**: `upload_font_file` the new file under a **new** name → `save_font` with `config` naming it and `files: [{ "id": "<old file id>", "filename": "<old name>", "toDelete": true }]` → `get_font` (one file per name, every `config` value listed) → re-save the themes in `get_font.themes` → Verify. Uploading under the old name instead adds a second file of that name, and the URL serves either one.

**Fix a font that does not load**: compare `get_font.files` with `config` and with the theme's `CSS_VARIABLES`. Theme CSS names a file that is not in `get_font.files` → it was renamed or deleted: fix `config`, re-save the theme. No `@font-face` for the font → no web regular file, or the theme was saved before the font was ready (re-save the theme). If you can fetch URLs: `404` for a listed file → another font has the same name (rename one, re-save its themes); `500` → the file's `mimetype` is empty (rename it with the `mimetype`) or no font has that name.

**Delete a font**: `get_font` → if `themes` or `pdfs` is non-empty, name them and get the user's confirmation; also search launchpads' `config` for the font id (Launchpad Designer `THEME_OVERRIDE_FONT_FAMILY`) and for `/public/fonts/<name>/` (`CUSTOM_CSS`, `header`) — `get_font` does not list those → re-save each theme with another `FONT_FAMILY` or `null` (this regenerates its CSS, verified) → `delete_font` → `get_font` returns `Not Found`. Deleting first leaves each theme with `FONT_FAMILY: null` but CSS that still loads the deleted font, whose URLs then fail with HTTP 500 (verified).

## Verify

The MCP re-reads (`get_font`, `get_theme_generator` → `CSS_VARIABLES`) prove the stored state; the URL checks need a shell with `curl` or a fetch tool.

- **Stored**: `get_font` → each file once, `mimetype` `font/woff2` / `font/ttf` / `font/otf`, every `config` value is the `filename` of a listed file.
- **In a theme**: `get_theme_generator` → `CSS_VARIABLES` contains `font-family: "<name>-Regular"` with `src: url('/public/fonts/<name>/<file>') format('woff2')` and `--sapFontFamily: "<name>-Regular", …` (verified); the files named there are in `get_font.files`.
- **Served** (if you can fetch URLs): `curl -s -o /dev/null -w '%{http_code} %{content_type} %{size_download}' 'https://<host>/public/fonts/<name>/<filename>'` → `200 font/woff2 <bytes>` (verified). The theme stylesheet `https://<host>/public/css-generator/neptune-generated-<light|dark>-<theme id>.css` serves the same CSS.
- Only how the font looks needs a browser — open a page that uses the theme if one is available, one screenshot, move on.

## Listing and filtering

`listOptions`: `where`, `select`, `order`, `take` (default 25, max 200), `skip`. `select` keys: `id`, `name`, `description`, `type`, `enablePDF`, `enableWeb`, `themes`, `config`, `createdAt`, `createdBy`, `updatedAt`, `changedBy`, `package` — it narrows only the plain fields (verified). Without `select`, items carry only `id`, `name`, `description`, `type`, `package`, `updatedAt` and the relations (verified) — select `enableWeb`, `enablePDF` and `config` when you need them, or use `get_font`. Exact `where` matches and `order` follow the instance's case rules — case-sensitive on the test instance (`FontSkill_Inter` sorted before `fontskill_bare`, verified); use `ILike` to find every case variant before you create. Walk pages with `skip` = `nextSkip` while `hasMore` is true, always with an `order`.

## Errors

| Signal | Meaning / fix |
|---|---|
| `save_font failed: Error saving font` | Create without `name`, or a `files` entry without `id`. Re-read: other fields of the save may be stored. |
| `MCP error -32602: … Required at files[0].filename` | Every `files` entry needs `filename`, also with `toDelete`. |
| `MCP error -32602: … Invalid uuid at id` / `… Expected boolean …` / `… Expected object, received string at config` | Malformed input; nothing saved. |
| `Not Found` | `get_font` with an unknown id. |
| `No edit access to artifact` / `No access to artifact` | The font's package is restricted for you. |
| `Package is a required field` | The instance requires a package. |
| `<name> is locked by <user> since <time>` | Someone has the font open in edit mode in the Cockpit. |
| Font URL `404` / `500` | See "Fix a font that does not load". |
| `Access denied: no permission for fonts` | No Fonts permission. |

## What MCP can NOT do

- Add file content through `save_font` (use `upload_font_file`) or read a file's bytes back (fetch its URL).
- Choose where a font is used: that is the theme (`save_theme_generator`), the launchpad's CSS or the PDF template.
- Show which launchpads use a font — only the themes and PDF templates that reference it; search launchpad `config` yourself.
- Stop duplicate names or duplicate file names; check before you create or upload.
- Regenerate theme CSS after a font change — re-save the theme.

## Permissions

Fonts permission (`fonts`; Design → Fonts): `list_fonts` and `get_font` with display access, `save_font` (`Save`) and `delete_font` (`Del`) with edit access; uploads: see upload-files. Package roles narrow this.

## Related skills

- **upload-files** — `upload_font_file`: `sourceUrl` or `curl`, size limit, file names, errors.
- **manage-theme-generator** — `FONT_FAMILY`, `webFonts` and the generated theme CSS.
- **manage-launchpads** — applying the theme through the Launchpad Designer settings; `CUSTOM_CSS` and `header` for your own `@font-face`.
- **manage-media** — other assets your CSS loads next to the font.
- **manage-webapps** — web pages that load the font with `@font-face`.
- **design-to-launchpad** — the font as one step of rebuilding a design or website as a launchpad.
