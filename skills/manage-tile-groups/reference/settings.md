# Tile group settings: every Cockpit field, its `save_tile_group` key, and the layout rules

The Cockpit **Tile Group** editor, tab by tab, with the `save_tile_group` key for each field (top-level fields of
`tileGroup` unless a path is shown). "API only" = not offered by the Cockpit editor but read by the launchpad.

## Settings tab

| Cockpit label | Key | Values and effect |
|---|---|---|
| Name | `name` | Send it on create (the server accepts a group without one). Max 1024. |
| Package | `package` | Package id. |
| Hide Tile Group Header | `hideHeader` | `true` hides title, subtitle and header image. |
| Hide from All Menus | `hideFromMenu` | `true` keeps the group out of every launchpad menu. |
| Include Favorite Tiles | `inclFav` | `true` adds a Favorites tile first. |
| Role Tag | `roleTag` | A label for Cockpit lists and filters; the launchpad does not use it. |
| Set Tile Group as Cockpit Tile Group | `cockpitTileGroup` | Cockpit group; do this in the Cockpit (SKILL.md → CANNOT). |

## Information tab

| Cockpit label | Key | Values and effect |
|---|---|---|
| Title | `title` | Header title, max 256, **one line** (no wrap) — see Header text below. |
| Subtitle | `subTitle` | Header subtitle, one line. |
| Menu Text | `menuText` | Replaces the title in launchpad menus. |
| Description (Deprecated) | `description` | Not shown. |
| Message → Enable Message | `enableMessage` | Shows the message strip. |
| Message → Type / Text / Custom Icon / Open Action / Show Close Button / Show Icon | `configMessage.type` / `.text` / `.icon` / `.action` / `.showCloseButton` / `.showIcon` | One object, replaced whole. `type`: `Error`, `Information`, `Success`, `Warning`, `None`. `text` may hold simple HTML. |
| Message text formatter (button next to the message Text) | `configMessage.formatter` | Optional JavaScript that builds the shown message from the values bound in `text`; its parameters are the placeholders with every character other than letters, digits, `_` and `$` replaced by `_`. Without a formatter the placeholders are bound directly. It runs in every user's browser, unfiltered — only code you trust. Part of `configMessage`: send it with the rest of the object. |

## Tiles, Tile Groups, Multi Column tabs

| Cockpit label | Key | Values and effect |
|---|---|---|
| Tiles | `tiles` | `[{ id }]` in display order; replaces the list. |
| Tile Groups | `tilegroups` | Child groups `[{ id }]`, shown as sections below the header. |
| Navbar Groups / Sidebar Groups | `navbarGroups` / `sidebarGroups` | Columns left / right of the group. |
| Navbar Width / Sidebar Width | `navbarWidth` / `sidebarWidth` | `XXSmall` (1×), `XSmall` (2×), `Small` (4×, default), `Medium` (8×). |
| Navbar Fit / Sidebar Fit | `navbarFit` / `sidebarFit` | `Shrink` (default), `WrapAbove`, `WrapBelow` (the Cockpit offers the sidebar only `Shrink` and `WrapBelow`). |

## Appearance → Tile Group

| Cockpit label | Key | Values and effect |
|---|---|---|
| CSS Style Class | `styleClass` | Class on the container holding the header, message and tiles. |
| Tile Group Width | `cardContentWidth` | `Full`, `XXXLarge` (2360 px), `XXLarge` (1880), `XLarge` (1580), `Large` (1280), `Medium` (980), `Small` (680), `XSmall` (350), `XXSmall` (200), `XXXSmall` (100); empty = the content width. Free text: a misspelt value is stored and breaks the layout. |
| Tile Group Alignment | `cardContentAlign` | `Left`, `Center` (default), `Right` — moves the whole group; visible only when a width is set. |
| Header Height | `imageHeight` | CSS min height of the header (also the default height of inline images in the group's tiles). |
| Light / Dark Appearance Header Image | `image` / `imageDark` | Image URL; `"none"` = no image. |
| Do NOT inherit light appearance header image | `imageDarkNone` | `true` = no header image in dark appearance. |
| Background Placement / Repeat / Size | `imagePlacement` / `imageRepeat` / `imageSize` | `center center`, `left top`, …; `no-repeat`, `repeat`, `repeat-x`, `repeat-y`; `cover`, `auto`, `contain`. |
| Tablet Header Image (height, light, dark, no-inherit, placement, repeat, size) | `imageTabletHeight`, `imageTablet`, `imageTabletDark`, `imageTabletDarkNone`, `imageTabletPlacement`, `imageTabletRepeat`, `imageTabletSize` | Tablet-width header; unset values follow the desktop ones. |
| Mobile Header Image (same seven) | `imageMobileHeight`, `imageMobile`, `imageMobileDark`, `imageMobileDarkNone`, `imageMobilePlacement`, `imageMobileRepeat`, `imageMobileSize` | Phone-width header. |

## Appearance → Tiles (defaults for the group's tiles)

| Cockpit label | Key | Values and effect |
|---|---|---|
| Clickable Tiles | `FIORI_STYLE` | `"X"` every tile clickable, `"-"` not, `""` inherit. |
| Clickable Tiles (checkbox, shown only when already set) | `openClickTile` | `true` = clickable for this group and its child groups; beats a tile's `"-"`. |
| Tiles/Row | `cardPerRow` | Density `One`, `Few`, `More` (default), `Many` — the column count of the grid (Grid below). |
| Width (Column Span) / Height (Row Span) | `cardWidth` / `cardHeight` | Size of every tile without its own size (tile values win). |
| — (API only) | `icon` | Default icon of tiles without their own icon. On `Tiny` tiles an inherited icon hides the title (`manage-tiles`). |

**Stored but never rendered**: `description` (deprecated), `backgroundType`, `backgroundColor`, `headColor`,
`headTxtClr`, `subheadTxtClr`, `headBorderClr`, `headBorderWidth`, `cardStyle`, `imageCover`, `imageTabletCover`,
`imageMobileCover`, the `*HeightMedia` fields, `tileBackgroundHeight`, `enableScroll`, `enableShadeCalc`,
`enableFullScreen`, `numTiles`, `type`, `sort`, `roleTag`.

## Tile Group Layout / Tile Layout tabs (legacy layouts)

`lightGroupLayouts`, `darkGroupLayouts`, `lightTileLayouts`, `darkTileLayouts`, `groupLayoutLight/Dark`,
`tileLayoutLight/Dark`, `forceGroupAttributes`, `forceTileAttributes`, `noInheritGroupLayout`, `noInheritTileLayout`
belong to the legacy layouts, which the Launchpad Designer replaces — leave them out.

## Role, Translation, Where-used tabs

`roles` (`[{ id }]`) · `translation` deprecated (use i18n bindings) · Where-used = `get_tile_group` → `pad`,
`childgroups`, `childNavbarGroups`, `childSidebarGroups`.

## Grid: centring a row of cards under its heading

The tiles sit in a grid of equal columns; the column count follows the grid width and the density (table in
`manage-tiles` → `reference/settings.md` → Grid). The grid width is the smaller of the group's width cap and the launchpad
content column (Designer `SHELL_WIDTH`, default `Large` = 1280 px; `XLarge` = 1580 px, `Full` = the window). Tiles fill from the left and unused columns stay empty on the right.
The heading is centred across the **whole group width** (Designer `HEAD_TEXT_ALIGN: "center"`), so a row whose spans do
not fill the columns looks left-aligned under a centred heading (four `Small` cards in a 24-column grid use 16
columns).

| Setting | What it does |
|---|---|
| `cardContentWidth` / Designer `GRID_WIDTH` | Caps the group (header + tiles) at that width and centres it. Fewer pixels → fewer columns. |
| `cardContentAlign` / Designer `GRID_ALIGN` | `Left` / `Center` / `Right` position of the capped group. No effect without a width. It never moves tiles inside the grid. |
| `cardPerRow` / Designer `TILES_PR_ROW` | Column count per width (`One`: every tile fills the row, `Skinny` and `Narrow` included). |
| tile `cardWidth` | Columns one tile spans. |

A Launchpad Designer value beats the group field, also a launchpad-wide one: when the launchpad's Designer sets
`GRID_WIDTH`, `GRID_ALIGN` or `TILES_PR_ROW` for all groups, change one group with a Designer entry for that group
(`manage-launchpads`), not with the group field.

**To centre a row**: make its spans equal the column count — set the group width that gives that count (four `Small`
→ `cardContentWidth: "Large"`, three `Small` → `"Medium"`), or change the tile widths. A group width only narrows the
grid: it is the smaller of the group cap and the content column, so four `Medium` in an `XLarge` group need Designer
`SHELL_WIDTH` `XLarge` or wider (on a default launchpad an `XLarge` group still gets the 16-column `nepGridLarge`). Do
not try `justify-content` on the grid: the columns always fill the full width. Narrower screens drop to fewer columns
and wrap the row, which is expected.

## Header text

The title and subtitle are one-line texts. Left-aligned (the default) a long title ends in "…" at the group width.
**Centred with `HEAD_TEXT_ALIGN: "center"`, a title wider than the group starts at the group's left edge and runs off
the right side** (measured at 390 px: text 16–928 px in a 16–374 px group). Keep titles and subtitles within the group width at **phone width** (about 330 px of text:
characters × 0.55 × font size), or let them wrap with the launchpad custom CSS (`manage-launchpads`, `CUSTOM_CSS`, both modes):
`:root .<group styleClass> .nepCatTitle.sapMTitle, :root .<group styleClass> .nepCatSubTitle.sapMTitle{white-space:normal;max-width:100%;text-align:center}`
(drop the `.<group styleClass>` part to apply it to every group). The group has no header-alignment field; header
alignment, colours and text size come from the Designer tile group keys (`HEAD_TEXT_ALIGN`, `HEAD_TEXT_CLR`,
`HEAD_TEXT_LEVEL`, …).

## Header heights per device

`imageHeight` (and the Designer `HEAD_HGT`) is a minimum height. Set the tablet and mobile heights too
(`imageTabletHeight`, `imageMobileHeight`, or `HEAD_TAB_HGT`, `HEAD_MOB_HGT`; `auto` when the header holds text) —
otherwise the desktop minimum also applies on phones.

## Rows look consistent

A tile group is one visual row (or rows) of one kind of element: set the shared look **on the group**, not per tile —
`cardHeight` (or Designer `TILE_HEIGHT`) once for all tiles, Designer `PLAIN_BACKGROUND` on the group entry (`"X"`
only when none of the tiles should look like a card, e.g. a statistics band), one CSS variant class for all tiles. If
one tile must differ (a report card with a photo among icon cards), keep it a card of the same height with the image
on top (`manage-tiles` → Rows look consistent).

## Light and dark

| Mode-specific (group fields) | Mode-independent |
|---|---|
| `image` / `imageDark` / `imageDarkNone` and the tablet and mobile variants | everything else (texts, width, alignment, density, tile defaults, message, columns) |

The Designer tile group keys (header colours, `HEAD_TEXT_ALIGN`, grid keys, header images) and the custom CSS are
stored per mode (`config.designer.light` / `.dark`): in dark appearance only the `dark` bucket applies. Repeat them in
`dark` with dark-appropriate colours, or the dark launchpad shows theme-default headers (left-aligned, theme colours)
and none of the CSS fixes. Give a header image with text or dark lines an `imageDark` (or `imageDarkNone: true`).
