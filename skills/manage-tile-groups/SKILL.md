---
name: manage-tile-groups
description: Create, fill, order, nest, style, list or delete Neptune DXP tile groups — the titled sections of a launchpad that hold tiles and child tile groups — via the MCP tools `list_tile_groups`, `get_tile_group`, `save_tile_group`, `delete_tile_group`. Use when the user wants to add a section to a launchpad, put tiles into a group or reorder them, nest groups, add a navbar or sidebar column, set a group header image, a message strip, the group width or the tile size for all its tiles, restrict a group with roles, see which launchpads use a group, or remove one. Trigger phrases include "create a tile group", "add these tiles to the group", "reorder the tiles", "child tile group", "navbar group", "sidebar group", "group header image", "tile group message", "which launchpads use this group", "delete the tile group". Read this BEFORE any `save_tile_group` payload — `tiles` and `tilegroups` replace the whole assignment, and the `*Order` fields must never be sent.
---

# Managing Neptune DXP tile groups via MCP

A **tile group** (Cockpit: Tile Group) is a section of a launchpad: a header (title, subtitle, optional header image and message) above a grid of **tiles**. A launchpad shows each of its assigned groups (`save_launchpad` → `cat`, `manage-launchpads`) as its own screen with a menu entry; a group's **child tile groups** (`tilegroups`) render as further sections below its header on the same scrolling page — so several sections on one page = one group with children. A group without a tile the user can see (directly or in a child tile group) gets no menu entry and is not rendered (verified). A tile's own content, action and look belong to `manage-tiles`; launchpad-wide styling (colours, fonts) is set in the Launchpad Designer settings (`manage-launchpads`).

## Tools

| Tool | Behavior |
|---|---|
| `list_tile_groups` | Summaries `id`, `name`, `title`, `description`, `package`, `updatedAt`, paged (verified). See Listing. |
| `get_tile_group({ id })` | Full record. `tiles`, `tilegroups`, `navbarGroups`, `sidebarGroups` **in display order** as full rows (large — a 4-tile group can return ~140k characters); `roles`; `pad` = launchpads that list the group; `childgroups` = parent groups containing it; `childNavbarGroups` / `childSidebarGroups` = groups that show it as navbar / sidebar group; `i18n` (verified). |
| `save_tile_group({ tileGroup })` | Create (no `id`) or update. Returns the stored record. |
| `delete_tile_group({ id, confirm? })` | Deletes. A group that still has tiles or child groups needs `confirm: true` (see Delete). |

## The `save_tile_group` contract

An update merges what you send into the stored group: send `id` plus the fields that change (verified).

| Field | Rules |
|---|---|
| `id` | Omit to create. **An `id` that does not exist creates a new group with that id** (verified) — no "not found", and such a create gets no default package. Take ids from `get_tile_group` / `list_tile_groups` only. |
| `name` | Max 1024. **Always send it on create** — the server accepts a group without one (verified). Not unique. |
| `title`, `subTitle`, `menuText` | Max 256 each (verified); i18n bindings allowed. |
| `package` | Package id; on create without it your editable default package, else none. |
| `tiles` | `[{ "id": "<tile id>" }]` in display order. **Present = replaces the whole list, absent = untouched, `[]` = empty** (verified). A nonexistent tile id fails with `Error saving category`, nothing changed (verified). Send each id once — a duplicate is accepted and leaves the stored order out of step (verified). |
| `tilegroups` | Child groups, `[{ id }]` in display order; same replace rule. **A nonexistent id is dropped silently** (verified) — compare the response with what you sent. Cycles (a group inside itself) are not refused (verified): never create one. |
| `navbarGroups`, `sidebarGroups` | Groups shown in a navbar column (left) or sidebar column (right) next to this group, `[{ id }]` in order; same replace rule. A nonexistent id fails the save with `Error saving category` (verified; unlike `tilegroups`). |
| `roles` | `[{ "id": "<role id>" }]`; present = replaced, absent = kept, `[]` = cleared; a nonexistent id fails with `Error saving category` (verified). |
| `configMessage` | `{ type, text, icon, action, showCloseButton, showIcon }` — `type` `Error`, `Information`, `Success`, `Warning`, `None`; `text` simple HTML; `action` a URL. Shown while `enableMessage` is `true`. **One value: send the complete object** (`{ "text": "…" }` alone drops the rest, verified). Remove: `enableMessage: false` + `configMessage: {}` (`null` fails, verified). **`formatter` is dropped** (verified), so any `configMessage` save deletes a formatter set in the Cockpit. |
| `translation` | Deprecated; use i18n bindings in `title` / `subTitle`. |
| `tilesOrder`, `tilegroupsOrder`, `navbarGroupOrder`, `sidebarGroupOrder` | **Never send these** — the order comes from the relation arrays. Sent alone they break `get_tile_group` (`Error fetching category`) and, for tiles/child groups, the launchpad page (HTTP 500) until you re-send the matching array (verified; Repair). |

Silently ignored (verified): `pad` (assign groups to launchpads with `save_launchpad`), `childgroups`, `childNavbarGroups`, `childSidebarGroups`, `i18n`, `NAME`, `application`, `accessLevel`, `includeDataInPackage`, `createdBy`, `changedBy`, `ver`, and unknown keys.

Locks: `<name> is locked by <user> since <time>` when someone else holds the group (your own lock passes, verified).

## What a tile group shows

Every Cockpit field, tab by tab, with values: **`reference/settings.md`**. Group values lose to Launchpad Designer
values (`manage-launchpads`). The rules that decide what renders:

- **Header**: `title` (H2) and `subTitle` (H3), each one line (Layout rule 2); `hideHeader: true` hides title, subtitle
  and header image; `menuText` replaces the title in menus, `hideFromMenu: true` keeps the group out of them; `inclFav:
  true` adds a Favorites tile first (verified).
- **Header image**: `image` / `imageDark` / `imageDarkNone`, `imageHeight` (minimum header height; also the default
  height of inline tile images), placement/repeat/size, and the same set for tablet (`imageTablet*`) and mobile
  (`imageMobile*`). A Designer header image wins over these fields.
- **Width**: `cardContentWidth` (`Full`, `XXXLarge` 2360 px, `XXLarge` 1880, `XLarge` 1580, `Large` 1280, `Medium` 980,
  `Small` 680, `XSmall` 350, …) caps header and tiles together and sets the grid's column count; `cardContentAlign`
  (`Left`, `Center` default, `Right`) moves the capped group (verified classes). Layout rule 1.
- **Defaults for its tiles**: `cardWidth`, `cardHeight`, `icon` (API only) for tiles without their own value (size
  verified); `cardPerRow` (Tiles/Row: `One`, `Few`, `More` default, `Many`) = grid density; `FIORI_STYLE` /
  `openClickTile` = clickable tiles.
- **Free text**: `cardContentWidth`, `cardContentAlign`, `cardPerRow`, `cardWidth`, `cardHeight` are stored as sent
  (max 64): a misspelt value breaks the layout (verified). Navbar/sidebar widths and fits are validated enums.
- **CSS hook**: `styleClass` sits on the container holding header, message and tiles (verified).
- **Not rendered**: `description`, `backgroundColor`, `headColor` and the other fields listed in the reference; header
  colours and title size come from the Designer or CSS. Leave the legacy layout fields out.

## What the user asks → what to set

| User says | Set |
|---|---|
| "centre the cards under the heading" | group width whose column count equals the row's tile widths (`cardContentWidth: "Large"` for four `Small` tiles) — Layout rules |
| "the heading runs off the screen / is cut" | shorter `title`, or the header wrap CSS (Layout rules) |
| "all tiles in this section the same size" | group `cardWidth` / `cardHeight` (tiles without their own size follow) |
| "one tile per row" / "more tiles per row" | `cardPerRow: "One"` / `"Many"` |
| "make this section narrower / left-aligned" | `cardContentWidth` + `cardContentAlign` |
| "a banner image above the section" | `image` (+ `imageDark`), `imageHeight`, tablet/mobile variants |
| "a notice above the tiles" | `enableMessage: true` + complete `configMessage` |
| "hide the section title" / "keep it out of the menu" | `hideHeader: true` / `hideFromMenu: true` |
| "a column of links next to the section" | `navbarGroups` / `sidebarGroups` (+ width, fit) |
| "only managers see this section" | `roles` |

## Layout rules (apply them while building)

1. **Centring a row**: grid columns by grid width — 4 (≤ 380 px), 8 (381–680, a 390 px phone), 12 (681–980), 16
   (981–1280, the default desktop content width), 24 (1281–1580). Tiles fill from the left, so four `Small` tiles (16
   columns) sit left under a centred heading in a 24-column grid. Set the group width whose column count equals the
   row's spans (`Large` for four `Small`, `Medium` for three) or change the tile widths; check the phone (8 columns: an
   odd count of `Small` tiles leaves the last alone). **A group width only narrows**: the grid is the smaller of the
   group cap and the content column (Designer `SHELL_WIDTH`, default 1280 px) — `XLarge` for four `Medium` needs
   `SHELL_WIDTH` `XLarge` or wider (verified live). `cardContentAlign` / `GRID_ALIGN` only move a capped group; a
   launchpad-wide Designer `GRID_WIDTH` / `TILES_PR_ROW` beats the group field. Never re-lay-out `.nepGrid` with CSS.
   A centred row of buttons in a full-width band: `manage-tiles` → Layout rule 7.
2. **Headings never wrap**: title and subtitle are one line — left-aligned they end in "…"; centred (Designer
   `HEAD_TEXT_ALIGN: "center"`) a title wider than the group starts at the left edge and runs off the right side
   (verified live). Keep them within the phone budget (≈ 330 px: characters × 0.55 × font size) or add to the launchpad
   CSS (both modes): `:root .<group styleClass> .nepCatTitle.sapMTitle,:root .<group styleClass> .nepCatSubTitle.sapMTitle{white-space:normal;max-width:100%;text-align:center}`.
3. **Header heights are minimums**: set tablet and mobile heights too (`imageTabletHeight` / `imageMobileHeight`, or
   `HEAD_TAB_HGT` / `HEAD_MOB_HGT`), otherwise the desktop minimum also applies on phones (`auto` when the header holds
   text).
4. **Consistent rows**: `cardHeight` once on the group, Designer `PLAIN_BACKGROUND` on the group entry (`"X"` only when
   no tile is a card), one CSS variant class (`manage-tiles` → Layout rule 8).
5. **Light and dark**: only the header images (`image*Dark*`) are per mode on the group; Designer header/grid keys and
   the custom CSS are per mode — repeat them in `dark` (`manage-launchpads`).

## Workflows

**Create a section with tiles**: create or pick the tiles (`manage-tiles`) → `save_tile_group({ "tileGroup": { "name": "…", "title": "…", "package": "<id>", "tiles": [{ "id": "…" }, { "id": "…" }] } })` → check `tiles` in the response (order, count) → assign it to the launchpad with `save_launchpad` and the **full** `cat` array, or add it to a parent group's `tilegroups` for a section on the same page.

**Add, remove or reorder**: `get_tile_group` → take `tiles[].id` in order → change the list → `save_tile_group({ "tileGroup": { "id": "…", "tiles": [ …full list… ] } })` → re-read. Same for `tilegroups`, `navbarGroups`, `sidebarGroups`.

**Repair a group that fails to load** (`Error fetching category`): re-send the relation array that matches the `*Order` field that was sent (`tiles` for `tilesOrder`, `tilegroups` for `tilegroupsOrder`, …) with its full ordered list, and nothing else — `get_tile` lists the groups a tile is in if you need to rebuild `tiles` — then `get_tile_group` (verified).

**Delete**: `get_tile_group` → if `tiles` or `tilegroups` is non-empty, or `pad`, `childgroups`, `childNavbarGroups` or `childSidebarGroups` is non-empty, name them and get the user's confirmation → `delete_tile_group({ id, confirm: true })` → `get_tile_group` returns `Not Found`.

## Verify (headless first)

1. `get_tile_group({ id })` succeeds and returns the fields and relation arrays you sent — missing or different = ignored; `Error fetching category` = broken group (Repair).
2. `get_launchpad({ id, includeTiles: true })` (`manage-launchpads`) shows the top-level groups in order with their tiles and child-group references; check a child, navbar or sidebar group with `get_tile_group` on its parent (`tilegroups`, `navbarGroups`, `sidebarGroups`).
3. Header images and the launchpad page: the HTTP checks in `manage-tiles` → Verify (500 = broken tile or child-group order; a broken navbar/sidebar order still answers 200 — step 1 catches it).
4. Pixels: signed-in browser if available, screenshot, compare, move on. Look for: a heading cut off or spilling past the screen edge, a row of tiles not centred under its heading, a lone last tile at phone width, mixed card styles or heights in one row, unreadable headers in dark appearance.

## Delete

- Without `confirm`, a group with tiles or child groups is refused: `Tile group '<name>' still has 1 assigned tile. Re-run with confirm set to true to delete it anyway.` (also `… 1 child tile group …`, verified). Nothing is deleted.
- **An empty group is deleted at once without `confirm`** (verified) — even when launchpads (`pad`), parent groups (`childgroups`), groups that show it as navbar/sidebar (`childNavbarGroups` / `childSidebarGroups`) or tiles (`actiongroup`) still point to it. It disappears from those launchpads and groups without warning; a tile whose action opens it keeps the dangling id.
- Tiles and child groups survive; only their membership is removed (verified).
- Success: `Tile group '<id>' deleted`. An unknown id: `Not Found`, with or without `confirm` (verified).

## Listing and filtering

Filterable and sortable: `name`, `title`, `description`, `roleTag`, `package`, `cockpitTileGroup`, `inclFav`, `ver`, `createdBy`, `changedBy`, `createdAt`, `updatedAt`. `select` also takes `subTitle`, `menuText`, `icon`, `backgroundType`, `id`; other keys are dropped (verified). Paging, `order` and dropped `where` keys work as in `manage-tiles` → Listing. Contents, roles and launchpads are not in the list — `get_tile_group` each candidate.

## Errors

| Signal | Meaning / fix |
|---|---|
| `Error saving category` | A tile, navbar/sidebar group, role or package id that does not exist, or `configMessage: null`. Nothing saved; confirm ids with their `get_*` tools. |
| `Error fetching category` | From `get_tile_group`, or `get_launchpad` with `includeTiles`: an `*Order` field was sent without its relation array. Repair. The launchpad page answers HTTP 500 while `tiles` or `tilegroups` is affected; a broken navbar/sidebar order only drops that column. |
| `Tile group '<name>' still has … Re-run with confirm set to true …` | Delete refused; see Delete. |
| `Not Found` | `get_tile_group` / `delete_tile_group` with an unknown id. |
| `MCP error -32602: … at tileGroup.<field>` | Wrong type, enum value, non-UUID id, or a string over its maximum length. Nothing saved. |
| `Error listing category` | `order` on a field not in `select`, or a malformed filter value. |
| `Package is a required field` / `No edit access to artifact` / `Your default package cannot be used: …` | Send a package you may edit. |
| `Access denied: no permission for category` | Missing Tile Group permission. |

## What MCP can NOT do

- Assign a group to a launchpad from the group side (`save_launchpad` → `cat`), or set launchpad-wide colours and fonts (`manage-launchpads`).
- Mark a group as a Cockpit tile group safely: `cockpitTileGroup: true` is accepted, but a Cockpit group without roles shows its tiles to every Cockpit user — do it in the Cockpit.
- Render the launchpad: pixels need a signed-in browser (Verify).
- Warn about cycles, dropped child ids or an empty group that is still used — check with `get_tile_group`.
- Set or keep a message-text formatter: `configMessage.formatter` is dropped, and a `configMessage` save deletes one set in the Cockpit.
- Make a group wider than the launchpad content column (Designer `SHELL_WIDTH`, `manage-launchpads`).
- Align or style the group header from group fields — header alignment, colours and text size are Launchpad Designer keys or custom CSS (`manage-launchpads`).

## Permissions

All four tools need the Tile Group permission (`category`): list with any access, get `Get`, save `Save`, delete `Del`. Packages with roles also need package edit access. At runtime a group with roles is shown only to users who have one of them; roles on a group apply to its tiles.

## Related skills

- **`manage-tiles`** — the tiles in a group: content, size, icon, images, action; the HTTP image and launchpad-page checks.
- **`manage-launchpads`** — assign groups to a launchpad (`cat`, in order), Launchpad Designer settings and custom CSS.
- **`design-to-launchpad`** — rebuild a design or website as a launchpad, end to end.
- **`manage-media`** / **`upload-files`** — upload header images; use the `/media/root/<path>` URL.
- **`dxp-overview`** — packages, roles and the artifact model.
