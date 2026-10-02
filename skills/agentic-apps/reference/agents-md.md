# AGENTS.md files: mechanics, what the agent does with them, and how to write them

Verified against a running Neptune DXP - Open Edition 25.0 instance. The docs page "Agentic Apps"
(section "Describe an app with AGENTS.md files") says what the files are for, that they are additive,
and that each is scoped to the part of the app it sits next to. Everything below is the behaviour the
docs leave out.

## Mechanics

| Fact | Detail | How to see it |
|---|---|---|
| Name | The object name must equal `agents.md` case-insensitively; use exactly `AGENTS.md`. `Agents`, `AGENTS`, `agent.md` are ignored **silently** | `getAgentFiles()` stays empty |
| Object type | Any object whose content is in `script` loads; use `neptune.Markdown` as the docs say | |
| Empty content | Skipped silently | `getAgentFiles()` stays empty |
| Placement | A child of a control in the object tree. **Never in the Files group**: files there are moved out of the tree at activation and never reach the agent | |
| Anchor | The nearest enclosing **UI control**. Folders and non-UI objects (models, bar content) are skipped. A dialog kept in a folder under the Scripts root is still a valid anchor | `path` in `getAgentFiles()` |
| Three scopes | No control ancestor at all = **global** (part of the system prompt). Under the root control = **app-wide** (in scope whenever the app is on screen). Under any other control = **scoped** | `path` is `""`, the root name, or a longer chain |
| In scope when | The anchor is rendered and **visible**: attached, not hidden, not inside an inactive NavContainer page or tab. An unopened or closed dialog is out of scope; an open one is in | navigate and watch the rule apply or not |
| Tabs | An `IconTabFilter` header is rendered on every tab, so a file anchored to the filter is in scope on every tab. Anchor per-tab files to the first container **inside** the tab | |
| Panels | A collapsed `sap.m.Panel` is still visible. Panel files are for conditional sections, not for hiding text | |
| Concatenation | In-scope files are joined general first, most specific last, later wins on conflict. **No header names the file or its anchor**, so each file must say which screen it is about | Agent Trace shows the joined text |
| Where the text lands | Global text: the system prompt, once per turn. App-wide and scoped text: the turn input, every iteration | |
| Size | No server limit. Global text over 8,000 characters logs a warning. Every character in scope is sent on every iteration | console with `?iaDebug=true` |
| Interpolation | Global text is interpolated by the platform: `${…}` and `{{…}}` break the prompt. Do not use them anywhere | |
| Headings | The turn input uses level-1 `# …` headings as section markers. Use `##` and below | |
| Denylist | A file whose anchor is on the denylist logs a warning and still loads | console with `?iaDebug=true` |
| Takes effect | After `activate_app`; the content is embedded at build time | |
| Adaptive apps | Supported and on by default, but they have no object tree to place a file in; coach the template app instead | |

## What the agent does with the text

The agent treats the files as authoritative, builder-authored context about how to operate the app.
Three consequences for the author, verified in runs:

- **Stop points work.** A procedural constraint (a pause, a confirmation between steps, a required
  order) binds even when the user's request says to skip it; the agent says in one line that the app
  requires it and ends the turn there. "Never press Submit in the turn that fills the form. Read back
  what will be written and ask." is honoured. This is the strongest lever you have.
- **Values do not.** A file never expands the task and never supplies a value the user did not give.
  It cannot make the agent pick a cost center or a date; a flow step phrased as something the user
  does ("picks a type", "enters a reference") names a value the user must supply. Write "ask for X"
  rather than "use X".
- **Routing does not happen here.** Which app opens is decided from the app **description** before any
  file is in scope. Put routing words in the description, not in AGENTS.md.

On a question (the agent explains rather than acts) it quotes and paraphrases the files freely but
never acts on them, and instructions to call a tool are ignored in that mode. A file that demands a
tool call on every turn is treated as housekeeping and wastes iterations; say **when** to call the
tool instead ("run `checkDelivery` before choosing a resolution").

## The file set

| File | Anchor | In scope | Carries |
|---|---|---|---|
| App-wide | the root control | whenever the app is on screen | the map: purpose and user, screens, order of work, rules the screen does not show, stop points, how to talk |
| Page | each `sap.m.Page` (or dynamic page) | while that page is active | that screen's fields and mechanics, what each button writes |
| Dialog | each dialog with a write button | while it is open | the one consequential action: what it writes, read-back, confirm |
| Panel / section | a container that only applies conditionally | while rendered | the rule for that section only |
| Tab | the first container inside the IconTabFilter | while the tab is selected | that tab's mechanics |

Defaults: one app-wide file always; one per page; one per dialog that writes; panels and tabs only when
they carry rules of their own. Single-page apps often need only the app-wide file.

## Budgets

These are this skill's budgets, not platform limits: the platform only warns, above 8,000 characters
of global text.

| File | Budget | Why |
|---|---|---|
| App-wide | up to 3,000 chars | sent on every iteration of every turn |
| Page or dialog | up to 800 chars | sent whenever on screen |
| Panel or tab | up to 300 chars | narrow rule |
| Global (no control ancestor) | keep under 8,000 chars | the runtime warns above it |

## Content recipe

**App-wide file, four kinds of content, in this order.**

1. **Who and what.** One paragraph: the user's job, the screens by name, where the data lives.
2. **Order of work.** Numbered, the sequence a competent user follows. Name the custom tools where
   they belong in the sequence.
3. **Rules the screen does not show.** Derived fields, policies, thresholds, error codes and what to
   do about each, fields that must not be guessed.
4. **Stop points and how to talk.** Which actions write, the read-back-then-confirm rule, what to
   report after a write, tone and language.

**Page file.** First line names the screen. Then the fields that need explaining (never every field),
the button(s) and what each writes, the screen's sharp edges.

**Dialog file.** First line names the dialog and what it writes. Read-back line, confirm rule, what to
report afterwards, what to do when the write half-fails.

**Voice.** Second person, instructions to follow, short sentences, control names in backticks when a
control has a good name. No marketing, no "the AI".

**Sharp edges to include when the control exists:**

| Control | Rule to write |
|---|---|
| DatePicker | "Type the date as `<valueFormat>` into the field. Never open the calendar." The built-in date action writes the typed string into the field, so it must match the control's `valueFormat` attribute: `yyyy-MM-dd` unless the app sets one |
| Table / List over 20 rows | "The list shows the first rows only. Search or filter before reading; use `<tool>` for counts." |
| ObjectListItem rows | "Row status and attributes are not readable. Open the item, or use `<tool>`." |
| Slider / StepInput | "Set by dragging; the unit is days." |
| Disabled Submit | "If Submit is disabled, read the form and say which required fields are empty." |
| Derived field | "X is derived from Y. There is no field to type it into." |
| Wizard | the step order and the button that advances |

**Do not write**

- Routing sentences ("use this app for…"): they belong in the description.
- Values the user must supply ("use cost center 4711"). Write "ask for the cost center".
- What the agent can already see (every label, every button that is obviously a button).
- Repetition of the app-wide file inside page files.
- "Call `<tool>` every turn."

## Check a file

Walk every file against this list before it goes into the payload (the skill's step 4):

1. Object name exactly `AGENTS.md`; content not empty.
2. Parent is a UI control: not the Files group, not a folder under it, not a model.
3. One file per anchor; an existing file under that anchor is updated, not doubled.
4. A scoped file opens by naming its screen, and repeats nothing from the app-wide file.
5. Within budget.
6. No `${`, no `{{`, no line starting with `# `.
7. Rules are instructions ("ask for X"), never values ("use X"), and no routing sentences.

## Worked example: a returns app on a 25.0 instance (four of its six files, abridged)

App-wide, under the root control `App` (abridged):

```markdown
## Return Request app

Two screens. "Returns" lists requests already filed. "New Return" is the form that creates one.
Delivery reference data (serials, dates, item class, warranty) is in the deliveries model.

## Order of work
1. From the list, press New Return to open the form.
2. Delivery number and serial first; the serial is validated against the delivery. If the user
   describes the item instead of giving numbers, use `findDelivery`.
3. Then the reason. The form shows only the section matching the reason. Leave the others empty.
4. Before choosing a resolution, run `checkDelivery`. It tells you what policy allows right now.
5. Submit last. Prepare and pause unless the user explicitly told you to submit.

## Policy, and why the app rejects things
- Refund and replacement: 30 days from delivery for class C2 items, 60 days for A1 and B1.
- Warranty repair: allowed until the delivery date plus the item's warranty months.
- Transit damage must be reported within 7 days of delivery, and needs the carrier.

## Error codes
- ERR-SN-04: the serial format is wrong. It is SN- followed by eight digits.
- RET-409: the chosen resolution is not allowed for the item's current state. Run `checkDelivery`
  and propose one that is allowed.

## Stop points
Nothing is written until Submit. Before pressing it, read back delivery, serial, reason and
resolution in one line and ask. Only on an explicit yes, press it. Report the return number after.
```

Page `pageList`:

```markdown
This screen lists returns that have already been filed. It is read-only: to create a return, press
New Return, which opens the form. Do not try to edit a filed return here. If the user asks what is
open, or how many returns exist, read this table rather than guessing.
```

Page `pageForm`:

```markdown
This is the create form. Nothing is written until Submit. The Submit button stays disabled until
every required field for the chosen reason is filled, so if it is disabled, read the form and say
which fields are still empty rather than trying to press it.
```

Panel `PanelTransit` (rendered only when the reason is transit damage):

```markdown
Carrier and a damage description are both required here. The 7-day transit deadline counts from the
delivery date. Check it with `checkDelivery` before filling anything in.
```

A dialog file, for an assign dialog in a maintenance app:

```markdown
Dialog: assign the inspection to a field worker. Confirm performs two writes: it updates the
equipment record and creates the inspection for the chosen worker.

Pick the worker from the list; never substitute the closest name. If the person is not in the list,
say so and ask who else. Never confirm in the turn that opens the dialog: state "Assigning the
inspection for <item> to <worker>. Confirm?" and press Confirm only on an explicit yes. Afterwards
report both writes; if the app acknowledged only one, say exactly that.
```

## Verify

The developer's checklist is the skill's step 7. Specific to files: `neptune.ia.getAgentFiles()` lists
`{ content, path }` for the views on screen, `path` being the anchor chain (`""` = global), and Agent
Trace shows the joined text the agent actually received.
