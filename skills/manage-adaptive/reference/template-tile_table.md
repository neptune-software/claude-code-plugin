# Template `neptunedxp_adaptive_tile_table`: Tile Table

Creates an adaptive application that can run directly within a tile in a launchpad. The resulting application displays real-time data in a list-like display, similar to adaptive applications created with the list template. However, you cannot further customize or edit the data set on the tile, except from sorting it.

In this template: `fieldsSel` = the **Filter** fields (catalog usage `INPUT`/`BOTH`); `fieldsRun` = the **Table** fields (catalog usage `OUTPUT`/`BOTH`).

Keys shown as `_name` hold an object (navigation or PDF, see `values.md`). The *Default* column is what the designer writes.
At run time this template fills a missing `properties` key with the default below.
**Field entries (`fieldsSel`, `fieldsRun`) never get defaults at run time**: send `visible: true` on every field (List and Tile Table
columns and Tile Chart fields without it are not used) and `editable: true` on form inputs. Never send a default marked *placeholder*.

## `settings.properties.report`

**General**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `title` | text |  |  |  | Sets a title for the application, shown in the filter section. This text will be translated if a translation is added. |

**Event**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `_navigationCreate` | navigation object |  |  | report.enableCreate | Sets up the event to run when the 'Create' button in the filter section is pressed. When pressed, the button can either run a Server Script or open an application or adaptive application. |
| `_navigationItemPress` | navigation object |  |  |  | Sets up the event to run when a row in the table is pressed. When pressed, the row can either run a Server Script or open an application or adaptive application. |

**Properties**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `paginationRows` | text | `10` |  |  | Sets the number of rows to be displayed on each page. The default is 10 rows. |
| `updateTime` | text | `0` |  |  | Sets the table to refresh automatically every X minutes. By default the table won't automatically refresh. |

**Button Create**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `iconButtonCreate` | icon (`sap-icon://…`) | `""` |  | report.enableCreate | Sets an icon for the 'Create' button in the filter section. |
| `textButtonCreate` | text | `"Create"` |  | report.enableCreate | Sets the text for the 'Create' button in the filter section. This text will be translated if a translation is added. |
| `typeButtonCreate` | one of | `"Emphasized"` | `Accept`, `Back`, `Default`, `Emphasized`, `Reject`, `Transparent`, `Unstyled`, `Up` | report.enableCreate | Sets the visual style of the 'Create' button in the filter section, but has no impact on the functionality of the button. The colors of the button styles will depend on the theme applied. |

**Button Run**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `iconButtonRun` | icon (`sap-icon://…`) | `""` |  | report.enableRun | Sets an icon for the 'Run'/'Update' button in the filter section. |
| `textButtonRun` | text | `"Update"` |  | report.enableRun | Sets the text for the 'Run'/'Update' button in the filter section. This text will be translated if a translation is added. |
| `typeButtonRun` | one of | `"Emphasized"` | `Accept`, `Back`, `Default`, `Emphasized`, `Reject`, `Transparent`, `Unstyled`, `Up` | report.enableRun | Sets the visual style of the 'Run'/'Update' button in the filter section, but has no impact on the functionality of the button. The colors of the button styles will depend on the theme applied. |
| `searchLabel` | text | `"Search"` |  | hidden in the designer | Search Label |
| `searchPlaceholder` | text | `""` |  | hidden in the designer | Search Placeholder |

**Properties**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `enableRun` | boolean | `false` |  |  | Checking this setting will show a 'Run'/'Update' button in the filter section. Pressing this button will run the app and refresh the data. |
| `enableCreate` | boolean | `false` |  |  | Checking this setting will show a 'Create' button in the filter section. The press event of this button can be customized by clicking the 'Create: Settings' button in the Event section. |
| `enableDelete` | boolean | `false` |  |  | Checking this setting will show a delete button on each of the list items, allowing the user to delete entries from the data set. |
| `textConfirmDelete` | text (not shown in the designer) | `"Do you want to delete this entry? "` |  | hidden in the designer |  |
| `titleConfirmDelete` | text (not shown in the designer) | `"Delete "` |  | hidden in the designer |  |

## `settings.properties.form`

**Properties**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `enableCompact` | boolean | `false` |  |  | When checked, Compact Mode will make the elements in the filter section appear smaller and closer together. This setting might be suitable for mouse-operated devices, like desktops. |
| `filterExpandable` | boolean | `true` |  |  | Determines whether the user can expand or collapse the filter section. |
| `headerExpanded` | boolean | `true` |  |  | The filter section can be shown or hidden by the user by clicking the arrow button on its bottom border. If 'Filter Expanded' is checked, the filter section will be displayed by default. |
| `showFilter` | boolean | `false` |  |  | If unchecked, the filter, including the title and the Create/Run buttons, will be hidden, and only the list itself will be visible. |
| `enableSearchWildcard` | boolean | `false` |  |  | When 'Enable '%' as Search Wildcard' is checked, '%' can be used as a wildcard in the search field to allow for a more custom search, e.g. in case of special characters in names or unknown spelling. E.g., searching 'r%sler' would return both 'rösler' and 'rosler'. |

## `settings.properties.table`

**General**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `headerText` | text |  |  |  | Sets a title for the list, displayed under the filter section. This text will be translated if a translation is added. |
| `footerText` | text |  |  |  | Sets a footer text, displayed at the end of the list. This text will be translated if a translation is added. |

**Initial Grouping**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `initialGroupField` | field name |  |  |  | Sets a field for the list to be grouped by initially. The field selected here has to be added to the table for the grouping to work. |
| `initialGroupOrder` | one of |  | `""`, `ASC`, `DESC` |  | If the list is grouped, this setting determines how the groups are ordered - ascending or descending. |

**Initial Sorting**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `initialSortField` | field name |  |  |  | Sets a field to sort the list by initially. The field selected here has to be added to the table for the sorting to work. |
| `initialSortOrder` | one of |  | `""`, `ASC`, `DESC` |  | If a field is selected for Initial Sorting, this setting determines the order of the sorting - ascending or descending. |

**Post-processing**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `postProcessingScript` | server script id |  |  |  | Sets a script to be run every time the list is updated, after the data has been fetched. *The table data is set to req.body and passed to the script with the rest of the request object.* |

**Properties**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `showSeparators` | one of | `"All"` | `""`, `All`, `Inner`, `None` |  | Sets which separating lines will be displayed: All - separators between the items, including the first and last items; Inner - only between the items; None - no separators. |
| `alternateRowColors` | boolean | `false` |  |  | Enables alternating list row colors. How it is applied depends on the theme. |
| `enableCompact` | boolean | `false` |  |  | When checked, Compact Mode will make the elements in the list appear smaller closer together. This setting might be suitable for mouse-operated devices, like desktops. |
| `fixedLayout` | boolean | `true` |  |  | When checked, the list's layout will depend on the columns' set width, regardless of the cells' content. By default, this setting is unchecked, and the list will have an auto-layout where the column width depends on the widest unbreakable content inside its cells. |
| `inset` | boolean | `false` |  |  | Adds space around the list. |
| `enableAutoPopin` | boolean | `false` |  |  | When Autopopin is enabled, the list columns will 'pop in' under each other when the window gets too narrow to properly show all the list content. When this setting is enabled, it will remove the option to 'demand popin' on the columns themselves. |

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
| `lookupFieldKey` | lookup-table field name |  |  | type === "MultiSelectLookup" or type === "SingleSelectLookup" | Sets the field to be used as the key for the filter. It is the value of this field that the filter will look for in the list data. |
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
| `default` | text |  |  |  | Sets a default value by which to filter the list when it initially loads. |
| `sysvarValue` | one of |  | `""`, `UserName` |  | Sets a default value based on a system variable, like the current user's username or the current data, by which to filter the list when it first loads. |
| `scriptValue` | server script id |  |  |  | Sets a script that returns a value to be added to the filter field as a default value on start. *The Server Script should set result.data to be a string.* |

**Properties**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `required` | boolean | `false` |  |  | If the filter is set to required, the list will show 'No data' if there is no text or selection in the filter. |
| `visible` | boolean | `true` |  |  | Unchecking this setting will hide the filter input from the header. It will still be functional and apply any default filters on start, for instance. |

## `settings.fieldsRun[]` (one entry per field)

Every entry also has `name` (a field catalog name) and `fieldPos` (1, 2, 3 … display order).

**General**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `text` | text |  |  |  | Sets the title of the field column. |
| `type` | one of |  | `""`, `Link`, `CheckBox`, `Icon`, `Image`, `ObjectNumber`, `ObjectStatus`, `Switch` |  | Sets the type of field to display the data in the column. |

**Event**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `_navigation` | navigation object |  |  | type === "Link" | Sets up the event to run when the button is pressed. When pressed, the button can either run a Server Script or open an application or adaptive application. |

**Value**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `valueType` | one of |  | `""`, `Fixed`, `Lookup`, `Rule`, `Script` |  | Sets the value to be displayed in the column. Source Value will display the actual value from the data set, as it is. |
| `valueFixed` | text |  |  | valueType === "Fixed" | Sets a static value which will be the same for all the rows in the column. |
| `valueLookup` | lookup object |  |  | valueType === "Lookup" | Select a reference table to get related data using the field's value. E.g., using a customer ID from the list item to fetch the corresponding customer name from the Customers table. |
| `valueRule` | rule id |  |  | valueType === "Rule" | Select a Rule Engine to return another value depending on the field's value. E.g., the Rule Engine can return 'Completed' if the field 'completed''s value is 'true', and 'Not Completed' if it is 'false'. |
| `formatter` | one of |  | `""`, `date00`, `date01`, `date02`, `date03`, `date04`, `date05`, `sapdate01`, `sapdate02`, `zero`, `uppercase`, `lowercase`, `number00`, `number01`, `number02`, `number03`, `number04`, `number05`, `number06`, `number07` |  | Formats the value, e.g., setting a text to all uppercase or showing a date in relative terms. |

**Value: Icon**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `statusIconType` | one of |  | `""`, `Binding`, `Fixed`, `Lookup`, `Rule`, `Script` | type === "ObjectStatus" | Determines how to get the icon for the object status. Binding will use another selected field's value as the icon source. |
| `statusIconFixed` | icon (`sap-icon://…`) |  |  | type === "ObjectStatus" and statusIconType === "Fixed" | Sets a static icon from the Icon Explorer. |
| `statusIconRule` | rule id |  |  | type === "ObjectStatus" and statusIconType === "Rule" | Select a Rule Engine to return an icon source depending on the field's value. |
| `statusIconBinding` | field name |  |  | type === "ObjectStatus" and statusIconType === "Binding" | Binds the icon source to another field's value |
| `statusIconLookup` | lookup object |  |  | type === "ObjectStatus" and statusIconType === "Lookup" | Select a reference table to get related data using the field's value. E.g., using a customer ID from the list item to fetch a corresponding icon source from the Customers table. |

**Value: Title**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `statusTitleType` | one of |  | `""`, `Binding`, `Fixed`, `Lookup`, `Rule`, `Script` | type === "ObjectStatus" | Determines how to get the value for the object status' title, which will show in front of the field value, like 'Title: value'. Binding will use another selected field's value as the title. |
| `statusTitleFixed` | text |  |  | type === "ObjectStatus" and statusTitleType === "Fixed" | Sets a static value to be the title. |
| `statusTitleRule` | rule id |  |  | type === "ObjectStatus" and statusTitleType === "Rule" | Select a Rule Engine to return a title depending on the field's value. |
| `statusTitleBinding` | field name |  |  | type === "ObjectStatus" and statusTitleType === "Binding" | Binds the title to this field's value |
| `statusTitleLookup` | lookup object |  |  | type === "ObjectStatus" and statusTitleType === "Lookup" | Select a reference table to get related data using the field's value. E.g., using a customer ID from the list item to fetch a corresponding icon source from the Customers table. |

**Value: State**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `statusStateType` | one of |  | `""`, `Binding`, `Fixed`, `Lookup`, `Rule`, `Script` | type === "ObjectStatus" | Determines how to get the value for the object status' state, which will determine the color of the field text or background. Binding will use another selected field's value as the state. |
| `statusStateFixed` | text |  |  | type === "ObjectStatus" and statusStateType === "Fixed" | Sets a static value to be the state, selected from a dropdown list. The actual colors of the states might depend on the theme. |
| `statusStateRule` | rule id |  |  | type === "ObjectStatus" and statusStateType === "Rule" | Select a Rule Engine to return a state depending on the field's value. E.g., if the value is 'Completed', the state 'Success' might be returned, turning the object status text green. |
| `statusStateBinding` | field name |  |  | type === "ObjectStatus" and statusStateType === "Binding" | Binds the state to this field's value. |
| `statusStateLookup` | lookup object |  |  | type === "ObjectStatus" and statusStateType === "Lookup" | Select a reference table to get related data using the field's value. E.g., using a customer ID from the list item to fetch a corresponding state value from the Customers table. |

**Value: Unit**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `numberUnitType` | one of |  | `""`, `Binding`, `Fixed`, `Lookup`, `Rule`, `Script` | type === "ObjectNumber" | Determines how to get the value for the object number's unit, which will be appended to the field's value, like 'value UNIT'. Binding will use another selected field's value as the unit. |
| `numberUnitFixed` | text |  |  | type === "ObjectNumber" and numberUnitType === "Fixed" | Sets a static value as the unit, e.g. 'USD'. |
| `numberUnitRule` | rule id |  |  | type === "ObjectNumber" and numberUnitType === "Rule" | Select a Rule Engine to return a unit value depending on the field's value. |
| `numberUnitBinding` | field name |  |  | type === "ObjectNumber" and numberUnitType === "Binding" | Binds the unit value to this field's value. |
| `numberUnitLookup` | lookup object |  |  | type === "ObjectNumber" and numberUnitType === "Lookup" | Select a reference table to get related data using the field's value. E.g., using a customer ID from the list item to fetch a corresponding unit value from the Customers table. |
| `numberUnitFormatter` | one of |  | `""`, `date00`, `date01`, `date02`, `date03`, `date04`, `sapdate01`, `sapdate02`, `zero`, `uppercase`, `lowercase`, `number00`, `number01`, `number02`, `number03`, `number04`, `number05`, `number06`, `number07`, `file` | type === "ObjectNumber" | Formats the unit value, e.g. setting text to all uppercase or showing a date in relative terms. |

**Value: State**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `numberStateType` | one of |  | `""`, `Binding`, `Fixed`, `Lookup`, `Rule`, `Script` | type === "ObjectNumber" | Determines how to get the value for the object number's state, which will determine the color of the field text or background. Binding will use another selected field's value as the state. |
| `numberStateFixed` | text |  |  | type === "ObjectNumber" and numberStateType === "Fixed" | Sets a static value as the state, e.g., 'Success' or 'Error'. |
| `numberStateRule` | rule id |  |  | type === "ObjectNumber" and numberStateType === "Rule" | Select a Rule Engine to return a state depending on the field's value. E.g., if the value is 'Completed', the state 'Success' might be returned, turning the object number text green. |
| `numberStateBinding` | field name |  |  | type === "ObjectNumber" and numberStateType === "Binding" | Binds the state to this field's value. |
| `numberStateLookup` | lookup object |  |  | type === "ObjectNumber" and numberStateType === "Lookup" | Select a reference table to get related data using the field's value. E.g., using a customer ID from the list item to fetch a corresponding state value from the Customers table. |

**Layout**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `hAlign` | one of |  | `""`, `Begin`, `Center`, `End`, `Initial`, `Left`, `Right` |  | Aligns the column title and field value horizontally in the column, e.g., left, center, or right. |
| `vAlign` | one of |  | `""`, `Bottom`, `Inherit`, `Middle`, `Top` |  | Aligns the column title and field values vertically in the column, e.g., bottom, center, or top. |
| `minScreenWidth` | one of |  | `""`, `2560px`, `2240px`, `1920px`, `1680px`, `1536px`, `1440px`, `1280px`, `XXLarge`, `Desktop`, `XLarge`, `Tablet`, `Medium`, `Small`, `XSmall`, `Phone`, `XXSmall` |  | Sets the minimum screen width to show this column. E.g. |
| `demandPopin` | boolean |  |  | not (table.enableAutoPopin) | Depending to the MinScreenWidth settings, the column can be hidden on different screen sizes. Setting this property to true, shows this column as pop-in instead of hiding it. |
| `popinDisplay` | one of | `"Inline"` | `Block`, `Inline`, `WithoutHeader` |  | Determines how the column will pop-in on smaller screens. Selecting 'Block' will show the column header on the first line and the cell content on the next line. |
| `width` | text |  |  |  | Sets the width of the column, either in pixels, like 100px, or in percentages, like 25%. |
| `wrapping` | boolean | `false` |  |  | If this setting is checked, long text will wrap to the next line instead of making the column wider. |

**Properties**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `enableGroup` | boolean | `false` |  |  | If 'Grouping' is enabled, the list can be grouped based on that column value by clicking the column header and selecting 'Group Ascending' or 'Group Descending'. This can be reversed by clicking the column header again and selecting 'Ungroup'. |
| `enableFilter` | boolean | `false` |  |  | If 'Search' is checked, the values in this column will be included in the live search. If unchecked, this column will be excluded from the search. |
| `enableSort` | boolean | `false` |  |  | If 'Sort' is enabled, the list can be sorted based on that column value by clicking the column header and selecting 'Sort Ascending' or 'Sort Descending'. |
| `visible` | boolean | `true` |  |  | If 'Visible' is unchecked, this column will be hidden from view. It will still be included in any searching or filtering. |

