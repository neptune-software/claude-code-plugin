# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

This is a **Claude Code plugin** (`neptune-dxp`), not an application. It has no
build step, no runtime code, and no compiled output. It ships two things:

1. **An MCP server binding** (`.mcp.json`) that points Claude Code at a user's
   Neptune DXP - Open Edition server's native `/mcp` endpoint over HTTP+OAuth.
2. **A set of skills** (`skills/*/SKILL.md`) that teach Claude how to use the
   MCP tools that server exposes, and the Neptune DXP domain behavior behind them.

The MCP tools themselves live on the Neptune DXP server, **not in this repo**. This
repo only configures the connection and documents the tools.

## Layout

- `.claude-plugin/plugin.json` — plugin manifest. `version` is the single source
  of truth for the release version; `userConfig.serverUrl` is the URL the user is
  prompted for at install, injected into `.mcp.json` as `${user_config.serverUrl}`.
- `.claude-plugin/marketplace.json` — marketplace entry pointing at the public
  GitHub repo (HTTPS clone URL, so keyless installs work).
- `.mcp.json` — the MCP server definition. `alwaysLoad: true` keeps it active.
- `skills/<name>/SKILL.md` — one skill per Neptune DXP artifact segment.

## Skills are the real content

Each skill is a markdown file with YAML frontmatter (`name`, `description`) plus a
body. The **`description` is load-bearing**: Claude Code uses it to decide when to
auto-invoke the skill, so it must enumerate concrete trigger phrases and the exact
MCP tool names the skill covers. Keep descriptions specific.

Two kinds of skills:

- `dxp-overview` — the foundational primer. Defines shared vocabulary (Cockpit vs
  Launchpad, Planet9, the artifact model, `modules.*` / `req` / `result`
  server-script rules) and, critically, holds the **MCP-tool → skill routing
  table**. Every other skill builds on its terms. When you add or rename an MCP
  tool or a skill, update the routing table and the "Related skills" list here.
- One skill per artifact area — `manage-apps`, `manage-webapps`, `manage-apis`,
  `manage-server-scripts`, `run-server-script`, `manage-tables`, `manage-adaptive`,
  `manage-npm-modules`, `inspect-system-logs`, `search-docs`. Each documents its
  tools, arguments, gotchas, permission roles, and cross-links related skills with
  `` `skill-name` `` references.

When editing skill content, the goal is accuracy against the **live MCP server's
actual behavior** — field meanings, permission roles, DDL side effects, and
footguns — not just the tool's JSON schema. Schemas describe call shape; skills
describe platform behavior the schema doesn't reveal.

## Editing conventions

- **Edit skills here in `skills/`, never in the installed plugin cache.** Changes
  must land in this repo's source.
- Bumping a release = bump `version` in `.claude-plugin/plugin.json`.
- Preserve each skill's cross-reference links (`` `manage-apis` ``, etc.) and the
  routing/vocabulary tables in `dxp-overview` when restructuring — they are how
  skills chain together at runtime.

## Verifying skill accuracy

There is no committed test suite. Skill claims are verified manually against a
running Neptune DXP - Open Edition MCP server (a local `planet9` checkout), by
exercising the MCP tools and confirming the documented behavior, roles, and
gotchas match reality. Prefer verifying against a **development or local** instance
— several documented operations (`save_table` DDL, `save_app` activation) mutate
real server state.
