---
name: upload-files
description: Upload files into Neptune DXP over MCP without passing their bytes through the conversation — images, logos, icons, backgrounds, CSS and JS into the Media Library, zips unpacked into the Media Library, a built web app bundle, and font files — with `upload_media_file`, `upload_media_zip`, `upload_webapp_zip`, `upload_font_file`. Covers both delivery paths (a public `sourceUrl` the server downloads, or the returned `curl` command for a local file), the size limit, blocked and redirecting URLs, token expiry, and headless verification. Use when the user wants to upload, import or deploy a file, a logo or background for a launchpad or tile, an asset referenced from CSS, a zip of assets, a built React/Vue/Vite app, or a woff2/ttf/otf font. Trigger phrases include "upload this file", "upload the logo", "import the zip", "deploy the dist folder", "add a font file", "put this image in the media library", "upload from URL". Read this BEFORE any upload tool call — never read, paste or base64 the file yourself.
---

# Uploading files to Neptune DXP via MCP

Four tools move file bytes into the platform. None of them takes the file content as an argument: the server either **downloads it from a `sourceUrl`**, or the tool returns a **`curl` command** that sends a local file straight to the server. Never read the file into the conversation and never base64 it.

## Destinations — which tool for what

| Tool | Destination | Use it for |
|---|---|---|
| `upload_media_file({ path, filename, sourceUrl? })` | One file into a Media Library folder; missing folders are created (verified), see the first-folder rule below. | Anything a page links to: Launchpad Designer logos and backgrounds, tile images, icons, favicons, CSS and JS files, PDFs, videos. Reference it as `/media/root/<path>/<filename>` (manage-media). |
| `upload_media_zip({ path, sourceUrl? })` | Unpacks a zip into a Media Library folder, keeping the zip's subfolders (verified). | A set of assets in one go: an icon set, a stylesheet with its images, a JS library. |
| `upload_webapp_zip({ id, sourceUrl? })` | **Replaces every file** of an existing web app (verified). | Deploying a built single-page app (`dist/` of Vite, React, Vue). |
| `upload_font_file({ id, filename, sourceUrl? })` | Adds one file to an existing font (verified). | `.woff2` for UI5 themes and web pages, `.ttf` / `.otf` for PDFs (manage-fonts). |

There is no upload destination for launchpads, tiles or UI5 themes themselves: their images, icons and CSS assets go into the Media Library and are referenced by URL; their fonts go into a font.

`path` is a Media Library folder such as `acme_brand/logos` — leading and trailing slashes are ignored (verified), `""` is the root. **Start `path` at a top-level folder that exists, or at a name used nowhere in the library** — the first folder is matched by name at any depth; the rule and its checks are in manage-media → Paths. `id` is the web app id (`list_webapps`) or the font id (`list_fonts`); create the web app or font first, the upload never creates one. `filename` is the stored name and decides the served `Content-Type` (verified).

## Delivering the bytes

| The file is… | Do this |
|---|---|
| At a public URL | Pass it as `sourceUrl`. The server downloads and stores it; the tool returns the result directly. |
| On the machine where you have a shell | Omit `sourceUrl`, then run the returned `curl` command with the local path. |
| Neither (no shell, no URL) | Ask the user for a public URL, or to upload in the Cockpit (Media Library → Upload, Fonts → Files → Add, Web App Manager → Import). |

### `sourceUrl` rules (all verified)

- `http` or `https`, and the host must resolve to a public address: private, loopback, link-local and cloud-metadata addresses are refused, and so are `ftp:` and `file:`.
- **No redirects** — give the final URL (if you can fetch URLs, a `Location` header in the response shows the redirect). A URL that redirects fails with `… fetch failed`.
- It must answer a 2xx status (verified with `201`) with a non-empty body no larger than the instance's upload limit (100 MiB by default; the error names the limit in bytes).
- No headers, cookies or credentials can be sent; `https://user:pass@…` fails with `… Request cannot be constructed from a URL that includes credentials` (verified). A URL that needs a login is not usable — use the `curl` path. A pre-signed download URL (token in the query string) needs no header and can be used.
- **The content is not checked.** Whatever the URL returns is stored under `filename`; an HTML page from a wrong URL becomes your "image". Use direct file URLs, never a page or a CSS URL that merely mentions the file.
- The instance's own public URLs (`/media/root/…`, `/public/fonts/…`) work as a source when its host name resolves to a public address (verified) — handy to copy a file to another destination. A host that resolves to a private address is refused like any other.

### The `curl` path

Without `sourceUrl` the tool returns `{ "curl": "curl -sS -X PUT -H 'x-planet9-mcp-upload: <token>' -H 'Content-Type: application/octet-stream' --data-binary @<LOCAL_FILE_PATH> 'https://<host>/mcp/upload'" }` (verified).

- Replace `<LOCAL_FILE_PATH>` with the file's path (keep the `@`) and run it at once: the token is checked when the whole file has arrived, so the upload must also **finish** within **5 minutes** of the tool call — otherwise `Invalid or expired upload token`; call the tool again for a fresh command.
- The command targets the address the instance is configured with. If that is not the address you reach it at (an internal IP or port), replace `https://<host>` with yours — the token does not depend on the host.
- The token is tied to your user and to exactly this destination (tool, id or path, filename). It is **not single-use**: every run within the 5 minutes uploads again (verified) — for a font that adds a second file with the same name. Run it once.
- Success prints `{"status":"OK","destination":"media-file","bytes":2335}` (destination `media-file`, `media-zip`, `webapp-zip` or `font`); compare `bytes` with the local file size. Failures print `{"error":"…"}` — curl still exits `0`, so read the body (append `-w '\nHTTP %{http_code}'` to see the status, table below).
- The command is issued without checking the target: a wrong web app or font id is only reported when you run it (`WebApp not found`, `Font not found`, verified).

## What each destination does with the file

**Media file** — stored as `<path>/<filename>`; an existing file of that name is replaced (verified). Follow the naming rules in manage-media (letters, digits, `-`, `_`, `.`; no `/`, `#`, `..`; never empty; folder names at most 64 characters).

**Media zip** — every entry lands at `<path>/<entry path>`; files of the same name are replaced, other files in the folder stay.
- **Build the zip without directory entries or system files** (`zip -r -D -X bundle.zip . -x '.*' -x '__MACOSX/*'`, not the macOS Finder's Compress): every entry is stored — a directory entry becomes a nameless file in that folder (verified), `__MACOSX/` and `.DS_Store` become real files. The same applies to web app zips.
- An empty zip returns `OK` and creates nothing (verified) — list the folder afterwards.

**Web app zip** — the web app must exist (`save_webapp`, manage-webapps).
- The zip needs the main file (`settings.mainFilePath`, `index.html` unless changed) **at its root**: zip the *contents* of `dist/`, not the folder — `dist/index.html` fails `Missing index.html file in zip` (verified).
- On success **all previous files are removed**, every zip file is stored as `/<zip path>` and the main file also becomes the entry page (verified). A rejected zip leaves the app unchanged (verified).
- Build with absolute asset URLs for `/webapp/<name>/` (Vite: `base: '/webapp/<name>/'`); files are served at `/webapp/<name>/<zip path>`.

**Font file** — added to the font's file list, never replacing a file (verified).
- Any file is accepted (a `.png` was, verified), but UI5 themes use only `.woff2` files and PDFs only `.ttf` / `.otf` — upload nothing else.
- Name font files with letters, digits, `-`, `_` and `.` only: a `/` makes the file unreachable at `/public/fonts/<font>/<file>`, and a `'` breaks the theme stylesheet that quotes the name.
- The upload does not assign the file to a style: set `config` with `save_font` afterwards (manage-fonts).

## Verify

Check every upload without a browser. The **Stored** column needs only MCP tools; run the **Served** column when you can fetch URLs (a shell with `curl`, or a fetch tool):

| Destination | Stored | Served (no login needed unless noted) |
|---|---|---|
| Media file / zip | `list_media_folder_content` of the exact folder shows each name; `get_media_file({ path })` → `size` equals the uploaded `bytes`, `contentType` matches the extension. | `curl -s -o /dev/null -w '%{http_code} %{content_type} %{size_download}' 'https://<host>/media/root/<encoded path>'` → `200`, same type and size. |
| Web app zip | `get_webapp({ id })` → `runtime.page` starts with your entry HTML (stamp a build marker), `runtime.assets` lists every path with fresh timestamps (the web app's own `updatedAt` does not change). | Same `curl` on `/webapp/<name>` (`text/html`) and on each asset (`text/css`, `application/javascript`, …). A missing asset returns the entry page with `200` and `text/html` — check the type, not just the status. Private apps need a session. |
| Font file | `get_font({ id })` → the file is listed once with the expected `mimetype`. | `curl … 'https://<host>/public/fonts/<font name>/<filename>'` → `200`, `font/woff2` (or `font/ttf`), size as uploaded. |

Only how an image or font looks needs a browser — open the page if one is available, one screenshot, move on.

## Errors

| Signal | Meaning / fix |
|---|---|
| `Could not download <url> (redirects not allowed, use the final URL): Invalid URL: <url>` | Not a URL. |
| `… Blocked URL scheme: ftp:` (or `file:`) | Only `http` / `https`. |
| `… Blocked address: 10.0.0.1` / `… Host localhost resolves to blocked address ::1` | Private or local host. Use the `curl` path for files that are only reachable internally. |
| `… Could not resolve host: <host>` | Host does not exist (typo). |
| `… Request cannot be constructed from a URL that includes credentials: <url>` | `user:pass@` in the URL. Use a pre-signed URL or the `curl` path. |
| `… fetch failed` | The URL redirects (verified), or the connection failed (TLS error, refused, cut off). Use the final URL and check the host. |
| `Download failed with HTTP <status>` | The URL answered a non-2xx status (404 wrong URL, 401/403 needs a login). |
| `File exceeds <limit> bytes` | Larger than the instance's upload limit (`104857600` = 100 MiB by default). |
| `Uploaded file is empty` | Zero bytes (curl: HTTP 400). |
| `request entity too large` (HTTP 413) | curl path: the file is larger than the upload limit. Nothing stored. |
| `Invalid or expired upload token` (HTTP 401) | Token missing, altered, or the upload finished more than 5 minutes after the tool call. Call the tool again. |
| `Font not found` (HTTP 404) / `WebApp not found` (HTTP 400) | Wrong or deleted `id`. |
| `Missing index.html file in zip` (HTTP 400; the name is the web app's main file) | No main file at the zip root (or the zip is empty). Nothing changed. |
| `Error importing zip file` / `Error importing media zip file` (HTTP 500) | The upload is not a valid zip. Nothing changed. |
| `Error saving files` | Media: a folder name longer than 64 characters (verified), a file name longer than 256, or the file could not be stored. |
| `Upload into a media folder that belongs to a package.` (HTTP 400) | The instance requires a package and the target folder has none (manage-media → Packages and access). |
| `Package is a required field` / `No edit access to artifact` | Font or web app upload: the target has no package where one is required, or its package is restricted for you. |
| `No access to upload <destination>` | The tool refused before issuing a command or downloading: missing edit permission for that destination (Permissions). |
| `You have no access to the requested resource` (HTTP 403) | curl path: the permission was missing when the command ran. |
| `You do not have edit access to the development package of this media folder.` (HTTP 403) | Media: the target folder's package is restricted. |
| `<name> is locked by <user>` | Someone holds the font or web app in edit mode in the Cockpit. |
| `MCP error -32602: … Invalid uuid at id` | `id` is not a UUID. |

## What MCP can NOT do

- Accept file content as an argument, follow redirects, or send headers or credentials with a `sourceUrl`.
- Upload a folder — zip it — or more than one file per `upload_media_file` call.
- Upload a zip of font files — one `upload_font_file` call per file.
- Change, add or remove a single file of a web app: `upload_webapp_zip` and `save_webapp`'s `assets` both replace the whole file set (verified) — send every file each time (manage-webapps).
- Create the web app or font an upload targets, or set a font's style slots.
- Make an uploaded media file require login — every uploaded file is public (manage-media).
- Choose between folders of the same name: the first folder of `path` is matched by name at any depth (see `path` above).
- Revoke an issued `curl` command before its 5 minutes are over.
- Upload files larger than the instance's upload limit.

## Permissions

Edit access is checked per destination when the command or download starts: Media Library edit (`media`) for media files and zips, Web App Manager edit (`webapp`) for web app zips, Fonts edit (`fonts`) for font files. Display-only access is not enough. Package rules of the target (the web app's or font's package, the media folder's package) apply as for any save.

## Related skills

- **manage-media** — paths, naming rules, `/media/root/` URLs, listing, deleting.
- **manage-fonts** — creating the font, style slots (`config`), the served font URLs.
- **manage-webapps** — creating the web app and how its files are served.
- **manage-launchpads**, **manage-tiles**, **manage-tile-groups**, **manage-theme-generator** — where uploaded images, CSS and fonts are referenced; **design-to-launchpad** — uploads as one step of rebuilding a design as a launchpad.
