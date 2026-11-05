# Releases and their MCP tools

The MCP server is part of Open Edition, so every release brings its own tool set. **The server's tool list is the source of truth**: this page explains it, but a server offers only the tools in its list.

| Release | Tools | Tool families added | Skills that need them |
|---|---|---|---|
| 24.15 (every patch) | 41 | Apps, web apps, APIs, server scripts and script projects, `run_server_script`, tables and `query_entity_table`, Adaptive apps, packages, NPM modules, system logs | `manage-apps`, `manage-webapps`, `manage-apis`, `manage-server-scripts`, `run-server-script`, `manage-tables`, `manage-adaptive`, `manage-packages`, `manage-npm-modules`, `inspect-system-logs` |
| 25.0.0 | 88 | +47: process flows with their executions and user tasks; AI agents, models and tools (with `list_ai_vendor_settings`); PDF templates and documents; tiles and tile groups; users; `list_email_templates` (listing only, no create or change); locks; `get_system_info`; `get_system_settings` | `manage-process-flows`, `manage-ai-agents`, `manage-ai-models`, `manage-ai-tools`, `agentic-apps`, `manage-tiles`, `manage-tile-groups` |
| 25.0.1 | 151 | +63: AI guardrails, Agent Trace, connectors, fonts, i18n, launchpads, Media Library, file uploads, Remote Systems with AI Context Hub and SAP services, roles, security groups, Theme Generator, vault | `manage-ai-guardrails`, `inspect-agent-traces`, `manage-connectors`, `manage-fonts`, `manage-i18n`, `manage-launchpads`, `manage-media`, `upload-files`, `design-to-launchpad`, `manage-remote-systems`, `manage-roles`, `manage-security-groups`, `manage-theme-generator`, `manage-vault` |

No release removed a tool.

## Differences that matter

- **`get_system_info`** exists from 25.0.0. On a 24.15 server it is missing, and that alone identifies the release.
- **External (A2A) agents**: `save_ai_agent` creates them from 25.0.1 on. 25.0.0 refuses with `Not supporting creating external ai agent via mcp tool yet`.
- **Pre-release labels**: development and pre-release builds report a label such as `25.0.0-beta.7` whatever tools they carry, so two servers with the same label can offer different tools. Go by the tool list.

## Documentation

The docs search index (`search-docs`) holds Open Edition pages for 22, 23, 24.14 and 24.15. The 25.0 pages (about 660, under `/neptune-dxp-open-edition/25.0/`) are on docs.neptune-software.com but not in the index, and some topics exist only there, for example process flows, AI Context Hub, and the MCP server pages for AI artifacts, PDF templates, tiles, users and locks. The release notes are indexed, including 25.0.0.
