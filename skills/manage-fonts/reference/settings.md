# Fonts — every Cockpit setting and its MCP field

The Cockpit **Fonts** tool (Design → Fonts): its create dialog and the four tabs General, Styles, Files, Where Used.
The save contract and the rules are in SKILL.md; this file is the lookup table.

## Create dialog

| Cockpit input | MCP | Notes |
|---|---|---|
| Name (required) | `name` | Becomes the URL folder `/public/fonts/<name>/` and the CSS family prefix `"<name>-Regular"`. |
| Font Files (required; `.ttf`, `.otf`, `.woff2`) | `upload_font_file` after the create | The Cockpit refuses a font without a file and fills every style slot with the first file of each kind. Over MCP: create with `config`, upload, then fill `config` (SKILL.md → Workflows). |
| Package (when the instance requires one) | `package` | |

## General tab

| Cockpit input | MCP field | Effect |
|---|---|---|
| Name | `name` | Rename = new URL folder and family prefix; re-save the themes, fix PDF templates (SKILL.md). |
| Description | `description` | Text only. |
| Use in PDF Designer | `enablePDF` | Offers the font in the PDF Designer. PDF generation loads only enabled fonts: off = PDFs using the font render in Roboto. Locked in the Cockpit while PDF templates use the font. |
| Use in UI5 Theme Generator | `enableWeb` | Offers the font in the theme's Font Family list (`webFonts`). Locked in the Cockpit while themes use it. Off does not remove the font from themes already using it. |
| Package (Development Coordination) | `package` | |
| (not shown) | `type` | A label; the Cockpit always stores `text`. |

## Styles tab

| Cockpit input | MCP field | Required in the Cockpit |
|---|---|---|
| PDF Designer Styles: Regular, Bold, Italics, Bold Italics | `config.pdf.regular`, `.bold`, `.italics`, `.bolditalics` (a `.ttf` / `.otf` filename) | When "Use in PDF Designer" is on |
| UI5 Theme Generator Styles: Regular, Bold, SemiBold, Light, SemiBoldDuplex, Black | `config.web.regular`, `.bold`, `.semiBold`, `.light`, `.semiBoldDuplex`, `.black` (a `.woff2` filename) | When "Use in UI5 Theme Generator" is on |

Where each web slot shows up in a theme (verified in the compiled stylesheet): Regular → body text (`--sapFontFamily`) and
the italic face; Bold → bold text, headers and emphasized buttons; SemiBoldDuplex → buttons (`--sapButton_FontFamily`);
SemiBold → semibold text; Light → light text; Black → object-header titles. An empty slot uses the Regular file.

## Files tab

| Cockpit control | MCP |
|---|---|
| Add (dialog, several files) / drag and drop | `upload_font_file`, one file per call |
| Type, Name columns | `get_font` → `files[].mimetype`, `files[].filename` |
| Path column, Copy path (`/public/fonts/<name>/<file>`) | Build the same path from `name` and `filename` |
| Delete (row) — also clears style slots that named the file | `files: [{ id, filename, toDelete: true }]` plus the corrected `config` in the same save |
| Duplicate file names refused | Not checked over MCP — check `get_font.files` before uploading |

## Where Used tab

| Cockpit | MCP |
|---|---|
| UI5 Themes, PDFs using the font | `get_font` → `themes`, `pdfs` (themes come with their whole stylesheet) |
| Delete refused while the font is used | `delete_font` does not check — follow SKILL.md → Delete a font |

## List page

Columns Name, Description, PDF Designer, UI5 Theme Generator, Created/Changed On/By; filters Search, Package, Updated
By → `list_fonts` (`where`, `select`, `order`; SKILL.md → Listing and filtering).
