# Template `neptunedxp_adaptive_tile_chart`: Tile Chart

Creates an adaptive application that can run directly within a tile in a launchpad. The resulting application displays real-time data in a specific chart, similar to adaptive applications created with the slice and dice template. However, you cannot further customize or edit the visualized data on the tile.

In this template: `fieldsSel` = the **Filter** fields (catalog usage `INPUT`/`BOTH`); `fieldsRun` = the **Chart** fields (catalog usage `OUTPUT`/`BOTH`).

Keys shown as `_name` hold an object (navigation or PDF, see `values.md`). The *Default* column is what the designer writes.
At run time this template fills a missing `properties` key with the default below.
**Field entries (`fieldsSel`, `fieldsRun`) never get defaults at run time**: send `visible: true` on every field (List and Tile Table
columns and Tile Chart fields without it are not used) and `editable: true` on form inputs. Never send a default marked *placeholder*.

## `settings.properties.report`

**Properties**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `paginationRows` | text | `10` |  |  | **Caps the rows fetched before summing**: set it above the number of records (shipped examples use 500 or 1000), or totals are silently wrong. |
| `updateTime` | text | `0` |  |  | Sets the chart to refresh automatically every X minutes. By default the table won't automatically refresh. |

**Sorting 1**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `initialGroupField` | field name |  |  |  | Sets a first field to sort the chart by initially. |
| `initialGroupOrder` | one of |  | `""`, `ASC`, `DESC` |  | If a field is selected for Initial Sorting, this setting determines the order of the sorting - ascending or descending. |

**Sorting 2**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `initialSortField` | field name |  |  |  | Sets a second field to sort the chart by initially. |
| `initialSortOrder` | one of |  | `""`, `ASC`, `DESC` |  | If a field is selected for Initial Sorting, this setting determines the order of the sorting - ascending or descending. |

## `settings.properties.form`

**Properties**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `enableCompact` | boolean | `false` |  |  | When checked, Compact Mode will make the elements in the filter section appear smaller and closer together. This setting might be suitable for mouse-operated devices, like desktops. |
| `showFilter` | boolean | `false` |  |  | If unchecked, the filter section will be hidden, and only the chart itself will be visible. |

## `settings.properties.table`

**General**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `title` | text |  |  |  | Sets a title for the chart, displayed under the filter section, above the chart. |
| `subTitle` | text |  |  |  | Sets a subtitle for the chart, displayed under the title, above the chart. |
| `titleAlign` | one of | `"center"` | `""`, `left`, `center`, `right` |  | Aligns the title and subtitle to the left, center, or right. By default, the header and subtitle will be aligned to the center. |
| `chartHeight` | text | `250` |  |  | Sets the height of the chart in pixels. |
| `chartType` | one of | `"column"` | `""`, `area`, `arearange`, `areaspline`, `areapercent`, `bar`, `barpercent`, `barstacked`, `column`, `columnpercent`, `columnstacked`, `line`, `spline`, `pie` |  | Determines how to display the data. E.g., 'Column' to display the data as vertical bars, 'Line' for a series of datapoints connected with a straight line, or 'Pie' for a circular chart divided into sectors which is proportional to the quantity it represents. |
| `enableSorting` | boolean | `false` |  |  | If checked, the data in the chart will be sorted by value, from low to high. |

**Layout**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `chartColor` | text |  |  |  | A JSON array **as a string**, e.g. `["#0a6ed1","#e76500"]` (single quotes allowed). Anything else is ignored silently. |
| `enableMonochrome` | boolean | `false` |  |  | If enabled, the chart colors will be a gradient based on the Monochrome Color. |
| `colorMonochrome` | text |  |  |  | Sets a single color to base the monochrome gradient on, e.g. 'rgb(205,92,92)'. |
| `brightenMonochrome` | text |  |  |  | Sets a factor by which to brighten the colors in the chart. |
| `plotLineColor` | text |  |  |  | Sets the color of the graph line/stroke. Defaults to the fill color if nothing is set. |
| `lineWidth` | text |  |  |  | Sets the pixel width of the graph line/stroke. Defaults to 2 pixels if nothing is set. |
| `pieInnerSize` | text | `0` |  |  | Sets the size of the inner diameter for the pie, if the chart type is 'Pie'. The default size is 0 pixels. |

**3D**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `enable3D` | boolean | `false` |  |  | If enabled, the chart will be rendered in 3 dimensions. |
| `alpha3D` | text | `0` |  |  | Sets one of the two rotation angles for the chart. Defaults to 0. |
| `beta3D` | text | `0` |  |  | Sets the other of the two rotation angles for the chart. Defaults to 0. |
| `depth3D` | text | `100` |  |  | Sets the total depth of the chart. Defaults to 100. |

**Legend**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `legendEnable` | boolean | `true` |  |  | Enable or disable the chart legend, which displays the series in a chart with with a predefined symbol and the name of the series. |
| `legendAlign` | one of | `"center"` | `center`, `left`, `right` |  | Sets the horizontal alignment of the legend box within the chart area to left, center, or right. |
| `legendVerticalAlign` | one of | `"bottom"` | `bottom`, `middle`, `top` |  | Sets the vertical alignment of the legend box to the top, middle, or bottom. If the layout option is set to 'proximate', the vertical align option doesn't apply. |
| `legendLayout` | one of | `"horizontal"` | `horizontal`, `vertical`, `proximate` |  | Sets the layout of the legend items to horizontal, vertical, or proximate. If set to 'proximate', the legend items will be placed as close as possible to the graphs they're representing, except in inverted charts or when the legend position doesn't allow it. |

**X-Axis**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `xAxisTitleEnable` | boolean | `true` |  |  | Determines whether or not to display the title of the X-axis in the chart. |
| `xAxisReversed` | boolean | `false` |  |  | Determines whether to reverse the axis so that the highest number is closest to the origin. |
| `xAxisStartOnTick` | boolean | `true` |  |  | Determines whether to force the axis to start on a tick. |
| `xAxisGridLineWidth` | text | `0` |  |  | Sets the width of the grid lines extending the ticks across the plot area. |
| `xAxisGridLineColor` | text |  |  |  | Sets the color of the grid lines extending the ticks across the plot area. |

**Y-Axis**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `yAxisTitleEnable` | boolean | `true` |  |  | Determines whether or not to display the title of the Y-axis in the chart. |
| `yAxisReversed` | boolean | `false` |  |  | Determines whether to reverse the axis so that the highest number is closest to the origin. |
| `yAxisStartOnTick` | boolean | `true` |  |  | Determines whether to force the axis to start on a tick. |
| `yAxisGridLineWidth` | text | `1` |  |  | Sets the width of the grid lines extending the ticks across the plot area. |
| `yAxisGridLineColor` | text |  |  |  | Sets the color of the grid lines extending the ticks across the plot area. |

**Post-processing**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `postProcessingScript` | server script id |  |  |  | Sets a script to be run every time the app is run/updated, after the data has been fetched. *The data is set to req.body and passed to the script with the rest of the request object.* |

## `settings.fieldsSel[]` (one entry per field)

Every entry also has `name` (a field catalog name) and `fieldPos` (1, 2, 3 … display order).

**General**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `text` | text |  |  |  | Sets the name displayed above the filter input. |
| `type` | one of |  | `""`, `CheckBox`, `DateRange`, `MultiSelect`, `MultiSelectLookup`, `MultiSelectScript`, `SingleSelect`, `SingleSelectLookup`, `SingleSelectScript`, `Switch` |  | Sets the type of filter input. |

**Data Source**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `lookupTable` | table name |  |  | type === "MultiSelectLookup" or type === "SingleSelectLookup" | Sets the table to be used as the data source for the filter field. |
| `lookupFieldKey` | lookup-table field name |  |  | type === "MultiSelectLookup" or type === "SingleSelectLookup" | Sets the field to be used as the key for the filter. It is the value of this field that the filter will look for in the data. |
| `lookupFieldText` | lookup-table field name |  |  | type === "MultiSelectLookup" or type === "SingleSelectLookup" | This is the value that will be displayed in the filter's input. It will not have an impact on the actual filtering, but could be used to make the filtering more user friendly. |
| `lookupFieldAdditional` | lookup-table field name |  |  | type === "MultiSelectLookup" or type === "SingleSelectLookup" | An additional field can be displayed for each list item, like a description or additional important information. |
| `lookupShowOnlyText` | boolean |  |  | type === "MultiSelectLookup" or type === "SingleSelectLookup" | If checked, the field selected as Key Field will not be visible in the list. It won't have any impact on the functionality, it is only a visual change. |

**Data Source**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `scriptSelect` | server script id |  |  | type === "MultiSelectScript" or type === "SingleSelectScript" | Sets a script to return data that will fill the filter dropdown with items. *In the Server Script, set result.data to an array of objects with both 'key' and 'text' keys. |

**Default Value**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `default` | text |  |  |  | Sets a default value by which to filter the data when the app is first opened. |
| `sysvarValue` | one of |  | `""`, `UserName` |  | Sets a default value based on a system variable, like the current user's username or the current data, by which to filter the data when the app is first opened. |
| `scriptValue` | server script id |  |  |  | Sets a script that returns a value to be added to the filter field as a default value on start. *The Server Script should set result.data to be a string.* |

**Properties**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `required` | boolean | `false` |  |  | If the filter is set to required, the app will not run unless there is text or a selection in the filter. |
| `visible` | boolean | `true` |  |  | Unchecking this setting will hide the filter input from the header. It will still be functional and apply any default filters on start, for instance. |

## `settings.fieldsRun[]` (one entry per field)

Every entry also has `name` (a field catalog name) and `fieldPos` (1, 2, 3 … display order).

**General**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `text` | text |  |  |  | Sets a label for the field, which will be displayed in the chart if Enable Title is checked |
| `type` | one of |  | `data`, `category`, `value` |  | Sets how the data should be presented - as a Row, Column, or Value. |

**Value**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `valueType` | one of |  | `""`, `Fixed`, `Lookup`, `Rule`, `Script` |  | Sets the value to be displayed for the field in the chart. Source Value will display the actual value from the data set, as it is. |
| `valueFixed` | text |  |  | valueType === "Fixed" | Sets a static value. |
| `valueLookup` | lookup object |  |  | valueType === "Lookup" | Select a reference table to get related data using the field's value. E.g., using a customer ID from the data set to fetch the corresponding customer name from the Customers table. |
| `valueRule` | rule id |  |  | valueType === "Rule" | Select a Rule Engine to return another value depending on the field's value. E.g., the Rule Engine can return 'Completed' if the field 'completed''s value is 'true', and 'Not Completed' if it is 'false'. |
| `formatter` | one of |  | `""`, `date00`, `date01`, `date02`, `date03`, `date04`, `sapdate01`, `sapdate02`, `zero`, `uppercase`, `lowercase` |  | Formats the value, e.g., setting a text to all uppercase or showing a date in relative terms. |

**Properties**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `visible` | boolean | `true` |  |  | Unchecking this setting will hide the field from the chart. |

