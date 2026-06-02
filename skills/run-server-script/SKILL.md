---
name: run-server-script
description: Execute a Neptune DXP server script directly via the MCP `run_server_script` tool. Use when the user wants to invoke, test, or trigger a specific server script by id without going through an HTTP API endpoint. Trigger phrases include "run that script", "execute the server script", "trigger the script", "test my script".
---

# Running a Neptune DXP server script via MCP

The `run_server_script` MCP tool executes a server script directly by its UUID. It bypasses the HTTP route at `/api/serverscript/:name[/:operation]` and all the API-artifact resolution that comes with it — no name lookup, no operation/method matching, no per-API role gating.

This is the right tool for: testing a script in isolation, running maintenance/utility scripts, or invoking any script where you already have the id and don't need an API artifact wrapping it.

## Arguments

| Field | Type | Notes |
|---|---|---|
| `id` | UUID, required | The server script's `id`. Use `list_script_projects` or `list_ungrouped_scripts` to browse, then `get_server_script` to inspect a specific one. |
| `body` | object, optional | Becomes `req.body` inside the script. |
| `params` | object<string,string>, optional | Becomes `req.params` — used by scripts that read path-style params like `req.params.userId`. |
| `query` | object<string,string>, optional | Becomes `req.query`. |
| `headers` | object<string,string>, optional | Becomes `req.headers`. |

The MCP-authenticated user is wired through automatically as `req.user = { id, username }`. You don't pass it.

## Return shape

The tool returns the script's `result` object as JSON. Common patterns:

- Script set `result.data = {...}` → returns `{ "data": {...} }`
- Script set `result.data`, `result.statusCode`, `result.contentType`, `result.filename`, `result.headers` → all preserved
- Script set nothing on `result` → returns `{}` (the empty result object), **not** `null`. (Verified against a running 24.15 server. `null` is only returned in edge cases where the runtime produces no result object at all.)

Example script:

```js
result.data = {
  echoed: req.body,
  paramsSeen: req.params,
  runBy: req.user && req.user.username,
};
```

Called with `{ id: "<uuid>", body: { hello: "world" }, params: { itemId: "abc" } }` returns:

```json
{ "data": { "echoed": { "hello": "world" }, "paramsSeen": { "itemId": "abc" }, "runBy": "admin" } }
```

## When NOT to use this tool

- **Script depends on `req.p9.api` / `req.p9.operation`** — those are populated only by the HTTP route. Use the HTTP endpoint or rewrite the script to not depend on API context.
- **Script returns a stream** (binary file, large download) — MCP can't pipe streams. The tool will JSON-stringify the result, which usually produces garbage.
- **Script uses `res.send()` / `res.write()` directly** — no `res` object is wired in. Scripts must use the `result` object instead.
- **You need API-artifact role gating** (`api.roles`, `op.operAccess`) — the MCP tool only enforces the top-level `scripteditor` role with `Run` method. Per-API role narrowing requires the HTTP route.
- **You need `useOwnProcess` / debugger conditions** — both are honored by the HTTP route but ignored here.
- **You want an `api_trace` row written** — tracing is tied to the API artifact and is skipped for MCP runs.

## Discovery flow

1. `list_script_projects` — see all script projects with their nested scripts. Pick the script you want.
2. `get_server_script({ id })` — inspect the script source to confirm what `req` fields it reads and what it puts on `result`.
3. `run_server_script({ id, body?, params?, query?, headers? })` — execute. Pass only the `req` fields the script actually reads.

For ungrouped scripts (not assigned to any project) use `list_ungrouped_scripts` instead at step 1.

## Permissions

Requires the `scripteditor` role with method `Run`. Bearer-token or session-authenticated users without that role get `Access denied: no permission for scripteditor`.
