# Template `neptunedxp_adaptive_bi`: Pivot Table / Graphical Visualization

This template is useful for summarizing, analyzing, and exploring large data sets as it allows you to create a table or chart where the data can be organized and rearranged in various ways to see different perspectives. This template allows you to categorize and aggregate data, typically by sorting and calculating totals or averages for specific data segments.

In this template: `fieldsSel` = the **Filter** fields; `fieldsRun` = the **Dimensions** fields.

Keys shown as `_name` hold an object (navigation or PDF, see `values.md`). The *Default* column is what the designer writes.
This template does **not** fill in missing property keys at run time, so send the defaults below for every key.
**Field entries (`fieldsSel`, `fieldsRun`) never get defaults at run time**: send `visible: true` on every field (List and Tile Table
columns and Tile Chart fields without it are not used) and `editable: true` on form inputs. Never send a default marked *placeholder*.

## `settings.properties.report`

**General**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `title` | text |  |  |  | Sets a title for the application, shown in the header. This text will be translated if a translation is added. |

**Events**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `_pdfPrint` | PDF object |  |  | report.enablePDF | Sets up the PDF Template to generate with the application data when the Print button is pressed. The settings also offer the option of automatically saving the generated PDF to the PDF Archive. |

**Print Button**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `iconButtonPrint` | icon (`sap-icon://…`) | `"sap-icon://print"` |  | report.enablePDF | Sets an icon for the 'Print' button in the header. |
| `textButtonPrint` | text | `""` |  | report.enablePDF | Sets the text for the 'Print' button in the header. This text will be translated if a translation is added. |
| `typeButtonPrint` | one of | `"Transparent"` | `Accept`, `Attention`, `Critical`, `Back`, `Default`, `Emphasized`, `Ghost`, `Neutral`, `Reject`, `Transparent`, `Unstyled`, `Up` | report.enablePDF | Sets the visual style of the 'Print' button in the header, but has no impact on the functionality of the button. The colors of the button styles will depend on the theme applied. |

**Button Close**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `iconButtonClose` | icon (`sap-icon://…`) | `""` |  | report.enableClose | Sets an icon for the 'Close' button in the header. |
| `textButtonClose` | text | `"Close"` |  | report.enableClose | Sets the text for the 'Close' button in the header. This text will be translated if a translation is added. |
| `typeButtonClose` | one of | `"Transparent"` | `Accept`, `Attention`, `Critical`, `Back`, `Default`, `Emphasized`, `Ghost`, `Neutral`, `Reject`, `Transparent`, `Unstyled`, `Up` | report.enableClose | Sets the visual style of the 'Close' button in the header, but has no impact on the functionality of the button. The colors of the button styles will depend on the theme applied. |

**Properties**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `enableValues` | boolean | `true` |  |  | Determines whether to show the Value section in the layout panel and an option for customising the Value Calculation in the Selection panel. The settings will only be hidden from the app, so any settings or values added before unchecking this option will still apply to the dataset. |
| `enableLeftPanel` | boolean | `true` |  |  | Determines whether the user can toggle the visibility of the Selection panel. If this button is checked, there will be a menu icon in the top left of the header, allowing the user to show/hide the Selection panel. |
| `enableRightPanel` | boolean | `true` |  |  | Determines whether the user can toggle the visibility of the Layout panel. If this button is checked, there will be a menu icon in the top right of the header, allowing the user to show/hide the Layout panel. |
| `enableVariant` | boolean | `false` |  |  | Checking this setting will show a 'Variant' button in the app's header and let the user create, enable, edit, and delete filter variants for the app. |
| `showLeftPanel` | boolean | `true` |  |  | If checked, the Selection panel will be visible by default. |
| `showRightPanel` | boolean | `false` |  |  | If checked, the Layout panel will be visible by default. |
| `enableClose` | boolean | `false` |  |  | Checking this setting will show a 'Close' button in the app's header. If this app is opened from another adaptive app, pressing this button will close the app. |
| `enablePDF` | boolean | `false` |  |  | If selected, a Print button displays in the application's header. Selecting this button lets the user generate a selected PDF Template using the app data. |
| `autoRun` | boolean | `false` |  |  | When 'Run At Start' is checked, the application will be run automatically when the app is first opened, without having to press the 'Run'/'Update' button. *The app will run as part of the attachInit event* |

## `settings.properties.table`

**Post-processing**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `postProcessingScript` | server script id |  |  |  | Sets a script to be run every time the app is run/updated, after the data has been fetched. *The data is set to req.body and passed to the script with the rest of the request object.* |

**Totals**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `showRowTotal` | boolean | `true` |  |  | Determines whether or not to show a new column summing up the values in each row. |
| `showColTotal` | boolean | `true` |  |  | Determines whether or not to show a new row summing up all the values in each column. |

## `settings.fieldsSel[]` (one entry per field)

Every entry also has `name` (a field catalog name) and `fieldPos` (1, 2, 3 … display order).

**General**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `text` | text |  |  |  | Sets the name displayed above the filter input. |
| `type` | one of |  | `""`, `DateRange`, `DatePicker`, `CheckBox`, `MultiSelect`, `MultiSelectLookup`, `MultiSelectScript`, `SingleSelect`, `SingleSelectLookup`, `SingleSelectScript`, `Switch` |  | Sets the type of filter input. |

**Data Source**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `scriptSelect` | server script id |  |  | type === "MultiSelectScript" or type === "SingleSelectScript" | Sets a script to return data that will fill the filter dropdown with items. *In the Server Script, set result.data to an array of objects with both 'key' and 'text' keys. |

**Default Value**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `default` | text |  |  |  | Sets a default value by which to filter the data when the app is first opened. |
| `sysvarValue` | one of |  | `""`, `UserName`, `TOMORROW`, `TODAY`, `YESTERDAY`, `LAST_7`, `LAST_30`, `LAST_60`, `LAST_90`, `LAST_180`, `NEXT_30`, `NEXT_60`, `NEXT_7`, `NEXT_90`, `NEXT_180` |  | Sets a default value based on a system variable, like the current user's username or the current data, by which to filter the data when the app is first opened. |
| `scriptValue` | server script id |  |  |  | Sets a script that returns a value to be added to the filter field as a default value on start. *The Server Script should set result.data to be a string.* |

**Data Source**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `lookupTable` | table name |  |  | type === "MultiSelectLookup" or type === "SingleSelectLookup" | Sets the table to be used as the data source for the filter field. |
| `lookupFieldKey` | lookup-table field name |  |  | type === "MultiSelectLookup" or type === "SingleSelectLookup" | Sets the field to be used as the key for the filter. It is the value of this field that the filter will look for in the data. |
| `lookupFieldText` | lookup-table field name |  |  | type === "MultiSelectLookup" or type === "SingleSelectLookup" | This is the value that will be displayed in the filter's input. It will not have an impact on the actual filtering, but could be used to make the filtering more user friendly. |
| `lookupFieldAdditional` | lookup-table field name |  |  | type === "MultiSelectLookup" or type === "SingleSelectLookup" | An additional field can be displayed for each list item, like a description or additional important information. |
| `lookupShowOnlyText` | boolean |  |  | type === "MultiSelectLookup" or type === "SingleSelectLookup" | If checked, the field selected as Key Field will not be visible in the list. It won't have any impact on the functionality, it is only a visual change. |

**Layout**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `columnLabel` | text |  |  |  | Separate the filters into sections by displaying a title above the selected filter field. |

**Properties**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `selEqual` | boolean |  |  | not (type) | If 'Strict Search' is enabled, the filter will only show exact matches, not partial matches. If the filter key is a UUID, this setting should be checked to get the correct match. |
| `required` | boolean | `false` |  |  | If the filter is set to required, the app will not run unless there is text or a selection in the filter. |
| `visible` | boolean | `true` |  |  | Unchecking this setting will hide the filter input from the header. It will still be functional and apply any default filters on start, for instance. |

## `settings.fieldsRun[]` (one entry per field)

Every entry also has `name` (a field catalog name) and `fieldPos` (1, 2, 3 … display order).

**General**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `text` | text |  |  |  | Sets a label for the field, which will be displayed in the chart and in the Layout panel. |

**Value**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `valueType` | one of |  | `""`, `Fixed`, `Lookup`, `Rule`, `Script` |  | Sets the value to be displayed for the field in the chart. Source Value will display the actual value from the data set, as it is. |
| `valueFixed` | text |  |  | valueType === "Fixed" | Sets a static value. |
| `valueLookup` | lookup object |  |  | valueType === "Lookup" | Select a reference table to get related data using the field's value. E.g., using a customer ID from the data set to fetch the corresponding customer name from the Customers table. |
| `valueRule` | rule id |  |  | valueType === "Rule" | Select a Rule Engine to return another value depending on the field's value. E.g., the Rule Engine can return 'Completed' if the field 'completed''s value is 'true', and 'Not Completed' if it is 'false'. |
| `formatter` | one of |  | `""`, `date00`, `date01`, `date02`, `date06`, `date07`, `date03`, `date04`, `date05`, `sapdate01`, `sapdate02`, `sapdate03`, `zero`, `uppercase`, `lowercase` |  | Formats the value, e.g., setting a text to all uppercase or showing a date in relative terms. |

**Properties**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `hidden` | boolean | `false` |  |  | If checked, this field will be hidden from view in the chart and in the Layout panel. |
| `filter` | boolean | `true` |  |  | When checked, the field in the Layout panel will show a filter icon that lets you filter that field directly. |

