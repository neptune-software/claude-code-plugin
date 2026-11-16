# Launchpad Designer keys (`config.designer`)

Full key list for `save_launchpad` → `config.designer`. The Designer's Configuration panel (launchpad name, title, menu,
header, login, language and PWA inputs) writes ordinary launchpad fields: `reference/settings.md`. Keys and values are not validated by the server: a wrong
key or value is stored and ignored. Colours accept any CSS colour (`#0b1f3a`, `rgb()`, `hsl()`, `transparent`).
An absent key keeps the default. Booleans marked `X/-` take the strings `"X"` (on) and `"-"` (off).

```json
"designer": {
  "light": { "launchpadLayout": { }, "tileLayout": [ { "data": { } } ], "tileGroupLayout": [ { "data": { } } ] },
  "dark":  { "launchpadLayout": { }, "tileLayout": [ ],                 "tileGroupLayout": [ ] }
}
```

Every `tileLayout` / `tileGroupLayout` entry needs a `data` object. An entry with only `data` applies to every tile /
tile group of the launchpad. Entries with `screenId`, `catId`, `tileId`, `placement` (`"Screen"` for a tile directly in
a top-level tile group, where `screenId` = `catId` = that tile group's id) target one tile or tile group; the
Launchpad Designer writes them when you style a single item. A per-group `tileGroupLayout` entry needs all three of
`screenId` (the screen group), `catId` (the styled group) and `placement` — `"Screen"` (the screen's own tiles),
`"Section"` (a group shown as a section of that screen), `"Navbar"` or `"Sidebar"`. Without `placement` the generated rule
targets `.nepPlacementundefined…` and nothing applies (verified: a section's `CANVAS_BACKGROUND_COLOR` stayed unpainted
until `placement: "Section"` was matched).

## `launchpadLayout` (Appearance → Launchpad Layout)

| Tab | Key | Values (default) |
|---|---|---|
| Theme | `THEME`, `THEME_ORIGIN`, `THEME_BASE`, `THEME_ROOT`, `THEME_CSS` | see SKILL.md → Themes (the Designer also writes `THEME_UI5_VERSION`; nothing reads it) |
| Theme | `THEME_OVERRIDE_ENABLED` (bool), `THEME_OVERRIDE_CSS_VARIABLES` (CSS text) | the rendered Custom Theme Override; the inputs `THEME_OVERRIDE_BRAND`, `THEME_OVERRIDE_CUSTOM_BRAND`, `THEME_OVERRIDE_HUE_BRAND`, `THEME_OVERRIDE_INTENSITY_BRAND` (`Vivid` `Strong` `Balanced` `Muted` `Neutral`), `THEME_OVERRIDE_BRIGHTNESS_BRAND` (`Dark` `Dim` `Mid` `Light` `Bright`), the same five for `…HIGHLIGHT`, `THEME_OVERRIDE_TOP_BACK_COLOR`, `THEME_OVERRIDE_TILE_BACK`, `THEME_OVERRIDE_TEXT_COLOR`, `THEME_OVERRIDE_LABEL_COLOR`, `THEME_OVERRIDE_ICON_COLOR`, `THEME_OVERRIDE_FONT_FAMILY` (Fonts id) feed the Designer's generator and render nothing by themselves — but a set `THEME_OVERRIDE_FONT_FAMILY`, like `THEME_OVERRIDE_ENABLED`, makes `THEME_OVERRIDE_CSS_VARIABLES` render |
| Logo | `TOP_LOGO`, `TOP_LOGO_MOBILE`, `FAVICON` | image URL; empty logo → the launchpad's `customLogo`, then the Neptune logo; empty favicon → logo. On a dark header use a variant with a light wordmark and the mark's original colours (not an all-white logo) |
| Logo | `TOP_LOGO_HEIGHT`, `TOP_LOGO_MOBILE_HEIGHT` | `1rem` `1.25rem` `1.5rem` `1.75rem` (default) `2rem` `2.25rem` `2.5rem` `3rem` `4rem` |
| Header | `TOP_BACK_COLOR` (background), `TOP_TXT_COLOR` (text), `TOP_HOV_COLOR` (interactive text), `TOP_BOR_COLOR` (bottom border), `TOP_ACT_COLOR` (interactive border) | colour |
| Header | `HEADER_HEIGHT` | `3rem` (default) `4rem` `5rem` `6rem` |
| Header | `HEADER_WIDTH` | `XSmall` `Small` `Medium` `Large` `XLarge` `XXLarge` `XXXLarge` `Full` (default). Also sizes the side-menu and user-settings layers: below `Full` the menu opens at the header's left edge with the overlay showing beside it (verified). To line the header up with the content column keep `Full` and pad the bar: `.nepLaunchpadTopInner{padding-inline:max(16px, calc((100% - <content px>) / 2));box-sizing:border-box}` |
| Header | `EXTEND_HEADER_COLOR`, `DISABLE_HEADER_SHADOW` | `true` / `false` |
| Canvas | `SHELL_BACK_COLOR` (page background colour) | colour — set it whenever the background image is removed |
| Canvas | `PAGE_BACK_IMAGE` | image URL, `"None"` or `""` = no image |
| Canvas | `BACK_IMG_SIZE` (`auto` `contain` `cover`), `BACK_IMG_REPEA` (`repeat` `repeat-x` `repeat-y` `no-repeat`), `BACK_IMG_PLACE` (`left top` `center top` `right top` `left center` `center center` `right center` `left bottom` `center bottom` `right bottom`), `BACK_OPA` (`0`–`1`) | |
| Content | `SHELL_WIDTH` (content column) | as `HEADER_WIDTH`; empty = `Large` |
| Content | `PAGE_BACK_COLOR`, `PAGE_BACK_BLUR` (`10px`; needs a translucent colour), `DISABLE_SHELL_SHADOW` (bool) | |
| Navigation | `NAV_BACK_COLOR`, `NAV_BOR_COLOR`, `NAV_TXT_COLOR`, `NAV_HOV_COLOR` (main menu); `ACT_APPS_BACK`, `ACT_APPS_BORD` (active apps side bar) | colour |
| Login | `LOGIN_PLACEMENT` | `Left`, `""` (centre), `Right` |
| Login | `LOGIN_HEIGHT`, `LOGIN_WIDTH` | as `HEADER_HEIGHT` / `HEADER_WIDTH`; empty = the header's |
| Login | `EXTEND_LOGIN_COLOR`, `DISABLE_LOGIN_SHADOW` | `X` / `-` / `""` or absent (= follow the header setting) |
| Login | `MOB_TOP_BACK`, `MOB_TOP_COL` (login header); `BACK_LOGON_CLR`, `BACK_LOGON_IMG`, `BACK_LOGON_OPA`, `BACK_LOGON_SIZ`, `BACK_LOGON_REP`, `BACK_LOGON_PLA` (login canvas, values as the Canvas keys); `MOB_BACK_COLOR`, `MOB_BACK_BLUR` (login box) | |
| Login | `MOB_TITLE_COL`, `MOB_LABEL_COL`, `MOB_LINK_COLOR`, `MOB_LINK_HOVER`; `MOB_FIELD_BACK`, `MOB_FIELD_BORD`, `MOB_FIELD_COL`; `MOB_BUT_BACK`, `MOB_BUT_BORD`, `MOB_BUT_COL`, `MOB_BUT_HOV_BACK`, `MOB_BUT_HOV_BORD`, `MOB_BUT_HOV_COL` | colour |
| Login | `MOB_BRAND_HIDE` (bool), `MOB_BRAND_IMG` (URL), `MOB_BRAND_PLACE` (`""` bottom, `M` middle, `T` top) | |
| Custom CSS | `CUSTOM_CSS` | CSS text; line breaks are removed — `/* */` comments only |

## `tileLayout[].data` (Appearance → Tile Layout)

| Tab | Key | Values (default) |
|---|---|---|
| Colors | `TILE_BACK`, `TILE_HOVER`, `TILE_BORDER`, `TILE_BORDER_ACT` | colour (`--sapTile_Background`, `--sapTile_Hover_Background`, `--sapTile_BorderColor`, `--sapTile_Interactive_BorderColor`) |
| Colors | `TILE_TITLE`, `TILE_TEXT` (subtitle), `TILE_CONTENT_COLOR` (details), `TILE_STATUS_COLOR`, `TILE_ICON_COLOR` | colour (`--nepTile_TitleTextColor`, `--nepTile_TextColor`, `--nepTile_ContentColor`, `--nepTile_StatusColor`, `--nepTile_IconColor`) |
| Colors | `TILE_BUT_BACK`, `TILE_BUT_BORD`, `TILE_BUT_TEXT`, `TILE_BUT_BACKHOV`, `TILE_BUT_BORDHOV`, `TILE_BUT_TEXTHOV`, `TILE_BUT_BACKACT`, `TILE_BUT_BORDACT`, `TILE_BUT_TEXTACT` | colour — no `_` before `HOV`/`ACT` |
| Icon | `TILE_ICON` | `sap-icon://<name>` (or another icon font URI) |
| Icon | `TILE_ICON_IMAGE` | image URL (.jpg .png .svg, ~48 px) |
| Icon | `TILE_ICON_SIZE` | `1rem` `1.5rem` `2rem` `2.5rem` (default) `3rem` `3.5rem` `4rem` `5rem` `6rem` `8rem` `10rem` |
| Icon | `ICON_PLACEMENT` | `AboveLeft` `AboveCenter` `AboveRight` `AlignLeft` `AlignRight` `BelowLeft` `BelowCenter` `BelowRight` (default) |
| Size | `BACK_WIDTH` (column span) | `Skinny` `Narrow` `Small` (default) `Medium` `Wide` `Wider` `Max` |
| Size | `TILE_HEIGHT` (row span) | `Tiny` `Short` `Normal` (default) `Tall` `Tower` `Skyscraper` |
| Size | `TILE_MARGIN_SHORTHAND` | `0rem` `.125rem` `.25rem` `.5rem` (default) `.75rem` `1rem` `1.25rem` `1.5rem` `2rem` `2.5rem`, or `"custom"` + `TILE_MARGIN_TOP|BOTTOM|START|END` |
| Size | `TILE_PADDING` | `0rem` `.25rem` `.5rem` `.75rem` `1rem` (default) `1.5rem` `2rem` `2.5rem` `3rem` `4rem` |
| Text | `TITLE_LEVEL`, `TITLE_LEVEL_SUB` | `H1`…`H6` (defaults `H4`, `H5`) |
| Text | `TITLE_ALIGN` | `Start` (default) `Center` `End` |
| Text | `TILE_CONTENT_SIZE` | `xx-small` `x-small` `small` `medium` (16 px, verified) `large` `x-large` `xx-large` `xxx-large`; unset = `var(--sapFontSize)` (14 px in Horizon) |
| Text | `TILE_CONTENT_ALIGN` | `Start` (default) `Center` `End` |
| Buttons | `TILE_BUTTON_SIZE` | `2rem` `2.25rem` `2.5rem` `2.75rem` (default) `3rem` `3.375rem` `3.75rem` `4.125rem` |
| Buttons | `TILE_BUTTON_FONT_SIZE` | `.875rem` (default) `1rem` `1.25rem` `1.5rem` |
| Buttons | `TILE_BUTTON_JUSTIFY` | `Start` `Center` `End` `SpaceBetween` (default) `SpaceAround` |
| Buttons | `OPEN_BUTTON_REVERSE_ICON`, `ACTION_BUTTON_REVERSE`, `OPEN_BUTTON_NOTX` (icon-only), `HIDE_CONTEXT_BTN` (removes the "…" overflow button next to the open button), `HIDE_CONTEXT_MENU` (disables the tile's press / right-click menu) | `X` / `-` (default `-`) |
| Settings | `PLAIN_BACKGROUND` | `X` = no card (transparent, no border, shadow or margin), `-` = card |
| Settings | `FIORI_STYLE` (Designer: Clickable Tile) | `X` = the whole tile opens its action, `-` = off |
| Image | `TILE_BACKIMAGE` (URL); `TILE_BACK_TYPE` = `B` background, or the inline position `T` top, `I` upper (default), `N` middle, `C` lower, `U` bottom; `TILE_BACK_HEIGHT` (`""`/`auto`, `25cqi`, `50cqi`, `75cqi`, or any CSS length); `TILE_BACK_SIZE` (background fit: `auto` default, `contain`, `cover`); `TILE_IMAGE_SIZE` (inline fit: `fill`, `contain`, `cover` default) | |
| Filter | `BG_FIL_BLUR` (`0px`…`10px`, `12px` `14px` `16px` `18px` `20px`), `BG_FIL_OPACITY` (0–1, default 1), `BG_FIL_BRIGHT` (0–2, default 1), `BG_FIL_GRAY` (0–1, default 0); `BG_MASK_IMG` = `N` none (default), `T` fade from the top, `B` fade to the bottom, `L` from the left, `R` from the right, `C` custom with `BG_MASK_CUSTOM` (a CSS `mask-image` value) | image filters |

## `tileGroupLayout[].data` (Appearance → Tile Group Layout)

| Tab | Key | Values (default) |
|---|---|---|
| Colors | `HEAD_COLOR` (header background), `HEAD_TEXT_CLR` (title), `SUBHEAD_TEXT_CLR` (subtitle), `HEAD_BORDER_CLR` (bottom border) | colour |
| Colors | `HEAD_BORDER_WDT` | CSS length (`3px`) |
| Colors | `GRID_BACKGROUND_COLOR` (content inner), `CANVAS_BACKGROUND_COLOR` (canvas outer) | colour |
| Text | `HEAD_TEXT_LEVEL`, `HEAD_SUB_LEVEL` | `H1`…`H6` (defaults `H4`, `H5`) |
| Text | `HEAD_TEXT_ALIGN` | `flex-start` (default) `center` `flex-end` |
| Text | `HEAD_TEXT_MARGIN` | `0rem` `.25rem` `.5rem` `1rem` (default) `1.5rem` `2rem` `2.5rem` `3rem`, or `"custom"` + `HEAD_TEXT_MARGIN_TOP|BOTTOM|START|END` (per-side keys do nothing without `"custom"`) |
| Grid | `TILES_PR_ROW` | `One` `Few` `More` (default) `Many` |
| Grid | `GRID_WIDTH` | `XXXSmall` `XXSmall` `XSmall` `Small` `Medium` `Large` `XLarge` `XXLarge` `XXXLarge` `Full` (default = the content width) |
| Grid | `GRID_ALIGN` | `Left` `Center` (default) `Right` |
| Grid | `GRID_MARGIN_SHORTHAND` | as `TILE_MARGIN_SHORTHAND` (default `.5rem`), or `"custom"` + `GRID_MARGIN_TOP|BOTTOM|START|END` |
| Settings | `HEAD_HGT`, `HEAD_TAB_HGT`, `HEAD_MOB_HGT` (header height desktop / tablet / mobile) | CSS length (`200px`, `8rem`, `auto`) |
| Image | `BACK_IMAGE`, `BACK_IMAGE_TAB`, `BACK_IMAGE_MOB` (header image desktop / tablet / mobile) | image URL |
| Image | `BACK_IMG_SIZ` (`auto` `contain` `cover`), `BACK_IMG_REP` (`repeat` `repeat-x` `repeat-y` `no-repeat`), `BACK_IMG_PLA` (the 9 positions as `BACK_IMG_PLACE`); tablet `BACK_IMG_TAB_SIZ/REP/PLA`, mobile `BACK_IMG_MOB_SIZ/REP/PLA` (default = desktop) | |
| Image | `BACK_IMG_MARGIN`, `BACK_IMG_TAB_MARGIN`, `BACK_IMG_MOB_MARGIN` | as `HEAD_TEXT_MARGIN` (default `0rem`), or `"custom"` + `…_TOP|BOTTOM|START|END` |

## Keys the launchpad reads that the Designer does not offer

Stored and served like the other keys (verified); the launchpad's style code reads them from the bucket in use.
Use them only when the Designer keys above cannot express the look.

| Key | Effect |
|---|---|
| `TOP_NOTIF_BACK` | notification badge background (`--sapContent_BadgeBackground`) |
| `APP_BACK_COLOR`, `APP_BACK_BLUR` | background colour (`--sapBackgroundColor`) and backdrop blur of the apps opened in the launchpad |
| `SCROLL_COLOR`, `SCROLL_TRACK`, `SCROLL_WIDTH` | scrollbar colour, track colour; `SCROLL_WIDTH: "thin"` = 6px scrollbars |
| `TILE_MARGIN_TOP` / `_BOTTOM` / `_START` / `_END` (`tileLayout[].data`) | per-side tile margins with `TILE_MARGIN_SHORTHAND: "custom"` (the Designer offers only the shorthand) |
| `GRID_CELLS_XXXSMALL` … `GRID_CELLS_SMALL` … `GRID_CELLS_XXXLARGE` (`tileGroupLayout[].data`, per-section entry) | column count of that grid class for the entry's density (`TILES_PR_ROW`, default `More`), every span capped at it; `GRID_CELLS_SMALL: "4"` = one card per row on phones (verified at 390 px, desktop unchanged). The grid class follows the grid's own width, so use it on sections wider than 680 px. Offered by the legacy Tile Group Layout tool, not the Launchpad Designer |
| `BACK_IMG2`, `BACK_IMG3`, `BACK_LOGON_IMG2`, `BACK_LOGON_IMG3`, `DESIGN_LANGUAGE` | extra canvas / login background images; `DESIGN_LANGUAGE: "Material"` adds the Material design class (legacy layout keys) |
