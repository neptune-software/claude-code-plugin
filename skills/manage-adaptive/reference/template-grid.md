# Template `neptunedxp_adaptive_grid`: Grid

Allows you to manage data sets in a visually appealing, tile-based grid display. The template represent each entry in your dataset as an individual tile, sort and filter tiles based on specific criteria, and customize the tiles' appearance to suit your needs. This template can also for instance be linked to adaptive applications created with the Form template.

In this template: `fieldsSel` = the **Filter** fields (catalog usage `INPUT`/`BOTH`); `fieldsRun` = the **Grid** fields (catalog usage `OUTPUT`/`BOTH`).

Keys shown as `_name` hold an object (navigation or PDF, see `values.md`). The *Default* column is what the designer writes.
At run time this template fills a missing `properties` key with the default below.
**Field entries (`fieldsSel`, `fieldsRun`) never get defaults at run time**: send `visible: true` on every field (List and Tile Table
columns and Tile Chart fields without it are not used) and `editable: true` on form inputs. Never send a default marked *placeholder*.

## `settings.properties.report`

**General**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `title` | text |  |  |  | Sets a title for the application, shown in the header. This text will be translated if a translation is added. |
| `subTitle` | text |  |  |  | Sets a subtitle for the application, shown under the title in the header. This text will be translated if a translation is added. |
| `avatarIcon` | icon (`sap-icon://…`) |  |  |  | Sets which icon to be shown in the header. |
| `avatarBackgroundColor` | one of |  | `""`, `Accent1`, `Accent2`, `Accent3`, `Accent4`, `Accent5`, `Accent6`, `Accent7`, `Accent8`, `Accent9`, `Accent10`, `Random` |  | Sets the background color for the header icon. The specific colors depend on the theme applied. |
| `showIcon` | boolean | `true` |  |  | Shows/hides the icon in the header. |
| `actionButtonLeft` | boolean | `false` |  |  | Moves the action buttons (e.g., Create, Update, Close) to the left in the header, under the title. |

**Event**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `_navigationCreate` | navigation object |  |  | report.enableCreate | Sets up the event to run when the 'Create' button in the header is pressed. When pressed, the button can either run a Server Script or open an application or adaptive application. |
| `_navigationItemPress` | navigation object |  |  |  | Sets up the event to run when a card in the grid is pressed. When pressed, the card can either run a Server Script or open an application or adaptive application. |
| `_navigationMultiSelect` | navigation object |  |  | report.enableMultiSelect | Sets up the event to run when multiple cards in the grid are selected and the 'MultiSelect' button in the header is pressed. When pressed, the button can either run a Server Script or open an application or adaptive application. |
| `_pdfPrint` | PDF object |  |  | report.enablePDF | Sets up the PDF Template to generate with the application data when the Print button is pressed. The settings also offer the option of automatically saving the generated PDF to the PDF Archive. |

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

**Button Export**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `iconButtonExport` | icon (`sap-icon://…`) | `"sap-icon://excel-attachment"` |  | report.enableExport | Sets an icon for the 'Export' button in the header. |
| `textButtonExport` | text | `""` |  | report.enableExport | Sets the text for the 'Export' button in the header. This text will be translated if a translation is added. |
| `typeButtonExport` | one of | `"Transparent"` | `Accept`, `Attention`, `Critical`, `Back`, `Default`, `Emphasized`, `Ghost`, `Neutral`, `Reject`, `Transparent`, `Unstyled`, `Up` | report.enableExport | Sets the visual style of the 'Export' button in the header, but has no impact on the functionality of the button. The colors of the button styles will depend on the theme applied. |

**Button Import**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `iconButtonImport` | icon (`sap-icon://…`) | `"sap-icon://fa-solid/file-import"` |  | report.enableImport | Sets an icon for the 'Import' button in the header. |
| `textButtonImport` | text | `""` |  | report.enableImport | Sets the text for the 'Import' button in the header. This text will be translated if a translation is added. |
| `typeButtonImport` | one of | `"Transparent"` | `Accept`, `Attention`, `Critical`, `Back`, `Default`, `Emphasized`, `Ghost`, `Neutral`, `Reject`, `Transparent`, `Unstyled`, `Up` | report.enableImport | Sets the visual style of the 'Import' button in the header, but has no impact on the functionality of the button. The colors of the button styles will depend on the theme applied. |

**Button MultiSelect**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `iconButtonMultiSelect` | icon (`sap-icon://…`) | `""` |  | report.enableMultiSelect | Sets an icon for the 'MultiSelect' button in the header. |
| `textButtonMultiSelect` | text | `"MultiSelect"` |  | report.enableMultiSelect | Sets the text for the 'MultiSelect' button in the header. This text will be translated if a translation is added. |
| `typeButtonMultiSelect` | one of | `"Emphasized"` | `Accept`, `Attention`, `Critical`, `Back`, `Default`, `Emphasized`, `Ghost`, `Neutral`, `Reject`, `Transparent`, `Unstyled`, `Up` | report.enableMultiSelect | Sets the visual style of the 'MultiSelect' button in the header, but has no impact on the functionality of the button. The colors of the button styles will depend on the theme applied. |

**Button Run**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `iconButtonRun` | icon (`sap-icon://…`) | `""` |  | report.enableRun | Sets an icon for the 'Run'/'Update' button in the header. |
| `textButtonRun` | text | `"Update"` |  | report.enableRun | Sets the text for the 'Run'/'Update' button in the header. This text will be translated if a translation is added. |
| `typeButtonRun` | one of | `"Emphasized"` | `Accept`, `Attention`, `Critical`, `Back`, `Default`, `Emphasized`, `Ghost`, `Neutral`, `Reject`, `Transparent`, `Unstyled`, `Up` | report.enableRun | Sets the visual style of the 'Run'/'Update' button in the header, but has no impact on the functionality of the button. The colors of the button styles will depend on the theme applied. |

**Print Button**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `iconButtonPrint` | icon (`sap-icon://…`) | `"sap-icon://print"` |  | report.enablePDF | Icon |
| `textButtonPrint` | text | `""` |  | report.enablePDF | Text |
| `typeButtonPrint` | one of | `"Transparent"` | `Accept`, `Attention`, `Critical`, `Back`, `Default`, `Emphasized`, `Ghost`, `Neutral`, `Reject`, `Transparent`, `Unstyled`, `Up` | report.enablePDF | Type |

**Properties**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `enableRun` | boolean | `true` |  |  | Checking this setting will show a 'Run'/'Update' button in the app's header. Pressing this button will run the app and refresh the data. |
| `enableCreate` | boolean | `false` |  |  | Checking this setting will show a 'Create' button in the app's header. The press event of this button can be customized by clicking the 'Create: Settings' button in the Event section. |
| `enableClose` | boolean | `false` |  |  | Checking this setting will show a 'Close' button in the app's header. If this app is opened from another adaptive app, pressing this button will close the app. |
| `enableDelete` | boolean | `false` |  |  | Checking this setting will show a delete button on each of the grid cards, allowing the user to delete entries from the data set. |
| `enableExport` | boolean | `false` |  |  | Checking this setting will show an 'Export' button in the app's header. Pressing this button will let the user export the data to a csv file. |
| `enableImport` | boolean | `false` |  |  | Checking this setting will show an 'Import' button in the app's header. Pressing this button will let the user import data from a csv file. |
| `enablePDF` | boolean | `false` |  |  | If selected, a Print button displays in the application's header. Selecting this button lets the user generate a selected PDF Template using the app data. |
| `enableMultiSelect` | boolean | `false` |  |  | Checking this setting will show a 'MultiSelect' button in the app's header and make the grid multiselect, allowing the user to select multiple rows at once. The press event of this button can be customized by clicking the 'Multiple Selection: Settings' button in the Event section. |
| `enableVariant` | boolean | `false` |  |  | Checking this setting will show a 'Variant' button in the app's header and let the user create, enable, edit, and delete filter variants for the app. |
| `hideHeader` | boolean | `false` |  |  | Shows/hides the header. |
| `autoRun` | boolean | `false` |  |  | When 'Run At Start' is checked, the application will be run automatically when the app is first opened, without having to press the 'Run'/'Update' button. *The app will run as part of the attachInit event* |
| `autoRunFocus` | boolean | `false` |  |  | When 'Run At Focus' is checked, the application will be run automatically every time the user navigates back to the app, without having to press the 'Run'/'Update' button. *The app will run as part of the beforeDisplay event* |
| `autoRunInterval` | boolean | `false` |  |  | When 'Run At Interval' is checked, the application will be run automatically at a set interval, without having to press the 'Run'/'Update' button. |
| `autoRunIntervalTime` | text | `60` |  | report.autoRunInterval | Sets the time interval in seconds for the application to run automatically when 'Run At Interval' is selected. The default value is 60 seconds. |
| `searchLabel` | text | `"Search"` |  | hidden in the designer | Search Label |
| `searchPlaceholder` | text | `""` |  | hidden in the designer | Search Placeholder |

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
| `headerText` | text |  |  |  | Sets a title for the grid, displayed under the app's header. This text will be translated if a translation is added. |
| `footerText` | text |  |  |  | Sets a footer text, displayed at the end of the grid. This text will be translated if a translation is added. |
| `noDataText` | text |  |  |  | Sets a text to be displayed if there is no data to be shown in the grid, whether because there's no data in the data set or because there are no matches a search or filter. This text will be translated if a translation is added. |

**Initial Grouping**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `initialGroupField` | field name |  |  |  | Sets a field for the grid to be grouped by when the app is first opened. The field selected here has to be added to the grid for the grouping to work. |
| `initialGroupOrder` | one of |  | `""`, `ASC`, `DESC` |  | If the grid is grouped, this setting determines how the groups are ordered - ascending or descending. |

**Initial Sorting**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `initialSortField` | field name |  |  |  | Sets a field to sort the grid by when the app is first opened. The field selected here has to be added to the grid for the sorting to work. |
| `initialSortOrder` | one of |  | `""`, `ASC`, `DESC` |  | If a field is selected for Initial Sorting, this setting determines the order of the sorting - ascending or descending. |

**Pagination**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `enablePagination` | boolean | `false` |  |  | If 'Enable Pagination' is checked, the grid will be split onto several pages, depending on the number of items in the grid and the number of cards to be displayed on each page. By default, 25 cards will be shown per page. |
| `paginationShowSelection` | boolean | `false` |  |  | Enabling 'Show Items per Page' will display a dropdown in the lower-left corner of the grid, allowing the user to determine how many cards to show on each page. |
| `paginationRows` | text | `25` |  |  | Sets the default number of cards to be shown per page, if the user doesn't change it using the dropdown. The initial default is 25 cards per page. |

**Post-processing**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `postProcessingScript` | server script id |  |  |  | Sets a script to be run every time the app is run/updated, after the data has been fetched. *The table data is set to req.body and passed to the script with the rest of the request object.* |

**Properties**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `showSeparators` | one of | `"All"` | `All`, `Inner`, `None` |  | Sets which separating lines will be displayed: All - separators between the items, including the first and last items; Inner - only between the items; None - no separators. |
| `gridBoxPerRow` | text | `"XL7 L6 M4 S2"` |  |  | Sets how many cards/boxes to display per row. The number can be adjusted depending on screen size, e.g. 'XL7 L6 M4 S2' would adjust it from 7 to 2 as the screen gets narrower. |
| `gridBoxMinWidth` | text | `""` |  |  | Sets the minimum width for the cards/boxes, in pixels, rem, or percentage. |
| `inset` | boolean | `false` |  |  | Adds space around the grid. |
| `enableCompact` | boolean | `false` |  |  | When checked, Compact Mode will make the elements in the grid appear smaller closer together. This setting might be suitable for mouse-operated devices, like desktops. |
| `enableAction1` | boolean | `false` |  |  | Enabling Row Actions will add a button to each card in the grid, which can be used to trigger an event, like the Item Press event. The appearance of this button and the event itself can be customized under the 'Row Action 1' section that appears when this setting is enabled. |
| `enableAction2` | boolean | `false` |  |  | Enabling Row Actions will add a button to each card in the grid, which can be used to trigger an event, like the Item Press event. The appearance of this button and the event itself can be customized under the 'Row Action 2' section that appears when this setting is enabled. |
| `enableAction3` | boolean | `false` |  |  | Enabling Row Actions will add a button to each card in the grid, which can be used to trigger an event, like the Item Press event. The appearance of this button and the event itself can be customized under the 'Row Action 3' section that appears when this setting is enabled. |
| `enableAction4` | boolean | `false` |  |  | Enabling Row Actions will add a button to each card in the grid, which can be used to trigger an event, like the Item Press event. The appearance of this button and the event itself can be customized under the 'Row Action 4' section that appears when this setting is enabled. |
| `enableAction5` | boolean | `false` |  |  | Enabling Row Actions will add a button to each card in the grid, which can be used to trigger an event, like the Item Press event. The appearance of this button and the event itself can be customized under the 'Row Action 5' section that appears when this setting is enabled. |

**Card Action 1**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `action1Text` | text | `""` |  | table.enableAction1 | Sets the text of the button associated with Card Action 1. |
| `action1Icon` | icon (`sap-icon://…`) |  |  | table.enableAction1 | If an icon is selected, it will be displayed on the button associated with Card Action 1. |
| `action1Width` | text |  |  | table.enableAction1 | Sets how much space the button for Card Action 1 will take up. |
| `action1Type` | one of | `"Transparent"` | `Accept`, `Attention`, `Critical`, `Back`, `Default`, `Emphasized`, `Ghost`, `Neutral`, `Reject`, `Transparent`, `Unstyled`, `Up` | table.enableAction1 | Sets the style of the button for Card Action 1. The actual color of the button may depend on the active theme, but will not have any impact on the functionality of the button. |
| `_action1Nav` | navigation object |  |  | table.enableAction1 | Sets up the event to run when the Card Action 1 button is pressed. When pressed, the button can either run a Server Script or open an application or adaptive application. |

**Card Action 1 - Conditional Visibility**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `action1VisibleFieldName` | field name |  |  | table.enableAction1 | The Card Action 1 - Conditional Visibility settings can be used to show/hide the button when certain conditions are met. Sets a field in the table that will be checked for a certain condition. |
| `action1VisibleCondition` | one of |  | `""`, `===`, `!==`, `>=`, `<=`, `>`, `<` | table.enableAction1 | The Card Action 1 - Conditional Visibility settings can be used to show/hide the button when certain conditions are met. Sets the operator that will be used to compare the selected field's value against the selected fixed value or system variable. |
| `action1VisibleFixedValue` | text |  |  | table.enableAction1 | The Card Action 1 - Conditional Visibility settings can be used to show/hide the button when certain conditions are met. Sets a value to be compared against the selected field's value. |
| `action1VisibleSystemValue` | one of |  | `""`, `UserName` | table.enableAction1 | The Card Action 1 - Conditional Visibility settings can be used to show/hide the button when certain conditions are met. Sets a system variable to be compared against the selected field's value. |
| `action1VisibleInverse` | boolean |  |  | table.enableAction1 | The Card Action 1 - Conditional Visibility settings can be used to show/hide the button when certain conditions are met. If this setting is checked, the check will be reversed. |

**Card Action 2**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `action2Text` | text | `""` |  | table.enableAction2 | Sets the text of the button associated with Card Action 2. |
| `action2Icon` | icon (`sap-icon://…`) |  |  | table.enableAction2 | If an icon is selected, it will be displayed on the button associated with Card Action 2. |
| `action2Width` | text |  |  | table.enableAction2 | Sets how much space the button for Card Action 2 will take up. |
| `action2Type` | one of | `"Transparent"` | `Accept`, `Attention`, `Critical`, `Back`, `Default`, `Emphasized`, `Ghost`, `Neutral`, `Reject`, `Transparent`, `Unstyled`, `Up` | table.enableAction2 | Sets the style of the button for Card Action 2. The actual color of the button may depend on the active theme, but will not have any impact on the functionality of the button. |
| `_action2Nav` | navigation object |  |  | table.enableAction2 | Sets up the event to run when the Card Action 2 button is pressed. When pressed, the button can either run a Server Script or open an application or adaptive application. |

**Card Action 2 - Conditional Visibility**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `action2VisibleFieldName` | field name |  |  | table.enableAction2 | The Card Action 2 - Conditional Visibility settings can be used to show/hide the button when certain conditions are met. Sets a field in the table that will be checked for a certain condition. |
| `action2VisibleCondition` | one of |  | `""`, `===`, `!==`, `>=`, `<=`, `>`, `<` | table.enableAction2 | The Card Action 2 - Conditional Visibility settings can be used to show/hide the button when certain conditions are met. Sets the operator that will be used to compare the selected field's value against the selected fixed value or system variable. |
| `action2VisibleFixedValue` | text |  |  | table.enableAction2 | The Card Action 2 - Conditional Visibility settings can be used to show/hide the button when certain conditions are met. Sets a value to be compared against the selected field's value. |
| `action2VisibleSystemValue` | one of |  | `""`, `UserName` | table.enableAction2 | The Card Action 2 - Conditional Visibility settings can be used to show/hide the button when certain conditions are met. Sets a system variable to be compared against the selected field's value. |
| `action2VisibleInverse` | boolean |  |  | table.enableAction2 | The Card Action 2 - Conditional Visibility settings can be used to show/hide the button when certain conditions are met. If this setting is checked, the check will be reversed. |

**Card Action 3**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `action3Text` | text | `""` |  | table.enableAction3 | Sets the text of the button associated with Card Action 3. |
| `action3Icon` | icon (`sap-icon://…`) |  |  | table.enableAction3 | If an icon is selected, it will be displayed on the button associated with Card Action 3. |
| `action3Width` | text |  |  | table.enableAction3 | Sets how much space the button for Card Action 3 will take up. |
| `action3Type` | one of | `"Transparent"` | `Accept`, `Attention`, `Critical`, `Back`, `Default`, `Emphasized`, `Ghost`, `Neutral`, `Reject`, `Transparent`, `Unstyled`, `Up` | table.enableAction3 | Sets the style of the button for Card Action 3. The actual color of the button may depend on the active theme, but will not have any impact on the functionality of the button. |
| `_action3Nav` | navigation object |  |  | table.enableAction3 | Sets up the event to run when the Card Action 3 button is pressed. When pressed, the button can either run a Server Script or open an application or adaptive application. |

**Card Action 3 - Conditional Visibility**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `action3VisibleFieldName` | field name |  |  | table.enableAction3 | The Card Action 3 - Conditional Visibility settings can be used to show/hide the button when certain conditions are met. Sets a field in the table that will be checked for a certain condition. |
| `action3VisibleCondition` | one of |  | `""`, `===`, `!==`, `>=`, `<=`, `>`, `<` | table.enableAction3 | The Card Action 3 - Conditional Visibility settings can be used to show/hide the button when certain conditions are met. Sets the operator that will be used to compare the selected field's value against the selected fixed value or system variable. |
| `action3VisibleFixedValue` | text |  |  | table.enableAction3 | The Card Action 3 - Conditional Visibility settings can be used to show/hide the button when certain conditions are met. Sets a value to be compared against the selected field's value. |
| `action3VisibleSystemValue` | one of |  | `""`, `UserName` | table.enableAction3 | The Card Action 3 - Conditional Visibility settings can be used to show/hide the button when certain conditions are met. Sets a system variable to be compared against the selected field's value. |
| `action3VisibleInverse` | boolean |  |  | table.enableAction3 | The Card Action 3 - Conditional Visibility settings can be used to show/hide the button when certain conditions are met. If this setting is checked, the check will be reversed. |

**Card Action 4**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `action4Text` | text | `""` |  | table.enableAction4 | Sets the text of the button associated with Card Action 4. |
| `action4Icon` | icon (`sap-icon://…`) |  |  | table.enableAction4 | If an icon is selected, it will be displayed on the button associated with Card Action 4. |
| `action4Width` | text |  |  | table.enableAction4 | Sets how much space the button for Card Action 4 will take up. |
| `action4Type` | one of | `"Transparent"` | `Accept`, `Attention`, `Critical`, `Back`, `Default`, `Emphasized`, `Ghost`, `Neutral`, `Reject`, `Transparent`, `Unstyled`, `Up` | table.enableAction4 | Sets the style of the button for Card Action 4. The actual color of the button may depend on the active theme, but will not have any impact on the functionality of the button. |
| `_action4Nav` | navigation object |  |  | table.enableAction4 | Sets up the event to run when the Card Action 4 button is pressed. When pressed, the button can either run a Server Script or open an application or adaptive application. |

**Card Action 4 - Conditional Visibility**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `action4VisibleFieldName` | field name |  |  | table.enableAction4 | The Card Action 4 - Conditional Visibility settings can be used to show/hide the button when certain conditions are met. Sets a field in the table that will be checked for a certain condition. |
| `action4VisibleCondition` | one of |  | `""`, `===`, `!==`, `>=`, `<=`, `>`, `<` | table.enableAction4 | The Card Action 4 - Conditional Visibility settings can be used to show/hide the button when certain conditions are met. Sets the operator that will be used to compare the selected field's value against the selected fixed value or system variable. |
| `action4VisibleFixedValue` | text |  |  | table.enableAction4 | The Card Action 4 - Conditional Visibility settings can be used to show/hide the button when certain conditions are met. Sets a value to be compared against the selected field's value. |
| `action4VisibleSystemValue` | one of |  | `""`, `UserName` | table.enableAction3 | The Card Action 4 - Conditional Visibility settings can be used to show/hide the button when certain conditions are met. Sets a system variable to be compared against the selected field's value. |
| `action4VisibleInverse` | boolean |  |  | table.enableAction4 | The Card Action 4 - Conditional Visibility settings can be used to show/hide the button when certain conditions are met. If this setting is checked, the check will be reversed. |

**Card Action 5**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `action5Text` | text | `""` |  | table.enableAction5 | Sets the text of the button associated with Card Action 5. |
| `action5Icon` | icon (`sap-icon://…`) |  |  | table.enableAction5 | If an icon is selected, it will be displayed on the button associated with Card Action 5. |
| `action5Width` | text |  |  | table.enableAction5 | Sets how much space the button for Card Action 5 will take up. |
| `action5Type` | one of | `"Transparent"` | `Accept`, `Attention`, `Critical`, `Back`, `Default`, `Emphasized`, `Ghost`, `Neutral`, `Reject`, `Transparent`, `Unstyled`, `Up` | table.enableAction5 | Sets the style of the button for Card Action 5. The actual color of the button may depend on the active theme, but will not have any impact on the functionality of the button. |
| `_action5Nav` | navigation object |  |  | table.enableAction5 | Sets up the event to run when the Card Action 5 button is pressed. When pressed, the button can either run a Server Script or open an application or adaptive application. |

**Card Action 5 - Conditional Visibility**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `action5VisibleFieldName` | field name |  |  | table.enableAction5 | The Card Action 5 - Conditional Visibility settings can be used to show/hide the button when certain conditions are met. Sets a field in the table that will be checked for a certain condition. |
| `action5VisibleCondition` | one of |  | `""`, `===`, `!==`, `>=`, `<=`, `>`, `<` | table.enableAction5 | The Card Action 5 - Conditional Visibility settings can be used to show/hide the button when certain conditions are met. Sets the operator that will be used to compare the selected field's value against the selected fixed value or system variable. |
| `action5VisibleFixedValue` | text |  |  | table.enableAction5 | The Card Action 5 - Conditional Visibility settings can be used to show/hide the button when certain conditions are met. Sets a value to be compared against the selected field's value. |
| `action5VisibleSystemValue` | one of |  | `""`, `UserName` | table.enableAction5 | The Card Action 5 - Conditional Visibility settings can be used to show/hide the button when certain conditions are met. Sets a system variable to be compared against the selected field's value. |
| `action5VisibleInverse` | boolean |  |  | table.enableAction5 | The Card Action 5 - Conditional Visibility settings can be used to show/hide the button when certain conditions are met. If this setting is checked, the check will be reversed. |

## `settings.fieldsSel[]` (one entry per field)

Every entry also has `name` (a field catalog name) and `fieldPos` (1, 2, 3 … display order).

**General**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `text` | text |  |  |  | Sets the name displayed above the filter input. |
| `type` | one of |  | `Input`, `CheckBox`, `DateRange`, `MultiSelect`, `MultiSelectLookup`, `MultiSelectScript`, `RangeSlider`, `SingleSelect`, `SingleSelectLookup`, `SingleSelectScript`, `Switch`, `ValueHelp` |  | Sets the type of filter input. |
| `switchOnText` | text |  |  | type === "Switch" | Sets the text for the true/positive/'On' state of the switch component. The default text is 'On'. |
| `switchOffText` | text |  |  | type === "Switch" | Sets the text for the false/negative/'Off' state of the switch component. The default text is 'Off'. |
| `rangeMin` | text |  |  | type === "RangeSlider" | Sets the minimum value for the range slider. |
| `rangeMax` | text |  |  | type === "RangeSlider" | Sets the maximum value for the range slider. |
| `rangeStep` | text |  |  | type === "RangeSlider" | The step defines the amount of units to change the slider when adjusting by drag and drop (e.g. min = 0, max = 10, step = 5 would result in possible selection of the values 0, 5, 10). The step must be positive, if a negative number is provided, the default value will be used instead. |
| `enableRangeTickmarks` | boolean | `false` |  | type === "RangeSlider" | If Enable Tickmarks is selected, each step on the range slider will be marked with a tick. |

**Data Source**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `lookupTable` | table name |  |  | type === "MultiSelectLookup" or type === "SingleSelectLookup" | Sets the table to be used as the data source for the filter field. |
| `lookupFieldKey` | lookup-table field name |  |  | type === "MultiSelectLookup" or type === "SingleSelectLookup" | Sets the field to be used as the key for the filter. It is the value of this field that the filter will look for in the grid data. |
| `lookupFieldText` | lookup-table field name |  |  | type === "MultiSelectLookup" or type === "SingleSelectLookup" | This is the value that will be displayed in the filter's input. It will not have an impact on the actual filtering, but could be used to make the filtering more user friendly. |
| `lookupFieldAdditional` | lookup-table field name |  |  | type === "MultiSelectLookup" or type === "SingleSelectLookup" | An additional field can be displayed for each list item, like a description or additional important information. |
| `lookupShowOnlyText` | boolean |  |  | type === "MultiSelectLookup" or type === "SingleSelectLookup" | If checked, the field selected as Key Field will not be visible in the list. It won't have any impact on the functionality, it is only a visual change. |

**ValueHelp Source**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `valueRequestKey` | text |  |  | type === "ValueHelp" | Sets the field to be returned to the filter input when the user selects an item from the value help. |
| `_navigation` | navigation object |  |  | type === "ValueHelp" | Sets the data that will be shown in the value help. When the user clicks the input field's value help, it can open an app, another adaptive app, e.g. a list, or a dialog with data from a Server Script. |

**Data Source**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `scriptSelect` | server script id |  |  | type === "MultiSelectScript" or type === "SingleSelectScript" | Sets a script to return data that will fill the filter dropdown with items. *In the Server Script, set result.data to an array of objects with both 'key' and 'text' keys. |

**Default Value**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `default` | text |  |  |  | Sets a default value by which to filter the grid when it is first opened. |
| `sysvarValue` | one of |  | `""`, `Username`, `TOMORROW`, `TODAY`, `YESTERDAY`, `LAST_7`, `LAST_30`, `LAST_60`, `LAST_90`, `LAST_180`, `NEXT_30`, `NEXT_60`, `NEXT_7`, `NEXT_90`, `NEXT_180` |  | Sets a default value based on a system variable, like the current user's username or the current data, by which to filter the grid when it is first opened. |
| `scriptValue` | server script id |  |  |  | Sets a script that returns a value to be added to the filter field as a default value on start. *The Server Script should set result.data to be a string.* |

**Properties**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `selEqual` | boolean |  |  | type === "Input" or ! type | If 'Strict Search' is enabled, the filter will only show exact matches, not partial matches. If the filter key is a UUID, this setting should be checked to get the correct match. |
| `required` | boolean | `false` |  |  | If the filter is set to required, the list will show 'No data' if there is no text or selection in the filter. |
| `visible` | boolean | `true` |  |  | Unchecking this setting will hide the filter input from the header. It will still be functional and apply any default filters on start, for instance. |

## `settings.fieldsRun[]` (one entry per field)

Every entry also has `name` (a field catalog name) and `fieldPos` (1, 2, 3 … display order).

**General**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `type` | one of |  | `""`, `Icon`, `Status`, `Title`, `SubTitle`, `Description`, `Image` |  | Sets the type of field to display the data on the card. |
| `imageMode` | one of |  | `Inline`, `Background` | type === "Image" | Sets how the image will be displayed on the card. The image can be displayed as a background image of the card or Inline to occupy the center of the card. |

**Layout**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `statusInverted` | boolean |  |  | type === "Status" | Sets whether the background color, instead of the field's text, reflects the set state. |

**Layout**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `textType` | one of |  | `""`, `Blockquote`, `Deleted`, `Emphasized`, `Heading1`, `Heading2`, `Heading3`, `Heading4`, `Heading5`, `Heading6`, `Inserted`, `Paragraph`, `Strong` | type === "Title" or type === "SubTitle" or type === "Description" | Determines how the text will be displayed, e.g. as a block quote, a paragraph, or a header. |
| `textFontSize` | one of |  | `""`, `xx-large`, `x-large`, `large`, `medium`, `small`, `x-small` | type === "Title" or type === "SubTitle" or type === "Description" | Sets the font size of the text, ranging from FontSize1 as the largest, to FontSize6 as the smallest. |
| `textColor` | one of |  | `""`, `Dark`, `Body`, `Danger`, `Info`, `Muted`, `Primary`, `Secondary`, `Success`, `Warning` | type === "Title" or type === "SubTitle" or type === "Description" | Sets the color of the text. |

**Event**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `_navigation` | navigation object |  |  | type === "Link" or type === "Button" | Press |

**Value**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `valueType` | one of |  | `""`, `Fixed`, `Lookup`, `Rule`, `Script` | type !== "Icon" | Sets the value to be displayed on the card. Source Value will display the actual value from the data set, as it is. |
| `valueFixed` | text |  |  | type !== "Icon" and valueType === "Fixed" | Sets a static value which will be the same for all the cards in the grid. |
| `valueLookup` | lookup object |  |  | type !== "Icon" and valueType === "Lookup" | Select a reference table to get related data using the field's value. E.g., using a customer ID from the list item to fetch the corresponding customer name from the Customers table. |
| `valueRule` | rule id |  |  | type !== "Icon" and valueType === "Rule" | Select a Rule Engine to return another value depending on the field's value. E.g., the Rule Engine can return 'Completed' if the field 'completed''s value is 'true', and 'Not Completed' if it is 'false'. |
| `formatter` | one of |  | `""`, `date00`, `date01`, `date02`, `date03`, `date04`, `date05`, `sapdate01`, `sapdate02`, `zero`, `uppercase`, `lowercase`, `number00`, `number01`, `number02`, `number03`, `number04`, `number05`, `number06`, `number07` | not (type === "Icon" or type === "Image") | Formats the value, e.g., setting a text to all uppercase or showing a date in relative terms. |

**Data Source**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `lookupTable` | table name |  |  | type === "MultiSelectLookup" or type === "SingleSelectLookup" | Sets the table to be used as the data source for the field. |
| `lookupFieldKey` | lookup-table field name |  |  | type === "MultiSelectLookup" or type === "SingleSelectLookup" | Key Field |
| `lookupFieldText` | lookup-table field name |  |  | type === "MultiSelectLookup" or type === "SingleSelectLookup" | Text Field |
| `lookupFieldAdditional` | lookup-table field name |  |  | type === "MultiSelectLookup" or type === "SingleSelectLookup" | Additional Text Field |
| `lookupShowOnlyText` | boolean |  |  | type === "MultiSelectLookup" or type === "SingleSelectLookup" | Hide Key Field |

**Data Source**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `scriptSelect` | server script id |  |  | type === "MultiSelectScript" or type === "SingleSelectScript" | Server Script |

**Value: Icon**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `statusIconType` | one of |  | `""`, `Binding`, `Fixed`, `Lookup`, `Rule`, `Script` | type === "Icon" or type === "Status" | Sets the source for the icon. Source Value will use the actual value from the data set as the icon source Fixed Value will let you select an icon from the Icon Explorer, which will be the same for the icons on all the cards in the grid. |
| `statusIconFixed` | icon (`sap-icon://…`) |  |  | (type === "Icon" or type === "Status" ) and statusIconType === "Fixed" | Sets a static icon from the Icon Explorer. |
| `statusIconRule` | rule id |  |  | (type === "Icon" or type === "Status") and statusIconType === "Rule" | Select a Rule Engine to return an icon source depending on the field's value. |
| `statusIconBinding` | field name |  |  | (type === "Icon" or type === "Status") and statusIconType === "Binding" | Binds the icon source to another field's value |
| `statusIconLookup` | lookup object |  |  | (type === "Icon" or type === "Status") and statusIconType === "Lookup" | Select a reference table to get related data using the field's value. E.g., using a customer ID from the list item to fetch a corresponding icon source from the Customers table. |

**Value: State**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `statusStateType` | one of |  | `""`, `Binding`, `Fixed`, `Lookup`, `Rule`, `Script` | type === "Status" | Determines how to get the value for the object status' state, which will determine the color of the field text or background. Binding will use another selected field's value as the state. |
| `statusStateFixed` | one of |  | `""`, `None`, `Error`, `Warning`, `Success`, `Information`, `Indication01`, `Indication02`, `Indication03`, `Indication04`, `Indication05`, `Indication06`, `Indication07`, `Indication08` | type === "Status" and statusStateType === "Fixed" | Sets a static value to be the state, selected from a dropdown list. The actual colors of the states might depend on the theme. |
| `statusStateRule` | rule id |  |  | type === "Status" and statusStateType === "Rule" | Select a Rule Engine to return a state depending on the field's value. E.g., if the value is 'Completed', the state 'Success' might be returned, turning the object status text green. |
| `statusStateBinding` | field name |  |  | type === "Status" and statusStateType === "Binding" | Binds the state to this field's value. |
| `statusStateLookup` | lookup object |  |  | type === "Status" and statusStateType === "Lookup" | Select a reference table to get related data using the field's value. E.g., using a customer ID from the list item to fetch a corresponding state value from the Customers table. |

