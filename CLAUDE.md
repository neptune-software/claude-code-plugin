# Neptune DXP — Claude Code Plugin

MCP server that connects Claude Code to a Neptune Software Planet9 server, enabling Claude to read and edit Planet9 artifacts (tables, scripts, apps) via tool calls.

## Architecture

This is a **hand-rolled MCP server** — no SDK. It implements the JSON-RPC 2.0 / MCP protocol directly over stdin/stdout.

- `server/src/index.ts` — Main entry point. Contains:
  - `apiFetch()` — authenticated HTTP client for the Planet9 API (Bearer token)
  - Tool registry (`tools` object) — each tool has description, inputSchema, and handler
  - JSON-RPC message handler (`handleMessage`) implementing `initialize`, `tools/list`, `tools/call`
  - stdin/stdout transport via `readline`
  - `debug()` helper for ad-hoc interactive testing (type `list` on stdin)
- `server/src/credentials.ts` — Stores/loads credentials from `~/.neptune-dxp/credentials.json`
- `server/src/log.ts` — Simple file logger appending to `server/log`

## Current state

Only a `test` placeholder tool exists. The intended API surface (login, tables, scripts, apps) needs to be built out against the real Planet9 REST API.

## Running

```bash
# Start as MCP server (used by Claude Code via .mcp.json)
npm start --prefix server    # runs: tsx src/index.ts

# Interactive test
printf '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"0.1"}}}\n' | npm start --prefix server
```

## Tech stack

- **Runtime**: Node.js with tsx (TypeScript execution)
- **Language**: TypeScript (ES2022, Node16 modules)
- **Dependencies**: tsx, @types/node (dev only) — no MCP SDK, no other deps
- **Config**: `.mcp.json` at project root registers the server with Claude Code

## Key conventions

- No MCP SDK — raw JSON-RPC over stdio. Keep it that way unless there's a reason to add the SDK.
- Tools are registered in the `tools` object in index.ts. To add a new tool: add a key with `description`, `inputSchema` (JSON Schema), and `handler` (async function returning a string).
- Credentials persist at `~/.neptune-dxp/credentials.json`. Call `requireAuth()` before any authenticated API call.
- **Do not use `console.log`** — it writes to stdout which is the MCP transport. Use the `log()` function from `log.ts` for debugging.
