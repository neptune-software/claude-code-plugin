---
name: manage-server-scripts
description: Author and organize Neptune DXP server scripts and script projects via the MCP tools `list_script_projects`, `get_script_project`, `create_script_project`, `delete_script_project`, `get_server_script`, `save_server_script`, `delete_server_script`, `list_ungrouped_scripts`. Use when the user wants to write, read, create, edit, organize, or delete a server-side JS/TS script — including scripts that read or write table data (link the table via `entitySets`, use `entities.<name>`). Trigger phrases include "create a server script", "edit the script", "new script project", "group these scripts", "list the scripts", "delete the script", "insert data from a script", "add mock/test data", "read the table in the script". For running/testing a script see the run-server-script skill.
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
- `description` (optional) — **omitting it on an update resets the stored description to `""`** (verified), so re-send it.
- `apis`, `entitySets`, `agents`, `globalScripts`, `externalModules` (optional relation arrays) — see Links below.

**TypeScript is auto-transpiled.** When `language: "typescript"`, the tool transpiles `content` (ES2015 modules / ES2017 target, inline source map) and stores the JS as `transpiledContent`. You write TS; the runtime runs the transpiled JS.

## Links: what you don't pass isn't stored (read this before updating a script)

Each relation array is stored as-passed — **whatever you don't include is not stored** (verified live), so a body-only update (`name`/`content`) drops every link the script had. To keep them, `get_server_script({ id })` first and re-send the arrays you want to keep. Each link creates a named accessor in the script's context:

| Array | Item shape | Gives the script |
|---|---|---|
| `entitySets` | `{ id: <dictionary id>, name: <table name>, contextname }` | `entities.<contextname>` — typed table access (see next section) and `tables.<contextname>` (legacy) |
| `apis` | `{ id: <operation/path id>, parent: <API artifact id>, name, contextname, method }` | `apis.<contextname>(options)` — calls that API operation with the API's auth/trace/endpoints applied. Table-type APIs throw "use the table directly" — link the table instead. |
| `agents` | `{ id, name, contextname }` | `agents.<contextname>({ input, ... })` — invoke an AI agent |
| `globalScripts` | `{ id, name, contextname }` | `globals.<contextname>` — the linked global script's exports |
| `externalModules` | `{ id, name, contextname, path?, subPath? }` | `modules.<contextname>` — the npm module (see manage-npm-modules) |

The API→script link of an `apiType: "script"` endpoint lives on the *API* side (see `manage-apis`), so a body-only re-save won't break the endpoint — but it still clears the script's own links unless you re-send them. **Symptom of a lost link**: the script fails with `TypeError: Cannot read properties of undefined (reading 'find'/'save'/…)` because `entities.<name>` (or `apis.<name>`, …) is gone.

## Working with table data — use `entities`, never hand-written SQL

The default way for a script to read or write a table: link the table via `entitySets` and use the `entities.<contextname>` accessor — the same thing the Script Editor sets up when a table is dragged in from **Resources**. `id` is the dictionary id (`list_tables`), `name` is the table name (the runtime binds by name), `contextname` is the accessor you choose.

```json
save_server_script({
  "name": "seed-products", "projectId": "<project-id>",
  "entitySets": [{ "id": "<dictionary-id>", "name": "products", "contextname": "products" }],
  "content": "…see below…"
})
```

```javascript
const saved = await entities.products.save({ title: "Chair", amount: 42 });   // insert (id generated)
await entities.products.save({ id: saved.id, amount: 43 });                   // update by id
const cheap = await entities.products.find({ where: { amount: operators.LessThan(50) }, order: { amount: "DESC" }, take: 10 });
const one   = await entities.products.findOne(saved.id);                      // bare id string works
await entities.products.delete(saved.id);
result.data = { cheap, one };
```

(Verified end-to-end.) `entities.<name>` is a TypeORM repository wrapper; its surface:

- `find(whereOrOptions)` / `findOne(idOrOptions)` — full TypeORM find options (`where`, `select`, `order`, `take`, `skip`); combine with the **`operators`** global for conditions: `Equal, Not, In, Any, Like, Between, LessThan(OrEqual), MoreThan(OrEqual), IsNull, Raw, Brackets`.
- `save(rowOrRows)` — insert or update (upsert by `id`); `insert(...)`, `update(criteria, partial)`, `delete(criteria)`, `remove(rows)`.
- `findSimilar({ search, take?, withSimilarity? })` — semantic vector search on tables with a vector store configured (auto-creates the embedding; see manage-tables).

**Why this instead of SQL** — the wrapper does real work that raw SQL silently skips:
- sets `createdBy`/`updatedBy`/`updatedAt` from the calling user (verified),
- writes the **table audit** log when the table has auditing enabled,
- keeps the **vector store** up to date on vectorizer-enabled tables,
- is portable across all supported databases (PostgreSQL, SQLite, MSSQL, HANA) — hand-written SQL dialects are not.

The raw fallback `p9.manager.query(sql, params)` exists but is a **last resort** — only when the wrapper genuinely can't express the query (e.g. cross-table aggregation), always with parameterized values, and never for writes to internal platform tables. `tables.<contextname>` is the legacy Waterline-style accessor kept for old scripts — don't use it in new code.

## Don't

- **Don't create ungrouped scripts.** Always pass `projectId` so the script lands in a project — make one with `create_script_project` first if none fits. Ungrouped scripts are harder to find and organize and miss the project's version tracking; reach for `list_ungrouped_scripts` to *clean them up*, not as a place to add new ones.
- **Don't write hand-rolled SQL when `entities` can do it** — see the data section above. And regardless of method, never insert/update/delete in **internal** platform tables (`app`, `api`, `dictionary`, …): only external `entityset_*` data tables are yours to write. Mutating internal tables can brick the instance. See `dxp-overview` for the split.

## Other gotchas

- **`create_script_project` makes an empty project.** Add scripts afterward with `save_server_script({ projectId })`.
- **`delete_server_script` — pass `projectId`** when the script belongs to a project, so the project's version (`ver`) is regenerated. Without it the script is deleted but the project version goes stale.
- **`list_ungrouped_scripts` returns metadata only** (id, name, description, changedBy, createdAt, updatedAt, useAsGlobalScript, jsscriptGroup, ver) — no `content`. Use `get_server_script({ id })` to get the source.
- **Global scripts** (`useAsGlobalScript: true`) are callable from other scripts. That `useAsGlobalScript` flag is shown in listings but isn't settable via `save_server_script` (no parameter for it) — set it in the Script Editor. (Distinct from the `globalScripts` array, which links the *other* global scripts this script calls.)
- **Entity sets bind by table *name***, not id — renaming a table silently breaks every script that links it under the old name. Re-save the affected scripts with the new name.
- **Also in the script context** (beyond the linked accessors): `log` (the platform script logger — prefer it over `console`; output lands in the script logs, see inspect-system-logs), `sendEmail`, `uuid()`, `vault.decrypt`, and `p9.runScript({ id } | { project, name }, payload)` to call another script and get its `result.data` back.

## Discovery flow

1. `list_script_projects` (or `list_ungrouped_scripts`) — browse, get ids
2. `get_server_script({ id })` — read the source and existing links
3. (linking a table?) `list_tables` — get the dictionary id and exact table name
4. `save_server_script(...)` — create or edit
5. `run_server_script(...)` — test it (see the `run-server-script` skill)

## Permissions

All authoring tools require the `scripteditor` role: `List` (`list_script_projects`, `list_ungrouped_scripts`), `Get`, `Save` (`create_script_project`, `save_server_script`), `Del` (both delete tools). Execution (`run_server_script`) requires `scripteditor` with method `Run`.

## Related skills

- **`run-server-script`** — execute a script by id (the runtime counterpart to this skill).
- **`dxp-overview`** — `modules.*` loading, `result` vs `res`, `req.p9` context — the platform rules every script depends on.
- **`manage-tables`** — define the tables scripts link via `entitySets`; read rows over MCP with `query_entity_table`.
- **`manage-apis`** — wire a script to an HTTP endpoint via an `apiType: "script"` API.
- **`manage-npm-modules`** — make third-party packages available to scripts as `modules.*`.
