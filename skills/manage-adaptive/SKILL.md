---
name: manage-adaptive
description: Build, change, inspect, or delete Neptune DXP Adaptive apps (no-code apps made from a template plus a connector) via the MCP tools `list_adaptive`, `get_adaptive`, `save_adaptive`, `delete_adaptive`. Use when the user wants a list or table, an edit form, a card grid, a calendar, a pivot table or chart, a chart or table inside a launchpad tile, a split-page or tabbed layout, list-to-form navigation, filters, column formatting, status colours, PDF printing, or to change or remove an Adaptive app. Trigger phrases include "adaptive app", "adaptive designer", "build a list app", "create a form for this table", "CRUD app", "pivot table", "chart tile", "dashboard with charts", "split view", "tabs app", "calendar app", "add a filter", "open the record in a dialog". Read this BEFORE any `save_adaptive` payload — the tool accepts almost any object and checks very little.
---

# Building Neptune DXP Adaptive apps via MCP

An **Adaptive app** is a stored configuration that a ready-made **template** renders: which **connector** supplies the data (`manage-connectors`), which fields appear as filters or form inputs (`fieldsSel`) and as columns, cards or chart series (`fieldsRun`), and the template's display options (`properties`). No UI is written by hand. All four tools need the Adaptive Designer permission (`adaptivedesigner`: `Get`, `Save`, `Del`; any permission for the list).

| Tool | Purpose |
|---|---|
| `list_adaptive({ listOptions? })` | Summaries `id`, `name`, `description`, `type`, `application` (template), `package`, `updatedAt`. Add `group`, `appType`, `connectorid`, `ver` or `changedBy` with `listOptions.select`. 25 per page (max 200); `nextSkip` only when `hasMore`. |
| `get_adaptive({ id })` or `({ name })` | One app with `settings`, `roles`, `i18n`. Neither → `Either id or name is required`. No where-used. |
| `save_adaptive({ adaptive })` | Create (no `id`) or update (with `id`). See Save rules. |
| `delete_adaptive({ id })` | Permanent (`Adaptive '<id>' deleted`; unknown id → `Not Found`). Tiles, tabs, splitters and navigations that point at it are not updated. |

## Pick a template

| `application` | Name in the designer | Use it for | Data fields | Reference |
|---|---|---|---|---|
| `neptunedxp_adaptive_list` | List / Table | Searchable, sortable, groupable table with filters, export/import, create/delete, multi-select actions | `fieldsSel` filters, `fieldsRun` columns | `reference/template-list.md` |
| `neptunedxp_adaptive_edit` | Form | Create, view and edit one record; opened from a list | `fieldsSel` form inputs | `reference/template-edit.md` |
| `neptunedxp_adaptive_grid` | Grid | Records as cards (image, title, subtitle, status, description) | `fieldsSel` filters, `fieldsRun` card parts | `reference/template-grid.md` |
| `neptunedxp_adaptive_calendar` | Calendar | Records with dates as appointments (day/week/month) | `fieldsSel` filters, `fieldsRun` appointment parts | `reference/template-calendar.md` |
| `neptunedxp_adaptive_bi` | Pivot Table / Graphical Visualization | Slice and dice: pivot table or 14 chart types, totals; the user can rearrange | `fieldsSel` filters, `fieldsRun` dimensions, `defaultVariant` = the initial view | `reference/template-bi.md` |
| `neptunedxp_adaptive_tile_chart` | Tile Chart | A chart inside a launchpad tile | `fieldsSel` filters, `fieldsRun` series (`data`/`category`/`value`) | `reference/template-tile_chart.md` |
| `neptunedxp_adaptive_tile_table` | Tile Table | A small table inside a launchpad tile | `fieldsSel` filters, `fieldsRun` columns | `reference/template-tile_table.md` |
| `neptunedxp_adaptive_splitter` | Split Page Layout | Up to 9 apps in three stacked rows of up to three | none (`_app1Nav` … `_app9Nav`) | `reference/template-splitter.md` |
| `neptunedxp_adaptive_tabs` | Tabs | Apps in tabs | none (`tabList`) | `reference/template-tabs.md` |

Any App Designer app of appType `F` can also serve as a template; these nine are the ones Neptune ships. Open the template's reference file before writing its `properties` and field entries: it lists every key, the designer's default, allowed values and when it applies. `reference/values.md` has the object shapes (navigation, lookup, PDF, tabs, pivot view, chart series, formatters).

## Build an app

1. **Connector**: find or create it (`manage-connectors`) and read `get_connector_field_catalog`. Fields with `usage` `INPUT` or `BOTH` can be filters/form inputs; `OUTPUT` or `BOTH` can be columns. When the table defines read/write roles, a table connector also needs them for the user; the app's `roles` alone do not give data access.
2. **Template**: pick it from the table above and open its reference file.
3. **Save** the app:

```json
save_adaptive({ "adaptive": {
  "name": "orders_list", "description": "Open orders", "group": "", "package": "<package id>",
  "type": "C", "appType": "A", "connectorid": "<connector id>", "application": "neptunedxp_adaptive_list",
  "settings": {
    "properties": { "report": { "title": "Orders", "autoRun": true, … }, "form": { … }, "table": { … } },
    "fieldCatalog": [ { "name": "customer", "label": "Customer", "type": "text", "usage": "BOTH" }, … ],
    "fieldsSel": [ { "name": "status", "text": "Status", "type": "MultiSelect", "visible": true, "fieldPos": 1 } ],
    "fieldsRun": [ { "name": "customer", "text": "Customer", "visible": true, "enableFilter": true, "enableSort": true, "fieldPos": 1 },
                   { "name": "amount", "text": "Amount", "visible": true, "enableFilter": false, "type": "ObjectNumber", "fieldPos": 2 } ],
    "defaultVariant": { "id": "<new uuid>", "colOrder": "key_a_to_z", "rowOrder": "key_a_to_z", "row": [], "column": [], "val": [], "inclusions": {}, "exclusions": {} }
  }
} })
```

   - `type` is always `"C"` (connector) and `appType` always `"A"`. Apps of type `T` or `S` cannot run.
   - `fieldCatalog`: a copy of the connector's catalog, entries `{ name, label, type, usage }`. Keep it: a table connector reads each filter's type from it, and filters fail without it (`Error in runTable`).
   - **Field entries never get defaults at run time.** Each needs `name`, `text` (label), `fieldPos` (1, 2, 3 … order) and **`visible: true`** (List and Tile Table columns and Tile Chart fields without it are not used); form inputs also need `visible: true` and `editable: true` (required-checks run only on editable, visible inputs). Add the template's other field keys you need.
   - In a List set `enableFilter: false` on number, date and boolean columns: the search box applies a text `Contains` to every flagged column and fails on other types.
   - `properties` **must contain all three objects, `report`, `form` and `table`**, even `{}` for a section the template does not use; a missing section stops the app at start with a TypeError. Every template except the Pivot fills a missing **property** key with its default at run time, so send the keys you change; for the Pivot send every key you rely on.
   - **`report.autoRun: true`**: List, Grid, Calendar and Pivot show nothing until the user presses Run/Update unless it is set (default `false`). Form, Tile Chart and Tile Table always load.
4. **Check**: `get_adaptive` and compare `settings` with what you sent. At run time only fields that exist in the connector's live catalog appear; others are dropped silently.
5. **Show it**: a launchpad tile (`manage-tiles`) with `actionType: "F"` and `settings: { "adaptive": { "id": "<adaptive id>" } }` opens the app; for Tile Chart and Tile Table use tile `type: "adaptive"` with `settings.adaptive.idTile`. The user can also open it in the Cockpit's Adaptive Designer.

## Patterns

**List with a form (CRUD)**: create the Form app first (`neptunedxp_adaptive_edit`, its inputs in `fieldsSel`), then the List with `report.enableCreate: true`, `_navigationItemPress` = `{ "destinationType": "F", "destinationTargetF": "<form id>", "openAs": "D", "dialogHeader": true, "dialogTitle": "Order", "dialogTitleField": "orderNo", "keyField": [{ "fieldName": "id", "key": "id", "value": "" }] }` (opens the clicked record) and `_navigationCreate` with the same target and `keyField: []`. With `keyField: []` the new record is pre-filled with the List's current filter values; map fields explicitly to avoid that. Turn on `enableDelete`, `enableExport` etc. as needed. The form saves through the connector (a table connector writes the table; a script connector's run script gets `method: "Save"`), and the List refreshes after the form saves.

**Dashboard**: one Pivot app per analysis (`defaultVariant.rendererName` e.g. `Column Chart`, `aggregatorName` e.g. `Sum`, `row`/`column`/`val`), placed in a Split Page Layout (`_app1Nav` …) or a Tabs app (`tabList`). Panes and tabs are independent: selecting a record in one does not filter another.

**Split Page Layout**: `_app1Nav`–`_app3Nav` form row 1 (side by side), 4–6 row 2, 7–9 row 3, rows stacked; `splitterNWidth` is the **height** of row N and `splitterNMinSize` its minimum. Only `destinationType` `F` and `A` work there; `openAs` and `dialog*` are ignored.

**Tabs**: `tabList` entries `{ title, icon, contentType: "F", contentTarget: "<adaptive id>", showCount }`. Give the Tabs app the `connectorid` of a working connector (the designer always sets one; without it the tabs were seen to stay empty).

**KPI tiles**: Tile Chart and Tile Table apps, each on a tile of type `adaptive` in a tile group.

## Make it look good

- **Header**: `report.title`, `subTitle`, `avatarIcon` (`sap-icon://…`) with `avatarBackgroundColor` (`Accent1`–`Accent10`), `showIcon`. Button texts, icons and types (`textButtonCreate`, `typeButtonCreate: "Emphasized"` …).
- **Columns** (`fieldsRun` of List and Tile Table): statuses as `type: "ObjectStatus"` with a state (`statusStateType` `Fixed`/`Lookup`/`Rule`/`Binding`), amounts as `ObjectNumber` with a unit, dates with a `formatter` (`date01` …), long texts as `ExpandableText`; hide technical fields (`visible: false`) and order with `fieldPos`. `valueType: "Lookup"` shows a name instead of an id.
- **One line per row**: leave `table.enableAutoPopin` and the columns' `demandPopin` off unless the user wants columns to drop into a second line under each row. To hide secondary columns on small screens, give them `minScreenWidth` (`Desktop`, `XLarge` …) with `demandPopin: false`; set `width` on short columns. `popinDisplay` styles a popped-in column and needs `demandPopin: true`.
- **Grid cards**: one field each for `Title`, `SubTitle`, `Status`, `Description` (only the first of each type is shown), optional `Icon`/`Image`; `textType`/`textFontSize` style the texts.
- **Calendar**: map `startDate` and `endDate` (the same field may be both; fine for the month view), `title`, `text`, `description`. Each role is bound straight onto the appointment: give appointments an `icon` (`sap-icon://…`), a `color` (CSS colour such as `#2b7d2b`) or a `type` (`Type01`–`Type20`), from the record, a `Fixed` value or a `Lookup`. The calendar opens on today; `table.startBegData: true` jumps to the first record when the data lies elsewhere.
- **Table**: `initialSortField`/`initialSortOrder`, `initialGroupField`, `enablePagination` + `paginationRows`, `showSeparators`, `alternateRowColors`, `enableCompact`, `headerText`, `noDataText`.
- **Form**: `properties.form` sets the layout (`formLayout`, `columnsL`/`columnsM`, `labelSpanL`/`labelSpanM`); `columnLabel` on a field starts a group; mark `required` fields. Selects show `key - text` unless the field has `dataShowOnlyText: true`. A field `description` (help text under the input) breaks the form only with `formLayout: "ColumnLayout"` (the whole form stays empty, `… is not a valid Form content`); use another layout when fields have help text.
- **Tile Chart**: put the dimension on the X axis as a `category` field and the number as a `value` field (`reference/values.md` → Tile Chart series). **Set `report.paginationRows` above the number of records** (shipped examples use 500 or 1000): only that many rows are fetched before summing (default 10), so totals are otherwise silently wrong. The Y-axis title is made from the `category` fields' labels, so with this layout set `yAxisTitleEnable: false`. `chartColor` is a JSON array as a string (`["#0a6ed1","#e76500"]`); anything else is ignored. If the tile shows its own title, leave the chart `title` empty or use `subTitle`. Right after a change the first paint may come from the browser's cache of the previous data.
- **Pivot**: `defaultVariant.rendererName` and `aggregatorName`; `row`/`column`/`val` entries must carry the **same `text` as the `fieldsRun` entry** (the pivot matches by label, not name; a different text drops the dimension). Chart renderers put `column` fields on the X axis and draw one series per `row` value. A `DateRange` filter in the Pivot starts at **today** unless its `sysvarValue` names a preset (`LAST_7`, `LAST_30`, `LAST_90`, `NEXT_180` …), so set a preset or leave the date filter out.
- **Filters**:
  - Give each filter the right `type` (`MultiSelect`, `DateRange`, `RangeSlider`, `SingleSelectLookup` …).
  - Fixed choices (`dynamicDataItems`) work only in List filters and Form inputs; other templates take the choices from the connector (a table connector offers the column's distinct values). **A Form MultiSelect must have `dynamicDataItems`.** Never send the reference's placeholder `[{"text":"","key":""}]`.
  - A `CheckBox` or `Switch` filter always filters (on = true, off = not true; there is no "all"): for an optional yes/no filter use a `SingleSelect` with two items.
  - A `RangeSlider` needs `rangeMin` and `rangeMax`, or it starts restricted to 25–75.
  - Set `visible: true` on at least one filter, or the filter header is hidden.

## Save rules and limits

- Checks on save are few: an unknown template, field name or `settings` key is accepted and stored. A `connectorid` that does not exist is refused (`Error saving reports`). Unknown top-level keys are dropped silently.
- Send `settings` with `properties`, `fieldsSel` and `fieldsRun` on **every** save, including updates (without them: `Cannot read properties of undefined (reading 'fieldsSel')` / `settings.fieldsRun is not iterable`). `settings` is stored as a whole, so send the full object from `get_adaptive`; top-level fields you leave out keep their values.
- `name` is unique (`name '<name>' already exists!`). On create the caller's default package applies; when packages are enforced the save may demand one.
- **One value source per field name.** A field with `valueType` (`Fixed`, `Lookup`, `Rule`) delivers its value as `<name>_value`, so two `fieldsRun` entries on the same `name` that both have a `valueType` overwrite each other (seen: a status-to-icon and a status-to-colour lookup on one calendar gave broken icons). Take the second value from another field. `valueType: "Script"` is offered in the designer but nothing evaluates it, so the field stays blank.
- In a navigation `keyField`, set either `key` (copy from the source row) or `value` (fixed), never both.
- Texts can be i18n bindings (`{i18n.<model>>key}`); the save links the referenced i18n models (`list_i18n_models`).
- Who can open an app and run its data is set by its `roles` (`[{ id }]`, ids from `list_roles`): stored as sent, kept when an update leaves `roles` out, replaced when it sends a list (verified); `get_role` lists the app under `reports`.
- Delete order: a connector that an app uses cannot be deleted (`Error deleting connector`), so delete or re-point the apps first. Find references from tiles (`settings.adaptive.id`/`idTile`), Tabs (`tabList`) and Split Page Layouts (`_appNNav`) by listing those.
- Known issue: on a launchpad page that shows both a Tile Chart and a Tile Table tile, opening another Adaptive app can make the two tiles redraw with each other's settings (seen twice); reloading the page restores them.
- Cannot over MCP: preview or run the app, read its data (read the connector's source instead). A script connector's run script must handle `List`, `Get`, `Save` and `Delete` for the templates that use them (`manage-connectors`).

## Related skills

- **`manage-connectors`**: the data source every app needs.
- **`manage-tiles`**, **`manage-tile-groups`**, **`manage-launchpads`**: put apps and tile charts on a launchpad.
- **`manage-tables`**, **`manage-server-scripts`**: the data behind a connector.
