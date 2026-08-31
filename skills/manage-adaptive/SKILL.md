---
name: manage-adaptive
description: Create, update, inspect, or delete Neptune DXP Adaptive entities via the MCP tools `list_adaptive`, `get_adaptive`, `save_adaptive`, `delete_adaptive`. Use when the user works with the Adaptive Designer / Adaptive Framework — data-driven, no-code app definitions backed by a table, server script, or connector. Trigger phrases include "create an adaptive entity", "list adaptive", "update the adaptive app", "adaptive designer", "delete adaptive".
---

# Managing Neptune DXP Adaptive entities via MCP

The Adaptive Framework builds no-code, data-driven apps from a data source plus a template, rather than from hand-placed UI controls (App Designer) or hand-written code (Web Apps). An Adaptive entity is that definition — a data source binding plus field/settings configuration. See the `dxp-overview` skill for where Adaptive sits relative to App Designer.

## Tools

| Tool | Purpose |
|---|---|
| `list_adaptive` | Adaptive entities. Supports `listOptions` (`where`/`select`/`take`/`skip`/`order`) to filter, project, and sort by field. |
| `get_adaptive({ id })` or `get_adaptive({ name })` | One entity with full `settings` and field definitions. **Either `id` or `name` is required.** |
| `save_adaptive({ adaptive })` | Create (no `id`) or update (with `id`). Pass the full object. |
| `delete_adaptive({ id })` | Permanent delete. |

## Required for a new adaptive entity

- `name` (string) — the entity name (also usable as the `get_adaptive` lookup key).
- `type` — the data-source kind:

| `type` | Backed by |
|---|---|
| `"T"` | Table / dictionary |
| `"S"` | Server script |
| `"C"` | Connector |

- `settings` — the configuration object holding the field definitions and layout. This is the heart of the entity.

## Gotchas

- **`get_adaptive` is dual-key.** You can fetch by `id` *or* by `name`; passing neither returns `Either id or name is required`. It routes through the artifact's `getData` action, so the response is the resolved entity data, not a thin metadata row.
- **`save_adaptive` is keyed by `id`.** Omit `id` to create, include it to update.
- **`settings` is replaced wholesale on save**, like other nested objects across these MCP tools. To tweak one field: `get_adaptive`, mutate the returned `settings`, `save_adaptive` the whole object.
- **`type` decides the data source contract.** A `"T"` entity expects a table the user can read (see `manage-tables`); `"S"` expects a server script that returns data (see `manage-server-scripts`); `"C"` expects a configured connector. Pick it to match the source you actually have.
- **Adaptive apps surfaced in App Designer use `appType: "F"`** — see `manage-apps`. The Adaptive entity here is the underlying data/template definition the Adaptive Designer edits.

All four tools require the `adaptivedesigner` role (`List`/`Get`/`Save`/`Del`).

## Related skills

- **`dxp-overview`** — Adaptive vs App Designer, and the Connector concept.
- **`manage-tables`** — the table/dictionary a `type: "T"` adaptive entity binds to.
- **`manage-server-scripts`** — the data-providing script a `type: "S"` entity binds to.
- **`manage-apps`** — Adaptive apps in App Designer (`appType: "F"`).
