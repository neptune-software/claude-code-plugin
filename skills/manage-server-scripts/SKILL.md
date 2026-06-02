---
name: manage-server-scripts
description: Author and organize Neptune DXP server scripts and script projects via the MCP tools `list_script_projects`, `get_script_project`, `create_script_project`, `delete_script_project`, `get_server_script`, `save_server_script`, `delete_server_script`, `list_ungrouped_scripts`. Use when the user wants to write, read, create, edit, organize, or delete a server-side JS/TS script — as opposed to executing one. Trigger phrases include "create a server script", "edit the script", "new script project", "group these scripts", "list the scripts", "delete the script". For running/testing a script see the run-server-script skill.
---

# Authoring Neptune DXP server scripts via MCP

A server script is a JS/TS function that runs server-side (Node.js) on an API request, reading `req` and writing to `result`. Scripts can be grouped into **script projects** or left ungrouped. These tools cover the *authoring* lifecycle — create, read, edit, organize, delete. To *execute* a script, use the `run-server-script` skill (`run_server_script`).

Read the `dxp-overview` skill first for the platform rules that make server scripts not-quite-Node: no `require`/`import` (use the `modules.*` global), no `res` object (write to `result`), and `req.p9` API context populated only on the HTTP route.

## Tools

| Tool | Purpose |
|---|---|
| `list_script_projects` | All projects with their nested scripts. The main browse entry point. |
| `get_script_project({ id })` | One project and its scripts. |
| `create_script_project({ name, description?, package? })` | New empty project to group scripts. |
| `delete_script_project({ id })` | Delete a project. |
| `get_server_script({ id })` | One script **including its source `content`**. |
| `save_server_script({ id?, name, content, projectId?, language?, description?, apis?, entitySets?, agents?, globalScripts?, externalModules? })` | Create (no `id`) or update (with `id`). |
| `delete_server_script({ id, projectId? })` | Delete a script (pass `projectId` to bump the project version). |
| `list_ungrouped_scripts` | Scripts not assigned to any project. |

## Saving a script

`save_server_script` arguments:

- `name` (required) — script name.
- `content` (required) — the source code.
- `id` (optional) — **omit to create, include to update.**
- `projectId` (optional) — script project id to file the script under.
- `language` (optional) — `"javascript"` (default) or `"typescript"`.
- `description` (optional).
- `apis`, `entitySets`, `agents`, `globalScripts`, `externalModules` (optional relation arrays) — see the association rule below.

**TypeScript is auto-transpiled.** When `language: "typescript"`, the tool transpiles `content` (ES2015 modules / ES2017 target, inline source map) and stores the JS as `transpiledContent`. You write TS; the runtime runs the transpiled JS.

## Associations: what you don't pass isn't stored (read this before updating a script)

Each relation array — `apis`, `entitySets`, `agents`, `globalScripts`, `externalModules` — is stored as-passed. **Whatever you don't include is not stored**, so a body-only update (`name`/`content`) drops every association the script had. To keep them, `get_server_script({ id })` first and re-send the arrays you want to keep.

The API→script link of an `apiType: "script"` endpoint lives on the *API* side (see `manage-apis`), so a body-only re-save won't break the endpoint — but it still clears the script's own relation arrays unless you re-send them.

## Don't

- **Don't create ungrouped scripts.** Always pass `projectId` so the script lands in a project — make one with `create_script_project` first if none fits. Ungrouped scripts are harder to find and organize and miss the project's version tracking; reach for `list_ungrouped_scripts` to *clean them up*, not as a place to add new ones.
- **Don't write internal tables.** A script can run raw SQL/TypeORM against anything, but only ever insert/update/delete in **external** `entityset_*` (data) tables. Internal platform tables (`app`, `api`, `dictionary`, …) are read-only at most — mutating them could brick the instance, and is therefore highly discouraged. See `dxp-overview` for the split.

## Other gotchas

- **`create_script_project` makes an empty project.** Add scripts afterward with `save_server_script({ projectId })`.
- **`delete_server_script` — pass `projectId`** when the script belongs to a project, so the project's version (`ver`) is regenerated. Without it the script is deleted but the project version goes stale.
- **`list_ungrouped_scripts` returns metadata only** (id, name, description, changedBy, updatedAt, useAsGlobalScript, ver) — no `content`. Use `get_server_script({ id })` to get the source.
- **Global scripts** (`useAsGlobalScript: true`) are callable from other scripts. That `useAsGlobalScript` flag is shown in listings but isn't settable via `save_server_script` (no parameter for it) — set it in the Script Editor. (Distinct from the `globalScripts` array, which links the *other* global scripts this script calls.)

## Discovery flow

1. `list_script_projects` (or `list_ungrouped_scripts`) — browse, get ids
2. `get_server_script({ id })` — read the source and existing associations
3. `save_server_script(...)` — create or edit
4. `run_server_script(...)` — test it (see the `run-server-script` skill)

## Permissions

All authoring tools require the `scripteditor` role: `List` (`list_script_projects`, `list_ungrouped_scripts`), `Get`, `Save` (`create_script_project`, `save_server_script`), `Del` (both delete tools). Execution (`run_server_script`) requires `scripteditor` with method `Run`.

## Related skills

- **`run-server-script`** — execute a script by id (the runtime counterpart to this skill).
- **`dxp-overview`** — `modules.*` loading, `result` vs `res`, `req.p9` context — the platform rules every script depends on.
- **`manage-apis`** — wire a script to an HTTP endpoint via an `apiType: "script"` API.
- **`manage-npm-modules`** — make third-party packages available to scripts as `modules.*`.
