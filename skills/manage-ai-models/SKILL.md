---
name: manage-ai-models
description: Register, update, inspect, or delete Neptune DXP AI model references — the OpenAI, Anthropic, Azure OpenAI, Amazon Bedrock, Google, Mistral, DeepSeek, OpenRouter and OpenAI-compatible endpoints that agents, guardrails and vectorized tables use — via the MCP tools `list_ai_models`, `get_ai_model`, `save_ai_model`, `delete_ai_model`, `list_ai_vendor_settings`. Use when the user wants to add a model, an embedding model, rotate an API key, change a model name or base URL, see which agents use a model, pick a model for a new agent, or remove one. Trigger phrases include "add an AI model", "register the OpenAI model", "set up an embedding model", "which model does the agent use", "rotate the API key", "change the base URL", "list the models", "delete the model". Read this BEFORE any `save_ai_model` payload — secrets are masked in every response, and every update must repeat `name`, the full `config` and the stored secrets.
---

# Managing Neptune DXP AI models via MCP

An **AI model** (Cockpit: Naia Agent Studio → Models) is a reference to a model deployed outside Neptune DXP - Open Edition: the vendor (`type`), the vendor's model name, the endpoint and the credentials. Agents (`manage-ai-agents`), guardrails and vectorized tables point at a model by its id. Nothing is validated against the vendor when you save — a wrong key or model name only fails when an agent runs. `save_ai_model` writes the same record the Cockpit's Models app edits, and changes apply to the next agent request.

## Tools

| Tool | Behavior |
|---|---|
| `list_ai_models` | Summaries: `id`, `name`, `type` (vendor), `description`, `version`, `inputType`, `outputType`, `package`, `createdBy`, `changedBy`, `createdAt`, `updatedAt`, plus `roles` (`{id, name}`) when set. Supports `listOptions` (`where`/`select`/`take`/`skip`/`order`) to filter, project, and sort by field. **`config` is never included** — the vendor model name and endpoint need `get_ai_model`. |
| `get_ai_model({ id })` | Full record with `config` (secrets masked, see below), `roles`, and **`whereUsed`**: `agents`, `tables` (vectorized tables using it as embedding model) and `guardrails`, each `[{ id, name }]`. |
| `save_ai_model({ aiModel })` | Create (no `id`) or update (with `id`). Returns the saved record with masked secrets and `whereUsed`. |
| `delete_ai_model({ id })` | Permanent. Refused while any agent uses the model or it is the global embedding model; **not** refused for guardrails or vectorized tables (see Delete). Returns `{ "status": "AI model deleted" }`. |
| `list_ai_vendor_settings` | No input. One entry per supported vendor: `vendor`, `fields` (config keys the Cockpit shows), `embeddingModels` (`{ model, dimensions }`) and `imageModels`. Read it to learn what a vendor's `config` needs; see the vendor table for the keys it does not list. |

## The `save_ai_model` contract

| Field | Rules |
|---|---|
| `id` | Omit to create, include to update. An `id` that does not exist fails with `Not Found` — an update never creates a model. |
| `name` | Required on create **and on every update**: send the current name unchanged to keep it — an update without `name` fails with `name 'undefined' already exists!`. **Unique.** Keep it within 64 characters: the save does not check the length, and depending on the database a longer name is either stored or refused with `Error saving ai_model`. |
| `type` | Vendor: `openai`, `anthropic`, `azure`, `bedrock`, `google`, `mistral`, `deepseek`, `openrouter`. Defaults to `openai` when omitted on create. Self-hosted or third-party OpenAI-compatible endpoints use `openai` with their own `config.baseURL`. |
| `inputType` / `outputType` | `text` or `vector`. Both default to `text` (a completion / chat model). An **embedding model** is `inputType: "text"`, `outputType: "vector"` and needs `config.vectorDim`. |
| `config` | Object with the vendor keys below. On an update the keys you send are merged into the stored `config`, but **always send the complete `config`** from `get_ai_model` with your change applied — a stored secret missing from it is broken (see the secrets row and Updating a model). Unknown keys are accepted; only the rules below are enforced. |
| `config.model` | **Always required** — the vendor's model or deployment name (`gpt-5`, `claude-sonnet-4-latest`, `gemini-2.5-flash`, an Azure deployment name, a Bedrock model id). `list_ai_vendor_settings` never lists it. |
| `config.baseURL` | Required at save time for every vendor except `bedrock` and `azure`; error `config.baseURL is required for this vendor`. Must parse as an absolute URL (`https://…`); a bare host such as `api.openai.com/v1`, or `""`, fails input validation — for `bedrock` and `azure` leave `baseURL` out rather than sending `""`. |
| `config.vectorDim` | Required when `outputType` is `vector` (the dimensions the embedding model outputs — stored for validation, not sent to the vendor). **A string** such as `"1536"`; a number fails input validation. On Microsoft SQL Server the maximum is 1998. |
| Secrets `config.apiKey`, `config.accessKeyId`, `config.secretAccessKey` | Encrypted at rest. **`get_ai_model` and `save_ai_model` show every stored secret as the placeholder `@planet9_placeholder_password@`** — a broken one too, so the mask proves nothing. On an update: send `apiKey` back as the placeholder to keep it, a new value to replace it, `""` to clear it. **Bedrock's `accessKeyId` and `secretAccessKey` cannot be kept with the placeholder** — it is stored as literal text; send the real values on every update. **A stored secret (other than a vault reference) left out of an update's `config`, or an update without `config`, is broken as well.** The placeholder only works on an update of the same model — never send it in a create. A broken secret only shows when an agent runs (a `… is required` error such as `API key is required` or `Bedrock accessKeyId is required`, or a vendor authentication error). Values that end with the vault marker are vault references and are kept as sent. |
| `roles` | `[{ "id": "<role uuid>" }]`. Restricts who may use the model (the embedding endpoint checks it directly; agents carry their own roles). Role ids are not discoverable over MCP. |
| `description`, `version`, `package` | Optional. `package` on create defaults to your default development package when you may edit it. |
| `agents`, `guardrails` | Read-only relations — set from the agent / guardrail side. Do not send. |

### Secrets on create

Send the secrets in the create call, inside `config` with the other keys (see Examples). One exception: while the instance has **no AI model at all** (`list_ai_models` returns `[]`), the secrets sent with that first model are not stored usably — agents on it later fail with a `… is required` error or an authentication error, although `get_ai_model` shows the placeholder as usual. Create that first model without secrets, then add them with an update.

Never send the placeholder `@planet9_placeholder_password@` in a create — for example when copying another model's `config` from `get_ai_model`. It is not resolved to the copied model's key: put the real secret in, or leave it out and add it with an update.

### Updating a model

Every update follows the same steps, whatever it changes — `description`, `roles` and `package` included:

1. `get_ai_model({ id })`.
2. Take `name` and the complete `config` from the response and apply your change. Leave `apiKey` as the placeholder unless you are replacing it.
3. `save_ai_model` with `id`, `name`, that `config`, and the other fields you change. For a **Bedrock** model put the real `accessKeyId` and `secretAccessKey` into `config` — ask the user for them; the placeholder and leaving them out both break the stored keys.

## Vendors — what each needs

`list_ai_vendor_settings` reports the keys the Cockpit shows per vendor; the run-time requirement (checked when an agent calls the model, error surfaced in the agent's reply and Agent Trace) is stricter for two vendors:

| `type` | `config` keys the agent needs at run time | Base URL to send (the vendor's public endpoint; `baseURL` is never defaulted for you) | Notes |
|---|---|---|---|
| `openai` | `model`, `apiKey`, `baseURL` | `https://api.openai.com/v1` | Also the type for any OpenAI-compatible endpoint (self-hosted, Together, vLLM …): set `baseURL` to that endpoint. |
| `anthropic` | `model`, `apiKey`, `baseURL` | `https://api.anthropic.com/v1` | |
| `google` | `model`, `apiKey`, `baseURL` | `https://generativelanguage.googleapis.com/v1beta` | |
| `mistral` | `model`, `apiKey`, `baseURL` | `https://api.mistral.ai/v1` | The Cockpit placeholder shows a Together endpoint; use Mistral's own unless the user says otherwise. |
| `deepseek` | `model`, `apiKey`, `baseURL` | `https://api.deepseek.com/v1` | |
| `openrouter` | `model` (e.g. `deepseek/deepseek-v4-pro`), `apiKey`; `baseURL` optional | `https://openrouter.ai/api/v1` | `list_ai_vendor_settings` reports **no fields** for OpenRouter — the API key is still required at run time. `baseURL` is required to save. |
| `azure` | `model` (= deployment name), `apiKey`, and `resourceName` **or** `baseURL`; optional `apiVersion`, `useDeploymentBasedUrls` | none required to save | `resourceName` builds `https://{resourceName}.openai.azure.com/openai/v1{path}`. `baseURL` overrides it (`{baseURL}/v1{path}?api-version=…`). `useDeploymentBasedUrls: true` switches to the legacy `{baseURL}/deployments/{deployment}{path}?api-version={apiVersion}` form. |
| `bedrock` | `model` (Bedrock model id, e.g. `meta.llama3-70b-instruct-v1:0`), `region`, `accessKeyId`, `secretAccessKey` | none | No `baseURL`. |

Embedding models by vendor (`list_ai_vendor_settings.embeddingModels`): OpenAI `text-embedding-3-large` (3072), `text-embedding-3-small` (1536), `text-embedding-ada-002` (1536); Google `text-embedding-004` (768); Mistral `mistral-embed` (1024); Bedrock `amazon.titan-embed-text-v1` (1024), `amazon.titan-embed-text-v2:0` (1024). Image models exist for OpenAI (`dall-e-3`, `dall-e-2`) and Bedrock (`amazon.nova-canvas-v1:0`).

Do not rename or repoint models named `NeptuneFreeCompletionModel` / `NeptuneFreeEmbeddingModel` whose base URL is a `neptune-software.com` portal — they are the platform's free-tier models.

## Examples

**OpenAI chat model**

```json
save_ai_model({ "aiModel": {
  "name": "gpt-5-support",
  "type": "openai",
  "description": "Completion model for the support agents",
  "inputType": "text",
  "outputType": "text",
  "config": { "model": "gpt-5", "baseURL": "https://api.openai.com/v1", "apiKey": "<api key>" }
}})
```

**Anthropic** — same shape with `"type": "anthropic"`, `"model": "claude-sonnet-4-latest"`, `"baseURL": "https://api.anthropic.com/v1"`.

**Azure OpenAI (resource name)**

```json
save_ai_model({ "aiModel": {
  "name": "azure-gpt-4o",
  "type": "azure",
  "config": { "model": "<deployment name>", "resourceName": "<resource>", "apiVersion": "2024-10-21", "apiKey": "<api key>" }
}})
```

**Amazon Bedrock**

```json
save_ai_model({ "aiModel": {
  "name": "bedrock-llama3-70b",
  "type": "bedrock",
  "config": { "model": "meta.llama3-70b-instruct-v1:0", "region": "eu-central-1",
              "accessKeyId": "<AWS access key id>", "secretAccessKey": "<AWS secret access key>" }
}})
```

**OpenRouter**

```json
save_ai_model({ "aiModel": {
  "name": "openrouter-deepseek",
  "type": "openrouter",
  "config": { "model": "deepseek/deepseek-v4-pro", "baseURL": "https://openrouter.ai/api/v1", "apiKey": "<api key>" }
}})
```

**OpenAI embedding model**

```json
save_ai_model({ "aiModel": {
  "name": "openai-embedding-small",
  "type": "openai",
  "inputType": "text",
  "outputType": "vector",
  "config": { "model": "text-embedding-3-small", "baseURL": "https://api.openai.com/v1", "vectorDim": "1536", "apiKey": "<api key>" }
}})
```
A vectorized table (`manage-tables`) or the system's global embedding model then references this id.

**Self-hosted OpenAI-compatible endpoint**

```json
save_ai_model({ "aiModel": {
  "name": "onprem-llama",
  "type": "openai",
  "config": { "model": "llama-3.3-70b", "baseURL": "https://llm.internal.example.com/v1", "apiKey": "<api key>" }
}})
```
`apiKey` must not be empty — send any non-empty string if the endpoint needs no key.

**Rotate an API key** — `get_ai_model({ id })`, copy `name` and `config`, replace the masked `apiKey` with the new key, send it back:

```json
save_ai_model({ "aiModel": { "id": "<id>", "name": "gpt-5-support",
  "config": { "model": "gpt-5", "baseURL": "https://api.openai.com/v1", "apiKey": "<new key>" } } })
```

**Change the vendor model, keep the key** — same pattern; the placeholder keeps the stored key:

```json
save_ai_model({ "aiModel": { "id": "<id>", "name": "gpt-5-support",
  "config": { "model": "gpt-5.1", "baseURL": "https://api.openai.com/v1", "apiKey": "@planet9_placeholder_password@" } } })
```

**Any update of a Bedrock model** — the AWS keys are sent again in full, even when only the description changes:

```json
save_ai_model({ "aiModel": { "id": "<id>", "name": "bedrock-llama3-70b", "description": "Llama 3 70B via Bedrock",
  "config": { "model": "meta.llama3-70b-instruct-v1:0", "region": "eu-central-1",
              "accessKeyId": "<AWS access key id>", "secretAccessKey": "<AWS secret access key>" } } })
```

## Workflows

**Pick a model for an agent**: `list_ai_models({ "listOptions": { "where": { "outputType": "text" } } })` — completion models only; `get_ai_model` if the vendor model name matters. Embedding models are `outputType: "vector"`.

**Check usage before changing or deleting**: `get_ai_model` → `whereUsed.agents`, `whereUsed.guardrails`, `whereUsed.tables`. Changing `config.model` on a model used by several agents changes all of them at once.

**Delete**: refused with `Cannot delete models that are being used by agents` or `This model cannot be deleted since it is set as a global embedding model within the system settings`. **Guardrails and vectorized tables do not block the delete** — the guardrail loses its model and the table keeps a dead embedding-model reference. Read `whereUsed` and confirm with the user when those lists are non-empty.

**Verify a save**: the response is the persisted state, except for secrets — they always show as the placeholder, whether stored correctly or broken. Whether the credentials work can only be tested by running an agent (Cockpit Playground or a script), not over MCP.

## Listing and filtering

`listOptions.where` accepts exact values or `{ "operation", "value" }` with `Like`, `ILike`, `In`, `Not`, `IsNull`, `Between`, `LessThan`, `LessThanOrEqual`, `MoreThan`, `MoreThanOrEqual`, `Equal`; several fields combine with AND. Filterable and sortable: `name`, `type`, `description`, `version`, `inputType`, `outputType`, `package`, `createdBy`, `changedBy`, `createdAt`, `updatedAt`. A `where` key outside this list is dropped silently. Non-administrators see only models in packages their roles may read.

## Errors and symptoms

| Signal | Meaning / fix |
|---|---|
| `config.model is required` | No vendor model name in `config` on create, or an update that sent `model` empty. |
| `config.baseURL is required for this vendor` | Every vendor except `bedrock` and `azure` needs `baseURL` to save. |
| Input validation error naming `config.baseURL` or `config.vectorDim` | `baseURL` must be an absolute URL (leave it out for `bedrock`/`azure` rather than sending `""`); `vectorDim` a string such as `"1536"`. Nothing was saved. If the `config` copied from `get_ai_model` fails on a key you did not change, correct that key in the payload. |
| `Vector dimensionality is required when outputType is vector` / `Vector dimensionality cannot exceed 1998 on this database` | Embedding model without `vectorDim`, or above the SQL Server limit. |
| `name 'undefined' already exists!` | An update without `name`. Send the model's current `name` (from `get_ai_model`) with every update. |
| `name '<name>' already exists!` | Duplicate name. |
| `Cannot delete models that are being used by agents` / `This model cannot be deleted since it is set as a global embedding model…` | Reassign the agents (`save_ai_agent` with another `model`) or change the system setting first. |
| `Access denied: no permission for aimodel` | Missing `aimodel` role permission (`List`/`Get`/`Save`/`Del`). |
| `<name> is locked by <user> since <time>` | Open in the Cockpit by someone else. |
| `No edit access to artifact` / `Cannot assign artifact to system package` / `Package is a required field` / `Your default package cannot be used: …` | Package rules — pass a package you may edit. |
| `Not Found` | Unknown id on `get_ai_model`, or on `save_ai_model` with an `id` — an update never creates a model. |
| `Error saving ai_model` | Refused without detail — for example a `name` longer than 64 characters on a database that enforces the limit. |
| Agent replies with `API key is required`, `Azure apiKey is required`, `Bedrock accessKeyId is required`, `Bedrock secretAccessKey is required`, `Base URL is required`, `Bedrock region is required`, `Azure resourceName or baseURL is required`, or a vendor authentication error | The model's `config` is incomplete or wrong for the vendor at run time, or a secret was broken — left out of an update, a Bedrock key sent back as the placeholder, the placeholder sent in a create, or a secret sent with the instance's first model. Send the real secret again with the update pattern. |
| Secret shows as `@planet9_placeholder_password@` | Expected — every stored secret is masked, a broken one too. The mask does not prove the secret works. |

## What MCP can NOT do (route to the Cockpit)

- Read a stored secret back, or test the vendor connection.
- Set the system's global embedding model, the Agent Memory setting or the Exa key (System Settings → AI).
- Discover role ids; create guardrails.
- Tell you whether a vendor model name is valid — the vendor does, when an agent first runs.

## Permissions

All CRUD tools require the `aimodel` role: `List`, `Get`, `Save`, `Del`. `list_ai_vendor_settings` needs only an authenticated session. Saving into a role-protected package additionally requires package edit access.

## Related skills

- **`manage-ai-agents`** — agents reference a model by id (`model`) and for compaction (`config.compactionConfig.modelId`).
- **`manage-ai-tools`** — the capabilities an agent gets on top of its model.
- **`manage-tables`** — vectorization uses an embedding model (`outputType: "vector"`).
- **`dxp-overview`** — packages and the artifact model.
