---
name: manage-apps
description: Create, update, inspect, activate, or delete Neptune DXP App Designer applications via the MCP tools `list_apps`, `get_app`, `save_app`, `activate_app`, `delete_app`. Use when the user wants to add an app, edit an app definition, change its appType, publish/activate edits to runtime, or remove an app. Trigger phrases include "create an app", "list the apps", "update the app", "activate the app", "publish the app", "delete this app", "make a building block", "new launchpad app".
---

# Managing Neptune DXP App Designer applications via MCP

An App Designer application is a UI5/OpenUI5 UI built in the Cockpit's App Designer (drag-and-drop). It lives in two layers: a **design-time** definition (the `app` table, what App Designer opens and edits) and a **runtime** definition (`app_runtime`, what end users load on the Launchpad). The MCP tools write the design-time layer; nothing reaches runtime users until you **activate**. See the `dxp-overview` skill for where apps sit in the platform.

> **Hint — building the UI:** there's a dedicated **Agent inside App Designer (in the browser)** that's well suited to authoring an app's actual UI. When a user wants a new app, ask first how they'd like to build it — with the App Designer Agent in the browser, or here with the MCP tools — before creating anything. If they pick the browser Agent, open their browser at `<host>/appdesigner?application=<appname>`, where `<host>` is the same base URL this Neptune DXP MCP server is connected to. If they pick the MCP tools (or have no preference), go ahead and build it out with `save_app`.

## Tools

| Tool | Purpose |
|---|---|
| `list_apps` | All apps with id/name/description/type. No nested component tree. |
| `get_app({ id })` | Full design-time record: components, data models, resources, event handlers, title, status. Can be large. |
| `save_app({ app })` | Create (no `id`) or update (with `id`). Writes the design-time `app` table only. |
| `activate_app({ id })` | Push design-time → runtime, regenerate `ver`, compile CSS. Required to make edits live. |
| `delete_app({ id })` | Permanent delete. No undo. |

## Required for a new app

- `application` (string) — the **unique technical name**. This is the create-key, not `name`. Omitting it on create returns `save_app requires an "application" field for new apps`.
- `appType` — see below. **Always set it explicitly.** It is *not* auto-defaulted by `save_app`: omitting it creates the app with `appType: null` (an untyped app), which the cockpit and runtime mis-handle. (Verified against a running 24.15 server — omitting `appType` is accepted but stores `null`, it does not default to `"A"`.)

A name collision returns `An application named "<name>" already exists` (and notes `(soft-deleted)` if a deleted app holds the name).

## `appType` — pick it correctly up front

The cockpit and runtime both branch on `appType`. It is a single-character enum:

| Value | Meaning |
|---|---|
| `"A"` | Application (a normal app) — the default |
| `"C"` | Building block (reusable component embedded in other apps) |
| `"L"` | Launchpad (the tile/role end-user surface) |
| `"F"` | Adaptive app (data-driven; see the `manage-adaptive` skill) |
| `"E"` | Custom component |

`get_app.status` is `"Active"`, `"Inactive (Revised)"` or `null` (set by activation, not by you). `null` is valid and means the app has not been activated yet. Use this field to check activation state without calling `activate_app`.

Use `get_app({ id })` and check `status` when reasoning about whether design-time app changes are active/current. Do not use `list_apps.disabled` for this; `disabled` only means the runtime app is enabled/disabled.

## The save → activate cycle (the thing that bites people)

`save_app` writes design-time only. **Runtime users see nothing until `activate_app` runs.** `get_app({ id })` is the tool that reports the design-time activation state via `status`. The normal flow is:

1. `save_app({ app })` — persist the edit
2. `activate_app({ id })` — compile and publish

`activate_app` returns `{ id, application, status: "activated", ver }`. It does real work — pushing the definition to runtime, regenerating the version, and compiling SASS/CSS — so it can fail in specific ways:

| Error kind | Meaning |
|---|---|
| `cyclic_dependency` | Custom-component (`appType: "C"`/`"E"`) dependency cycle in the named app |
| `missing_custom_component` | The app references custom component(s) that don't exist (names listed) |
| `sass_compilation_error` | The app's SCSS failed to compile |
| `multi_dev_conflict` | Another developer's concurrent change conflicts |
| `persistence_error` | The runtime write failed |

If `get_app` opens an app but Launchpad users report it's stale or missing, the usual cause is a `save_app` without a following `activate_app`.

## Gotchas

- **`application` is the identity, `name`/`title` are labels.** Rename `title` freely; changing `application` is effectively a new app. The server **lowercases** the technical name on save (`MyApp` → `myapp`), so don't rely on the casing you sent.
- **Update is keyed by `id`, not by `application`.** Include `id` to update an existing app; omit it to create.
- **Nested arrays are replaced, not merged.** Components, data models, and resources in the object you pass overwrite what's stored. To tweak one piece: `get_app`, mutate the returned object, `save_app` the whole thing.
- **Auto fields are read-only in practice** — `id`, `ver`, `createdAt`/`updatedAt`/`createdBy`/`changedBy`. Don't hand-set them; activation owns `ver`.
- **`delete_app` can be blocked** by `has_i18n_enhancements` (the app has translation enhancements) — the error carries an explanatory message.
- **App resources are client-side.** App Designer "JavaScript" runs in the browser as UI5 controller code — it is NOT a server script. Don't confuse the two (see `dxp-overview`).

## Discovery flow

1. `list_apps` — browse, get ids and `application` names
2. `get_app({ id })` — inspect before editing
3. `save_app({ app })` → `activate_app({ id })` — change, then publish
4. `delete_app({ id })` — remove

## Permissions

All five tools require the `appdesigner` role: `List` (`list_apps`), `Get`, `Save` (both `save_app` and `activate_app`), and `Del` respectively.

## Related skills

- **`dxp-overview`** — what an app is and how it connects to APIs, scripts, and the Launchpad.
- **`manage-webapps`** — code-first React/Vue apps, the alternative to App Designer.
- **`manage-adaptive`** — data-driven Adaptive apps (`appType: "F"`).
