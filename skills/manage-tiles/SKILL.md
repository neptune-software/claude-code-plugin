---
name: manage-tiles
description: Create, configure, style, list or delete Neptune DXP tiles — the cards a launchpad user clicks to open an app, a web app, a URL, an Adaptive Framework app or another tile group — via the MCP tools `list_tiles`, `get_tile`, `save_tile`, `delete_tile`. Use when the user wants a new tile or launchpad entry, to change a tile's title, subtitle, details, status text, icon, icon image, background or top image, size, open button, CSS class, action or how it opens, to run an app or a chart inside a tile, or to remove a tile. Trigger phrases include "create a tile", "add a tile for this app", "tile opens a URL", "change the tile icon", "tile background image", "make the tile wider", "tile size", "open in a dialog", "app inside the tile", "highchart tile", "blackout tile", "delete the tile". Read this BEFORE any `save_tile` payload — several fields are silently ignored, no reference is checked, and a tile shows on a launchpad only through a tile group.
---

# Managing Neptune DXP tiles via MCP

A **tile** is one card on a launchpad: content, size, click **action** and who sees it. It shows only inside a **tile group** (`manage-tile-groups`, which sets membership) assigned to a **launchpad** (`manage-launchpads`, which holds launchpad-wide styling).

## Tools

| Tool | Behavior |
|---|---|
| `list_tiles` | Summaries (`id`, `name`, `title`, `description`, `type`, `package`, `updatedAt`), paged. |
| `get_tile({ id })` | Full record plus `roles`, `tilegroups` (groups containing it), legacy layouts, `i18n`. |
| `save_tile({ tile })` | Create (no `id`) or update. Returns the stored record; `roles` only when you sent them, `tilegroups` on updates — re-read with `get_tile`. |
| `delete_tile({ id, confirm })` | Deletes only with `confirm: true`; without it reports the tile's groups (verified). |

## The `save_tile` contract

An update merges what you send into the stored tile: send `id` plus the fields that change (verified). Every save is validated against the merged record.

| Field | Rules |
|---|---|
| `id` | Omit to create. An unknown id fails with `Tile with id '<id>' not found` (no upsert, verified). **Never send `"id": ""` — it creates a new tile** (verified). |
| `name` | Required: `Tile is missing required fields: Name` (missing, `null` or `""`). Max 64 characters. Not unique — check with `list_tiles` first (verified). |
| `title` | Max 64 characters, also i18n bindings (verified); longer text → `subTitle` / `description`. |
| `package` | Package id; on create without it your editable default package, else none. A nonexistent id fails with `Error saving tile` (verified). |
| `type` | What the tile body shows — see Tile types. `null` / `""` = Default. |
| `actionType` + its target field | What a click does — see Actions. **No target is checked** (verified): confirm apps, web apps, adaptives and tile groups exist first. |
| `roles` | `[{ "id": "<role id>" }]`. Present = replaced, absent = kept, `[]`/`null` = cleared; a nonexistent id fails with `Error saving tile` (verified). |
| `settings` | JSON: `adaptive.id` (Adaptive action), `adaptive.idTile` (Adaptive type), `metric` (image pixel sizes the Cockpit stores). **Replaced as a whole** (verified): send the complete object from `get_tile`. |
| `storeItem` | `{ "mobileClient": "…" }`; other keys dropped (verified). |
| `footer`, `descriptionFormatter`, `helpTextFormatter` | Raw HTML (`footer`) or JavaScript run in every user's browser, unfiltered — only markup and code you trust. |
| Booleans, strings | Real booleans (`"true"` fails); `dataInterval` is a string (a number fails); `browserBlockWin/Mac` ≤ 64 characters (verified). |
| Enums (`type`, `actionType`, `cardWidth`, `cardHeight`, `imageType`) | Exact values below; anything else fails with `Invalid enum value. Expected …, received '<x>' at tile.<field>`; `null` stores `""` (verified). |

**Silently ignored** (verified): `tilegroups` (set membership with `save_tile_group`), `lightTileLayouts` / `darkTileLayouts`, `translation` (deprecated; use i18n bindings), `i18n`, `NAME`, `application`, `accessLevel`, `includeDataInPackage`, `createdBy`, `changedBy`, `ver`, unknown keys. **Leave out** `tileLayoutLight` / `tileLayoutDark` (a value overrides the tile's own fields; `null` clears it), `forceAttributes`, `noInheritTileLayout`, `imagePosition`, `categoryID`.

Locks: `<name> is locked by <user> since <time>` when someone else holds the tile (your own lock passes, verified).

## Content and look

Every Cockpit field, tab by tab, with values: **`reference/settings.md`**. The rules that decide what renders:

- **Precedence**: tile value over the tile group's; a Launchpad Designer value (any scope, `manage-launchpads`) over
  both; a size the end user personalised over everything.
- **Sizes**: `cardWidth` `Skinny` 1, `Narrow` 2, `Small` 4 (default), `Medium` 6, `Wide` 8, `Wider` 12, `Max` all
  columns; `cardHeight` `Tiny`, `Short`, `Normal` (default), `Tall`, `Tower`, `Skyscraper` — minimums (Layout rule 4).
- **Clickable**: `FIORI_STYLE: "X"` = the whole tile opens the action, no buttons (`"-"` = not clickable, empty =
  inherit; `openClickTile: true` beats `"-"`). `Tiny`/`Short` heights and `Skinny`/`Narrow` widths are always clickable
  (verified), so an open button (`openText`, `cardButtonIcon`) needs at least `Small` × `Normal` and an action.
- **Icon**: `icon` = `sap-icon://<name>`, `sap-icon://fas|far|fab/<name>` (verified), `sap-icon://nep/<name>`; without one
  the tile takes its group's `icon`. `cardImage` (40 × 40 px) replaces the font icon; `…Dark` / `…DarkNone` per mode.
- **Image**: `image` + `imageType` — empty = inline below the title, `B` background (removes the card colour), `T` top,
  `N` below the icon, `C` below the details, `U` bottom; **never `X`** (accepted, shows nothing, verified). `imageHeight`
  is the image height (for `B` the card's minimum height); without it inline images take the group's `imageHeight`.
- **Colour**: `backgroundColor`, `titleLevel`, `titleAlignment` are stored but not rendered (verified; full list in the
  reference). Colour a tile via `styleClass` + launchpad CSS `:root .<class> .nepFCard{--sapTile_Background:…;--nepTile_TitleTextColor:…;…}`
  — the whole variable set (reference), with `:root`, or Designer tile colours win (verified).
- **Images are URLs**: Media Library `/media/root/<path>` exactly as named (case-sensitive; **a query string returns
  404**, verified). External `https://` URLs only when the instance's Content Security Policy allows the host.
- **Rich text**: `description` = an HTML subset — use `p`, `span`, `strong`, `em`, `a`, lists, `h2`–`h6`; tags outside the allow-list
  (`reference/settings.md` → Details; e.g. `b`, `i`, `small`, `div`, `button`, `details`) vanish **with their text** (verified). **`footer` (Status) = raw HTML**
  (`details`, `img`, inline `svg`; style your own wrapper class). Enter/Space inside a tile also opens it: guard and
  recipes in `design-to-launchpad` → `reference/techniques.md`.

## What the user asks → what to set

| User says | Set |
|---|---|
| "make the tile wider / a full-width bar" | `cardWidth` (`Wide`, `Max`); same size for a whole section → group `cardWidth` |
| "the whole tile should be clickable, no button" | `FIORI_STYLE: "X"` (or a `Tiny`/`Short`/`Skinny`/`Narrow` size) |
| "the button text is cut off" | shorter `openText` (one line, ends in "…"), a wider tile, or an icon-only button |
| "the title is cut off / shows …" | title wraps to 3 lines then "…": shorten it or widen the tile; a missing title on a `Tiny` tile → Layout rule 5 |
| "open it in a popup / new tab" | `openDialog` (+ `dialogWidth`, `dialogHeight`) / `openWindow` |
| "take it offline for maintenance" | `blackoutEnabled: true`, `blackoutText`, `blackoutDescription` (HTML) |
| "only managers see it" | `roles` |

## Layout rules (apply them while building — a headless build cannot see these defects)

Tables and recipes: `reference/settings.md`.

1. **Rows fill their grid.** Columns by the grid's own width: 4 (≤ 380 px), 8 (381–680, a 390 px phone), 12
   (681–980), 16 (981–1280), 24 (1281–1580). A row is centred only when its spans (`Small` 4, `Medium` 6, `Wide` 8,
   `Wider` 12) fill the columns, at desktop and phone — fix it with the group width (`manage-tile-groups`). An odd count
   of `Small` tiles leaves a lone last tile at 8 columns.
2. **The platform owns the grid.** On `.nepGrid`, `.nepFCardContainer` and `.nepFCard` never set `display`, `width`,
   `min/max-width`, `height`, `position`, `flex`, `grid-template-*`, `grid-auto-*`, `grid-column`, `grid-column-end` or
   `grid-row*` (tiles collapse). Columns and spans change only through the grid variables on a section class (rule 12).
   Inside one tile (scoped to its `styleClass`) CSS may paint, align and position the tile's own parts and your own
   HTML. One grid exception: `grid-column-start` alone on one tile container to centre a row (`reference/settings.md` →
   Allowed).
3. **One-line labels fit**: characters × 0.55 × font size ≤ content width at the narrowest width (`Small` ≈ 268 px in a
   1280 px grid); else shorten, widen or let it wrap. Never force `white-space:nowrap`.
4. **Heights are minimums** (≥ 48 / 80 / 112 / 176 / 240 / 304 px, `Tiny` … `Skyscraper`) and grow with content; only
   the clamps cut text (title 3 lines, subtitle 2). Below `Normal` and at `Skinny`/`Narrow`: no details, status, open
   button, or images except `B`/`C`.
5. **`Tiny` and icons**: a `Tiny` tile with an icon font shows no title unless `ICON_PLACEMENT` is
   `AlignLeft`/`AlignRight` on a `Small`-or-wider tile; an icon image alone does not hide it.
6. **Button-like tiles, left-aligned rows, centred button rows in a band**: recipes in `reference/settings.md`.
7. **Type sizes through the platform variables**: title `--nepH4` (a plain `.sapFCardTitle{font-size}` loses; a
   section-level value skips `Narrow`/`Skinny` tiles), text `TILE_CONTENT_SIZE` (`medium` = 16 px); big numbers `clamp()`.
8. **Consistent rows**: one card treatment (`PLAIN_BACKGROUND` on the group entry), one `cardHeight` for the tallest
   content, one image treatment (a photo on one card: `imageType: "T"` + `imageHeight`).
9. **One left edge**: `TILE_BUTTON_JUSTIFY: "Start"` + `OPEN_BUTTON_REVERSE_ICON: "X"` + `:root .<class> .nepCardActionOpen
   .sapMBtnInner{padding-inline:0}` put title, text and link on one edge (verified).
10. **Every state of every card variant**: also set `--sapTile_Hover_Background`, `--sapTile_Interactive_BorderColor`
    and the `--nepCardButton_Hover_*` / `_Active_*` colours on `:root .<class> .nepFCard`, or the launchpad-wide hover
    colour can hide a label (verified). Links and buttons you add (header, footer, FAQ HTML) need their own hover colours: UI5 links take the theme's `--sapLink_Hover_Color` — on a dark header set
    `:root .nepLaunchpadTopInner{--sapLink_Hover_Color:#ffb35f}` (verified); a plain `:hover{color}` loses — set the
    variable on the container (a filled link: on itself).
11. **Light and dark**: on the tile only `image*Dark*` / `cardImage*Dark*` are per mode; Designer tile settings and
    custom CSS are per mode — repeat them in `dark`. A CSS variant sets background **and** text and icon colours.
12. **Text cards on phones**: ≥ 240 px of text per card at 390 px — four `Small` cards stand two per row there (≈ 110 px
    each). Give the section's Designer entry `GRID_CELLS_SMALL: "4"` (phone grid = 4 columns, spans capped; verified),
    or the CSS variables in `reference/settings.md` → Grid; titles 18 px. Only on sections wider than 680 px (`Medium`+):
    the grid class follows the grid's own width, so a `Small` section would stack on desktop too. Never
    `overflow-wrap:anywhere` or `word-break:break-all` on titles.

## Actions

| `actionType` | Cockpit | Target field(s) |
|---|---|---|
| `A` | Application | `actionApplication` = app **name**; optional `actionParameters`, `urlApplication` (remote system) + `sapICFNode`. |
| `U` | URL | `actionURL`. Any string is stored, including `javascript:` (verified) — only use `https://` URLs you trust. |
| `W` | Web Application | `actionWebApp` = web app **name** (`manage-webapps`). |
| `F` | Adaptive Framework | `settings: { "adaptive": { "id": "<adaptive id>" } }`. |
| `T` | Tile Group | `actiongroup` = tile group id (need not be on the launchpad; a missing group = the click does nothing). |
| `FI` | Fiori Application (Beta) | `actionApplication: "/NEPTUNE/FIORI_TILE_WRAPPER"` (always), `urlApplication` = SAP remote system id, `actionParameters` = JSON string `{"component","appName","navObject","navAction"}`. |
| `""` | none | Display-only tile (no target set). |

How it opens (not `T`): `openFullscreen`, `openWindow`, `openDialog` + `dialogWidth`/`dialogHeight` (default 75 % × 75 %; full screen on tablets and phones).

**Set exactly one target per tile.** The launchpad opens the first target that is set — `actiongroup`, `actionURL`, `actionWebApp`, `actionApplication` — whatever `actionType` says (except `F`); the server stores several (verified). When changing the action, send `null` for the other targets.

## Tile types

`type`: `""` Default, `application` (an app inside the tile: `tileApplication`, `bodyHeight`), `adaptive`
(`settings.adaptive.idTile`), `storeitem` (Client Installation: `storeItem.mobileClient`, no action), `intcard`
(`dataUrl` = Integration Card manifest), `highchart` / `highstock` (`dataUrl` returning Highcharts options,
`dataInterval` seconds as a string). Details: `reference/settings.md` → Settings tab.

## Cockpit tiles

`cockpitTile: true` (a tile for Cockpit tile groups) also requires `navObject`, `navAction` and either `tileApplication` (type `application`) or `title`, `description` and `icon`/`cardImage` (an `image` does not count); the error lists what is missing (verified).

## Workflows

**Create and show**: name free (`list_tiles`) → targets and images exist → `save_tile` → add it to a group with the group's **full** `tiles` array (`manage-tile-groups`) → group on the launchpad → Verify.

```json
save_tile({ "tile": {
  "name": "sales_orders_tile", "package": "<package id>",
  "title": "Sales orders", "subTitle": "Open and blocked orders", "footer": "Updated hourly",
  "icon": "sap-icon://sales-order", "cardWidth": "Wide", "cardHeight": "Normal",
  "styleClass": "brandOrange", "cardButtonIcon": "sap-icon://arrow-right", "cardButtonIconOnly": true,
  "actionType": "A", "actionApplication": "sales_orders", "openFullscreen": true
}})
```

**Delete**: `delete_tile({ id })` reports its groups → confirm with the user → `delete_tile({ id, confirm: true })` → `get_tile` = `Not Found` (verified); it leaves every group.

## Verify (headless first)

1. `get_tile({ id })` — every field you sent is there (missing or different = ignored); exactly one action target.
2. `get_launchpad({ id, includeTiles: true })` lists the tiles of each top-level group in order; for a child, navbar or
   sidebar group use `get_tile` → `tilegroups` and `get_tile_group`.
3. If your client can fetch URLs: each `/media/root/<path>` answers 200 with `image/*` (404 = wrong path, case or a
   query string); `/launchpad/<name>` answers 200 (login page), 500 = a group with a broken order (verified).
4. Pixels need a browser: the review in `design-to-launchpad` → Verify step 3.

## Listing and filtering

Filter and sort on `name`, `title`, `subTitle`, `description`, `type`, `actionType`, `actionApplication`, `actionWebApp`,
`roleTag`, `tags`, `package`, `cockpitTile`, `blackoutEnabled`, `ver`, `createdBy`, `changedBy`, `createdAt`, `updatedAt`
(other `where` keys are dropped: the list comes back unfiltered, verified). Paging: `order` with its field in `select`
(else `Error listing tile`), `skip` = `nextSkip` while `hasMore`, `take` ≤ 200.

## Errors

| Signal | Meaning / fix |
|---|---|
| `Tile is missing required fields: <list>` | `Name` missing, or Cockpit-tile fields missing. |
| `Tile with id '<id>' not found` | `save_tile` with an unknown id (also the id of another artifact). |
| `Error saving tile` | A role or package id that does not exist. Nothing saved. |
| `Tile '<name>' is assigned to 2 tile groups (A, B). Re-run with confirm set to true to delete it.` | `delete_tile` without `confirm` (also `… is not assigned to any tile group …`). Nothing deleted. |
| `Not Found` | `get_tile` / `delete_tile` with an unknown or already deleted id, with or without `confirm`. |
| `MCP error -32602: … at tile.<field>` | Wrong type, enum value, non-UUID id, or `name` / `title` over 64 characters. |
| `Error listing tile` | `order` on a field not in `select`, or a malformed filter value. |
| `Package is a required field` / `No edit access to artifact` / `Your default package cannot be used: …` | Send a package you may edit. `Access denied: no permission for tile` = missing permission. |

## What MCP can NOT do

- Put a tile into a group or onto a launchpad from the tile side (`save_tile_group`, `save_launchpad`).
- Colour or size a tile's title from tile fields — Launchpad Designer or CSS on `styleClass` (`manage-launchpads`).
- Check that a target (app, web app, adaptive, group, remote system, image) exists or a URL is safe.
- Give a tile an exact height, or override a size the end user personalised.
- Render the launchpad (Verify step 4); edit the deprecated translations.

## Permissions

All four tools need the Tile permission (`tile`): list with any access, get `Get`, save `Save`, delete `Del`. Packages with roles also need package edit access. At runtime a tile with roles is shown only to users who have one of them; roles of its tile group apply as well.

## Related skills

`manage-tile-groups` (membership, order, group defaults) · `manage-launchpads` (assignment, Launchpad Designer, custom
CSS) · `design-to-launchpad` (a design as a launchpad) · `manage-media` / `upload-files` (images) · `manage-apps`,
`manage-webapps`, `manage-adaptive` (targets).
