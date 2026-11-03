# Tile settings: every Cockpit field, its `save_tile` key, and the layout rules

The Cockpit **Tile** editor, tab by tab, with the `save_tile` key for each field. All keys are top-level fields of
`tile` unless a path is shown. "API only" = not offered by the Cockpit editor but read by the launchpad.

## Settings tab

| Cockpit label | Key | Values and effect |
|---|---|---|
| Name | `name` | Required, max 64, not unique. |
| Package | `package` | Package id. |
| Type | `type` | `""` Default; `application` (app inside the tile: `tileApplication`, a size, `bodyHeight`); `adaptive` (`settings.adaptive.idTile`); `storeitem` (Client Installation: `storeItem.mobileClient`, no action); `intcard` (Integration Card: `dataUrl` = instance-relative path returning a UI5 Integration Card manifest, `bodyHeight`); `highchart` / `highstock` (`dataUrl` returning Highcharts options with `series`, called with `?init=start\|continue`; `dataInterval`; `bodyHeight`, default 400px). |
| Mobile Client | `storeItem.mobileClient` | Type `storeitem` only; `storeItem` keeps no other key. |
| Content Height | `bodyHeight` | CSS height of the embedded panel (application, integration card, charts; charts default 400px). |
| Application | `tileApplication` | Type `application`: App Designer app name. |
| Adaptive Framework | `settings.adaptive.idTile` | Type `adaptive`: adaptive id. `settings` is replaced as a whole — it also holds `settings.metric` (image pixel sizes the Cockpit stores; the icon image's max width with `Align*` placement), so re-send it from `get_tile`. |
| Data URL | `dataUrl` | Types `intcard`, `highchart`, `highstock`. |
| Poll Interval in Seconds | `dataInterval` | A **string** of seconds (`"30"`; the Cockpit offers 0–3600); charts only. |
| Hide Tile on Desktop / Tablet / Phone | `hideTileDesktop`, `hideTileTablet`, `hideTileMobile` | `true` = the tile is not built on that device class. |
| Hide Launchpad Header On Desktop / Tablet / Phone | `hideHeaderL`, `hideHeaderM`, `hideHeaderS` | `true` = the launchpad header is hidden while this tile's app is open (a pull-down gesture shows it again). |
| Cockpit Tile | `cockpitTile` | Marks a Cockpit tile and adds required fields (SKILL.md → Cockpit tiles). |

## Information tab

| Cockpit label | Key | Values and effect |
|---|---|---|
| Title | `title` | Max 64. Wraps to at most **3 lines**, then ends in "…". i18n binding `{i18n.<model>>key}`. |
| Subtitle | `subTitle` | Wraps to at most **2 lines**, then "…". Hidden on `Tiny` tiles that have a title or an icon font, and on `Short` tiles that have both (an icon image does not count). |
| Details | `description` (+ `descriptionFormatter`) | Plain text or an HTML subset (UI5 FormattedText): `p` `br` `strong` `em` `u` `s` `span` `a` (`href` `target` `title`) `ul` `ol` `li` `dl` `dt` `dd` `h1`–`h6` `blockquote` `code` `pre` `abbr` `cite` `bdi`, attributes `class`, `style`, `dir`. Other elements are removed **together with their text** (verified: `b`, `i`, `small`, `sub`, `sup`, `div`, `button`, `details`/`summary`); `svg` loses its tags while its text stays. Write `strong`/`em`/`span` instead. Size: Designer `TILE_CONTENT_SIZE`. Hidden on `Tiny`, `Short`, `Skinny`, `Narrow`. The formatter is JavaScript run in every user's browser for `{model>path}` parts. |
| Status | `footer` | **Raw HTML, rendered unfiltered** inside `<span class="sapFCardStatus">` (verified: `details`/`summary`, inline `svg`, `div` with classes) — any markup, so only trusted authors, never user-supplied text. Right-aligned by default and platform rules on `.sapFCardStatus` win: wrap your markup in your own class and style that. Hidden on `Tiny`, `Short`, `Skinny`, `Narrow`. |
| Tags | `tags` | Comma-separated string (`"sales,orders"`); offered upper-cased as search tag filters, not shown on the tile. |
| Role Tag | `roleTag` | A label for Cockpit lists and filters; the launchpad does not use it. |
| Open Button Text | `openText` | One line; a longer text ends in "…" at the button width. Empty = the default "Open" text. |
| Open Button Icon | `cardButtonIcon` | `sap-icon://…`. |
| — (API only) | `cardButtonIconOnly` | `true` = icon-only button, but only while `openText` is empty; set `cardButtonIcon` too, otherwise the button is blank. |

The open button exists only on a tile that has an action and is not clickable (see Appearance).

## Action tab

| Cockpit label | Key | Values and effect |
|---|---|---|
| Type | `actionType` | `A` Application, `U` URL, `W` Web Application, `F` Adaptive Framework, `T` Tile Group, `FI` Fiori Application (Beta), `""` none. |
| Adaptive Framework → Name | `settings.adaptive.id` | Action `F`. |
| Remote System → System / SAP SICF Node | `urlApplication` / `sapICFNode` | Actions `A` and `FI`: remote system id and SICF node. |
| Application → Name / Start Parameters | `actionApplication` / `actionParameters` | Action `A`: app name; start parameters. |
| Web Application → Name | `actionWebApp` | Action `W`. |
| Fiori Application → Application Name / Start Parameters | `actionApplication: "/NEPTUNE/FIORI_TILE_WRAPPER"` + `actionParameters` JSON | Action `FI` (SKILL.md → Actions). |
| URL | `actionURL` | Action `U`. |
| Tile Group → Name | `actiongroup` | Action `T`: tile group id. |
| How to Open: Open Fullscreen / Open in New Tab/Window / Open in Dialog (+ width, height) | `openFullscreen`, `openWindow`, `openDialog`, `dialogWidth`, `dialogHeight` | Not for `T`. Dialog default 75 % × 75 % of the window; full screen on tablets and phones. |

## Size tab

| Cockpit label | Key | Values and effect |
|---|---|---|
| Width (Column Span) | `cardWidth` | `Skinny` 1, `Narrow` 2, `Small` 4 (default), `Medium` 6, `Wide` 8, `Wider` 12, `Max` (whole row) columns — see Grid below. |
| Height (Row Span) | `cardHeight` | `Tiny`, `Short`, `Normal` (default), `Tall`, `Tower`, `Skyscraper` — see Heights below. |

A size on the tile wins over the tile group's size; a Launchpad Designer size (`BACK_WIDTH`, `TILE_HEIGHT`) wins over both; a size the end user picks in the launchpad (personalisation) wins over everything.

## Icon tab

| Cockpit label | Key | Values and effect |
|---|---|---|
| Tile Icon Font | `icon` | `sap-icon://<name>`, `sap-icon://fas/<name>` (also `far`, `fab`), `sap-icon://nep/<name>`. Colour follows the theme in light and dark. Without one the tile takes its tile group's `icon`. |
| Tile Icon Image – Light Appearance | `cardImage` | Image URL, shown 40 × 40 px by default, instead of the icon font. |
| Tile Icon Image – Dark Appearance | `cardImageDark` | Used in dark appearance. |
| Do NOT inherit light appearance tile icon image | `cardImageDarkNone` | `true` = no icon image in dark appearance (otherwise the light image is reused). |

## Image tab

| Cockpit label | Key | Values and effect |
|---|---|---|
| Light Appearance Image Source File | `image` | Image URL. |
| Dark Appearance Image Source File | `imageDark` | Used in dark appearance. |
| Do NOT inherit light appearance tile image | `imageDarkNone` | `true` = no tile image in dark appearance. |
| Image Type | `imageType` | `""` inline below the title (default), `B` background (removes the card's own background colour: put the colour into the image or on `.<class> .nepTileImageContent`), `T` top, `N` below the icon, `C` below the details, `U` bottom. The Cockpit's "Inline Below Title" item stores `X`, which shows **no** image: omit `imageType` instead. |
| Image Height | `imageHeight` | CSS height (`120px`, `8rem`, `auto`); for `B` the card's minimum height. Without it an inline or top image takes the tile group's `imageHeight`. |
| Image Placement (label changes with the type) | `imagePlacement` | `center center`, `center top`, `left top`, … (background position, or object position for top/inline images). |
| Background Image Repeat | `imageRepeat` | `B` only: `no-repeat`, `repeat`, `repeat-x`, `repeat-y`. |
| Background Image Size | `imageSize` | `B` only: `cover`, `contain`, `auto`. |
| Image Fit | `imageObjectFit` | Not `B`: `cover`, `contain`, `fill`, `none`, `scale-down`. |

Tile images are hidden on `Tiny`, `Short`, `Skinny` and `Narrow` tiles, except `B` (background) and `C` (below the details).

## Appearance tab

| Cockpit label | Key | Values and effect |
|---|---|---|
| CSS Style Class | `styleClass` | Class on the tile's outer container; style the card as `:root .<class> .nepFCard{…}` in the launchpad custom CSS. |
| Clickable Tile | `FIORI_STYLE` | `"X"` = the whole tile opens the action and has no buttons, `"-"` = not clickable, `""` = inherit. Tiles with height `Tiny`/`Short` or width `Skinny`/`Narrow` are always clickable. |
| Clickable Tile (checkbox, shown only when already set) | `openClickTile` | `true` = clickable, beats `"-"`. |

**Stored but never rendered** — do not use them to style a tile: `backgroundColor`, `backgroundType`, `backgroundShade`,
`titleAlignment`, `titleLevel`, `frameType`, `forceRow`, `cardHeightFit`, `imageObjectPosition`,
`tileApplicationStyleClass`, `sort` (the order is the group's `tiles` order). Tile colours, title size and alignment,
icon placement and button shape come from the Launchpad Designer or CSS on `styleClass`. Colour variant (override the
whole set; without `:root` the rule loses to Designer tile colours):
`:root .brandOrange .nepFCard{--sapTile_Background:#ff6b00;--sapTile_Hover_Background:#e65f00;--nepTile_TitleTextColor:#fff;--nepTile_TextColor:#fff;--nepTile_IconColor:#fff;--nepCardButton_TextColor:#fff;--nepCardButton_Background:transparent}`

## Tile Layout tab (legacy tile layouts)

`lightTileLayouts` / `darkTileLayouts` are ignored by `save_tile`; `tileLayoutLight` / `tileLayoutDark`, `forceAttributes`
("Prioritize Tile Layouts added to this Tile first") and `noInheritTileLayout` ("Do not use Light Tile Layout for dark
appearance") belong to the legacy tile layouts, which the Launchpad Designer replaces — leave them out.

## Navigation tab

| Cockpit label | Key | Values and effect |
|---|---|---|
| Semantic Object / Action | `navObject` / `navAction` | Hash `#<object>-<action>` opens the tile. The Cockpit strips everything but letters and digits; the server stores anything. |
| Sidepanel → Application / Title | `sidepanelApp` / `sidepanelTitle` | App opened in the side panel with the tile's app (the Cockpit limits the name to 30 characters). |
| Define Supported Browsers → Windows / macOS | `browserBlockWin` / `browserBlockMac` | JSON array **string** of supported browsers, max 64 characters: Windows `cr` `ed` `ff` `ie` `op`, macOS `cr` `op` `sf`. Empty = all. Other browsers get an "Incompatible" button. |

## Documentation tab

| Cockpit label | Key | Values and effect |
|---|---|---|
| Enable User Assistance | `enableDocumentation` | Shows the launchpad help button while the tile's app is open (not on public launchpads). |
| Enable Tile Help | `helpEnabled` | Adds a Help entry to the tile's menu. |
| Tile Help Text | `helpText` (+ `helpTextFormatter`) | HTML. |

## Role, Translation, Where-Used tabs

`roles` (`[{ id }]`; SKILL.md contract) · `translation` is deprecated and ignored by `save_tile` (use i18n bindings) ·
Where-Used = `get_tile` → `tilegroups`.

## Tile Blackout tool (separate Cockpit tool)

| Cockpit label | Key | Values and effect |
|---|---|---|
| Enabled | `blackoutEnabled` | `true` = the tile is blocked: blocked icon, the button shows the button text, a press shows the description; hash and navbar entries are blocked too. |
| Button Text | `blackoutText` | Button text on the blocked tile. |
| Description | `blackoutDescription` | HTML (rich text in the Cockpit). |

The Tile Layout tool is superseded by the Launchpad Designer.

## Grid: how tiles sit in a row

A tile group is a CSS grid with a fixed number of **equal columns**. The number depends on the grid's own width and on
the density (`cardPerRow` on the group, or Designer `TILES_PR_ROW`). Tiles fill the grid from the left, row by row;
columns a row does not use stay empty **on the right**. The grid is as wide as the smaller of the group's width cap
(`cardContentWidth` / Designer `GRID_WIDTH`) and the launchpad's content column (Designer `SHELL_WIDTH`,
default `Large` = 1280 px on desktop) — so on a default launchpad a desktop grid has 16 columns, and with
`SHELL_WIDTH: "XLarge"` or `"Full"` it gets 24 or more.

| Grid class (grid width, px) | One | Few | More (default) | Many |
|---|---|---|---|---|
| `nepGridFull` (> 2360) | 4 | 32 | 48 | 56 |
| `nepGridXXXLarge` (1881–2360) | 4 | 32 | 40 | 48 |
| `nepGridXXLarge` (1581–1880) | 4 | 24 | 32 | 40 |
| `nepGridXLarge` (1281–1580) | 4 | 16 | 24 | 32 |
| `nepGridLarge` (981–1280) | 4 | 8 | 16 | 24 |
| `nepGridMedium` (681–980) | 4 | 4 | 12 | 16 |
| `nepGridSmall` (381–680) | 4 | 4 | 8 | 10 |
| `nepGridXSmall` (201–380) | 4 | 4 | 4 | 5 |
| `nepGridXXSmall` (101–200) | 2 | 2 | 2 | 3 |
| `nepGridXXXSmall` (≤ 100) | 1 | 1 | 1 | 2 |

Columns each width spans, density `More` (the default):

| Grid class | Skinny | Narrow | Small | Medium | Wide | Wider | Max |
|---|---|---|---|---|---|---|---|
| Full … Medium (≥ 681 px) | 1 | 2 | 4 | 6 | 8 | 12 | all |
| Small (381–680) | 1 | 2 | 4 | 6 | 8 | 8 | 8 |
| XSmall (201–380) | 1 | 2 | 4 | 4 | 4 | 4 | 4 |
| XXSmall (101–200) | 1 | 2 | 2 | 2 | 2 | 2 | 2 |
| XXXSmall (≤ 100) | 1 | 1 | 1 | 1 | 1 | 1 | 1 |

`Few` makes tiles relatively larger (`Medium` spans 4, `Wide`/`Wider` 8, and only 4 at ≤ 980 px); `Many` keeps these
spans but caps `Wider` at 10 (381–680 px) and everything from `Medium` at 5 (≤ 380 px); with `One` every tile, `Skinny`
and `Narrow` included, spans the whole row. **Phones**: a 390 px phone gives a 390 px grid (`nepGridSmall`, 8 columns);
360/375 px phones give ≤ 380 px (4 columns).

**Tile content width** (the room for text) = (grid width − 16 px grid margins) ÷ columns × span − 16 px tile margins
− 2 × tile padding (default 16 px; Designer `TILE_PADDING`). Examples with default padding: `Small` in a 1280 px grid
≈ 268 px (grid cell 316 px, visible card 300 px, as measured); `Small` in a 1580 px grid ≈ 213 px; `Small` at phone, 4 columns
(360 px grid) ≈ 296 px, 8 columns (400 px grid) ≈ 144 px.

**A row looks full (and centred under a centred heading) only when its spans add up to the column count** — at desktop
and at phone width. Four `Small` tiles (16 columns) fill a 981–1280 px grid but take two thirds of a 1281–1580 px grid
and sit on the left. Fix it on the tile group (`manage-tile-groups` → Group width): give the group the width whose
column count equals the row's spans — `cardContentWidth: "Large"` (max 1280 px) for four `Small` tiles, `Medium`
(980 px) for three — or change the tile widths so they add up. A group width only narrows: the grid is the smaller of
the group cap and the content column (Designer `SHELL_WIDTH`, default `Large` = 1280 px), so four `Medium` in an
`XLarge` group need `SHELL_WIDTH` `XLarge` or wider. The group is centred
by default, header and tiles together. At 8 columns (390 px phone) `Small` tiles stand two per row: keep their count even,
or the last one stands alone on the left.

**Phones: one card per row in chosen sections.** The grid class follows the **grid's own width**, not the device: a
section capped at `Small` (680 px) is in the phone class (381–680 px) on desktop too. So stack only sections whose desktop
grid is wider than 680 px (`cardContentWidth` `Medium` or wider).
- **Platform setting (preferred)**: the section's Designer `tileGroupLayout` entry (`screenId`, `catId`, `placement`)
  with `GRID_CELLS_SMALL: "4"` — the launchpad sets the phone columns to 4 and caps every span at 4 (verified at 390 px:
  four `Small` footer tiles 358 px each; 1440 px unchanged). The key belongs to the density in `TILES_PR_ROW` of the same
  entry (default `More`); `GRID_CELLS_XSMALL` … `GRID_CELLS_XXXLARGE` exist for the other grid classes. The Launchpad
  Designer does not offer these keys; they are stored and read like the others.
- **CSS alternative** (CSS on platform internals): the same variables on the section's `styleClass`,
  `.<stack>{--nepGridMoreSmall:var(--nepGrid4);--nepSpanSmallMoreMedium:var(--nepSpan4);--nepSpanSmallMoreWide:var(--nepSpan4);--nepSpanSmallMoreWider:var(--nepSpan4);--nepSpanSmallMoreMax:var(--nepSpan4)}`
  (verified at 1440 and 390 px; on a `Small` section it stacked the row at 1440 px as well).
Text cards then get ≈ 310 px of text at 390 px instead of ≈ 110 px. Grids under 381 px already have 4 columns. Never
`overflow-wrap:anywhere` or `word-break:break-all` on titles instead.

**Allowed CSS around the grid** (everything else on `.nepGrid`, `.nepFCardContainer`, `.nepFCard` is off limits, SKILL.md
Layout rule 2):
- the grid variables above, on `Medium`-or-wider sections;
- `position:static` on the footer wrappers inside one tile (`.nepFCardFooterContainer`, `.nepFCardFooterLayout`,
  `.nepFCardFooterBox`, `.nepFCardFooter`, `.sapFCardStatus`) so your footer HTML can position against the card body;
- `display:flex`/`grid`, scroll-snap and positioning on **your own** elements inside a tile's HTML;
- `grid-column-start` alone on one tile container to centre a short row (e.g. two `Small` buttons in a 12-column grid:
  start 3) — only with density `More`, exactly two `Small` tiles, full rows before them, and no user personalisation of
  tile sizes; scope it to the desktop grid class (`.nepGridMedium`) so phones keep the normal flow.

**Never re-lay-out the grid with CSS** (SKILL.md Layout rule 2): spans stop applying and tiles collapse (a row of
buttons shrank to 1 px; forced spans of 1 turned 300 px cards into 63 px). Size with `cardWidth` / `cardHeight` and the
group width.

## Heights

`cardHeight` sets a **minimum outer height** (n × 32 px including the 8 px tile margins); the visible card is at least
48 / 80 / 112 / 176 / 240 / 304 px for `Tiny` / `Short` / `Normal` / `Tall` / `Tower` / `Skyscraper` and grows with
its content. There is no exact height. `PLAIN_BACKGROUND: "X"` also removes the 8 px tile margins. Text is cut only by the clamps (title 3 lines, subtitle 2) — a `Tiny` tile with a two-line title grows.

| Height / width | Hidden |
|---|---|
| `Tiny` | details, status, open button, tile images except `B`/`C`; subtitle when there is a title or an icon font; the title when an icon font is set (own, the group's or Designer `TILE_ICON`) unless `ICON_PLACEMENT` is `AlignLeft`/`AlignRight` on a `Small`-or-wider tile — at `Skinny`/`Narrow` any icon hides it |
| `Short` | details, status, open button, tile images except `B`/`C`; subtitle when there are both a title and an icon font |
| `Skinny`, `Narrow` | details, status, open button, tile images except `B`/`C` |

So inline/top images, details, a status line or an open button need `Normal` or taller and a width of `Small` or more.
Default tile padding is 1rem on each side; the Designer `TILE_PADDING` changes it and with it the room for text.

## Text that must fit (labels, rows, big numbers)

- **One-line labels** (button-like tiles, FAQ rows, `Tiny` and `Short` tiles): budget at the **narrowest** supported
  width — characters × 0.55 × font size (px) ≤ tile content width (Grid above). Example: "See how we help our
  customers" (29 characters) at 16 px needs about 233–255 px; a measured `Small` button tile with Designer padding
  2rem had 159 px (223 px header − 2 × 32 px) — too narrow. Otherwise shorten the label, widen the tile (`Medium`/`Wide`), lower
  `TILE_PADDING`, or let it wrap — the tile grows to fit (a `Tiny` tile with a two-line title fits, verified live).
- **Never force `white-space:nowrap`** on a tile title or button text without that budget: the text is cut, not ended
  with "…".
- **Big numbers and headlines in tiles** (`3.5rem` statistics): size them for the phone column too — a fixed rem size
  overflows a narrow tile; use `font-size:clamp(<phone size>, <vw>, <desktop size>)` in the tile's CSS.

**Centre a label in a button-like tile** (verified recipe; scope it to the tile's style class, change no sizes):
`:root .<class> .sapFCardHeader{justify-content:center;align-items:center}`
`:root .<class> .sapFCardHeaderTopRow{align-items:center}`
`:root .<class> .sapFCardHeaderMainWrapper{justify-content:center}`
`:root .<class> .sapFCardTitle{display:flex;align-items:center;justify-content:center}`
`:root .<class> .sapFCardContent{display:none}` — the label is centred both ways (0 px off; −6 px without the last
line) and an `::after` arrow stays on its line. **Left-aligned rows** (FAQ, link lists): keep the platform default
(`align-items` normal) or set `align-items:stretch` on `.sapFCardHeader`; `align-items:center` there shrinks the text box
and centres it. Centre such a row vertically with `:root .<class> .sapFCardHeader{justify-content:center}`,
`:root .<class> .sapFCardHeaderTopRow{align-items:center}`, `:root .<class> .sapFCardContent{display:none}` (verified:
0 px off centre in a 48 px row).

**Type sizes** come from platform variables: the tile title uses `--nepH4` at the default title level (Horizon values:
`--nepH1` 3rem, `--nepH2` 2rem, `--nepH3` 1.5rem, `--nepH4` 1.25rem, `--nepH5` 1rem, `--nepH6` .875rem), so set `--nepH4` on
the tile's or section's class (a section-level value does not reach `Narrow`/`Skinny` tiles) (`.<cards>{--nepH4:1.25rem}`, phone `@media (max-width:600px){.<cards>{--nepH4:1.125rem}}`, verified);
a rule like `.sapFCardTitle{font-size:…}` loses to the platform's five-class rule. The description uses
`TILE_CONTENT_SIZE` (`medium` = 16 px, verified; unset = `var(--sapFontSize)`, 14 px in Horizon). Card titles and section subtitles use the bold face of the theme font;
for a regular-weight line set `font-family:var(--sapFontFamily)`.

## A centred row of buttons in a full-width band

- **Row**: the button group's width must give a column count equal to the buttons' spans at desktop **and** phone. Two
  `Small` buttons in a group with `cardContentWidth: "Small"` (680 px grid, 8 columns): centred at desktop and side by
  side at 390 px (8 columns, about 171 px each; labels wrap to two lines without clipping). Two `Medium` in a `Medium`
  group (12 columns) are centred at desktop but take 6 of 8 columns at 390 px, off-centre.
- **Band**: a narrowed group narrows its section container too, so paint the band with the Designer `tileGroupLayout`
  entry for that group (with `screenId`, `catId` and `placement: "Section"` — without `placement` nothing applies):
  `CANVAS_BACKGROUND_COLOR` paints the section canvas (the full content column — edge to edge only with
  `SHELL_WIDTH: "Full"`), `GRID_BACKGROUND_COLOR` the grid. Never put the band colour on the section container with CSS.
- **Button colour**: through the card variables, `:root .<class> .nepFCard{--sapTile_Background:…;--sapTile_BorderColor:…;--nepTile_TitleTextColor:…}`.
  Colour painted on `.sapFCardHeader` is overridden by platform rules (an invisible label). Outline button:
  `--sapTile_BorderColor` draws the 1 px card border (none under `PLAIN_BACKGROUND: "X"`); for a thicker line add
  `box-shadow:inset 0 0 0 1px <colour>`.
- **Pill radius**: `--nepCardBorderRadius` on the same selector (`Tiny` and `Skinny` tiles use half of it). Prefer the
  variable: a plain `border-radius` ties with the platform's Tiny/Skinny rule and its result depends on stylesheet order
  (it lost in the controller's test).
- **Label**: the centring recipe above.

## Rows look consistent

Tiles in one visual row share **one card treatment, one height and one image treatment**:

- **Card treatment**: the Designer tile key `PLAIN_BACKGROUND` (`"X"` = no card: transparent, no border, radius,
  shadow or margin; `"-"` = card) — set it on the tile group's Designer entry, not on single tiles. Plain tiles are right
  for a band where **none** of the tiles is a card (a row of statistics, a link strip). Deliberate exceptions only:
  primary vs secondary button, one highlighted card.
- **Height**: the same `cardHeight` for every tile of the row, sized for the tallest content — set `cardHeight` once on
  the tile group, or the Designer `TILE_HEIGHT` on the group entry. A `Normal` tile next to a `Tall` card ends far above
  it.
- **Image on one card in a row of icon cards**: keep it a card and put the image on top —
  `image` + `imageType: "T"` + `imageHeight` (for example `110px`), with the same `cardHeight` as its neighbours (or the
  Designer `TILE_BACKIMAGE` + `TILE_BACK_TYPE: "I"` + `TILE_BACK_HEIGHT` on that tile). A background image (`B`) or a
  plain dark tile among white cards reads as a different kind of element.
- **Colours**: one variant class for the whole row (`:root .<class> .nepFCard{…}`), not a different background per tile.

## Light and dark

| Mode-specific (tile fields) | Mode-independent |
|---|---|
| `image` / `imageDark` / `imageDarkNone`, `cardImage` / `cardImageDark` / `cardImageDarkNone` | everything else: texts, sizes, `icon` (its colour follows the theme), `styleClass`, action, flags |

Launchpad Designer settings (tile colours, sizes, `ICON_PLACEMENT`, `PLAIN_BACKGROUND`, images) and the custom CSS are
stored per mode (`config.designer.light` / `.dark`, `manage-launchpads`). In dark appearance the launchpad reads only
the `dark` bucket: settings made only in `light` are missing there, and the tiles fall back to the theme's dark cards
and the tile's own fields. Rules:

1. When the launchpad can show dark (`layout_preference` 0, 1 or 2), repeat every Designer tile entry and the custom
   CSS in `dark`, with dark-appropriate colours — or set `layout_preference: 3` (Only Light).
2. A CSS variant sets the background **and** every text and icon colour together; a variant that sets only
   `--sapTile_Background` keeps the theme's text colour, which is light in dark mode (white text on a white card).
3. A transparent or dark-line icon image or tile image gets a `cardImageDark` / `imageDark` (or `…DarkNone: true`).
4. Prefer an icon font to an icon image when the tile must work in both modes.
