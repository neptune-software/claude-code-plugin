---
name: inspect-system-logs
description: Read Neptune DXP system log files via the MCP tools `list_system_logs` and `get_system_log`. Use when the user wants to debug a server error, inspect script output, trace requests, investigate exceptions/vault activity, or check how an AI Context Hub (SAP) ingestion went, from the platform's daily log files. Trigger phrases include "check the logs", "show server errors", "what did the script log", "any exceptions today", "tail the request log", "look at the system log", "debug this error in the logs", "did the ingestion finish".
---

# Inspecting Neptune DXP system logs via MCP

Planet 9 writes its operational logs to daily files — **one file per day per category**. These two read-only tools let you find those files and read entries from them. This is the go-to for debugging runtime errors, seeing what a server script logged, or tracing requests.

## The five log categories

| `type` | What it holds |
|---|---|
| `server` | General server/runtime log. |
| `exceptions` | Uncaught exceptions and stack traces. |
| `scripts` | Server-script output (`log.<silly, verbose, info, debug, warn, error, crit>`, e.g `log.debug("User not framed")`), `console.log` does not go to this log |
| `requests` | Incoming HTTP request log. |
| `vault` | Secret/vault access activity. |

## Tools

| Tool | Purpose |
|---|---|
| `list_system_logs({ type?, dateFrom?, dateTo? })` | List available log files. Omit `type` to get files grouped across all categories; pass one to narrow. |
| `get_system_log({ type, name, ... })` | Read entries from a specific file (paginated, filterable). |

`list_system_logs` returns files grouped as `serverFiles`/`exceptionFiles`/`scriptFiles`/`requestFiles`/`vaultFiles` (or pass `type` to narrow); names look like `2026-05-11-planet9.log`. `get_system_log` needs `type` + that `name`, and filters by: `level` (`silly`→`crit`), `message` (case-insensitive substring), `scriptName`/`scriptGroup` (scripts category only), `start`/`end` (default 0–100, `end` exclusive), `dateFrom`/`dateTo`.

## Gotchas

- **`name` must come from `list_system_logs`** — don't guess; the naming convention varies by deployment. So the flow is always list → get.
- **Always pass a `level` and/or `message` filter when hunting a problem.** Files are huge; an unfiltered 0–100 window from a busy `requests` log tells you little. Filter to `level: ["error","crit"]` or a distinctive `message` substring.
- **Read-only.** No deletion or rotation control over MCP. Both tools require the `syslog` role (`List`/`Get`).

## AI Context Hub ingestion

Every SAP ingestion, started through MCP or in the Cockpit, writes its progress to the `server` log:

- `message: "[SAP Ingestion]"` returns `Discovered <n> service(s)`, `Ingesting <service> (<i>/<n>)`, `Completed <service>`, `Failed <service>: <error>` (level `error`) and `Ingestion finished (<x> succeeded, <y> failed)`. A run makes one pass per source type (OData services, business objects, function modules, …), and each pass logs its own `Ingestion finished`.
- These lines carry no system id. `message: "buildSAPEngineServices"` returns the line each run starts with, `[SAP Engine] buildSAPEngineServices: system=<system id> …`, followed by its skip flags and pinned services. Use it to tie a run to its Remote System.
- `job: null` from `get_ai_context_hub_ingestion_status` does not mean nothing ran: the log is the record.

Full guide: `manage-remote-systems` → Check an ingestion in the system log.

## Related skills

- **`run-server-script`** / **`manage-server-scripts`** — when the `scripts` log points at a failing script, inspect and re-run it.
- **`manage-apis`** — request/proxy failures in the `requests` log often trace back to an API artifact.
- **`search-docs`** — look up an unfamiliar error message in the public DXP docs.
- **`manage-remote-systems`** — AI Context Hub configuration, ingestion status and the ingested SAP services.
