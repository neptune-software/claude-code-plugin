---
name: dxp-overview
description: Foundational concepts for working with a Neptune DXP - Open Edition instance via this plugin. Covers what Neptune DXP is, the Cockpit vs Launchpad split, the core artifact model (apps, server scripts, APIs, tables, workflows), how those artifacts connect at runtime, and the platform-specific rules that diverge from generic Node.js conventions (e.g. NPM module loading via the `modules.*` global, not `require`/`import`). Invoke at the start of any conversation involving Neptune DXP, before reasoning about App Designer / Script Editor / API Designer artifacts, when interpreting DXP terminology (Planet9, Cockpit, Launchpad, Adaptive), or when a Neptune MCP tool returns results that reference these concepts. Other skills in this plugin (search-docs, manage-apis, run-server-script) build on the vocabulary defined here.
---

# Neptune DXP — orientation

Neptune DXP (Digital Experience Platform) is a full-stack low-code platform for building enterprise apps. Two editions exist; **this plugin only talks to Open Edition** (Node.js runtime, JS/TS server-side, PostgreSQL/MySQL/etc. as the database). The SAP Edition runs as an ABAP add-on on SAP NetWeaver — you may see it referenced in docs, but the MCP server in this plugin does not connect to it.

## The two surfaces: Cockpit and Launchpad

- **Cockpit** — the developer/admin workspace. All design-time tools live here: App Designer, Script Editor, API Designer, Workflow Editor, Adaptive Designer, PDF Designer, Table Designer, Launchpad Designer. When the user says "open the cockpit" or "in the cockpit", this is what they mean.
- **Launchpad** — the runtime end-user surface. Built apps are deployed to a Launchpad, tiles map to apps, role-based access controls who sees what. End users don't see the Cockpit.

`Planet9` is the internal/historical code name for the Open Edition runtime — you'll see it in source paths, package names (`@neptune-software/planet9-*`), and the `req.p9` server-script context object. Treat "Planet9" and "Open Edition runtime" as synonyms.

## The artifact model

Everything in DXP is a row in a typed table. The MCP tools in this plugin expose these as objects:

| Artifact | Table | What it is |
|---|---|---|
| **App** | `app` | A UI built in App Designer (UI5/OpenUI5-based, drag-and-drop). Has resources (JS, CSS, images), components, and event handlers. |
| **Server script** | script metadata | A JS/TS function executed server-side, in Node.js, on an API request. Accesses `req` (request context) and writes to `result`. |
| **API** | `api` | The route/binding artifact. Can proxy to an upstream URL, expose a server script over HTTP, or wrap a table for CRUD. Enforces role gating. See the `manage-apis` skill. |
| **Table / dictionary** | dictionary metadata | Schema definitions managed via Table Designer. Server scripts read/write via TypeORM. |
| **Workflow** | workflow | Visual process model built in Workflow Editor. Tasks include script tasks (call server scripts), user tasks, etc. |
| **Adaptive app** | adaptive metadata | No-code data-driven app built in Adaptive Designer from a table or server-script data source, configured via templates. |
| **PDF template** | pdf metadata | Drag-and-drop PDF layout built in PDF Designer, populated by server scripts or APIs at generation time. |
| **Launchpad** | launchpad metadata | A tile/role configuration mapping users → apps. The runtime end-user surface. |
| **Web App** | `webapp` | A code-first application where you author the HTML/JS/CSS directly, instead of App Designer's drag-and-drop UI5. |

## How the pieces connect

The typical chain for a user action in a deployed app:

1. **App** (browser) makes an HTTP call.
2. The call hits an **API** artifact, which gates by role and routes one of three ways: proxy to an upstream URL, invoke a **server script**, or read/write a **table**.
3. The **server script** runs in Node.js with `req` populated from the request and `req.p9.api` / `req.p9.operation` populated by the API route (these are NOT populated when running via the `run_server_script` MCP tool — see that skill).
4. The script puts its output on `result` (data, statusCode, contentType, etc.) and the runtime serializes it back.
5. Workflows are orchestrated separately and can invoke server scripts as script-task steps.

A server script not always a free-floating module — it's an artifact bound to one or more API operations. To wire a new endpoint: create/extend an API (`apiType: "script"`), add a path, point the path's `serverScript` field at the script's id. The `manage-apis` skill covers the API side; `run-server-script` covers direct invocation.

## Platform-specific rules that diverge from generic Node.js

These are the differences that bite people who assume "it's just Node":

- **NPM modules are NOT loaded with `require()` or `import`.** Third-party modules made available to server scripts are exposed on a global object named `modules`, with the package name as the property: `modules.axios`, `modules.dayjs`, `modules.lodash`. The user installs/manages these via the **NPM Modules** Cockpit app — NOT by running `npm install` locally. When suggesting third-party usage, say "add the module via the NPM Modules cockpit app" rather than `npm install`.
- **Do not use `module` or `modules` as a prefix for your own functions or variables** in server scripts — it collides with the platform global.
- **Server scripts have no `res` object.** No `res.send()`, no `res.write()`. Write everything to the `result` object instead (`result.data`, `result.statusCode`, `result.contentType`, `result.filename`, `result.headers`).
- **`req.user`** is wired automatically from the authenticated session/token — you don't read it from headers manually.
- **`req.p9`** holds platform context: `req.p9.api` is the API artifact, `req.p9.operation` is the matched path operation. Populated by the HTTP route only; absent on direct MCP execution.
- **TypeORM is the ORM.** Table-backed access uses TypeORM, not raw SQL drivers. Migrations are not hand-written — schema changes go through the Table Designer.
- **External tables vs internal tables.** *External* tables are the application's own data, physically stored as `entityset_*` (a dictionary table named `customer` lives as `entityset_customer`). These are yours to read and write. *Internal* tables are the platform's own (`app`, `api`, `dictionary`, `webapp`, and the rest of the runtime schema). You may **read** an internal table if you genuinely need to, but **should never insert, update, alter, or delete** in one — that can brick the instance. Mutate platform artifacts only through the MCP tools / Cockpit, never by writing their tables directly.
- **App resources (JS in App Designer)** run in the browser as UI5 controllers. Don't confuse them with server scripts. The App Designer's "JavaScript resource" is client-side code

## Vocabulary cheat sheet

| Term | Means |
|---|---|
| App / Application | UI artifact in App Designer (`app` table) |
| Web App | Code-first app — hand-authored HTML/JS/CSS (`webapp` table) |
| Server script | Server-side JS/TS in Script Editor |
| API | API Designer artifact binding routes to scripts / tables / upstream URLs |
| Cockpit | Developer workspace |
| Launchpad | End-user runtime surface |
| Planet9 | Internal name for the Open Edition runtime |
| Adaptive | The no-code app framework, distinct from App Designer |
| Adaptive Designer | The Cockpit tool for building Adaptive apps |
| Table Designer | Schema/dictionary editor |
| NPM Modules (cockpit app) | Where users add/manage third-party packages available as `modules.*` |
| Connector | Adaptive Framework's tool for publishing data sources (tables, server scripts, Excel imports) for adaptive apps |
| Cockpit tile group | Logical grouping of cockpit tools (Development, Design, etc.) |
| Package | Transport/bundle container (`dev_package` table). Artifacts join a package by setting their own `package` field to its id — the package doesn't list its members. MCP tools: `list_packages`, `get_package` (returns members bucketed by type), `save_package` (only `name` is required), `delete_package` (clears members' `package` link, doesn't delete them). |

## Related skills

Each major artifact segment has its own skill. Invoke the matching one when the user works on that segment:

- **`search-docs`** — search the public DXP documentation when you need detail on a feature or to look up an error.
- **`manage-apps`** — App Designer applications (UI5). Includes the save → `activate` publish cycle.
- **`manage-webapps`** — code-first React/Vue web apps.
- **`manage-server-scripts`** — author/organize server scripts and script projects.
- **`run-server-script`** — execute a server script directly by id via MCP.
- **`manage-apis`** — create/update/inspect API artifacts via MCP.
- **`manage-tables`** — table definitions (dictionary) and reading rows.
- **`manage-adaptive`** — Adaptive Framework data-driven entities.
- **`manage-npm-modules`** — install/manage third-party packages exposed as `modules.*`.
- **`inspect-system-logs`** — read the daily server/exception/script/request/vault logs.
- **`connection`** — inspect, connect, switch, and troubleshoot the connection to an instance.

## MCP tool skill routing

Before using or interpreting the result of an MCP tool, load the skill that documents that tool. The MCP tool schema describes the call shape, but the skill explains Neptune DXP behavior, return field meanings in depth, and safe workflows.

| If you use these MCP tools | First read this skill |
|---|---|
| `list_apps`, `get_app`, `save_app`, `activate_app`, `delete_app` | `manage-apps` |
| `list_webapps`, `get_webapp`, `save_webapp`, `delete_webapp` | `manage-webapps` |
| `list_apis`, `get_api`, `save_api`, `delete_api` | `manage-apis` |
| `list_script_projects`, `get_script_project`, `create_script_project`, `delete_script_project`, `list_ungrouped_scripts`, `get_server_script`, `save_server_script`, `delete_server_script` | `manage-server-scripts` |
| `run_server_script` | `run-server-script` |
| `list_adaptive`, `get_adaptive`, `save_adaptive`, `delete_adaptive` | `manage-adaptive` |
| `list_tables`, `get_table`, `save_table`, `delete_table`, `query_entity_table` | `manage-tables` |
| `list_packages`, `get_package`, `save_package`, `delete_package` | `dxp-overview` |
| `list_system_logs`, `get_system_log` | `inspect-system-logs` |
| `list_npm_modules`, `get_npm_module`, `install_npm_module`, `uninstall_npm_module` | `manage-npm-modules` |

Do not infer Neptune DXP behavior from MCP field names alone. Load the matching skill first, then use the tool or interpret results from the tool call.

If a tool fails at the **connection level** — every neptune-dxp tool errors the same way, the tools never load, or you get a `/mcp` 404 / timeout / auth loop rather than a domain error — that's not a per-tool problem. Load the `connection` skill instead (its `issues.md` has the failure playbook).
