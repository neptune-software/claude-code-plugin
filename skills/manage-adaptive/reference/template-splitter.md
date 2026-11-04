# Template `neptunedxp_adaptive_splitter`: Split Page Layout

Allows you to manage multiple applications in a split-page display. Select up to 9 different adaptive applications to display side-by-side, customize the layout for your specific needs, and seamlessly interact with each app within the same window.

In this template: `fieldsRun` is not used (send `[]`); `fieldsSel` is not used (send `[]`).

Keys shown as `_name` hold an object (navigation or PDF, see `values.md`). The *Default* column is what the designer writes.
At run time this template fills a missing `properties` key with the default below.
**Field entries (`fieldsSel`, `fieldsRun`) never get defaults at run time**: send `visible: true` on every field (List and Tile Table
columns and Tile Chart fields without it are not used) and `editable: true` on form inputs. Never send a default marked *placeholder*.

## `settings.properties.report`

**Row 1**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `splitter1Width` | text |  |  |  | Height of row 1 (apps 1–3, side by side). Rows are stacked top to bottom. |
| `splitterMinSize` | text |  |  |  | Not read at run time; the minimum size of row 1 is `splitter1MinSize`. |
| `splitter1Resizable` | boolean | `true` |  |  | When checked, a resize bar will be displayed allowing you to resize the row as needed. |

**Row 2**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `splitter2Width` | text |  |  |  | Height of row 2 (apps 4–6, side by side). Rows are stacked top to bottom. |
| `splitter2MinSize` | text |  |  |  | Sets the minimum height of the row, in pixels, rem, or percentage. |
| `splitter2Resizable` | boolean | `true` |  |  | When checked, a resize bar will be displayed, allowing you to resize the row as needed. |

**Row 3**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `splitter3Width` | text |  |  |  | Height of row 3 (apps 7–9, side by side). Rows are stacked top to bottom. |
| `splitter3MinSize` | text |  |  |  | Sets the minimum height of the row, in pixels, rem, or percentage. |
| `splitter3Resizable` | boolean | `true` |  |  | When checked, a resize bar will be displayed, allowing you to resize the row as needed. |

**App 1**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `_app1Nav` | navigation object |  |  |  | Sets which application or adaptive application to display as App 1 |
| `app1Width` | text |  |  |  | Sets the width of the panel containing App 1 |
| `app1MinSize` | text |  |  |  | Sets the minimum width of the panel containing App 1 |
| `app1Resizable` | boolean | `true` |  |  | When checked, a resize bar will be displayed, allowing you to resize the panel containing App 1 as needed |

**App 2**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `_app2Nav` | navigation object |  |  |  | Sets which application or adaptive application to display as App 2 |
| `app2Width` | text |  |  |  | Sets the width of the panel containing App 2 |
| `app2MinSize` | text |  |  |  | Sets the minimum width of the panel containing App 2 |
| `app2Resizable` | boolean | `true` |  |  | When checked, a resize bar will be displayed, allowing you to resize the panel containing App 2 as needed |

**App 3**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `_app3Nav` | navigation object |  |  |  | Sets which application or adaptive application to display as App 3 |
| `app3Width` | text |  |  |  | Sets the width of the panel containing App 3 |
| `app3MinSize` | text |  |  |  | Sets the minimum width of the panel containing App 3 |
| `app3Resizable` | boolean | `true` |  |  | When checked, a resize bar will be displayed, allowing you to resize the panel containing App 3 as needed |

**App 4**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `_app4Nav` | navigation object |  |  |  | Sets which application or adaptive application to display as App 4 |
| `app4Width` | text |  |  |  | Sets the width of the panel containing App 4 |
| `app4MinSize` | text |  |  |  | Sets the minimum width of the panel containing App 4 |
| `app4Resizable` | boolean | `true` |  |  | When checked, a resize bar will be displayed, allowing you to resize the panel containing App 4 as needed |

**App 5**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `_app5Nav` | navigation object |  |  |  | Sets which application or adaptive application to display as App 5 |
| `app5Width` | text |  |  |  | Sets the width of the panel containing App 5 |
| `app5MinSize` | text |  |  |  | Sets the minimum width of the panel containing App 5 |
| `app5Resizable` | boolean | `true` |  |  | When checked, a resize bar will be displayed, allowing you to resize the panel containing App 5 as needed |

**App 6**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `_app6Nav` | navigation object |  |  |  | Sets which application or adaptive application to display as App 6 |
| `app6Width` | text |  |  |  | Sets the width of the panel containing App 6 |
| `app6MinSize` | text |  |  |  | Sets the minimum width of the panel containing App 6 |
| `app6Resizable` | boolean | `true` |  |  | When checked, a resize bar will be displayed, allowing you to resize the panel containing App 6 as needed |

**App 7**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `_app7Nav` | navigation object |  |  |  | Sets which application or adaptive application to display as App 7 |
| `app7Width` | text |  |  |  | Sets the width of the panel containing App 7 |
| `app7MinSize` | text |  |  |  | Sets the minimum width of the panel containing App 7 |
| `app7Resizable` | boolean | `true` |  |  | When checked, a resize bar will be displayed, allowing you to resize the panel containing App 7 as needed |

**App 8**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `_app8Nav` | navigation object |  |  |  | Sets which application or adaptive application to display as App 8 |
| `app8Width` | text |  |  |  | Sets the width of the panel containing App 8 |
| `app8MinSize` | text |  |  |  | Sets the minimum width of the panel containing App 8 |
| `app8Resizable` | boolean | `true` |  |  | When checked, a resize bar will be displayed, allowing you to resize the panel containing App 8 as needed |

**App 9**

| Key | Value | Default | Allowed | Shown when | What it does |
|---|---|---|---|---|---|
| `_app9Nav` | navigation object |  |  |  | Sets which application or adaptive application to display as App 9 |
| `app9Width` | text |  |  |  | Sets the width of the panel containing App 9 |
| `app9MinSize` | text |  |  |  | Sets the minimum width of the panel containing App 9 |
| `app9Resizable` | boolean | `true` |  |  | When checked, a resize bar will be displayed, allowing you to resize the panel containing App 9 as needed |

