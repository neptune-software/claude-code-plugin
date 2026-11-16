# UI5 Theme Generator — every Cockpit setting and its MCP field

Every input of the Cockpit **UI5 Theme Generator**, the `save_theme_generator` field behind it, and what it changes.
"Same" = the MCP field behaves like the Cockpit input. SKILL.md has the save contract and the rules; this file is the
lookup table.

## Settings tab

| Cockpit label | MCP field | Notes |
|---|---|---|
| ID | `id` | Read-only. |
| Theme | `name` | The Cockpit turns what users type into lowercase letters, digits and `_`; its Settings tab caps the name at 50 characters, the create dialog does not. MCP accepts 1–264 characters of anything; use the Cockpit's form when people will maintain the theme there. |
| Description | `description` | Up to 1,024 characters; shown in the designers' theme lists. |
| Package | `package` | Same. |
| Appearance (Light or Dark) | `brightness` | The Cockpit sets it once, in the create dialog (empty = `Light`), and shows it read-only afterwards. MCP can change it on update (verified): the theme recompiles on the other base, and every reference name (`neptune-generated-<light\|dark>-<id>`) must change with it: the stylesheet URL ignores the `light`/`dark` part, so a stale name silently loads the new colors on the wrong UI5 base. |

## Theme Colors tab

Each color row is an H/S/L triple (`CSS_VAR_<SEED>_H/_S/_L`). The Cockpit shows some rows only at higher skill levels (below); MCP reaches every row.

| Cockpit label (verbatim) | Fields |
|---|---|
| Brand Color (Hue, Saturation, Lightness) | `CSS_VAR_BRAND_COLOR_*` |
| Highlight Color (Hue, Saturation, Lightness) | `CSS_VAR_HIGHLIGHT_COLOR_*` |
| Base Color (Hue, Saturation, Lightness) | `CSS_VAR_BASE_COLOR_*` |
| Shell Header Color (Hue, Saturation, Lightness) | `CSS_VAR_SHELLHD_COLOR_*` |
| Shell Background Color (Hue, Saturation, Lightness) | `CSS_VAR_SHELLBG_COLOR_*` |
| Content Background Color (Hue, Saturation, Lightness) | `CSS_VAR_BACKGROUND_COLOR_*` |
| List Selection Background Color (Hue, Saturation, Lightness) | `CSS_VAR_LIST_COLOR_*` |
| Text Color (Hue, Saturation, Lightness) | `CSS_VAR_TEXT_COLOR_*` |
| Text Contrast Color (Hue, Saturation, Lightness) | `CSS_VAR_CONTRAST_COLOR_*` |
| Label Color (Hue, Saturation, Lightness) | `CSS_VAR_LABEL_COLOR_*` |
| Icon Color (Hue, Saturation, Lightness) | `CSS_VAR_ICON_COLOR_*` |
| Focus Color (Hue, Saturation, Lightness) | `CSS_VAR_FOCUS_COLOR_*` |
| Foreground Border Color (Hue, Saturation, Lightness) | `CSS_VAR_FOREGROUND_COLOR_*` |
| Border Radius | `CSS_VAR_BORDER_RADIUS` |
| Status Colors: Positive, Negative, Critical, Information | `CSS_VAR_POSITIVE_COLOR`, `…_NEGATIVE_COLOR`, `…_CRITICAL_COLOR`, `…_INFORMATION_COLOR` |

Each color row has a picker, hue/saturation/lightness popovers (or typed inputs with a clear icon) and Reset — all of
them only fill these three fields. Reset or the clear icon = send `null`.

What each seed colors and its defaults: SKILL.md → Seeds. Not in the Cockpit at all: `CSS_VAR_CONTRAST_FOCUS_COLOR_*` and
`active` (stored, change nothing).

Skill level (Basic / Intermediate / Advanced / Expert) is a per-user Cockpit view setting, not part of the theme:
Advanced adds typed H/S/L inputs, Expert adds the Font Family, Custom SASS Variables, Custom CSS and Theme Output tabs.
Below Advanced, the Cockpit's color picker keeps only the hue you pick and fills saturation and lightness from its own
contrast table — so a Cockpit user cannot reproduce an exact brand hex there, while MCP can (one decimal, SKILL.md).

## Font Family tab

| Cockpit label | MCP field | Notes |
|---|---|---|
| Font Family | `FONT_FAMILY` | The list is `get_theme_generator` → `webFonts` (fonts switched to "Use in UI5 Theme Generator"); the empty first entry = `null` = the default font "72". |

## Custom SASS Variables tab

`CSS_VAR_CUSTOM`. The Cockpit's documentation button lists two catalogues: the **Master SASS Variables** below and about
1,450 UI5 parameters. A UI5 parameter has the name of the CSS variable it produces: `--sapLinkColor` ↔ `$sapLinkColor`;
set it to a literal (`$sapLinkColor: #0a6ed1;`). Rules (literal values only,
never reference a `$sap…` parameter): SKILL.md → Custom Sass and CSS.

### Master SASS Variables

All 31 can be set in `CSS_VAR_CUSTOM`, on Light and on Dark themes; each lands in the stylesheet exactly as written
(verified). A master color set in custom Sass **wins over the matching Theme Colors field**, while that field's hue still tints the
seeds left unset (verified: `$nepBrandColor: #a10101;` plus brand field 120/100/25 → `--sapBrandColor: #a10101`, focus
color `hsl(120, 100%, 32%)`). Use the Theme Colors fields for the 13 seed colors and keep custom Sass for the rest.

| Variable | Default Light · Dark | Main CSS variables it sets | On screen |
|---|---|---|---|
| `$nepBrandColor` | Brand seed (212/100/47 both) | `--sapBrandColor`, `--sapButton_Emphasized_Background`, `_BorderColor` | Emphasized buttons |
| `$nepHighlightColor` | Highlight seed | `--sapHighlightColor`, `--sapLinkColor` (Light; Dark takes it 15 % darker), `--sapSelectedColor`, busy indicator, field hover/active border, selected/lite button text; in Dark also default-button and shell selection text | Links, selection, accents |
| `$nepBaseColor` | Base seed | `--sapBaseColor`, `--sapTile_Background`, `--sapList_Background`, `--sapGroup_ContentBackground`, `--sapPageHeader_Background`, `--sapObjectHeader_Background`, chart background; field backgrounds on Light | Surfaces: tiles, lists, panels, page headers |
| `$nepShellHeaderBackgroundColor` | Shell Header seed | `--sapShellColor`, shell hover/active/selected, `--sapShell_Navigation_Background` | Shell header bar |
| `$nepShellBackgroundColor` | Shell Background seed | `--sapShell_Background`, `--sapShell_InteractiveBackground` | App shell background |
| `$nepBackgroundColor` | Content Background seed | `--sapBackgroundColor`, alternating list rows, non-interactive info bar; field backgrounds on Dark | Page background |
| `$nepListSelectionBackgroundColor` | List Selection seed | `--sapList_SelectionBackgroundColor` | Selected rows |
| `$nepTextColor` | Text seed | `--sapTextColor`, `--sapTitleColor`, field text, tab text, subtle links | Body text, titles |
| `$nepContrastTextColor` | Contrast seed | `--sapContent_ContrastTextColor` and every auto-contrast text (shell header text, emphasized-button text, tile text on dark tiles, …) | Text on dark (Light) or bright (Dark) surfaces |
| `$nepLabelColor` | Label seed | `--sapContent_LabelColor`, `--sapField_PlaceholderTextColor`, `--sapTile_TextColor` (while the tile has the theme's normal brightness: light tiles on Light, dark tiles on Dark; otherwise the contrast color) | Labels, placeholders, tile subtitles |
| `$nepBorderRadius` | `1rem` | Base of the 7 radii below (= `CSS_VAR_BORDER_RADIUS`) | Overall roundness |
| `$nepNegativeColor` | `hsl(0, 91%, 35%)` · `#fa6161` | `--sapNegativeColor`, `--sapErrorColor`, negative text/tabs; in Dark also reject/negative buttons | Errors, reject |
| `$nepCriticalColor` | `hsl(26, 100%, 45%)` · `#ffdf72` | `--sapCriticalColor`, `--sapWarningColor`, critical buttons and progress; in Dark also attention-button text | Warnings |
| `$nepPositiveColor` | `hsl(137, 50%, 29%)` · `#97dd40` | `--sapPositiveColor`, `--sapSuccessColor`, positive text/tabs; in Dark also accept-button text | Success, accept |
| `$nepInformationColor` | `hsl(212, 100%, 47%)` · `#4db1ff` | `--sapInformativeColor`, `--sapInformationColor`, information borders and progress | Information |
| `$nepNeutralColor` | `#788fa6` · `#b3b3b3` | `--sapNeutralColor`, switch track, neutral borders/tabs | Neutral states, switch track |
| `$nepErrorBackground` | Negative at lightness 97 % · 10 % | `--sapErrorBackground`, `--sapField_InvalidBackground` | Error message strips, invalid fields |
| `$nepWarningBackground` | Critical at 97 % · 11 % | `--sapWarningBackground`, `--sapField_WarningBackground` (Dark: attention button) | Warning strips |
| `$nepSuccessBackground` | Positive at 97 % · 13 % | `--sapSuccessBackground`, `--sapField_SuccessBackground` | Success strips |
| `$nepInformationBackground` | Information at 97 % · 15 % | `--sapInformationBackground`, `--sapField_InformationBackground` | Information strips |
| `$nepNeutralBackground` | `#eff1f2` · `#242e38` | `--sapNeutralBackground` (Light: also assistant answer bubble) | Neutral strips |
| `$nepButtonBorderCornerRadius` | 0.5 × base | `--sapButton_BorderCornerRadius`, segmented buttons | Button corners |
| `$nepButtonTokenBorderCornerRadius` | 0.375 × base | `--sapButton_TokenBorderCornerRadius` | Token corners |
| `$nepElementBorderCornerRadius` | 0.75 × base | `--sapElement_BorderCornerRadius` | General element corners |
| `$nepFieldBorderCornerRadius` | 0.25 × base | `--sapField_BorderCornerRadius` | Input corners |
| `$nepGroupBorderCornerRadius` | 0.75 × base | `--sapGroup_BorderCornerRadius` | Panel/group corners |
| `$nepPopoverBorderCornerRadius` | 0.5 × base | `--sapPopover_BorderCornerRadius` | Popover/dialog corners |
| `$nepTileBorderCornerRadius` | 1 × base | `--sapTile_BorderCornerRadius` | Tile corners |
| `$nepFontLargeSize` | `1rem` | `--sapFontLargeSize`; every font size scales with it (`--sapFontSize` = 0.875 ×, H1 = 3 ×) | All text sizes |
| `$nepIconHeight` | `1rem` | `--sapContent_IconHeight` | Icon size |
| `$nepBorderWidth` | `0.0625rem` | `--sapElement_BorderWidth`, button/field/list/group border widths; focus and invalid-field borders = 2 × | All border thickness |

Reading a variable in custom Sass (`$sapTile_Background: $nepBrandColor;`) works for the 13 seed colors
(`$nepBrandColor` … `$nepIconColor`, `$nepFocusColor`, `$nepForegroundBorderColor`) and `$nepBorderRadius`. Any other master
(status colors, backgrounds, radii, sizes) can be read only after you set it earlier in the same custom Sass, otherwise
`Error compiling theme` (verified: `$sapTile_Background: $nepNegativeColor;` failed, `$nepNeutralColor: #5a0a5a;
$sapTile_Background: $nepNeutralColor;` worked).

### Tint factors (not in the Cockpit's list)

| Variable | Default | Effect |
|---|---|---|
| `$nepBrandSaturationFactor` | `100` | Percent applied to the saturation of every brand-derived seed left unset (base, background, shell header and background, list selection, text, contrast, label, icon). `0` = grey neutrals. |
| `$nepBrandLightnessFactor` | `100` | Percent applied to their lightness. `90` = everything 10 % darker (verified with `0` / `90`: `--sapBackgroundColor: hsl(212, 0%, 86.4%)`, base `hsl(212, 0%, 90%)`, text `hsl(212, 0%, 10.8%)`). |
| `$nepHighlightSaturationFactor`, `$nepHighlightLightnessFactor` | `100` | The same for focus and foreground border when left unset (verified with `50`/`50`: focus `hsl(212, 50%, 16%)`). |

Dark themes always apply the factors; Light themes only on some instances — after the save check that `--sapBackgroundColor`
changed, otherwise set the seeds' `_S` / `_L` by hand. On Light a lightness factor above `100` pushes lightness past 100 % and
every surface turns white.

Brand and highlight colors themselves are not scaled, and an H/S/L part you set explicitly is used as sent.

### Useful UI5 parameters (set with a literal)

| Ask | Custom Sass |
|---|---|
| Tile color only | `$sapTile_Background: #f5f0ff;` |
| Dark text on a mid-tone brand button | `$sapButton_Emphasized_TextColor: #1d1d1b;` |
| Move the auto-contrast switch point | `$sapContent_ContrastTextThreshold: 0.4;` (Light default 0.65, Dark 0.386) |
| One exact color for links | `$sapLinkColor: #0a6ed1;` |
| Chart/accent palette | `$sapAccentColor1` … `$sapAccentColor10: #…;` |

## Custom CSS tab

`CSS_VAR_CUSTOM_CSS` — plain CSS appended to the end of the stylesheet, unchanged.

## Theme Output tab

Read-only: the compiled stylesheet = `CSS_VARIABLES` in `get_theme_generator`, or the public stylesheet URL (SKILL.md → Verify).

## Elsewhere in the editor

The preview pane exists only in the Cockpit. Copy = `get_theme_generator` → save without `id` (SKILL.md → Copy a theme).
The create dialog's Appearance defaults to Light and its Package input appears when the instance requires packages;
over MCP send `brightness` and `package` yourself.
