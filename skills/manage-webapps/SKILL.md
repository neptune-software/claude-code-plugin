---
name: manage-webapps
description: Create, update, inspect, or delete Neptune DXP Web Apps (code-first apps served as static files, typically a compiled React or Vue build) via the MCP tools `list_webapps`, `get_webapp`, `save_webapp`, `delete_webapp`. Use when the user wants a code-first web app rather than a drag-and-drop App Designer app. Trigger phrases include "create a web app", "new react app", "new vue app", "list web apps", "update the webapp", "delete the web app".
---

# Managing Neptune DXP Web Apps via MCP

A Web App is a **code-first** app that Planet 9 serves as **plain static files** from a shared route, `/webapp/<name>[/<path>]`. At runtime it's just a static file host — no server-side framework runtime, no SSR, no per-app server (every web app shares the same route). The files you upload are typically a compiled **React** or **Vue** build, but the framework only matters when you build it (off-platform); what you upload and what gets served is framework-agnostic HTML/JS/CSS. It's the code-first alternative to a drag-and-drop App Designer (UI5) app. Stored in the `webapp` table; the MCP tools are the same records the Cockpit's Web App editor uses. See `dxp-overview` for the App vs Web App distinction.

## Tools

| Tool | Purpose |
|---|---|
| `list_webapps` | All web apps (id, name, type, description, ...). |
| `get_webapp({ id })` | Full record, including its `runtime` (the served `page` + `assets`) and `settings`. |
| `save_webapp({ webapp })` | Create (no `id`) or update (with `id`). Pass the full object. |
| `delete_webapp({ id })` | Permanent delete (cascades the runtime and its assets). |

## Required for a new web app

- `name` (string) — **unique** across web apps. A duplicate is rejected at the DB level. Allowed characters: letters, digits, `-`, `_`.
- `type` — `"react"` or `"vue"`. Defaults to `"react"` if omitted. **Authoring/build hint only** — it picks the scaffolding/build template and is never read at serve time, so it doesn't change how the app is hosted.
- `runtime` (object) — **required**, even on create. Omitting it fails with `WebApp must have a runtime`. A minimal value is `{ "name": "<same as name>", "publicAccess": false, "assets": [] }`. (Verified against a running server — the MCP tool's schema text lists only name/type, but the platform rejects a save with no `runtime`.) This is also **what actually gets served**: the server fills `runtime.page` with the app's HTML (a placeholder "upload assets" page until you deploy real ones) and `runtime.assets` with the static files.

## Fields worth knowing

| Field | Meaning |
|---|---|
| `description` | Free text. |
| `settings` | JSON object — runtime configuration for the app. |
| `runtime.page` | The HTML served at `/webapp/<name>` (by `getPage`) — your entry document. |
| `runtime.assets[]` | The static files, each `{ runtimeId, path: "/foo.css", source: "<base64>" }`, served at `/webapp/<name><path>` with content-type inferred from the extension. |
| `onlyRuntime` | `true` ships only the runtime (the served files), with no separate editable copy. |
| `package` | UUID of a package to assign the web app to (packages are covered in `dxp-overview`). |
| `apis` | API artifacts the web app is linked to (see `manage-apis`). |

## Gotchas

- **Identity is `name`, update is keyed by `id`.** Omit `id` to create, include it to update.
- **The served surface is just `runtime.page` + `runtime.assets`.** Set `runtime.page` to your entry HTML and put every other file in `runtime.assets` as `{ runtimeId, path: "/foo.js", source: "<base64>" }`; they serve at `/webapp/<name><path>` with content-type from the extension. Reference assets by **absolute** URL (`/webapp/<name>/styles.css`) so they resolve with or without a trailing slash. (This mirrors the Cockpit Web App Manager: a General tab for metadata and an Assets tab for these files.)
- **`runtime.assets` (and `apis`) are replaced wholesale — no merge.** A save overwrites the array with exactly what you pass, so to change one file you must `get_webapp`, mutate the **whole** `runtime` (keep `page` and every asset you want to retain), then `save_webapp` it — a `runtime` sent without an asset drops it.
- **`delete_webapp` returns a status string**, not the deleted record. The delete is permanent and cascades the runtime and its assets.
- **Auto fields are read-only** — `id`, `ver`, `createdAt`/`updatedAt`/`createdBy`/`changedBy`.

## Discovery flow

1. `list_webapps` — browse, get ids
2. `get_webapp({ id })` — inspect `runtime` (page/assets) and settings before editing
3. `save_webapp({ webapp })` — create or update
4. `delete_webapp({ id })` — remove

## Permissions

All four tools require the `webapp` role: `List` (`list_webapps`), `Get`, `Save`, `Del` respectively.

## Related skills

- **`dxp-overview`** — App vs Web App, and how web apps fit the artifact model.
- **`manage-apps`** — drag-and-drop App Designer apps, the UI5 alternative.
- **`manage-apis`** — the API artifacts a web app calls.
