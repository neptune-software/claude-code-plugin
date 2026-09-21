# Custom tools: `neptune.ia.registerTools`

Verified against a running Neptune DXP - Open Edition 25.0 instance. The official docs page
"Agentic Apps" has the section "Register custom tools"; where this document says more than the docs,
it is behaviour observed on the platform.

**Builds after 25.0 behave differently in three ways**, each called out where it applies below: they
accept the root control itself as the anchor, they let the agent consider custom tools while it plans,
and the agent can press sortable table column headers. Find the server's version with `get_system_info`
before choosing a form; when in doubt, write the 25.0 form, which works on every version.

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
| On 25.0, the user asks for a table in an order and the app sorts through clickable column headers | "Show the oldest first" | The server is newer than 25.0: the agent presses sortable column headers itself |

Two to five tools per app. Each one answers a question the developer can name.

## The contract

```js
neptune.ia.registerTools(anchor, provider)

anchor    // 25.0: an id string: localViewID inside a launchpad view, the root control's id on a
          //   standalone page. Newer builds: the root control itself (an id string still works).
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
unregister; registering again under the same key replaces the provider.

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
- **Only the active view's providers are asked**, so the anchor must identify the app's own view.
  - **On 25.0**, pass an id string. Inside a launchpad an app is compiled as a view and the id that
    matches is `localViewID`; the root control's id does **not** match there when the script runs at
    app start, because the control is not yet attached to its view, so the tools reach nobody. On a
    standalone page the root control's id is the one that matches. Hence the guarded expression in
    the template.
  - **On newer builds**, pass the root control itself: `neptune.ia.registerTools(<RootControl>, …)`.
    The platform resolves it to the app's view in a launchpad and on a standalone page alike, so no
    `localViewID` guard is needed. An id string still works, so a 25.0 script keeps working after an
    upgrade. Passing a control to a 25.0 server registers nothing, silently.
  - A wrong anchor is silent: `?iaDebug=true` shows
    `custom tools collected { registered: [...], active: [], offered: [] }`.
- **`neptune.ia` can be absent.** The Agentic Apps runtime is only loaded on a page that is agentic:
  a standalone app with "Disable Agentic Apps" ticked, or a launchpad without an Agentic Apps agent,
  has no `neptune.ia`, and a bare call throws while the app loads. Guard it.
- **App scripts run after the controls are constructed**, so registering from a script works without
  polling or timers.
- Async `execute` is awaited; the whole iteration has a 60 s budget. Keep it fast.
- The model sees `success`, `message` and `verified` of the result; `toolId` is not shown and
  `metadata` only for the last turn. **No length cap is applied to `message`**, and results are
  re-sent in later iterations, so cap it yourself.
- A `success: false` keeps the agent working, which is what you want when the failure message tells it
  what to do next. The agent cannot declare the task finished in the same step as a failed result.

## What the model sees

- Tool id `custom-<name>`, description **verbatim**, and a JSON schema built from `parameters`
  (`date` becomes a string with date format; `array` gets `items`; a type array becomes a union).
- The description is the only thing that tells the model **when** to call it. Write it as
  "Returns X. Call it when Y, before Z." "Call this tool every turn" makes models fixate and spin to
  the iteration cap. Say when instead.
- AGENTS.md can name the tool ("run `checkDelivery` before choosing a resolution"), which is the
  strongest way to make the agent use it at the right moment.
- **On 25.0 the agent plans control first**: it works out which controls to set and press, and a
  custom tool, which names no control, is easily never considered. Name every custom tool in an
  AGENTS.md rule that says when to use it; on 25.0 that is the difference between a tool that is used
  and one that is only offered. Newer builds let the agent prefer a matching custom tool over
  rebuilding the same job from controls, and the AGENTS.md rule still sets the moment.

## Writing rules

1. **Description says what it returns and when to call it**, in one or two sentences.
2. **Every parameter has a `description`** and an explicit `required` boolean.
3. **`message` is text the model can act on.** For structured data, `JSON.stringify` a small object.
   Cap at about 2,000 characters and say when the list was cut ("10 of 43 matches").
4. **Failures instruct the next step.** "No delivery 4711. Ask the user to check the number." beats "not found".
5. **Never throw out of `execute`.** Wrap the body in try/catch and return a failure with the error text.
   Missing data is missing, not zero: `Number(null)` is `0`, so exclude rows without the figure and say
   how many you excluded.
6. **The provider is pure.** Read the snapshot, build the array, return. No navigation, no model writes.
7. **A tool that writes is a consequential action.** Name it in the AGENTS.md stop-point rule so the
   agent confirms before calling it, exactly like a submit button.
8. **Anchor on the app's own view.** On 25.0, or when the version is unknown:
   `typeof localViewID !== 'undefined' ? localViewID : <RootControl>.getId()`. On a server newer than
   25.0: `<RootControl>` itself.
9. **One script object, IIFE-wrapped, nothing at column 0.** App scripts share one scope; a top-level
   `const` that another script also declares throws a redeclaration error for the whole app.
10. **Return `{ toolId, success, message }`.** The platform only needs `success`, but the App Designer
    typing declares `toolId` as required, and the docs sample returns it.

## Template

Replace `<RootControl>` with the root control's name from the tree listing, and the placeholders in
angle brackets with the real names and data reads.

```js
/* Agentic Apps custom tools for <application>
   Object: neptune.Script "AgenticTools" under the Scripts root. Delete this one object to remove them.
   - the provider runs on EVERY agent iteration, on explain turns and for WebMCP: build the list, change nothing
   - a tool is { name, description, parameters?, execute }; execute returns { toolId, success, message }
   - parameter types: string | number | boolean | date | array (items primitive); no object, no enum
*/
(() => {
    if (typeof neptune === 'undefined' || !neptune.ia || typeof neptune.ia.registerTools !== 'function') {
        return; // the Agentic Apps runtime is not on this page (app opted out, or a launchpad without an agent)
    }
    // Works on 25.0 and on every newer build. Inside a launchpad the app is compiled as a view and
    // registers under localViewID; on its own page it registers under the root control's id.
    // On a server newer than 25.0 this line may be replaced by: const viewKey = <RootControl>;
    const viewKey = typeof localViewID !== 'undefined' ? localViewID : <RootControl>.getId();

    const asText = (v) => {
        const s = typeof v === 'string' ? v : JSON.stringify(v);
        return s.length > 2000 ? s.slice(0, 2000) + ' ...[truncated]' : s;
    };
    const ok = (toolId, message) => ({ toolId, success: true, message: asText(message) });
    const fail = (toolId, message) => ({ toolId, success: false, message: asText(message) });
    const popupOpen = (snapshot, name) =>
        (snapshot?.openPopups || []).some((p) => p.id === name || String(p.id).endsWith('--' + name));

    neptune.ia.registerTools(viewKey, ({ snapshot }) => {
        const tools = [
            {
                name: '<toolName>',
                description: '<What it returns and when to call it. Name the question this answers that the screen cannot.>',
                parameters: [
                    { name: 'query', type: 'string', required: true, description: '<What the user said, e.g. "pump 12">' },
                ],
                execute: (args) => {
                    try {
                        const query = String(args?.query ?? '').trim();
                        if (!query) return fail('<toolName>', 'query is required. Ask the user what to look for.');
                        const rows = <modelName>.getProperty('/rows') || [];
                        const hits = rows
                            .filter((r) => JSON.stringify(r).toLowerCase().includes(query.toLowerCase()))
                            .slice(0, 10);
                        if (!hits.length) return fail('<toolName>', `Nothing matches "${query}". Ask the user for the exact number.`);
                        return ok('<toolName>', { count: hits.length, hits });
                    } catch (e) {
                        return fail('<toolName>', `<toolName> failed: ${e?.message ?? e}`);
                    }
                },
            },
        ];

        // A tool that only makes sense while a dialog is open: gate on the snapshot the platform hands you.
        if (popupOpen(snapshot, '<DialogName>')) {
            tools.push({
                name: '<dialogToolName>',
                description: '<Summarise the record shown in the open dialog. Only offered while that dialog is open.>',
                execute: () => {
                    try {
                        return ok('<dialogToolName>', { /* read the dialog's data here */ });
                    } catch (e) {
                        return fail('<dialogToolName>', `<dialogToolName> failed: ${e?.message ?? e}`);
                    }
                },
            });
        }
        return tools;
    });
})();
```

This keeps the shape of the official sample and adds the guards it lacks. The 25.0 documentation
passes `localViewID` bare (`neptune.ia?.registerTools(localViewID, ({ snapshot }) => …)`), which throws
on a standalone page because `localViewID` is undeclared there. The documentation for newer builds
passes the root control (`neptune.ia.registerTools(rootControl, (context) => …)`), which is correct on
those builds and registers nothing on 25.0.

**Popup ids.** `openPopups[].id` is the App Designer name inside a launchpad view (`DialogOrder`) and
the raw runtime id on a standalone page; on a collision the platform appends `#2`. Match exact-or-suffix
as in `popupOpen` above; a bare `endsWith('Dialog')` also matches `otherDialog`.

**Placement.** A `neptune.Script` object named `AgenticTools` under the Scripts root (`fieldParent`
`99999`). Never edit the customer's `GlobalFunctions`: one object to add, one object to delete, no risk
to existing logic. The app's models and control variables are globals in the same scope, so the tool
body can read them directly (`modelDeliveries.getProperty('/ITEMS')`, `TableOrders.getModel().getData()`).

## Check before saving

Read the finished script once, top to bottom, against this list. A script that fails the first three
items fails to load for every user of the app; the rest decide whether the agent can use the tools.

1. The file is one expression: it starts with `(() => {` and ends with `})();`. Nothing is declared at
   column 0.
2. The first statement inside returns when `neptune` is undefined or `neptune.ia` is missing.
3. The anchor matches the server's version: on 25.0 or an unknown version, `localViewID` appears only
   inside `typeof localViewID !== 'undefined' ? localViewID : <RootControl>.getId()`; on a newer
   server, the anchor may instead be `<RootControl>` itself, never a control passed to a 25.0 server.
   Either way `<RootControl>` is the app's real root control name.
4. Every tool name uses letters, digits, `_` and `-` only, is at most 57 characters, and is unique.
5. Every description says what the tool returns and when to call it; none says "every turn".
6. Every parameter has a `type` from `string | number | boolean | date | array`, `required` written as
   `true` or `false`, and a `description`.
7. Every `execute` body is inside try/catch and every return path yields `{ toolId, success, message }`
   with `message` a string (structured data through `JSON.stringify`, capped).
8. Every model or control the tools read exists in the app under that exact name.
9. Walk each `execute` once with one row that has a missing figure: it must be excluded and reported,
   not treated as zero.
10. The provider builds the array and changes nothing; a tool that writes is named as a stop point in
    the AGENTS.md rules.

## Verify in the browser

Open the app with `?iaDebug=true` (before the URL hash), ask the agent to do something on the app, and
read the console:

- `custom tools collected { registered: ['custom-findDelivery', …], active: [...], offered: [...] }`:
  `registered` full and `active` empty is the wrong-key case; `offered: []` on a question is normal
  (explain turns withhold custom tools).
- `custom tool skipped` names a validation failure and its reason.
- In Agent Trace (Cockpit), filter Triggered From = `agentic-apps` to see the tool call and its result.
- On newer builds, a `tools offered` line lists exactly what the model was sent in that iteration, and
  `neptune.ia.getOfferedTools()` returns the same list under `?iaDebug=true`.

## When the agent ignores a tool

"The agent won't use my tool" is two different faults with opposite fixes. Settle which one it is
before changing anything:

| What the trace shows | Fault | Fix |
|---|---|---|
| The tool (`custom-<name>`) is in the offered list, and the agent never calls it | Description or instructions | Say plainly when to use it ("Use this whenever the user asks which…"), and name it in an AGENTS.md rule. The registration is fine |
| `registered` lists the anchor, `active` is empty | Wrong anchor | See "Only the active view's providers are asked" above |
| `active` lists the anchor, `offered` is empty | The provider returned no tools for that state | Correct if the tools are gated on the snapshot; a bug if they are not |
| No `custom tools collected` line at all | No provider registered | The script did not run or returned early: check the `neptune.ia` guard and the object's placement |
| A `custom tool skipped` warn names it | Malformed tool | Fix what the warn names |

Putting a control on the denylist does **not** push the agent onto a custom tool. The denylist removes
the control's data from what the agent sees; the tools that act on that kind of control are still
offered, so the agent keeps them and loses the rows it needed to use them well.
