# Where to edit what (a launchpad's visible parts → the setting that controls them)

Use it for change requests ("the header links vanish on hover", "smaller hero button", "move the logo") and when fixing a
defect: find the part, change only that setting, re-read, re-check. Exact keys and values live in the owning skill.

## Shell (launchpad `config.designer.<light|dark>.launchpadLayout`, `manage-launchpads`)
| Part | Where |
|---|---|
| Header colour, text, border, height | `TOP_BACK_COLOR`, `TOP_TXT_COLOR`, `TOP_BOR_COLOR`, `HEADER_HEIGHT` |
| Header alignment with the content | keep `HEADER_WIDTH` `Full`; `CUSTOM_CSS` `.nepLaunchpadTopInner{padding-inline:…}` (a narrower `HEADER_WIDTH` also moves the side menu) |
| Logo | `TOP_LOGO`, `TOP_LOGO_MOBILE`, `TOP_LOGO_HEIGHT` — per bucket (a light logo in `dark`) |
| Header links and buttons | the `BeforeStartup` spot filling `AppCacheShellCustomRight` (techniques Spot kit, §3); their look: `.proNav …` rules; hover/active: `--sapLink_Hover_Color` / `--sapLink_Active_Color` on `:root .nepLaunchpadTopInner` |
| Search, user name, top menu | `config.hideSearch`, `hideUsername`, `enableTopMenu` / `oneLineTopMenu` |
| Page background | `SHELL_BACK_COLOR` + `PAGE_BACK_IMAGE` |
| Content width | `SHELL_WIDTH` |
| Login page | the Designer Login keys (`LOGIN_*`, `MOB_*`, `BACK_LOGON_*`) |
| Light / dark | the `dark` bucket + a Dark theme; `layout_preference` |

## Sections (tile groups, `manage-tile-groups`; per-section Designer entry needs `screenId`, `catId`, `placement`)
| Part | Where |
|---|---|
| Heading / subheading text | tile group `title` / `subTitle`; a coloured phrase: techniques §1 |
| Heading size, colour, alignment, spacing | Designer `tileGroupLayout` `HEAD_TEXT_LEVEL`, `HEAD_TEXT_CLR`, `HEAD_TEXT_ALIGN`, `HEAD_TEXT_MARGIN` (never CSS padding on the section header) |
| Section band colour (full width) | per-section `CANVAS_BACKGROUND_COLOR`; grid area `GRID_BACKGROUND_COLOR` |
| Artwork behind a whole section (hero) | scoped `CUSTOM_CSS` on that section's canvas (techniques §2) |
| Section width / centring a row | `cardContentWidth` (or `GRID_WIDTH`) so the row's spans fill the columns |
| Cards per row | `cardPerRow`; one per row on phones: the section entry's `GRID_CELLS_SMALL: "4"` on sections wider than 680 px (`manage-tiles` rule 12) |
| Hero buttons centred / their size | hero `cardContentWidth` (`Small` = two `Small` buttons fill the row; `Medium` needs the `grid-column-start` exception, techniques §12); label size `--nepH4` on the hero's section class (16 px) |
| Hero subline width, orphan words | the subline tile's `description` without `<br>`; `max-width:60ch` on its `.nepFCardContentText p` |

## Cards (tiles, `manage-tiles`)
| Part | Where |
|---|---|
| Title, subtitle, text | `title`, `subTitle`, `description` (HTML: `p`, `span`, `strong`, `em`, `a`, lists — `b`, `i`, `small`, `div`, `details` vanish with their text) |
| Size | `cardWidth` / `cardHeight` (minimums; content grows the card) |
| Colours of one card style | card variables on `:root .<styleClass> .nepFCard` (all cards: Designer `TILE_*` keys) |
| Hover and pressed | `--sapTile_Hover_Background`, `--nepCardButton_Hover_*`, `--nepCardButton_Active_*` on the same selector |
| Corner radius / title size / text size | `--nepCardBorderRadius` / `TITLE_LEVEL` or `--nepH4` (Horizon 1.25rem; a section value skips `Narrow`/`Skinny` tiles) / Designer `TILE_CONTENT_SIZE` (unset = 14 px) |
| Button label and target | `openText` (label), `cardButtonIcon` / `cardButtonIconOnly` (icon), `actionType` + its target field; label left with the text: Designer `TILE_BUTTON_JUSTIFY: "Start"`, `OPEN_BUTTON_REVERSE_ICON: "X"` |
| Icon / image | `icon` (or Designer `TILE_ICON`) / `image`, `imageType`, `imageHeight` |
| Button look (pill, outline, centred label) | `manage-tiles` → button recipe (card variables, `--nepCardBorderRadius`, label centring) |

## Rich blocks (techniques)
| Part | Where |
|---|---|
| FAQ accordion, logo strip, carousel slides, report-card badges | the tile `footer` HTML (written by you, scraped text escaped) + scoped `CUSTOM_CSS`; behaviour in the one merged `AfterTileGroupRenderer` spot (techniques Spot kit) |
| Footer link columns, stats, two-colour heading inside a tile | the tile `description` (`ul`/`li`/`a`, `span class`) |
| Coloured phrase in a section heading | the phrase list in the spot, or `::after` (techniques §1) |
| Badges on a card image | `::before`/`::after` on `:root .<class> .nepFCard` (techniques §6) |
| Moving logos: speed, pause button | the strip's CSS animation + its pause control (techniques §11) |
| Fonts | the font record + the theme's `FONT_FAMILY`; after renaming or replacing font files re-save the theme (`manage-fonts`) |
| Brand colours of UI5 controls | Theme Generator seeds (`manage-theme-generator`) |

After any edit: save the complete object (launchpad `config` is replaced whole), re-read it, then run the review in
SKILL.md → Verify step 3 (hover every kind of element, labels on one line, no orphan words, side menu, phone).
