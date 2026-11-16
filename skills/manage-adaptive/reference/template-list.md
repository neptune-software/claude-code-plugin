# Template `neptunedxp_adaptive_list`: List / Table

Lets you manage data sets in a list-like display. E.g., display your data set, sort and filter for specific criteria, or run a full text search. Optionally, you can link adaptive applications created with this template to adaptive applications created with the Form template.

In this template: `fieldsSel` = the **Filter** fields (catalog usage `INPUT`/`BOTH`); `fieldsRun` = the **Table** fields (catalog usage `OUTPUT`/`BOTH`).

Keys shown as `_name` hold an object (navigation or PDF, see `values.md`). The *Default* column is what the designer writes.
At run time this template fills a missing `properties` key with the default below.
**Field entries (`fieldsSel`, `fieldsRun`) never get defaults at run time**: send `visible: true` on every field (List and Tile Table
columns and Tile Chart fields without it are not used) and `editable: true` on form inputs. Never send a default marked *placeholder*.

## `settings.properties.report`

**General**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `title` | text |  |  |  | Sets a title for the application that is displayed in the header. The title text is translated if a translation is added. |
| `subTitle` | text |  |  |  | Sets a subtitle for the application that is displayed under the title in the header. The subtitle text is translated if a translation is added. |
| `avatarIcon` | icon (`sap-icon://…`) |  |  |  | Sets which icon to be displayed in the header. |
| `avatarBackgroundColor` | one of |  | `""`, `Accent1`, `Accent2`, `Accent3`, `Accent4`, `Accent5`, `Accent6`, `Accent7`, `Accent8`, `Accent9`, `Accent10`, `Random` |  | Sets the background color for the header icon. The specific colors depend on the theme applied. |
| `showIcon` | boolean | `true` |  |  | Shows/hides the icon in the header. |
| `actionButtonLeft` | boolean | `false` |  |  | Moves the action buttons, like Create, Update, Close, to the left in the header, under the title. |
| `hideHeader` | boolean | `false` |  |  | Shows/hides the header. |

**Events**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `_navigationCreate` | navigation object |  |  | report.enableCreate | Sets up the event to run when the Create button in the header is selected. If selected, the button can either run a server script or open an application or adaptive application. |
| `_navigationItemPress` | navigation object |  |  |  | Sets up the event to run when a row in the table is selected. If selected, the row can either run a server script or open an application or adaptive application. |
| `_navigationMultiSelect` | navigation object |  |  | report.enableMultiSelect | Sets up the event to run when multiple rows in the table are selected and the MultiSelect button in the header is selected. When selected, the button can either run a server script or open an application or adaptive application. |
| `_pdfPrint` | PDF object |  |  | report.enablePDF | Sets up the PDF Template to generate with the application data when the Print button is pressed. The settings also offer the option of automatically saving the generated PDF to the PDF Archive. |

**Close Button**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `iconButtonClose` | icon (`sap-icon://…`) | `""` |  | report.enableClose | Sets an icon for the Close button in the header. |
| `textButtonClose` | text | `"Close"` |  | report.enableClose | Sets the text for the Close button in the header. This text is translated if a translation is added. |
| `typeButtonClose` | one of | `"Transparent"` | `Accept`, `Attention`, `Critical`, `Back`, `Default`, `Emphasized`, `Ghost`, `Neutral`, `Reject`, `Transparent`, `Unstyled`, `Up` | report.enableClose | Sets the visual style of the Close button in the header, but has no impact on the functionality of the button. The colors of the button styles depend on the theme applied. |

**Create Button**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `iconButtonCreate` | icon (`sap-icon://…`) | `""` |  | report.enableCreate | Sets an icon for the Create button in the header. |
| `textButtonCreate` | text | `"Create"` |  | report.enableCreate | Sets the text for the Create button in the header. This text is translated if a translation is added. |
| `typeButtonCreate` | one of | `"Emphasized"` | `Accept`, `Attention`, `Critical`, `Back`, `Default`, `Emphasized`, `Ghost`, `Neutral`, `Reject`, `Transparent`, `Unstyled`, `Up` | report.enableCreate | Sets the visual style of the Create button in the header, but has no impact on the functionality of the button. The colors of the button styles depend on the theme applied. |

**Export Button**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `iconButtonExport` | icon (`sap-icon://…`) | `"sap-icon://excel-attachment"` |  | report.enableExport | Sets an icon for the Export button in the header. |
| `textButtonExport` | text | `""` |  | report.enableExport | Sets the text for the Export button in the header. This text is translated if a translation is added. |
| `typeButtonExport` | one of | `"Transparent"` | `Accept`, `Attention`, `Critical`, `Back`, `Default`, `Emphasized`, `Ghost`, `Neutral`, `Reject`, `Transparent`, `Unstyled`, `Up` | report.enableExport | Sets the visual style of the Export button in the header, but has no impact on the functionality of the button. The colors of the button styles depend on the theme applied. |

**Import Button**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `iconButtonImport` | icon (`sap-icon://…`) | `"sap-icon://fa-solid/file-import"` |  | report.enableImport | Sets an icon for the Import button in the header. |
| `textButtonImport` | text | `""` |  | report.enableImport | Sets the text for the Import button in the header. This text is translated if a translation is added. |
| `typeButtonImport` | one of | `"Transparent"` | `Accept`, `Attention`, `Critical`, `Back`, `Default`, `Emphasized`, `Ghost`, `Neutral`, `Reject`, `Transparent`, `Unstyled`, `Up` | report.enableImport | Sets the visual style of the Import button in the header, but has no impact on the functionality of the button. The colors of the button styles depend on the theme applied. |

**Print Button**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `iconButtonPrint` | icon (`sap-icon://…`) | `"sap-icon://print"` |  | report.enablePDF | Sets an icon for the Print button in the header. |
| `textButtonPrint` | text | `""` |  | report.enablePDF | Sets the text for the Print button in the header. This text is translated if a translation is added. |
| `typeButtonPrint` | one of | `"Transparent"` | `Accept`, `Attention`, `Critical`, `Back`, `Default`, `Emphasized`, `Ghost`, `Neutral`, `Reject`, `Transparent`, `Unstyled`, `Up` | report.enablePDF | Sets the visual style of the Print button in the header, but has no impact on the functionality of the button. The colors of the button styles depend on the theme applied. |

**Multiple Selection Button**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `iconButtonMultiSelect` | icon (`sap-icon://…`) | `""` |  | report.enableMultiSelect | Sets an icon for the MultiSelect button in the header. |
| `textButtonMultiSelect` | text | `"MultiSelect"` |  | report.enableMultiSelect | Sets the text for the MultiSelect button in the header. This text is translated if a translation is added. |
| `typeButtonMultiSelect` | one of | `"Emphasized"` | `Accept`, `Attention`, `Critical`, `Back`, `Default`, `Emphasized`, `Ghost`, `Neutral`, `Reject`, `Transparent`, `Unstyled`, `Up` | report.enableMultiSelect | Sets the visual style of the MultiSelect button in the header, but has no impact on the functionality of the button. The colors of the button styles depend on the theme applied. |

**Multiple Delete Button**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `iconButtonMultiDelete` | icon (`sap-icon://…`) | `""` |  | report.enableMultiSelect and report.enableDelete | Sets an icon for the Delete button in the header. |
| `textButtonMultiDelete` | text | `"Delete"` |  | report.enableMultiSelect and report.enableDelete | Sets the text for the Delete button in the header. This text is translated if a translation is added. |
| `typeButtonMultiDelete` | one of | `"Ghost"` | `Accept`, `Attention`, `Critical`, `Back`, `Default`, `Emphasized`, `Ghost`, `Neutral`, `Reject`, `Transparent`, `Unstyled`, `Up` | report.enableMultiSelect and report.enableDelete | Sets the visual style of the Delete button in the header, but has no impact on the functionality of the button. The colors of the button styles depend on the theme applied. |

**Run Button**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `iconButtonRun` | icon (`sap-icon://…`) | `""` |  | report.enableRun | Sets an icon for the Run/Update button in the header. |
| `textButtonRun` | text | `"Update"` |  | report.enableRun | Sets the text for the Run/Update button in the header. This text is translated if a translation is added. |
| `typeButtonRun` | one of | `"Emphasized"` | `Accept`, `Attention`, `Critical`, `Back`, `Default`, `Emphasized`, `Ghost`, `Neutral`, `Reject`, `Transparent`, `Unstyled`, `Up` | report.enableRun | Sets the visual style of the Run/Update button in the header, but has no impact on the functionality of the button. The colors of the button styles depend on the theme applied. |

**Edit Button**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `iconButtonEdit` | icon (`sap-icon://…`) | `""` |  | {appData>/settings/properties/report/enableEditDisplay | Sets an icon for the Edit button in the header. |
| `textButtonEdit` | text | `"Edit"` |  | {appData>/settings/properties/report/enableEditDisplay | Sets the text for the Edit button in the header. This text is translated if a translation is added. |
| `typeButtonEdit` | one of | `"Emphasized"` | `Accept`, `Attention`, `Critical`, `Back`, `Default`, `Emphasized`, `Ghost`, `Neutral`, `Reject`, `Transparent`, `Unstyled`, `Up` | {appData>/settings/properties/report/enableEditDisplay | Sets the visual style of the Edit button in the header, but has no impact on the functionality of the button. The colors of the button styles depend on the theme applied. |

**Display Button**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `iconButtonDisplay` | icon (`sap-icon://…`) | `""` |  | {appData>/settings/properties/report/enableEditDisplay | Sets an icon for the Display button in the header. This button is only visible when the Edit button is selected. |
| `textButtonDisplay` | text | `"Display"` |  | {appData>/settings/properties/report/enableEditDisplay | Sets the text for the Display button in the header. This button is only visible when the Edit button is selected. |
| `typeButtonDisplay` | one of | `"Emphasized"` | `Accept`, `Attention`, `Critical`, `Back`, `Default`, `Emphasized`, `Ghost`, `Neutral`, `Reject`, `Transparent`, `Unstyled`, `Up` | {appData>/settings/properties/report/enableEditDisplay | Sets the visual style of the Display button in the header, but has no impact on the functionality of the button. The colors of the button styles depend on the theme applied. |

**Properties**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `enableRun` | boolean | `true` |  |  | If selected, a Run/Update button displays in the application's header. Selecting this button runs the application and refreshes the data. |
| `enableCreate` | boolean | `false` |  |  | If selected, a Create button displays in the application's header. The press event of this button can be customized by selecting the Create: Settings button in the Event section. |
| `enableClose` | boolean | `false` |  |  | If selected, a Close button displays in the application's header. If this application is opened from another adaptive application, selecting this button closes the application. |
| `enableDelete` | boolean | `false` |  |  | If selected, a Delete button displays on each of the list items, allowing the user to delete entries from the data set. |
| `enableExport` | boolean | `false` |  |  | If selected, an Export button displays in the application's header. Selecting this button lets the user export the data to a CSV file. |
| `enableImport` | boolean | `false` |  |  | If selected, an Import button displays in the application's header. Selecting this button lets the user import data from a CSV file. |
| `enablePDF` | boolean | `false` |  |  | If selected, a Print button displays in the application's header. Selecting this button lets the user generate a selected PDF Template using the app data. |
| `enableMultiSelect` | boolean | `false` |  |  | If selected, a MultiSelect button displays in the application's header, enabling multiple selection for the lists to allow the user to select multiple rows at once. The press event of this button can be customized by selecting the Multiple Selection: Settings button under the Event section. |
| `enableEditDisplay` | boolean | `false` |  |  | If selected, an Edit button displays in the application's header, and all editable fields in the list are be set to display. |
| `enableVariant` | boolean | `false` |  |  | If selected, a Variant button displays in the application's header, and lets the user create, enable, edit, and delete filter variants for the application. |
| `autoRun` | boolean | `false` |  |  | If Run At Start is selected, the application runs automatically when the application is first opened, without having to select the Run/Update button. The application runs as part of the *attachInit* event |
| `autoRunFocus` | boolean | `false` |  |  | If Run At Focus is selected, the application runs automatically every time the user navigates back to the application, without having to select the Run/Update button. The application runs as part of the *beforeDisplay* event |
| `autoRunInterval` | boolean | `false` |  |  | When 'Run At Interval' is checked, the application will be run automatically at a set interval, without having to press the 'Run'/'Update' button. |
| `autoRunIntervalTime` | text | `60` |  | report.autoRunInterval | Sets the time interval in seconds for the application to run automatically when 'Run At Interval' is selected. The default value is 60 seconds. |
| `searchLabel` | text | `"Search"` |  | hidden in the designer | Search Label |
| `searchPlaceholder` | text | `""` |  | hidden in the designer | Search Placeholder |
| `requiredFieldsToast` | text (not shown in the designer) | `"Please fill in all required fields"` |  | hidden in the designer |  |
| `textConfirmDelete` | text (not shown in the designer) | `"Do you want to delete this entry? "` |  | hidden in the designer |  |
| `textConfirmDeleteMany` | text (not shown in the designer) | `"Do you want to delete the selected entry/entries? "` |  | hidden in the designer |  |
| `titleConfirmDelete` | text (not shown in the designer) | `"Delete"` |  | hidden in the designer |  |
| `odataValueList` | text (not shown in the designer) | `"Field does not have any OData ValueListReference"` |  | hidden in the designer |  |

## `settings.properties.form`

**Properties**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `enableCompact` | boolean | `false` |  |  | If selected, Compact Mode makes the elements in the filter section appear smaller and closer together. This setting might be suitable for mouse-operated devices, like desktops. |
| `enableExpandHeader` | boolean | `true` |  |  | Toggle whether the filter section can be shown or hidden by the user. If Enable Filter Expand/Collapse is selected, the filter section can be expanded and collapsed. |
| `headerExpanded` | boolean | `true` |  |  | The filter section can be shown or hidden by the user by selecting the arrow button on the bottom border of the section. If Filter Expanded is selected, the filter section is displayed when opening the application. |
| `headerPreserveState` | boolean | `false` |  |  | If Preserve Header is selected, the current filter section state is retained when scrolling in the application. For example: If the filter section is expanded, the header remains expanded when the user scrolls the application. |
| `enableSearchWildcard` | boolean | `false` |  |  | If Enable '%' as Search Wildcard is selected, *'%'* can be used as a wildcard in the search field to allow for a more custom search. For example: Special characters in names or unknown spelling, like searching *'r%sler'* to return both *'rösler'* and *'rosler'*. |

## `settings.properties.table`

**General**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `headerText` | text |  |  |  | Sets a title for the list, displayed under the application's header. This text is translated if a translation is added. |
| `footerText` | text |  |  |  | Sets a footer text, displayed at the end of the list. This text is translated if a translation is added. |
| `noDataText` | text |  |  |  | Sets a text to be displayed if there is no data to be displayed in the list, either because there are no data in the data set or because there are no matches for a search or filter. This text is translated if a translation is added. |

**Initial Grouping**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `initialGroupField` | field name |  |  |  | Sets a field for the list to be grouped by when the application is first opened. Note: The field selected here must be added to the table for the grouping to work. |
| `initialGroupOrder` | one of |  | `""`, `ASC`, `DESC` |  | If the list is grouped, Order determines the order of the grouping. For example: Ascending or Descending. |

**Initial Sorting**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `initialSortField` | field name |  |  |  | Sets a field to sort the list by when the application is first opened. Note:The field selected here must be added to the table for the sorting to work. |
| `initialSortOrder` | one of |  | `""`, `ASC`, `DESC` |  | If a field is selected for initial sorting, Order determines the order of the sorting. For example: Ascending or Descending. |

**Pagination**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `enablePagination` | boolean | `false` |  |  | If Enable Pagination is selected, the list is split across several pages, depending on the number of items in the list and the number of items to be displayed on each page. Note: By default, 25 items are displayed per page. |
| `paginationShowSelection` | boolean | `false` |  |  | If Show Items per Page is selected, a dropdown menu displays in the lower-left corner of the list, allowing the user to determine how many items to display on each page. |
| `paginationRows` | text | `25` |  |  | Sets the default number of items to be displayed per page, if the user doesn't change it using the dropdown menu. Note: By default, 25 items are displayed per page. |

**Postprocessing**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `postProcessingScript` | server script id |  |  |  | Sets a script to be run every time the application is run/updated, after the data has been fetched. *The table data is set to *req.body* and passed to the script with the rest of the request object.* |

**Properties**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `showSeparators` | one of | `"All"` | `All`, `Inner`, `None` |  | Sets which separating lines are displayed. * All: Separators between the items, including the first and last items. |
| `alternateRowColors` | boolean | `false` |  |  | Enables alternating list row colors. How it is applied depends on the theme. |
| `fixedLayout` | boolean | `false` |  |  | If Fixed Layout is selected, the list's layout depends on the columns' set width, regardless of the cells' content. Note: By default, Fixed Layout is not selected, and the list has an auto-layout where the column width depends on the widest unbreakable content inside its cells. |
| `inset` | boolean | `false` |  |  | Adds space around the list. |
| `enableCompact` | boolean | `false` |  |  | If selected, Compact Mode makes the elements in the list appear smaller and closer together. This setting might be suitable for mouse-operated devices, like desktops. |
| `enableAutoPopin` | boolean | `false` |  |  | If Enable Autopopin is selected, the list columns pop in under each other when the window gets too narrow to properly show all the list content. When this setting is enabled, it removes the option Demand Popin on the columns themselves. |
| `enableAction1` | boolean | `false` |  |  | If Row Actions is selected, it adds a button to each row in the list, which can be used to trigger an event, like the Item Press event. The appearance of this button and the event itself can be customized under the Row Action 1 section that appears when this setting is enabled. |
| `enableAction2` | boolean | `false` |  |  | If Row Actions is selected, it adds a button to each row in the list, which can be used to trigger an event, like the Item Press event. The appearance of this button and the event itself can be customized under the Row Action 2 section that appears when this setting is enabled. |
| `enableAction3` | boolean | `false` |  |  | If Row Actions is selected, it adds a button to each row in the list, which can be used to trigger an event, like the Item Press event. The appearance of this button and the event itself can be customized under the Row Action 3 section that appears when this setting is enabled. |
| `enableAction4` | boolean | `false` |  |  | If Row Actions is selected, it adds a button to each row in the list, which can be used to trigger an event, like the Item Press event. The appearance of this button and the event itself can be customized under the Row Action 4 section that appears when this setting is enabled. |
| `enableAction5` | boolean | `false` |  |  | If Row Actions is selected, it adds a button to each row in the list, which can be used to trigger an event, like the Item Press event. The appearance of this button and the event itself can be customized under the Row Action 5 section that appears when this setting is enabled. |

**Row Action 1**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `action1Text` | text | `""` |  | table.enableAction1 | Sets the text of the button associated with Row Action 1. |
| `action1Icon` | icon (`sap-icon://…`) |  |  | table.enableAction1 | If an icon is selected, it is displayed on the button associated with Row Action 1. |
| `action1Width` | text |  |  | table.enableAction1 | Sets the width of the column that contains the button for Row Action 1. |
| `action1Type` | one of | `"Transparent"` | `Accept`, `Attention`, `Critical`, `Back`, `Default`, `Emphasized`, `Ghost`, `Neutral`, `Reject`, `Transparent`, `Unstyled`, `Up` | table.enableAction1 | Sets the style of the button for Row Action 1. The actual color of the button may depend on the active theme, but does not have any impact on the functionality of the button. |
| `action1Tooltip` | text |  |  | table.enableAction1 | Adds a tooltip to the button, which is displayed when the user hovers over the button. This text is translated if a translation is added. |
| `_action1Nav` | navigation object |  |  | table.enableAction1 | Sets up the event to run when the Row Action 1 button is selected. When selected, the button can either run a server script or open an application or adaptive application. |

**Row Action 1 - Conditional Visibility**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `action1VisibleFieldName` | field name |  |  | table.enableAction1 | The Row Action 1 - Conditional Visibility settings can be used to show/hide the button when certain conditions are met. Sets a field in the table that is checked for a certain condition. |
| `action1VisibleCondition` | one of |  | `""`, `===`, `!==`, `>=`, `<=`, `>`, `<`, `empty` | table.enableAction1 | The Row Action 1 - Conditional Visibility settings can be used to show/hide the button when certain conditions are met. Sets the operator that is used to compare the selected field's value against the selected fixed value or system variable. |
| `action1VisibleFixedValue` | text |  |  | table.enableAction1 and table.action1VisibleCondition !== "empty" | The Row Action 1 - Conditional Visibility settings can be used to show/hide the button when certain conditions are met. Sets a value to be compared against the selected field's value. |
| `action1VisibleSystemValue` | one of |  | `""`, `UserName` | table.enableAction1 and table.action1VisibleCondition !== "empty" | The Row Action 1 - Conditional Visibility settings can be used to show/hide the button when certain conditions are met. Sets a system variable to be compared against the selected field's value. |
| `action1VisibleInverse` | boolean |  |  | table.enableAction1 | The Row Action 1 - Conditional Visibility settings can be used to show/hide the button when certain conditions are met. If Hide Instead of Show is selected, the check is reversed. |

**Row Action 2**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `action2Text` | text | `""` |  | table.enableAction2 | Sets the text of the button associated with Row Action 2. |
| `action2Icon` | icon (`sap-icon://…`) |  |  | table.enableAction2 | If an icon is selected, it is displayed on the button associated with Row Action 2. |
| `action2Width` | text |  |  | table.enableAction2 | Sets the width of the column that contains the button for Row Action 2. |
| `action2Type` | one of | `"Transparent"` | `Accept`, `Attention`, `Critical`, `Back`, `Default`, `Emphasized`, `Ghost`, `Neutral`, `Reject`, `Transparent`, `Unstyled`, `Up` | table.enableAction2 | Sets the style of the button for Row Action 2. The actual color of the button may depend on the active theme, but does not have any impact on the functionality of the button. |
| `action2Tooltip` | text |  |  | table.enableAction2 | Adds a tooltip to the button, which is displayed when the user hovers over the button. This text is translated if a translation is added. |
| `_action2Nav` | navigation object |  |  | table.enableAction2 | Sets up the event to run when the Row Action 2 button is selected. When selected, the button can either run a server script or open an application or adaptive application. |

**Row Action 2 - Conditional Visibility**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `action2VisibleFieldName` | field name |  |  | table.enableAction2 | The Row Action 2 - Conditional Visibility settings can be used to show/hide the button when certain conditions are met. Sets a field in the table that is checked for a certain condition. |
| `action2VisibleCondition` | one of |  | `""`, `===`, `!==`, `>=`, `<=`, `>`, `<`, `empty` | table.enableAction2 | The Row Action 2 - Conditional Visibility settings can be used to show/hide the button when certain conditions are met. Sets the operator that is used to compare the selected field's value against the selected fixed value or system variable. |
| `action2VisibleFixedValue` | text |  |  | table.enableAction2 and table.action2VisibleCondition !== "empty" | The Row Action 2 - Conditional Visibility settings can be used to show/hide the button when certain conditions are met. Sets a value to be compared against the selected field's value. |
| `action2VisibleSystemValue` | one of |  | `""`, `UserName` | table.enableAction2 and table.action2VisibleCondition !== "empty" | The Row Action 2 - Conditional Visibility settings can be used to show/hide the button when certain conditions are met. Sets a system variable to be compared against the selected field's value. |
| `action2VisibleInverse` | boolean |  |  | table.enableAction2 | The Row Action 2 - Conditional Visibility settings can be used to show/hide the button when certain conditions are met. If Hide Instead of Show is selected, the check is reversed. |

**Row Action 3**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `action3Text` | text | `""` |  | table.enableAction3 | Sets the text of the button associated with Row Action 3. |
| `action3Icon` | icon (`sap-icon://…`) |  |  | table.enableAction3 | If an icon is selected, it is displayed on the button associated with Row Action 3. |
| `action3Width` | text |  |  | table.enableAction3 | Sets the width of the column that contains the button for Row Action 3. |
| `action3Type` | one of | `"Transparent"` | `Accept`, `Attention`, `Critical`, `Back`, `Default`, `Emphasized`, `Ghost`, `Neutral`, `Reject`, `Transparent`, `Unstyled`, `Up` | table.enableAction3 | Sets the style of the button for Row Action 3. The actual color of the button may depend on the active theme, but does not have any impact on the functionality of the button. |
| `action3Tooltip` | text |  |  | table.enableAction3 | Adds a tooltip to the button, which is displayed when the user hovers over the button. This text is translated if a translation is added. |
| `_action3Nav` | navigation object |  |  | table.enableAction3 | Sets up the event to run when the Row Action 3 button is selected. When selected, the button can either run a server script or open an application or adaptive application. |

**Row Action 3 - Conditional Visibility**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `action3VisibleFieldName` | field name |  |  | table.enableAction3 | The Row Action 3 - Conditional Visibility settings can be used to show/hide the button when certain conditions are met. Sets a field in the table that is checked for a certain condition. |
| `action3VisibleCondition` | one of |  | `""`, `===`, `!==`, `>=`, `<=`, `>`, `<`, `empty` | table.enableAction3 | The Row Action 3 - Conditional Visibility settings can be used to show/hide the button when certain conditions are met. Sets the operator that is used to compare the selected field's value against the selected fixed value or system variable. |
| `action3VisibleFixedValue` | text |  |  | table.enableAction3 and table.action3VisibleCondition !== "empty" | The Row Action 3 - Conditional Visibility settings can be used to show/hide the button when certain conditions are met. Sets a value to be compared against the selected field's value. |
| `action3VisibleSystemValue` | one of |  | `""`, `UserName` | table.enableAction3 and table.action3VisibleCondition !== "empty" | The Row Action 3 - Conditional Visibility settings can be used to show/hide the button when certain conditions are met. Sets a system variable to be compared against the selected field's value. |
| `action3VisibleInverse` | boolean |  |  | table.enableAction3 | The Row Action 3 - Conditional Visibility settings can be used to show/hide the button when certain conditions are met. If Hide Instead of Show is selected, the check is reversed. |

**Row Action 4**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `action4Text` | text | `""` |  | table.enableAction4 | Sets the text of the button associated with Row Action 4. |
| `action4Icon` | icon (`sap-icon://…`) |  |  | table.enableAction4 | If an icon is selected, it is displayed on the button associated with Row Action 4. |
| `action4Width` | text |  |  | table.enableAction4 | Sets the width of the column that contains the button for Row Action 4. |
| `action4Type` | one of | `"Transparent"` | `Accept`, `Attention`, `Critical`, `Back`, `Default`, `Emphasized`, `Ghost`, `Neutral`, `Reject`, `Transparent`, `Unstyled`, `Up` | table.enableAction4 | Sets the style of the button for Row Action 4. The actual color of the button may depend on the active theme, but does not have any impact on the functionality of the button. |
| `action4Tooltip` | text |  |  | table.enableAction4 | Adds a tooltip to the button, which is displayed when the user hovers over the button. This text is translated if a translation is added. |
| `_action4Nav` | navigation object |  |  | table.enableAction4 | Sets up the event to run when the Row Action 4 button is selected. When selected, the button can either run a server script or open an application or adaptive application. |

**Row Action 4 - Conditional Visibility**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `action4VisibleFieldName` | field name |  |  | table.enableAction4 | The Row Action 4 - Conditional Visibility settings can be used to show/hide the button when certain conditions are met. Sets a field in the table that is checked for a certain condition. |
| `action4VisibleCondition` | one of |  | `""`, `===`, `!==`, `>=`, `<=`, `>`, `<`, `empty` | table.enableAction4 | The Row Action 4 - Conditional Visibility settings can be used to show/hide the button when certain conditions are met. Sets the operator that is used to compare the selected field's value against the selected fixed value or system variable. |
| `action4VisibleFixedValue` | text |  |  | table.enableAction4 and table.action4VisibleCondition !== "empty" | The Row Action 4 - Conditional Visibility settings can be used to show/hide the button when certain conditions are met. Sets a value to be compared against the selected field's value. |
| `action4VisibleSystemValue` | one of |  | `""`, `UserName` | table.enableAction4 and table.action4VisibleCondition !== "empty" | The Row Action 4 - Conditional Visibility settings can be used to show/hide the button when certain conditions are met. Sets a system variable to be compared against the selected field's value. |
| `action4VisibleInverse` | boolean |  |  | table.enableAction4 | The Row Action 4 - Conditional Visibility settings can be used to show/hide the button when certain conditions are met. If Hide Instead of Show is selected, the check is reversed. |

**Row Action 5**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `action5Text` | text | `""` |  | table.enableAction5 | Sets the text of the button associated with Row Action 5. |
| `action5Icon` | icon (`sap-icon://…`) |  |  | table.enableAction5 | If an icon is selected, it is displayed on the button associated with Row Action 5. |
| `action5Width` | text |  |  | table.enableAction5 | Sets the width of the column that contains the button for Row Action 5. |
| `action5Type` | one of | `"Transparent"` | `Accept`, `Attention`, `Critical`, `Back`, `Default`, `Emphasized`, `Ghost`, `Neutral`, `Reject`, `Transparent`, `Unstyled`, `Up` | table.enableAction5 | Sets the style of the button for Row Action 5. The actual color of the button may depend on the active theme, but does not have any impact on the functionality of the button. |
| `action5Tooltip` | text |  |  | table.enableAction5 | Adds a tooltip to the button, which is displayed when the user hovers over the button. This text is translated if a translation is added. |
| `_action5Nav` | navigation object |  |  | table.enableAction5 | Sets up the event to run when the Row Action 5 button is selected. When selected, the button can either run a server script or open an application or adaptive application. |

**Row Action 5 - Conditional Visibility**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `action5VisibleFieldName` | field name |  |  | table.enableAction5 | The Row Action 5 - Conditional Visibility settings can be used to show/hide the button when certain conditions are met. Sets a field in the table that is checked for a certain condition. |
| `action5VisibleCondition` | one of |  | `""`, `===`, `!==`, `>=`, `<=`, `>`, `<`, `empty` | table.enableAction5 | The Row Action 5 - Conditional Visibility settings can be used to show/hide the button when certain conditions are met. Sets the operator that is used to compare the selected field's value against the selected fixed value or system variable. |
| `action5VisibleFixedValue` | text |  |  | table.enableAction5 and table.action5VisibleCondition !== "empty" | The Row Action 5 - Conditional Visibility settings can be used to show/hide the button when certain conditions are met. Sets a value to be compared against the selected field's value. |
| `action5VisibleSystemValue` | one of |  | `""`, `UserName` | table.enableAction5 and table.action5VisibleCondition !== "empty" | The Row Action 5 - Conditional Visibility settings can be used to show/hide the button when certain conditions are met. Sets a system variable to be compared against the selected field's value. |
| `action5VisibleInverse` | boolean |  |  | table.enableAction5 | The Row Action 5 - Conditional Visibility settings can be used to show/hide the button when certain conditions are met. If Hide Instead of Show is selected, the check is reversed. |

## `settings.fieldsSel[]` (one entry per field)

Every entry also has `name` (a field catalog name) and `fieldPos` (1, 2, 3 … display order).

**General**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `text` | text |  |  |  | Sets the name displayed above the filter input. |
| `type` | one of |  | `Input`, `CheckBox`, `DateRange`, `MultiSelect`, `MultiSelectLookup`, `MultiSelectScript`, `RangeSlider`, `SingleSelect`, `SingleSelectLookup`, `SingleSelectScript`, `Switch`, `ValueHelp`, `ValueHelpOData` |  | Sets the type of filter input. |
| `switchOnText` | text |  |  | type === "Switch" | Sets the text for the true/positive/'On' state of the switch component. The default text is 'On'. |
| `switchOffText` | text |  |  | type === "Switch" | Sets the text for the false/negative/'Off' state of the switch component. The default text is 'Off'. |
| `rangeMin` | text |  |  | type === "RangeSlider" | Set `rangeMin` and `rangeMax`: without them a RangeSlider filter starts restricted to 25–75. |
| `rangeMax` | text |  |  | type === "RangeSlider" | Sets the maximum value for the range slider. |
| `rangeStep` | text |  |  | type === "RangeSlider" | The step defines the amount of units to change the slider when adjusting by drag and drop (e.g. min = 0, max = 10, step = 5 would result in possible selection of the values 0, 5, 10). The step must be positive, if a negative number is provided, the default value will be used instead. |
| `enableRangeTickmarks` | boolean | `false` |  | type === "RangeSlider" | If Enable Tickmarks is selected, each step on the range slider will be marked with a tick. |
| `valueHelpOnly` | boolean | `false` |  | type === "ValueHelp" | If Value Help Only is selected, the user cannot enter in the field directly, but must select the value through the value help. |

**Data**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `dynamicDataItems` | items array | placeholder – do not send |  | ["SingleSelect", "MultiSelect"].includes(type) | Fixed choices for a SingleSelect/MultiSelect filter; replaces the column's own values. Leave it out to offer the column's values. |

**Data Source**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `lookupTable` | table name |  |  | type === "MultiSelectLookup" or type === "SingleSelectLookup" | Sets the table to be used as the data source for the filter field. |
| `lookupFieldKey` | lookup-table field name |  |  | type === "MultiSelectLookup" or type === "SingleSelectLookup" | Sets the field to be used as the key for the filter. It is the value of this field that the filter looks for in the list data. |
| `lookupFieldText` | lookup-table field name |  |  | type === "MultiSelectLookup" or type === "SingleSelectLookup" | Value that is displayed in the filter's input. It does not have an impact on actual filtering, but can be used to make the filtering more user-friendly. |
| `lookupFieldAdditional` | lookup-table field name |  |  | type === "MultiSelectLookup" or type === "SingleSelectLookup" | An additional field can be displayed for each list item, like a description or additional important information. |
| `lookupFieldGrouping1` | boolean |  |  | type === "MultiSelectLookup" or type === "SingleSelectLookup" | If Group by Add. Field is selected, the list is grouped by the field set as the Additional Field, using its value as a header for each group. |
| `lookupShowOnlyText` | boolean |  |  | type === "MultiSelectLookup" or type === "SingleSelectLookup" | If Hide Key Field is selected, the field selected as Key Field is not visible in the list. It does not have any impact on the functionality, it is only a visual change. |

**ValueHelp Source**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `valueRequestKey` | text |  |  | type === "ValueHelp" | Sets the field to be returned to the filter input when the user selects an item from the value help. |
| `_navigation` | navigation object |  |  | type === "ValueHelp" | Sets the data that is displayed in the value help. When the user selects the input field's value help, it can open an application or another adaptive application, like a list or a dialog with data from a server script. |

**Data Source**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `scriptSelect` | server script id |  |  | type === "MultiSelectScript" or type === "SingleSelectScript" | Sets a script to return data that fills the filter dropdown menu with items. *In the server script, set *result.data* to an array of objects with both *key* and *text* keys. |
| `lookupFieldGrouping2` | boolean |  |  | type === "MultiSelectScript" or type === "SingleSelectScript" | If the items returned from the script have an Additional Text property, select Group by Add. Field to group the items by this additional text, using its value as a header for each group. |

**Default Value**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `default` | text |  |  |  | Sets a default value by which to filter the list when it is first opened. |
| `sysvarValue` | one of |  | `""`, `UserName`, `TOMORROW`, `TODAY`, `YESTERDAY`, `LAST_7`, `LAST_30`, `LAST_60`, `LAST_90`, `LAST_180`, `NEXT_30`, `NEXT_60`, `NEXT_7`, `NEXT_90`, `NEXT_180` |  | Sets a default value based on a system variable, like the current user's username or the current data, by which to filter the list when it is first opened. |
| `scriptValue` | server script id |  |  |  | Sets a script that returns a value to be added to the filter field as a default value on start. *The server script should set *result.data* to be a string.* |

**Properties**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `selEqual` | boolean |  |  | ["Input", "ValueHelp"].includes(type) or !type | If Strict Search is selected, the filter only displays exact matches, not partial matches. If the filter key is a UUID, this setting should be selected to get the correct match. |
| `required` | boolean | `false` |  |  | If the filter is set to Required, the list displays *No data* if there is no text or selection in the filter. |
| `visible` | boolean | `true` |  |  | If Visible is not selected, it hides the filter input from the header. The filter input is still functional and applies any default filters on start, for instance. |
| `enableClearInput` | boolean | `false` |  | type === "ValueHelp" | If Show Clear Icon is selected, an *X* is displayed in the input field if it has text in it, allowing the user to clear the field. |

## `settings.fieldsRun[]` (one entry per field)

Every entry also has `name` (a field catalog name) and `fieldPos` (1, 2, 3 … display order).

**General**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `text` | text |  |  |  | Sets the title of the field column. |
| `type` | one of |  | `""`, `Button`, `CheckBox`, `ColorPicker`, `DatePicker`, `DateTimePicker`, `ExpandableText`, `Icon`, `Input`, `Image`, `Link`, `MultiSelectLookup`, `MultiSelectScript`, `ObjectNumber`, `ObjectStatus`, `SingleSelectLookup`, `SingleSelectScript`, `Switch`, `StepInput`, `JSON` |  | Sets the type of field to display the data in the column. |
| `switchOnText` | text |  |  | type === "Switch" | Sets the text for the true/positive/'On' state of the switch component. The default text is 'On'. |
| `switchOffText` | text |  |  | type === "Switch" | Sets the text for the false/negative/'Off' state of the switch component. The default text is 'Off'. |
| `valueHelpOnly` | boolean | `false` |  | ["ValueHelp", "ColorPicker"].includes(type) | If Value Help Only is selected, the user cannot enter in the field directly, but must select the value through the value help. |
| `hideInputField` | boolean | `false` |  | ["ColorPicker"].includes(type) | If Hide Input Field is selected, the input field is hidden. |
| `inputType` | one of |  | `""`, `Email`, `Number`, `Password`, `Tel`, `Text`, `Url` | type === "Input" | Sets the formatting of the input field. For example: Setting it to *password* displays the value as a number of dots instead of the actual characters. |
| `expandableTextPopover` | boolean |  |  | type === "ExpandableText" | If the field type is Expandable Text, long texts are truncated and hidden behind a *Show More* link that expands the field to show the whole text. If Show Text in Popover is selected, the hidden text displays instead in a small popover when *Show More* is selected. |
| `statusInverted` | boolean |  |  | type === "ObjectStatus" or type === "ObjectNumber" | Sets whether the background color, instead of the field's text, reflects the set state. |
| `stepInputTextAlign` | one of |  | `""`, `Begin`, `Center`, `End`, `Initial`, `Left`, `Right` | type === "StepInput" | Sets where in the step input field the text should be placed. |
| `buttonType` | one of | `"Transparent"` | `Accept`, `Attention`, `Critical`, `Back`, `Default`, `Emphasized`, `Ghost`, `Neutral`, `Reject`, `Transparent`, `Unstyled`, `Up` | type === "Button" | Sets the style of the button. The actual color of the button type might depend on the theme set. |
| `buttonTypeTooltip` | text |  |  | type === "Button" | Sets a tooltip for the button to be displayed when the user hovers over the button. This text is translated if a translation is added. |

**Event**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `_navigation` | navigation object |  |  | type === "Link" or type === "Button" | Sets up the event to run when the button is selected. When selected, the button can either run a server script or open an application or adaptive application. |

**Mask**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `mask` | text |  |  | conditional (see the designer) | Sets a mask for the input that requires the value to be in a specific format. For example: ' * * *- * * *- * * *' to make the value be split in sections of three characters. |
| `enableMaskAdvanced` | boolean |  |  | conditional (see the designer) | If Mask Rule is selected, advanced settings are available, like determining the mask placeholder character and which characters that should be allowed. |
| `maskCharacter` | text |  |  | conditional (see the designer) | Sets which character should be considered the placeholder character. The default is *. |
| `maskRule` | one of |  | `[a-zA-Z0-9]`, `[0-9]`, `[a-zA-Z]`, `[A-Z]`, `[a-z]`, `custom` | conditional (see the designer) | Sets which characters the user can enter in place of the placeholder. |
| `maskCustomRegex` | text |  |  | enableMaskAdvanced and maskRule === "custom" | Create a custom regex to allow any specific combination of characters in place of the placeholder. |

**Value**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `valueType` | one of |  | `""`, `Fixed`, `Lookup`, `Rule`, `Script` |  | Sets the value to be displayed in the column. * Source Value: Displays the actual value from the data set, as it is. |
| `valueFixed` | text |  |  | valueType === "Fixed" and !["Icon", "ColorPicker"].includes(type) | Sets a static value that is the same for all the rows in the column. |
| `valueIconFixed` | icon (`sap-icon://…`) |  |  | valueType === "Fixed" and ["Icon"].includes(type) | Sets a static icon that is the same for all the rows in the column. |
| `valueColorFixed` | colour |  |  | valueType === "Fixed" and ["ColorPicker"].includes(type) | Sets a static color that is the same for all the rows in the column. |
| `valueLookup` | lookup object |  |  | valueType === "Lookup" | Select a reference table to get related data using the field's value. For example: A customer ID from the list item to fetch the corresponding customer name from the *Customers* table. |
| `valueRule` | rule id |  |  | valueType === "Rule" | Select a rules engine to return another value depending on the field's value. For example: The rules engine can return *Completed* if the value of the field *Completed* is *true*, and *Not Completed* if it is *false*. |
| `formatter` | one of |  | `""`, `date00`, `date01`, `date02`, `date03`, `date04`, `date05`, `sapdate01`, `sapdate02`, `zero`, `uppercase`, `lowercase`, `number00`, `number01`, `number02`, `number03`, `number04`, `number05`, `number06`, `number07`, `numberCustom`, `file`, `customPairs` | not (type === "DatePicker" or type === "DateTimePicker" or type === "Input") | Formats the value, like setting a text to all uppercase or showing a date in relative terms. |
| `formatNumberDecimals` | text |  |  | formatter === "numberCustom" | Sets the number of decimals to display. |
| `formatNumberSeparator` | one of |  | `browserDefault`, `comma`, `point` | formatter === "numberCustom" | Sets the decimal separator, which can be a comma, a point, or whichever one is the default in the user's browser. |
| `formatCustomPairs` | items array | placeholder – do not send |  | formatter and formatter === "customPairs" | Define key-text pairs to format any matching values in the table column. |
| `displayFormat` | text |  |  | ["DatePicker", "DateTimePicker"].includes(type) | Sets the date format. For example: *hh:mm dd/MM/YY* for hour:minutes day/month/year. |

**Data Source**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `lookupTable` | table name |  |  | type === "MultiSelectLookup" or type === "SingleSelectLookup" | Sets the table to be used as the data source for the field. |
| `lookupFieldKey` | lookup-table field name |  |  | type === "MultiSelectLookup" or type === "SingleSelectLookup" | Sets the field to be used as the key. |
| `lookupFieldText` | lookup-table field name |  |  | type === "MultiSelectLookup" or type === "SingleSelectLookup" | Sets the field that is displayed in the dropdown menu |
| `lookupFieldAdditional` | lookup-table field name |  |  | type === "MultiSelectLookup" or type === "SingleSelectLookup" | An additional field can be displayed for each list item, like a description or additional important information. |
| `lookupShowOnlyText` | boolean |  |  | type === "MultiSelectLookup" or type === "SingleSelectLookup" | If Hide Key Field is selected, the field selected as Key Field is not be visible in the list. It does not have any impact on the functionality, it is only a visual change. |

**Data Source**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `scriptSelect` | server script id |  |  | type === "MultiSelectScript" or type === "SingleSelectScript" | Sets a script to return data that fills the dropdown menu with items. *In the server script, set *result.data* to an array of objects with both *key* and *text* keys. |

**Min**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `stepInputMinType` | one of |  | `""`, `Binding`, `Fixed`, `Lookup`, `Rule` | type === "StepInput" | Determines how to retrieve the minimum value for the step input. The step input does not go lower than this. |
| `stepInputMinFixed` | text |  |  | type === "StepInput" and stepInputMinType === "Fixed" | Sets a static value as the step input's minimum value. For example: Setting *5* makes the input field start at 5 and does not let it go lower than this. |
| `stepInputMinRule` | rule id |  |  | type === "StepInput" and stepInputMinType === "Rule" | Select a rules engine to return another value depending on the field's value. |
| `stepInputMinBinding` | field name |  |  | type === "StepInput" and stepInputMinType === "Binding" | Binds the minimum to the field's value. |
| `stepInputMinLookup` | lookup object |  |  | type === "StepInput" and stepInputMinType === "Lookup" | Select a reference table to get related data using the field's value. For example: A customer ID from the list item to fetch a corresponding number value from the *Customers* table. |

**Max**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `stepInputMaxType` | one of |  | `""`, `Binding`, `Fixed`, `Lookup`, `Rule` | type === "StepInput" | Determines how to retrieve the maximum value for the step input. The step value does go higher than this. |
| `stepInputMaxFixed` | text |  |  | type === "StepInput" and stepInputMaxType === "Fixed" | Sets a static value as the step input's maximum value. For example: Setting *100* stops the step input from going higher than this. |
| `stepInputMaxRule` | rule id |  |  | type === "StepInput" and stepInputMaxType === "Rule" | Select a rules engine to return another value depending on the field's value. |
| `stepInputMaxBinding` | field name |  |  | type === "StepInput" and stepInputMaxType === "Binding" | Binds the maximum to the field's value. |
| `stepInputMaxLookup` | lookup object |  |  | type === "StepInput" and stepInputMaxType === "Lookup" | Select a reference table to get related data using the field's value. For example: A customer ID from the list item to fetch a corresponding number value from the *Customers* table. |

**Step**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `stepInputStepType` | one of |  | `""`, `Binding`, `Fixed`, `Lookup`, `Rule` | type === "StepInput" | Determines how to retrieve the step value for the input. In other words, how many numbers to go up or down with each step. |
| `stepInputStepFixed` | text |  |  | type === "StepInput" and stepInputStepType === "Fixed" | Sets a static value as the input's step value. For example: Setting *2* increases/decreases the value by 2 every time plus or minus is selected. |
| `stepInputStepRule` | rule id |  |  | type === "StepInput" and stepInputStepType === "Rule" | Select a rules engine to return another value depending on the field's value. |
| `stepInputStepBinding` | field name |  |  | type === "StepInput" and stepInputStepType === "Binding" | Binds the step value to the field's value. |
| `stepInputStepLookup` | lookup object |  |  | type === "StepInput" and stepInputStepType === "Lookup" | Select a reference table to get related data using the field's value. For example: A customer ID from the list item to fetch a corresponding number value from the *Customers* table. |

**Value: URL**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `linkHrefType` | one of |  | `""`, `Binding`, `Fixed`, `Lookup`, `Rule`, `Script` | type === "Link" | Determines how to retrieve the value for the link's URL. * Binding: Uses another selected field's value as the URL. |
| `linkHrefFixed` | text |  |  | type === "Link" and linkHrefType === "Fixed" | Sets a static value to be the URL. For example: *https://www.neptune-software.com/.* |
| `linkHrefRule` | rule id |  |  | type === "Link" and linkHrefType === "Rule" | Select a rules engine to return a URL depending on the field's value. |
| `linkHrefBinding` | field name |  |  | type === "Link" and linkHrefType === "Binding" | Binds the URL to the field's value. |
| `linkHrefLookup` | lookup object |  |  | type === "Link" and linkHrefType === "Lookup" | Select a reference table to get related data using the field's value. For example: A customer ID from the list item to fetch a corresponding URL from the *Customers* table. |
| `linkTargetOpen` | one of |  | `_blank`, `_self` | type === "Link" | Select whether the URL opens in a new tab or the same tab when selected. |
| `linkRelative` | boolean |  |  | type === "Link" | If Relative URL is not selected, it is assumed the URL is absolute. If the URL doesn't start with *https://*, it is prepended before opening the link. |

**Value: Icon**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `statusIconType` | one of |  | `""`, `Binding`, `Fixed`, `Lookup`, `Rule`, `Script` | ["ObjectStatus", "Button"].includes(type) | Determines how to retrieve the icon for the object status. * Binding: Uses another selected field's value as the icon source. |
| `statusIconFixed` | icon (`sap-icon://…`) |  |  | ["ObjectStatus", "Button"].includes(type) and statusIconType === "Fixed" | Sets a static icon from the Icon Explorer. |
| `statusIconRule` | rule id |  |  | ["ObjectStatus", "Button"].includes(type) and statusIconType === "Rule" | Select a rules engine to return an icon source depending on the field's value. |
| `statusIconBinding` | field name |  |  | ["ObjectStatus", "Button"].includes(type) and statusIconType === "Binding" | Binds the icon source to another field's value. |
| `statusIconLookup` | lookup object |  |  | ["ObjectStatus", "Button"].includes(type) and statusIconType === "Lookup" | Select a reference table to get related data using the field's value. For example: A customer ID from the list item to fetch a corresponding icon source from the *Customers* table. |

**Value: Title**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `statusTitleType` | one of |  | `""`, `Binding`, `Fixed`, `Lookup`, `Rule`, `Script` | type === "ObjectStatus" | Determines how to retrieve the value for the object status' title, which displays in front of the field value, like *Title: value*. * Binding: Uses another selected field's value as the title. |
| `statusTitleFixed` | text |  |  | type === "ObjectStatus" and statusTitleType === "Fixed" | Sets a static value to be the title. |
| `statusTitleRule` | rule id |  |  | type === "ObjectStatus" and statusTitleType === "Rule" | Select a rules engine to return a title depending on the field's value. |
| `statusTitleBinding` | field name |  |  | type === "ObjectStatus" and statusTitleType === "Binding" | Binds the title to the field's value |
| `statusTitleLookup` | lookup object |  |  | type === "ObjectStatus" and statusTitleType === "Lookup" | Select a reference table to get related data using the field's value. For example: A customer ID from the list item to fetch a corresponding icon source from the *Customers* table. |
| `statusTitleFormatter` | one of |  | `""`, `date00`, `date01`, `date02`, `date03`, `date04`, `sapdate01`, `sapdate02`, `zero`, `uppercase`, `lowercase`, `number00`, `number01`, `number02`, `number03`, `number04`, `number05`, `number06`, `number07`, `file` | type === "ObjectStatus" | Formats the title, like setting text to all uppercase, or showing a date in relative terms. |

**Value: State**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `statusStateType` | one of |  | `""`, `Binding`, `Fixed`, `Lookup`, `Rule`, `Script` | type === "ObjectStatus" | Determines how to retrieve the value for the object status' state, which determines the color of the field text or background. * Binding: Uses another selected field's value as the state. |
| `statusStateFixed` | one of |  | `""`, `None`, `Error`, `Warning`, `Success`, `Information`, `Indication01`, `Indication02`, `Indication03`, `Indication04`, `Indication05`, `Indication06`, `Indication07`, `Indication08` | type === "ObjectStatus" and statusStateType === "Fixed" | Sets a static value to be the state, selected from a dropdown menu. The actual colors of the states might depend on the theme. |
| `statusStateRule` | rule id |  |  | type === "ObjectStatus" and statusStateType === "Rule" | Select a rules engine to return a state depending on the field's value. For example: If the value is *Completed, the state *Success* might be returned, turning the object status text green. |
| `statusStateBinding` | field name |  |  | type === "ObjectStatus" and statusStateType === "Binding" | Binds the state to the field's value. |
| `statusStateLookup` | lookup object |  |  | type === "ObjectStatus" and statusStateType === "Lookup" | Select a reference table to get related data using the field's value. For example: A customer ID from the list item to fetch a corresponding state value from the *Customers* table. |

**Value: Unit**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `numberUnitType` | one of |  | `""`, `Binding`, `Fixed`, `Lookup`, `Rule`, `Script` | type === "ObjectNumber" | Determines how to retrieve the value for the object number's unit, which is appended to the field's value, like *value UNIT*. * Binding: Use another selected field's value as the unit. |
| `numberUnitFixed` | text |  |  | type === "ObjectNumber" and numberUnitType === "Fixed" | Sets a static value as the unit. For example: *USD*. |
| `numberUnitRule` | rule id |  |  | type === "ObjectNumber" and numberUnitType === "Rule" | Select a rules engine to return a unit value depending on the field's value. |
| `numberUnitBinding` | field name |  |  | type === "ObjectNumber" and numberUnitType === "Binding" | Binds the unit value to the field's value. |
| `numberUnitLookup` | lookup object |  |  | type === "ObjectNumber" and numberUnitType === "Lookup" | Select a reference table to get related data using the field's value. For example: A customer ID from the list item to fetch a corresponding unit value from the *Customers* table. |
| `numberUnitFormatter` | one of |  | `""`, `date00`, `date01`, `date02`, `date03`, `date04`, `sapdate01`, `sapdate02`, `zero`, `uppercase`, `lowercase`, `number00`, `number01`, `number02`, `number03`, `number04`, `number05`, `number06`, `number07`, `file` | type === "ObjectNumber" | Formats the unit value, like setting text to all uppercase, or showing a date in relative terms. |

**Value: State**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `numberStateType` | one of |  | `""`, `Binding`, `Fixed`, `Lookup`, `Rule`, `Script` | type === "ObjectNumber" | Determines how to retrieve the value for the object number's state, which determines the color of the field text or background. * Binding: Uses another selected field's value as the state. |
| `numberStateFixed` | text |  |  | type === "ObjectNumber" and numberStateType === "Fixed" | Sets a static value as the state. For example: *Success* or *Error*. |
| `numberStateRule` | rule id |  |  | type === "ObjectNumber" and numberStateType === "Rule" | Select a rules engine to return a state depending on the field's value. For example: If the value is *Completed*, the state Success might be returned, turning the object number text green. |
| `numberStateBinding` | field name |  |  | type === "ObjectNumber" and numberStateType === "Binding" | Binds the state to the field's value. |
| `numberStateLookup` | lookup object |  |  | type === "ObjectNumber" and numberStateType === "Lookup" | Select a reference table to get related data using the field's value. For example: A customer ID from the list item to fetch a corresponding state value from the *Customers* table. |

**Layout**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `hAlign` | one of |  | `""`, `Begin`, `Center`, `End`, `Initial`, `Left`, `Right` |  | Aligns the column title and field value horizontally in the column. |
| `vAlign` | one of |  | `""`, `Bottom`, `Inherit`, `Middle`, `Top` |  | Aligns the column title and field values vertically in the column. |
| `minScreenWidth` | one of |  | `""`, `2560px`, `2240px`, `1920px`, `1680px`, `1536px`, `1440px`, `1280px`, `XXLarge`, `Desktop`, `XLarge`, `Tablet`, `Medium`, `Small`, `XSmall`, `Phone`, `XXSmall` |  | Sets the minimum screen width to display the column. For example: If you set the minimum screen width to be 900px, the column is displayed on tablet or desktop, but is hidden on mobile. |
| `demandPopin` | boolean |  |  | not (table.enableAutoPopin) | Depending on the settings in MinScreenSize, you can hide the column on different screen sizes. For example: If you select Demand Popin, the column displays as a pop-in instead of hiding on smaller screen. |
| `popinDisplay` | one of | `"Inline"` | `Block`, `Inline`, `WithoutHeader` |  | Determines how the column pops in on smaller screens. * Block: Displays the column header on the first line and the cell content on the next line. |
| `placeholder` | text |  |  | conditional (see the designer) | Sets a placeholder for the field if there is no value. |
| `dateTimePickerMinutesStep` | text |  |  | type === "DateTimePicker" | Sets the minutes step for the clock in the date picker. If the step is less than 1, it is automatically converted back to 1. |
| `dateTimePickerSecondsStep` | text |  |  | type === "DateTimePicker" | Sets the seconds step for the clock in the date picker. If the step is less than 1, it is automatically converted back to 1. |
| `width` | text |  |  |  | Sets the width of the column, either in pixels, like 100px, or as a percentage, like 25%. |
| `wrapping` | boolean | `false` |  |  | If you select Wrapping, long text wraps to the next line instead of making the column wider. |

**Properties**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `editable` | boolean | `false` |  | conditional (see the designer) | Determines if the field is editable directly in the list or not. If Enable Edit/Display Mode in the Settings/properties pane is selected, all editable fields are in display mode by default, and are only editable once the Edit button in the header is selected. |
| `enableClearInput` | boolean | `false` |  | ["ValueHelp", "ColorPicker"].includes(type) | If Show Clear Icon is selected, an *X* is displayed in the input field if it has text in it, allowing the user to clear the field. |
| `enableGroup` | boolean | `false` |  |  | If Grouping is selected, the list can be grouped based on the column value by selecting the column header and selecting Group Ascending or Group Descending. This can be reversed by selecting the column header again and selecting Ungroup. |
| `enableFilter` | boolean | `true` |  |  | Set `false` on number, date and boolean columns: the live search applies a text `Contains` to every flagged column and fails on other types. |
| `enableSort` | boolean | `true` |  |  | If Sorting is selected, the list can be sorted based on the column value by selecting the column header and selecting Sort Ascending or Sort Descending. |
| `visible` | boolean | `true` |  |  | If Visible is not selected, the column is hidden from view. The column is still included if you search or filter. |
| `enableSum` | boolean | `false` |  | type === "ObjectNumber" | If Sum is selected, a field is added at the bottom of the list, summing up the value of all the items in the column. |
| `sumCalculation` | one of | `""` | `""`, `Average` | type === "ObjectNumber" | Determines whether the Sum field displays a sum of the values in the column or the average of the values. |

