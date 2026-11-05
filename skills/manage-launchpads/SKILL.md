---
name: manage-launchpads
description: Create, configure, restyle, inspect or delete Neptune DXP launchpads with the MCP tools `list_launchpads`, `get_launchpad`, `save_launchpad`, `delete_launchpad` — every Cockpit Launchpad setting (header and menu, login page and providers, roles, self-registration, languages, PWA, idle sign-out and PIN, AI agent, enhancement scripts, cookie and blackout dialogs), the Launchpad Designer appearance (theme, logo, colours, canvas, widths, login page, custom CSS, tile and tile group look), light and dark mode, and the assigned tile groups. Use for "create a launchpad", "style the launchpad", "Launchpad Designer", "dark mode", "let users switch light and dark", "installable on phones", "log in with Azure AD", "only managers may open it", "add an AI assistant", "enhancement spot", "maintenance mode", "launchpad URL", "delete the launchpad". Read it before any `save_launchpad` payload, because `config` is replaced as a whole.
---

# Managing Neptune DXP launchpads via MCP

A **Launchpad** is the shell end users open in the browser: a header with logo, menu and search, and the **Tile
Groups** assigned to it, each holding **Tiles**. Its look comes from the **Launchpad Designer settings**, stored in
`config.designer`; its behaviour from the other `config` keys and launchpad fields. `save_launchpad` writes all of
them. No activate step: a save is served on the next request (verified).

## Tools

| Tool | Behavior |
|---|---|
| `list_launchpads` | Summaries `id`, `name`, `title`, `description`, `package`, `updatedAt` (verified); see Listing. |
| `get_launchpad({ id, includeTiles? })` | Full record; `cat` = tile groups in display order; `includeTiles: true` adds their `tiles` and `tilegroups`. `id` must be a UUID; unknown → `Not Found` (verified). |
| `save_launchpad({ launchpad })` | Create (no `id`) or update. Returns only `{ id, ver, updatedAt, name, package }` — re-read (verified). |
| `delete_launchpad({ id })` | `Launchpad '<id>' deleted`; tile groups and tiles stay; unknown id → `Not Found` (verified). |

## The `save_launchpad` contract

An update **merges**: send `id` plus the fields that change (verified). `config`, `enhancement`, `cat` and `roles` are
each stored as one value.

| Field | Rules |
|---|---|
| `id` | Omit to create. Update only an id you just read: an unknown id with `name` creates a broken launchpad (page 500), without `name` it fails (verified). |
| `name` | Required on create; 1–64 characters, trimmed; it is the URL — letters, digits, `_`. Uniqueness can be case-sensitive (`HR_PORTAL` next to `hr_portal` is accepted, verified): compare case-insensitively first. |
| `title` | Tab title; with `config.showLaunchpadTitle` also next to the logo. **No `"`, `\` or line breaks** — written unescaped into the page script, a `"` stops the launchpad (verified). Same for `customLogo`, `startApp`, `startWebApp`, `launchpadFooter`, and `'` in `defaultLoginIDP`. |
| `config` | Most Cockpit options **and** `config.designer`. **Replaced as a whole** (verified): `{ "hideSearch": true }` alone deletes everything else, Designer settings included. Always `get_launchpad`, change the copy, send it complete. Unknown keys are kept; `config.enhancement` and `config.locales` are generated on save. |
| `cat` | Tile groups in display order, `[{ "id": "…" }]` or `["…"]`; replaces the assignment; `[]` removes all (groups stay); duplicates stored once; an unknown id → `Error saving launchpad`, nothing changes (verified). |
| `layout_preference` | `0` Default, `1` Prefer Light, `2` Prefer Dark, `3` Only Light, `4` Only Dark — see Light and dark. Any number is stored: send only these (verified). |
| `header` | Raw HTML in `<head>` of the launchpad page (fonts, `<link>`, scripts); not on the login page of a launchpad without PWA (verified). |
| `publicAccess` | `true` = anonymous users may open it (verified); a public launchpad has no user button, hence no user menu. |
| `roles` | `[{ "id": "<role id>" }]` may open it; replaces the set; omitted = kept; `[]` = every signed-in user (verified). |
| `enhancement` | Scripts at launchpad events — see Enhancement spots. |
| `package` | Package id; without it your default package applies, else none (verified). |
| `customTheme`, `customLogo`, `layout_light`, `layout_dark` | Legacy: a Global Style id (not a Theme Generator theme), a fallback logo URL, Launchpad Layout ids — leave empty; use `THEME`, `TOP_LOGO` and the Designer settings. |
| everything else | Settings below and `reference/settings.md`. `agentId` / `iaAgentId` must exist; other references are not checked, and an unknown `loginApp` makes the login page answer 404 (verified). |

Silently dropped (no error): `css`, `launchpadApp`, `layout`, top-level `noSubmenuHover` (use `config.noSubmenuHover`),
`catOrder`, the `search…`/`used…` fields, any key the schema does not list (verified). `limitWidth` and
`hideSidemenu` are stored but change nothing — use `SHELL_WIDTH` and `config.verticalMenu`.

**Create defaults** (verified): `config` = `{ showAccessibilityFocusIndicator: true, enableTopMenu: true,
noSubmenuHover: true, pincodeTries: 5, pincodeLength: 4, pincodeKeyIterations: 40000 }`, `layout_preference: 0`,
`cat: []`, `enhancement: []`; `config` keys sent on create are merged over these.

## Launchpad Designer settings (`config.designer`)

Everything the Launchpad Designer saves under Appearance (verified round-trip). **Keys and values:
`reference/designer-keys.md`.**

```json
"designer": { "light": { "launchpadLayout": { "KEY": "value" }, "tileLayout": [ { "data": { } } ], "tileGroupLayout": [ { "data": { } } ] },
              "dark":  { "launchpadLayout": { }, "tileLayout": [ ], "tileGroupLayout": [ ] } }
```

- **Nothing is validated** (a misspelt key is stored, verified): copy keys exactly. Colours: any CSS colour.
- `tileLayout` / `tileGroupLayout` entries need `data`; with only `data` they style **every** tile / group (`TILE_BACK`,
  `TILE_TITLE`, `TILE_ICON_COLOR`, …; `HEAD_TEXT_CLR`, `HEAD_BORDER_CLR`, …). Entries with `screenId`, `catId`, `tileId`,
  `placement` are the Designer's per-item styling — keep them when re-sending `config`.
- **One tile's colour**: `CUSTOM_CSS` on `:root .nepTile<tile id> .nepFCard` (or the tile's `styleClass`); without
  `:root` the rule loses to the Designer's tile variables (verified).
- **No background image** (`PAGE_BACK_IMAGE: "None"`): also set `SHELL_BACK_COLOR` — else the header colour shows — and
  check that `HEAD_TEXT_CLR` contrasts with it (verified).
- **`CUSTOM_CSS`** loses its line breaks: `/* … */` comments only, a `//` breaks what follows. Hooks: `.nepGroupHeader<group id>`,
  `.nepCat<group id>`, `.nepScreen<group id>`, `.nepGroupHeader`, `.nepFCard`, `.nepTopMenu`, `.nepTopGroups`, `html.nepThemeDark`.
- **Brand colours: use a Theme Generator theme**; keep existing `THEME_OVERRIDE_*` keys unchanged.

## Themes (UI5 Theme Generator)

Reference a Theme Generator theme (`manage-theme-generator`) in the bucket of its brightness (verified):

```json
"launchpadLayout": { "THEME": "neptune-generated-light-<theme id>", "THEME_ORIGIN": "generator", "THEME_BASE": "sap_horizon",
  "THEME_ROOT": "", "THEME_CSS": "/public/css-generator/neptune-generated-light-<theme id>.css" }
```

Dark: `neptune-generated-dark-<id>` in both places, `THEME_BASE: "sap_horizon_dark"`, under `dark`; brightness via
`list_theme_generator` with `select` `id`, `name`, `brightness`. Standard theme: `THEME: "sap_horizon"`, `THEME_ORIGIN:
"sap"`. `customTheme` and `ui5Theme` do **not** apply a Theme Generator theme.

## Light and dark

| User asks | Set |
|---|---|
| "dark mode too" | fill `config.designer.dark` as fully as `light` (dark theme, light logo, `CUSTOM_CSS`, layouts, login keys); `layout_preference` 0/1/2 |
| "let users switch" | `layout_preference` 0, 1 or 2 on a **non-public** launchpad — users switch in user menu → Settings → Appearance |
| "light only" / "dark only" | `layout_preference` 3 / 4, one bucket |

- The mode picks one bucket; buckets never combine or inherit. **A mode without a bucket shows the default layout of
  that brightness** (verified) — with 0–2 never leave a bucket empty.
- `1`/`2` only set the first visit, and a later change of `layout_preference` does not move returning visitors: with `0`
  they keep the mode they last had (verified: switched from `3` to `0`, a dark-mode browser stayed light until its site
  data was cleared).
- Keep `LOGIN_PLACEMENT` equal in both buckets: the login page takes it from one bucket before it knows the mode.
- Details: `reference/settings.md` → Light and dark.

## Settings: what the user asks → what to set

Field list with Cockpit labels and values: **`reference/settings.md`**. `config.*` keys need the complete `config`.

| User asks | Set |
|---|---|
| "only managers may open it" | `roles: [{ "id": … }]` (`list_roles`) |
| "anyone without login" | `publicAccess: true` (Opening the launchpad) |
| "log in with Azure AD", "SSO only" | `defaultLoginIDP: <provider id>` + `config.hideLoginSelection: true` (+ `hideLoginLocal`); provider ids and which ones work: `reference/settings.md` → Authentication tab |
| "login page should say …", "our own login page" | `config.loginTitle` / `loginSubTitle`; `loginApp` (an existing app) |
| "let customers sign up" | `isExternal: true`, `emailPattern`, `extUserRoles` / `extUserDepartments` `[{ id, name }]` (needs working e-mail) |
| "English and German only" | `config.languages: ["EN","DE"]` + `defaultLanguage` / `fallbackLanguage` (include `EN` or set a fallback) |
| "installable on phones", "app icon" | `pwa_enable: true`, `pwa_title`, `pwa_displayMode`, `pwa_customImage*`, `pwa_themeColor` |
| "sign users out when idle", "PIN unlock" | `config.autolock` (seconds); PWA `config.pincode`, `enableWebAuth` (`reference/settings.md`) |
| "add an AI assistant" | `agentId` (`list_ai_agents`) + `config.agentText`, `agentIconSrc`, `chatboxPosition`, `loadAgentOnStart`, `agentParams` |
| "menu at the top / on the left", "one-line header" | `config.enableTopMenu` / `config.verticalMenu` (one of them); `config.oneLineTopMenu` (also hides title and user name) |
| "hide my name / search / back button / the header" | `config.hideUsername`, `hideSearch`, `hideBackButton`, `hideTopHeader` (then turn the other header flags off too) |
| "portal name next to the logo", "show the open app's title" | `config.showLaunchpadTitle` + `title`; `config.showAppTitle` |
| "cookie banner", "block the launchpad for maintenance" | `config.cookieDialog*`; `config.blackoutEnabled` + `blackoutTitle` / `blackoutMessage` |
| "open straight into one app", "footer buttons" | `startApp` / `startWebApp`; `launchpadFooter` |
| "run a script at start", "analytics on tile clicks" | Enhancement spots, or `header` for a snippet that only loads |

The main menu lists the `cat` groups by menu text (else title); **groups without a visible tile are not shown** (verified).

## Enhancement spots

`enhancement: [{ "name": "<spot>", "param": "<parameters>", "content": "<function body>", "active": true }]`, replaced
as a whole; spots, parameters and moments: `reference/settings.md` → Enhancement tab.

- Only `active: true` spots run; `config.enhancement` is generated from them — never write it (overwritten, verified).
- Names and parameters only from the spot table: all spots form one script, so a bad name (a space is accepted,
  verified) or a syntax error stops every spot. **One entry per name**: a second entry with the same name is stored
  and compiled after the first and silently replaces it (verified) — merge recipes into one spot, each in its own `try`.
- Catch runtime errors inside your code: those in `global`/`BeforeStartup` reach `console.error`, the others are logged
  only in debug mode; in `BeforeUpdate` an error or rejected Promise stops the tiles loading — always resolve.
- Spots never run on the login page of a launchpad without PWA.
- Spot code and `CUSTOM_CSS` reach every visitor (signed-out page, public launchpads): no secrets or internal notes,
  never the text `</script>` (the configuration sits in a `<script>` block).
- **Header slots**: `AppCacheShellCustomRight` (verified) and `AppCacheShellCustomLeft` (source) are `sap.m.HBox`
  controls a `BeforeStartup` spot can fill with links or buttons; guard with a flag against a second run.
- `AfterTileGroupRenderer` runs after every render of each section grid (`Container` = grid, `dataCat` = section):
  keep DOM touches idempotent. Recipes: `design-to-launchpad` → `reference/techniques.md` (Spot kit).

## Opening the launchpad

- `https://<host>/launchpad/<name>`: signed out → its login page (PWA: the launchpad page with the login inside).
  **Share the name URL** — `/launchpad/<id>` signed out gives the generic login page, HTTP 401 (verified).
- `https://<host>/public/launchpad/<name>` (anonymous) needs `publicAccess: true` and a licence with public access;
  otherwise HTTP 500 `… Launchpad not found` (verified).
- Open a name URL only after the create: one requested before kept answering 404 `The launchpad does not exist` on some
  requests for 15+ minutes while `/public/launchpad/<id>` worked (observed once).

## Verify (headless first)

1. **Re-read** with `get_launchpad` and compare with what you sent — the save response contains none of it.
2. **HTTP, only when your client can fetch URLs** (no session; served JSON is pretty-printed — match `"KEY": "value"`):

| `GET` | Expect |
|---|---|
| `/launchpad/<name>` (signed out) | `200`, `<title>Login - …`, `AppCache.CurrentConfig = '<name>'`, designer values of both buckets, compiled spots `sap.n.Enhancement.<name> = function` (verified). `500 … reading 'languages'` = no `config`. |
| `/public/launchpad/<name>` (public) | `200` full page: `header` verbatim, `"designer"`, `AppCache.layoutPreference = <n>`, `AppCache.isPublic = true` (verified). |
| `/public/css-generator/neptune-generated-<b>-<id>.css` | `200 text/css` starting `:root {`; unknown id → `404`, no UUID → `400` (verified). |
| `/user/logon/types?launchpad=<name>` | login settings: `defaultLoginIDP`, `launchpadIsExternal`, `settingsLaunchpad.config` (verified). |

3. **Visual check** (browser clients): the review in `design-to-launchpad` → Verify step 3; otherwise report it as pending.

## Workflows

**Create a designed launchpad**: tile groups with tiles exist → optional theme → name free → one `save_launchpad` with
`name`, `title`, `package`, `cat`, `layout_preference` and `config` = create defaults + menu keys + `designer` → Verify.

```json
save_launchpad({ "launchpad": { "name": "sales_portal", "title": "Sales Portal", "package": "<package id>",
  "cat": [{ "id": "<home tile group>" }, { "id": "<reports tile group>" }], "layout_preference": 3,
  "config": { "showAccessibilityFocusIndicator": true, "enableTopMenu": true, "oneLineTopMenu": true,
    "noSubmenuHover": true, "pincodeTries": 5, "pincodeLength": 4, "pincodeKeyIterations": 40000,
    "designer": { "light": {
        "launchpadLayout": { "TOP_BACK_COLOR": "#0b1f3a", "TOP_TXT_COLOR": "#ffffff", "HEADER_HEIGHT": "4rem",
          "EXTEND_HEADER_COLOR": true, "SHELL_WIDTH": "XLarge", "SHELL_BACK_COLOR": "#eef2f7", "PAGE_BACK_IMAGE": "None",
          "TOP_LOGO": "/media/root/acme_brand/logo.svg", "CUSTOM_CSS": ".nepGroupHeader{border-bottom:3px solid #ff6a00;}" },
        "tileLayout": [{ "data": { "TILE_BACK": "#ffffff", "TILE_TITLE": "#0b1f3a", "TILE_ICON_COLOR": "#ff6a00" } }],
        "tileGroupLayout": [{ "data": { "HEAD_TEXT_CLR": "#0b1f3a", "HEAD_BORDER_CLR": "#ff6a00", "HEAD_BORDER_WDT": "3px" } }] },
      "dark": { "launchpadLayout": {}, "tileLayout": [], "tileGroupLayout": [] } } } } })
```

**Restyle / change a setting**: `get_launchpad` → change the copy (keep the Designer's per-item entries) →
`save_launchpad({ id, config: <complete copy> })` → Verify. **Tile groups**: send the full ordered `cat`. **Delete**:
confirm the name → `delete_launchpad` → `get_launchpad` → `Not Found`.

## Listing and filtering

- `where: { "name": { "operation": "ILike", "value": "sales%" } }`; `where.id` is ignored (verified).
- **Put the sort field in `select`**, else `Error listing launchpad` (verified). Page with `skip` = `nextSkip` while
  `hasMore`; `take` max 200.

## Errors

| Signal | Meaning / fix |
|---|---|
| `name '<name>' already exists!` | Duplicate name on create or rename (verified). |
| `Not Found` | Unknown id. |
| `Error saving launchpad` | No `name` on create; unknown `id` without `name`; a `cat` id that is no tile group; an unknown `agentId` / `iaAgentId` (verified). Re-read before retrying. |
| `MCP error -32602: Input validation error: … at launchpad.<field>` | Wrong type, length, enum or UUID at that path (verified). Nothing saved. |
| Signed-out `/launchpad/<name>` answers 404 | `loginApp` names no app (verified): set an existing app or `null`. |
| `Package is a required field` / `Your default package cannot be used: …` | Send `package`. `Access denied: no permission for launchpad` = missing Launchpad permission. |
| `<name> is locked by <user> since <time>` | Open for editing in the Cockpit or Launchpad Designer; retry later. |

## What MCP can NOT do

- Generate the Designer's Custom Theme Override from brand/highlight/font inputs — use a Theme Generator theme.
- Create, edit or list Global Styles or Launchpad Layouts — reference an existing id only.
- Read the instance's default Launchpad Layouts (System Settings), which fill a missing bucket.
- Check stored references: app names, `loginApp`, `customTheme`, `defaultLoginIDP`, email template ids, image URLs and
  designer keys are saved unchecked.
- Run the Cockpit's convenience rules (Hide-Header cascade, menu exclusions, PWA → PIN reset, fallback language, value
  ranges, spot parameters) — send the related fields yourself (`reference/settings.md`, last section).
- Render the launchpad, or create tiles and tile groups.

## Permissions

Launchpad permission (`launchpad`): list with any access, `Get` with display, `Save`/`Del` with edit access;
role-protected packages need package edit access; `get_system_settings` needs System Settings access.

## Related skills

- **`manage-tile-groups`**, **`manage-tiles`** — the groups in `cat` and their tiles; **`manage-theme-generator`** — `THEME`.
- **`manage-fonts`**, **`manage-media`**, **`upload-files`** — fonts, logo and background URLs.
- **`design-to-launchpad`** — a design into a launchpad; **`manage-apps`**, **`manage-webapps`** — `startApp`, `loginApp`, footer.
