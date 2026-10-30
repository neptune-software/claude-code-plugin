---
name: manage-remote-systems
description: Set up and manage Neptune DXP Remote Systems, their AI Context Hub (SAP engine) ingestion and the SAP services they expose, via the MCP tools `list_remote_systems`, `get_remote_system`, `save_remote_system`, `delete_remote_system`, `test_remote_system_connection`, `import_remote_mcp_tools`, `get_ai_context_hub_config`, `save_ai_context_hub_config`, `browse_sap_sources`, `start_ai_context_hub_ingestion`, `get_ai_context_hub_ingestion_status`, `list_sap_services`, `get_sap_service`. Use when the user wants to connect a SAP system, another Open Edition instance, an SAP Integration Hub, a remote MCP server or any HTTP backend; give AI agents the tools of a remote MCP server; change a system's URL, role, client or endpoints; make SAP services (OData, BAPI/business objects, function modules, SAP Edition APIs, Integration Hub APIs) available to AI agents; or see what was ingested. Trigger phrases include "connect my SAP system", "add a remote system", "make the purchase order services available", "set up AI Context Hub", "pin these services", "run the ingestion", "what SAP services are available", "why can't I reach the SAP system", "connect an MCP server", "import the MCP tools".
---

# Remote Systems, AI Context Hub and SAP services via MCP

A **Remote System** is a saved connection from this server to another backend: a URL, a type, a role, per-role endpoint overrides and per-role authentication. Apps, APIs, tiles, deploy routes and AI agents refer to it instead of holding their own URL and credentials.

**Credentials never go through MCP.** The tools cannot read, write or return usernames, passwords, tokens, client secrets or authentication profiles. Authentication comes back as status only. Whenever a step needs a credential, stop and send the user to **Cockpit > Remote Systems > (system) > Authentication**. Never ask the user to paste a credential into the conversation.

## Types

| `type` | Connects to | Used for | AI Context Hub |
|---|---|---|---|
| `''` (empty) | Another Neptune DXP Open Edition server | Deploying packages between servers, calling its APIs, tiles that open its apps | no |
| `SAP` | A SAP system with the Neptune DXP SAP Edition add-on | Calling SAP from apps and APIs, AI agents querying SAP | **yes** |
| `SAPCon` | A Neptune SAP Integration Hub | Calling Integration Hub APIs | no |
| `MCP` | A remote MCP server (`mcpProtocol` `HTTP` or `SSE`) | Extra tools for AI agents | no |
| `Other` | Any HTTP service | Proxying REST APIs with stored auth | no |

## Roles, endpoints and authentication

- `role` (`LOC`, `DEV`, `INT`, `TST`, `QUA`, `STA`, `PRD`, `SAN`) says which landscape tier the remote system belongs to.
- At runtime the server picks the **endpoint** and **auth profile** whose role matches its own server role. `url` is the default when no endpoint matches. One configuration therefore works unchanged after it is transported from DEV to PRD.
- `endpoints` is `[{ role, endpoint }]`. Passing it on update **replaces the whole list**.

## Tools

| Tool | Purpose |
|---|---|
| `list_remote_systems({ listOptions? })` | `listOptions`: `where` (id, name, description, url, type, role, package, updatedAt; operators such as `{ operation: "ILike", value: "%s4%" }`), `select`, `order`, `skip`, `take`. Credentials are never returned. Paged with `hasMore` and `nextSkip`. Use `get_remote_system` for authentication status and AI Context Hub state. |
| `get_remote_system({ id })` | Settings, endpoints, MCP tool names, AI Context Hub config and `authentication` status. |
| `save_remote_system({ id?, name, url, type, role, sapClient?, package?, endpoints?, tlsAllowUntrusted?, ver?, description?, preRequestHookId?, monitoringEnabled?, monitoringName?, mcpProtocol? })` | Create (no `id`, `name` required) or update (only the fields passed change). Stored credentials are always kept. |
| `delete_remote_system({ id })` | Also deletes the system's ingested SAP metadata and unlinks SAP agents. Confirm with the user first. |
| `test_remote_system_connection({ id })` | `SAP`: pings the add-on and returns `reachable`, `authFailed`, `addonMissing` and `message`. `MCP`: reports how many tools the server offers, without storing them. Other types are not supported. |
| `import_remote_mcp_tools({ id })` | `MCP` only. Fetches the server's tool list and stores it on the system. Returns tool names and descriptions. |
| `get_ai_context_hub_config({ id })` / `save_ai_context_hub_config({ id, ... })` | The ingestion configuration, plus `warnings` listing what is still missing. `SAP` systems only. |
| `browse_sap_sources({ id, source, search?, maxRows? })` | Discover what the live SAP system offers (see below). |
| `start_ai_context_hub_ingestion({ id, reingestExisting? })` | Starts ingestion in the background. Returns `started: false` with a reason when the system is unreachable or the config is incomplete. |
| `get_ai_context_hub_ingestion_status({ id })` | Progress of the last run started through MCP, plus ingested service counts by type. |
| `list_sap_services({ id, serviceType?, search?, skip?, take? })` | Ingested services. `serviceType`: `OData`, `FunctionModule` (business objects), `FunctionGroup`, `SearchHelp`, `SAPEditionApi`, `IntegrationHub`. |
| `get_sap_service({ serviceId })` | One ingested service with its entities and operations (up to 200 each). |

Permissions come from the **Remote Systems** role (`systems`). Writes and ingestion also need edit access to the system's package.

## Authentication: what you can see and what to tell the user

`get_remote_system` returns:

```json
"authentication": {
  "configured": true,
  "profiles": [{ "authId": "...", "name": "S4 Basic", "type": "basic", "role": "DEV", "useCloudConnector": false, "exists": true }],
  "inlineCredentials": { "username": "set", "password": "stored" },
  "deploy": { "enabled": false, "token": "none" },
  "guidance": "..."
}
```

- `password` and deploy `token` are `none`, `stored` or `vault` (a vault reference). You never see the value.
- `profiles` are API Authentication artifacts assigned per role. `exists: false` means the assigned profile was deleted, so the user must reassign one.

Explain the method that fits, then send the user to the UI. Profiles are created in **Cockpit > API Authentication** and assigned under **Remote Systems > Authentication**:

| Situation | Auth type to suggest |
|---|---|
| SAP on-premise, technical user | `basic` (Basic) |
| SAP with end-user identity | `sappp` (X.509 SAP Principal Propagation) or `oidcbearer` (OpenID Connect Bearer) |
| S/4HANA Public Cloud | `samlbearer` (SAML 2.0 Bearer) |
| Service-to-service API | `oauth2` (OAuth 2.0 client credentials) or `clientcert` (Client Certificate) |
| Another Neptune DXP Open Edition server | `oauth2dxp` (Neptune DXP Service Account) or `jwt` (Neptune DXP User Token) |
| Reaching an on-premise host from the cloud | any of the above with Azure Relay as cloud connector |

`test_remote_system_connection` returning `authFailed: true` means the credentials were rejected. SAP locks a user after a few failed logons, so do not retry in a loop: ask the user to fix the credentials first.

## AI Context Hub

AI Context Hub reads metadata from a SAP system, stores it with embeddings, and lets AI agents find and call the right SAP service from a plain-language question. It needs a database with vector support (pgvector on PostgreSQL). Without it, the Cockpit tab stays disabled.

`save_ai_context_hub_config` fields (only the fields passed change, and lists replace the stored list):

| Field | Meaning |
|---|---|
| `activate` | Turns AI Context Hub on for the system. |
| `embeddingModel` | AI model id with `outputType: vector`. **Required.** Agents search with the same model, so changing it means re-ingesting. |
| `smallModel`, `enhanceDuringIngestion` | Optional AI rewriting of service descriptions during ingestion. `smallModel` is required when `enhanceDuringIngestion` is true. |
| `ingestOnlyApplicationComponents` | Pinned application component ids, as returned by `browse_sap_sources` (e.g. MM-PUR, Purchasing). |
| `ingestOnlyServices` | OData service technical names, e.g. `API_PURCHASEORDER_PROCESS_SRV`. |
| `ingestOnlyBusinessObjects` | Business object types, e.g. `BUS2012` (Purchase Order). |
| `ingestOnlyFunctionModules`, `ingestFunctionModules` | Function module names, or selection ranges by module, group, package or component. |
| `ingestOnlySapEditionApis`, `ingestOnlyIntegrationHubApis` | API paths or ids. |
| `skipODataServices`, `skipBusinessObjects`, `skipFunctionModules`, `skipSapEditionApi`, `skipIntegrationHub` | Leave a whole source type out of ingestion. |

`browse_sap_sources` calls the live SAP system with the user's credentials:

| `source` | Returns |
|---|---|
| `overview` | Reachability, whether the AI Context Hub transport is installed (`contextHubMissing`), OData support, the component tree and the OData catalog, in one call. Start here. |
| `applicationComponents` | The flattened component tree: components, business objects and OData services per component. |
| `odataCatalog` | Active OData services. |
| `functionModules` | Function module search. `search` is required (e.g. `BAPI_PO*`). |

Lists are filtered by `search` and capped at 200 items (`truncated: true` means narrow the search).

## Typical flow: "Connect my SAP system and make Purchase Order available"

1. **Create the system.** Ask for the URL, SAP client, landscape role and package if they were not given. Then call `save_remote_system({ name, url, type: "SAP", role, sapClient, package })`.
2. **Hand over authentication.** Tell the user which auth type fits (table above) and to set it up in **Cockpit > Remote Systems > Authentication**. Wait until they confirm.
3. **Test.** `test_remote_system_connection`. On `authFailed`, go back to step 2. On `addonMissing`, the Neptune add-on is not installed or not reachable on that SAP system, which is fixed on the SAP side.
4. **Discover.** `browse_sap_sources({ id, source: "overview", search: "purchase" })`. If `contextHubMissing` is true, the SAP side lacks the AI Context Hub transport. Then look up function modules and business objects as needed.
5. **Pick models.** Use `list_ai_models` (see `manage-ai-models`) to find an embedding model, and create one if none exists.
6. **Configure.** `save_ai_context_hub_config({ id, activate: true, embeddingModel, ingestOnlyApplicationComponents: [...], ingestOnlyServices: ["API_PURCHASEORDER_PROCESS_SRV"], ingestOnlyBusinessObjects: ["BUS2012"] })`. Resolve every `warnings` entry.
7. **Ingest.** `start_ai_context_hub_ingestion`, then poll `get_ai_context_hub_ingestion_status` until `job.phase` is `done` or `failed`. Report `job.failures`.
8. **Verify.** `list_sap_services({ id, search: "purchase" })` and `get_sap_service` for the main service.
9. **Explain what is left.** An AI agent reaches the system through a **SAP Data Source**, which is created in Cockpit (no MCP tool). Then it is linked with `sapDataSources` on the agent (see `manage-ai-agents`).

Always finish by listing what you configured and what the user still has to do in the UI.

## Typical flow: "Give my agent the tools of this MCP server"

An agent calls a remote MCP tool only when all three hold: the agent links the system, the tool is in the system's **stored** tool list, and the tool is selected on the agent under the system's **name**.

1. **Create the system.** `save_remote_system({ name, url, type: "MCP", role, mcpProtocol: "HTTP" })`. Use `SSE` only for servers that still serve the older SSE transport.
2. **Authentication.** If the server needs a key or OAuth, send the user to **Cockpit > Remote Systems > Authentication**. Public servers need nothing.
3. **Test.** `test_remote_system_connection` should report the tool count.
4. **Import.** `import_remote_mcp_tools`. Use the returned names exactly. Do not guess them.
5. **Link the agent** (see `manage-ai-agents`): `remoteMCPConnections: [{ id }]` and `config.selectedRemoteMCPTool: { "<system name>": ["tool_a", "tool_b"] }`.
6. **Try it.** Call the agent from a server script (`agents.<contextname>({ input })`, see `manage-server-scripts`) and check that the steps contain `tool-call` entries with `isError: false`.

## Gotchas

- `tlsAllowUntrusted: true` turns off certificate checks for the system. Set it only when the user explicitly asks (e.g. a self-signed dev SAP system), say that it weakens security, and never use it to work around a certificate error on its own initiative.
- Ingestion progress is tracked only for runs started through MCP, on the server process that started them. `job: null` after a restart is normal: `ingested` counts are still accurate.
- An agent's `selectedRemoteMCPTool` is keyed by the system **name**. Renaming an MCP system silently removes its tools from every agent until the key is updated.
- Agents use the **stored** tool list. When the remote server adds or renames tools, run `import_remote_mcp_tools` again.
- Deleting a system removes all its ingested metadata. Re-ingestion is slow and calls SAP, so confirm before deleting.

## Errors

| Error | Cause |
|---|---|
| `System not found` | Wrong id, or the system is in a package the user cannot see. |
| `AI Context Hub is only available for SAP Edition systems (type 'SAP')...` | AI Context Hub tool called on a non-SAP system. |
| `AI model '<id>' not found` | `embeddingModel` or `smallModel` does not exist. |
| `AI Context Hub is not activated...` / `embeddingModel is required...` | Ingestion started before the config was complete. |
| `started: false`, `reason: The SAP system is not reachable` | Wrong URL, network, rejected credentials (`authFailed`) or missing add-on (`addonMissing`). |
| `Access denied: no permission for systems` | The user lacks the Remote Systems role, or has it in display mode for a write. |
