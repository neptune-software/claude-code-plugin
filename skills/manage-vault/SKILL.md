---
name: manage-vault
description: Manage Neptune DXP vault secrets via the MCP tools `list_vault_secrets`, `get_vault_secret`, `save_vault_secret`, `delete_vault_secret`, and use them from server scripts with `await vault.decrypt('<keyId>')` or from API auth headers with `{/vault/<keyId>}`. Use when the user wants to store, generate, rotate, find, or delete a secret, API key, token or password, or to read one in a server script without hard-coding it. Trigger phrases include "store this API key", "create a secret", "generate a password", "put it in the vault", "use the secret in the script", "rotate the token", "list the vault secrets".
---

# Vault secrets via MCP

The vault stores secrets encrypted at rest. The MCP tools **never return a secret value**: they create, update, list and delete secrets and return metadata only. To use a secret, reference it by its `keyId` from a server script or an API auth header. The value is decrypted on the server, never in your context.

The vault must be enabled on the server (`VAULT_ENABLED=true` plus the vault key pair). If it is off, every tool returns `The vault is disabled on this server...`. Tell the user; you cannot enable it through MCP.

## Tools

| Tool | Purpose |
|---|---|
| `list_vault_secrets({ listOptions? })` | Metadata of the secrets the user can see. Supports `listOptions` (`where`/`select`/`take`/`skip`/`order`), e.g. `where: { keyId: 'stripe_api_key' }` or `where: { useInScriptEditor: true }`. Paged like the other list tools (`hasMore`, `nextSkip`). |
| `get_vault_secret({ id } \| { keyId })` | One secret's metadata, by UUID or by keyId. |
| `save_vault_secret({ id?, name, keyId, secret? \| generateSecret?, ... })` | Create (no `id`) or update (with `id`). |
| `delete_vault_secret({ id } \| { keyId })` | Delete a secret. Anything still referencing its keyId breaks at runtime. |

## Creating a secret

Required on create: `name`, `keyId`, and either `secret` or `generateSecret: true`.

- `keyId` is the handle everything else uses. It must be unique (`Key identifier already exists` otherwise). Pick something stable and descriptive, such as `stripe_api_key`.
- **Prefer `generateSecret: true`** when the value does not come from a third party (internal tokens, webhook signing keys, passwords for a new account). The server creates a random URL-safe value (`secretLength`, 16 to 256, default 32) and it never passes through the conversation.
- When the user gives you a value, pass it as `secret`. Do not repeat it back in your reply.
- Set `useInScriptEditor: true` if a server script will read it. Without it, `vault.decrypt` throws `Vault secret not allowed in script editor`.
- `enableHint: true` stores the first 3 characters as `hint`, shown in Cockpit and in tool results. Leave it off for short secrets.
- Expiry email: `notifyOnExpiration: true` with `expiration` (ISO date, must be in the future), plus `notifyDaysBeforeExpiry` and `notifyEmail`.
- `package` (UUID) scopes access to that package's roles.

```json
save_vault_secret({
  "name": "Webhook signing key",
  "keyId": "orders_webhook_secret",
  "generateSecret": true,
  "useInScriptEditor": true
})
```

The result has `id` and `keyId`. Hand the user the `keyId`; that is what scripts and API auth use.

## Updating a secret

Send `id` and only the keys you change; omitted keys keep their stored value. Omit `secret` to keep the stored secret. Pass a new `secret` or `generateSecret: true` to rotate it. `enableHint` only takes effect together with a new secret.

Changing `keyId` breaks every script and API header that uses the old one, so only do it when the user asks, and update those references too.

## Using a secret in a server script

```js
const apiKey = await vault.decrypt('stripe_api_key');
const response = await fetch('https://api.stripe.com/v1/charges', {
    headers: { Authorization: `Bearer ${apiKey}` },
});
result.data = await response.json();
```

- The argument is the **keyId**, not the `id`.
- It throws when the vault is disabled, the keyId does not exist, or `useInScriptEditor` is false.
- Never write the decrypted value to `result`, `log`, or a table. Use it only where it is needed.

## Using a secret in an API auth header

An API header value of `{/vault/<keyId>}` resolves to the secret at request time, so the API definition never holds the plaintext.

## Errors

| Error | Cause |
|---|---|
| `The vault is disabled on this server...` | `VAULT_ENABLED` is not `true` on the server. |
| `You do not have permission to <method> vault secrets` | The user lacks the Vault role, or has it in display mode for a write. |
| `Key identifier already exists` | Another secret uses that `keyId`. |
| `Secret is required and must be a non-empty string` | Create without `secret` or `generateSecret`. |
| `Pass either secret or generateSecret, not both` | Both were sent. |
| `Expiration date cannot be in the past` | `notifyOnExpiration` is on with a past `expiration`. This also blocks updates to an expired secret until you set a new date or turn notification off. |
| `Vault secret with keyId '...' not found` | No secret with that keyId, or it is in a package the user cannot see. |
