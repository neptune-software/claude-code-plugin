---
name: manage-webapps
description: Create, update, inspect, or delete Neptune DXP Web Apps — code-first apps served as static files at /webapp/<name> — via the MCP tools `list_webapps`, `get_webapp`, `save_webapp`, `delete_webapp`. Use when the user wants a code-first web app (React/Vue/vanilla SPA, dashboard, landing page) rather than a drag-and-drop App Designer app, or wants to change its files, make it public, or remove it. Trigger phrases include "create a web app", "new react app", "new vue app", "build me a dashboard web app", "put these files in the web app", "list web apps", "update the webapp", "delete the web app". Read this BEFORE composing any `save_webapp` payload — how you deliver the files decides whether the app renders or serves a blank page.
---

# Managing Neptune DXP Web Apps via MCP

A Web App is a **static file host**. Neptune DXP - Open Edition serves exactly the bytes you store: `runtime.page` at `/webapp/<name>`, and each `runtime.assets[]` entry at `/webapp/<name><path>`. Nothing is compiled, bundled or rendered server-side — `type: "react" | "vue"` is a label that changes nothing about hosting. Anything a browser can run from plain HTML/CSS/JS works; anything needing a build (JSX, TypeScript, Vue SFCs, npm imports) must be built **before** it is stored. `save_webapp` writes the same records the Cockpit's **Web App Manager** edits, and content is served immediately — there is no activate step.

## The decision that determines success: how the bytes get in

`runtime.page` is stored and served as **plain text**. Each asset's `source` is decoded as **base64 at serve time** — whatever you put there, valid or not. Nothing validates it on the way in, and `get_webapp` never gives it back, so a mistake is invisible until a browser loads the page.

A base64 string missing (or gaining) one character decodes correctly up to that point and **as garbage from there to the end of the file** — the save succeeds, the app shows a blank page, and the console reports `Unterminated string constant` or `Unexpected token`. A `source` that isn't base64 at all is stored verbatim and served as a handful of meaningless bytes.

Choose the path by **who produces the bytes**:

| You are… | Do this | Never do this |
|---|---|---|
| A model composing the app in the conversation (no shell) | **Single-file app**: all HTML, `<style>` and `<script>` inline in `runtime.page`, with `"assets": []`. No base64 exists in the payload, so nothing can be corrupted. | Do not write base64 yourself — not even for a 200-byte CSS file. Do not split the app into `app.js` / `styles.css`. |
| An agent or developer with a shell (or CI) | Build off-platform, then either hand the folder/zip to the Cockpit **Import**, or send each file as an asset whose `source` came from the `base64` command and passed the checks below. | Do not retype, truncate or "tidy" a base64 string, and never let a model transcribe one. |

### Single-file app — the default

```json
save_webapp({ "webapp": {
  "name": "sales-dashboard",
  "type": "react",
  "description": "KPI dashboard",
  "settings": { "mainFilePath": "index.html" },
  "runtime": {
    "name": "sales-dashboard",
    "publicAccess": false,
    "page": "<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>Sales dashboard</title><style> …all CSS… </style></head><body><div id=\"root\"></div><script> …all JS… </script></body></html>",
    "assets": []
  }
}})
```

- Plain HTML/CSS/JS renders as-is. For React or Vue without a build, load the UMD bundles from a CDN and use `React.createElement` / the Vue options API — or add Babel standalone and write JSX in an inline `<script type="text/babel">`. Pin exact library versions, add `crossorigin="anonymous"`, and add `integrity="sha384-…"` when you can compute the hash with a tool. In-browser Babel suits demos and prototypes; production bundles are built and uploaded instead.
- Keep every `<script>` and `<style>` inline. Only reach for a separate asset when a file genuinely cannot be inlined.
- Escape for JSON (`"` → `\"`, newlines → `\n`); the HTML needs no other encoding.

### Built apps (shell available)

1. Build with absolute URLs — for Vite, `base: '/webapp/<name>/'` (leading **and** trailing slash) so the entry HTML references `/webapp/<name>/assets/index.js`. Relative URLs break, because at `/webapp/<name>` (no trailing slash) the browser resolves `assets/x.js` to `/webapp/assets/x.js`.
2. For multi-file builds prefer the Cockpit: **Web App Manager → Edit → Import → Zip / Folder**. The server encodes the bytes itself, so no base64 passes through the conversation. It needs `settings.mainFilePath` set and a file at that path inside the upload (otherwise `Missing index.html file in zip`). Import replaces the whole asset set, one file at a time — a failure part-way leaves a partial set, so re-import rather than assume.
3. Over MCP, generate every `source` with a tool — `base64 -w0 file` (Linux) or `base64 -i file | tr -d '\n'` (macOS) — and check each string before sending: length a multiple of 4, characters only `A-Z a-z 0-9 + / =`, and `base64 -d` round-trips byte-identically. Encode **once**: look at the file first (`head -c 40`) — if it already reads like `aW1wb3J0…` it is base64 already, and encoding it again serves base64 text as the script. `runtime.page` takes the **contents** of the entry HTML as plain text — never base64 it.
4. Keep files small. A 1 MB bundle becomes ~1.3 MB of base64 inside a single JSON argument; several small assets survive transit far better than one large one.
5. Stamp the build into the entry HTML — a comment or `<meta name="build" content="<version or commit>">` in `runtime.page`. `get_webapp` returns `page`, so you can confirm *which* build is live without a browser; asset timestamps can't tell you that (see Tools).

## Tools

| Tool | Behavior |
|---|---|
| `list_webapps` | Web apps. Supports `listOptions` (`where`/`select`/`take`/`skip`/`order`) to filter, project, and sort by field — the only way to look one up by name. |
| `get_webapp({ id })` | The record plus `runtime` (`id`, `page`, `name`, `publicAccess`) and `assets[]` carrying **`path`, `createdAt`, `updatedAt` only — never `source`**. By id only. The timestamps say when a file was last written, not what it contains — re-uploading an old build stamps fresh dates. |
| `save_webapp({ webapp })` | Create (no `id`) or update (with `id`). Returns the saved record; assets that were written echo back with their `source`. |
| `delete_webapp({ id })` | Permanent, no undo; removes the app and all its files. Returns `Successfully deleted WebApp`. |

## `save_webapp` — the contract

**Required to create:** `name` and `runtime`. `type` is optional and defaults to `"react"`. Everything else is optional.

| Field | Rules |
|---|---|
| `name` | Must be unique, and may contain only letters, digits, `-` and `_`; anything else is rejected. This is the URL: `/webapp/<name>`. |
| `runtime` | **Mandatory on create *and* update** — without it the save fails `WebApp must have a runtime`. |
| `runtime.name` | **Must equal `name`.** It defaults to `name` only when you omit it; if you send a different value the app is served at the *other* URL — and at that URL it is served **without the login check** (verified). Never let the two drift, especially when renaming. |
| `runtime.id` | **Required in every payload that contains `runtime.assets`** (its value is the web app's `id`). Omit it and the save fails `Error saving WebApp` no matter what the array holds (verified). Not needed when the payload has no `assets` key, and not applicable on create. |
| `runtime.page` | Entry HTML, plain text. Omit it on create and the app serves the platform's "Please upload assets to your Web Application" placeholder. |
| `runtime.assets[]` | `{ "path": "/styles.css", "source": "<base64>" }`. `source` is required on create — an entry without one fails the whole save. `runtimeId` on the entry is not needed. |
| `path` | Must begin with `/` and matches the URL **exactly and case-sensitively** (`/App.js` ≠ `/app.js`). Nothing validates it: a path without the leading slash, or with the wrong case, is stored, listed — and unreachable forever (verified). Sub-folders are fine (`/assets/index.js`); 256 characters max. |
| `runtime.publicAccess` | `true` serves the app to anonymous visitors; `false` (default) requires a logged-in user. |
| `settings` | **Always send `{ "mainFilePath": "index.html" }`** on create. The Cockpit's Import Zip/Folder needs it to find the entry file and fails without it; the Cockpit sets it on apps it creates, MCP does not. |
| `description`, `package` (package id) | Optional. |
| `id`, `ver`, `createdAt`/`updatedAt`, `createdBy`/`changedBy` | Managed for you; `ver` is regenerated on every save. |

### Unknown keys vanish — the cause of "created but 0 assets"

The payload is free-form, and **any key that isn't part of a web app is dropped silently, with no error or warning**. Assets sent at the top level instead of inside `runtime` are simply discarded, leaving an app with the placeholder page and zero files (verified — this is the classic report). The exception is `fileSystemObjects`, which is recognised and fails the save outright.

So: **assets belong inside `runtime`**, and after every create, confirm the response's `runtime.assets` lists every path you sent. If a path is missing, the payload shape was wrong — the platform will not tell you.

### Update semantics (all verified)

The safe pattern is **`get_webapp` → change what you need in the returned object → send it back**, because the returned object already carries `runtime.id` and `runtime.name`.

| You send on update | Result |
|---|---|
| `runtime` **without** an `assets` key (no `runtime.id` needed) | Files untouched; `page`, `publicAccess` and metadata updated. **This is how to change the entry HTML.** |
| `runtime.id` + every existing path, entries carrying only `path` | Sources preserved — safe to send back exactly what `get_webapp` returned. |
| `runtime.id` + every existing path, some with a new `source` | Those files replaced, the rest kept. **This is how to change a file.** |
| `runtime.id` + every existing path **plus new ones** | New files added. **This is how to add a file.** |
| Any `assets` array **without `runtime.id`** | `Error saving WebApp` — nothing changes. |
| An `assets` array that **omits an existing path**, or is `[]` | `Error saving WebApp` — nothing changes. **There is no way to delete one file over MCP** (re-import in the Cockpit, or delete and recreate the app). |
| `runtime` omitted entirely | `WebApp must have a runtime`. |
| `page` omitted | The stored page is kept. |

A failed save changes nothing at all — page, files and settings stay exactly as they were.

## How the app is served

- `/webapp/<name>` and `/webapp/<name>/` return the page; `/webapp/<name><path>` returns that asset, with `Content-Type` from the file extension (so give every asset a real extension).
- **Any unknown sub-path returns the entry page** — client-side routers with deep links work with no configuration.
- That fallback also **masks every asset miss**: a wrong or mis-cased path returns the entry HTML with status 200, and the browser reports `Unexpected token '<'` instead of a 404. When a file "isn't loading", check the response `Content-Type` — `text/html` where you expected CSS or JS means the path is wrong, not the content.
- Reference your own files absolutely (`/webapp/<name>/app.js`), never relatively.
- Access: `publicAccess: true` → anyone; otherwise a logged-in user (and, if the app was restricted to roles in the Cockpit, one of those roles). Anonymous requests to a private app get the platform login page.
- The page is same-origin with the platform APIs, so `fetch('/api/serverscript/...')` runs as the logged-in user — no token handling in the page.
- Browsers cache `/webapp/...` files like any static files. After an update, hard-refresh (or ship hashed filenames) before concluding a change "didn't land".
- Content changes take effect immediately. Access changes (`publicAccess`, roles) are cached briefly, so a switch to private can take a few seconds to bite. After `delete_webapp` the files stop resolving at once, but **the entry page can still be served from cache** — treat delete as "removed", not as "instantly unreachable", and re-check the URL if the content was sensitive.

## Errors, and what they mean

| Message | Cause |
|---|---|
| `WebApp names can only contain letters, numbers, hyphens (-), and underscores (_).` | The name contains a space, dot, slash or other character. |
| `name '<name>' already exists!` | Another web app already has that name. Choose another, or update the existing one by `id`. |
| `WebApp must have a runtime` | No `runtime` object in the payload — on create or update. |
| `Error saving WebApp` | A save the platform refused, without saying why. In order of likelihood: an `assets` array with no `runtime.id`; an array that omits an existing path or is empty; an asset with no `source` on create; `fileSystemObjects` in the payload; an unknown id in a relation you sent. Nothing was changed — fix the payload and retry. |
| `Missing index.html file in zip` (Cockpit import) | The upload has no file at `settings.mainFilePath`, or `settings` was never set. |
| Blank page; console shows `Unterminated string constant` / `Unexpected token`, text full of `` characters | A corrupted base64 `source`. Re-send that file with tool-generated base64, or move the app to a single-file page. |
| Script served as text starting like `aW1wb3J0…`; console shows a `SyntaxError` on line 1 (message varies) or nothing at all and the page stays blank | The file was base64 **twice** — its `source` was computed from content that was already base64. Encode the real bytes once. |
| Console shows `Unexpected token '<'` for a script or stylesheet | That asset path doesn't exist (leading slash missing, wrong case, wrong folder) and the fallback returned the entry page. |
| Page shows "Please upload assets to your Web Application" | `runtime.page` was never set — created without `page`, or the files were sent outside `runtime`. |

## Cannot

- Cannot read a stored file back over MCP — `get_webapp` returns paths and timestamps only, and there is no download tool. The content check is opening the URL in a browser.
- Cannot delete a single file over MCP, and cannot send a partial asset list.
- Cannot store a file as plain text: every `source` is decoded as base64 when served, whatever you put in it.
- Cannot build, bundle or transpile on the platform — upload browser-ready files.
- Cannot use the Cockpit's Import Zip/Folder or Export Zip over MCP; they exist only in the Cockpit. Export Zip also contains **only the assets, never `runtime.page`**, so a single-file app exports to a zip that cannot be imported back, and binary files do not survive the round trip byte-identically.

## Working flow

1. `list_webapps` (with a `where` on `name`) — confirm the name is free, or find the id.
2. `get_webapp({ id })` before any update — it gives you the `runtime.id` and `runtime.name` you must send back.
3. `save_webapp` — then check the response: `runtime.assets` lists every path you sent, and `page` is your HTML (with your build marker, if you stamp one).
4. Give the user `https://<host>/webapp/<name>` and ask them to open it. That is the only real content check.
5. `delete_webapp({ id })` when it's no longer wanted.

## Permissions

All four tools require the `webapp` role: `List` (`list_webapps`), `Get`, `Save`, `Del` respectively.

## Related skills

- **`dxp-overview`** — how Web Apps differ from App Designer apps, and packages.
- **`manage-apis`** / **`manage-server-scripts`** — the backend a web app calls at `/api/serverscript/...`.
- **`manage-apps`** — the drag-and-drop App Designer alternative.
