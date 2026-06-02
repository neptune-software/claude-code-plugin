---
name: manage-npm-modules
description: Install, list, inspect, or uninstall npm modules for Neptune DXP server scripts via the MCP tools `list_npm_modules`, `get_npm_module`, `install_npm_module`, `uninstall_npm_module`. Use when the user wants to add a third-party package for use in server scripts (exposed as `modules.<name>`), see which packages are installed, or remove one. Trigger phrases include "install lodash", "add an npm package", "make axios available to scripts", "list npm modules", "uninstall this module", "what packages can scripts use".
---

# Managing Neptune DXP npm modules via MCP

Server scripts in Neptune DXP do **not** use `require()` or `import`. Third-party packages are exposed on a global `modules` object — `modules.axios`, `modules.dayjs`, `modules.lodash` — and the set of available packages is managed centrally (the Cockpit's NPM Modules app, or these MCP tools). See `dxp-overview` for that platform rule. These tools are the programmatic equivalent of that Cockpit app.

## Tools

| Tool | Purpose |
|---|---|
| `list_npm_modules` | All registered modules: id, `contextName` (the `modules.*`/require name), version, description, path, `isLocal`. |
| `get_npm_module({ id })` | One module **plus the scripts and AI agents that reference it** — your impact check before uninstalling. |
| `install_npm_module({ name, version?, description?, installParameters? })` | Run `npm install`, verify the module loads, register it so scripts can use it. |
| `uninstall_npm_module({ id })` | Run `npm uninstall` and remove the record. |

## Installing

`install_npm_module` arguments:

- `name` (required) — the npm **registry** package name. Plain (`"lodash"`) or scoped (`"@scope/pkg"`). This name is both the install target and the `contextName` scripts reference it by.
- `version` (optional) — semver, range, or dist-tag (`"4.17.21"`, `"^4.0.0"`, `"latest"`). Defaults to latest.
- `description` (optional) — stored on the record.
- `installParameters` (optional) — extra args passed verbatim to `npm install` (e.g. `["--legacy-peer-deps"]`).

On success returns `{ install, module }` (the install result and the saved registry record). After installing `lodash`, scripts use it as `modules.lodash` — **not** `require('lodash')`.

## Gotchas

- **Registry names only — by design.** `name` is validated against the npm package-name grammar. Git URLs, tarball URLs, local paths, and `name@version` specs are **rejected** (they'd let npm run arbitrary lifecycle scripts). `version` is likewise restricted to semver/range/dist-tag. Expect a clear error like `Invalid npm package name '...'` if you pass a non-registry spec.
- **Use `modules.<name>`, never `require`/`import`** in the consuming script. Installing the module does not change that rule.
- **`contextName` is the access key.** It equals the package `name` you installed. That's the property on the `modules` global.
- **Check references before uninstalling.** `get_npm_module({ id })` lists the scripts and AI agents that use the module — uninstalling one in active use will break those at runtime.
- **`uninstall_npm_module` is keyed by record `id`, not by name.** Use `list_npm_modules` to map a name to its id first.
- **`isLocal`** distinguishes registry installs from locally-provided modules; install via this tool sets `isLocal: false`.

## Discovery flow

1. `list_npm_modules` — see what's available and the `contextName`s scripts can use.
2. `get_npm_module({ id })` — inspect one and who depends on it.
3. `install_npm_module({ name, version? })` — add a package.
4. `uninstall_npm_module({ id })` — remove one (after checking references).

## Permissions

All four tools require the `npmmodules` role: `List` (`list_npm_modules`), `Get`, `Install` (`install_npm_module`), `Del` (`uninstall_npm_module`).

## Related skills

- **`dxp-overview`** — the `modules.*` loading rule and other server-script platform differences.
- **`manage-server-scripts`** — author the scripts that consume these modules as `modules.<name>`.
