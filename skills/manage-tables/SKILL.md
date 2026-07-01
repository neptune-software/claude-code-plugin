---
name: manage-tables
description: Define and query Neptune DXP database tables (dictionary) via the MCP tools `list_tables`, `get_table`, `save_table`, `delete_table`, and `query_entity_table`. Use when the user wants to create or change a table schema (fields, indices, foreign keys) OR read rows of data from a table. Trigger phrases include "create a table", "add a column", "change the field type", "list tables", "delete the table", "query the table", "read rows from", "show me the data in".
---

# Managing Neptune DXP tables (dictionary) via MCP

Neptune DXP separates a table's **schema definition** (the dictionary — what columns exist) from its **data** (the rows). These tools span both:

- Schema/definition CRUD: `list_tables`, `get_table`, `save_table`, `delete_table` (the `dictionary` artifact).
- Reading rows: `query_entity_table` (the live data table).

There is **no row-write tool** over MCP — querying is read-only. Server scripts (via TypeORM) handle writes. See `dxp-overview` for the table/dictionary model.

These tools are for **external** (data) tables — the application's own tables, physically `entityset_*`. `query_entity_table` *can* read an **internal** platform table (`app`, `api`, `dictionary`, …) if you genuinely need to, but treat those strictly read-only: never define, alter, or drop them here, and never write their rows — that can brick the instance. See `dxp-overview` for the internal/external split.

## Tools

| Tool | Purpose |
|---|---|
| `list_tables` | All table definitions. |
| `get_table({ id })` | One definition: fields, indices, foreign keys. |
| `save_table({ table })` | Create (no `id`) or update (with `id`) a definition. **Runs DDL** against the database. |
| `delete_table({ id })` | Drop the table definition. |
| `query_entity_table({ table, ... })` | Read rows. Filters, column select, pagination, sort. |

## Defining a table (`save_table`)

Required for a new table:

- `name` (string) — the table name.
- `fields` — array of column definitions. Each field is shaped like:

```json
{ "fieldName": "email", "fieldType": "text", "isNullable": false, "isUnique": true }
```

`fieldType` **must** be one of these column types:

```
boolean, smallint, integer, bigint, decimal,
smalltext, mediumtext, text, timestamp, timestamptz,
uuid, json, vector
```

(`vector` is for embeddings and uses a fixed runtime length of 1536. **Do not set `length` on a vector via `save_table`** — the save reports success but corrupts the table's entity metadata and wedges every subsequent table/script operation with `Column … does not support length property` until the bad definition row is removed directly in the DB.) Optional per-field: `isUnique`, `isNullable`, `description`, `default`, `minLength`/`maxLength`, `example`.

Optional on the table: `indices` (`IndexDef[]` — `{ name, columns, isUnique, isVector }`) and foreign keys (`ForeignKeyDef[]` — `{ name, referencedTable, columns, referencedTableColumns, onDelete }`).

## Querying rows (`query_entity_table`)

| Arg | Notes |
|---|---|
| `table` | Table **name** (e.g. `"customer"`), not the dictionary id. |
| `where` | Equality filter object: `{ "country": "NO", "active": true }`. Equality only. |
| `select` | Columns to return. Omit for all. |
| `take` | Max rows. Default 100, **hard cap 1000**. |
| `skip` | Offset for pagination. Default 0. |
| `order` | `{ "createdAt": "DESC" }`. |

Returns `{ table, total, count, skip, take, rows }`. `createdAt`/`updatedAt` come back as integer epoch values.

## Gotchas

- **`save_table` runs real DDL.** Adding columns is safe; **changing a `fieldType` or dropping columns/indices/FKs can drop or coerce existing data** and emits operation warnings. Inspect with `get_table` first and treat type changes on populated tables with care.
- **Two different roles, two different concepts.** Definition CRUD needs `tabledefinition`. Querying needs the `tablebrowser` role **and** per-table read access — `query_entity_table` separately checks `rolesRead` on the target table, so a user can hold `tablebrowser` and still be denied a specific table.
- **`query_entity_table` is name-keyed; the others are id-keyed.** Use `list_tables` to map a name to its dictionary id for `get_table`/`save_table`/`delete_table`.
- **`where` is equality-only.** No ranges, `LIKE`, or `OR` over MCP — for richer queries, write a server script (see `manage-server-scripts`).
- **Update is keyed by `id`.** Omit `id` to create a new definition, include it to alter an existing one.
- **No row inserts/updates/deletes over MCP.** `query_entity_table` reads; data mutation goes through server scripts.

## Discovery flow

- To change schema: `list_tables` → `get_table({ id })` → `save_table({ table })`.
- To read data: `list_tables` (find the name) → `query_entity_table({ table, where?, select?, take?, skip?, order? })`.

## Permissions

- `list_tables` / `get_table` / `save_table` / `delete_table` — `tabledefinition` role (`List`/`Get`/`Save`/`Del`).
- `query_entity_table` — `tablebrowser` role (`List`) **plus** per-table `rolesRead` access on the queried table.

## Related skills

- **`dxp-overview`** — dictionary/TypeORM model and how scripts read/write tables.
- **`manage-server-scripts`** — write rows or run non-equality queries via TypeORM.
- **`manage-adaptive`** — `type: "T"` adaptive entities bind to a table defined here.
