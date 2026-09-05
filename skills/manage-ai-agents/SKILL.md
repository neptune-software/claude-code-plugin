---
name: manage-ai-agents
description: Create, update, inspect, or delete Neptune DXP AI agents — the chat, task and Agentic Apps agents built in Naia Agent Studio — via the MCP tools `list_ai_agents`, `get_ai_agent`, `save_ai_agent`, `delete_ai_agent`. Use when the user wants to build an agent, write or change its instructions (system prompt), pick or switch its model, attach or remove AI tools, MCP connections or knowledge tables, set guardrails, roles, memory, reasoning, compaction, structured output or step limits, enable an agent for Agentic Apps, see where an agent is used, or remove one. Trigger phrases include "create an agent", "new AI agent", "system prompt", "change the instructions", "add this tool to the agent", "Agentic Apps agent", "structured output agent", "JSON classifier agent", "which apps use this agent", "delete the agent". Read this BEFORE any `save_ai_agent` payload — instructions are versioned, relation arrays are replaced wholesale, and an Agentic Apps agent needs a different payload than a chat agent.
---

# Managing Neptune DXP AI agents via MCP

An **AI agent** (Cockpit: Naia Agent Studio → Agents) is a model plus instructions, optionally equipped with AI tools, MCP connections, knowledge tables, guardrails and role restrictions. Apps, launchpads, server scripts, process flows and other agents call it. `save_ai_agent` writes the same record the Cockpit's Agent editor saves; the next request to the agent uses the new state — there is no activate step. There is no MCP operation that *runs* an agent: runtime tests happen in the Cockpit Playground, or in a script that calls the agent.

Two kinds of agent exist. **Standard** agents run locally on a model you registered (`manage-ai-models`). **External** agents are registered remote A2A peers — MCP can update them but cannot create them. A standard agent additionally has one mode switch: **Agentic Apps** (`enableIntelligentApps`), which turns it into the agent that drives apps and launchpads instead of a chat agent (see the dedicated section).

## Tools

| Tool | Behavior |
|---|---|
| `list_ai_agents` | Summaries: `id`, `name`, `model` (model id), `description`, `enableIntelligentApps`, `version`, `package`, `createdBy`, `changedBy`, `createdAt`, `updatedAt`. Supports `listOptions` (`where`/`select`/`take`/`skip`/`order`) to filter, project, and sort by field. **Does not return or filter `type`** (standard vs external) nor the model name — there is no direct way to list external agents: list, then `get_ai_agent` the candidates. |
| `get_ai_agent({ id })` | The full agent (see the next section) including all prompt versions and `whereUsed`. Id only. |
| `save_ai_agent({ aiAgent })` | Create (no `id`) or update (with `id`) a standard agent; update an external one. Returns the saved agent as `get_ai_agent` would, without `whereUsed`. |
| `delete_ai_agent({ id })` | Permanent, **no confirmation and no refusal** even when apps, launchpads, scripts or flows use the agent. Deletes the agent and all its prompt versions. Returns `{ "status": "AI agent deleted" }`. |

## What `get_ai_agent` returns — and what never to send back

| In the response | Content | Send back on update? |
|---|---|---|
| Scalars | `id`, `name`, `description`, `version`, `type`, `model`, `enableIntelligentApps`, `package`, `sapSystemId`, `config`, `createdBy`, `changedBy`, `createdAt`, `updatedAt`; external only: `cardUrl`, `outboundApiAuthId`, `cachedCard`, `cardFetchedAt`, `supportedTransports`, `cardSignatureVerified` | only the ones you change; never the card-cache columns |
| `modelObj` | `{ id, name }` of the model | no (use `model`) |
| `prompts` | every instruction version: `{ id, prompt, status: "active"\|"inactive", createdAt, createdBy, variables, ver }` | **never** — use `prompt` (see Instructions) |
| `currentPrompt`, `variables` | id of the active version and its `{{placeholders}}` | no |
| `roles` | `[{ id, name }]` | yes when changing roles (ids only) |
| `tools` | `[{ id, name }]` — type/config/prompt are **not** included; use `get_ai_tool` | yes when changing tools (full list) |
| `tableSources` | `[{ id, name }]` vector-enabled tables | yes when changing |
| `localMCPConnections`, `remoteMCPConnections` | `[{ id, contextName, … }]`, `[{ id, name, … }]` | yes when changing (ids only) |
| `inputGuardrails`, `outputGuardrails` | ordered `[{ id, name, description, … }]` | **on every update** (ids, in order) — an update that omits them clears the agent's guardrails |
| `peers`, `sapDataSources` | reduced to `[{ id, name }]` — their per-link flags are **not** returned | only when deliberately changing them, **with explicit flags** (a plain round trip resets `backgroundable` to false and `loadArtifactsIntoContext` to `never`) |
| `apps`, `launchpads` | `[{ id, name }]` consumers | **never** (read-only; stripped) |
| `whereUsed` | `scripts`, `apps`, `launchpads`, `processFlows`, `peers` — each `[{ id, name }]` | never |
| `accessLevel` | `READ`/`EDIT` for non-administrators | never |

Also never send `inputGuardrailsMap`, `outputGuardrailsMap`, `logs`, `iaLaunchpads`, `currentPrompt`, `variables`, `inputType`, `outputType` — they are accepted by the schema but belong to the server.

## The `save_ai_agent` contract

| Field | Rules |
|---|---|
| `id` | Omit to create, include to update. An unknown `id` creates a record with that id. |
| `name` | Required on create, **unique**, max 64 characters. **All whitespace is removed** (`"Support Agent"` is stored as `"SupportAgent"`) — pass the name without spaces so the stored name matches what you report. |
| `model` | **Required for a standard agent**, on create and whenever you send it: the id of a completion model (`list_ai_models` with `where: { "outputType": "text" }`). Missing → `model is required`. |
| `type` | `standard` (default) or `external`. **Creating an external agent is refused** (`Not supporting creating external ai agent via mcp tool yet`). Never flip the type of an existing agent. |
| `enableIntelligentApps` | `true` makes this an **Agentic Apps agent** (section below). Default false. |
| `prompt` | `{ "txt": "<instruction>" }` or `{ "id": "<version id>" }` — the instruction (system prompt), versioned. See Instructions. |
| `config` | Behavior settings. **Merged**, not replaced: keys you send are applied on top of the stored config and the defaults (one level deep inside `modelConfig`, `vectorConfig`, `compactionConfig`). Sending `config: {}` keeps everything. |
| `tools`, `tableSources`, `localMCPConnections`, `remoteMCPConnections`, `roles` | `[{ "id": "<uuid>" }]`. **Present = replaced wholesale, absent = untouched.** To add one item, send the full list. |
| `inputGuardrails`, `outputGuardrails` | `[{ "id": "<guardrail uuid>" }]`, **array order = execution order** (put cheap rule guardrails first). **Rewritten from the payload on every save: omitted = cleared.** An agent with guardrails must carry both arrays on every `save_ai_agent`, even a prompt-only change — `get_ai_agent` first and copy the ids. |
| `peers` | `[{ "id": "<agent uuid>", "backgroundable": true\|false }]` — agents this agent may delegate to (A2A). Present = replaced, including the flags. |
| `sapDataSources` | `[{ "id": "<data source uuid>", "loadArtifactsIntoContext": "always"\|"ask"\|"never", "backgroundable": true\|false }]`. Present = replaced. |
| `description`, `version`, `package` | Optional. Changing `package` moves all prompt versions with the agent. On create, omitting `package` applies your default development package when you may edit it. |
| `sapSystemId`, `cardUrl`, `outboundApiAuthId` | Leave unset unless the user asks: SAP-engine and external-agent settings. |
| Server-managed | `ver`, `createdBy`/`changedBy`, timestamps. Unknown top-level keys are stripped silently. |

Also on every save and delete: `name '<name>' already exists!` for a duplicate; `<name> is locked by <user> since <time>` when someone has the agent open in the Cockpit (`list_locks`); package errors (`No edit access to artifact`, `Package is a required field`, `Your default package cannot be used: …`).

### Defaults applied on create

```json
{ "modelConfig": { "response_format": "text", "schema": {}, "lastMessages": 3 },
  "vectorConfig": { "k": 1, "threshold": 0.8 },
  "onlyMetadata": false,
  "compactionConfig": { "enabled": false, "contextWindowTokens": 10000, "thresholdPercentage": 50, "modelId": null },
  "enableHybridTools": false, "openTasksInPromptLimit": 10, "continueTasksAfterDisconnect": false }
```

`temperature` is not defaulted — absent means the vendor's default. `maxSteps` is **not** defaulted either: an agent with tools, peers, MCP connections or memory needs `config.maxSteps` (2–20; the Cockpit uses 2, or 10 with task & artifact tools) or it stops after a single model step and never acts on a tool result.

## Normal agent vs Agentic Apps agent

| | Chat / task agent (`enableIntelligentApps: false`) | Agentic Apps agent (`enableIntelligentApps: true`) |
|---|---|---|
| Purpose | Answers users, calls tools, runs in the chatbox, in scripts (`agents.<name>`), process flows, other agents | Drives the apps of an **Agentic-Apps-enabled launchpad**: the chatbox hands it the screen and UI-driving client tools; it acts on or explains the app in front of the user |
| Instructions | Yours (`prompt.txt`), versioned, with `{{variables}}` | Supplied by the platform at run time per turn. The Cockpit stores the fixed text `You are an assistant that gives clear and accurate answers to user {{name}}`; you may send that or omit `prompt` |
| Tools, MCP, knowledge tables, pre-processing script, vector search | Used | **Not used** on Agentic Apps turns — the Cockpit hides those sections. Do not send `tools`, `tableSources`, MCP connections or `config.preScript` |
| `config.modelConfig.response_format` | `text` (required for tool calling) or `json_schema` | **Must stay `text`.** The Cockpit forces it; over MCP nothing does — never send `json_schema` for this agent |
| Guardrails, roles, daily token limit, hide log content | Available | Available |
| Cockpit tabs | all | Instructions, Playground, Connectivity hidden |
| How it is used | apps, launchpads (chat agent), scripts, flows | Launchpad → Agentic Apps → "Enable Agentic Apps" + "Agentic Apps Agent" (only flagged agents are selectable). That wiring is done in the Cockpit's Launchpad tool; no MCP tool manages launchpads |
| Test | Cockpit Playground | Open a launchpad that has Agentic Apps enabled with this agent (non-streaming chat) |

Side by side:

```json
save_ai_agent({ "aiAgent": {
  "name": "HermesSupport",
  "description": "Support chat agent",
  "model": "<completion model id>",
  "prompt": { "txt": "You are Hermes, a support operations assistant for {{name}}. Be concise and cite ticket numbers." },
  "tools": [{ "id": "<tool id>" }],
  "config": { "maxSteps": 5 }
}})
```

```json
save_ai_agent({ "aiAgent": {
  "name": "FieldServiceAppsAgent",
  "description": "Agentic Apps agent for the FieldService launchpad",
  "model": "<completion model id>",
  "enableIntelligentApps": true,
  "config": { "modelConfig": { "response_format": "text" } }
}})
```

Turning an existing chat agent into an Agentic Apps agent: `save_ai_agent({ "aiAgent": { "id": "…", "enableIntelligentApps": true, "config": { "modelConfig": { "response_format": "text" } } } })` — its tools stay stored but are not used on Agentic Apps turns. Turning it back: `enableIntelligentApps: false` and give it instructions again.

## Instructions (the system prompt)

- `prompt: { "txt": "…" }` — when the text differs from the latest stored version, the active version is deactivated and a new **active** version is created; identical text creates nothing. `prompt: { "id": "<version id from prompts[]>" }` re-activates an older version. Every agent should have one active version; without it the agent runs without instructions (logged as a system error).
- Writing prompts additionally requires the `AIPrompt` role with `Save` (error `User does not have permission to edit AI Prompts`) and edit access to the prompt's package.
- Variables: `{{variableName}}` placeholders. System variables are filled by the platform (user data such as `{{name}}`, and `{{currentTime}}`); custom variables must be supplied by the caller (`agents.<name>({ input, variables })` in scripts, the chatbox's variables). Variable names must not contain spaces.
- `get_ai_agent` lists all versions in `prompts[]`; `currentPrompt` is the active id and `variables` its placeholders. Never send `prompts` back.
- A pre-processing script (`config.preScript`, a server script id) runs on every call and its `result` string is appended to the instruction — for context that changes at run time (user role, live deadlines). The script receives `payload = { userInfo, input, variables, threadID, agentConfig }` (`manage-server-scripts`).

## `config` reference

| Key | Values | Effect |
|---|---|---|
| `modelConfig.response_format` | `"text"` (default) \| `"json_schema"` | Plain text, or structured output. **Tools are only called in `text` mode.** |
| `modelConfig.schema` | `{ "name": "<identifier>", "schema": { …JSON Schema… } }` | Required when `json_schema` (`schema is required when response_format is "json_schema"`). |
| `modelConfig.temperature` | number, or `null` | Creativity; `null`/absent = vendor default. Low for classification. |
| `modelConfig.lastMessages` | integer (default 3) | Previous messages resent per turn. Ignored while compaction is on. |
| `maxSteps` | 2–20 | Max model steps per request (each tool call costs a step). Set it on every tool-using agent. |
| `reasoning` | boolean | Extended reasoning (the model must support it). |
| `reasoningEffort` | `"low"` \| `"medium"` \| `"high"` | OpenAI reasoning models. |
| `reasoningBudget` | integer tokens | Non-OpenAI reasoning models. |
| `useMemory` | boolean | Adds the Memory tool (search the user's past conversations with this agent; semantic when the system-level Agent Memory setting is on). |
| `dynamicToolSelection` | boolean | First step lists tools; later steps carry only the selected ones. |
| `vectorConfig.k`, `vectorConfig.threshold` | numbers (defaults 1, 0.8) | Vector search configuration for `tableSources`: max contexts injected per message and minimum similarity. |
| `compactionConfig` | `{ "enabled": true, "contextWindowTokens": 10000–2000000, "thresholdPercentage": 10–95, "modelId": "<model id>" }` | Summarizes older messages when usage reaches the threshold. All three values are required when `enabled` is true (`modelId is required when compaction is enabled`, …). |
| `preScript` | server script id | Pre-processing script (see Instructions). |
| `dailyUserTokenLimit` | integer | Daily token cap per user for this agent (Guardrails tab: "Daily User Token Rate"). Omit or `null` for none. |
| `onlyMetadata` | boolean | "Hide log content": Agent Trace stores metadata only. |
| `enableHybridTools` | boolean | A2A "Task & artifact tools". With `openTasksInPromptLimit` (default 10) and `continueTasksAfterDisconnect`; `pauseExpirySeconds` (default 86400) for paused delegations. |
| `selectedRemoteMCPTool` | `{ "<remote system id>": ["toolName", …] }` | Which imported tools of each remote MCP connection the agent may use. |
| `exposeCard`, `publicCard`, `exposeToolsAsSkills`, `skills[]`, `provider` | booleans / `[{ id, name, description, tags[], examples[], inputModes[], outputModes[], security[] }]` / `{ organization, url }` | Connectivity (A2A agent card): expose the card, expose it without authentication, list tools as skills, hand-written skills, provider info. Descriptive only. |

## Relations — where the ids come from

| Array | Content | Source of ids |
|---|---|---|
| `tools` | AI tools the model may call | `list_ai_tools` / `save_ai_tool` response (`manage-ai-tools`) |
| `tableSources` | vector-enabled tables searched automatically on every message (passive knowledge) | `list_tables` → `get_table` shows the vector configuration (`manage-tables`) |
| `localMCPConnections` | npm modules that serve an MCP server (MCP executable path set in the NPM Modules Cockpit app) | `list_npm_modules` (`manage-npm-modules`) |
| `remoteMCPConnections` | Remote Systems of type Model Context Protocol with imported tools | Cockpit → Remote Systems (no MCP tool); pick tools per connection in `config.selectedRemoteMCPTool` |
| `inputGuardrails` / `outputGuardrails` | Guardrail artifacts (rule, AI model or script) | Cockpit → Guardrails (no MCP tool) |
| `peers` | other agents this agent may delegate to | `list_ai_agents` |
| `sapDataSources` | SAP data sources queried as sub-tasks | Cockpit (no MCP tool) |
| `roles` | roles that may use the agent (empty = every authenticated user) | Cockpit or an existing artifact's `roles` (no MCP tool) |

## Examples

**Agent with tools, roles and a step budget**

```json
save_ai_agent({ "aiAgent": {
  "name": "Hermes",
  "description": "Support operations agent",
  "model": "<completion model id>",
  "package": "<package id>",
  "prompt": { "txt": "You are Hermes, a support operations assistant for {{name}}. Use the ticket tools to look up and update tickets; never invent ticket numbers. Current time: {{currentTime}}." },
  "tools": [{ "id": "<supportTickets tool id>" }, { "id": "<checkWarranty tool id>" }],
  "roles": [{ "id": "<SupportTeam role id>" }],
  "config": { "maxSteps": 6, "modelConfig": { "temperature": 0.2 } }
}})
```

**Structured-output classifier**

```json
save_ai_agent({ "aiAgent": {
  "name": "TicketRouter",
  "model": "<completion model id>",
  "prompt": { "txt": "Classify the support ticket text into a department and a priority. Answer only with the JSON object." },
  "config": { "modelConfig": { "response_format": "json_schema", "temperature": 0,
    "schema": { "name": "ticket_routing", "schema": { "type": "object",
      "properties": { "department": { "type": "string", "enum": ["billing", "technical", "sales"] },
                      "priority": { "type": "string", "enum": ["low", "medium", "high"] } },
      "required": ["department", "priority"], "additionalProperties": false } } } }
}})
```
No `tools` — they are not called in `json_schema` mode. The Playground and scripts must use non-streaming calls for structured output.

**Knowledge agent (vector search) with guardrails and cost controls**

```json
save_ai_agent({ "aiAgent": {
  "name": "KnowledgeBase",
  "model": "<completion model id>",
  "prompt": { "txt": "Answer from the supplied knowledge base articles. If the context does not contain the answer, say so." },
  "tableSources": [{ "id": "<vectorized table id>" }],
  "inputGuardrails": [{ "id": "<regex rule guardrail id>" }, { "id": "<AI model guardrail id>" }],
  "outputGuardrails": [{ "id": "<brand check guardrail id>" }],
  "config": { "vectorConfig": { "k": 4, "threshold": 0.75 }, "dailyUserTokenLimit": 200000, "onlyMetadata": true }
}})
```

**Long-running assistant: memory, dynamic tool selection, compaction, reasoning**

```json
save_ai_agent({ "aiAgent": {
  "id": "<Hermes id>",
  "config": { "useMemory": true, "dynamicToolSelection": true, "maxSteps": 10,
    "compactionConfig": { "enabled": true, "contextWindowTokens": 128000, "thresholdPercentage": 70, "modelId": "<small completion model id>" },
    "reasoning": true, "reasoningEffort": "medium" }
}})
```
Use `reasoningBudget` (tokens) instead of `reasoningEffort` for non-OpenAI reasoning models.

**Orchestrator delegating to peers (A2A)**

```json
save_ai_agent({ "aiAgent": {
  "name": "Dispatcher",
  "model": "<completion model id>",
  "prompt": { "txt": "Route the request to the specialist agent that owns the topic and relay its answer." },
  "peers": [{ "id": "<Hermes id>", "backgroundable": true }, { "id": "<TicketRouter id>", "backgroundable": false }],
  "config": { "maxSteps": 8, "exposeCard": true, "exposeToolsAsSkills": true,
              "provider": { "organization": "ACME Support", "url": "https://support.example.com" } }
}})
```

**Updates**

| Intent | Payload |
|---|---|
| Change the instructions only | `{ "id": "…", "prompt": { "txt": "<new full text>" } }` — one new active version; nothing else touched. **If the agent has guardrails, add its `inputGuardrails` and `outputGuardrails` arrays to this payload** (they are cleared when omitted) |
| Re-activate an older instruction version | `{ "id": "…", "prompt": { "id": "<version id from prompts[]>" } }` |
| Add a tool | `get_ai_agent` → `tools` → append → `{ "id": "…", "tools": [ …all ids… ] }` (and raise `config.maxSteps` if needed) |
| Remove all tools | `{ "id": "…", "tools": [] }` |
| Switch the model | `{ "id": "…", "model": "<other completion model id>" }` |
| Change one setting | `{ "id": "…", "config": { "modelConfig": { "temperature": 0.5 } } }` — merged, other keys kept |
| Drop the temperature (vendor default) | `{ "id": "…", "config": { "modelConfig": { "temperature": null } } }` |
| Restrict to roles / open to everyone | `{ "id": "…", "roles": [{ "id": "…" }] }` / `{ "id": "…", "roles": [] }` |
| Move to another package | `{ "id": "…", "package": "<package id>" }` (prompt versions move too) |
| Reorder guardrails | send the full `inputGuardrails` array in the new order |

## End-to-end: "create an agent that can …"

1. **Model**: `list_ai_models({ "listOptions": { "where": { "outputType": "text" } } })`; none suitable → `manage-ai-models` (create without secrets, then update with the key).
2. **Tools**: one `save_ai_tool` per capability (`manage-ai-tools`): valid function name, a specific `prompt`, the full `config` (SCRIPT needs `parameters`, TABLE needs `operations`). Keep the returned ids.
3. **Agent**: `save_ai_agent` with `name` (no spaces), `model`, `prompt.txt`, `tools [{id}]`, `config.maxSteps`, optional `roles`/`package`/guardrails.
4. **Verify**: read the save response or `get_ai_agent`: `tools` lists your ids, `currentPrompt` is set, `config` shows the merged values, `modelObj.name` is the intended model.
5. **Run**: not over MCP. The user tests in the Cockpit Playground, or you write a script that calls `agents.<contextname>({ input, variables })` after linking the agent via `save_server_script.agents` (`manage-server-scripts`) and run it with `run_server_script`.

## Where agents are used, and deleting one

`whereUsed` in `get_ai_agent` lists the server scripts that link the agent (`agents.<name>` accessor), the apps embedding it, the launchpads using it as chat agent, the process flows with an `agentTask` step, and the agents that list it as a peer. Launchpads that use it as **Agentic Apps agent** are not listed; they are unlinked automatically when the agent is deleted.

**Delete discipline**: `get_ai_agent({ id })` → if any `whereUsed` list or `apps`/`launchpads` is non-empty, report them and get explicit confirmation → `delete_ai_agent({ id })`. After the delete, scripts still linking the agent fail at run time (`agents.<name>` is gone) and process-flow agent steps point at a dead id — nothing warns about that.

## External (A2A peer) agents

`type: "external"` agents are remote agents registered by their agent-card URL. Over MCP you can inspect and update them (`description`, `package`, `roles`, `cardUrl`, `outboundApiAuthId`) but **not create** them (`Not supporting creating external ai agent via mcp tool yet`) — register them in the Cockpit. Rules on update: `cardUrl` may not be cleared (`cardUrl is required for an external agent`); a changed `cardUrl` re-fetches the card (`Unable to fetch agent card: …`, `Card URL not allowed: …`); a URL already registered fails with `This card URL is already registered as '<name>'`. `list_ai_agents` cannot filter by `type`; identify external agents through `get_ai_agent`.

## Listing and filtering

`listOptions.where` accepts exact values or `{ "operation", "value" }` (`Like`, `ILike`, `In`, `Not`, `IsNull`, `Between`, `LessThan`, `LessThanOrEqual`, `MoreThan`, `MoreThanOrEqual`, `Equal`), fields combined with AND. Filterable and sortable: `name`, `model`, `description`, `enableIntelligentApps`, `version`, `package`, `createdBy`, `changedBy`, `createdAt`, `updatedAt` — e.g. `{ "where": { "enableIntelligentApps": true } }` lists the Agentic Apps agents, `{ "where": { "model": "<model id>" } }` the agents on one model. **A `where` key outside this list (such as `type`) is dropped silently** and the list comes back unfiltered. Non-administrators see only agents in packages their roles may read.

## Errors and symptoms

| Signal | Meaning / fix |
|---|---|
| `model is required` | Standard agent without `model` (create, or an update that sent `model: null`). |
| `Not supporting creating external ai agent via mcp tool yet` | `type: "external"` without `id`. Register the peer in the Cockpit. |
| `schema is required when response_format is "json_schema"` | Add `modelConfig.schema` with `name` and `schema`. |
| `modelId is required when compaction is enabled` (also `contextWindowTokens…`, `thresholdPercentage…`) | Complete `compactionConfig`. |
| `User does not have permission to edit AI Prompts` | `prompt` sent without the `AIPrompt` Save permission. |
| `name '<name>' already exists!` | Duplicate name (compare without spaces). |
| Input validation error naming e.g. `["aiAgent", "tools", 0, "id"]` | A relation id is not a UUID; nothing saved. |
| `Access denied: no permission for aiagent` | Missing `aiagent` role permission (`List`/`Get`/`Save`/`Del`). |
| `<name> is locked by <user> since <time>` | Open in the Cockpit by someone else. |
| `No edit access to artifact` / `Cannot assign artifact to system package` / `Package is a required field` / `Your default package cannot be used: …` | Package rules. |
| `cardUrl is required for an external agent` / `Not an external agent` / `This card URL is already registered as '<name>'` / `Unable to fetch agent card: …` / `Card URL not allowed: …` | External-agent update rules. |
| `Not Found` | Unknown id on `get_ai_agent`. |
| `Error saving ai_agent` | Refused without detail — usually a relation id that does not exist. Nothing changed. |
| Agent answers but never uses its tools | `maxSteps` missing/1, `response_format` is `json_schema`, the tool's `prompt` is weak, the user lacks the tool's roles, or a `TABLE` tool without the `R` operation key broke tool generation (Agent Trace: `Failed to generate tools for AI Agent`). |
| Guardrails vanished after an update | The save omitted `inputGuardrails` / `outputGuardrails`. Re-send both arrays. |
| Agent runs without instructions (Agent Trace: `No active prompt found`) | No active prompt version — send `prompt.txt`. |
| Launchpad with Agentic Apps enabled fails every turn | The selected agent lacks `enableIntelligentApps: true`, or its `response_format` is not `text`. |

## What MCP can NOT do (route to the Cockpit or another skill)

- Run or test the agent, read Agent Trace, or set streaming.
- Create external (A2A) agents or force a card refresh.
- Create or list guardrails, roles, Remote Systems (remote MCP connections) or SAP data sources — only reference their ids.
- Wire the agent into a launchpad (chat agent or Agentic Apps agent) or an app — Launchpad tool / App Designer; process flows use `agentTask` nodes (`manage-process-flows`); scripts link it via `save_server_script.agents` (`manage-server-scripts`).
- Change system-level AI settings (Agent Memory, global embedding model, Exa).

## Permissions

All four tools require the `aiagent` role: `List`, `Get`, `Save`, `Del`. Sending `prompt` additionally requires the `AIPrompt` role with `Save`. Saving into a role-protected package additionally requires package edit access. Who may *use* an agent at run time is governed by its `roles`.

## Related skills

- **`manage-ai-models`** — the completion model an agent needs, and embedding models for `tableSources`.
- **`manage-ai-tools`** — the capabilities listed in `tools`.
- **`manage-server-scripts`** — pre-processing scripts, script tools, and calling an agent from a script (`agents.<name>`); **`run-server-script`** to execute such a script.
- **`manage-process-flows`** — `agentTask` steps that call an agent.
- **`manage-tables`** — vectorized tables used as knowledge sources.
- **`manage-npm-modules`** — npm modules that provide local MCP connections.
- **`inspect-system-logs`** — run-time errors of agents and tools.
- **`dxp-overview`** — the artifact model and packages.
