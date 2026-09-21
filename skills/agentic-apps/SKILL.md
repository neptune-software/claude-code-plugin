---
name: agentic-apps
description: Make a Neptune DXP App Designer app work well with Agentic Apps — write or review the app description the launchpad agent routes on, generate and place AGENTS.md files, register custom tools with `neptune.ia.registerTools`, set the per-app "Disable Agentic Apps" opt-out and the denylist, and verify the result — via the MCP tools `get_app`, `save_app`, `activate_app`, `list_apps`, `list_tiles`, `list_ai_agents`, `list_locks`, `get_system_info`. Use when the user says "make this app agentic", "AGENTS.md", "agent instructions for the app", "custom tool", "registerTools", "the agent can't see / doesn't know X", "the agent guessed a value", "the launchpad agent opens the wrong app", "app description for the agent", "denylist", "Disable Agentic Apps", or asks why the agent ignores an app. Read this BEFORE adding any AGENTS.md or tool script to an app — the file name, the anchor, the view key and the result shape all fail silently when wrong.
---

# Agentic Apps: describe, coach and equip an App Designer app

Agentic Apps (Neptune DXP - Open Edition 25.0) lets an AI agent read the running app's screen, act on
it with built-in tools, and verify the result. The agent works without any preparation. It works
**well** when the developer supplies three layers, and this skill produces all three from an interview
and the app definition:

| Layer | What it does | Where it lives | Read by |
|---|---|---|---|
| **App description** | Routes: it is the only text the launchpad agent has when it decides which app to open, and it also opens the in-app agent's prompt ("You are operating the <name> app, <description>") | `description` field of the app | both agents |
| **AGENTS.md files** | Operate: order of work, rules the screen does not show, stop points, how to talk; scoped to the part of the app they sit in | `neptune.Markdown` objects named exactly `AGENTS.md` in the object tree | in-app agent |
| **Custom tools** | Answer what the screen cannot express: counts over long tables, lookups in models, policy checks, server verbs | one `neptune.Script` object `AgenticTools` registering with `neptune.ia.registerTools` | in-app agent, WebMCP |

Plus two settings on the app: **Disable Agentic Apps** (`disableIntelligence`, default off = the app is
agentic) and the **denylist** of controls the agent must leave to the user (`iaSettings.denylist`).

Terminology: say **Agentic Apps**, **AGENTS.md files**, **custom tools**, **built-in tools**,
**denylist**, **Agentic Apps agent** (an agent with *Enable use with Agentic Apps* on), **Chatbox**,
**Agent Trace**. Field names stay as they are in the payloads (`disableIntelligence`, `iaSettings`, `neptune.ia`).

## Hard rules: what fails silently when wrong

All verified against a running 25.0 instance. Details in `reference/agents-md.md`,
`reference/custom-tools.md` and `reference/object-tree.md`.

1. **The file is named exactly `AGENTS.md`** and its content is not empty. Any other name is ignored
   without an error. `Agents.md` loads (the match is case-insensitive) but name it exactly anyway.
2. **It sits in the object tree as a child of a control, never in the Files group.** Files-group
   objects are moved out of the tree at activation; the file is never seen.
3. **The anchor is the nearest enclosing UI control** (folders and models are skipped). Under the root
   control = app-wide, always in scope while the app is on screen. Under a page = only while that page
   is active. Under a dialog = only while it is open. Under an `IconTabFilter` = on every tab, so
   anchor per-tab files to the container inside the tab.
4. **Files concatenate general-first, specific-last, later wins, with no header naming the file.** Every
   scoped file opens by saying which screen it is about, and never repeats the app-wide file.
5. **Stop points bind; values do not.** The agent honours a confirmation rule or a required order even
   when the user says "just do it". It never takes a value from the file that the user did not give.
   Write "ask for X", not "use X". Routing words go in the description, not here.
6. **Never `${…}`, `{{…}}` or level-1 `#` headings** inside a file (the platform interpolates the
   prompt and uses level-1 headings as section markers). Use `##`.
7. **Custom tools: `neptune.ia` can be absent** (app opted out, or a launchpad without an Agentic Apps
   agent). A bare `neptune.ia.registerTools(...)` throws while the app loads. Guard it.
8. **Anchor the tools on the app's own view, per version** (`get_system_info`). On 25.0 or an unknown
   version: `typeof localViewID !== 'undefined' ? localViewID : <RootControl>.getId()` — `localViewID`
   exists only inside a launchpad view, and inside one the root control's id does not match at app
   start. On a newer server: pass `<RootControl>` itself, which works in a launchpad and standalone
   alike; a control passed to a 25.0 server registers nothing. A wrong anchor is silent: the tools are
   registered and never offered.
   On 25.0 the agent plans control first and rarely considers a custom tool on its own, so **name every
   tool in an AGENTS.md rule** that says when to use it.
9. **Tool contract**: name of letters, digits, `_` and `-`, up to 57 characters, unique per app;
   parameter types only `string | number | boolean | date | array`; `execute` returns
   `{ toolId, success: boolean, message: string }`. Anything else is dropped or replaced by a failure.
10. **The provider runs on every iteration, on questions and for WebMCP.** It builds the list and
    changes nothing. Never write "call this tool every turn"; say when to call it.
11. **`save_app` replaces `objects` whole.** Send every object, insert new ones at `max(fieldPos) + 1`,
    change nothing else, and never save while another user holds the lock.
12. **`iaSettings.allowlist` exists in the payload but is never applied.** Only the denylist is enforced.
    Do not offer it.

## Workflow

Do the steps in order. Nothing is written to the server before step 5's approval.

### 0. Preconditions

- `get_system_info` → `release` must be 25.0 or higher. Below that, stop: the feature does not exist.
- `list_apps` with `where: { application }` → `id`, `appType`. `A` (application) and `C` (building
  block) have an object tree. `F` (Adaptive) is agentic by default but has no tree to place files in:
  say so and offer to coach the Adaptive template app instead. `L` launchpads and `E` custom
  components are out of scope.
- `list_locks` with `where: { objectID: <app id> }`: a lock held by **another** user blocks the save;
  ask the developer to have it released. Their own lock is fine, but their designer tab must be
  reloaded without saving afterwards.
- For the launchpad path, `list_ai_agents` with `where: { enableIntelligentApps: true }` tells you
  whether an Agentic Apps agent exists at all. Binding it to the launchpad is Cockpit-only
  (Launchpad → Agent tab → *Enable Agentic Apps* + *Agentic Apps Agent*); say that in the hand-over.

### 1. Read the app

`get_app({ id })` and keep the complete result: it is the base for the payload and the rollback copy.
If the result was too large and was persisted to a file, read that file. Walk `objects` by
`fieldParent` (each object names its parent's `fieldNo`; `0` is the root control's parent, `99999` the
Scripts root, `99998` the Files group) and write down for the developer:

- root control (the object whose `fieldParent` is `0`); its name is the standalone view key
- pages, dialogs and popovers (dialogs are often kept in a folder under the Scripts root `99999`;
  they are still valid anchors), tab filters and the first container inside each, panels
- buttons whose `attributes` carry a `press` event: the candidate stop points
- existing `AGENTS.md` objects and their anchors, scripts that already call `registerTools`,
  the `description`, `disableIntelligence`, `iaSettings.denylist`
- sharp edges present: `sap.m.DatePicker` and its `valueFormat` attribute, tables and lists
  (the snapshot carries 20 rows), `sap.m.ObjectListItem` rows (only title and text are captured),
  sliders, wizards, file uploads

For description disambiguation, `list_tiles` with `where: { actionApplication: <application> }` finds
the app's tiles; the other tiles of the same tile groups are the sibling apps the launchpad agent has
to choose between. Read their descriptions with `list_apps` (`select: { application, description }`).

### 2. Interview

One question per message, grounded in the map, multiple choice when the map gives the options. Skip
what the developer already told you.

| # | Question | Feeds |
|---|---|---|
| 1 | Who uses the app and for what job, in one sentence? | description, app-wide file |
| 2 | Which of these buttons write data or trigger something irreversible? (list the buttons from the map) | stop points, dialog files |
| 3 | What must the agent know that the screen does not show? Derived fields, policies, thresholds, codes, deadlines, fields it must never guess | app-wide rules, candidate tools |
| 4 | Sharp edges: confirm the detected ones (dates, long tables, list rows, sliders) and add any you know (disabled Submit, validations, toasts) | page files |
| 5 | Which screens get their own file? Default: every page and every dialog that writes; panels and tabs only with rules of their own | file set |
| 6 | Which questions should be answered in one call instead of from the screen? Default: none. Candidates come from answer 3 (counts, lookups by name, policy checks, reloads) | custom tools |
| 7 | Language of the files, and tone of the replies (the agent replies in the UI language by default) | app-wide "how to talk" |
| 8 | Any control the user must operate themselves? | denylist |

### 3. Draft

- **Description**: recipe below.
- **AGENTS.md set**: recipe and worked example in `reference/agents-md.md`. Budgets: app-wide ≤ 3,000
  chars, page or dialog ≤ 800, panel or tab ≤ 300.
- **Custom tools**: only for answer 6. Start from the template in `reference/custom-tools.md`. Two to
  five tools, one script object.

**Description recipe** (one paragraph, ≤ 600 chars, no technical name, no tile title):

1. The domain in two or three words. "Product returns."
2. "Use this app to <the verbs users say>: <the objects>, and to <the second job>."
3. The words users use when they mean this app. "This is the app for anything about returning,
   replacing, sending back or repairing something we received."
4. "Not for X, not for Y." naming the sibling apps it collides with.

The launchpad agent's catalogue is built from the technical name and this text only, cached for 60 s.
The same text opens the in-app agent's prompt, so it must read well as "You are operating the … app,
<description>".

### 4. Build the payload and check it

Add each artifact as a **new object appended to `objects`** (`reference/object-tree.md` has the shape):

```json
{ "fieldNo": "<new UUID, lowercase>", "fieldName": "AGENTS.md", "fieldParent": "<anchor fieldNo>",
  "fieldPos": <highest existing fieldPos + 1>, "fieldType": "neptune.Markdown",
  "script": "<the markdown>", "request": [], "response": [], "attributes": [] }
```

For the tools script use `"fieldName": "AgenticTools"`, `"fieldType": "neptune.Script"` and
`"fieldParent": 99999` (a number). The anchor's `fieldNo` is a string, copied exactly. To update an
existing `AGENTS.md` under the same anchor or an existing `AgenticTools`, replace that object's `script`
instead of adding a second object. Put the new description in the app's `description` field. Leave
every other object and field exactly as read.

Before the plan is shown, walk this list against the payload, item by item, and fix anything that fails:

- **Tree**: every `fieldParent` is an existing `fieldNo` or one of `0`, `99998`, `99999`; every
  `fieldNo` is unique; every `fieldPos` is unique; the object count equals the original count plus
  the objects you added; the original objects are unchanged.
- **Files**: named exactly `AGENTS.md`; content not empty; parent is a control (never `99998`, never a
  folder under it); one file per anchor; no `${`, no `{{`, no line starting with `# `; within budget;
  every scoped file opens by naming its screen; nothing from the app-wide file repeated.
- **Script**, read line by line: it starts with `(() => {` and ends with `})();`; the first statement
  inside returns when `neptune` or `neptune.ia` is missing; the anchor matches the server's version
  (`localViewID` only inside `typeof localViewID !== 'undefined' ? localViewID : <RootControl>.getId()`,
  or `<RootControl>` itself on a server newer than 25.0) with the real root control name; every custom
  tool is named in an AGENTS.md rule; nothing declared at column 0; every tool has a name of letters, digits, `_` and `-` up to 57
  characters, unique in the script; a description that says what it returns and when to call it;
  parameters with `type` in `string | number | boolean | date | array`, `required` as `true` or `false`
  and a `description`; `execute` wrapped in try/catch, returning `{ toolId, success, message }` on every
  path, with `message` a string; any data the tool reads is a model or control name that exists in the
  app; missing figures are excluded rather than treated as zero; no "call every turn" wording.
- **Description**: follows the recipe, names no technical name, and reads well after "You are operating
  the … app,".

### 5. Show the plan and get approval

One table, then the full texts:

| Artifact | Anchor / field | In scope when | Purpose |
|---|---|---|---|
| Description | `description` | always | routing + prompt opener |
| AGENTS.md | root control | app on screen | map, order of work, rules, stop points |
| AGENTS.md | `pageForm` | page active | form mechanics, disabled Submit |
| AGENTS.md | `DialogAssign` | dialog open | the two writes, read-back, confirm |
| Tool `findEquipment` | `AgenticTools` script | act turns | name → fleet number |

Below the texts, a **Checks** block: the four step-4 groups (tree, files, script, description), one line
each, stating what was checked and that it passed, with the object count before and after. A plan
without this block is not ready to show.

Write nothing until the developer says yes. If they change a text, redo step 4 for that artifact.

### 6. Write

1. `save_app({ app: { id, application, appType, title, description, enableMultiDevelopment, objects } })`
   with the **complete** `objects`; other fields merge server-side. Add `disableIntelligence` or
   `iaSettings` only when they changed.
2. `activate_app({ id })`: makes it live; the files are embedded at build time.
3. `get_app({ id })` again and compare with what was sent: same object count, every new object present
   with the same name, type, parent and content, the description as sent. Any difference: stop, show
   it, and do not claim success.

Rollback is `save_app` with the original `objects` and `description`, then `activate_app`. Activation
errors are the ones in `manage-apps`; none of them is caused by a Markdown object. A broken script only
shows in the browser, which is why the step-4 read-through is not optional.

### 7. Hand over the verification checklist

MCP cannot run the agent. Give the developer this list, filled in with the real names:

1. Launchpad path: the launchpad has *Enable Agentic Apps* on and an *Agentic Apps Agent* selected
   (Cockpit, Launchpad → Agent tab). Standalone path: a Chatbox with that agent is in the app and
   *Disable Agentic Apps* is unticked.
2. Open the app with `?iaDebug=true` in the URL (before any `#`) and send one request.
3. Console: an `app instructions` line appears once the app-wide text reached the agent;
   `custom tools collected { registered, active, offered }` lists the tool names under `active`
   (`active: []` with `registered` filled = wrong view key).
4. `neptune.ia.getAgentFiles()` in the console lists the files of the views on screen with their `path`.
5. Navigate to a page or open a dialog that has its own file and trigger one of its rules; go back and
   confirm the rule no longer applies.
6. Ask a question ("what does this screen do?"): the agent answers without acting and `offered: []`
   is normal on that turn.
7. From the launchpad home, describe the job without naming the app: the right app opens. Wait a
   minute after a description change; the catalogue is cached.
8. Agent Trace (Cockpit), Triggered From = `agentic-apps`: one row per iteration, with the prompt the
   agent received and every tool call.

## Symptoms

| Symptom | Cause | Fix |
|---|---|---|
| No `app instructions` line, `getAgentFiles()` empty | file not named `AGENTS.md`, empty, or in the Files group | rename / move under a control, activate again |
| Page file applies on every screen | anchored to an `IconTabFilter`, the root control, or a container that is always rendered | anchor to the page or the tab's content container |
| Dialog file never applies | file anchored to the dialog's folder or a sibling | anchor to the dialog control itself |
| `custom tools collected { registered: [...], active: [] }` | wrong anchor for the server's version | 25.0: the `localViewID` / root-control-id expression; newer: the root control itself |
| Tool offered (in the offered list) but never called | the description or instructions never say when to use it | "Use this whenever the user asks…" in the description, and an AGENTS.md rule naming the tool |
| Agent cannot sort a table the user can sort by clicking a header (25.0) | 25.0 cannot press app-built sortable column headers | a custom tool that returns the rows in the requested order; newer builds press the header |
| `custom tool skipped` in the console | name, description or execute invalid; duplicate name | see the reason in the log line |
| Tools never offered on a question | explain turns withhold custom tools | expected; ask the agent to do something |
| App opens blank or `localViewID is not defined` | script throws at load | the step-4 read-through missed a bare `localViewID`; add the `typeof` guard |
| Agent fills a value it was not given | files cannot enforce values | write "ask for X"; check the request itself |
| Agent skips the confirmation | rule missing or phrased as a description | write it as a stop point: "never press X in the turn that…; read back; ask" |
| Launchpad agent opens another app | description does not carry the users' words, or the sibling's does | sharpen the description; add "Not for …" to the sibling; wait 60 s |
| Agent reports a table as unavailable | `ObjectListItem` rows: only title/text are captured | a real Table, a StandardListItem, or a custom tool |
| Turn times out on a date field | agent opened the calendar popover | rule: type the date in the field's `valueFormat` (`yyyy-MM-dd` when unset), never open the calendar |
| `save_app` refused | another user holds the lock | have it released, then retry |
| `multi_dev_conflict` on activate | multi-development enabled and a conflicting change | report; resolve in the designer, do not retry blindly |

## What MCP cannot do here

- Run the agent, read Agent Trace, or see the browser console: the developer runs step 7.
- Bind an agent to a launchpad or add a Chatbox to an app: Cockpit only (`manage-ai-agents` covers the
  agent's own *Enable use with Agentic Apps* flag).
- Place files in an Adaptive app: no object tree; coach its template app.

## Permissions

`get_app`, `save_app`, `activate_app` need the `appdesigner` role (`Get`, `Save`); `list_ai_agents` needs
the `aiagent` role's `List` (see `manage-ai-agents`); `list_tiles` and `list_locks` need `List` on their
own artifact roles. A missing role comes back as a permission error on that one call, not as a
connection failure.

## Related skills

- **`manage-apps`**: the app artifact, `appType`, the save → activate cycle, activation errors, the object-tree anatomy.
- **`manage-ai-agents`**: the agent that drives the apps, `enableIntelligentApps`, `response_format: text`.
- **`dxp-overview`**: Cockpit vs Launchpad, where apps sit.
- **`search-docs`**: the public page "Agentic Apps" under AI agents in the Open Edition docs.
