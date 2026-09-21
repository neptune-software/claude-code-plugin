---
name: agentic-apps
description: Make a Neptune DXP App Designer app work well with Agentic Apps — write or review the app description the launchpad agent routes on, generate and place AGENTS.md files, register custom tools with `neptune.ia.registerTools`, set the per-app "Disable Agentic Apps" opt-out and the denylist, and verify the result — via the MCP tools `get_app`, `save_app`, `activate_app`, `list_apps`, `list_tiles`, `list_ai_agents`, `list_locks`, `get_system_info`. Use when the user says "make this app agentic", "AGENTS.md", "agent instructions for the app", "custom tool", "registerTools", "the agent can't see / doesn't know X", "the agent guessed a value", "the launchpad agent opens the wrong app", "app description for the agent", "denylist", "Disable Agentic Apps", or asks why the agent ignores an app. Read this BEFORE adding any AGENTS.md or tool script to an app — the file name, the file's anchor, the tool anchor and the result shape all fail silently when wrong.
---

# Agentic Apps: describe, coach and equip an App Designer app

Agentic Apps (Neptune DXP - Open Edition 25.0; docs page "Agentic Apps" under AI agents) works on an
App Designer app with no preparation. It works **well** when the developer supplies three layers; this
skill produces all three from an interview and the app definition:

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

Each one is verified on a running 25.0 instance; the reference files carry the detail and how to see it.

1. **The file is named exactly `AGENTS.md`**, is not empty, and is a child of a UI control in the object
   tree — never in the Files group, whose objects leave the tree at activation. A wrong name, an empty
   file or the Files group: ignored without an error.
2. **The anchor is the nearest enclosing UI control.** Root control = app-wide; a page = while that page
   is active; a dialog = while it is open; an `IconTabFilter` = on every tab, so per-tab files go on
   the container inside the tab.
3. **Files concatenate general-first, specific-last, with no header naming the file.** Every scoped
   file opens by naming its screen and repeats nothing from the app-wide file.
4. **Stop points bind; values do not.** Write "ask for X", never "use X". Routing words belong in the
   description, not in a file.
5. **Never `${…}`, `{{…}}` or a level-1 `#` heading** in a file. Use `##`.
6. **Call `neptune.ia?.registerTools(…)`, with `?.`.** `neptune.ia` is absent when the app opted out or
   the launchpad has no Agentic Apps agent, and a call without `?.` throws while the app loads.
7. **Anchor the tools on the app's root control itself**: `neptune.ia?.registerTools(<RootControl>, …)`.
   Not an inner control, and never a bare `localViewID`, which throws on a standalone page. A wrong
   anchor is silent: registered, never offered.
8. **Keep the tool contract** in `reference/custom-tools.md`. Anything outside it is dropped or
   replaced by a failure, with only a console warning.
9. **The provider runs on every iteration, on questions and for WebMCP.** It builds the list and
   changes nothing. Say when to call a tool, never "every turn".
10. **`save_app` replaces `objects` whole.** Send every object, add new ones at `max(fieldPos) + 1`,
    change nothing else, and never save while another user holds the lock.
11. **Denylist single controls, never a container**: denying a layout removes every control inside it.
    To steer the agent away from an area, use a scoped file. `iaSettings.allowlist` exists in the
    payload and is never applied; do not offer it.

## Workflow

Do the steps in order. Nothing is written to the server before step 5's approval.

### 0. Preconditions

- `get_system_info`: the reported release must be 25.0 or higher. Below that, stop: the feature does
  not exist.
- `list_apps` with `where: { application }` → `id`, `appType` (codes in `manage-apps`). `A` and `C`
  have an object tree. `F` (Adaptive) is agentic by default but has no tree to place files in: say so
  and offer to coach the Adaptive template app instead. `L` and `E` are out of scope.
- `list_locks` with `where: { objectID: <app id> }`: a lock held by **another** user blocks the save;
  ask the developer to have it released. Their own lock is fine, but their designer tab must be
  reloaded without saving afterwards.
- For the launchpad path, `list_ai_agents` with `where: { enableIntelligentApps: true }` tells you
  whether an Agentic Apps agent exists at all. Binding it to the launchpad is Cockpit-only
  (Launchpad → Agent tab → *Enable Agentic Apps* + *Agentic Apps Agent*); say that in the hand-over.

### 1. Read the app

`get_app({ id })` and keep the complete result: it is the base for the payload and the rollback copy.
If the result was too large and was persisted to a file, read that file. Walk `objects` by
`fieldParent` (keys and numeric roots: `manage-apps` § The object tree) and write down for the
developer:

- root control (the object whose `fieldParent` is `0`); custom tools are anchored on it by this name
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
- **AGENTS.md set**: recipe, budgets and worked example in `reference/agents-md.md`.
- **Custom tools**: only for answer 6. Start from the template in `reference/custom-tools.md`. Two to
  five tools, one script object.

**Description recipe** (one paragraph; no technical name, no tile title; this skill keeps it under
about 600 characters so the launchpad agent's catalogue stays readable across all its apps):

1. The domain in two or three words. "Product returns."
2. "Use this app to <the verbs users say>: <the objects>, and to <the second job>."
3. The words users use when they mean this app. "This is the app for anything about returning,
   replacing, sending back or repairing something we received."
4. "Not for X, not for Y." naming the sibling apps it collides with.

The launchpad agent's catalogue is built from the technical name and this text only, cached for 60 s.
The same text opens the in-app agent's prompt, so it must read well as "You are operating the … app,
<description>".

### 4. Build the payload and check it

Add each artifact as a new object appended to `objects`, exactly as `reference/object-tree.md` § What
the skill inserts specifies; an existing `AGENTS.md` under the same anchor, or an existing
`AgenticTools`, gets its `script` replaced instead of a second object. Put the new description in the
app's `description` field. Leave every other object and field exactly as read.

Before the plan is shown, walk these lists against the payload, item by item, and fix anything that
fails:

- **Tree**: `reference/object-tree.md` § Invariants.
- **Each file**: `reference/agents-md.md` § Check a file.
- **The script**, line by line: `reference/custom-tools.md` § Check before saving.
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

`save_app` with the complete `objects`, then `activate_app`, then `get_app` again and compare with what
was sent. The payload, the lock rule, the compare rule and the rollback are in
`reference/object-tree.md` § The write cycle. Any difference between sent and re-read: stop, show it,
and do not claim success. A broken script never fails activation, it only shows in the browser — which
is why step 4 is not optional.

### 7. Hand over the verification checklist

MCP cannot run the agent. Give the developer this list, filled in with the real names:

1. Launchpad path: the launchpad has *Enable Agentic Apps* on and an *Agentic Apps Agent* selected
   (Cockpit, Launchpad → Agent tab). Standalone path: a Chatbox with that agent is in the app and
   *Disable Agentic Apps* is unticked.
2. Open the app with `?iaDebug=true` in the URL (before any `#`) and send one request.
3. Console: an `app instructions` line appears once the app-wide text reached the agent;
   `custom tools collected { registered, active, offered }` lists the tool names under `active`
   (`active: []` with `registered` filled = wrong anchor); `tools offered` is exactly what the model
   was sent that iteration, also returned by `neptune.ia.getOfferedTools()`.
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
| `custom tools collected { registered: [...], active: [] }` | wrong anchor, usually an inner control | anchor on the app's root control itself |
| Tool offered (in the offered list) but never called | the description or instructions never say when to use it | "Use this whenever the user asks…" in the description, and an AGENTS.md rule naming the tool |
| `custom tools collected { active: [...], offered: [] }` on an act turn | the provider returned no tools for that state | right if the tools are gated on the snapshot; otherwise a bug in the provider |
| No `custom tools collected` line at all | no provider registered: the script did not run or returned early | check the `neptune.ia` guard and that the script object sits under the Scripts root |
| `custom tool skipped` in the console | name, description or execute invalid; duplicate name | see the reason in the log line |
| Tools never offered on a question | explain turns withhold custom tools | expected; ask the agent to do something |
| App opens blank or `localViewID is not defined` | a script passes a bare `localViewID`, which is undeclared on a standalone page | anchor on the root control instead |
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

As in `manage-apps` (`appdesigner`: `Get`, `Save`) and `manage-ai-agents` (`aiagent`: `List`). A missing
role comes back as a permission error on that one call, not as a connection failure.

## Related skills

- **`manage-apps`**: the app artifact, `appType`, the save → activate cycle, activation errors, the object-tree anatomy.
- **`manage-ai-agents`**: the agent that drives the apps, `enableIntelligentApps`, `response_format: text`.
- **`dxp-overview`**: Cockpit vs Launchpad, where apps sit.
- **`search-docs`**: the public page "Agentic Apps" under AI agents in the Open Edition docs.
