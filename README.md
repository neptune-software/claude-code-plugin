# Neptune DXP — Claude Code Plugin

MCP server that connects Claude Code to the Neptune DXP.

## Prerequisites

- [Bun](https://bun.sh) runtime

## Setup

```bash
cd server
bun install
```

## Project Structure

```
.
├── .mcp.json                  # Claude Code MCP server config
└── server/
    ├── package.json
    ├── tsconfig.json
    └── src/
        ├── index.ts           # MCP server, tools, JSON-RPC transport
        └── credentials.ts     # Credential storage (load/save/auth)
```

## Testing

```bash
printf '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"0.1"}}}\n{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}\n' | timeout 5 bun server/src/index.ts
```
