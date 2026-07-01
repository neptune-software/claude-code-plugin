---
name: connection
description: Inspect, switch, and troubleshoot this plugin's connection to a Neptune DXP - Open Edition instance. Use to point the neptune-dxp tools at another server, change the server URL, re-authenticate, or when the tools won't connect. Trigger phrases include "switch instance", "change the DXP server URL", "connect to a different instance", "which server am I on", "re-authenticate", "MCP not connecting", "tools aren't loading", "404 on /mcp", "connection refused". Failure playbook: `issues.md` in this folder.
---

# Neptune DXP connection

The plugin talks to a DXP server's `/mcp` endpoint over HTTP + OAuth. The tools run on that
server; this skill only covers which server you're on and whether the link works.

## Server URL

The server you're connected to is set by `serverUrl` in a `settings.json`, at
`pluginConfigs["<plugin>@<marketplace>"].options.serverUrl`. To change instances, edit this.

The plugin builds the endpoint as `serverUrl` + `/mcp`, so `serverUrl` is just the base URL —
no `/mcp`, no trailing slash, no path. (`.mcp.json` does this join; don't edit it.)

Current instance = `serverUrl` of the `pluginConfigs` entry whose key matches `enabledPlugins`.

## Switch instance

1. Set that `serverUrl` to the new base URL — **no trailing slash, no path** (a slash yields
   `//mcp`; see `issues.md`). The plugin appends `/mcp`.
2. `/reload-plugins` to pick up the new value (restart Claude Code if that doesn't take).
3. Re-authenticate (`authenticate` → `complete_authentication`); the old session doesn't carry.

Caveats:

- **Edit the live entry** — the one matching `enabledPlugins`. Others (e.g. `@inline`) are inert.
- **Right scope** — value may be in user (`~/.claude/settings.json`), project, or `.local`.
- **Confirm before writing settings.** See `update-config`.
- **Know prod vs dev** before running mutating tools (`save_table`, `save_app`).

## Won't connect

Not switching but failing — tools never load, calls 404/time out, auth loops? See `issues.md`.

## Related

- `dxp-overview` — tool → skill routing, once connected.
- `update-config` — editing `settings.json`.
- `inspect-system-logs` — confirm `/mcp` calls reach the server.
