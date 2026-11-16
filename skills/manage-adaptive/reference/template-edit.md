# Template `neptunedxp_adaptive_edit`: Form

Allows you to create and update data in a form-like display. This template is useful in combination with an adaptive application made with the List / Table template as a way to create, view, and edit entries in the dataset.

In this template: `fieldsSel` = the **Form** fields; `fieldsRun` = the **Field Mapping** fields.

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
| `actionButtonLeft` | boolean | `false` |  |  | Moves the action buttons (e.g., Save, Delete, Close) to the left in the header, under the title. |

**Dynamic Title**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `dynamicTitle` | field name |  |  |  | Sets a selected value from the form data to be the app's title. The title will then change depending on the data passed to the application, e.g. when opening the app from a list or grid app. |
| `dynamicSubTitle` | field name |  |  |  | Sets a selected value from the form data to be the app's subtitle. The subtitle will then change depending on the data passed to the application, e.g. when opening the app from a list or grid app. |

**Texts**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `textUnique` | text |  |  |  | Sets a text to be displayed when saving the form if one or more fields in the form violates a unique constraint. This text will be translated if a translation is added. |

**Events**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `_pdfPrint` | PDF object |  |  | report.enablePDF | Sets up the PDF Template to generate with the application data when the Print button is pressed. The settings also offer the option of automatically saving the generated PDF to the PDF Archive. |

**Close Button**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `iconButtonClose` | icon (`sap-icon://…`) | `""` |  | report.enableClose | Sets an icon for the 'Close' button in the header. |
| `textButtonClose` | text | `"Close"` |  | report.enableClose | Sets the text for the 'Close' button in the header. This text will be translated if a translation is added. |
| `typeButtonClose` | one of | `"Transparent"` | `Accept`, `Attention`, `Critical`, `Back`, `Default`, `Emphasized`, `Ghost`, `Neutral`, `Reject`, `Transparent`, `Unstyled`, `Up` | report.enableClose | Sets the visual style of the 'Close' button in the header, but has no impact on the functionality of the button. The colors of the button styles will depend on the theme applied. |

**Save Button**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `iconButtonSave` | icon (`sap-icon://…`) | `""` |  | report.enableSave | Sets an icon for the 'Save' button in the header. |
| `textButtonSave` | text | `"Save"` |  | report.enableSave | Sets the text for the 'Save' button in the header. This text will be translated if a translation is added. |
| `textToastSave` | text | `"Saved"` |  | report.enableSave | Sets the text to be displayed in a message toast when the data in the form is successfully saved. This text will be translated if a translation is added. |
| `typeButtonSave` | one of | `"Emphasized"` | `Accept`, `Attention`, `Critical`, `Back`, `Default`, `Emphasized`, `Ghost`, `Neutral`, `Reject`, `Transparent`, `Unstyled`, `Up` | report.enableSave | Sets the visual style of the 'Save' button in the header, but has no impact on the functionality of the button. The colors of the button styles will depend on the theme applied. |
| `confirmationCheckCreate` | boolean | `false` |  | report.enableSave | When checked, a confirmation dialog will appear when saving a new form entry, asking the user to confirm the action. |
| `confirmationCheckUpdate` | boolean | `false` |  | report.enableSave | When checked, a confirmation dialog will appear when saving an existing form entry, i.e., updating the entry data, asking the user to confirm the action. |
| `preSaveScript` | server script id |  |  | report.enableSave | Select a script to run before the data is saved. This allows you to apply custom validation before saving an entry. |

**Delete Button**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `iconButtonDelete` | icon (`sap-icon://…`) | `""` |  | report.enableDelete | Sets an icon for the 'Delete' button in the header. |
| `textButtonDelete` | text | `"Delete"` |  | report.enableDelete | Sets the text for the 'Delete' button in the header. This text will be translated if a translation is added. |
| `textToastDelete` | text | `"Deleted"` |  | report.enableDelete | Sets the text to be displayed in a message toast when the data in the form is successfully deleted. This text will be translated if a translation is added. |
| `typeButtonDelete` | one of | `"Reject"` | `Accept`, `Attention`, `Critical`, `Back`, `Default`, `Emphasized`, `Ghost`, `Neutral`, `Reject`, `Transparent`, `Unstyled`, `Up` | report.enableDelete | Sets the visual style of the 'Delete' button in the header, but has no impact on the functionality of the button. The colors of the button styles will depend on the theme applied. |

**Edit Button**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `iconButtonEdit` | icon (`sap-icon://…`) | `""` |  | {appData>/settings/properties/report/enableEditDisplay | Sets an icon for the 'Edit' button in the header. |
| `textButtonEdit` | text | `"Edit"` |  | {appData>/settings/properties/report/enableEditDisplay | Sets the text for the 'Edit' button in the header. This text will be translated if a translation is added. |
| `typeButtonEdit` | one of | `"Emphasized"` | `Accept`, `Attention`, `Critical`, `Back`, `Default`, `Emphasized`, `Ghost`, `Neutral`, `Reject`, `Transparent`, `Unstyled`, `Up` | {appData>/settings/properties/report/enableEditDisplay | Sets the visual style of the 'Edit' button in the header, but has no impact on the functionality of the button. The colors of the button styles will depend on the theme applied. |

**Display Button**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `iconButtonDisplay` | icon (`sap-icon://…`) | `""` |  | {appData>/settings/properties/report/enableEditDisplay | Sets an icon for the 'Display' button in the header. This button will be only visible when the 'Edit' button is pressed. |
| `textButtonDisplay` | text | `"Display"` |  | {appData>/settings/properties/report/enableEditDisplay | Sets the text for the 'Display' button in the header. This button will be only visible when the 'Edit' button is pressed. |
| `typeButtonDisplay` | one of | `"Emphasized"` | `Accept`, `Attention`, `Critical`, `Back`, `Default`, `Emphasized`, `Ghost`, `Neutral`, `Reject`, `Transparent`, `Unstyled`, `Up` | {appData>/settings/properties/report/enableEditDisplay | Sets the visual style of the 'Display' button in the header, but has no impact on the functionality of the button. The colors of the button styles will depend on the theme applied. |

**Attachment Button**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `iconButtonAttachment` | icon (`sap-icon://…`) | `""` |  | report.enableAttachment | Sets an icon for the 'Add Attachment' button in the Attachment tab. |
| `textButtonAttachment` | text | `"Add Attachment"` |  | report.enableAttachment | Sets the text for the 'Add Attachment' button in the Attachment tab0Text. This text will be translated if a translation is added. |
| `typeButtonAttachment` | one of | `"Transparent"` | `Accept`, `Attention`, `Critical`, `Back`, `Default`, `Emphasized`, `Ghost`, `Neutral`, `Reject`, `Transparent`, `Unstyled`, `Up` | report.enableAttachment | Sets the visual style of the 'Add Attachment' button in the Attachment tab, but has no impact on the functionality of the button. The colors of the button styles will depend on the theme applied. |

**Print Button**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `iconButtonPrint` | icon (`sap-icon://…`) | `"sap-icon://print"` |  | report.enablePDF | Sets an icon for the 'Print' button in the header. |
| `textButtonPrint` | text | `""` |  | report.enablePDF | Sets the text for the 'Print' button in the header. This text will be translated if a translation is added. |
| `typeButtonPrint` | one of | `"Transparent"` | `Accept`, `Attention`, `Critical`, `Back`, `Default`, `Emphasized`, `Ghost`, `Neutral`, `Reject`, `Transparent`, `Unstyled`, `Up` | report.enablePDF | Sets the visual style of the 'Print' button in the header, but has no impact on the functionality of the button. The colors of the button styles will depend on the theme applied. |

**Main Tab**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `tab0Text` | text | `"General"` |  | report.enableTab1 or report.enableTab2 or report.enableTab3 or report.enableTab4 or report.enableTab5 | Sets the title for the General tab. This text will be translated if a translation is added. |
| `tab0Icon` | icon (`sap-icon://…`) |  |  | report.enableTab1 or report.enableTab2 or report.enableTab3 or report.enableTab4 or report.enableTab5 | Sets the icon for the General tab. |

**Attachment Tab**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `tabAText` | text | `"Attachment"` |  | report.enableAttachment | Sets the title for the Attachment tab. This text will be translated if a translation is added. |
| `tabAIcon` | icon (`sap-icon://…`) |  |  | report.enableAttachment | Sets the icon for the Attachment tab. |

**Tab 1**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `tab1Text` | text | `"Tab 1"` |  | report.enableTab1 | Sets the title for Tab 1. This text will be translated if a translation is added. |
| `tab1Icon` | icon (`sap-icon://…`) |  |  | report.enableTab1 | Sets the icon for Tab 1. |
| `_tab1Nav` | navigation object |  |  | report.enableTab1 | Assign an app or adaptive application to open in Tab 1. |

**Tab 2**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `tab2Text` | text | `"Tab 2"` |  | report.enableTab2 | Sets the title for Tab 2. This text will be translated if a translation is added. |
| `tab2Icon` | icon (`sap-icon://…`) |  |  | report.enableTab2 | Sets the icon for Tab 2. |
| `_tab2Nav` | navigation object |  |  | report.enableTab2 | Assign an app or adaptive application to open in Tab 2. |

**Tab 3**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `tab3Text` | text | `"Tab 3"` |  | report.enableTab3 | Sets the title for Tab 3. This text will be translated if a translation is added. |
| `tab3Icon` | icon (`sap-icon://…`) |  |  | report.enableTab3 | Sets the icon for Tab 3. |
| `_tab3Nav` | navigation object |  |  | report.enableTab3 | Assign an app or adaptive application to open in Tab 3. |

**Tab 4**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `tab4Text` | text | `"Tab 4"` |  | report.enableTab4 | Sets the title for Tab 4. This text will be translated if a translation is added. |
| `tab4Icon` | icon (`sap-icon://…`) |  |  | report.enableTab4 | Sets the icon for Tab 4. |
| `_tab4Nav` | navigation object |  |  | report.enableTab4 | Assign an app or adaptive application to open in Tab 4. |

**Tab 5**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `tab5Text` | text | `"Tab 5"` |  | report.enableTab5 | Sets the title for Tab 5. This text will be translated if a translation is added. |
| `tab5Icon` | icon (`sap-icon://…`) |  |  | report.enableTab5 | Sets the icon for Tab 5. |
| `_tab5Nav` | navigation object |  |  | report.enableTab5 | Assign an app or adaptive application to open in Tab 5. |

**Properties**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `enableClose` | boolean | `true` |  |  | Checking this setting will show a 'Close' button in the app's header. If this app is opened from another adaptive app, pressing this button will close the app. |
| `enableSave` | boolean | `true` |  |  | Checking this setting will show a 'Save' button in the app's header. When pressed, this button will save any changes to the form data. |
| `enableDelete` | boolean | `false` |  |  | Checking this setting will show a 'Delete' button in the app's header. If this app is opened from another adaptive app, pressing this button will delete the form entry opened. |
| `enableEditDisplay` | boolean | `false` |  |  | Checking this setting will show an 'Edit' button in the app's header and all editable fields in the list will be set to display. |
| `enableAttachment` | boolean | `false` |  |  | Checking this setting will show an 'Attachment' tab, where users can upload attachments to the form entry. The text and icon for this tab and the 'Add Attachment' button in the tab can be customized under the 'Attachment Tab' and 'Attachment Button' sections, respectively. |
| `enablePDF` | boolean | `false` |  |  | If selected, a Print button displays in the application's header. Selecting this button lets the user generate a selected PDF Template using the app data. |
| `enableTab1` | boolean | `false` |  |  | Checking this setting will show a new tab, Tab 1. The text, icon, and which app to open in the tab can be customized under the Tab 1 section of the settings. |
| `enableTab2` | boolean | `false` |  |  | Checking this setting will show a new tab, Tab 2. The text, icon, and which app to open in the tab can be customized under the Tab 2 section of the settings. |
| `enableTab3` | boolean | `false` |  |  | Checking this setting will show a new tab, Tab 3. The text, icon, and which app to open in the tab can be customized under the Tab 3 section of the settings. |
| `enableTab4` | boolean | `false` |  |  | Checking this setting will show a new tab, Tab 4. The text, icon, and which app to open in the tab can be customized under the Tab 4 section of the settings. |
| `enableTab5` | boolean | `false` |  |  | Checking this setting will show a new tab, Tab 5. The text, icon, and which app to open in the tab can be customized under the Tab 5 section of the settings. |
| `enableUppercase` | boolean | `false` |  | conditional (see the designer) | When checked, the title on the tabs, including the 'General' and 'Attachment' tabs, will be set to all uppercase. |
| `enablePadding` | boolean | `true` |  | conditional (see the designer) | When checked, space will be added around the content of each tab. |
| `titleConfirmCreate` | text (not shown in the designer) | `"Create entry"` |  | hidden in the designer |  |
| `textConfirmCreate` | text (not shown in the designer) | `"Are you sure you want to create this entry?"` |  | hidden in the designer |  |
| `titleConfirmUpdate` | text (not shown in the designer) | `"Update entry"` |  | hidden in the designer |  |
| `textConfirmUpdate` | text (not shown in the designer) | `"Are you sure you want to update this entry?"` |  | hidden in the designer |  |
| `textConfirmDelete` | text (not shown in the designer) | `"Do you want to delete this entry? "` |  | hidden in the designer |  |
| `titleConfirmDelete` | text (not shown in the designer) | `"Delete "` |  | hidden in the designer |  |
| `requiredFieldsToast` | text (not shown in the designer) | `"Please fill in all the required fields"` |  | hidden in the designer |  |

## `settings.properties.form`

**Layout**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `formLayout` | one of |  | `""`, `ColumnLayout`, `GridLayout`, `ResponsiveGridLayout`, `ResponsiveLayout` |  | Sets the layout of the form. If no layout is selected, 'Responsive Grid Layout' will be the default layout. |
| `columnsL` | one of |  | `""`, `1`, `2`, `3`, `4` |  | Determines how many columns the form will span depending on the screen width. The default is 2. |
| `columnsM` | one of |  | `""`, `1`, `2`, `3`, `4` |  | Determines how many columns the form will span depending on the screen width. The default is 1. |
| `labelSpanL` | one of |  | `""`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10`, `11`, `12` |  | Sets the default span for the form labels on large screens. |
| `labelSpanM` | one of |  | `""`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10`, `11`, `12` |  | Sets the default span for the form labels on medium screens. |
| `titleLevel` | one of |  | `""`, `H1`, `H2`, `H3`, `H4`, `H5`, `H6` |  | Sets the semantic level of the form title, from H1, which is the highest level, to H&, which is the lowest. This information is e.g. used by assistive technologies like screenreaders to create a hierarchical site map for faster navigation. |

**Properties**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `enableCompact` | boolean | `false` |  |  | When checked, Compact Mode will make the elements in the form appear smaller and closer together. This setting might be suitable for mouse-operated devices, like desktops. |
| `enableCentered` | boolean | `true` |  |  | When checked, the form will be contained to the center portion of the screen and not stretch to fill the whole screen. |

**Read-Only - Requirement 1**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `field1ReadOnly` | field name |  |  |  | The form can be set to be 'read only' depending on the values of certain fields. If both Read Only - Requirement 1 and 2 are set, they will be considered as 'OR' conditions, and the form will be set to 'read only' as long as one of the conditions are fulfilled. |
| `operator1ReadOnly` | one of |  | `""`, `===`, `!==`, `>=`, `<=`, `>`, `<` |  | The form can be set to be 'read only' depending on the values of certain fields. Sets the operator that will be used to compare the selected field's value against the selected fixed value or system variable. |
| `value1ReadOnly` | text |  |  |  | The form can be set to 'read only' depending on the values of certain fields. Sets a value to be compared against the selected field's value. |
| `sysvar1ReadOnly` | one of |  | `""`, `UserName` |  | The form can be set to 'read only' depending on the values of certain fields. Sets a system variable to be compared against the selected field's value. |
| `script1ReadOnly` | server script id |  |  |  | Select a script to determine whether or not the form should be editable. If a script is selected, the result from it will override any settings set for Field/Operator/Fixed Value/System Variable. |

**Read-Only - Requirement 2**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `field2ReadOnly` | field name |  |  |  | The form can be set to be 'read only' depending on the values of certain fields. If both Read Only - Requirement 1 and 2 are set, they will be considered as 'OR' conditions, and the form will be set to 'read only' as long as one of the conditions are fulfilled. |
| `operator2ReadOnly` | one of |  | `""`, `===`, `!==`, `>=`, `<=`, `>`, `<` |  | The form can be set to be 'read only' depending on the values of certain fields. Sets the operator that will be used to compare the selected field's value against the selected fixed value or system variable. |
| `value2ReadOnly` | text |  |  |  | The form can be set to 'read only' depending on the values of certain fields. Sets a value to be compared against the selected field's value. |
| `sysvar2ReadOnly` | one of |  | `""`, `UserName` |  | The form can be set to 'read only' depending on the values of certain fields. Sets a system variable to be compared against the selected field's value. |
| `script2ReadOnly` | server script id |  |  |  | Select a script to determine whether or not the form should be editable. If a script is selected, the result from it will override any settings set for Field/Operator/Fixed Value/System Variable. |

## `settings.fieldsSel[]` (one entry per field)

Every entry also has `name` (a field catalog name) and `fieldPos` (1, 2, 3 … display order).

**General**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `text` | text |  |  |  | Sets the label of the field in the form. |
| `type` | one of |  | `Input`, `CheckBox`, `ColorPicker`, `DatePicker`, `DateTimePicker`, `Display`, `Editor`, `Image`, `MultiSelect`, `MultiSelectLookup`, `MultiSelectScript`, `SingleSelect`, `SingleSelectLookup`, `SingleSelectScript`, `Switch`, `StepInput`, `Text`, `TextArea`, `ValueHelp`, `JSON`, `SignaturePad` |  | Sets the type of field to display and/or edit the data in the form. |
| `switchOnText` | text |  |  | type === "Switch" | Sets the text for the true/positive/'On' state of the switch component. The default text is 'On'. |
| `switchOffText` | text |  |  | type === "Switch" | Sets the text for the false/negative/'Off' state of the switch component. The default text is 'Off'. |
| `valueHelpOnly` | boolean | `false` |  | ["ValueHelp", "ColorPicker"].includes(type) | If checked, the user can't type in the field directly, but has to select the value through the value help. |
| `inputType` | one of |  | `Email`, `Number`, `Password`, `Tel`, `""`, `Url` | !type or type === "Input" | Sets the formatting of the input field. E.g., setting it to 'password' will display the value as a number of dots instead of the actual characters. |
| `placeholder` | text |  |  | conditional (see the designer) | Sets a text to be displayed in the field while there is no value in the field. |
| `description` | text |  |  |  | Sets a descriptive text to be displayed under the field in the form. |
| `hideImageInput` | boolean |  |  | type === "Image" | When checked, the input field for the image address will be hidden from the form. If there is a value in this field when the form is opened from another app, the image will still be displayed, without showing the image address. |
| `imageHeight` | text |  |  | type === "Image" | Sets the height of the image, in pixels, with the default height of 200px. The width will adjust accordingly to show the image in its correct aspect ratio. |
| `inputFormatter` | one of | `"Input"` | `""`, `condense`, `uppercase`, `lowercase` | !type or type === "Input" | Formats the text in the input field, e.g., to be all uppercase or remove all spaces between words. |
| `formatter` | one of |  | `""`, `date00`, `date01`, `date02`, `date03`, `date04`, `date05`, `sapdate01`, `sapdate02`, `zero`, `uppercase`, `lowercase`, `number00`, `number01`, `number02`, `number03`, `number04`, `number05`, `number06`, `number07`, `numberCustom`, `file` | type === "Display" | Formats the value, e.g. setting a text to all uppercase or showing a date in relative terms. |
| `formatNumberDecimals` | text |  |  | formatter === "numberCustom" | Sets the number of decimals to show. |
| `formatNumberSeparator` | one of |  | `browserDefault`, `comma`, `point` | formatter === "numberCustom" | Sets the decimal separator, which can be a comma, a point, or whichever one is the default in the user's browser. |
| `textAreaRows` | text |  |  | type === "TextArea" | Sets the height of the text area by determining how many rows to be displayed. |
| `editorHeight` | text |  |  | type === "Editor" | Sets the height of the editor in pixels or percentage, with a default height of 400px. |
| `signaturePadWidth` | text |  |  | type === "SignaturePad" | Sets the width of the signature pad, in pixels, with the default width of 500px. |
| `signaturePadHeight` | text |  |  | type === "SignaturePad" | Sets the height of the signature pad, in pixels, with the default height of 250px. |
| `dateTimePickerMinutesStep` | text |  |  | type === "DateTimePicker" | Sets the minutes step of the clock in the time picker. If the step is less than 1, it will be automatically converted back to 1. |
| `dateTimePickerSecondsStep` | text |  |  | type === "DateTimePicker" | Sets the seconds step of the clock in the time picker. If the step is less than 1, it will be automatically converted back to 1. |
| `dateTimePickerFormat` | text |  |  | ["DateTimePicker", "DatePicker"].includes(type) | Sets the date format. E.g., 'hh:mm dd/MM/YY' for hour:minutes day/month/year. |
| `stepInputMin` | text |  |  | type === "StepInput" | Sets a value to be the minimum for the step value. E.g., setting '5' will make the input field start at 5 and will not let it go lower than this. |
| `stepInputMax` | text |  |  | type === "StepInput" | Sets a value to be the maximum for the step value. E.g., setting '100' will make the input field stop at 100 and will not let it go higher than this. |
| `stepInputStep` | text |  |  | type === "StepInput" | Sets a value as the input's step value. E.g., setting '2' will increase/decrease the value with 2 every time the plus or minus is pressed. |
| `stepInputTextAlign` | one of |  | `""`, `Begin`, `Center`, `End`, `Initial`, `Left`, `Right` | type === "StepInput" | Sets where in the step input field the text should be placed. |

**Mask**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `mask` | text |  |  | ["Input","TextArea","ValueHelp"].includes(type) | Sets a mask for the input which will require the value to be in a specific format. E.g., ' * * *- * * *- * * *' to make the value be split in sections of three characters. |
| `enableMaskAdvanced` | boolean |  |  | ["Input","TextArea","ValueHelp"].includes(type) | If Mask Rule is enabled, advanced settings will be available, like determining the mask placeholder character and which characters that should be allowed. |
| `maskCharacter` | text |  |  | ["Input","TextArea","ValueHelp"].includes(type) and enableMaskAdvanced | Sets which character should be considered the placeholder character. The default is *. |
| `maskRule` | one of |  | `[a-zA-Z0-9]`, `[0-9]`, `[a-zA-Z]`, `[A-Z]`, `[a-z]`, `custom` | ["Input","TextArea","ValueHelp"].includes(type) and enableMaskAdvanced | Sets which characters the user is allowed to enter in place of the placeholder. |
| `maskCustomRegex` | text |  |  | ["Input","TextArea","ValueHelp"].includes(type) and enableMaskAdvanced and maskRule === "custom" | Create a custom regex to allow any specific combination of characters in place of the placeholder. |

**ValueHelp Source**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `valueRequestKey` | text |  |  | type === "ValueHelp" | Sets the field to be returned to the filter input when the user selects an item from the value help. |
| `_navigation` | navigation object |  |  | type === "ValueHelp" | Sets the data that will be shown in the value help. When the user clicks the input field's value help, it can open an app, another adaptive app, e.g. a list, or a dialog with data from a Server Script. |

**Data**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `dynamicDataItems` | items array | placeholder – do not send |  | ["SingleSelect", "MultiSelect"].includes(type) | Fixed choices for a select. **Required for a MultiSelect** (without it the form stops building the following fields); connector `items` are not used by form selects. |
| `dataShowOnlyText` | boolean |  |  | ["SingleSelect", "MultiSelect"].includes(type) | If checked, the field selected as Key Field will not be visible in the list. It won't have any impact on the functionality, it is only a visual change. |

**Data Source**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `scriptSelect` | server script id |  |  | type === "MultiSelectScript" or type === "SingleSelectScript" | Sets a script to return data that will fill the dropdown with items. *In the Server Script, set result.data to an array of objects with both 'key' and 'text' keys. |
| `lookupFieldGrouping2` | boolean |  |  | type === "MultiSelectScript" or type === "SingleSelectScript" | If checked, the dropdown list will be grouped by the field set as the Additional Field, using its value as a header for each group. |
| `scriptShowOnlyText` | boolean |  |  | ["SingleSelectScript", "MultiSelectScript"].includes(type) | If checked, the field selected as Key Field will not be visible in the list. It won't have any impact on the functionality, it is only a visual change. |

**Data Source**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `lookupTable` | table name |  |  | type === "MultiSelectLookup" or type === "SingleSelectLookup" | Sets the table to be used as the data source for the field. |
| `lookupFieldKey` | lookup-table field name |  |  | type === "MultiSelectLookup" or type === "SingleSelectLookup" | Sets the field to be used as the key. |
| `lookupFieldText` | lookup-table field name |  |  | type === "MultiSelectLookup" or type === "SingleSelectLookup" | Sets the field that will be displayed in the dropdown list |
| `lookupFieldAdditional` | lookup-table field name |  |  | type === "MultiSelectLookup" or type === "SingleSelectLookup" | An additional field can be displayed for each list item, like a description or additional important information. |
| `lookupFieldGrouping1` | boolean |  |  | type === "MultiSelectLookup" or type === "SingleSelectLookup" | If checked, the dropdown list will be grouped by the field set as the Additional Field, using its value as a header for each group. |
| `lookupShowOnlyText` | boolean |  |  | ["SingleSelectLookup", "MultiSelectLookup"].includes(type) | If checked, the field selected as Key Field will not be visible in the list. It won't have any impact on the functionality, it is only a visual change. |

**Default Value**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `default` | text |  |  | type !== "SignaturePad" | Sets a default value to be set in the field when creating a new entry. |
| `scriptValue` | server script id |  |  | type !== "SignaturePad" | Sets a script that returns a value that will be set as the field's default value when creating a new entry. *The Server Script should set result.data to be a string.* |
| `sysvarValue` | one of |  | `""`, `UserName`, `Name` | !["ColorPicker"].includes(type) | Sets a default value based on a system variable, like the current user's username or name. |

**Layout**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `columnLabel` | text |  |  |  | Sets a title for a new section of the form. |
| `enableNewForm` | boolean |  |  |  | If checked, the selected field and all the fields below will be added to a new form with a separate form layout. |
| `columnsL` | one of |  | `""`, `1`, `2`, `3`, `4` | enableNewForm | Determines how many columns this sub-form will span on a large screen. The default is 2. |
| `columnsM` | one of |  | `""`, `1`, `2`, `3`, `4` | enableNewForm | Determines how many columns this sub-form will span on a medium size screen. The default is 1. |
| `labelSpanL` | one of |  | `""`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10`, `11`, `12` | enableNewForm | Sets the default span for the form labels on large screens. |
| `labelSpanM` | one of |  | `""`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10`, `11`, `12` | enableNewForm | Sets the default span for the form labels on medium screens. |

**Properties**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `editable` | boolean | `true` |  |  | Determines if the field is editable or read-only. |
| `required` | boolean | `false` |  |  | If the field is set as 'Required', the form will not be saved if this field is empty. |
| `visible` | boolean | `true` |  |  | If 'Visible' is unchecked, the field and its label will be hidden from view in the form. it can still be used in e.g. conditional visibility checks and will be considered for settings like 'Required' and 'Unique Value' when saving the entry. |
| `enableClearInput` | boolean | `false` |  | ! type or ["ValueHelp", "Input", "ColorPicker"].includes(type) | If enabled, an 'X' will be displayed in the input field if it has text in it, allowing the user to clear the field. |

**Conditional Visibility**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `visibleFieldName` | field name |  |  | {/visible | Conditional Visibility settings can be used to show/hide the field when certain conditions are met. Sets a form field that will be checked for a certain condition. |
| `visibleCondition` | one of |  | `""`, `isEmpty`, `===`, `!==`, `>=`, `<=`, `>`, `<` | {/visible | Conditional Visibility settings can be used to show/hide the field when certain conditions are met. Sets the operator that will be used to compare the selected field's value against the selected fixed value or system variable. |
| `visibleFixedValue` | text |  |  | visible and visibleCondition !== "isEmpty" | Conditional Visibility settings can be used to show/hide the field when certain conditions are met. Sets a value to be compared against the selected field's value. |
| `visibleSystemValue` | one of |  | `""`, `UserName` | visible and visibleCondition !== "isEmpty" | Conditional Visibility settings can be used to show/hide the field when certain conditions are met. Sets a system variable to be compared against the selected field's value. |
| `visibleInverse` | boolean |  |  | {/visible | Conditional Visibility settings can be used to show/hide the field when certain conditions are met. If this setting is checked, the check will be reversed. |

