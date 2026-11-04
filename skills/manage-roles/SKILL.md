---
name: manage-roles
description: Create, update, inspect, or delete Neptune DXP roles (the permission bundles that grant Cockpit tools and limit who may use apps, tiles, APIs, tables, agents and other artifacts) via the MCP tools `list_roles`, `get_role`, `save_role`, `delete_role`. Use when the user wants a new role, to grant or remove Cockpit permissions (display or edit), to see where a role is used or who holds it directly, to rename a role, or to delete one. Trigger phrases include "create a role", "give this role access to the connector tool", "read-only role", "which apps use this role", "who has this role", "Cockpit permissions", "delete the role". Read this BEFORE any `save_role` update (omitting `acl` wipes all permissions; omitting `isGlobalAdmin` fails for non-admins) and BEFORE deleting a role (artifacts it protects can become open to everyone).
---

# Managing Neptune DXP roles via MCP

A **role** does two things:
1. **Cockpit permissions** (`acl`): which Cockpit tools its holders may open, per tool `N` (none), `D` (display) or `E` (edit).
2. **Run-time access**: an artifact with a non-empty `roles` list (tile groups, tiles, apps, launchpads, APIs, Adaptive apps, connectors, PDFs, agents, AI tools, models, web apps, table read/write) is open only to users who hold **at least one** of the listed roles. **An artifact with no roles is open to every signed-in user.**

Package roles are different: they limit who may read or edit a package's artifacts at design time (READ/EDIT) and are set only in the Cockpit.

Users hold roles directly (Cockpit → Users; no MCP tool edits a user), through **security groups** (`manage-security-groups`), through identity-provider sign-in (role and group claims, provider assignments) and through launchpad self-registration. The tools need the Cockpit Role permission (ACL key `securityrole`): Display allows `list_roles`/`get_role`, Edit is needed for `save_role`/`delete_role`.

| Tool | Purpose |
|---|---|
| `list_roles({ listOptions? })` | `id`, `name`, `description`, `package`, `isGlobalAdmin`; `where`/`select`/`order` on those keys; `{ items, hasMore, nextSkip? }`. |
| `get_role({ id })` | The role, its `acl` as an object with **every** Cockpit tool (key → `{ id, name, mode, modes, description, parent, action, sort, … }`; `modes` = the modes that tool offers), and where-used arrays: `users` (**direct holders only**), `departments` (security groups; their members also hold the role), `categories` (tile groups), `tiles`, `apps`, `launchpads`, `apis`, `reports` (Adaptive apps), `connectors`, `pdfs`, `agents`, `ai_tools`, `models`, `entitiesRead`, `entitiesWrite` (tables), `rulesengines`, `workflows`, `processFlows`, `webapps`, `packages`. Not listed: identity-provider assignments, launchpad self-registration and process-flow approver settings that hold the role's id. An unknown id fails with `You do not have permission to get this Role` (also for a role in a package you cannot read) or, for a Global Admin, `Role Not Found`. |
| `save_role({ role })` | Create (no `id`) or update (with `id`). See Save rules. |
| `delete_role({ id })` | Permanent; returns `{"status":"Successfully deleted"}`, also for an id that does not exist. See Before deleting. |

## Save rules

`save_role({ "role": { "id"?, "name", "description"?, "package"?, "isGlobalAdmin"?, "acl"? } })`

- **`name` is required on every save**, also on updates (`Required at role.name`). A duplicate name fails with `save_role failed: Error while saving role`.
- **Always send `isGlobalAdmin`** with its current value (`false` for an ordinary role). Left out, every update by a user who is not a Global Admin fails with `Only a user with Global Admin can update Global Admin permissions!`. Only a Global Admin may change it; never set it to `true` unless the user explicitly asks and is a Global Admin.
- **`acl` is replaced as a whole on every save; leaving it out removes all permissions.** To change only the name or description, send the current granted entries again.
  - `acl` is an object keyed by Cockpit tool (`developmentcockpit`, `developmentadaptivedesigner`, `connectivityconnector`, `securityrole` …).
  - Only entries with mode `D` or `E` are granted; everything else becomes `N`. A minimal entry is enough: `{ "connectivityconnector": { "id": "connectivityconnector", "name": "Connector", "mode": "E", "sort": 1 } }` (the server fills in name, sort and methods).
  - **An unknown key or a mode the tool does not offer is dropped without error** (`get_role` → `acl.<key>.modes`); modes are uppercase `N`/`D`/`E`. Compare `get_role` after every save.
  - A new role has no permissions, not even Cockpit access: holders who work in the Cockpit need `"developmentcockpit": { "id": "developmentcockpit", "name": "Cockpit", "mode": "D", "sort": 101 }`.
- `description` and `package` keep their stored values when left out, but the save **response** shows `description: null` and returns `acl` as an array of granted entries (ids like `connectivityconnector_E`). Read the stored state with `get_role`; never send the response's `acl` back.
- A `save_role` with an `id` that does not exist creates a new role with that id. Look roles up with `list_roles` first.

## Security

- **Granting is not limited by what the editor holds**: a role editor can grant any Cockpit permission, including role, user and security-group administration (`securityrole`, `securityuser`, `securitydepartment` at `E`), which lets holders grant themselves more. Grant administrative tools only on the user's explicit request.
- A Global Admin role (`isGlobalAdmin: true`) gives full Cockpit and package access (run-time role lists on apps, APIs, tiles and the like still apply). The server lets a non-admin edit such a role (when `isGlobalAdmin: true` is sent unchanged) and delete it; never do either unless the user is a Global Admin and asks explicitly.

## Before deleting

`get_role` and report, before asking for confirmation:
- **Artifacts whose only role this is become open to every signed-in user** (a package: to every developer). If they must stay restricted, give them another role first with their own skills.
- Direct holders (`users`) and the members of the listed security groups lose the role.
- References held elsewhere (identity-provider assignments, launchpad self-registration, process-flow approvers) are not cleaned and keep the deleted id.

## Recipes

**Read-only role for one area**: `save_role({ "role": { "name": "Adaptive viewers", "isGlobalAdmin": false } })` → `get_role` → pick keys whose `modes` include `D` → `save_role({ "role": { "id": "…", "name": "Adaptive viewers", "isGlobalAdmin": false, "acl": { "developmentcockpit": {…D…}, "developmentadaptivedesigner": {…D…} } } })` → `get_role` and check each granted entry.

**Rename or describe a role without losing permissions**: `get_role` → collect the entries whose `mode` is `D` or `E` → `save_role({ "role": { "id", "name": "<new>", "description": "…", "isGlobalAdmin": <current>, "acl": { …those entries… } } })`. Renaming breaks identity-provider role claims that match the old name.

**Protect an artifact**: add the role to the artifact's `roles` (`[{ id }]`) with that artifact's tool where it accepts `roles` (`manage-adaptive`, `manage-connectors`, `manage-tiles`, `manage-tile-groups`, `manage-apis`, `manage-ai-agents` …); give users the role through a security group.

## Related skills

- **`manage-security-groups`**: give users roles; identity-provider groups.
- The artifact skills above: where a role limits run-time access.
