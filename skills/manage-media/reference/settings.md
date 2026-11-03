# Media Library — every Cockpit control and its MCP equivalent

The Cockpit **Media Library** (Development → Media Library) and the media picker other editors open (Launchpad Designer,
Tiles, App Designer, PDF Designer). "—" = no MCP equivalent: do it in the Cockpit or tell the user it is not possible.

## Header

| Cockpit control | What it does | MCP |
|---|---|---|
| Upload Files (also drag and drop onto the file list) | Uploads files into the selected folder | `upload_media_file`, one file per call (upload-files) |
| Import Zip | Unpacks a zip into the selected folder, keeping its subfolders | `upload_media_zip` (upload-files) |
| Export Zip | Downloads the selected folder (or everything) as a zip; needs a signed-in session | — |

## Folder tree

| Cockpit control | What it does | MCP |
|---|---|---|
| Folder list with search | Browse folders; filter by name | `list_media_folder_content` level by level; `search_media` for names |
| Add folder (Name, up to 50 characters, unique in its parent) | Creates a folder that exists only on screen until a file is uploaded into it | — (upload a file into `<new folder>/` instead; the folder appears with it) |
| Edit folder → Name | Renames the folder | — |
| Edit folder → Package | Assigns a **top-level** folder (and everything below it) to a development package; offered only when media are stored in the database or Azure | — |
| Delete folder | Deletes the folder, its subfolders and files after a confirmation | `delete_media_folder` (no confirmation; Paths rules first) |
| Collapse / expand | View only | — |

## File list

| Cockpit column / control | MCP |
|---|---|
| Thumbnail (click opens the file) | `get_media_file` → `url` |
| Link (copies `<browser origin>/media/root/<path>`) | `get_media_file` → `url` (built from the server's configured address) |
| Name, Path (shown while searching) | `list_media_folder_content` (names), `search_media` (paths) |
| Created On, Created By, the All / Mine filter | — (`get_media_file` gives `updatedAt`, the time of the last upload) |
| Size | `get_media_file` → `size` (bytes) |
| Metric (image width × height, measured in the browser) | — |
| Search in media library (name, path, metric, creator), "Exclude subfolders from search" | `search_media` matches names only and always includes subfolders; for one folder without subfolders use `list_media_folder_content` |
| Delete (row) | `delete_media_file` |
| Update | Re-run the listing |
| Protected (column hidden in the Cockpit; with database storage a protected file needs a signed-in session) | — (files uploaded over MCP are public; no tool can protect one) |

## Media picker (from other editors)

| Picker behavior | What it means for MCP writes |
|---|---|
| Writes the root-relative link `/media/root/<path>` (spaces encoded) into the field | Write the same form into `save_launchpad` / `save_tile` / `save_tile_group` / `save_app` fields |
| Refuses files over 150 KB for tile `image` / `imageDark` and the Launchpad Designer tile image, over 100 KB for tile `cardImage` / `cardImageDark` and the Designer tile icon image, over 500 KB for tile group images | MCP fields take any URL — keep images within those sizes |
| Can filter by file type for a field | Use a type the field can show (images for image fields) |
| Clear | Send `""` (or the field's documented "none" value) in the owning tool |
