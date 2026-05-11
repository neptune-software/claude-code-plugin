# Neptune DXP — Claude Code Plugin

Connects [Claude Code](https://claude.com/claude-code) to a Neptune DXP - Open
Edition server via its native MCP endpoint. Lets Claude list and query tables,
inspect apps and server scripts, and more — directly inside your editor.

## Install

```
/plugin marketplace add neptune-software/claude-code-plugin
/plugin install neptune-dxp@neptune-dxp-marketplace
```

Claude Code will prompt for the **server URL** (e.g. `https://dxp.example.com`).

Then run `/mcp` to authenticate — a browser window opens for OAuth login.

## Requirements

- A Neptune DXP - Open Edition server higher than 24.15.0
- Read access to this repo (SSH key or cached HTTPS PAT) so `/plugin marketplace add` can clone it.

## Updating

```
/plugin update neptune-dxp@neptune-dxp-marketplace
```
