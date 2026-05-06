# Neptune DXP — Claude Code Plugin

Connects Claude Code to a Neptune Software Planet9 server via Planet9's
native MCP endpoint. Purely declarative — no local server, no SDK, no proxy.

## How it works

- `.claude-plugin/plugin.json` declares one userConfig prompt: `serverUrl`.
- `.mcp.json` registers a remote HTTP MCP server at `${serverUrl}/mcp`.
- Claude Code handles OAuth 2.1 automatically (DCR + PKCE + refresh) by
  discovering `/.well-known/oauth-protected-resource` on the Planet9 server.
- Run `/mcp` inside Claude Code to authenticate — a browser flow opens.

## Prerequisites

- Planet9 server with MCP enabled at `/mcp`.
- For self-signed dev certs: export `NODE_EXTRA_CA_CERTS=/path/to/ca.pem`
  before launching Claude Code (or `NODE_TLS_REJECT_UNAUTHORIZED=0`, insecure).

## Editing

Bump `version` in `.claude-plugin/plugin.json` so users pull updates.
