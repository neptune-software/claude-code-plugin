---
name: manage-ai-guardrails
description: Create, configure, list, attach, version, or delete Neptune DXP AI guardrails — the AI Model, Script and Rules Engine checks on an AI agent's input and output — via the MCP tools `list_ai_guardrails`, `get_ai_guardrail`, `save_ai_guardrail`, `delete_ai_guardrail`, and attach them to agents with `save_ai_agent`. Use when the user wants to add a guardrail or content filter to an agent, write, change or roll back a guardrail's instructions, switch its model or script, order an agent's input and output guardrails, see which agents use a guardrail, find guardrails whose model or script was deleted, or remove one. Trigger phrases include "create a guardrail", "add a content filter", "input guardrail", "output guardrail", "roll back the guardrail prompt", "deny on error", "which agents use this guardrail", "delete the guardrail". Read this BEFORE any `save_ai_guardrail` payload — updates merge, `config` is replaced, and deleting the model or script a guardrail uses leaves it attached with that reference null.
---

# Managing Neptune DXP AI guardrails via MCP

An **AI guardrail** (Cockpit: Naia Agent Studio → Guardrails) is a check that an AI agent applies to the user's message (**input guardrail**) or to its own reply (**output guardrail**). It is its own artifact: configure it here, attach it on the agent with `save_ai_agent`. One guardrail can serve many agents, and a change applies to all of them — there is no activate step.

## Tools

| Tool | Behavior |
|---|---|
| `list_ai_guardrails` | Summaries: `id`, `name`, `description`, `type`, `model`, `script`, `rulesengine` (reference ids), `package`, `updatedAt`. `listOptions` see Listing. Never returns instructions, `config` or usage. |
| `get_ai_guardrail({ id })` | Full record: the scalars (incl. `config`); `modelObj` / `scriptObj` / `rulesengineObj` as `{ id, name }` or `null`; `prompt` = the active instruction `{ id, txt }` or `null`; `promptVersions` = `[{ id, status, createdAt, changedBy }]`, newest first, **without text**; `whereUsed.agents` = `[{ id, name }]` (input or output use — not which). |
| `save_ai_guardrail({ aiGuardrail })` | Create (no `id`) or update. Returns the record as `get_ai_guardrail` would, but without `whereUsed` and with `scriptObj` / `rulesengineObj` always `null` — check the `script` / `rulesengine` ids, or re-read (verified). |
| `delete_ai_guardrail({ id })` | Permanent; deletes its instruction versions and **detaches it from every agent without warning** (verified). Returns `{ "status": "AI guardrail deleted" }`; an unknown id fails with `Not Found` (verified). |

## The `save_ai_guardrail` contract

An update merges what you send into the stored guardrail (verified): send `id` plus the fields that change, not a record copied from `get_ai_guardrail`. Every save is checked against the merged result.

| Field | Rules |
|---|---|
| `id` | Omit to create. **Never send `"id": ""` — it creates a new guardrail** (verified). An unknown id fails with `AI Guardrail not found` — an update never creates (verified). |
| `name` | Required on create (missing: `Error saving ai_guardrail`; `""`: `String must contain at least 1 character(s) at aiGuardrail.name`); on an update, send it only to rename (verified). Unique — `name '<name>' already exists!` — but the database does the comparison: on PostgreSQL different-case and padded names count as different, and names of only spaces or of any length are stored (verified); other databases may treat case or trailing-space variants as the same name. **Use letters, digits and `_` only (the Cockpit's rule), at most 64 characters, and check the name is free first (see Listing for the `_` wildcard).** |
| `type` | `llm` (Cockpit: AI Model), `function` (Script), `rule_based` (Rules Engine). **Always send it on create** — the schema shows a default `llm`, but a create without `type` fails with the bare message `Required` (verified). **On an update, send `type` only to switch**, together with the new reference and `null` for the old one: `{ "id": "…", "type": "llm" }` alone re-types the guardrail silently whenever a `model` happens to be stored (verified). |
| `model` / `script` / `rulesengine` | The type's reference (see Types), required on every save: `model is required for guardrail type 'llm'` (also `script is required for guardrail type 'function'`, `rulesengine is required for guardrail type 'rule_based'`); `""` counts as missing (verified). **Send only the reference of the type** — the others are stored as well and then show up in filters and in the model's `whereUsed.guardrails` (verified). **Confirm the id with its own `get_*` tool first**: a nonexistent id, or the id of another kind of artifact, fails with the bare `Error saving ai_guardrail` (verified). |
| `prompt` | The instruction of an `llm` guardrail — see Instructions. **Send it only for `llm`**; the save also stores it as a version on the other types (verified for `function`). |
| `config` | `{ "denyOnError": true\|false }` (Cockpit: Deny on Error). **Replaced, not merged: send the full `config` or omit it** — `config: {}` or `null` stores `denyOnError: false`; other keys are dropped (verified). |
| `description`, `version` | Free text. `description` is stored exactly as sent, no trimming (verified). `ver` is the server's save stamp. |
| `package` | Package id. On create without it: your default development package when one is set and you may edit it, otherwise none (verified for the no-default case). `package: null` removes it unless the instance requires packages (verified). Moving an `llm` guardrail to another package moves its versions; `package: null` leaves them in the old package (verified). |

Silently ignored — no error, nothing stored (verified): `NAME`, `title`, `application`, `accessLevel`, `includeDataInPackage`, the server fields (`ver`, `createdBy`, `changedBy`, timestamps), the read-only parts of the get response, and unknown keys. Agents cannot be attached from the guardrail side.

Also on save and delete: `<name> is locked by <user> since <time>` when someone holds the guardrail's lock (Cockpit edit mode or `create_lock`; your own lock passes, verified); package errors `No edit access to artifact`, `Cannot assign artifact to system package`, `Package is a required field`, `Your default package cannot be used: …`, and the template-package refusals.

## Types

| `type` | Reference | Configuration rules |
|---|---|---|
| `llm` (AI Model) | `model` | A completion model — pick it with `list_ai_models` and `where: { "outputType": "text" }`; the save also accepts an embedding model (verified). Give it instructions (`prompt.txt`): the save accepts an `llm` guardrail without any. |
| `function` (Script) | `script` | A server script implementing the contract below (`manage-server-scripts`). |
| `rule_based` (Rules Engine) | `rulesengine` | A Rules Engine with the interface property `content` (optionally `username`) whose rules return `deny` to block. No MCP tool lists Rules Engines: take the id from the Cockpit or from an existing `rule_based` guardrail's `rulesengine` (verified). |

Script contract of a `function` guardrail:

```js
// in:  payload.content (the text checked), payload.stage ("input" | "output" | "test"), payload.userInfo (calling user)
// out: assign result itself — false or { allow: false, reason: "…" } fails; anything else passes, including
//      result.data = false or leaving result untouched. There is no req object: use payload.userInfo.
const text = (payload.content || '').toLowerCase();
result = text.includes('starship') ? { allow: false, reason: 'This topic is not allowed.' } : true;
```

```json
save_ai_guardrail({ "aiGuardrail": {
  "name": "block_project_starship",
  "type": "llm",
  "model": "<completion model id>",
  "package": "<package id>",
  "prompt": { "txt": "Do not allow any message that mentions the STARSHIP product or relates to it. Give a generic reason." },
  "config": { "denyOnError": true }
}})
```

## Instructions (`prompt`, `llm` only)

| You send | Effect |
|---|---|
| `{ "txt": "<text>" }` that differs from the **newest** version | New version, the only `active` one; the text is trimmed before it is compared and stored (verified). |
| `{ "txt": … }` equal to the newest version's text | No new version; the newest version is re-activated if needed (verified). |
| `{ "id": "<version id>" }` | **Rollback**: that version becomes the only active one; no new version (verified). |
| `{ "id": "…", "txt": "…" }` | Same text as that version → no new version (verified), and that version becomes active; different text → new version (verified). |
| `prompt` omitted, `{}`, `null` or blank `txt` | Instructions untouched; saves of other fields never add a version (verified). |
| `id` of another guardrail's version, or an unknown id | **Silently ignored** (success, verified). After a rollback, check `prompt.id` in the response. |

- **After a rollback the active version is no longer the newest**: re-sending its text with `txt` alone creates a copy as a new version (verified). Omit `prompt` to keep it, and use `{ "id": … }` to switch versions.
- Only the active text is readable (`prompt.txt`). Versions cannot be deleted one by one; they go with the guardrail.
- Sending `prompt` also needs edit permission on AI Prompts. After any `Error saving ai_guardrail`, re-read the guardrail: the other fields of that save may already be stored.

## Assigning guardrails to agents

On `save_ai_agent` (`manage-ai-agents`): `inputGuardrails` (the user's message) and `outputGuardrails` (the reply), each `[{ "id": "<guardrail id>" }]`.

- **Array order = execution order**, stored as sent (verified).
- **Present = replaced, absent = untouched, `[]` = cleared**, each array separately (verified). To add one, send the full array from `get_ai_agent`, which returns both in order as `[{ id, name, description, updatedAt, changedBy }]` (verified). The same guardrail may be in both arrays.
- **Before attaching, `get_ai_guardrail` every id**: it must exist, appear once per array, and its type's reference must be non-null. A duplicate, a nonexistent id or a non-guardrail id fails the whole save with the bare `Error saving ai_agent` (verified); a guardrail whose model or script was deleted is attached without warning (verified).
- Ids are objects — a bare string fails with `… Expected object, received string at aiAgent.inputGuardrails[0]` (verified). **Never send `inputGuardrailsMap` / `outputGuardrailsMap`** — both are refused with `Error saving ai_agent` (verified; an empty one passes only when that list is already empty).

```json
save_ai_agent({ "aiAgent": { "id": "<agent id>",
  "inputGuardrails": [{ "id": "<rule guardrail id>" }, { "id": "<script guardrail id>" }, { "id": "<llm guardrail id>" }],
  "outputGuardrails": [{ "id": "<llm guardrail id>" }] } })
```

## Workflows

**Create and attach**: check the name is free → `get_*` the model / script / rules engine → `save_ai_guardrail` with `type`, the one reference, `config` and (for `llm`) `prompt.txt` → check the response (`type`, the reference id, `config`, `prompt`) → `get_ai_agent` → `save_ai_agent` with the full array including the new id → `get_ai_guardrail` lists the agent in `whereUsed.agents`.

**Change or roll back the instruction**: `{ "id": "…", "prompt": { "txt": "<new full text>" } }`, or `{ "id": "…", "prompt": { "id": "<version id from promptVersions>" } }` and confirm `prompt.id`.

**Switch the type**: `{ "id": "…", "type": "function", "script": "<script id>", "model": null }` — without the `null` the old reference stays stored and the guardrail stays in that model's `whereUsed.guardrails` (verified).

**Before deleting a model or a server script**: list the guardrails that reference it — `list_ai_guardrails({ "listOptions": { "where": { "model": "<id>" } } })` (or `script`; for models also `get_ai_model` → `whereUsed.guardrails`) — and repoint them. Neither `delete_ai_model` nor `delete_server_script` warns or refuses because of guardrails (verified).

**Audit**: a guardrail whose model or script was deleted keeps its `type`, shows that reference as `null` and stays attached to its agents (verified for models and scripts; a deleted Rules Engine is cleared the same way). Every save of it fails with `<field> is required for guardrail type '<type>'` until it gets a new reference. Find them:

```json
list_ai_guardrails({ "listOptions": { "where": { "type": "llm", "model": { "operation": "IsNull" } } } })
list_ai_guardrails({ "listOptions": { "where": { "type": "function", "script": { "operation": "IsNull" } } } })
list_ai_guardrails({ "listOptions": { "where": { "type": "rule_based", "rulesengine": { "operation": "IsNull" } } } })
```

Repair with `{ "id": "…", "model": "<completion model id>" }` (or `script` / `rulesengine`) (verified); `whereUsed.agents` shows the agents affected.

**Delete**: `get_ai_guardrail` → if `whereUsed.agents` is non-empty, name the agents and get the user's confirmation → `delete_ai_guardrail` → `get_ai_guardrail` returns `Not Found`.

## Listing and filtering

Filterable and sortable: `name`, `type`, `description`, `version`, `model`, `script`, `rulesengine`, `package`, `createdBy`, `changedBy`, `createdAt`, `updatedAt`; several `where` fields combine with AND.

- **Fetch one guardrail with `get_ai_guardrail`.** A `where` key outside the list (`id`, `config`, anything unknown) is dropped without error while the other filters still apply — `where: { "id": … }` alone returns the whole list (verified).
- `select` takes the fields above plus `id`, each `true` (`false` fails validation). Unknown keys and `config` are dropped; `id` always comes back, and if no valid key is left the default summary comes back (verified).
- **Put the sort field in `select`**: ordering by a field the response does not contain fails with `Error listing ai_guardrail` — the summary has no `createdAt` (verified).
- **Always send `order` when paging**; without it pages overlap and skip rows (verified). Walk pages with `skip` = `nextSkip` while `hasMore` is true. `take` defaults to 25 (verified) and is capped at 200; `0` or less counts as 1, without error (verified).
- **Use UUIDs in id filters** (`model`, `script`, `rulesengine`, `package`) — a malformed value fails with `Error listing ai_guardrail` (verified).
- Exact matches and `Like` are case-sensitive on PostgreSQL; use `ILike` for names (verified). **`_` and `%` are wildcards in `Like`/`ILike`**: to check that `my_guard` is free, compare each returned `name` exactly.
- Non-administrators see only guardrails in packages their roles may read, while names are unique across all packages — an empty name check can still end in `already exists`.

## Errors

| Signal | Meaning / fix |
|---|---|
| `Required` | Create without `type`. |
| `model is required for guardrail type 'llm'` (also `script …'function'`, `rulesengine …'rule_based'`) | The type's reference is missing — on create, when cleared, or on any save after the referenced artifact was deleted. Send a valid reference. |
| `name '<name>' already exists!` | Duplicate name (possibly in a package you cannot see). |
| `AI Guardrail not found` | `save_ai_guardrail` with an unknown `id`. |
| `Not Found` | `get_ai_guardrail` / `delete_ai_guardrail` with an unknown id. |
| `No access to artifact` / `No edit access to artifact` | `get_ai_guardrail` / `delete_ai_guardrail` on a guardrail in a package your roles cannot read / edit. |
| `MCP error -32602: Input validation error: … Invalid uuid at aiGuardrail.model` | An id that is not a UUID (`id`, `model`, `script`, `rulesengine`, `package`, `prompt.id`). Nothing saved. |
| `… Invalid enum value. Expected 'llm' \| 'rule_based' \| 'function', received '<x>' at aiGuardrail.type` / `… Expected boolean, received string at aiGuardrail.config.denyOnError` | Wrong `type` / `denyOnError`. |
| `Error saving ai_guardrail` | A reference or package id that does not exist or is another kind of artifact, a create without `name`, a name too long for the database, or a `prompt` without AI Prompts edit permission. Re-read before retrying. |
| `Error saving ai_agent` | Attaching: a duplicate, nonexistent or non-guardrail id, or `inputGuardrailsMap` / `outputGuardrailsMap`. Nothing changed. |
| `Error listing ai_guardrail` | `order` on a field not in `select`, or a malformed filter value. |
| `Access denied: no permission for aiguardrail` | Missing Guardrails permission. |

## What MCP can NOT do

- Run or test a guardrail (Cockpit: Guardrails → Test).
- Create, list or edit Rules Engines and their rules.
- Read the text of inactive versions, or delete single versions.
- Filter the list by usage (attached or not, which agent) or by `config` — `get_ai_guardrail` each candidate.
- Attach a guardrail from the guardrail side, or tell from `whereUsed` whether an agent uses it as input or output (`get_ai_agent` does).
- Warn when the model, script or Rules Engine a guardrail uses is deleted — check first (Workflows).

## Permissions

All four tools need the Guardrails permission (`aiguardrail`; Naia Agent Studio → Guardrails): list and get with display access, save (`Save`) and delete (`Del`) with edit access. `prompt` also needs edit access to AI Prompts (`aiprompt`, `Save`); role-protected packages need package edit access. Attaching is a `save_ai_agent` (`aiagent`). Guardrails have no roles of their own.

## Related skills

- **`manage-ai-agents`** — `inputGuardrails` / `outputGuardrails` and the rest of the agent.
- **`manage-ai-models`** — the completion model of an `llm` guardrail; `whereUsed.guardrails` before deleting a model.
- **`manage-server-scripts`** — the script of a `function` guardrail; list the guardrails using a script before deleting it.
- **`dxp-overview`** — packages and the artifact model.
