# The app object tree, and how to change it without breaking the app

`get_app` returns the design-time app: settings fields plus `objects`, the flat array that encodes the
App Designer tree (the keys, the numeric roots and the `fieldPos` rule are in `manage-apps` § The
object tree). `save_app` replaces `objects` **whole**. Below is only what this skill adds on top.

## An `AGENTS.md` object as the skill inserts it

```json
{
  "fieldNo": "c7761bca-d3a3-452b-f738-4d5bc0096702",
  "fieldName": "AGENTS.md",
  "fieldParent": "7ecf30b9-a829-4c0b-daff-4709c57b7612",
  "fieldPos": 2,
  "fieldType": "neptune.Markdown",
  "script": "## Return Request app\n…",
  "request": [],
  "response": [],
  "attributes": []
}
```

A new `fieldNo` is a fresh lowercase UUID; the anchor's `fieldNo` is copied exactly as a string;
`fieldPos` is the highest existing value plus one. The script object uses `"fieldName": "AgenticTools"`,
`"fieldType": "neptune.Script"` and `"fieldParent": 99999` (a number). `valueFormat`, `text`, `title`
and `press` handlers are read from each control's `attributes`.

**UI controls** (what can be an anchor) are objects whose `fieldType` starts with `sap.`, `nep.ai.`,
`nep.bootstrap.`, `neptune.ionic.` or `com.neptune.`. Folders, models, `neptune.BarContent` and
Markdown objects are not controls and are skipped when the anchor of a file is determined.

## What the skill inserts

| Artifact | Object | Parent | Type | Content |
|---|---|---|---|---|
| AGENTS.md | name exactly `AGENTS.md` | the anchor control's `fieldNo` (root control for app-wide) | `neptune.Markdown` | markdown in `script` |
| Custom tools | name `AgenticTools` | `99999` | `neptune.Script` | JavaScript in `script` |
| Description | field `description` on the app | | | plain text |
| Opt-out | field `disableIntelligence` (default false = on) | | | boolean |
| Denylist | `iaSettings.denylist: [{ "FIELD_NAME": "<control name>" }]` | | | `allowlist` exists in the same object but is **never applied**; do not populate it |

One `AGENTS.md` per anchor: update the existing object's `script` instead of adding a second one.
One `AgenticTools` script: update it instead of adding another.

## Invariants (a broken one = do not save)

- every object has `fieldNo`, `fieldName`, `fieldParent`, `fieldType`; `fieldNo` unique; `fieldPos` unique and present
- every `fieldParent` resolves to an object or is one of `0`, `99998`, `99999`
- one root UI control exists (the object with `fieldParent` `0`)
- no two script objects share a name
- the object count is the original count plus the objects added; the original objects are byte-identical

The content of each file is checked separately (`agents-md.md` § Check a file). Judgment calls to
read here: a file anchored to an `IconTabFilter`, a file whose anchor is on the denylist, a populated
allowlist.

## The write cycle

`save_app` → `activate_app` → `get_app` and compare (the skill's step 6).

- **Payload**: `save_app({ app: { id, application, appType, title, description, enableMultiDevelopment, objects } })`,
  every field as read except the description and the **complete** `objects`. Other fields are merged server-side, so CSS, UI5 settings and the
  package stay untouched. Sending `objects` partially deletes what is missing; omitting `objects`
  fails the save. Add `disableIntelligence` and `iaSettings` only when they changed.
- **Locks**: the save is refused when *another* user holds the App Designer lock on the app. Your own
  open designer tab does not block it, but that tab will overwrite the change if it is saved later:
  tell the developer to reload it without saving. `list_locks` shows who holds what.
- **Multi-development**: when `enableMultiDevelopment` is true, activation can fail with
  `multi_dev_conflict`; report it, do not retry blindly.
- **Activation errors** are the ones `manage-apps` lists (`sass_compilation_error`,
  `missing_custom_component`, …). None of them is caused by a Markdown object; a broken script is
  only detected in the browser, which is why the offline checks run first.
- **Rollback**: `save_app` with the original `objects` (and description), then `activate_app`.
- **Compare after re-read**: same object count; every new object present with the same name, type,
  parent and content; description as sent. Any difference means the server holds something else than
  intended; stop and show it.
