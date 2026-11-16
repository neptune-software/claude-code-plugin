# Template `neptunedxp_adaptive_tabs`: Tabs

Allows you to display any number of standard and/or adaptive apps in separate tabs, organized vertically or horizontally.

In this template: `fieldsRun` is not used (send `[]`); `fieldsSel` is not used (send `[]`).

Keys shown as `_name` hold an object (navigation or PDF, see `values.md`). The *Default* column is what the designer writes.
At run time this template fills a missing `properties` key with the default below.
**Field entries (`fieldsSel`, `fieldsRun`) never get defaults at run time**: send `visible: true` on every field (List and Tile Table
columns and Tile Chart fields without it are not used) and `editable: true` on form inputs. Never send a default marked *placeholder*.

## `settings.properties.report`

**General**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `title` | text |  |  |  | Sets a title for the application, shown in the header. This text will be translated if a translation is added. |
| `subTitle` | text |  |  |  | Sets a subtitle for the application that is displayed under the title in the header. The subtitle text is translated if a translation is added. |
| `avatarIcon` | icon (`sap-icon://…`) |  |  |  | Sets which icon to be displayed in the header. |
| `avatarBackgroundColor` | one of |  | `""`, `Accent1`, `Accent2`, `Accent3`, `Accent4`, `Accent5`, `Accent6`, `Accent7`, `Accent8`, `Accent9`, `Accent10`, `Random` |  | Sets the background color for the header icon. The specific colors depend on the theme applied. |
| `showIcon` | boolean | `true` |  |  | Shows/hides the icon in the header. |
| `hideHeader` | boolean | `false` |  |  | Shows/hides the header. |

**Tabs**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `tabList` | tabs array | `[]` |  |  |  |

**Refresh Button**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `iconButtonRefresh` | icon (`sap-icon://…`) | `""` |  | report.enableRefresh | Sets an icon for the Refresh button in the header. |
| `textButtonRefresh` | text | `"Refresh"` |  | report.enableRefresh | Sets the text for the Refresh button in the header. This text is translated if a translation is added. |
| `typeButtonRefresh` | one of | `"Transparent"` | `Accept`, `Attention`, `Critical`, `Back`, `Default`, `Emphasized`, `Ghost`, `Neutral`, `Reject`, `Transparent`, `Unstyled`, `Up` | report.enableRefresh | Sets the visual style of the Refresh button in the header, but has no impact on the functionality of the button. The colors of the button styles depend on the theme applied. |

**Close Button**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `iconButtonClose` | icon (`sap-icon://…`) | `""` |  | report.enableClose | Sets an icon for the 'Close' button in the header. |
| `textButtonClose` | text | `"Close"` |  | report.enableClose | Sets the text for the 'Close' button in the header. This text will be translated if a translation is added. |
| `typeButtonClose` | one of | `"Transparent"` | `Accept`, `Attention`, `Critical`, `Back`, `Default`, `Emphasized`, `Ghost`, `Neutral`, `Reject`, `Transparent`, `Unstyled`, `Up` | report.enableClose | Sets the visual style of the 'Close' button in the header, but has no impact on the functionality of the button. The colors of the button styles will depend on the theme applied. |

**Vertical Tabs**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `verticalExpanded` | boolean | `true` |  | report.tabsVertical | If checked, the default state of the left-hand navigation bar will be expanded, and vice versa. |
| `verticalShowExpander` | boolean | `true` |  | report.tabsVertical | Shows/hides the Expand/Collapse Navigation button. |

**Properties**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `tabsVertical` | boolean | `false` |  |  | Checking this setting will show the tabs in a vertical navigation bar on the left hand side of the app, rather than as horizontal tabs at the top of the app. |
| `enableRefresh` | boolean | `true` |  |  | Checking this setting will show a 'Refresh' button in the app's header. Pressing this button will refresh data in adaptive apps running in the app. |
| `enableClose` | boolean | `false` |  |  | Checking this setting will show a 'Close' button in the app's header. If this app is opened from another adaptive app, pressing this button will close the app. |

