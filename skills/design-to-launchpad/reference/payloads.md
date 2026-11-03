# Payload skeletons, in build order

Placeholders in `<…>`. Every id comes from a create response or a `get_*` / `list_*` result. Field rules live in the owning
skills; these skeletons show the shape and the order only.

## 1. Assets → Media Library (upload-files)

```json
upload_media_file({ "path": "<prefix>", "filename": "<prefix>_logo.svg", "sourceUrl": "<direct public file URL>" })
```
`<prefix>` = the new top-level folder (Step 3.1). Delivery without a URL: `upload-files`. Reference: `/media/root/<prefix>/<prefix>_logo.svg`.
An inline SVG from a website: save it as a file first and give every `fill` an explicit colour — `currentColor` inside an
image renders black.

## 2. Font (manage-fonts)

```json
save_font({ "name": "<prefix>_sans", "enableWeb": true, "package": "<package id>", "config": { "web": {}, "pdf": {} } })
upload_font_file({ "id": "<font id>", "filename": "<prefix>-400.woff2", "sourceUrl": "<static per-weight .woff2 URL>" })  // once per weight
save_font({ "id": "<font id>", "config": { "web": { "regular": "<prefix>-400.woff2", "semiBold": "<prefix>-600.woff2",
  "semiBoldDuplex": "<prefix>-600.woff2", "bold": "<prefix>-700.woff2" }, "pdf": {} } })
```
File names: letters, digits, `-`, `_`, `.` only.

## 3. Theme (manage-theme-generator)

```json
save_theme_generator({ "name": "<prefix>_light", "brightness": "Light", "package": "<package id>",
  "CSS_VAR_BRAND_COLOR_H": "<h>", "CSS_VAR_BRAND_COLOR_S": "<s>", "CSS_VAR_BRAND_COLOR_L": "<l>",
  "CSS_VAR_HIGHLIGHT_COLOR_H": "<h>", "CSS_VAR_HIGHLIGHT_COLOR_S": "<s>", "CSS_VAR_HIGHLIGHT_COLOR_L": "<l>",
  "CSS_VAR_SHELLHD_COLOR_H": "<h>", "CSS_VAR_SHELLHD_COLOR_S": "<s>", "CSS_VAR_SHELLHD_COLOR_L": "<l>",
  "CSS_VAR_BACKGROUND_COLOR_H": "<h>", "CSS_VAR_BACKGROUND_COLOR_S": "<s>", "CSS_VAR_BACKGROUND_COLOR_L": "<l>",
  "CSS_VAR_TEXT_COLOR_H": "<h>", "CSS_VAR_TEXT_COLOR_S": "<s>", "CSS_VAR_TEXT_COLOR_L": "<l>",
  "CSS_VAR_POSITIVE_COLOR": "#…", "CSS_VAR_NEGATIVE_COLOR": "#…", "CSS_VAR_CRITICAL_COLOR": "#…", "CSS_VAR_INFORMATION_COLOR": "#…",
  "CSS_VAR_BORDER_RADIUS": "0.75rem", "CSS_VAR_CUSTOM": "$sapTile_Background: #…;", "FONT_FAMILY": "<font id>" })
```
Send every seed you set as a full H/S/L triple (one decimal, strings): a seed you leave out, or a part of it, keeps its default
lightness and saturation and takes the brand hue. The response is large — read `id`, `brightness` and the `CSS_VARIABLES`
lines you check (Step 4.1).

## 4. Tiles (manage-tiles)

```json
save_tile({ "tile": { "name": "<prefix>_t_orders", "package": "<package id>", "title": "Work orders", "subTitle": "6 open",
  "icon": "sap-icon://task", "cardWidth": "Small", "cardHeight": "Normal", "styleClass": "<prefix>Primary",
  "actionType": "A", "actionApplication": "<existing app name>", "openText": "Open" } })
```

## 5. Sections, then screens (manage-tile-groups)

```json
save_tile_group({ "tileGroup": { "name": "<prefix>_sec_today", "title": "Today's work", "subTitle": "<kicker>",
  "package": "<package id>", "tiles": [{ "id": "<tile id>" }, { "id": "<tile id>" }] } })
save_tile_group({ "tileGroup": { "name": "<prefix>_home", "title": "<hero headline>", "subTitle": "<hero line>",
  "menuText": "<short menu label>", "package": "<package id>",
  "image": "/media/root/<prefix>/<prefix>_hero.jpg", "imageHeight": "280px", "imageMobileHeight": "160px",
  "imageSize": "cover", "imagePlacement": "center center",
  "tilegroups": [{ "id": "<section id>" }, { "id": "<section id>" }] } })
```

## 6. Launchpad (manage-launchpads)

```json
save_launchpad({ "launchpad": {
  "name": "<launchpad name>", "title": "<title>", "package": "<package id>",
  "cat": [{ "id": "<screen group id>" }],
  "layout_preference": 3,
  "config": {
    "showAccessibilityFocusIndicator": true, "enableTopMenu": true, "oneLineTopMenu": true, "noSubmenuHover": false,
    "pincodeTries": 5, "pincodeLength": 4, "pincodeKeyIterations": 40000,
    "designer": {
      "light": {
        "launchpadLayout": {
          "THEME": "neptune-generated-light-<theme id>", "THEME_ORIGIN": "generator", "THEME_BASE": "sap_horizon",
          "THEME_UI5_VERSION": "1.148", "THEME_ROOT": "", "THEME_CSS": "/public/css-generator/neptune-generated-light-<theme id>.css",
          "TOP_BACK_COLOR": "#…", "TOP_TXT_COLOR": "#…", "TOP_HOV_COLOR": "#…", "HEADER_HEIGHT": "4rem", "EXTEND_HEADER_COLOR": true,
          "TOP_LOGO": "/media/root/<prefix>/<prefix>_logo.svg", "TOP_LOGO_HEIGHT": "2rem",
          "SHELL_WIDTH": "XLarge", "SHELL_BACK_COLOR": "#…", "PAGE_BACK_IMAGE": "None",
          "CUSTOM_CSS": "/* <prefix> */ .nepGroupHeader<screen group id>{background:#…;} .nepGroupHeader<screen group id> .nepCatTitle, .nepGroupHeader<screen group id> .nepCatTitle span{font-size:3rem;white-space:normal;color:#…;} :root .<prefix>Primary .nepFCard{--sapTile_Background:#…;--sapTile_Hover_Background:#…;--nepTile_TitleTextColor:#…;--nepTile_TextColor:#…;--nepTile_IconColor:#…;--nepCardButton_TextColor:#…;--nepCardButton_Background:#…;}"
        },
        "tileLayout": [{ "data": { "TILE_BACK": "#…", "TILE_TITLE": "#…", "TILE_ICON_COLOR": "#…", "TILE_BORDER": "#…", "HIDE_CONTEXT_BTN": "X" } }],
        "tileGroupLayout": [{ "data": { "HEAD_TEXT_CLR": "#…", "SUBHEAD_TEXT_CLR": "#…" } }]
      },
      "dark": { "launchpadLayout": {}, "tileLayout": [], "tileGroupLayout": [] }
    }
  }
}})
```
**Dark only**: put everything above (theme keys with `neptune-generated-dark-<id>` / `sap_horizon_dark`, shell keys,
`CUSTOM_CSS`, `tileLayout`, `tileGroupLayout`) into `dark`, leave `light` as `{ "launchpadLayout": {}, "tileLayout": [],
"tileGroupLayout": [] }`, and set `layout_preference: 4`. **Both appearances**: fill both buckets completely (the dark theme,
dark shell values, a light `TOP_LOGO`, `CUSTOM_CSS`, `tileLayout`, `tileGroupLayout`, login keys with the same
`LOGIN_PLACEMENT`) and set `layout_preference` `0`, `1` or `2`. Side navigation:
`"enableTopMenu": false, "verticalMenu": true` plus `NAV_BACK_COLOR` / `NAV_TXT_COLOR` / `NAV_HOV_COLOR`.
