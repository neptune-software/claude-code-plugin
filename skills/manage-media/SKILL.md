---
name: manage-media
description: Browse, search, inspect, link to, or delete files and folders in the Neptune DXP Media Library via the MCP tools `list_media_folder_content`, `search_media`, `get_media_file`, `delete_media_file`, `delete_media_folder` (adding files is `upload_media_file` / `upload_media_zip`, see upload-files). Use when the user wants to find an image, logo, icon, background, stylesheet or script in the Media Library, get the URL to put into a launchpad, tile, theme, app or web app, check that a file is there and served, organize uploads into folders, or remove files or folders. Trigger phrases include "media library", "list the media folder", "find the logo", "search media", "get the image URL", "link to the media file", "background image URL", "delete the media file", "delete the media folder", "where is this image stored". Read this BEFORE building a /media/root URL, uploading or deleting — a path whose first folder is not a top-level folder resolves to a same-named folder elsewhere, and deletes follow it.
---

# Managing the Neptune DXP Media Library via MCP

The **Media Library** (Cockpit: Development → Media Library) is a folder tree of files — images, icons, stylesheets, scripts, documents — that the platform serves at **`/media/root/<path>`**. A file has no id: its **path** (`folder/sub/file.ext`) is its identity in every tool and in its URL. Over MCP you can list, search, read file info and delete; uploads are `upload_media_file` / `upload_media_zip` (**upload-files**).

## What the user asks → what to do

| Ask | Do |
|---|---|
| "Put our logo / background on the launchpad" | Upload (Paths rules) → `/media/root/<path>` into the Launchpad Designer keys of **both** appearances (manage-launchpads) |
| "A logo for dark mode" / "white logo on the dark header" | Light and dark images |
| "Where is image X?" / "find the logo" | `search_media` |
| "Give me the link" | `get_media_file` → `/media/root/<path>` (The file URL) |
| "Upload this folder / zip" | `upload_media_zip` (upload-files) |
| "Rename a folder", "assign the folder to a package", "download as zip" | Cockpit Media Library only |
| "Move or copy a file or folder" | Not possible anywhere, the Cockpit included: upload again at the new path, update the references, then delete the old one |
| "Only signed-in users may open this file" | Files uploaded over MCP are public, and no tool can protect one — keep confidential files out |
| "Delete it" | Workflows → Delete a file / Delete a folder |

Every Cockpit Media Library control with its MCP equivalent: `reference/settings.md`.

## Tools

| Tool | Behavior |
|---|---|
| `list_media_folder_content({ path? })` | Direct children of one folder: `[{ "name", "type": "Folder" \| "File" }]`, folders first. Omit `path` for the root. A trailing slash is optional. A leading slash or a folder that does not exist returns `[]` — no error (verified). |
| `search_media({ search, path?, limit? })` | Case-insensitive substring match on the **names** of files and folders (not on content) → `[{ "name", "type", "path" }]`; folder paths end with `/` (verified). Exact name first, then names that start or end with the term, then the rest. `limit` defaults to 20 and is capped at 50 (verified default); `path` limits the search to a folder (no leading slash). |
| `get_media_file({ path })` | `{ "size", "contentType", "updatedAt", "url" }` for one file (verified). Never returns the content. A path that does not start at a top-level folder can return a file from elsewhere, and the `url` then echoes your path (verified) — see Paths. |
| `delete_media_file({ path })` | Permanent. Returns `Media File '<path>' deleted` — **also when there is no such file** in an existing folder (verified). |
| `delete_media_folder({ path })` | Permanent: the folder, every subfolder and every file in them, without confirmation. Returns `Media Folder '<folder>/' deleted`; a trailing slash is added if you leave it out (verified). |

## Paths

- **Start every path at a top-level folder that exists — or, for an upload into a new folder, at a name used nowhere in the library.** `get_media_file`, `delete_media_file`, `delete_media_folder` and the uploads match the *first* folder by name at any depth: without a top-level `images` folder, `images/logo.png` resolves to some `<x>/images/logo.png`, and `delete_media_folder({ "path": "images/" })` deletes `<x>/images/` with everything in it (verified). `list_media_folder_content` and `search_media` do not do this — they return `[]` — so an empty listing does not mean a delete is harmless. Before deleting, confirm the first folder is in `list_media_folder_content({})`; before uploading, confirm the same, or that `search_media({ "search": "<first folder>" })` shows no folder of that name anywhere — the upload then creates it at the top level.
- Use **top-level folder and file names that are unique in the library** — a project prefix such as `acme_brand/acme_logo.png`, never a common name like `images`, `brand` or `logos`. A `/media/root/` URL whose folders do not match is answered with a file of the same name from another folder (verified) — a wrong link then shows someone else's file instead of failing.
- Write paths without a leading slash and with the exact case: `acme_brand/logo.png`, not `/acme_brand/logo.png` or `Acme_Brand/Logo.png`. Listing compares case exactly; `get_media_file` with a different case fails with `No media file at the given path` on some instances (verified) and matches on others — never rely on either.
- Folders exist because files were uploaded into them (upload-files). There is no tool to create an empty folder, rename or move anything.
- **Name files and folders with letters, digits, `-`, `_` and `.` only — folder names at most 64 characters, file names at most 256, never empty.** Other names are accepted and break (verified): a `/` in a file name gives an entry `get_media_file` cannot find; `..` becomes a literal folder named `..`; an empty file name is stored as a nameless file; `#` breaks the URL (`get_media_file` returns it unencoded).

## The file URL

`get_media_file` returns `url` = `<instance base address>/media/root/<path>` (verified), e.g. `https://<host>/media/root/acme_brand/logo.png`.

- **Inside the platform reference files root-relative: `/media/root/<path>`** — in the Launchpad Designer settings (logo, favicon and background images, `CUSTOM_CSS`: `background: url(/media/root/acme_brand/bg.jpg)`), tile and tile group images, UI5 Theme Generator custom CSS, App Designer image controls and web app pages. That survives host names and transports. Use the absolute `url` only for links outside the platform, and check its host is the address users reach (it comes from the server's configured address).
- Encode each path segment (`%20` for a space, `%23` for `#`); the returned `url` encodes spaces but not `#` (verified).
- **Never add a query string**: `…/example.png?v=2` returns 404 (verified). No `max-age` is sent, so after a replace browsers may show the old copy until they revalidate (verified) — to make a change show at once, upload under a new name and update the references.
- Files uploaded over MCP are served **without login** to anyone who knows the URL (verified), and no tool can protect one. Do not put confidential files in the Media Library. They are served from the platform's own address, so upload HTML and SVG files only from trusted sources.
- A file is served with the type of the extension it was uploaded with (upload-files).
- Keep images within the Cockpit pickers' limits — tile `image` / `imageDark` 150 KB, tile `cardImage` / `cardImageDark` 100 KB, tile group images 500 KB: the pickers refuse bigger files, while the MCP fields take any URL.

## Light and dark images

- **A launchpad has one image set per appearance**: the Launchpad Designer keys under `config.designer.light` and `config.designer.dark` — logo `TOP_LOGO` / `TOP_LOGO_MOBILE`, `FAVICON`, background `PAGE_BACK_IMAGE`, login background `BACK_LOGON_IMG`, header and tile images in the tile and tile-group layouts (manage-launchpads). Tiles have `image` / `imageDark` and `cardImage` / `cardImageDark` (manage-tiles). Each appearance shows its own: the launchpad page carried `logo-on-light.svg` in its light layout and `logo-on-dark.svg` in its dark layout (verified).
- **Choose by the background the image sits on in that appearance, not by the appearance's name.** The header behind a logo is the Designer `TOP_BACK_COLOR` if set, otherwise the theme's shell header color: a Light theme with a dark brand header needs the light-ink logo in the light appearance too.
- **Upload both variants next to each other, named for their background**: `acme_brand/logo-on-light.svg` (dark ink) and `acme_brand/logo-on-dark.svg` (light ink); likewise `bg-light.jpg` / `bg-dark.jpg`.
- Only one logo available: put it in each appearance whose header it contrasts with, and for the other either ask the user for a variant or give that appearance a header color the logo reads on.
- An appearance you leave empty does not inherit the other one: an unset dark `TOP_LOGO` falls back to the launchpad's fallback logo, then Neptune's (manage-launchpads); an unset `imageDark` / `cardImageDark` reuses the light tile image (manage-tiles).
- Verify: `get_launchpad` → the key in both buckets; each `/media/root/…` URL answers `200` with an image type (if your client can fetch URLs; the sign-in page `GET /launchpad/<name>` also lists each appearance's `TOP_LOGO`).

## Workflows

**Find a file and its URL**: `search_media({ "search": "<name part>" })` → pick the `path` → `get_media_file({ "path": … })` → use `/media/root/<path>` (encoded).

**Upload, then reference it**: confirm the top-level folder (Paths) → `upload_media_file` (upload-files) → `list_media_folder_content` of the exact folder shows the name → put `/media/root/<path>` into the launchpad, tile, theme or app.

**Browse**: `list_media_folder_content({})` → `list_media_folder_content({ "path": "<folder>" })` level by level; the response has names only — build each child's path as `<folder>/<name>`.

**Delete a file**: `list_media_folder_content` of its folder lists the name and `get_media_file` succeeds → `delete_media_file` → `get_media_file` must now fail `No media file at the given path`. Check where it is linked first (Launchpad Designer images and `CUSTOM_CSS`, tiles, tile groups, apps): nothing warns you that a file is still referenced.

**Delete a folder**: the parent's listing (`list_media_folder_content({})` for a top-level folder) must show it — if it does not, stop: the delete would remove a same-named folder elsewhere (verified). List the folder and its subfolders, confirm with the user → `delete_media_folder({ "path": "<full folder path>/" })` → the parent listing no longer shows it. Never pass an empty path or `/`.

## Verify

The MCP re-reads come first; the URL checks need a shell with `curl` or a fetch tool.

- **Placed**: `list_media_folder_content` of the exact parent path lists the name (a listing is never redirected elsewhere).
- **Stored**: `get_media_file({ "path": "<full path>" })` → `size` equals the upload's `bytes`, `contentType` matches the extension (verified).
- **Deleted**: the parent listing no longer shows it; `get_media_file` → `No media file at the given path` (verified).
- **Served** (if you can fetch URLs): `curl -s -o /dev/null -w '%{http_code} %{content_type} %{size_download}' 'https://<host>/media/root/<encoded path>'` → `200`, same type and size, no session needed; a deleted file → `404` (verified).
- Only how an image looks needs a browser — open the page if one is available, one screenshot, move on.

## Packages and access

- A top-level folder can belong to a development package for deployment (only when media are stored in the database or Azure); subfolders and files go with it. **MCP cannot assign or change a folder's package** (Cockpit: Media Library → edit folder → package).
- If the instance requires a package for every artifact, uploads work only into folders that already belong to one (upload-files) — have the folder assigned in the Cockpit first.
- A folder whose package is restricted to roles is hidden from users without one of those roles; `get_media_file` there fails with `You have no access to the requested resource`, uploads and deletes with `You do not have edit access to the development package of this media folder.`

## Errors

| Signal | Meaning / fix |
|---|---|
| `No media file at the given path` | `get_media_file`: the folders exist, the file does not (check case and extension). |
| `Unable to find requested file` | `get_media_file`: a folder in the path does not exist, or the file name contains `/`. |
| `Missing parameter path` / `Missing parameter term` | Empty `path` / empty `search`. |
| `MCP error -32602: … Number must be greater than 0 at limit` | `limit` 0 or negative. |
| `Error deleting media file` | `delete_media_file`: a folder in the path does not exist. |
| `Error in media folder delete` | `delete_media_folder`: the folder does not exist. |
| `You have no access to the requested resource` | `get_media_file` in a folder whose package your roles may not read. |
| `You do not have edit access to the development package of this media folder.` | Delete in a folder whose package your roles may not edit. |
| Upload errors (`Error saving files`, `Upload into a media folder that belongs to a package.`, …) | See upload-files. |
| `Access denied: no permission for media` | No Media Library permission. |

## What MCP can NOT do

- Create an empty folder (not even the Cockpit keeps one: a folder exists once a file is in it). Rename a folder (Cockpit only). Move or copy files and folders — not possible anywhere: upload again, then delete.
- Assign a folder to a development package.
- Return a file's content — open its URL instead.
- List the whole tree in one call — walk it with `list_media_folder_content`, or use `search_media`.
- Tell a real path from a resolved one: the first folder of a path is matched by name at any depth by `get_media_file`, the deletes and the uploads — check the folder in a listing first.
- Export the library or a folder as a zip (Cockpit: Media Library → Export Zip; the download needs a signed-in session).
- Tell which launchpads, tiles or apps use a file.
- Protect a file: files uploaded over MCP are public, and no tool can protect one.
- Report an image's pixel size or who uploaded it (`get_media_file` gives size in bytes, type, date and URL).

## Permissions

Media Library permission (`media`; Development → Media Library): `list_media_folder_content`, `search_media` and `get_media_file` need any access; `delete_media_file` and `delete_media_folder` need edit access (`Del`); uploads: see upload-files. Package roles on a folder narrow this further.

## Related skills

- **upload-files** — `upload_media_file` and `upload_media_zip`: `sourceUrl` or the returned `curl` command, size limit, upload errors.
- **manage-launchpads** — Launchpad Designer images (logo, favicon, background) and `CUSTOM_CSS` that reference `/media/root/…`.
- **manage-tiles** / **manage-tile-groups** — tile images and backgrounds from the Media Library.
- **manage-theme-generator** — custom CSS of a UI5 theme that references media files.
- **manage-webapps** — web app pages that load media files.
- **manage-fonts** — font files, served at `/public/fonts/…`, not from the Media Library.
- **design-to-launchpad** — the media folder as one step of rebuilding a design or website as a launchpad.
- **dxp-overview** — packages and the artifact model.
