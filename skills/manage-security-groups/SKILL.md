---
name: manage-security-groups
description: Create, update, inspect, or delete Neptune DXP security groups (groups of users that receive roles) via the MCP tools `list_security_groups`, `get_security_group`, `save_security_group`, `delete_security_group`. Use when the user wants to give users a role, add or remove users from a group, prepare a group for an identity provider's group claim, see who is in a group, or delete one. Trigger phrases include "security group", "add these users to", "give the sales team the role", "Azure group", "who is in the group", "delete the group". Read this BEFORE adding users or roles — a group can grant Global Admin.
---

# Managing Neptune DXP security groups via MCP

A **security group** (Cockpit: Security Groups) bundles **users** and **roles**: every member holds every role of the group, for Cockpit permissions, run-time access and process-flow approvals. Over MCP this is the way to give users roles (no tool edits a user). The tools need the Cockpit Security Groups permission (ACL key `securitydepartment`): Display allows list/get, Edit is needed for save/delete. User ids come from `list_users`, which needs the User permission (`securityuser`).

## Security first

- **A group can make its members Global Admin.** Roles reached through a group count, including `isGlobalAdmin` roles, and saving a group is not limited to Global Admins. Before adding a role, check `list_roles` → `isGlobalAdmin`; **never add a Global Admin role to a group, or a user to a group that holds one, unless the user is a Global Admin and explicitly asks.**
- Adding a user to a group, or a role to a group, changes what those users may do: state the effect (roles, their Cockpit permissions, members) and confirm first.
- A group used by a launchpad's self-registration is given to everyone who registers there; a role added to it reaches all of them.

| Tool | Purpose |
|---|---|
| `list_security_groups({ listOptions? })` | `id`, `name`, `description`, `package`, `updatedAt`; `where`/`order` on `name`, `description`, `idpSource`, `package`, `changedBy`, `updatedAt` — a filter on any other key (such as `id`) is dropped and returns unfiltered groups; use `get_security_group` for an id. |
| `get_security_group({ id })` | `name`, `description`, `idpSource`, `idpSourceId`, `idpSourceKey`, `package`, `roles` (full role rows incl. `isGlobalAdmin`), `users` (`id`, `username`, `name`, `email`, `locked`, `admin`, `idpSource`, `lastLogin`, …). Unknown id: `Not Found`. |
| `save_security_group({ id?, name, description?, roles?, users?, idpSource?, idpSourceId?, idpSourceKey?, package? })` | Create (no `id`) or update (with `id`). The fields are passed directly, not wrapped. |
| `delete_security_group({ id })` | Permanent (`{"status":"Security Group deleted"}`); members lose the group's roles. Unknown id: `Not Found`. |

## Save rules

- `name`: required on create (without it: `save_security_group failed: Error saving department`), unique (`name '<name>' already exists!`), max 64.
- **`roles` and `users`** (`[{ id }]`): each is replaced as a whole when sent and kept when left out; `[]` clears it. To add one user, send the current members plus the new one. An unknown role id fails with only `save_security_group failed: Error saving department` (the group is unchanged).
- `idpSource` is a label shown in the Cockpit list (free text up to 16 characters, e.g. `local`, `saml`, `azure-bearer`); **every save without it sets it back to `local`**, so send the current value on updates. `idpSourceId` must be a UUID. Sign-in through SAML, Azure, OpenID Connect, OAuth2 or JWT does not use these fields (see below).
- A save with an `id` that does not exist creates a new group with that id. Unknown keys are dropped. On create without `package`, the caller's default package applies.

## Identity-provider groups

At sign-in through SAML, Azure, OpenID Connect, OAuth2 or JWT, the user is added to every group whose **name** equals a value of the provider's `groups` claim (for Azure usually the group's object id); with such a claim, the user's groups are replaced by the claimed ones (plus the groups the provider's Cockpit configuration assigns, on first sign-in or always when "assign on first login only" is off). When the `autoImportIdpGroups` setting is on (off by default), missing groups are created, named after the claim values. So:
- To map a provider group, create the group with `name` = the exact claim value and give it the roles; check after the next sign-in with `get_security_group`.
- **Renaming a group breaks that match**, and memberships added here for provider users can be replaced at their next sign-in.
- LDAP sign-in matches by name and LDAP configuration; LDAP group import is done in the Cockpit.

## Recipes

**Give users a role**: `list_roles` (the role id; confirm `isGlobalAdmin: false`) → `list_users` (user ids) → `save_security_group({ "name": "Sales team", "roles": [{ "id": "<role>" }], "users": [{ "id": "<user>" }, …] })` → `get_security_group` to confirm members and roles.

**Add a user to an existing group**: `get_security_group` (check its roles) → `save_security_group({ "id", "name", "idpSource": <current>, "users": [ …current ids…, { "id": "<new user>" } ] })`.

## Related skills

- **`manage-roles`**: the roles a group hands out, and where a role is used (`get_role` → `departments`).
