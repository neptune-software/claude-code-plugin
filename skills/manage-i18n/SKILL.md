---
name: manage-i18n
description: Create, update, inspect, or delete Neptune DXP i18n (translation) models via the MCP tools `list_i18n_models`, `get_i18n_model`, `save_i18n_model`, `delete_i18n_model`, `list_i18n_languages`, `list_i18n_attribute_types`. Use when the user wants to translate an app, launchpad, tile, tile group, Adaptive app, PDF or email template, add a language, add or change texts and their translations, override texts of a shipped model with an enhancement, see where a model is used, or delete one. Trigger phrases include "translate", "add German", "i18n model", "translation texts", "make the tiles multilingual", "which languages are available", "override the texts", "where is this i18n model used". Read this BEFORE any `save_i18n_model` with `attributes` — the list replaces the stored texts.
---

# Managing Neptune DXP translations (i18n models) via MCP

An **i18n model** holds texts (`attributes`), each with a default `text` and translations per locale. Artifacts show a text through a binding instead of a fixed string:
- `{i18n.<model name>>key}` — a **global** model (tiles, tile groups, launchpads, Adaptive apps, PDFs, email templates, and App Designer apps too);
- `{i18n>key}` — inside an App Designer app, its own **app model** (at most one per app, `name` and `application` = the app name; apps created with `save_app` have none until one is added).

The user's language picks the translation, then the `fallbackLocale` translation, then the text's default `text`. **Bindings name the model**, so renaming a global model breaks every `{i18n.<old name>>…}` binding (where-used keeps listing the artifacts, so it still looks healthy). All six tools need the Cockpit i18n permission (`i18n`: `Get`, `Save`, `Del`, `getLanguages`, `getAttributeTypes`; any permission for the list).

| Tool | Purpose |
|---|---|
| `list_i18n_models({ listOptions? })` | Items `id`, `name`, `description`, `application`, `package`, `updatedAt`; `where`/`order` on `name`, `description`, `application`, `fallbackLocale`, `package`, `active`, `baseModelId`, `ver`, `changedBy`, `updatedAt`; `{ items, hasMore, nextSkip? }`, 25 per page (max 200). |
| `get_i18n_model({ id } \| { name } \| { application }, locales?)` | The model with `attributes`, `locales`, `fallbackLocale`, `active`, `baseModelId`, `baseModel`, `enhancedBy` and `whereUsed` (`apps`, `adaptive`, `launchpad`, `category` (tile groups), `tile`, `wf_notifications` (email templates), `doc`, `pdf_runtime`). A `name` matches a global model first, then an app's model; use `application` for an app model. `locales: ["de"]` returns only those translations; empty translations are never returned. |
| `save_i18n_model({ i18n })` | Create (no `id`, `name` required) or update. See Save rules. |
| `delete_i18n_model({ id })` | Refused for an app model (deleted with its app), a model in use (lists the users), and a model with enhancements; an enhancement can always be deleted. **A use counts only if the artifact was saved after the model existed** (see Save rules). |
| `list_i18n_languages()` | Languages that can be added: `{ isoCode, locale, name, native }`; one `isoCode` can have several locales (`NO` → `no`, `no-NO`, `nb`, `nb-NO`). |
| `list_i18n_attribute_types()` | Text types for `attributes[].type` (`XBUT` button text, `XFLD` label, `XTIT` table title, `XMSG` message, `NOTR` no translation, …); `type` is not checked against the list. |

## Save rules

`save_i18n_model({ "i18n": { "id"?, "name", "description"?, "locales"?, "fallbackLocale"?, "attributes"?, "package"?, "active"?, "baseModelId"? } })`

- **`attributes` replaces the whole list of texts**: texts you leave out are deleted. Send every text on each update; a text sent again after being dropped gets a new `id` (bindings use the name, so they still work).
- A text: `{ "name": "save", "text": "Save", "type": "XBUT", "de": { "text": "Speichern" }, "pt": { "text": "Guardar" } }`. **Only translations are kept when left out**: `text`, `type`, `description`, `maxLength` and `parent` come from what you send (a child sent without `parent` becomes a top-level text) (a text sent as `{ "name": "save" }` loses its default text and type). To remove a translation send it as **`null`** (`"de": null`); `{ "text": "" }` stores an empty translation, so that language shows an empty text (and `get_i18n_model` hides it).
- **Child texts**: name `"parent.child"` and set `parent` to the parent's name (`{ "name": "menu.open", "text": "Open", "parent": "menu" }`); `parentId` is filled in. A child whose parent is not in the same `attributes` list is dropped without error.
- `locales`: the model's languages, `[{ "isoCode": "EN", "locale": "en" }, { "isoCode": "DE", "locale": "de" }]` (`isoCode` max 3; take them from `list_i18n_languages`). On create the defaults are `locales: [EN/en]`, `fallbackLocale: "en"`, `active: true`.
- Fields you leave out keep their values; `name` can be changed for a global model (it breaks its bindings, see above). Global model names are unique (`A global model with this name already exists.`). An unknown `id` returns `Not Found`.
- **Create the model before the artifacts that bind it**: an artifact saved with `{i18n.<model>>…}` before the model existed is not linked, so `whereUsed` misses it and the model can be deleted from under it. Re-save such artifacts (re-activate apps) after creating the model.
- **App models**: an app has at most one; update it (`get_i18n_model({ application })`), never create a second (`App '<app>' already has i18n model …`). Its `name` must equal the app name. The `application` of a model and the name of an app model cannot be changed. `delete_app` hides the app's model with the app (`list_i18n_models` drops it, get by id still returns it; restore brings it back, a purge deletes it) and is refused while that model has enhancements.
- `active: false`: App Designer apps get no texts from the model (tiles and launchpads still resolve it).
- Save and delete fail while someone has the model open in the Cockpit (`… is locked by …`).
- Errors: `The model is missing a name`, `Provide id, name or application`, `App '<app>' has no i18n model`, `No global or app i18n model named '<name>'`.

## Enhancements

An **enhancement** (`baseModelId` = the model it extends) overrides texts of a model without editing it, for example to adapt a shipped model.
- Give its texts the **same `name`** as the base model's texts; bindings keep using the **base** model's name.
- Only `active: true` enhancements apply (default `false` when left out; locales default to EN only).
- An enhancement text replaces the base text in **every** language: its own translation, else its `fallbackLocale` translation, else its `text`. Copy the base translations you want to keep.
- The base model cannot be deleted while it has enhancements (`… has enhancements (<names>). Delete the enhancements first.`). An enhancement of a global model needs a name no other global model has (`A global model with this name already exists.`); for an app model's enhancement: `The enhancement cannot be named the same as the base model`, `An enhancement with this name already exists.`

## Recipes

**Translate tiles and tile groups**: `save_i18n_model({ "i18n": { "name": "sales_texts", "locales": [ {EN}, {DE} ], "attributes": [ { "name": "orders", "text": "Orders", "de": { "text": "Aufträge" } }, … ] } })` → set the titles to `{i18n.sales_texts>orders}` (`manage-tiles`, `manage-tile-groups`) → `get_i18n_model` → `whereUsed` lists them.

**Add a language to a model**: `get_i18n_model` → add the locale to `locales` → send **all** attributes with the new translation key (`"pt": { "text": "…" }`) — the existing translations stay.

**Before deleting**: `get_i18n_model` → `whereUsed` and `enhancedBy` empty; otherwise move the artifacts to other texts and delete the enhancements first.

## Related skills

- **`manage-tiles`**, **`manage-tile-groups`**, **`manage-launchpads`**, **`manage-adaptive`**, **`manage-pdf`**, **`manage-apps`**: where the bindings go.
