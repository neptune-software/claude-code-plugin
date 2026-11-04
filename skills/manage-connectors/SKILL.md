---
name: manage-connectors
description: Create, update, inspect, or delete Neptune DXP connectors (the data sources Adaptive apps, PDF templates and App Designer connector components bind to) via the MCP tools `list_connectors`, `get_connector`, `get_connector_field_catalog`, `save_connector`, `delete_connector`. Use when the user wants a table, server script, API or SAP data source for an Adaptive app or a PDF, wants to see or override a connector's fields, restrict who may call it, see where a connector is used, or remove one. Trigger phrases include "create a connector", "table connector", "script connector", "API connector", "SAP connector", "field catalog", "which fields does the connector have", "where is this connector used", "delete the connector".
---

# Managing Neptune DXP connectors via MCP

A **connector** is a named data source with a **field catalog** (the fields it offers). Adaptive apps (`manage-adaptive`), PDF templates and App Designer connector components use a connector instead of a table, script or API directly. All five tools need the Cockpit Connector permission (`connector`: `Get`, `getFieldCatalog`, `Save`, `Del`; any permission for the list).

| Tool | Purpose |
|---|---|
| `list_connectors({ listOptions? })` | Summaries `id`, `name`, `description`, `type`, `package`, `updatedAt`; `{ items, hasMore, nextSkip? }`. `where`/`order` work on `name`, `description`, `group`, `type`, `disabled`, `package`, `createdBy`, `changedBy`, `createdAt`, `updatedAt`; a `where` on any other key (such as `id`) is dropped and returns **unfiltered** results. `select` returns only the named keys plus `id` (it can name `settings`, `group`, `disabled`, `createdBy`, `ver`). |
| `get_connector({ id })` | Full connector with `settings`, `roles` (`[{ id, name }]`) and `whereUsed`: `{ adaptive: [{ id, name }], pdfs: [{ id, application }] }` (App Designer apps are not listed). Unknown id: `Not Found`. |
| `get_connector_field_catalog({ id })` | The fields the connector offers now, `[{ name, label, type, usage, … }]`. For a script connector this **runs** `scriptSel`, with its side effects, for anyone allowed to display connectors. |
| `save_connector({ connector })` | Create (no `id`) or update (with `id`). |
| `delete_connector({ id })` | Permanent. See Delete. |

## Types and required settings

| `type` | Data from | Required `settings` | Field catalog comes from |
|---|---|---|---|
| `T` | A table (`manage-tables`) | `tableid` | The table's fields plus `createdAt`, `updatedAt`, `createdBy`, `updatedBy` (all `usage: "BOTH"`; no `id` field) |
| `S` | Two server scripts (`manage-server-scripts`) | `scriptSel`, `scriptRun` (script ids) | Running `scriptSel` |
| `A` | An API (`manage-apis`) | `apis.get`, `apis.list`, `apis.save`, `apis.delete`, all four, each `{ "api": "<api id>", "path": "<operation id>" }` | `settings.fieldCatalog` (you write it; without it the catalog read fails with `Field catalog not found`) |
| `F` | An SAP system (`manage-remote-systems`) | `sapaf.system` (remote system id), `sapaf.type`, `sapaf.entityKey1` | The SAP system |

- **API `path` is the operation id**, the `id` of the entry in `get_api` → `paths`, not the URL path. The save does not check it; a URL path saves fine and every run fails.
- **SAP `sapaf.type`** is `SHLP` (search help: `entityKey1` = search-help type such as `SH`, `entityKey2` = search-help name, needed) or `PROG` (`entityKey1` = program name). Any other value saves and gives an empty catalog. A wrong system id gives `Error getting AFClient`. `F` connectors have no preview.
- A missing operation or `sapaf` object fails with `Missing required settings for connector type '<type>': settings.<path>, …`. Any `apis.<op>` you send needs both `api` and `path`, and any `sapaf` needs `system`, `type` and `entityKey1`; a partial object fails input validation (`MCP error -32602 … Required at connector.settings.apis.get.path`). Ids are not checked on save: a wrong table, script or API shows up only when the catalog is read (`Table … not found`, `Script not found`, `API not found`) or the connector runs.

Other fields: `name` (required, unique, max 256), `description` (max 1024), `group` (max 256, free text), `package` (on create, the caller's default package applies; `Package is a required field` when packages are enforced), `disabled` (stored only; nothing at run time reads it), `documentation: { content }`, `roles`, and in `settings`: `startParam` (passed to the scripts of an `S` connector), `previewable` (allows the Cockpit preview), `overriddenFieldCatalog`, `fieldCatalog`. Unknown keys are dropped without an error.

### Script connector (`S`)

`scriptSel` sets `result.data` to the field catalog, an array of `{ name, label, type, items?, usage? }`:

```javascript
result.data = [
    { name: "orderNo", label: "Order", type: "text" },
    { name: "status", label: "Status", type: "text", items: [{ key: "open", text: "Open" }, { key: "done", text: "Done" }] },
    { name: "amount", label: "Amount", type: "decimal", usage: "OUTPUT" },
];
complete();
```

`scriptRun` is called for every operation. It branches on `req.query.method` (`List`, `Get`, `Save`, `Delete`) and gets `req.body._settings` (the calling app's settings), `req.body._connector` and `req.body._startparam` (the connector's `startParam` string). From an Adaptive app, the record values and filters are in `req.body` itself (as below); from an App Designer connector component they are in `req.body.runParams`, and `req.body.id` is the connector's id:

```javascript
switch (req.query.method) {
    case "Get":    result.data = await getOne(req.body.id); break;
    case "Save":   result.data = { savedItem: await saveOne(req.body), status: "OK" }; break;
    case "Delete": await deleteOne(req.body.id); result.data = { status: "OK" }; break;
    default: {     // "List"; req.body._preview is true when the designer previews
        const items = await list(req.body);
        result.data = { result: items, count: items.length };
    }
}
complete();
```

How `get_connector_field_catalog` reports a bad `scriptSel`: a non-array, or objects missing `name`/`label`/`type`, give `Returned data from selection script was not a fieldCatalog. Should be an array of objects with properties name, label and type`. An array of non-objects or a script that throws gives only `Error in getFieldCatalogScript`, with the script's own message lost, so test the script with `run_server_script` first. `[]` is accepted as an empty catalog. Entry `type` values are not checked here.

### Field catalog entries

`{ name, label, type, usage?, items?, mapping?, originalName? }`:
- `type` (on save): `text`, `uuid`, `decimal`, `boolean`, `smallint`, `integer`, `bigint`, `smalltext`, `mediumtext`, `timestamptz`, `timestamp`, `json`, `string`, `number`, `array`, `object`, `reference`. A catalog read can return other types (`date` from a script, `vector`/`halfvec` from a table); change them to one of these before saving the catalog back, or the save fails with `Invalid enum value … at connector.settings.fieldCatalog[n].type`.
- `usage`: `BOTH`, `INPUT`, `OUTPUT`. `items`: fixed values `[{ key, text, additionalText? }]`.
- `mapping` (API connectors): per operation `get`, `list`, `save`, `delete`, an `{ input, output }` pair of **paths**: `input` = `Parameters/<parameter>` or `Content/<property path>`, `output` = the response path such as `200/items/name` (status prefix optional). A bare field name maps nothing.

For `T`, `S` and `F` the catalog comes from the source. To replace it, send `overriddenFieldCatalog: true` together with a non-empty `fieldCatalog` (`true` without one fails with `settings.fieldCatalog is required when overriddenFieldCatalog is true`). A `fieldCatalog` sent without the flag is dropped silently unless the connector is already overridden. **Overriding freezes the catalog**: new table columns or script fields stop appearing, and the stored entries come back without default `usage`. `overriddenFieldCatalog: false` deletes the stored catalog. `A` connectors always use the stored `fieldCatalog`, with no default `usage`.

## Save rules

- **Updates merge.** Fields you do not send keep their values; `settings` is merged key by key (`apis` and `sapaf` one level deeper, but each object you send must be complete, see above). An update adds empty `apis: {}` and `sapaf: {}`. `fieldCatalog` and `roles` are replaced as a whole when sent.
- **`roles`** (`[{ id }]`, ids from `list_roles`) restrict direct calls to the connector, such as from an App Designer connector component: the user, directly or through a security group, needs one of them; empty means every signed-in user. **An Adaptive app runs its connector under the Adaptive app's own roles**, so set roles on the app (`manage-adaptive`) to protect its data. An update without `roles` keeps them; `roles: []` clears them. The save response includes `roles` only when the call sent them; read the stored list with `get_connector`.
- Errors: `name is required`, `type is required`, `name '<name>' already exists!`, `Connector <id> not found` (update of an unknown id); a `type` other than `T`, `S`, `A`, `F` fails input validation. When someone has the connector open in the Cockpit, save and delete fail with the lock message.

## Delete

- **An Adaptive app that uses the connector makes the delete fail** with `Error deleting connector` (on some databases the app's link is cleared instead). Point the app at another connector or delete it first (`whereUsed.adaptive`).
- A PDF template keeps the deleted connector's id, and activating it again (`activate_pdf_template`) fails with `Error activating pdf` until it gets another connector (`whereUsed.pdfs`).
- **App Designer apps bind a connector by name** and are not in `whereUsed`: deleting or renaming the connector silently breaks them. Search the apps before renaming or deleting (`manage-apps`).
- An unknown id returns `Not Found`.

## Recipes

**Table connector for an Adaptive app**: `save_connector({ "connector": { "name": "orders", "type": "T", "settings": { "tableid": "<table id>" } } })` → `get_connector_field_catalog` to confirm the fields → bind it in `manage-adaptive`.

**Script connector**: write and test `orders_fields` and `orders_rows` (above) with `manage-server-scripts` / `run-server-script` → `save_connector({ "connector": { "name": "orders_live", "type": "S", "settings": { "scriptSel": "<id>", "scriptRun": "<id>" } } })` → `get_connector_field_catalog` must list your fields.

**API connector**: `get_api` → note the API id and the operation `id` of the get, list, save and delete operations → save with `apis` and a `fieldCatalog` whose `mapping` paths follow the operations' parameters and responses.

**Rename labels without touching the source**: `get_connector_field_catalog` → change `label`s, and any `type` outside the save list → `save_connector({ "connector": { "id": "…", "settings": { "overriddenFieldCatalog": true, "fieldCatalog": [ … all fields … ] } } })`. The catalog is frozen from then on.

## Related skills

- **`manage-adaptive`**: Adaptive apps built on a connector.
- **`manage-tables`**, **`manage-server-scripts`**, **`run-server-script`**, **`manage-apis`**, **`manage-remote-systems`**: the sources behind `T`, `S`, `A`, `F`.
