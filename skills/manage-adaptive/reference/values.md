# Value shapes used across the templates

The per-template files list each setting's key and value kind. This file gives the shape of the object-valued ones.

## Navigation object

Used by `_navigationCreate`, `_navigationItemPress`, `_navigationMultiSelect` (report), `_app1Nav` … `_app9Nav` (Split Page Layout), and the field-level `_navigation` of `Link`, `Button` and value-help fields. **The key starts with `_`** (`_navigationItemPress`, not `navigationItemPress`); without the underscore nothing happens.

```json
{
  "destinationType": "F",
  "destinationTargetF": "<adaptive id>",
  "openAs": "D",
  "butType": "Default",
  "keyField": [{ "fieldName": "id", "key": "id", "value": "" }],
  "dialogTitle": "Order", "dialogTitleField": "<field>", "dialogSubTitle": "", "dialogIcon": "sap-icon://edit",
  "dialogWidth": "720px", "dialogHeight": "560px", "dialogHeader": true, "dialogResize": true, "dialogScrollHorizontal": false
}
```

| Field | Values |
|---|---|
| `destinationType` | `F` another adaptive app (`destinationTargetF` = its id), `A` an App Designer app (`destinationTargetA` = its name), `S` run a server script (`destinationTargetS` = script id, `sourceTargetS` = this adaptive app's id) |
| `openAs` | `P` page (in the same navigation stack), `D` dialog (default size 1024 × 500 px; `dialog*` fields style it), `S` launchpad side panel (only in a launchpad; the designer preview shows a message) |
| `keyField` | Values handed to the target: each entry sets the target's `fieldName` from the source row's `key` field, or to a fixed `value`. Set one of the two, never both (templates disagree on which wins). An empty `keyField` hands over the whole row. For list → form, `[{ "fieldName": "id", "key": "id", "value": "" }]` opens the clicked record. |
| `butType` | Button style: `Accept`, `Attention`, `Critical`, `Back`, `Default`, `Emphasized`, `Ghost`, `Neutral`, `Reject`, `Transparent`, `Unstyled`, `Up` |
| Script results (`S`) | `displayResponse`, `scriptSuccessTitle`, `scriptSuccessMessage`, `scriptErrorTitle`, `scriptErrorMessage`; the app refreshes afterwards |

## Lookup object

Used by `valueLookup` and the `status*Lookup` / `number*Lookup` keys of a field when its matching `*Type` is `Lookup`: show a text from another table instead of the raw value.

```json
{ "table": "<table NAME>", "textField": "name", "keyField": [{ "fieldName": "id", "key": "customerid", "value": "" }], "hideKey": true, "butType": "Default" }
```

`table` is the table **name** (not its id). `keyField` maps the lookup table's `fieldName` to this app's field `key` (or a fixed `value`). `hideKey: true` shows only the text.

## Value source of a field

`valueType` (and `statusIconType`, `statusStateType`, `statusTitleType`, `numberUnitType`, `numberStateType`): `""` the field's own value, `Fixed` (`valueFixed` / `…Fixed`), `Lookup` (`valueLookup` / `…Lookup`), `Rule` (`valueRule` / `…Rule` = a Rules Engine id), `Binding` (`…Binding` = another field's name; status and number parts only). `Script` is offered in some designers but nothing evaluates it: the field stays blank. The resolved value arrives as `<name>_value` (one value source per field name).

## PDF object (`_pdfPrint`)

`{ "pdf": "<PDF template id>", "savePDF": false, "securityKey": "" }`. Needs `report.enablePDF: true`. The app sends its data to the PDF template.

## Tabs (`tabList`, Tabs template)

`[{ "title": "Orders", "icon": "sap-icon://list", "contentType": "F", "contentTarget": "<adaptive id>", "showCount": true }]`. `contentType` `F` = an adaptive app (id), anything else = an App Designer app (`contentTarget` = its name). Tabs are independent apps; give the Tabs app a `connectorid` (see SKILL.md).

## Select items (`dynamicDataItems`)

`[{ "key": "open", "text": "Open" }, …]` for a `SingleSelect` / `MultiSelect` with fixed choices. Read only by List filters and Form inputs; a Form `MultiSelect` must have it. Other templates take the choices from the connector.

## `defaultVariant`

Every app carries one. Minimal form:

```json
{ "id": "<new uuid>", "colOrder": "key_a_to_z", "rowOrder": "key_a_to_z", "row": [], "column": [], "val": [], "inclusions": {}, "exclusions": {} }
```

For the Pivot Table / Graphical Visualization template it is the initial view:
- `row`, `column`, `val`: arrays of field entries copied from `fieldsRun` (at least `{ "name", "text" }`). The pivot matches them **by `text`**, so the text must equal the `fieldsRun` entry's text; `fieldsRun` entries with `hidden: true` are left out.
- `rendererName`: `Table` (default), `Table Barchart`, `Area Chart`, `Area Spline Chart`, `Area Percent Chart`, `Bar Chart`, `Bar Percent Chart`, `Column Chart`, `Column Percent Chart`, `Line Chart`, `Pie Chart`, `Spline Chart`, `Stacked Bar Chart`, `Stacked Column Chart`, `TreeMap Chart`.
- `aggregatorName`: `Count` (default), `Average`, `Count Unique Values`, `First`, `Last`, `List Unique Values`, `Integer Sum`, `Median`, `Minimum`, `Maximum`, `Sum`, `Sum over Sum`, `Sum as Fraction of Total`, `Sum as Fraction of Rows`, `Sum as Fraction of Columns`, `Count as Fraction of Total`, `Count as Fraction of Rows`, `Count as Fraction of Columns`, `Sample Variance`, `Sample Standard Deviation`.

## Tile Chart series

In `neptunedxp_adaptive_tile_chart`, each `fieldsRun` entry has `type`:
- `category` (“Column” in the designer) = the **X-axis categories**;
- `data` (“Row”) = **one series per distinct value**, named in the legend;
- `value` = the plotted number, summed per category and series. Only the first `value` field is plotted; with none the chart counts entries.

So “amount per region” is region `category` + amount `value` (one series, labelled axis); set `report.paginationRows` above the record count, since only that many rows are fetched before summing (default 10). A field without `type` counts as `data`. Region `data` + amount `value` gives one unlabelled bar per region whose names appear only in the legend, so it is unreadable with `legendEnable: false` (verified). `properties.table.chartType`: `area`, `areaspline`, `areapercent`, `bar`, `barpercent`, `barstacked`, `column` (default), `columnpercent`, `columnstacked`, `line`, `spline`, `pie` (`arearange` is listed in the designer but needs range data the template never sends). `chartColor`: a JSON array as a string, `["#0a6ed1","#e76500"]`.

## Formatters (`formatter`)

`date00` browser date, `date01` dd.mm.yyyy, `date02` mm-dd-yyyy, `date03` year + month (`yyyy MMM`), `date04` year + quarter (`yyyy QQ`), `date05` 24-hour `HH:mm`, `sapdate01`/`sapdate02` SAP dates, `zero` remove leading zeros, `uppercase`, `lowercase`, `number00` browser number, `number01` 0 decimals, `number02`–`number04` 1–3 decimals with comma, `number05`–`number07` 1–3 decimals with point, `numberCustom` (`formatNumberDecimals`, `formatNumberSeparator`), `file` file size, `customPairs` (`formatCustomPairs`). Each template lists the ones it supports.
