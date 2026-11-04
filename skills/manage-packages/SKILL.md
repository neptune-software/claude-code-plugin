---
name: manage-packages
description: Create, update, inspect, or delete Neptune DXP development packages (the containers that group apps, scripts, tables, APIs and other artifacts for transport and access control) via the MCP tools `list_packages`, `get_package`, `save_package`, `delete_package`. Use when the user wants a new package, to see what a package contains, to rename or describe one, to find which package an artifact is in, or to delete a package. Trigger phrases include "create a package", "what is in this package", "list the packages", "rename the package", "delete the package", "move this into a package". Read this BEFORE `save_package` on an existing package — an update removes the package's access roles.
---

# Managing Neptune DXP packages via MCP

A **development package** groups artifacts so they can be transported between systems (export, deploy, Git) and so access can be limited by role. An artifact belongs to a package through its **own** `package` field, set with that artifact's tool (`save_table`, `save_api`, `save_adaptive`, `create_script_project` …); the package itself only has a name, a description and the `enableCICD` flag over MCP. Artifacts created over MCP without `package` go into the caller's default development package when one is set and the caller may edit it (where packages are mandatory, a create without one fails with `Package is a required field`). All four tools need the Cockpit Package permission (`package`: `Get`, `Save`, `Del`; any permission for the list).

| Tool | Purpose |
|---|---|
| `list_packages({ listOptions? })` | Items `id`, `name`, `description`, `updatedAt`; `where`/`order` on `name`, `description`, `enableCICD`, `ver`, `createdBy`, `changedBy`, `createdAt`, `updatedAt`; `{ items, hasMore, nextSkip? }`. |
| `get_package({ id })` | The package (`name`, `description`, `enableCICD`, `git`, `roles` = its access roles, …) and one array per artifact type. Entries carry `id`, `updatedAt` and usually `changedBy` plus a label: `name`, or `application` (apps, PDF templates, docs), `title` (workflow definitions), `NAME` (layouts), `theme` (UI5 themes); AI prompts have no label. Unknown id: `Package not found`; a package you may not read: `No read access to package`. |
| `save_package({ id?, name?, description?, enableCICD? })` | Create (no `id`; `name` required) or update (`id`; fields left out keep their values). Returns `{ id, name, ver, updatedAt, created }`; `created` only says whether you sent an `id` — **an `id` that does not exist creates a package with that id** (`created: false`). Check with `get_package` first. |
| `delete_package({ id })` | Deletes the package record only. See Delete. |

Artifact arrays in `get_package` (empty arrays are listed too): `apps`, `webapp`, `reports` (Adaptive apps), `connector`, `dictionary` (tables), `jsclass` (server scripts; a script takes its project's package when saved with `projectId`, and `save_server_script` has no `package` parameter), `jsscript_group` (script projects), `api`, `api_group`, `api_authentication`, `tile`, `category` (tile groups), `launchpad`, `launchpad_layout`, `tile_layout`, `tilegroup_layout`, `theme`, `theme_generator`, `theme_ui5`, `font`, `media_library`, `pdf` (PDF templates, by their **activated** copy: a never-activated template is missing, and a moved one shows under its old package until re-activated), `rulesengine`, `processFlow`, `wf_definition`, `events`, `code_snippets`, `i18n`, `role`, `department` (security groups), `systems` (remote systems), `vault`, `ai_agent`, `ai_model`, `ai_prompt`, `ai_tool`, `ai_guardrail`, `sap_data_source`, `script_scheduler`, `certificates`, `path_rewrite`, `doc` and a few more.

## Save rules

- **Names are not unique**: saving a new package with an existing name creates a second package with the same name. Check `list_packages` (`where: { name: … }`) first and update by `id`.
- `name` cannot be empty (`String must contain at least 1 character(s) at name`).
- **An update removes the package's access roles.** Every `save_package` rewrites the package's role list from the request, and the tool cannot send roles, so `roles` in `get_package` becomes empty after any update (a description change included). Packages without roles are open to every developer with the Package permission. Before updating a package whose `get_package` shows `roles`, tell the user they must re-assign the roles in the Cockpit (Development Packages), or leave the package unchanged.
- Git and CI/CD (`git`) are configured in the Cockpit; MCP shows them but cannot set up a repository.
- For users who are not Global Admins, `list_packages` shows only packages without roles or with one of the user's roles; saving or deleting a role-restricted package needs one of its EDIT roles (`No edit access to artifact`), and such an update then removes the roles (above).
- `where` keys outside the listed fields are dropped and the list comes back unfiltered; read a known id with `get_package`. `name` is trimmed.

## Delete

- `delete_package` is permanent. **Its artifacts stay and lose their package** (`package: null`); the package's role assignments and history are deleted with it, and media-library folders assigned to it may be deleted too. To remove the contents, delete each artifact with its own tool first.
- A package that is any user's default development package cannot be deleted (`Cannot delete the development package because it is being used as the default development package by one or more users.`).
- Unknown or already deleted id: `Package '<id>' not found`.

## Recipes

**New package for a project**: `list_packages({ "listOptions": { "where": { "name": "Sales app" } } })` → none → `save_package({ "name": "Sales app", "description": "…" })` → use its `id` as `package` when creating the project's artifacts.

**What is in a package**: `get_package` → report the non-empty arrays by type.

**Tidy up a package**: `get_package` → delete or move each artifact (save it with another `package`; PDF templates show in the new package after re-activation; a script follows its project's package, which no MCP tool can change) → `delete_package`.

## Related skills

- **`manage-roles`**: the roles a package can be limited to (assigned in the Cockpit).
- Each artifact's skill sets its `package` (`manage-tables`, `manage-apis`, `manage-server-scripts`, `manage-adaptive`, …).
