# Template `neptunedxp_adaptive_calendar`: Calendar

Lets you manage your data in a calendar display with functionality to view a schedule by day, week, or month, and add, filter, and remove calendar entries.

In this template: `fieldsSel` = the **Filter** fields; `fieldsRun` = the **Appointments** fields.

Keys shown as `_name` hold an object (navigation or PDF, see `values.md`). The *Default* column is what the designer writes.
At run time this template fills a missing `properties` key with the default below.
**Field entries (`fieldsSel`, `fieldsRun`) never get defaults at run time**: send `visible: true` on every field (List and Tile Table
columns and Tile Chart fields without it are not used) and `editable: true` on form inputs. Never send a default marked *placeholder*.

## `settings.properties.report`

**General**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `title` | text |  |  |  | Sets a title for the application, shown in the header. |
| `subTitle` | text |  |  |  | Sets a subtitle for the application, shown under the title in the header. |
| `avatarIcon` | icon (`sap-icon://…`) |  |  |  | Sets which icon to be shown in the header. |
| `avatarBackgroundColor` | one of |  | `""`, `Accent1`, `Accent2`, `Accent3`, `Accent4`, `Accent5`, `Accent6`, `Accent7`, `Accent8`, `Accent9`, `Accent10`, `Random` |  | Sets the background color for the header icon. The specific colors depend on the theme applied. |
| `showIcon` | boolean | `true` |  |  | Shows/hides the icon in the header. |

**Event**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `_navigationCreate` | navigation object |  |  | report.enableCreate | Sets up the event to run when the 'Create' button in the header is pressed. When pressed, the button can either run a Server Script or open an application or adaptive application. |
| `_navigationItemPress` | navigation object |  |  |  | Sets up the event to run when a an event in the calendar is pressed. When pressed, the event can either run a Server Script or open an application or adaptive application. |

**Button Close**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `iconButtonClose` | icon (`sap-icon://…`) | `""` |  | report.enableClose | Sets an icon for the 'Close' button in the header. |
| `textButtonClose` | text | `"Close"` |  | report.enableClose | Sets the text for the 'Close' button in the header. This text will be translated if a translation is added. |
| `typeButtonClose` | one of | `"Transparent"` | `Accept`, `Attention`, `Critical`, `Back`, `Default`, `Emphasized`, `Ghost`, `Neutral`, `Reject`, `Transparent`, `Unstyled`, `Up` | report.enableClose | Sets the visual style of the 'Close' button in the header, but has no impact on the functionality of the button. The colors of the button styles will depend on the theme applied. |

**Button Create**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `iconButtonCreate` | icon (`sap-icon://…`) | `""` |  | report.enableCreate | Sets an icon for the 'Create' button in the header. |
| `textButtonCreate` | text | `"Create"` |  | report.enableCreate | Sets the text for the 'Create' button in the header. This text will be translated if a translation is added. |
| `typeButtonCreate` | one of | `"Emphasized"` | `Accept`, `Attention`, `Critical`, `Back`, `Default`, `Emphasized`, `Ghost`, `Neutral`, `Reject`, `Transparent`, `Unstyled`, `Up` | report.enableCreate | Sets the visual style of the 'Create' button in the header, but has no impact on the functionality of the button. The colors of the button styles will depend on the theme applied. |

**Button Run**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `iconButtonRun` | icon (`sap-icon://…`) | `""` |  | report.enableRun | Sets an icon for the 'Run'/'Update' button in the header. |
| `textButtonRun` | text | `"Update"` |  | report.enableRun | Sets the text for the 'Run'/'Update' button in the header. This text will be translated if a translation is added. |
| `typeButtonRun` | one of | `"Emphasized"` | `Accept`, `Attention`, `Critical`, `Back`, `Default`, `Emphasized`, `Ghost`, `Neutral`, `Reject`, `Transparent`, `Unstyled`, `Up` | report.enableRun | Sets the visual style of the 'Edit' button in the header, but has no impact on the functionality of the button. The colors of the button styles will depend on the theme applied. |

**Properties**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `enableRun` | boolean | `true` |  |  | Checking this setting will show a 'Run'/'Update' button in the app's header. Pressing this button will run the app and refresh the data. |
| `enableCreate` | boolean | `false` |  |  | Checking this setting will show a 'Create' button in the app's header. The press event of this button can be customized by clicking the 'Create: Settings' button in the Event section. |
| `enableClose` | boolean | `false` |  |  | Checking this setting will show a 'Close' button in the app's header. If this app is opened from another adaptive app, pressing this button will close the app. |
| `hideHeader` | boolean | `false` |  |  | Shows/hides the header. |
| `autoRun` | boolean | `false` |  |  | When 'Run At Start' is checked, the application will be run automatically when the app is first opened, without having to press the 'Run'/'Update' button. *The app will run as part of the attachInit event* |
| `autoRunFocus` | boolean | `false` |  |  | When 'Run At Focus' is checked, the application will be run automatically every time the user navigates back to the app, without having to press the 'Run'/'Update' button. *The app will run as part of the beforeDisplay event* |

## `settings.properties.form`

**Properties**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `enableCompact` | boolean | `false` |  |  | When checked, Compact Mode will make the elements in the filter section appear smaller and closer together. This setting might be suitable for mouse-operated devices, like desktops. |
| `enableExpandHeader` | boolean | `true` |  |  | Toggle whether the filter section can be shown or hidden by the user. If Enable Filter Expand/Collapse is selected, the filter section can be expanded and collapsed. |
| `headerExpanded` | boolean | `true` |  |  | The filter section can be shown or hidden by the user by clicking the arrow button on its bottom border. If 'Filter Expanded' is checked, the filter section will be displayed when opening the app, and if not it will be hidden. |

## `settings.properties.table`

**General**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `headerText` | text |  |  |  | Sets a title for the calendar, displayed under the app's header. This text will be translated if a translation is added. |
| `startHour` | text |  |  |  | In 'Day' and 'Week' views, all 24 hours in the day will be displayed by default. Customize this by setting a Start Hour, e.g. 7 to start the view at 07:00. |
| `endHour` | text |  |  |  | In 'Day' and 'Week' views, all 24 hours in the day will be displayed by default. Customize this by setting an End Hour, e.g. 18 to end the view at 18:00. |
| `startBegData` | boolean | `false` |  |  | The start date of the calendar is the current date by default. Enable this setting to use the first appointment in the calendar as the start date. |

**Views**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `enableDayView` | boolean | `true` |  |  | Check this setting to let the user see a day view of the calendar. |
| `enableWeekView` | boolean | `true` |  |  | Check this setting to let the user see a week view of the calendar. |
| `enableMonthView` | boolean | `true` |  |  | Check this setting to let the user see a month view of the calendar. |
| `startView` | one of |  | `""`, `day`, `week`, `month` |  | Determine which view will be shown by default. If nothing is selected, Day view will be the default. |

**Properties**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `enableDnD` | boolean | `false` |  |  | Determines whether the appointments in the calendar are draggable. When checked, appointments can rescheduled by dragging them to a new location. |
| `enableResize` | boolean | `false` |  |  | Determines whether the appointments are resizeable. When checked, the duration of an appointment can be adjusted by resizing the item in Day or Week view. |

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
| `default` | text |  |  |  | Sets a default value by which to filter the list when it is first opened. |
| `scriptValue` | server script id |  |  |  | Sets a script that returns a value to be added to the filter field as a default value on start. *The Server Script should set result.data to be a string.* |

**Properties**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `required` | boolean | `false` |  |  | If the filter is set to required, the field will get an asterisk marking the filter as required. |
| `visible` | boolean | `true` |  |  | Unchecking this setting will hide the filter input from the header. It will still be functional and apply any default filters on start, for instance. |

## `settings.fieldsRun[]` (one entry per field)

Every entry also has `name` (a field catalog name) and `fieldPos` (1, 2, 3 … display order).

**General**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `text` | text |  |  |  | Sets the label for the appointment field. |
| `type` | one of |  | `""`, `endDate`, `startDate`, `icon`, `color`, `tentative`, `text`, `description`, `title`, `type` |  | Sets how to display/use the property to display the appointment in the calendar. |

**Value**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `valueType` | one of |  | `""`, `Fixed`, `Lookup`, `Rule` |  | Sets the value to be displayed on the appointment. Source Value will display the actual value from the data set, as it is. |
| `valueFixed` | text |  |  | valueType === "Fixed" | Sets a static value which will be the same for all the appointments in the calendar. |
| `valueLookup` | lookup object |  |  | valueType === "Lookup" | Select a reference table to get related data using the field's value. E.g., using a customer ID from the list item to fetch the corresponding customer name from the Customers table. |
| `valueRule` | rule id |  |  | valueType === "Rule" | Select a Rule Engine to return another value depending on the field's value. E.g., the Rule Engine can return 'Completed' if the field 'completed''s value is 'true', and 'Not Completed' if it is 'false'. |
| `formatter` | one of |  | `""`, `date00`, `date01`, `date02`, `date03`, `date04`, `date05`, `sapdate01`, `sapdate02`, `zero`, `uppercase`, `lowercase`, `number00`, `number01`, `number02`, `number03`, `number04`, `number05`, `number06`, `number07`, `file` | not (type === "DatePicker" or type === "DateTimePicker" or type === "Input") | Formats the value, e.g., setting a text to all uppercase or showing a date in relative terms. |

