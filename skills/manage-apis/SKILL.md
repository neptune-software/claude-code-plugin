---
name: manage-apis
description: Create, update, inspect, or delete Neptune DXP API artifacts via the MCP tools `list_apis`, `get_api`, `save_api`, `delete_api`. Use when the user wants to add an API (script-backed, HTTP proxy, or table), wire a server script to an endpoint, define request/response types or definitions, add or fix paths/operations, change runtime flags (proxy, tracing, access, public), inspect who uses an API, or clean up APIs. Trigger phrases include "add an API", "create an endpoint", "expose this script as an API", "fix the request/response types", "add a path", "enable proxy", "restrict access", "delete this API".
---

# Managing Neptune DXP API artifacts via MCP

An API artifact is a config record in the `api` table. Depending on its `apiType`, the runtime uses it to expose a server script over HTTP, gate and enrich proxy calls to an upstream service, or document CRUD access to a table. `save_api` / `delete_api` write the same records the Cockpit's API Designer edits — **changes are live immediately, there is no draft/activate step**.

## The three API types

| `apiType` | What it is | `endpoint` value (the identity, not a free choice) | Served at |
|---|---|---|---|
| `"script"` | Server-script backed API | `/api/serverscript/<slug>` — slug = name lowercased, spaces and `/` removed. With `isPublic: true`: `/public/serverscript/<slug>` | `<endpoint>/<operation>` |
| `""` or `null` | External HTTP API (proxy config) | The upstream base URL, absolute with protocol (`https://api.example.com/v1`) | `/proxy/<encoded upstream URL>/<apiId>` |
| `"table"` | Table CRUD API | Always exactly `/api/entity` | `/api/entity/<tableName>` |

**`apiType` and `apiFormat` are chosen at creation and NEVER changed afterwards.** The Cockpit provides no way to change them once created. `save_api` will *not* stop you — a flip persists silently (verified) and produces an unsupported, inconsistent artifact (paths bound to scripts on a "proxy" API, wrong doc generation, broken designer UI). If an API has the wrong type: create a new API with the right type, migrate the paths/definitions, then delete the old one. Never recommend or attempt an in-place type or format change.

**`apiFormat`**: `0` = Swagger 2, `1` = OpenAPI 3. It selects the spec-generation branch and designer editors. **Always set `apiFormat: 1` for new APIs** (the Cockpit does; the Zod default is 0 for legacy reasons, and the Swagger 2 branch depends on metadata MCP cannot write — see Definitions below).

## Tools

| Tool | Behavior (verified) |
|---|---|
| `list_apis` | Flat summaries: id, name, description, endpoint, apiType, version, apiGroup, package, createdBy/changedBy, createdAt/updatedAt, enableProxy, enableTrace. No paths/definitions (payload-size guard). |
| `get_api({ id })` | Envelope `{ api, apps: {children}, scripts: {children}, webapps: {children} }`. The artifact is under `.api` (paths, definitions, auth, endpoints, documentation, and `roles`). The three siblings are **where-used**: apps, server scripts, and web apps consuming this API. Id only — lookup by name is not supported. |
| `save_api({ api })` | Create (no `id`) or update (with `id`). Returns the **full saved artifact** — use it to verify instead of an extra `get_api` (it lacks `roles`/where-used, which only `get_api` returns). |
| `delete_api({ id })` | Permanent, no undo; also deletes the API's trace records. **Returns "deleted" even for nonexistent ids** (verified) — success is not proof the id existed. |

## The `save_api` contract

**Update semantics (verified live) — this is the most important rule set:**

| You send | What happens |
|---|---|
| Key **absent** | Column untouched — existing value preserved. Partial updates are safe and preferred: `{ "id": "...", "enableTrace": true }` changes exactly one flag. |
| Array key = **`null`** | Coerced to `[]` → **wipes the array** (verified: `paths: null` erased all paths). |
| Array key **present** | **Replaced wholesale** — never merged. To change one path, send *all* paths with one modified (see Workflows). |
| Unknown/read-only key | **Silently stripped, no error** (verified). See the strip list below — this is the #1 source of "my save didn't work". |

- **Upsert trap**: an `id` that doesn't exist **creates** a new record carrying that id (verified). A stale or guessed id never fails "not found" — it makes a ghost. Confirm with `get_api` when you intend update-only.
- **No duplicate-name guard** (verified: two APIs with the same name saved fine). The Cockpit checks separately; MCP does not. Since script-API runtime lookup can fall back to matching by *name*, duplicates cause ambiguous routing. Always check `list_apis` for the name before creating.
- **No endpoint validation**: MCP accepts a proxy endpoint without `http(s)://` (verified). The Cockpit validates this client-side; a protocol-less external endpoint later breaks doc generation ("Protocol for api endpoint is missing").
- **Server-managed fields**: `id` (on create), `ver` (datestamp like `26.07.17.1546`, regenerated every save), `createdBy`/`changedBy`, `createdAt`/`updatedAt`. Don't send them; sending is harmless (stripped or overwritten).
- **Nested ids are required and client-generated**: every `paths[]` and `definitions[]` item needs `"id": "<uuid v4>"` — generate one per item. Missing id → clear validation error (`api.paths.0.id Required`), nothing is saved. Path ids are uppercased server-side, definition ids keep their case — compare case-insensitively when matching after read.
- Limits: `name` ≤ 64, `endpoint` ≤ 128, `description` ≤ 1024. `method` ∈ `GET POST PUT PATCH TRACE OPTIONS HEAD DELETE CONNECT`.

### Fields that are silently stripped (never sent successfully)

Sending any of these does nothing — no error, no effect (all verified live or in `APISaveSchema`):

- `roles` (plural) anywhere, and **`role` (singular) is accepted by the schema but ignored by the ORM** — role assignment over MCP is a **silent no-op** (verified: save succeeded, `roles` stayed `[]`). Assign roles in the Cockpit only.
- On properties (in `definitions[].properties` and `content[].items`): **`reference`**, `parent`, `isParent`, `default`, `maxLength`, `minLength` — see Definitions below for what this breaks and how to work around it.
- On `parameters[]` / headers: `type`.
- On the API root: `enableScriptEditor`, `documentation`, `NAME`, `title`, `application`, `accessLevel`, `ver`, `createdBy`, `changedBy`.

After any save, **verify by reading the returned artifact** — if a field you sent isn't in the response, it was stripped; don't retry the same payload.

## Script-backed APIs (`apiType: "script"`) — the full recipe

1. **Check the name is unused** (`list_apis`), then create:
```json
save_api({ "api": {
  "name": "order-status",
  "endpoint": "/api/serverscript/order-status",
  "apiType": "script",
  "apiFormat": 1,
  "description": "Order status lookup"
}})
```
The endpoint MUST follow the formula (name lowercased, spaces/`/` stripped, prefixed `/api/serverscript/`). The runtime resolves `<name>` in the URL against the `endpoint` column first, then **falls back to matching the artifact `name`** — so a wrong endpoint often still "works", hiding the misconfiguration until a rename or a duplicate name breaks it. `isPublic: true` + `/public/serverscript/<slug>` endpoint makes it callable without login at that public path.

2. **Add operations, each bound to a server script by id** (`paths[].serverScript` = the script's id — find it via `list_script_projects` / `list_ungrouped_scripts`, see the manage-server-scripts skill):
```json
{ "id": "<uuid>", "method": "POST", "path": "/status",
  "serverScript": "<server-script-id>",
  "summary": "Get order status",
  "content":   [{ "name": "StatusRequest",  "objectType": "reference" }],
  "responses": [{ "status": "200", "description": "OK",
                  "content": [{ "name": "StatusResponse", "objectType": "reference" }] }] }
```

3. **Runtime contract** (what actually happens on `POST /api/serverscript/order-status/status`):
- Operation matching: `path` must start with `/`; matched case-insensitively and exactly against the first URL segment after the API name; a path of `"/"` matches a bare `/api/serverscript/<name>` call; `HEAD` requests match `GET` operations. Dynamic segments use **parentheses**: `/orders/(orderId)` matches `/orders/123` and fills `req.params.orderId`. Curly braces `{orderId}` never match.
- The script receives `req` (with `req.body`, `req.query`, `req.params`, `req.user`, and `req.p9.api` / `req.p9.operation`) and writes to `result`: `result.data` (payload), `result.statusCode`, `result.contentType`, `result.filename`, `result.headers`. No `res` object.
- **Request/response definitions are documentation + typing only — nothing validates them at runtime.** The wire response is whatever the script puts in `result`. Keep definitions and script behavior in sync manually.
- A matched path with no `serverScript` returns `{"status": "Server Script not set in Operation"}` — that exact message means the binding is missing.
- `useOwnProcess: true` runs the script in a forked process (isolation for heavy/risky scripts).

4. **Cockpit visibility gotcha**: the Script Editor's API tree only shows APIs with `enableScriptEditor: true`, which the Cockpit sets on save but **MCP cannot set** (stripped). An MCP-created script API works at runtime and its `serverScript` bindings function, but it won't appear in the Script Editor tree until someone opens and saves it once in API Designer. Mention this when handing over to Cockpit users. Assigning an `apiGroup` also keeps it organized in Cockpit trees.

## Definitions and request/response types — what actually works over MCP

Definition/property metadata is stored as a **flat list with `parent` pointers**; spec generation and client codegen rebuild nesting *only* from `parent` — and MCP strips `parent`, `isParent`, and `reference` from every property (verified). Consequences:

**DO (these shapes survive and export correctly with `apiFormat: 1`):**
- **Flat definitions** — one level of primitive properties, every property with an explicit `objectType`:
```json
{ "id": "<uuid>", "name": "StatusRequest", "type": "object",
  "properties": [
    { "id": "<uuid>", "name": "orderId", "objectType": "string", "required": true },
    { "id": "<uuid>", "name": "verbose", "objectType": "boolean" } ] }
```
- **Content-level references** from a path's request body (`paths[].content`) or response (`responses[].content`) to a definition **by name**: `{ "name": "StatusRequest", "objectType": "reference" }`, plus `"isArray": true` for arrays of that definition.
- **Inline nested shapes directly in `content[].items`** (only there — content items are exported via `children` recursion, not parent pointers):
```json
"content": [{ "objectType": "object", "items": [
  { "id": "<uuid>", "name": "order", "objectType": "object", "children": [
    { "id": "<uuid>", "name": "total", "objectType": "number" } ] } ] }]
```

**DON'T:**
- **Property-level references** (`objectType: "reference"` with a `reference` field) — the `reference` value is silently stripped (verified), leaving a dangling reference that exports as `$ref: .../undefined`. There is no MCP-writable substitute; restructure to content-level references or inline items.
- **Nested `children` inside `definitions[].properties`** — the children are *stored* but spec generation/codegen rebuild from `parent` and will render the object **empty**. Keep definitions flat; put nesting inline in content.
- **Omitting `objectType` on a property** — it defaults to `"reference"` (a broken one). Always set it: `uuid | boolean | object | number | string | integer | array | reference | vector`.
- **Round-tripping imported APIs**: an API imported from OpenAPI in the Cockpit carries `parent`/`reference`/`type` metadata that MCP save strips. A get → save of its `definitions` — even unmodified — **permanently destroys nesting and references**. When updating such an API, *omit* `definitions` (and any array you don't intend to change) from the payload; absent keys are untouched. For deep definition surgery on imported APIs, use the Cockpit.

`parameters[]` (query/path params) are safe over MCP except `type` (stripped; docs render them as string). `inPath: true` marks a path parameter — its `name` must match a `(name)` segment in the path.

## External proxy APIs (`apiType: ""`)

```json
save_api({ "api": {
  "name": "weather", "endpoint": "https://api.weather.gov",
  "apiType": "", "apiFormat": 1, "enableProxy": true,
  "paths": [{ "id": "<uuid>", "method": "GET", "path": "/points/(lat),(lon)",
              "responses": [{ "status": "200", "description": "OK" }] }] }})
```
- Call shape: `/proxy/<encodeURIComponent(full upstream URL incl. path)>/<apiId>`, e.g. `/proxy/https%3A%2F%2Fapi.weather.gov%2Fpoints%2F40.7%2C-74.0/<apiId>`. The platform attaches the API's auth, role checks, tracing, forward proxy, and TLS settings to the call.
- **`enableProxy` is a consumer-side switch, not a server gate**: it tells App Designer data sources and generated API clients to route through `/proxy/...` instead of calling the upstream directly from the browser (CORS). The proxy route itself doesn't check it.
- **Paths are advisory unless the instance sets `proxy.restrictedEnabled`**: with restriction on, calls that don't match a defined path+method are blocked; without it, any URL passes once API-level access checks pass. Define paths accurately either way — they also drive docs and clients.
- `forwardProxy` (API- or path-level): route upstream calls through a corporate HTTP proxy. `tlsAllowUntrusted: true`: accept invalid upstream certs — only with explicit user intent.

### Multi-environment endpoints and target-system auth

- `endpoints: [{ "id": "<uuid>", "role": "DEV|TST|QUA|PRD|...", "endpoint": "<absolute URL>" }]` — alternate upstream URLs per system role (must be valid absolute URLs).
- `auth: [{ "id": "<uuid>", "apiAuth": "<api_authentication id>", "authName": "<label>", "role": "DEV|...|DEF" }]` — outbound credentials per system role; the runtime picks the entry matching the instance's own system type, falling back to `DEF`. `apiAuth` must reference an existing **API Authentication** artifact (Cockpit-managed; no MCP tools for it — never invent ids). Path-level `auth`/`endpoints` override API-level. Calls that resolve to a *different* system's endpoint require the `x-allow-cross-system: 1` header for non-GET methods.
- On update through the Cockpit's save path these auth entries are auto-preserved; over MCP `auth` follows normal array rules (omitted = untouched, present = replaced) — safest is to omit `auth` unless you're deliberately changing it.

## Table APIs (`apiType: "table"`)

Endpoint is always `/api/entity`; runtime CRUD is served at `/api/entity/<tableName>` and is **gated by the table's own read/write role settings, not by the API artifact's roles**. The artifact provides docs/clients: paths `GET|PUT|POST|DELETE /<tableName>` + `GET /<tableName>/count`, a flat definition mirroring the table fields, plus `Error` and `count` definitions. The Cockpit's "Import Table" scaffolds all of this; MCP has no scaffolding method — either scaffold in the Cockpit, or replicate that exact shape by hand from `get_table` field data. GET supports query params `where` / `select` / `take` / `skip` / `order` with TypeORM-style operators in `where` (`Not(x)`, `Between(1,10)`, `In([...])`, `Like(x)`, `LessThan(x)`, `IsNull()`, ...).

## Access control on calls

- Assigned roles (visible as `roles` in `get_api`; **not assignable over MCP** — silent no-op, use the Cockpit) gate script and proxy calls: an authenticated caller must hold at least one.
- **`restrictAccess: true` only matters when the role check doesn't run** — i.e. no roles assigned, or caller unauthenticated. With roles assigned and a role-holding authenticated caller, `restrictAccess` does not block (verified in route code — this is commonly misunderstood). "No roles + restrictAccess" = closed to everyone.
- `paths[].operAccess: ["<roleId>", ...]` narrows individual operations *after* the API-level check passes (writable over MCP, but you can't discover role ids over MCP — `query_entity_table` cannot read internal tables like `role`; get ids from the Cockpit or an existing API's `roles`).
- `isPublic: true` + `/public/serverscript/<slug>` endpoint = callable without login on the public path. Treat as a deliberate security decision; confirm with the user.

## Tracing

`enableTrace: true` (API-level) or `paths[].enableTrace` (per operation) writes an `api_trace` row per call: apiId, operationId, runtime (ms), `status` (`success`/`error`), calling application, and the request body only if `paths[].captureBody: true` (body capture = data exposure; ask before enabling). **`api_trace.statusCode` is never populated** — judge outcomes by `status`. View traces in the Cockpit (API Trace); they are not readable over MCP. Noisy on high-volume APIs; also useful: `list_system_logs`/`get_system_log` (see inspect-system-logs skill) for script errors.

## Workflows

**Discover**: `list_apis` → `get_api({id})`. Check the envelope's `apps`/`scripts`/`webapps` to see consumers before changing or deleting anything.

**Update one path without touching the rest** (arrays replace wholesale):
1. `get_api({id})` → take `api.paths`
2. Modify/append the one path item (match by id case-insensitively, or method+path)
3. `save_api({ api: { id, paths: <full modified array> } })` — send *only* `id` + `paths`; omit everything else (especially `definitions`, `auth`, `apps`, `webapps` — omitted keys stay untouched, and `apps`/`webapps` are consumer-maintained links you should never write).

**Change flags/metadata**: minimal payload — `{ "id": "...", "description": "...", "enableTrace": true }`. Never send `null` for an array you want to keep.

**Clone**: `get_api` → take `.api`, keep `paths`/`definitions`/`endpoints`/`auth`, drop `id`, `ver`, `createdAt/updatedAt`, `createdBy/changedBy`, `apps`, `webapps`, `roles`, `documentation`; set a unique `name` + correct `endpoint`; same `apiType`/`apiFormat`; save. **Cloning an imported API over MCP is lossy** (strips `parent`/`reference` metadata) — clone those in the Cockpit.

**Delete**: check consumers via the `get_api` envelope first and warn if non-empty; deletion is permanent and silently "succeeds" for wrong ids, so verify with `get_api` (expect `Not Found`) when it matters.

**Verify after every save**: the save response is the persisted state — confirm your fields are present in it (stripped fields simply won't be).

## Errors and symptoms

| Signal | Meaning / fix |
|---|---|
| `Input validation error ... "path": ["api","paths",0,"id"] "Required"` | Nested item missing its uuid `id` (or enum/format violation — the path pinpoints it). Nothing was saved. |
| `Access denied: no permission for apidesigner` | MCP user lacks the `apidesigner` role permission (List/Get/Save/Del respectively). |
| `Not Found` on `get_api` | No API with that id (deleted or wrong id). |
| `No access to artifact` / package error on save | The target dev package is role-protected, or the instance enforces package-required policy — supply an accessible `package` id. |
| Saved field missing from the save response | It's a stripped field (see list) — use the Cockpit for it. |
| `{"status": "Server Script not set in Operation"}` at runtime | Path matched but `serverScript` is empty — set the script id on that path. |
| `Api '<name>' not found` at runtime | No API resolves by endpoint or name — endpoint doesn't follow the formula and the name doesn't match the URL segment. |
| Script API returns 404 `Endpoint not found` | API resolved but no path matched method+path (check leading `/`, method, parens params). |
| `Protocol for api endpoint is missing` (docs view) | External API endpoint saved without `http(s)://`. |

## What MCP can NOT do (route to the Cockpit, don't improvise)

- Change `apiType`/`apiFormat` after creation (technically possible, **forbidden** — corrupts the artifact).
- Assign/remove **roles**; set `enableScriptEditor` or `documentation`.
- Property-level `reference`s and nested definition trees that export correctly; parameter `type`.
- Import an OpenAPI/Swagger spec (Cockpit: API Designer → import; then refine over MCP, minding the round-trip hazard).
- Create/manage **API Authentication** artifacts, API groups' membership lists, or read `role`/`api_trace` tables.
- Faithfully round-trip Cockpit-imported definitions (get → save destroys their nesting metadata).

## Permissions

All four tools require the `apidesigner` role permission (`List`/`Get`/`Save`/`Del`). Runtime call access is governed by the per-API roles/flags above, not by MCP permissions. Saving into role-protected packages additionally requires package edit access.

## Related skills

- **manage-server-scripts** — create the scripts that `paths[].serverScript` binds to; **run-server-script** — execute them directly (note: `req.p9.api`/`req.p9.operation` are only populated on real HTTP API calls, not direct runs).
- **manage-tables** — the tables behind `apiType: "table"`; `query_entity_table` for data.
- **inspect-system-logs** — server-side errors from API script executions.
- **search-docs** — platform documentation lookup for anything not covered here.
