# Diagnosing connection failures

For when the neptune-dxp tools fail at the connection layer — never load, time out, 404, or
bounce on auth — not the tool's own logic. Work top-down.

## Check first: verify the URL

`.mcp.json` builds `${user_config.serverUrl}/mcp` with no trimming. A trailing slash on
`serverUrl` yields `https://dxp.example.com//mcp` — stricter routers 404 it. Cheapest to rule
out, so check first. Symptom: 404 at connect though the base URL loads in a browser.

**Fix:** set `serverUrl` to a bare base URL (no slash, no path). Location + caveats: `SKILL.md`,
"Switch instance".

## Connection issue vs tool issue

- **Connection** — every tool fails the same way, or none load. Fix the connection.
- **Tool** — connection fine, one call returns a domain error (bad arg, missing role, bad id).
  Go to that tool's skill via `dxp-overview`.

## Gotchas

- Fix `serverUrl` at its source, never in the cached `.mcp.json` (overwritten on update; wrong layer).
- Base URL loading in a browser doesn't prove `/mcp` works — it hits root, not the endpoint.
