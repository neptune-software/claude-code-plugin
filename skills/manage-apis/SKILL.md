---
name: manage-apis
description: Create, update, or inspect Neptune DXP API artifacts via the MCP tools `list_apis`, `get_api`, `save_api`, `delete_api`. Use when the user wants to add an API, modify paths/definitions, change runtime flags (proxy, tracing, access), assign roles, or import/clone an API. Trigger phrases include "add an API", "create an endpoint", "update the API", "delete this API", "add a path", "add a definition", "enable proxy on", "restrict access to".
---

# Managing Neptune DXP API artifacts via MCP

An API artifact in Neptune DXP is a config record that the runtime uses to: proxy HTTP calls to an upstream service (`/proxy/<urlEncodedUrl>/<apiId>`), route to server scripts (`/api/serverscript/:name/:operation`), enforce role-based access, and optionally trace requests. The MCP tools `save_api` / `delete_api` write the same `api` table the cockpit's API Designer reads from — changes are immediately live.

## Tools

| Tool | Purpose |
|---|---|
| `list_apis` | All APIs with id/name/endpoint/description/type/status — no nested paths/definitions in the response. |
| `get_api({ id })` | Returns an **envelope** `{ api, apps, scripts, webapps }` — the artifact itself is under `.api` (paths, definitions, auth, endpoints, roles all nested there), with consumer/dependent info alongside. ~30KB for a typical OpenAPI 3 import. (Note: `list_apis` returns flat records, not this envelope.) |
| `save_api({ api })` | Create (no `id`) or update (with `id`). Pass the full object — partial updates replace whole arrays (see Partial updates below). |
| `delete_api({ id })` | Permanent. No undo. |

The `save_api` inputSchema is the full `APISaveSchema` minus base-artifact noise. Every field, enum, and nested shape is documented in the schema the LLM already sees on `tools/list` — this skill is for the things the schema can't convey: gotchas, conventions, and discovery patterns.

## Required for a new API

Just two:

- `name` (string, max 64) — the designer name
- `endpoint` (string, max 128) — base URL the runtime treats as canonical. For proxy APIs: the upstream base URL (`https://api.example.com/v1`). For server-script APIs: a local path like `/api/serverscript/my-api`.

Everything else has sane defaults. Note `apiType` is **not settable over MCP** (see below).

## `apiType` is read-only over MCP — a real limitation

`apiType` decides what an API *is*, and the cockpit/runtime branch on it:

| `apiType` | What the API is | Server scripts attachable? |
|---|---|---|
| `""` / null | External HTTP-proxy API (forwarded to `endpoint` via `/proxy/...`) | No |
| `"table"` | Backed by a Neptune table / dictionary | No |
| `"script"` | Backed by server scripts (`/api/serverscript/<name>/<operation>`) | Yes |

**You cannot set `apiType` through `save_api`.** It is an excluded key in `APISaveSchema` (`src/validation/schemas/artifacts/api.schemas.ts`), so it is silently stripped — every MCP-created API is `apiType: null` (verified: saving `apiType: "script"` reads back `null`). Consequence: an API created over MCP is untyped, so the cockpit Script Editor won't let you attach a server script to its paths (it filters to `apiType === "script"`). To get a script-backed endpoint, create/convert the API in the cockpit API Designer (which sets `apiType: "script"`), then use `save_api` for its paths/definitions.

## Runtime flags — the security-relevant ones

These determine what the proxy route does at runtime. Get them wrong and you've either broken the API or opened a hole.

- `enableProxy: true` — required for `/proxy/<url>/<apiId>` to forward to the upstream. Off by default.
- `restrictAccess: true` — blocks **every** proxy call, regardless of roles. The hard-off switch.
- `role: [{ id: <roleId> }, ...]` — users must hold at least one of these roles to proxy through this API. **On `save_api` the field is `role` (singular); the save schema strips `roles` (plural). But `get_api` returns the assignment back under `roles`.** Read = `roles`, write = `role` (see Gotchas).
- `paths[].operAccess: ["<roleId>", ...]` — per-operation role narrowing. Applied *after* the API-level roles pass.
- `enableTrace: true` — writes an `api_trace` row per proxy call (api id, operation id, runtime, status). Useful for debugging; noisy at high volume.
- `tlsAllowUntrusted: true` — accepts self-signed/invalid upstream certs. Don't set unless you understand why.
- `forwardProxy: "<url>"` — tunnel upstream calls through a corporate HTTP proxy.

## Paths

The `paths` array describes each operation the API exposes. Shape per item is in the schema, but two things to know up front:

### Path parameter syntax: parens, not curly braces

Neptune DXP's importer converts OpenAPI's `{petId}` to `(petId)`. When you write paths by hand, use parens too:

```
/pets/(petId)        ← correct
/pets/{petId}        ← will NOT match dynamic routes
```

`findOperation` in the proxy code matches `(name)` with the regex `[^/]+`, so `/pets/(petId)` matches both `/pets/123` and `/pets/foo`.

### HTTP method enum

`method` is one of: `GET, POST, PUT, PATCH, TRACE, OPTIONS, HEAD, DELETE, CONNECT`. The SDK rejects anything else with a clear ZodError.

## Definitions

Reusable schemas referenced from paths' request/response bodies.

- `type`: `object | array | boolean | string | number`
- `properties[].objectType`: `uuid | boolean | object | number | string | integer | array | reference`
- `properties[].children` recurses — for nested objects/arrays.

When importing from OpenAPI 3, each `components/schemas` entry lands here.

## Gotchas (schema can't tell you these)

- **Read/write field-name asymmetry on roles.** `get_api` returns assigned roles under **`roles`** (the entity relation), but `save_api` accepts only **`role`** (singular) and **strips `roles`** (it's in `APISaveSchema`'s excluded keys). So if you `get_api`, edit, and `save_api` back verbatim, the role assignment is dropped — you must set `role: [{ id }]` before saving. (Derived from `src/validation/schemas/artifacts/api.schemas.ts`; not live-tested here because the dev instance had no roles defined.)
- **`apiFormat` (0 vs 1) is import provenance, not behavior.** Swagger 2 and OpenAPI 3 describe the same shapes; the runtime treats them interchangeably. Default `0` is fine for hand-crafted APIs.
- **Auto-set fields are read-only in practice.** `id` (set on create), `ver` (set per save), `createdAt`/`updatedAt`/`createdBy`/`changedBy` (auto). Don't pass them on update.
- **Saving with an unknown `id` creates it (upsert), it does NOT no-op.** Verified on 24.15: `save_api` with a random `id` inserts a new record carrying that id. Don't treat a stale `id` as a safe no-op — confirm with `get_api` if you intend update-only.
- **`delete_api` does not validate existence.** Deleting a non-existent id returns `API '<id>' deleted` with no error (unlike `delete_app`, which errors). A success message is not proof the id existed.
- **`enableProxy: false` + paths defined** is valid but useless — the runtime route is closed. Easy to set up an API and wonder why `/proxy/...` returns nothing.
- **`api_trace.statusCode` column is always NULL** — Planet 9 doesn't populate it. The trace row's `status` field (`'success' | 'error'`) is what tells you the outcome, not HTTP status.

## Partial updates

`save_api` with an `id` does a full-record save. Nested arrays (`paths`, `definitions`, `roles`, `auth`, `endpoints`) are **replaced wholesale** — they aren't merged.

Pattern to update one path on an existing API without losing the others:

1. `get_api({ id })` — fetch current state
2. Mutate the specific path in the returned `paths` array (find by id or by method+path)
3. `save_api({ api: { ...current, paths: mutatedPaths } })`

The same applies to definitions, roles, auth, endpoints.

## Common patterns

### Create a minimal API

```json
save_api({ "api": { "name": "my-api", "endpoint": "/api/my-api" } })
```

### Create an HTTP-proxy API to an upstream service

```json
save_api({ "api": {
  "name": "weather",
  "endpoint": "https://api.weather.gov",
  "enableProxy": true,
  "paths": [
    { "id": "<uuid>", "method": "GET", "path": "/points/(lat),(lon)",
      "responses": [{ "status": "200", "description": "OK" }] }
  ]
}})
```

Then call `/proxy/<urlencoded https://api.weather.gov/points/40.7,-74.0>/<apiId>` to hit the upstream.

### Clone an existing API

1. `get_api({ id: <source> })` → grab the returned `api` object
2. Strip auto fields (`id`, `createdAt`, `updatedAt`, `createdBy`, `changedBy`, `ver`) and relation arrays you don't want (`apps`, `webapps`)
3. Change `name` and `endpoint` to unique values
4. `save_api({ api: <stripped object> })`

### Restrict an API to specific roles

```json
save_api({ "api": {
  "id": "<existing-api-id>",
  "name": "internal-api",
  "endpoint": "/api/internal",
  "role": [{ "id": "<role-uuid>" }]
}})
```

Note the field is `role` (singular) on save — see the roles gotcha above. Get the role UUID by querying the `role` table directly. Admin users have no implicit access; if a role restriction is set and admin isn't in any of them, admin is blocked.

## Discovery flow

1. `list_apis` — browse all APIs, get ids
2. `get_api({ id })` — inspect a specific one in detail, especially before modifying
3. `save_api` / `delete_api` — change or remove

For server scripts referenced by paths (`paths[].serverScript`), use `get_server_script` to inspect the referenced script content, and `run_server_script` (see the run-server-script skill) to execute it directly.

## Permissions

All four tools require the `apidesigner` role: `List` (for `list_apis`), `Get`, `Save`, `Del` respectively. Runtime access to the proxy at `/proxy/<url>/<apiId>` is governed by the per-API `roles` and `restrictAccess` config, not the MCP role.
