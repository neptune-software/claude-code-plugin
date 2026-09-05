---
name: manage-ai-tools
description: Create, update, inspect, or delete Neptune DXP AI tools — the Script, API, Web Search, Table, Email, PDF and Chart capabilities an AI agent can call — via the MCP tools `list_ai_tools`, `get_ai_tool`, `save_ai_tool`, `delete_ai_tool`. Use when the user wants to give an agent a new capability, expose a server script, an API operation, a table, an email template or a PDF template to an agent, change a tool's prompt, parameters or configuration, see which agents use a tool, or remove one. Trigger phrases include "create an AI tool", "script tool", "table tool", "API tool", "web search tool", "let the agent send emails", "let the agent generate a PDF", "chart tool", "which agents use this tool", "update the tool prompt", "rename the tool", "delete the AI tool". Read this BEFORE composing any `save_ai_tool` payload — `config` is validated per tool type and replaced wholesale.
---

# Managing Neptune DXP AI tools via MCP

An **AI tool** (Cockpit: Naia Agent Studio → AI Tools) is one capability an AI agent can call: run a server script, call an API operation, search the web, read or write a table, send an email, generate a PDF, or draw a chart. A tool is its own artifact; it does nothing until an agent lists it under `tools` (see `manage-ai-agents`). `save_ai_tool` writes the same record the Cockpit's AI Tools app edits, and agents pick the change up on their next request — there is no activate step.

At run time the agent's model sees each tool as a **function**: the tool's `name` is the function name and its `prompt` is the function description the model reads to decide when to call it. Everything else in the record decides what happens when it does.

## Tools

| Tool | Behavior |
|---|---|
| `list_ai_tools` | Tool summaries (`id`, `name`, `type`, `description`, `version`, `package`, `createdBy`, `changedBy`, `createdAt`, `updatedAt`). Supports `listOptions` (`where`/`select`/`take`/`skip`/`order`) to filter, project, and sort by field. **Never returns `prompt`, `config`, `displayName` or `roles`** — use `get_ai_tool`. |
| `get_ai_tool({ id })` | The full record — `prompt`, `config`, `displayName`, `roles` (`{id, name}`) — plus **`agents`**: the agents this tool is assigned to (`id`, `name`, `description`, `changedBy`, `updatedAt`). Id only; look names up with `list_ai_tools`. |
| `save_ai_tool({ aiTool })` | Create (no `id`) or update (with `id`). Returns the saved record (roles reduced to `{id, name}`) — the persisted state; compare it with what you sent. |
| `delete_ai_tool({ id })` | Permanent, no undo, **no confirmation and no refusal** — a tool still assigned to agents is removed from all of them silently. Returns `{ "status": "AI tool deleted" }`. |

## The `save_ai_tool` contract

| Field | Rules |
|---|---|
| `id` | Omit to create, include to update. An `id` that does not exist **creates** a record with that id — confirm with `get_ai_tool` when you intend update-only. Copy ids exactly as returned, including case. |
| `name` | Required on create, **unique**, max 64 characters. For **every type** this is the **function name the model calls**, so use only letters, digits, `_` and `-`, no spaces, verb-first (`getOpenTickets`, `send_customer_email`); put the human-readable title in `displayName`. The platform does not validate the charset — a name with spaces or dots saves fine and is rejected by the model provider at run time. |
| `type` | Required on create: `SCRIPT`, `API`, `WEBSEARCH`, `TABLE`, `EMAIL`, `PDF`, `CHART` (Cockpit labels: Script, API, Web Search, Table Definition, Email, PDF, Chart). Never inferred — omitting it fails with `type is required`; ask the user which kind. Do not change the type of an existing tool; create a new one. |
| `prompt` | **The description the model reads** — when and why to call the tool, what it returns. The Cockpit requires it for every type except `TABLE` (whose description is generated from the table at run time). Concrete and specific; a weak prompt is the main reason a tool is never called. |
| `description` | Human description shown in lists. Used as the model-facing text only when `prompt` is empty. |
| `displayName` | Friendly label shown in the chat UI when the tool fires, instead of `name`. Not used for `TABLE` (each operation has its own `displayName`). |
| `config` | Type-specific object (next section). **Validated against the type's shape on every create (an omitted `config` is validated as `{}`) and on every update that carries `config`; replaced wholesale — never merged.** An unknown key at the top level of `config` fails the save with `Invalid config for tool type <TYPE>: <detail>`; unknown keys nested inside a parameter or an operation are dropped silently. Omit `config` on an update to keep the stored one. |
| `roles` | `[{ "id": "<role uuid>" }]`. When non-empty, only users holding one of the roles get the tool at run time (the agent still runs, without it). `roles: []` removes the restriction. Role ids are not discoverable over MCP — take them from the Cockpit or from an existing artifact's `roles`. |
| `agents` | **Read-only here.** Which agents use the tool is set on the agent (`save_ai_agent` → `tools`). |
| `version` | Free text you maintain (`"1.2"`). `ver` is the server's own save stamp. |
| `package` | Development package id (`list_packages`). On create, omitting it applies your default package when you may edit it; if the instance requires packages you get `Your default package cannot be used: …` — pass an explicit `package`. |
| `id`, `ver`, `createdBy`/`changedBy`, `createdAt`/`updatedAt` | Server-managed. Unknown top-level keys are stripped silently. |

Also on every save and delete: a duplicate name fails with `name '<name>' already exists!`; an artifact someone has open in the Cockpit fails with `<name> is locked by <user> since <time>` (see `list_locks` / `delete_lock`; your own lock passes); a role-protected package you cannot edit fails with `No edit access to artifact`.

## Config per type

| `type` | `config` shape (top level exact — extra keys fail) | Required to **save** | Required to **work at run time** (save does not check; a tool that fails this is silently skipped when the agent runs and logged in Agent Trace / system logs) |
|---|---|---|---|
| `SCRIPT` | `{ "serverScript": "<script id>", "parameters": { "<name>": Param } }` | — | `serverScript` set **and** `parameters` present (may be `{}`) |
| `API` | `{ "apiId": "<API id>", "operationId": "<path id>" }` | — | both set |
| `WEBSEARCH` | `{ "numResults", "context", "maxCharactersContext", "summary", "text", "maxCharactersText", "includeDomains"?, "excludeDomains"? }` | — | `numResults` ≥ 1; Exa enabled in System Settings → AI |
| `TABLE` | `{ "entityId": "<table definition id>", "operations": { "C", "R", "U", "D" } }` | `entityId`; `R` enabled whenever `U` or `D` is enabled | `operations` present with **all four keys** (see TABLE) |
| `EMAIL` | `{ "templateId": "<email template id>" }` or `{}` | — | the template, if set, must exist; emailing configured in System Settings |
| `PDF` | `{ "pdfId": "<PDF template id>" }` | `pdfId` | the PDF template must exist |
| `CHART` | `{}` | — | — |

Where the ids come from: `serverScript` → `list_script_projects` / `list_ungrouped_scripts` (`manage-server-scripts`); `apiId` + `operationId` → `get_api({ id }).api.paths[].id` (`manage-apis`); `entityId` and the field list → `list_tables` / `get_table` (`manage-tables`); `pdfId` → `list_pdf_templates`; `templateId` → the Cockpit's Email Template tool, or `list_email_templates` where the instance exposes it. **Pass every id exactly as the tool returned it** — do not change its case.

### `SCRIPT` — run a server script

```json
save_ai_tool({ "aiTool": {
  "name": "checkWarranty",
  "type": "SCRIPT",
  "displayName": "Check warranty",
  "description": "Looks up the warranty status of a customer's devices",
  "prompt": "Check the warranty status of one customer's devices. Call this when the user asks whether a device or a customer is still under warranty. Returns one entry per serial number with status and end date.",
  "config": {
    "serverScript": "<script id>",
    "parameters": {
      "customerNo": { "name": "customerNo", "type": "string", "required": true, "description": "The customer number, e.g. C-10023" },
      "serialNumbers": { "name": "serialNumbers", "type": "array", "required": false, "description": "Serial numbers to check; all devices when omitted",
                         "items": { "name": "serialNumber", "type": "string", "description": "One device serial number" } },
      "options": { "name": "options", "type": "object", "required": false, "description": "Optional filters",
                   "properties": { "includeExpired": { "name": "includeExpired", "type": "boolean", "description": "Also return expired contracts" } } }
    }
  }
}})
```

- `parameters` is an object keyed by parameter name (not an array). Each value: `{ "type": "string" | "number" | "boolean" | "object" | "array", "required"?, "description"?, "name"?, "properties"? (object children, keyed by name), "items"? (the array's single element definition) }`. Every parameter needs a `description` — it is what the model reads (the Cockpit also requires the `name`). An `array` needs exactly one `items` definition or the tool fails to generate (`Array parameter '<name>' is missing items property`); an `object` without `properties` accepts any keys. `required` defaults to false (optional for the model).
- Inside the script, the model's arguments arrive as **`payload`** (`payload.customerNo`, `payload.serialNumbers`, plus `payload.metadata` = `{ name, id }` of the tool), and the script hands its answer back by assigning **`result`** (a string or an object — the whole value is returned to the agent). This is a different contract from an HTTP script: no `req.body`, no `result.data`. Saving the tool does not change the script; the script must implement this input contract (`manage-server-scripts`).
- Always send `parameters` — a SCRIPT tool saved without it is accepted and then ignored at run time.

### `API` — call one API operation

```json
save_ai_tool({ "aiTool": {
  "name": "getCrmWarranty",
  "type": "API",
  "prompt": "Fetch the warranty record for a customer from the CRM. Call it with the customer number; returns contract dates and coverage.",
  "config": { "apiId": "<API id>", "operationId": "<path id from get_api>" }
}})
```

- The model's input schema is **generated from the API definition**: the operation's `parameters` become `queryParams` (path parameters are filled into the URL), and for `POST`/`PUT` operations the first request-body definition becomes `requestBody`. Other methods get no body. The parameter and property descriptions in the API are what the model sees — fill them in with `manage-apis` first.
- The operation is matched by `operationId` exactly (case included); the call runs through the platform's API layer with the API's authentication, endpoints and tracing, and returns the response body.

### `WEBSEARCH` — search the web (Exa)

```json
save_ai_tool({ "aiTool": {
  "name": "searchNeptuneDocs",
  "type": "WEBSEARCH",
  "prompt": "Search the Neptune DXP documentation for how a feature works. Use it for how-to and reference questions about Neptune DXP.",
  "config": { "numResults": 3, "context": true, "maxCharactersContext": 2000, "summary": false, "text": false, "maxCharactersText": 200,
              "includeDomains": ["docs.neptune-software.com"] }
}})
```

- Cockpit defaults: `numResults 1`, `context false`, `maxCharactersContext 200`, `summary false`, `text false`, `maxCharactersText 200` — send the intended values explicitly. `context` returns page content for the model; `summary` asks Exa for an AI summary (Exa-side cost); `text` returns full page text; the `maxCharacters*` values cap each result. Use **either** `includeDomains` (allow-list) **or** `excludeDomains` (deny-list), as the Cockpit does.
- At run time the model supplies `query` and may add `includeDomains`, `excludeDomains` and a published-date range; the tool's own domain list is merged with the model's only for the list the tool defines.
- Requires the Exa.ai integration (System Settings → AI → Exa search engine: API key + enabled); the save does not check it. Without it the tool answers `Websearch capability is not enabled…`. `numResults` must be at least 1 or the tool is skipped.

### `TABLE` — read, create, update, delete rows of a table definition

```json
save_ai_tool({ "aiTool": {
  "name": "supportTickets",
  "type": "TABLE",
  "description": "Support tickets for the agent",
  "config": {
    "entityId": "<table definition id>",
    "operations": {
      "R": { "enabled": true, "displayName": "Look up tickets", "fields": [
        { "fieldName": "ticketNo", "fieldType": "text", "included": true },
        { "fieldName": "subject", "fieldType": "text", "included": true },
        { "fieldName": "status", "fieldType": "text", "included": true },
        { "fieldName": "priority", "fieldType": "text", "included": true },
        { "fieldName": "customerNo", "fieldType": "text", "included": true },
        { "fieldName": "internalNotes", "fieldType": "mediumtext", "included": false },
        { "fieldName": "createdAt", "fieldType": "bigint", "included": true },
        { "fieldName": "updatedAt", "fieldType": "bigint", "included": false },
        { "fieldName": "createdBy", "fieldType": "text", "included": false },
        { "fieldName": "updatedBy", "fieldType": "text", "included": false } ] },
      "U": { "enabled": true, "displayName": "Update a ticket", "fields": [
        { "fieldName": "status", "fieldType": "text", "included": true },
        { "fieldName": "priority", "fieldType": "text", "included": true },
        { "fieldName": "subject", "fieldType": "text", "included": false },
        { "fieldName": "customerNo", "fieldType": "text", "included": false },
        { "fieldName": "internalNotes", "fieldType": "mediumtext", "included": false } ] },
      "C": { "enabled": false, "displayName": null },
      "D": { "enabled": false, "displayName": null }
    }
  }
}})
```

- No `prompt`: the model-facing description is generated from the table at run time. A prompt cannot restrict operations or columns — only `operations` does.
- **Always send all four keys `C`, `R`, `U`, `D`**, with `fields` arrays on `R` and `U` (`[]` when disabled). The runtime reads `operations.R` before anything else; a TABLE tool saved without it breaks tool generation for **every** tool of the agent, not only this one.
- `fields` items are the table's columns as `get_table({ id }).fields` returns them, each with **`included: true|false`**; only `fieldName` and `included` matter at run time, the other attributes are informational. A column that is **not in the list at all is treated like `included: false`**; list every column with an explicit flag, as the Cockpit does, so the intent is visible. Read fields (`R`) list every column except `id` (always readable) — the platform columns `createdAt`, `updatedAt` (`bigint`), `createdBy`, `updatedBy` (`text`) are selectable too. Update fields (`U`) list every column except `id` and the platform columns (set automatically). Leave vector columns out. An enabled `R` or `U` must have at least one included field (the Cockpit rejects it otherwise).
- **`R` must be enabled whenever `U` or `D` is enabled** (the agent must find a row before it can change or delete it); otherwise the save fails with `The Read operation must be enabled when Update or Delete is enabled…`. `C` and `D` have `enabled` and `displayName` only.
- What the agent gets — up to five functions named after the table (`<Table>` = table name with its first letter upper-cased, so the table name governs these function names): `get<Table>Metadata` (schema, present when any operation is on), `get<Table>` (read-only SQL `SELECT` with a mandatory row limit, no `SELECT *`, only the included read columns plus `id`), `create<Table>`, `update<Table>` (only the included update columns, by primary key), `delete<Table>` (by primary key, irreversible). Disabled operations are not registered at all.
- The table's own **read and write roles are enforced on every call**, on top of the tool's `roles` — a user without the table's write role cannot create/update/delete through the agent, whatever the prompt says.

### `EMAIL` — send an email

```json
save_ai_tool({ "aiTool": {
  "name": "sendCustomerReply",
  "type": "EMAIL",
  "prompt": "Send the drafted reply to the customer by email once the user has confirmed the text. Ask for the recipient address if it is not in the conversation.",
  "config": { "templateId": "<email template id>" }
}})
```

- With `templateId`: the model fills the template's `{{placeholders}}` and the recipients (`sendTo`, optional `cc`, `bcc`); the subject is the template's description. Without a template (`"config": {}`): the model writes `subject` and `html` itself plus the recipients.
- Requires emailing to be configured in System Settings (not checked by the save). The agent only knows a recipient address if it is in the conversation or in a prompt variable.

### `PDF` — generate a PDF from a PDF Designer template

```json
save_ai_tool({ "aiTool": {
  "name": "createVisitReport",
  "type": "PDF",
  "prompt": "Generate the field-service visit report as a PDF after the user has confirmed the visit details. Returns a link the user can open.",
  "config": { "pdfId": "<PDF template id>" }
}})
```

- The model's parameters are generated from the PDF template's interface; the tool returns a link to the generated document. Prefer an existing template so the model only supplies data. The save requires the id but does not check that the template exists.

### `CHART` — render a Chart.js chart in the chat

```json
save_ai_tool({ "aiTool": {
  "name": "drawTicketChart",
  "type": "CHART",
  "prompt": "Render a chart when the user asks to visualize ticket counts or trends. Prefer bar charts for categories and line charts for time series.",
  "config": {}
}})
```

- `config` must be `{}` (or omitted). The model produces the Chart.js configuration; the platform renders it inline.

## Workflows

**Discover**: `list_ai_tools` (filter with `listOptions.where`, e.g. `{ "type": "SCRIPT" }` or `{ "name": { "operation": "ILike", "value": "%ticket%" } }`) → `get_ai_tool({ id })` for the prompt, config and the agents that use it.

**Create and attach**: check the name is free (`list_ai_tools` with `where.name`) → look up the referenced artifact id → `save_ai_tool` → confirm the response echoes your `config` → add the returned `id` to the agent's `tools` array with `save_ai_agent` (`manage-ai-agents`; the array is replaced wholesale, so send the full list) → set the agent's `config.maxSteps` so it can act on the tool's result.

**Change the prompt only**: `save_ai_tool({ "aiTool": { "id": "…", "prompt": "…" } })` — omitted keys, including `config`, stay untouched.

**Change one table operation**: `get_ai_tool` → edit the `config.operations` you need → `save_ai_tool` with `id` and the **full `config`** (a partial `config` replaces the stored one and drops `entityId` or the other operations).

**Change one option of any other type** — same rule, `config` is never merged. Web search, more results: `get_ai_tool` → `save_ai_tool({ "aiTool": { "id": "…", "config": { "numResults": 5, "context": true, "maxCharactersContext": 2000, "summary": false, "text": false, "maxCharactersText": 200, "includeDomains": ["docs.neptune-software.com"] } } })` — every key re-sent, one changed.

**Rename**: `name` is the function name — keep the charset rule; agents referencing the tool by id keep working, but update agent instructions that mention the old function name.

**Delete**: `get_ai_tool({ id })` → if `agents` is non-empty, list them to the user and confirm → `delete_ai_tool({ id })` → `get_ai_tool` returns `Not Found`. The server does not refuse and does not ask; the tool simply disappears from those agents.

**Verify**: the save response is the persisted state — a field you sent that is missing from it was stripped. The runtime effect can only be tested by running the agent (Cockpit Playground, or a script that calls the agent — see `manage-ai-agents`); MCP has no "run tool" operation.

## Listing and filtering

`listOptions.where` accepts exact values or `{ "operation", "value" }` with `Like`, `ILike`, `In` (array), `Not`, `IsNull` (no value), `Between` (two values), `LessThan`, `LessThanOrEqual`, `MoreThan`, `MoreThanOrEqual`, `Equal`; conditions on several fields are combined with AND (no OR — run two calls for "created **or** changed by"). `Like` is case-sensitive on PostgreSQL; use `ILike` for text. Filterable and sortable fields: `name`, `type`, `description`, `version`, `package`, `createdBy`, `changedBy`, `createdAt`, `updatedAt`. **A `where` key outside this list is dropped silently and the list comes back unfiltered** — `displayName` and `prompt` cannot be filtered: to find "the tool called Check Warranty" when the function name differs, filter `name`/`description` with `ILike`, or list and `get_ai_tool` the candidates. Non-administrators only see tools in packages their roles may read.

```json
list_ai_tools({ "listOptions": { "where": { "type": "TABLE", "changedBy": "playwright" }, "order": { "updatedAt": "DESC" }, "take": 20 } })
```

## Errors and symptoms

| Signal | Meaning / fix |
|---|---|
| `type is required` | Create without `type`. Ask the user which kind of tool, then retry. |
| `Invalid config for tool type <TYPE>: <detail>` | `config` does not match the type's shape — unknown top-level key, wrong value type, `entityId`/`pdfId` missing, or `R` disabled while `U`/`D` enabled. Nothing was saved. |
| `name '<name>' already exists!` | Duplicate name. Update the existing tool by `id` or pick another name. |
| Input validation error naming `["aiTool", "roles", 0, "id"]` (or similar), `Invalid uuid` | A relation id is not a UUID. Nothing was saved. |
| `Access denied: no permission for aitool` | The MCP user lacks the `aitool` role permission (`List`/`Get`/`Save`/`Del`). |
| `<name> is locked by <user> since <time>` | Someone has the tool open in the Cockpit. Ask them to close it, or inspect with `list_locks`. |
| `No edit access to artifact` / `Cannot assign artifact to system package` / `Only Global Admins can assign artifacts to template packages…` / `Package is a required field` / `Your default package cannot be used: …` | Package rules — pass a package you may edit. |
| `Not Found` on `get_ai_tool` | No tool with that id (wrong id, or already deleted). |
| `Error saving ai_tool` | The platform refused the write without a reason — usually a relation id that does not exist. Nothing changed. |
| Agent never calls the tool | Weak or missing `prompt`; tool not in the agent's `tools`; the agent's `maxSteps` too low; the user lacks a role in the tool's `roles`; agent in `json_schema` mode. |
| Agent Trace / system log: `Failed to create tool for <name>. Missing …` | A run-time requirement from the config table is unmet (`parameters`, `apiId`/`operationId`, `numResults`, `entityId`/`operations`, `pdfId`) or a referenced template no longer exists. Fix the config and re-save. |
| Agent Trace: `Failed to generate tools for AI Agent` (all tools gone) | A TABLE tool without the `R` operation key. Re-save it with all four operation keys. |
| `Websearch capability is not enabled…` at run time | Exa is not enabled in System Settings → AI. |
| Provider rejects a function name at run time | `name` violates the charset rule; for TABLE tools, the table name does. Rename. |

## What MCP can NOT do (route to the Cockpit or another skill)

- Assign a tool to an agent from the tool side — use `save_ai_agent` (`manage-ai-agents`).
- Discover role ids (no role tool), or read Agent Trace (Cockpit tool; script errors appear in `inspect-system-logs`).
- Execute a tool directly, or preview the exact schema the model will see.
- Enable Exa or emailing (System Settings), or create an email template (Cockpit; PDF templates can be managed with `save_pdf_template`).
- Change a tool's type, or restrict a TABLE tool through its prompt.

## Permissions

All four tools require the `aitool` role: `List` (`list_ai_tools`), `Get`, `Save`, `Del`. Saving into a role-protected package additionally requires package edit access. Run-time use of a tool is governed by the tool's `roles`, the agent's `roles`, and for `TABLE` tools the table's read/write roles.

## Related skills

- **`manage-ai-agents`** — attach tools to an agent (`tools`), set `maxSteps`, and where agents are used.
- **`manage-ai-models`** — the model an agent needs before any tool matters.
- **`manage-server-scripts`** — write the script a `SCRIPT` tool runs (`payload` in, `result` out); **`run-server-script`** to exercise it.
- **`manage-apis`** — the API and operation an `API` tool calls; parameter descriptions feed the model.
- **`manage-tables`** — the table definition behind a `TABLE` tool; `get_table` for the field list and vectorization.
- **`inspect-system-logs`** — run-time tool failures.
- **`dxp-overview`** — the artifact model and packages.
