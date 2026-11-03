# Pro techniques: website-grade looks with the standard tools

Recipes for design features the tile grid seems not to offer, each with a **stability label** and a **fallback**:

- **Platform setting** — Designer keys, tile and group fields, the theme: survives upgrades, editable in the Cockpit.
- **CSS on platform internals** — launchpad classes and variables an upgrade may rename: re-check after upgrades.
- **Escape hatch** — raw tile `footer` HTML and enhancement spots: code you own.

Prefer settings, then CSS, then escape hatches; when a build uses an escape hatch, tell the user which and why (hand-off).
`<…>` = your ids, classes, colours.

## Toolbox

| Tool | Label | Reach and limits |
|---|---|---|
| Designer keys, tile / group fields | Platform setting | colours, widths, margins, sizes, per-section entries (`manage-launchpads` → designer keys) |
| `CUSTOM_CSS` | CSS on platform internals | paint and align inside tiles, headers and section canvases; served to every visitor — no internal names or notes in comments |
| Tile `description` | Platform setting | HTML subset — use `p`, `span`, `strong`, `em`, `a`, `ul`/`ol`/`li`, `h2`–`h6`, `br` (+ `class`, `style`). Tags outside the allow-list (`manage-tiles` → `reference/settings.md` → Details) are **removed together with their text** — e.g. `b`, `i`, `small`, `sub`, `sup`, `div`, `button`, `details`/`summary`; `svg` loses its tags, loose text stays |
| Tile `footer` (Status) | Escape hatch | raw HTML, no filter (`details`, `img`, inline `svg`, `div`); tiles ≥ `Small` × `Normal` |
| Enhancement spots | Escape hatch | JavaScript at launchpad moments; served to anonymous visitors |
| Tile `type: "application"` | Escape hatch | a whole App Designer app in a tile (§9, not built here) |

## Rules for every technique

- **Grid boundary**: `manage-tiles` → Layout rule 2 (what CSS may and may not touch, the one `grid-column-start`
  exception) and `reference/settings.md` → Allowed.
- **Hooks**: `.nepSectionCanvas<group id>` (section canvas), group `styleClass` (header + grid container),
  `.nepGroupHeader<id>`, `.nepCatTitle`/`.nepCatSubTitle` (`h2`/`h3` + `span`), tile `styleClass` (tile container),
  `.nepFCard` (`position:relative`), `.nepFCardContentText` (description), `.sapFCardStatus` (footer).
- **Sizes through variables**: tile title `--nepH4` (Horizon values `--nepH1` 3rem … `--nepH4` 1.25rem … `--nepH6`
  .875rem; set on a section class it does not reach `Narrow`/`Skinny` tiles), description `TILE_CONTENT_SIZE`.
- **Scope** every rule to a section or tile class. Rules marked *launchpad-wide* are meant for every section.
- Repeat rules in the `dark` bucket when the launchpad shows dark. In tile HTML style **your own wrapper class**:
  platform rules on `.sapFCardStatus` (right-aligned) and on header links (text shadow) win over plain overrides.
- **Footer HTML safety**: write the recipe markup yourself; never copy a source page's markup. Insert scraped or user
  text HTML-escaped; no `on…=` attributes, no `script`, `iframe` or `form`; `https:` links only.
- **Spots**: one entry per spot name — a second entry with the same name silently replaces the first, so merge recipes
  into one `AfterTileGroupRenderer` (Spot kit), each in its own `try`. A syntax error or a bad name stops every spot;
  runtime errors in `global`/`BeforeStartup` reach `console.error`, in other spots only debug mode; `BeforeUpdate` must
  resolve; guard re-runs with a flag; no secrets; never the text `</script>`.
- **Accessibility**: text ≥ 4.5:1; focus rings, chevrons and icons ≥ 3:1 (an orange like `#ff9e33` is 2.06:1 on white);
  targets ≥ 24 px; anything moving stops under reduced motion and has a pause control.

## Spot kit (one entry per spot name)

`BeforeStartup` — header links and CTAs (§3):
```json
{ "name": "BeforeStartup", "param": "", "active": true, "content": "if (window.navAdded || !window.AppCacheShellCustomRight) { return; } window.navAdded = true; try { var nav = new sap.m.HBox({ alignItems: 'Center', renderType: 'Bare' }).addStyleClass('proNav'); [['Platform', 'https://<site>/platform'], ['Resources', 'https://<site>/resources']].forEach(function (l) { nav.addItem(new sap.m.Link({ text: l[0], href: l[1], target: '_blank' }).addStyleClass('proNavLink')); }); nav.addItem(new sap.m.Link({ text: 'Book a Demo', href: 'https://<site>/book-a-demo', target: '_blank' }).addStyleClass('proNavCta')); nav.addItem(new sap.m.Link({ text: 'Build Your App Now', href: 'https://<site>/trial', target: '_blank' }).addStyleClass('proNavCta proNavCta2')); AppCacheShellCustomRight.addItem(nav); } catch (e) { console.error('nav', e); }" }
```
`AfterTileGroupRenderer` — keyboard guard (§5), heading accents (§1), carousel controls (§16); keep only the parts you use:
```json
{ "name": "AfterTileGroupRenderer", "param": "Container, dataCat", "active": true, "content": "var grid = Container && Container.getDomRef && Container.getDomRef(); try { (function () { if (!grid || grid.proKeyGuard) { return; } grid.proKeyGuard = true; grid.addEventListener('keyup', function (e) { var t = e.target; if (t && t.closest && t.closest('.nepFCardFooter, .nepFCardContentText')) { e.stopPropagation(); } }); })(); } catch (e) { console.error('keys', e); } try { (function () { var accents = ['<phrase 1>', '<phrase 2>']; var head = document.querySelector('.nepGroupHeader' + dataCat.id + ' .nepCatTitle'); if (!head || head.querySelector('.proAccent')) { return; } var walker = document.createTreeWalker(head, NodeFilter.SHOW_TEXT); for (var node = walker.nextNode(); node; node = walker.nextNode()) { for (var i = 0; i < accents.length; i++) { var at = node.nodeValue.indexOf(accents[i]); if (at > -1) { var hit = node.splitText(at); hit.splitText(accents[i].length); var em = document.createElement('span'); em.className = 'proAccent'; em.textContent = accents[i]; hit.parentNode.replaceChild(em, hit); return; } } } })(); } catch (e) { console.error('accent', e); } try { (function () { var car = grid && grid.querySelector('.proCarousel'); if (!car || car.proWired) { return; } car.proWired = true; var track = car.querySelector('.proTrack'); var slides = track.querySelectorAll('.proSlide'); var dots = car.querySelectorAll('.proDot'); var motion = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'; var cur = function () { var x = track.scrollLeft, best = 0; for (var k = 0; k < slides.length; k++) { if (Math.abs(slides[k].offsetLeft - x) < Math.abs(slides[best].offsetLeft - x)) { best = k; } } return best; }; var go = function (i) { i = Math.max(0, Math.min(slides.length - 1, i)); track.scrollTo({ left: slides[i].offsetLeft, behavior: motion }); }; var mark = function () { var c = cur(); for (var k = 0; k < dots.length; k++) { dots[k].setAttribute('aria-current', k === c ? 'true' : 'false'); } }; car.querySelector('.proPrev').addEventListener('click', function () { go(cur() - 1); }); car.querySelector('.proNext').addEventListener('click', function () { go(cur() + 1); }); for (var d = 0; d < dots.length; d++) { (function (k) { dots[k].addEventListener('click', function () { go(k); }); })(d); } track.addEventListener('scroll', function () { window.clearTimeout(track.proTimer); track.proTimer = window.setTimeout(mark, 80); }); mark(); })(); } catch (e) { console.error('carousel', e); }" }
```
The guard stops Enter/Space released inside tile HTML from "opening" the tile: on a tile without a semantic object
that clears the URL hash — the screen stays, but a reload or a copied link opens the first screen.

## §1 Two-colour heading
*Escape hatch (spot) · CSS on platform internals (`::after`) · fallback: one colour.*

- **Spot** (preferred: the stored title stays the whole sentence): list the phrases in the accent part of the Spot kit;
  `.proAccent{color:<accent>}` (on a light canvas ≥ 4.5:1, e.g. `#b84a08` on `#fdf3ec`). Translated titles need their
  phrases too.
- **CSS only**: store the first part as the title and add the phrase:
  `.<section> .nepCatTitle.sapMTitle span::after{content:' Not Bolted On.';color:<accent>}` — menus and search show only
  the stored part.
- **Inside a tile** (no script): `<span class="proAcc">…</span>` in the `description` (§15).
Spot and `::after` both keep the whole sentence in the screen-reader name.

## §2 Full-bleed hero: one section, one background
*Platform setting (section, `SHELL_WIDTH`, Designer entry) + CSS on platform internals (canvas art) · fallback: the
section's `CANVAS_BACKGROUND_COLOR` alone.*

The hero is **one section**: `title` = headline, `subTitle` = kicker or subline, tiles = text and button tiles, artwork on
its canvas — one background behind text and buttons, no seam, no fixed height. Screen group `hideHeader: true`;
`SHELL_WIDTH: "Full"`; a `tileGroupLayout` entry `{ screenId, catId: <hero>, placement: "Section", data: {
CANVAS_BACKGROUND_COLOR, HEAD_TEXT_CLR, SUBHEAD_TEXT_CLR, HEAD_TEXT_MARGIN: "custom" (+ TOP 5–7rem, BOTTOM, START, END),
GRID_MARGIN_SHORTHAND: "custom" (+ BOTTOM 4–5rem) } }`; `HEAD_TEXT_ALIGN: "center"`.

**Choose the hero width once:**

| Width | Buttons | Phone |
|---|---|---|
| `cardContentWidth: "Small"` (680 px, 8 columns) | two `Small` buttons fill the row: centred, no extra rule | side by side (short labels) — **never add the phone stack here**: a `Small` section's grid is always in the phone grid class, so it would stack on desktop too |
| `"Medium"` (980 px, 12 columns; wider headline) | centre two `Small` buttons with the `grid-column-start` exception (§12) | add the section to the phone stack (`manage-tiles` → Layout rule 12): buttons full width, labels on one line |

```css
.nepSectionCanvas<hero id>{background-image:url('/media/root/<folder>/hero-bg.svg');background-repeat:no-repeat;background-size:cover;background-position:center 35%}
:root .<hero> .nepCatTitle.sapMTitle,:root .<hero> .nepCatTitle.sapMTitle span{font-size:clamp(2.25rem,4.4vw,4rem);line-height:1.08;white-space:normal;max-width:100%;text-align:center;padding-bottom:.1em}
:root .<hero> .nepCatSubTitle.sapMTitle,:root .<hero> .nepCatSubTitle.sapMTitle span{font-size:1.0625rem;font-family:var(--sapFontFamily);font-weight:400;white-space:normal;text-align:center}
```
No image: a `radial-gradient(…)` glow as the canvas image. Buttons: card
variables + pill radius + the label-centring recipe (`manage-tiles` reference); labels 16 px on one line
(`.<hero>{--nepH4:1rem}`, side room ≥ half the button height); a decorative arrow screen readers skip:
`:root .<hero> .sapFCardTitle::after{content:'↗' / ''}`. Subline in a plain `Max` tile: running text without `<br>`,
width via `:root .<subline tile> .nepFCardContentText p{max-width:60ch;margin:0 auto}` (hard breaks leave orphan words). Rejected: screen header image +
button section (seam); header image stretched behind the buttons (fixed height).

## §3 Header like a modern site
*Platform setting (colours, logo) + Escape hatch (spot) · fallback: the standard header with `TOP_*` colours.*

- **Blend with the hero**: `TOP_BACK_COLOR` = the hero canvas colour, `TOP_BOR_COLOR` the same or a hairline
  (`rgba(255,255,255,.14)`), `DISABLE_HEADER_SHADOW: true`, `EXTEND_HEADER_COLOR: true`, `HEADER_HEIGHT: "5rem"`, a light
  logo in `TOP_LOGO` / `TOP_LOGO_MOBILE`; `config.hideUsername`, `hideSearch`.
- **Nav links and CTAs**: the `BeforeStartup` spot of the Spot kit fills `AppCacheShellCustomRight` with real
  `<a href>` links. Style (UI5 links take the theme's hover colour — dark on a light theme, invisible on a plum header —
  so set the link hover variables on the header):
```css
.proNav{display:flex;align-items:center;gap:1.75rem;margin-inline-end:.75rem}
:root .proNav a.sapMLnk.proNavLink{color:#ffffff;font-size:.9375rem;font-weight:700;text-decoration:none;text-shadow:none}
:root .proNav a.sapMLnk.proNavCta{background:<orange>;color:<ink>;font-weight:700;border-radius:999px;padding:.6rem 1.25rem;text-decoration:none;text-shadow:none;border:1.5px solid <orange>}
:root .proNav a.sapMLnk.proNavCta2{background:transparent;color:#ffffff;border-color:rgba(255,255,255,.85)}
:root .proNav a.sapMLnk.proNavCta::after{content:'↗' / '';margin-left:.5rem}
:root .proNav a.sapMLnk:focus-visible{outline:2px solid #ffffff;outline-offset:3px}
:root .nepLaunchpadTopInner{--sapLink_Hover_Color:#ffb35f}
:root .proNav a.sapMLnk.proNavCta{--sapLink_Hover_Color:<ink>} :root .proNav a.sapMLnk.proNavCta2{--sapLink_Hover_Color:#ffb35f}
:root .proNav a.sapMLnk.proNavCta:active{background:#ff8a00;border-color:#ff8a00}
@media (max-width:1100px){.proNav .proNavLink{display:none}}
@media (max-width:600px){.proNav .proNavCta2{display:none}}
```
- Hide the menu button (`:root #AppCacheShellMenuOverflow{display:none}`) only on a single-screen launchpad that needs
  no section jump links and no list of open apps. Dropdown menus under the links are not built here.

## §4 Footer: brand, link columns, legal line
*Platform setting (tiles with `description` lists) + CSS · fallback: the same tiles with theme colours.*

Last section, `hideHeader: true`, `cardContentWidth: "Large"`, four `Small` × `Tall` tiles (2 × 2 on a phone), canvas
via its Designer entry, group `tileLayout` entry `PLAIN_BACKGROUND: "X"`. Column = `title` + `description`
`<ul><li><a href="https://…" target="_blank">Overview</a></li>…</ul>`; brand column = name + a sentence +
`<p class="proLegal">© 2026 <Company> · <a href="https://…">Privacy</a></p>`.
```css
:root .proFoot .nepFCard{--sapTile_Background:transparent;--sapTile_Hover_Background:transparent;--sapTile_BorderColor:transparent;--nepTile_TitleTextColor:#ffffff;--nepTile_ContentColor:rgba(255,255,255,.75)}
.<footer section>{--nepH4:1rem} .<footer section> .<brand tile>{--nepH4:1.75rem}
.proFoot .nepFCardContentText ul{list-style:none;margin:.25rem 0 0;padding:0} .proFoot .nepFCardContentText li{margin:0 0 .55rem}
:root .proFoot .nepFCardContentText a.sapMLnk{color:rgba(255,255,255,.85);text-decoration:none;text-shadow:none}
.<footer section>{--sapLink_Hover_Color:<orange>} :root .proFoot .nepFCardContentText a.sapMLnk:hover{text-decoration:underline}
.proFoot .proLegal{margin-top:1.25rem;font-size:.8125rem;color:rgba(255,255,255,.6)}
```

## §5 FAQ that expands (two columns on desktop)
*Escape hatch (footer HTML + keyboard guard) · fallback: one `Max` × `Tiny` tile per question, no answers.*

`details` work in a tile `footer`; in a `description` they are removed with the question. `Large` section, `hideHeader:
true`, in the phone stack; left a plain `Small` tile whose `description` holds
`<p class="proKick">FAQ</p><h2 class="proH">Frequently Asked<br><span class="proAcc">Questions</span></h2>`, right a
plain `Wider` tile (4 + 12 = 16 columns) with the accordion; group entry `TILE_PADDING: ".5rem"` so a 32 px heading line
fits the left column. Footer: `<div class="proFaqList"><details name="faq" open><summary>What is …?</summary><p>…</p></details><details name="faq"><summary>…</summary><p>…</p></details></div>`
— `open` = expanded at load, a shared `name` = opening one closes the others (older browsers: several may stay open).
```css
:root .proPlain .nepFCard{--sapTile_Background:transparent;--sapTile_Hover_Background:transparent;--sapTile_BorderColor:transparent;--sapTile_Interactive_BorderColor:transparent;box-shadow:none}
:root .proPlain .nepFCardHeader{display:none}
:root .proFaq2 .sapFCardStatus{display:block;width:100%;white-space:normal}
.proFaqList{text-align:start}
.proFaqList details{border-bottom:1px solid #e3cfc3}
.proFaqList summary{list-style:none;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:1rem;padding:1.1rem 0;font-size:1.125rem;font-weight:700;line-height:1.35;color:#2a0d22}
.proFaqList summary::-webkit-details-marker{display:none}
:root .proFaqList summary:hover,:root .proFaqList summary:active{color:#c4500a}
.proFaqList summary::after{content:'';flex:none;width:.5rem;height:.5rem;margin-right:.35rem;border-right:2px solid #c4500a;border-bottom:2px solid #c4500a;transform:rotate(45deg);transition:transform .2s}
.proFaqList details[open] summary::after{transform:rotate(-135deg)}
.proFaqList summary:focus-visible{outline:2px solid #c4500a;outline-offset:2px}
.proFaqList p{margin:0 0 1rem;font-size:1rem;line-height:1.6;color:#5b4a55;user-select:text}
@media (prefers-reduced-motion:reduce){.proFaqList summary::after{transition:none}}
```
Add the Spot kit's keyboard guard.

## §6 Floating badges on a card image
*CSS on platform internals · fallback: the badge words in the description, or drawn into the image.*

Top image (`image` + `imageType: "T"` + `imageHeight`) is the card's first child; badges are pseudo-elements of the card:
```css
:root .<badged> .nepFCard::before{content:'SAP-native';position:absolute;top:12px;left:12px;z-index:1;padding:.3rem .7rem;border-radius:999px;background:rgba(255,255,255,.92);color:<plum>;font-size:.8125rem;font-weight:700}
:root .<badged> .nepFCard::after{content:'AI-ready';position:absolute;top:12px;right:12px;z-index:1;padding:.3rem .7rem;border-radius:999px;background:<orange>;color:<ink>;font-size:.8125rem;font-weight:700}
```
`content` is read aloud and not translatable; an `<img>` has no pseudo-elements. Two-style badges: §15.

## §7 Type scale and card internals
*Platform setting first, CSS for the rest · fallback: theme defaults.*

| Want | Set |
|---|---|
| Card text 16 px | `TILE_CONTENT_SIZE: "medium"` (unset = `var(--sapFontSize)`, 14 px in Horizon) |
| Card title size | `TITLE_LEVEL` per Designer entry, or `--nepH4` on the section class; phone: `@media (max-width:600px){.<cards>{--nepH4:1.125rem}}` |
| One left edge for title, text and link | `TILE_BUTTON_JUSTIFY: "Start"`, `OPEN_BUTTON_REVERSE_ICON: "X"`, `:root .<cards> .nepCardActionOpen .sapMBtnInner{padding-inline:0}` |
| Actions level across a row | one `cardHeight` per row; same icon size on every card |
| Section headings *(launchpad-wide)* | `:root .nepCatTitle.sapMTitle,:root .nepCatTitle.sapMTitle span{font-size:clamp(1.75rem,3.2vw,2.5rem);line-height:1.15;white-space:normal;max-width:100%;text-align:center;padding-bottom:.08em}`; kicker above the title: `.nepCatTitleLayout .nepCatSubTitle{order:-1}` |

Never `overflow-wrap:anywhere` or `word-break:break-all` on titles — change the columns (§10) or the size.

## §8 Section glows, patterns, glass cards, static logo row
*CSS on platform internals; the logo row is an escape hatch (footer `img`) · fallback: flat colours, no strip.*

- Canvas glow and dots: `.nepSectionCanvas<id>{background-image:radial-gradient(45% 60% at 88% 12%,rgba(255,157,46,.28),rgba(255,157,46,0) 70%),radial-gradient(circle at 1px 1px,rgba(255,255,255,.09) 1px,transparent 0);background-size:100% 100%,22px 22px}`.
- Glass card: translucent `--sapTile_Background` / `--sapTile_BorderColor` plus a corner `radial-gradient` as `background-image` on `:root .<glass> .nepFCard` (+ hover and button variables).
- Static logo row: one plain `Max` × `Normal` tile, `footer` = `<div class="proLogoRow" role="list" aria-label="Customers">…<img src="/media/root/<folder>/<logo>.png" alt="<name>">…</div>` with `.proLogoRow{display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:1.25rem 3rem}`.

## §9 Escape hatch: a whole section as an app — not built here
Tile `type: "application"` (`tileApplication`, `bodyHeight`, `cardWidth: "Max"`) or a web app, for free layout or live
data. Costs: an app to maintain, one more load per tile; anonymous use on a public launchpad unchecked.

## §10 One card per row on phones
*Stored key the launchpad reads (not shown in the Launchpad Designer — re-check it after anyone edits that section there) · fallback: CSS on platform internals.* The section's Designer entry `GRID_CELLS_SMALL: "4"` (phone
grid = 4 columns, spans capped at 4); only on sections whose desktop grid is wider than 680 px (`Medium` or wider).
Rules and the CSS alternative: `manage-tiles` → Layout rule 12 and `reference/settings.md` → Grid.

## §11 Moving logo strip
*Escape hatch (footer HTML) + CSS · fallback: the static row (§8).*

The logos twice in one plain `Max` × `Normal` tile (second set `aria-hidden`), moved by half the track width — seamless
because both halves match — with a **pause control** (WCAG 2.2.2, Level A) that works without script (add the Spot kit's
keyboard guard: the checkbox sits inside the tile footer, so Space would also start the tile):
```html
<div class="proMarqueeWrap"><input type="checkbox" id="proMarqueePause" class="proPauseBox"><label for="proMarqueePause" class="proPauseBtn">Pause logo animation</label><div class="proMarquee" role="region" aria-label="Customer logos"><div class="proMarqueeTrack"><div class="proMarqueeGroup"><img src="/media/root/<folder>/acme.png" alt="Acme">…</div><div class="proMarqueeGroup" aria-hidden="true"><img src="/media/root/<folder>/acme.png" alt="">…</div></div></div></div>
```
```css
:root .<strip tile> .sapFCardStatus{display:block;width:100%;overflow:hidden}
.proMarqueeWrap{text-align:center}
.proMarquee{overflow:hidden;-webkit-mask-image:linear-gradient(90deg,transparent,#000 10%,#000 90%,transparent);mask-image:linear-gradient(90deg,transparent,#000 10%,#000 90%,transparent)}
.proMarqueeTrack{display:flex;width:max-content;animation:proMarquee 45s linear infinite}
.proMarquee:hover .proMarqueeTrack,.proPauseBox:checked ~ .proMarquee .proMarqueeTrack{animation-play-state:paused}
.proPauseBox{position:absolute;opacity:0;width:1px;height:1px;margin:0}
.proPauseBtn{display:inline-block;margin:0 0 .75rem;padding:.35rem .9rem;border:1px solid #2a0d22;border-radius:999px;font-size:.8125rem;font-weight:700;color:#2a0d22;background:transparent;cursor:pointer}
.proPauseBtn:hover{background:#f3e3d9}
.proPauseBox:checked + .proPauseBtn{background:#2a0d22;color:#ffffff}
.proPauseBox:focus-visible + .proPauseBtn{outline:2px solid #c4500a;outline-offset:2px}
.proMarqueeGroup{display:flex;align-items:center;gap:3rem;padding-right:3rem}
.proMarqueeGroup img{height:64px;width:128px;object-fit:contain;filter:brightness(0);opacity:.42}
@keyframes proMarquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
@media (prefers-reduced-motion:reduce){.proMarqueeTrack{animation:none}.proPauseBox,.proPauseBtn{display:none}}
```
`brightness(0)` greys one-colour logos and turns coloured ones with white lettering into blobs. An SVG composed of logo
URLs fails as a background (an SVG image loads no external files).

## §12 Hero details: kicker, headline break, centred buttons, feature strip
*CSS on platform internals + description HTML · fallback: §2 with a `Small` hero.*

- Kicker = the hero `subTitle` above the title with marks: `.<hero> .nepCatTitleLayout .nepCatSubTitle{order:-1}`,
  `.<hero> .nepCatSubTitle.sapMTitle span::before{content:'‹' / '';color:<orange>;margin-right:.75rem}`, `…::after{content:'/›' / ''}`.
- Headline break: `:root .<hero> .nepCatTitle.sapMTitle{max-width:12em;margin-inline:auto}`; accent phrase via §1.
- Centred buttons in a `Medium` hero (the grid exception): `:root .<hero> .nepGridMedium .nepFCardContainer.<first button class>{grid-column-start:3}`
  — only with density `More`, exactly two `Small` buttons, full rows before them, and launchpads where users do not
  personalise tile sizes. The phone grid has another class, so the offset applies on desktop only.
- Feature strip in a plain `Max` tile: `<p class="proStrip"><span>…</span><span>…</span></p>`, flex-wrapped and centred, dots as
  `.proStrip span+span::before` (6 px orange circles); on phones a column without dots. One line at the section width.

## §14 Use-case cards with large faint shapes (§13 is part of §3)
*CSS on platform internals · fallback: the plain card colour.*

`:root .<use> .nepFCard{--sapTile_Background:#2d0f24;…;background-image:url('/media/root/<folder>/shapes.svg');background-repeat:no-repeat;background-position:right -80px center;background-size:auto 150%}`
(`shapes.svg`: white circle and chevron at ~5 % opacity; it layers over the card colour). Icons as `cardImage`; `Wide`
cards stand two per row on desktop, one on phones.

## §15 Research block: text column, stats, report card with badges
*Platform setting (description) + Escape hatch (footer badges) + CSS · fallback: the badge facts as text in the card.*

`Large` section, `hideHeader: true`, in the phone stack: a plain `Wider` text tile + a `Small` report card.
- Text tile `description`: `<p class="proKick">…</p><h2 class="proH">New Research: <span class="proAcc">What the Experts Say.</span></h2><p class="proLead">…</p><ul class="proStats"><li><strong>73 %</strong><span>say …</span></li>…</ul>`
  with `.proStats{display:flex;flex-wrap:wrap;gap:1.5rem 3rem;list-style:none;padding:0}`,
  `.proStats strong{font-size:clamp(2.5rem,5vw,4rem);line-height:1.05;font-weight:800}`, and `white-space:normal;overflow:visible`
  on `.proH` (it keeps UI5 title classes).
- Report card: `title` within 3 lines, `image` + `imageType: "U"` + `imageHeight`, badges as real text in its `footer`
  (`<div class="proBadge proBadgeA"><strong>300 +</strong><span>…</span></div>…`). Release the positioned footer wrappers
  so the badges sit against the card body:
  `:root .<card> .nepFCardFooterContainer,:root .<card> .nepFCardFooterLayout,:root .<card> .nepFCardFooterBox,:root .<card> .nepFCardFooter,:root .<card> .sapFCardStatus{position:static}`,
  `.proBadge{position:absolute;z-index:2;display:flex;gap:.75rem;padding:.75rem 1rem;background:#fff;border-radius:.75rem;width:max-content;max-width:13.5rem}`,
  `.proBadgeA{right:12px;top:24%}`, `.proBadgeB{left:12px;bottom:16px}`.
- Corner glow: a lilac `radial-gradient(… at 100% 100%, …)` on `.nepSectionCanvas<id>`.

## §16 Customer stories carousel
*Escape hatch (footer HTML + spot) · fallback: the stories as `Wide` photo tiles in a normal row.*

Scroll-snap on the section grid fails (forced spans collapse the cards) and an app tile costs an app, so: slides in one
plain `Max` × `Tower` tile's `footer`, scroll-snap on your own track, arrows and dots via the Spot kit. Footer:
`<div class="proCarousel" role="region" aria-roledescription="carousel" aria-label="Customer stories"><div class="proTrack"><article class="proSlide" style="background-image:linear-gradient(rgba(42,13,34,.62),rgba(42,13,34,.78)),url(/media/root/<folder>/story1.jpg)" aria-label="Story 1 of 4"><div class="proChips"><span class="proChip proChipLilac">Customer Stories</span><span class="proChip">Resources</span></div><h3>…</h3><a href="https://…" target="_blank" rel="noopener">Read Full Article <span aria-hidden="true">↗</span></a></article>…</div><button type="button" class="proArrow proPrev" aria-label="Previous story">…svg…</button><button type="button" class="proArrow proNext" aria-label="Next story">…svg…</button><div class="proDots"><button type="button" class="proDot" aria-label="Show story 1"></button>…</div></div>`
```css
:root .proCarTile .sapFCardStatus{display:block;width:100%;text-align:start;white-space:normal}
.proCarousel{position:relative;text-align:start}
.proTrack{position:relative;display:grid;grid-auto-flow:column;grid-auto-columns:86%;gap:1.25rem;overflow-x:auto;scroll-snap-type:x mandatory;scroll-behavior:smooth;scrollbar-width:none;overscroll-behavior-x:contain}
.proTrack::-webkit-scrollbar{display:none}
.proSlide{scroll-snap-align:start;min-height:440px;border-radius:14px;background-size:cover;background-position:center;display:flex;flex-direction:column;justify-content:flex-end;align-items:flex-start;gap:1rem;padding:2.5rem 4rem;color:#ffffff}
.proSlide h3{margin:0;font-size:clamp(1.375rem,2.4vw,2.125rem);line-height:1.2;font-weight:800;color:#ffffff;max-width:46rem;white-space:normal}
.proSlide a{color:#ffffff;font-weight:700;text-decoration:none}
.proSlide a span{color:#ff9e33}
.proSlide a:hover,.proSlide a:active{text-decoration:underline}
.proChips{display:flex;gap:.5rem;flex-wrap:wrap}
.proChip{background:#ffffff;color:#2a0d22;font-size:.8125rem;line-height:1;padding:.5rem .75rem;border-radius:4px}
.proChipLilac{background:#a98bf5;color:#1b0b2e}
.proArrow{position:absolute;top:calc(50% - 46px);width:52px;height:52px;border-radius:50%;border:0;background:#ffffff;color:#2a0d22;display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0;box-shadow:0 4px 14px rgba(0,0,0,.22)}
.proArrow:hover{background:#fdf3ec}
.proArrow:active{background:#f3e3d9}
.proPrev{left:12px}
.proNext{right:calc(14% + 12px)}
.proDots{display:flex;justify-content:center;gap:.25rem;margin-top:.75rem}
.proDot{width:24px;height:24px;border:0;padding:0;background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center}
.proDot::before{content:'';width:8px;height:8px;border-radius:999px;background:#7a6a62;transition:width .2s}
.proDot:hover::before{background:#2a0d22}
.proDot[aria-current=true]{width:40px}
.proDot[aria-current=true]::before{width:32px;background:#c4500a}
.proArrow:focus-visible,.proDot:focus-visible,.proSlide a:focus-visible{outline:2px solid #ffffff;outline-offset:2px;box-shadow:0 0 0 4px #2a0d22}
@media (max-width:600px){.proTrack{grid-auto-columns:92%}.proSlide{padding:1.5rem;min-height:380px}.proArrow{display:none}}
@media (prefers-reduced-motion:reduce){.proTrack{scroll-behavior:auto}.proDot::before{transition:none}}
```
Never use `href="#…"` for slides — the launchpad owns the URL hash. Costs: one spot, slides edited as HTML in one tile.

## Still not possible (and why)

- A header that changes on scroll or floats over the hero image — the shell header sits outside the content; §3 gives the
  look for a flat or gradient hero.
- Tiles overlapping each other — not within the layout rules (the grid gives every tile its own cell); overlap inside one
  tile instead (§6, §15).
- Scroll-driven animation and parallax — not built or checked.
- Live text in titles (user name, counts) without code — titles are stored text; a spot or an app tile can do it.
