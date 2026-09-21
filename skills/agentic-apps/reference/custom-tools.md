# Custom tools: `neptune.ia.registerTools`

Verified against a running Neptune DXP - Open Edition 25.0 instance. The official docs page
"Agentic Apps" has the section "Register custom tools"; where this document says more than the docs,
it is behaviour observed on the platform.

## When a custom tool earns its place

Built-in tools already read every supported control and can set, press, select and navigate. A custom
tool is for what the screen **cannot express**:

| Add a tool when | Example | Do not add a tool when |
|---|---|---|
| The answer needs more rows than the snapshot carries (tables are captured 20 rows at a time) | "How many orders are pending?" over 47 rows | The answer is visible on screen |
| The data is in a model but not on screen | Equipment class, criticality, warranty end date | A built-in tool can read it from a control |
| A policy or validation must be checked before a write | "Which resolutions are allowed for this delivery?" | The rule fits in one AGENTS.md sentence |
| A server verb has no button | Reload from the backend after a change | A button already does it (the agent presses buttons) |
| The user describes a thing instead of naming its key | "the forklift by dock 3" to a fleet number | The screen has a working search field |

Two to five tools per app. Each one answers a question the developer can name.

## The contract

```js
neptune.ia.registerTools(anchor, provider)

anchor    // the app's root control itself, e.g. App (an id string is also accepted)
provider  // (context) => CustomTool[] | Promise<CustomTool[]>, called on every iteration
context   // { viewKey, task, threadID?, snapshot }
snapshot  // { controls: [{ id, type, label?, properties, bindings?, actions? }], generatedAt,
          //   viewKey?, viewName?, openPopups?: [{ id, type, title? }] }   (openPopups absent when none is open)

CustomTool {
    name: string,                    // letters, digits, _ and -; up to 57 characters; unique in the app
    description: string,             // what it returns and WHEN to call it; the model reads it verbatim
    parameters?: [{
        name: string,
        type: 'string' | 'number' | 'boolean' | 'date' | 'array' | (an array of those),
        required: boolean,
        description?: string,
        items?: { type: 'string' | 'number' | 'boolean' | 'date' }   // for array
    }],
    execute: (args) => result | Promise<result>
}

result { toolId: string, success: boolean, message?: string, verified?: boolean, metadata?: object }
```

No `object` parameter type, no `enum`, no nested schema. `array` items are primitives. There is no
unregister; registering again under the same anchor replaces the provider.

## What the platform drops or replaces

| Rule | Effect when broken |
|---|---|
| `name` non-empty, allowed characters only, ≤ 57 chars (no dot, colon, space) | tool dropped, console warn `custom tool skipped` |
| `description` is a string (an empty string passes but is useless to the model) | tool dropped |
| `execute` is a function | tool dropped |
| `parameters` is an array | otherwise treated as "no parameters", no error |
| two tools with the same name | the first wins, the second is dropped with a `duplicate name` warn |
| provider throws or returns a non-array | all of that provider's tools skipped for the iteration |
| result is not `{ success: boolean }` with string `message`, boolean `verified`, object `metadata` | replaced by `{ success: false, message: 'custom tool did not return a valid result' }` |
| `execute` throws | becomes `{ success: false, message: 'custom tool threw: <error>' }` |

The warnings print to the browser console whether or not `?iaDebug=true` is set.

## How the platform uses the provider

- **Called on every iteration of a turn** (up to 10 per turn), with that iteration's fresh snapshot,
  so the list can depend on what is open.
- **Also called on explain turns** (questions), where the tools are then withheld from the model, and
  **by WebMCP** with an empty `task`. The provider must only build the list. Anything it changes will
  change on a question.
- **Only the active view's providers are asked**, so anchor the tools on the app: pass its root control
  itself, `neptune.ia?.registerTools(<RootControl>, …)`. The platform resolves it to the app's view, in
  a launchpad and on a standalone page alike. An id string is also accepted, `localViewID` included, so
  older scripts keep working, but a local id such as `'App'` can name a different control inside a
  launchpad; the control is the form that cannot be got wrong. Do not anchor on an inner control: its
  tools are offered only while that control's own view is on screen. A wrong anchor is silent:
  `?iaDebug=true` shows `custom tools collected { registered: [...], active: [], offered: [] }`.
- **`neptune.ia` can be absent.** The Agentic Apps runtime is only loaded on a page that is agentic:
  a standalone app with "Disable Agentic Apps" ticked, or a launchpad without an Agentic Apps agent,
  has no `neptune.ia`, and a call without `?.` throws while the app loads.
- **App scripts run after the controls are constructed**, so registering from a script works without
  polling or timers.
- Async `execute` is awaited; the whole iteration has a 60 s budget. Keep it fast.
- The model sees `success`, `message` and `verified`. `toolId` is never shown, and `metadata` reaches
  it only for the most recent result, so everything the agent must read goes in `message`. **No length
  cap is applied to it**, and results are re-sent in later iterations, so cap it yourself.
- A `success: false` keeps the agent working, which is what you want when the failure message tells it
  what to do next. The agent cannot declare the task finished in the same step as a failed result.

## What the model sees

- Tool id `custom-<name>`, description **verbatim**, and a JSON schema built from `parameters`
  (`date` becomes a string with date format; `array` gets `items`; a type array becomes a union).
- The description is the only thing that tells the model **when** to call it. Write it as
  "Returns X. Use this whenever the user asks Y." "Call this tool every turn" makes models fixate and
  spin to the iteration cap. Say when instead.
- When a custom tool matches the task, the agent prefers it over rebuilding the same job from
  controls, and it judges "matches" from the description. A description that only says what the tool
  does, not when to use it, is the usual reason a tool is offered and never called.
- AGENTS.md can name the tool ("run `checkDelivery` before choosing a resolution"), which is the
  strongest way to make the agent use it at the right moment.

## Writing rules

1. **Description says what it returns and when to use it**: "Returns X. Use this whenever the user asks Y."
2. **Every parameter has a `description`** and an explicit `required` boolean.
3. **`message` is a string the model can act on.** Structured data goes through `JSON.stringify`: an
   object in `message` makes the platform replace the result with a failure. Return only the fields the
   agent needs, at most about 10 rows, and the total, so it can say "10 of 43"; the platform applies no
   length cap and re-sends results on every later iteration.
4. **Expected failures instruct the next step.** "No delivery 4711. Ask the user to check the number."
   beats "not found". Unexpected errors need no try/catch: a throw already comes back to the agent as a
   failed result. Missing data is missing, not zero: `Number(null)` is `0`, so exclude rows without the
   figure and say how many you excluded.
5. **The provider is pure.** Read the snapshot, build the array, return. No navigation, no model writes.
6. **A tool that writes is a consequential action.** Name it in the AGENTS.md stop-point rule so the
   agent confirms before calling it, exactly like a submit button.
7. **`neptune.ia?.registerTools(<RootControl>, …)`**: the `?.` keeps the app loading where the runtime is
   absent; the root control is the anchor, never an inner control or a bare `localViewID`.
8. **Declare nothing at the top level.** App scripts share one scope, so a top-level `const`, `let` or
   `function` that another script also declares throws for the whole app. Put helpers inside the
   provider, or wrap the script in `(() => { … })();`.
9. **Return `{ toolId, success, message }`.** The platform only needs `success`, but the App Designer
   typing declares `toolId` as required, and the docs sample returns it.

## Template

Replace `<RootControl>` with the root control's name from the tree listing, and the placeholders in
angle brackets with the real names and data reads.

```js
// Agentic Apps custom tools for <application>. Object: neptune.Script "AgenticTools" under the
// Scripts root; delete this one object to remove them.
neptune.ia?.registerTools(<RootControl>, () => [
    {
        name: '<toolName>',
        description: '<Returns X. Use this whenever the user asks Y, a question the screen cannot answer.>',
        parameters: [
            { name: 'query', type: 'string', required: true, description: '<What the user said, e.g. "pump 12">' },
        ],
        execute: (args) => {
            const query = String(args.query ?? '').trim().toLowerCase();
            const rows = <modelName>.getProperty('/rows') || [];
            const hits = rows.filter((row) => JSON.stringify(row).toLowerCase().includes(query));
            if (!hits.length) {
                return {
                    toolId: '<toolName>',
                    success: false,
                    message: `Nothing matches "${query}". Ask the user for the exact number.`,
                };
            }
            return {
                toolId: '<toolName>',
                success: true,
                message: JSON.stringify({ total: hits.length, first10: hits.slice(0, 10) }),
            };
        },
    },
]);
```

This is the docs sample's shape with one difference: the docs anchor on `localViewID`, which exists
only inside a launchpad view and throws on a standalone page; the root control works in both. An
existing script that passes `localViewID` or an id string keeps working inside a launchpad.

**A tool only while a dialog is open.** The provider receives `{ snapshot }`; return the extra tool only
when `snapshot.openPopups` contains the dialog, as the docs sample does. Match the id exactly or by the
suffix `'--' + name`: `openPopups[].id` is the App Designer name inside a launchpad view
(`DialogOrder`) and the raw runtime id on a standalone page, the platform appends `#2` on a collision,
and a bare `endsWith('Dialog')` also matches `otherDialog`.

**Placement.** A `neptune.Script` object named `AgenticTools` under the Scripts root (`fieldParent`
`99999`). Never edit the customer's `GlobalFunctions`: one object to add, one object to delete, no risk
to existing logic. The app's models and control variables are globals in the same scope, so the tool
body can read them directly (`modelDeliveries.getProperty('/ITEMS')`, `TableOrders.getModel().getData()`).

## Check before saving

Read the finished script once, top to bottom, against this list. A script that fails item 1 breaks the
app for every user; the rest decide whether the agent can use the tools.

1. The call is `neptune.ia?.registerTools(…)`, with `?.`, and nothing is declared at the top level.
2. The anchor is `<RootControl>` replaced with the app's real root control name from the tree listing:
   not an inner control, and no bare `localViewID`.
3. Every tool name uses letters, digits, `_` and `-` only, is at most 57 characters, and is unique.
4. Every description says what the tool returns and when to use it; none says "every turn".
5. Every parameter has a `type` from `string | number | boolean | date | array`, `required` written as
   `true` or `false`, and a `description`.
6. Every return path yields `{ toolId, success, message }` with `message` a string: structured data
   through `JSON.stringify`, only the fields needed, at most about 10 rows, with the total.
7. Every expected failure (nothing found, not allowed) returns `success: false` and the next step.
8. Every model or control the tools read exists in the app under that exact name.
9. Walk each `execute` once with one row that has a missing figure: it must be excluded and reported,
   not treated as zero.
10. The provider builds the array and changes nothing; a tool that writes is named as a stop point in
    the AGENTS.md rules.

## Verify

The developer's checklist is the skill's step 7. The console lines that matter for tools, under
`?iaDebug=true`: `custom tools collected { registered, active, offered }` (`offered: []` on a question
is normal, explain turns withhold custom tools), `tools offered` (also `neptune.ia.getOfferedTools()`),
and `custom tool skipped` with its reason. Agent Trace, Triggered From = `agentic-apps`, shows each
call and its result.

## When the agent ignores a tool

Two faults with opposite fixes, and the console settles which one you have. **Offered but never
called** (`custom-<name>` is in `tools offered`): the description does not say when to use it and no
AGENTS.md rule names it — fix the words; the registration is fine. **Never offered**: the skill's
symptoms table maps each shape of the `custom tools collected` line to its cause.

Putting a control on the denylist does **not** push the agent onto a custom tool. The denylist removes
the control's data from what the agent sees; the tools that act on that kind of control are still
offered, so the agent keeps them and loses the rows it needed to use them well.
