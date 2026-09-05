---
name: manage-ai-models
description: Register, update, inspect, or delete Neptune DXP AI model references — the OpenAI, Anthropic, Azure OpenAI, Amazon Bedrock, Google, Mistral, DeepSeek, OpenRouter and OpenAI-compatible endpoints that agents, guardrails and vectorized tables use — via the MCP tools `list_ai_models`, `get_ai_model`, `save_ai_model`, `delete_ai_model`, `list_ai_vendor_settings`. Use when the user wants to add a model, an embedding model, rotate an API key, change a model name or base URL, see which agents use a model, pick a model for a new agent, or remove one. Trigger phrases include "add an AI model", "register the OpenAI model", "set up an embedding model", "which model does the agent use", "rotate the API key", "change the base URL", "list the models", "delete the model". Read this BEFORE any `save_ai_model` payload — secrets are masked in every response and a model is created in two steps.
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
| `id` | Omit to create, include to update. An unknown `id` creates a record with that id. |
| `name` | Required on create, **unique**, max 64 characters. |
| `type` | Vendor: `openai`, `anthropic`, `azure`, `bedrock`, `google`, `mistral`, `deepseek`, `openrouter`. Defaults to `openai` when omitted on create. Self-hosted or third-party OpenAI-compatible endpoints use `openai` with their own `config.baseURL`. |
| `inputType` / `outputType` | `text` or `vector`. Both default to `text` (a completion / chat model). An **embedding model** is `inputType: "text"`, `outputType: "vector"` and needs `config.vectorDim`. |
| `config` | Object with the vendor keys below. **Replaced wholesale** on every save that carries it — re-send the full object when changing one key (`get_ai_model` first; keep the masked secrets as they are to preserve them). Any key is accepted at save time; only the rules below are enforced. |
| `config.model` | **Always required** — the vendor's model or deployment name (`gpt-5`, `claude-sonnet-4-latest`, `gemini-2.5-flash`, an Azure deployment name, a Bedrock model id). `list_ai_vendor_settings` never lists it. |
| `config.baseURL` | Required at save time for every vendor except `bedrock` and `azure`; error `config.baseURL is required for this vendor`. |
| `config.vectorDim` | Required when `outputType` is `vector` (the dimensions the embedding model outputs — stored for validation, not sent to the vendor). On Microsoft SQL Server the maximum is 1998. |
| Secrets `config.apiKey`, `config.accessKeyId`, `config.secretAccessKey` | Encrypted at rest. **Every response replaces them with the placeholder `@planet9_placeholder_password@`.** Sending the placeholder back keeps the stored value; sending a new value replaces it; sending `""` for `apiKey` clears it. Values that end with the vault marker are vault references and are shown as sent. |
| `roles` | `[{ "id": "<role uuid>" }]`. Restricts who may use the model (the embedding endpoint checks it directly; agents carry their own roles). Role ids are not discoverable over MCP. |
| `description`, `version`, `package` | Optional. `package` on create defaults to your default development package when you may edit it. |
| `agents`, `guardrails` | Read-only relations — set from the agent / guardrail side. Do not send. |

### Create in two steps — first without secrets, then with

The Cockpit creates a model from name, vendor, model name and base URL, and takes the credentials afterwards in the detail view. Do the same over MCP:

1. `save_ai_model` **without** `apiKey` / `accessKeyId` / `secretAccessKey` → note the returned `id`.
2. `save_ai_model` with that `id` and the **full `config` including the secrets** → the response shows the placeholder in place of each secret, which confirms they were stored encrypted.

Never send secrets in the create call. The platform encrypts secrets on the update path only; a secret supplied at creation can end up stored unusable, and an agent using the model then fails with an authentication error.

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

**OpenAI chat model (two steps)**

```json
save_ai_model({ "aiModel": {
  "name": "gpt-5-support",
  "type": "openai",
  "description": "Completion model for the support agents",
  "inputType": "text",
  "outputType": "text",
  "config": { "model": "gpt-5", "baseURL": "https://api.openai.com/v1" }
}})
```
```json
save_ai_model({ "aiModel": {
  "id": "<id from step 1>",
  "config": { "model": "gpt-5", "baseURL": "https://api.openai.com/v1", "apiKey": "<api key>" }
}})
```

**Anthropic** — same shape with `"type": "anthropic"`, `"model": "claude-sonnet-4-latest"`, `"baseURL": "https://api.anthropic.com/v1"`.

**Azure OpenAI (resource name)**

```json
save_ai_model({ "aiModel": {
  "name": "azure-gpt-4o",
  "type": "azure",
  "config": { "model": "<deployment name>", "resourceName": "<resource>", "apiVersion": "2024-10-21" }
}})
```
then the update with `"apiKey"` added to the full `config`.

**Amazon Bedrock**

```json
save_ai_model({ "aiModel": {
  "name": "bedrock-llama3-70b",
  "type": "bedrock",
  "config": { "model": "meta.llama3-70b-instruct-v1:0", "region": "eu-central-1" }
}})
```
then the update with `"accessKeyId"` and `"secretAccessKey"` added to the full `config`.

**OpenRouter**

```json
save_ai_model({ "aiModel": {
  "name": "openrouter-deepseek",
  "type": "openrouter",
  "config": { "model": "deepseek/deepseek-v4-pro", "baseURL": "https://openrouter.ai/api/v1" }
}})
```
then the update with `"apiKey"`.

**OpenAI embedding model**

```json
save_ai_model({ "aiModel": {
  "name": "openai-embedding-small",
  "type": "openai",
  "inputType": "text",
  "outputType": "vector",
  "config": { "model": "text-embedding-3-small", "baseURL": "https://api.openai.com/v1", "vectorDim": "1536" }
}})
```
then the update with `"apiKey"`. A vectorized table (`manage-tables`) or the system's global embedding model then references this id.

**Self-hosted OpenAI-compatible endpoint**

```json
save_ai_model({ "aiModel": {
  "name": "onprem-llama",
  "type": "openai",
  "config": { "model": "llama-3.3-70b", "baseURL": "https://llm.internal.example.com/v1" }
}})
```
then the update with `"apiKey"` (any non-empty string if the endpoint needs none).

**Rotate an API key** — `get_ai_model({ id })`, copy `config`, replace the masked `apiKey` with the new key, send the full `config` back:

```json
save_ai_model({ "aiModel": { "id": "<id>", "config": { "model": "gpt-5", "baseURL": "https://api.openai.com/v1", "apiKey": "<new key>" } } })
```

**Change the model name only** — same pattern, keep `"apiKey": "@planet9_placeholder_password@"` in the config so the stored key survives.

## Workflows

**Pick a model for an agent**: `list_ai_models({ "listOptions": { "where": { "outputType": "text" } } })` — completion models only; `get_ai_model` if the vendor model name matters. Embedding models are `outputType: "vector"`.

**Check usage before changing or deleting**: `get_ai_model` → `whereUsed.agents`, `whereUsed.guardrails`, `whereUsed.tables`. Changing `config.model` on a model used by several agents changes all of them at once.

**Delete**: refused with `Cannot delete models that are being used by agents` or `This model cannot be deleted since it is set as a global embedding model within the system settings`. **Guardrails and vectorized tables do not block the delete** — the guardrail loses its model and the table keeps a dead embedding-model reference. Read `whereUsed` and confirm with the user when those lists are non-empty.

**Verify a save**: the response is the persisted state. Secrets show as the placeholder; a `config` key that is missing was not stored. The vendor connection itself can only be tested by running an agent (Cockpit Playground or a script), not over MCP.

## Listing and filtering

`listOptions.where` accepts exact values or `{ "operation", "value" }` with `Like`, `ILike`, `In`, `Not`, `IsNull`, `Between`, `LessThan`, `LessThanOrEqual`, `MoreThan`, `MoreThanOrEqual`, `Equal`; several fields combine with AND. Filterable and sortable: `name`, `type`, `description`, `version`, `inputType`, `outputType`, `package`, `createdBy`, `changedBy`, `createdAt`, `updatedAt`. A `where` key outside this list is dropped silently. Non-administrators see only models in packages their roles may read.

## Errors and symptoms

| Signal | Meaning / fix |
|---|---|
| `config.model is required` | No vendor model name in `config` (on create, or the update replaced `config` without it). |
| `config.baseURL is required for this vendor` | Every vendor except `bedrock` and `azure` needs `baseURL` to save. |
| `Vector dimensionality is required when outputType is vector` / `Vector dimensionality cannot exceed 1998 on this database` | Embedding model without `vectorDim`, or above the SQL Server limit. |
| `name '<name>' already exists!` | Duplicate name. |
| `Cannot delete models that are being used by agents` / `This model cannot be deleted since it is set as a global embedding model…` | Reassign the agents (`save_ai_agent` with another `model`) or change the system setting first. |
| `Access denied: no permission for aimodel` | Missing `aimodel` role permission (`List`/`Get`/`Save`/`Del`). |
| `<name> is locked by <user> since <time>` | Open in the Cockpit by someone else. |
| `No edit access to artifact` / `Cannot assign artifact to system package` / `Package is a required field` / `Your default package cannot be used: …` | Package rules — pass a package you may edit. |
| `Not Found` on `get_ai_model` | Unknown id. |
| Agent replies with `API key is required`, `Base URL is required`, `Bedrock region is required`, `Azure resourceName or baseURL is required`, or a vendor authentication error | The model's `config` is incomplete or wrong for the vendor at run time; fix it with the full-`config` update pattern. |
| Secret shows as `@planet9_placeholder_password@` | Expected — it is masked, not lost. |

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
