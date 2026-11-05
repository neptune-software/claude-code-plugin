# Launchpad settings — full field reference (`save_launchpad`)

Every Cockpit Launchpad input, by tab, with its payload key. Top-level keys go directly on `launchpad`; `config.<key>`
keys go inside `config`, which is **replaced as a whole** — read it with `get_launchpad`, change the copy, send it
complete. Fields not listed under a tab here are in SKILL.md (`name`, `title`, `package`, `cat`, `header`,
`customTheme`, `layout_light`/`layout_dark`, `config.designer`).

The server validates types only. The Cockpit runs extra rules the server does not repeat — apply them yourself
(last section).

## Settings tab

| Cockpit label | Key | Values / effect |
|---|---|---|
| Description | `description` | Also the PWA manifest description. |
| Custom Logo (Deprecated) | `customLogo` | Fallback header logo when the Designer has no `TOP_LOGO`; also the PWA icon when no PWA icon is set. Prefer `TOP_LOGO`. |
| UI5 → Version | `ui5Version` | `""` = the recommended UI5 (default). A version the instance ships (`get_system_info` lists them), `customCDN` (then `ui5Url` = URL of `sap-ui-core.js`), or `latestCDN` (stored as `customCDN` with a concrete `ui5Url`). |
| UI5 → UI5 Path | `ui5Url` | Only used with `customCDN`. |
| SAP UI5 Module Path (deprecated) | `config.ui5ModulePath` | `resources` path for SAP UI5 libraries of SAP tiles. Leave empty. |
| Cookies → Show Cookies Dialog / Title / Message | `config.cookieDialogEnabled` / `config.cookieDialogTitle` / `config.cookieDialogMessage` | Dialog at start; it opens only when a title or message is set. |
| Blackout → Enable Blackout / Title / Message | `config.blackoutEnabled` / `config.blackoutTitle` / `config.blackoutMessage` | Maintenance block: the launchpad shows the message instead of its tiles or start app. Switch off with `blackoutEnabled: false`. |
| Single App Launchpad → Start Application / Start Web Application | `startApp` / `startWebApp` | Name of an App Designer app (type Application) or web app shown as the only content; tiles and menu are hidden. Not checked — confirm with `list_apps` / `list_webapps`. |
| Launchpad Footer | `launchpadFooter` | Name of an App Designer app loaded into the footer (an `sap.m.HBox` of buttons). Not checked. |

## Customization tab — header, menu, behaviour

| Cockpit label | Key | Values / effect |
|---|---|---|
| Show Focus Indicator | `config.showAccessibilityFocusIndicator` | Default `true`; `false` hides the keyboard focus outline. |
| Disable Splitview | `config.disableSplitview` | Hides Split View in the user menu. |
| Disable Context Menu (Right Click & Long Press) | `config.disableContextMenu` | No tile context menu. |
| Disable Customizations | `config.disableCustomizations` | Users cannot personalise the launchpad. (Personalisation is off anyway for anonymous users, on public launchpads and with the header hidden.) |
| Configure customizations for each individual device … | `config.enableDeviceBasedCustomizations` | Personalisation kept per device type. |
| Disable Redirect to Home | `config.disableRedirectToHome` | An unknown URL hash is left alone instead of returning to the home screen (for apps with their own hash routing). |
| Client Request Timeout (in seconds) | `clientRequestTimeout` | Request timeout in seconds (default 120). Under 5, or 0, = no client timeout; an empty value is not served. The Cockpit resets values under 5 to 120. |
| Enable Launchpad and Tile Trace | `enableTrace` | Records launchpad loads and tile clicks for the Cockpit trace view. |
| Enable Push Notifications / Project ID / App ID | `enableNotifications` / `firebaseProjectId` / `firebaseAppId` | Adds Firebase messaging with the instance's Firebase settings (the ids override project/app). |
| Hide Launchpad Header | `config.hideTopHeader` | No header bar. The Cockpit then also sets `hideBackButton: true`, `hideSearch: true` and `showLaunchpadTitle`, `showAppTitle`, `enableTopMenu`, `oneLineTopMenu`, `noSubmenuHover`, `activeAppsTop` to `false` — send those too. |
| Hide the Launchpad Header Back Button | `config.hideBackButton` | |
| Hide Username | `config.hideUsername` | The header shows the user's `name`, else the user name; this hides it. |
| Show Launchpad Title in Launchpad Header | `config.showLaunchpadTitle` | `title` next to the logo. Ignored with `oneLineTopMenu`. |
| Show Active App Title in Launchpad Header | `config.showAppTitle` | Desktop/tablet; phones use `config.showAppTitleMobile` (no Cockpit input). |
| Hide Launchpad Search | `config.hideSearch` | Also disables the search keyboard shortcut. |
| Show Main Menu in Header Toolbar | `config.enableTopMenu` | Tile groups as header items (default `true`). Turn `verticalMenu` off with it. |
| One-Line Top Menu | `config.oneLineTopMenu` | Menu in the same line as the header buttons (needs `enableTopMenu` for the inline menu). Hides the launchpad title, the user name, header active apps and the active app title even without `enableTopMenu`. |
| Do Not Display Submenus on Hover | `config.noSubmenuHover` | Submenus open on click (default `true`). |
| Pin Main Menu to Left Side Bar | `config.verticalMenu` | Menu as a left side bar on desktop. Turn `enableTopMenu` off with it. |
| Pin Active Apps to Left Side Navigation | `config.activeAppsSide` | Open apps in a left bar (phones: `config.activeAppsSideMobile`, no Cockpit input). Use either this or `activeAppsTop`. |
| Show Active Apps in Header Toolbar | `config.activeAppsTop` | Open apps in the header. Ignored with `oneLineTopMenu`. `config.activeAppsTopMobile` is stored but nothing reads it. |
| Disable Loading of Highcharts | `config.disableHighCharts` | The page leaves out the Highcharts scripts (faster start; only if no tile or app uses Highcharts). |

## Agent tab

| Cockpit label | Key | Values / effect |
|---|---|---|
| AI Agent | `agentId` | AI agent id (`list_ai_agents`). Adds the agent chat to the launchpad. `null` removes it. |
| Agent icon / Agent text | `config.agentIconSrc` / `config.agentText` | Chat button icon (default `sap-icon://nep/neptune-connect`) and name (default `My Agent`). |
| Chatbox position | `config.chatboxPosition` | `fullscreen` (default; every other value counts as fullscreen) or `sidepanel`. |
| Load Agent at Launchpad Start | `config.loadAgentOnStart` | Opens the fullscreen chat at start; does nothing with `sidepanel`. |
| Start Parameters | `config.agentParams` | JSON text handed to the agent at start (default `{}`). |
| Enable Agentic Apps / Agentic Apps Agent | `enableIntelligentApps` / `iaAgentId` | Lets an agent work inside the launchpad's apps. Pick an agent with Agentic Apps enabled (`list_ai_agents` `where: { enableIntelligentApps: true }`) — the server accepts any agent id, but only such an agent works. |
| Enable WebMCP (Beta) | `iaSettings: { webMCP: true }` | Only together with Agentic Apps. |

## Authentication tab — login page and self-registration

| Cockpit label | Key | Values / effect |
|---|---|---|
| Default Provider | `defaultLoginIDP` | Login provider id. Works only for a provider that is `active`, has `show: true` and is not `jwt-validation`. A local, LDAP or SAP provider is preselected; an external one (Azure AD, SAML, OpenID Connect, OAuth2) with `config.hideLoginSelection: true` leaves only its button — no user/password form. An unusable id is ignored. Ids: `get_system_settings` → `idp[]` (`id`, `name`, `type`, `active`, `show`; needs System Settings access), else `logonTypes` of `https://<host>/user/logon/types` if the client can fetch URLs, else ask. |
| Custom Login Title / Subtitle | `config.loginTitle` / `config.loginSubTitle` | Login page texts; `{i18n.<model>>key}` bindings are resolved. |
| Custom Login App | `loginApp` | App Designer app shown instead of the standard login page. **A name that is not an app makes the login page answer 404** — check with `get_app`/`list_apps` first. |
| Password Reset Email | `passwordResetEmail` | Email template id (`list_email_templates`) for this launchpad's forgot-password mail. |
| Hide Login Selection | `config.hideLoginSelection` | Hides the provider dropdown. |
| Hide Local Login Selection | `config.hideLoginLocal` | Removes the user/password option (it stays if no other provider exists). |
| Enable Anonymous Access to Launchpad | `publicAccess` | See SKILL.md. |
| Allow Self-Registration of Users | `isExternal` | Register link on the login page (local/SAP login). A registrant gets an activation link by e-mail; the user — with `extUserRoles` and `extUserDepartments` — is created only after setting a password. Needs working e-mail; each user counts against the licence user limit. |
| Email pattern | `emailPattern` | Allowed e-mails for registration and for external users opening the launchpad: the address must contain the pattern with its first `*` removed (`*@acme.com`), case-sensitive. Empty or `*` = any address. |
| Assign Roles / Assign Security Groups | `extUserRoles` / `extUserDepartments` | `[{ "id": "<uuid>", "name": "<name>" }]` — `name` is required (`list_roles`, `list_security_groups`). These rights go to everyone who registers: never put admin roles here. |
| Activation Email | `activationCodeEmail` | Email template id for the activation code (else the system default). |

## Language tab

| Cockpit label | Key | Values / effect |
|---|---|---|
| Users Can Select These Languages | `config.languages` | ISO codes (max 3 characters each), e.g. `["EN","DE"]`; empty = all installed languages. `config.locales` is generated on save. |
| Default Language | `config.defaultLanguage` | Login page language and the language for users whose profile language is not offered. Include it in `languages`. |
| Fallback Language | `config.fallbackLanguage` | Used when no browser language is offered; the Cockpit shows it only without a default language. With `languages` set, send `fallbackLanguage` or include `EN`. |

## PWA tab — installable app, lock and PIN

| Cockpit label | Key | Values / effect |
|---|---|---|
| Enable PWA | `pwa_enable` | Makes the launchpad installable: the page links `/public/launchpad/<id>/pwa.json`, and signed-out visitors get the launchpad page with the login inside it. The Cockpit warns that switching it resets users' stored PWA sessions (they sign in again), and also sets `config.pincode` to the same value and `config.autolock` to `0`. |
| Install Dialog Title | `pwa_title` | App name; empty = the launchpad title, then its name. |
| Display Mode | `pwa_displayMode` | `standalone` (also when empty), `minimal-ui`, `fullscreen`, `browser` (`browser` is not in the Cockpit list). Read at install time. |
| Icon for All iOS devices / Small Icon for Android devices / Large Icon for Android devices | `pwa_customImageIos` (540×540) / `pwa_customImageAndroidOld` (192×192) / `pwa_customImageAndroidNew` (512×512) | Image URLs (`manage-media`); missing sizes fall back to Neptune icons. |
| Desktop screenshots | `pwa_desktopScreenshotWide` (720×540) / `pwa_desktopScreenshotNarrow` (540×720) | Install-dialog screenshots. The Cockpit labels them "Vertical"/"Horizontal" the other way round. |
| Theme Color / Background Color | `pwa_themeColor` / `pwa_backgroundColor` | Manifest colours. |
| Autolock on Idle in Seconds | `config.autolock` | Idle seconds until the user is signed out, on every launchpad that requires sign-in (`0` = off; on a public launchpad it never starts); with PWA and PIN the launchpad locks instead. The Cockpit shows it only under PWA (0–36000). |
| Enable PIN / PIN Length / PIN Tries | `config.pincode` / `config.pincodeLength` / `config.pincodeTries` | Send length `4`, `6` or `8` and tries `1`–`10` (the Cockpit's lists; the server stores any number). |
| PIN Key Iterations | `config.pincodeKeyIterations` | Default 40000, at most 600000. Changing it signs out every PWA user. |
| Enable Web Authentication (Public Key Infrastructure) | `config.enableWebAuth` | Device-key (fingerprint/face) unlock, with PIN. |

Check: `GET /public/launchpad/<id>/pwa.json` (no session) returns the manifest: `name`, `display`, `theme_color`,
`background_color`, `icons`, `screenshots`, `start_url` `/launchpad/<name>`. It answers for every launchpad, so also
check that signed-out `/launchpad/<name>` is the launchpad page (no `<title>Login - …`) with
`<link rel="manifest" href="/public/launchpad/<id>/pwa.json`.

## Role tab

`roles: [{ "id": "<role id>" }]` (`list_roles`) — see SKILL.md.

## Enhancement tab — scripts at launchpad events

`enhancement` is the list of spots `[{ "name", "param", "content", "active" }]`, replaced as a whole. On save every spot
with `active: true` becomes

```js
sap.n.Enhancement.<name> = function (<param>) { console.log('Trigger Enhancement <name>'); <content> };
```

and all of them together are stored as the text `config.enhancement`, which the page runs when the launchpad starts.

- `active` missing counts as off. `param` is copied verbatim into the parameter list: use the names below.
  `content` is the function body. Unknown names are compiled but never called.
- `config.enhancement` is rebuilt from the stored spots on every save that sends `config` or `enhancement`; never
  write it yourself.
- All active spots form **one** script: a syntax error or a bad name (a space is accepted) stops every spot.  In `BeforeUpdate` an error or a rejected Promise
  stops the tiles from loading — catch inside the spot and always resolve.
- A spot edited in the Cockpit takes the Cockpit's `param`; unknown names appear disabled there but stay stored and still run while active.
- Spots run inside the launchpad page only. The login page of a launchpad without PWA is a separate page and runs no
  spot; with PWA the login is part of the launchpad page, so `global` and `BeforeStartup` run before sign-in.
- `header` (HTML Header) is the other way to add script: a static `<script>` or `<link>` in `<head>`, loaded before the
  launchpad starts, without launchpad events or data. Use `header` for a vendor snippet that only needs to load, a
  spot when the code needs a launchpad moment or its data (tile, user, hash).

| Spot (`name`) | `param` | Runs | Typical ask |
|---|---|---|---|
| `global` | — | first, when the launchpad starts | shared helpers for the other spots |
| `BeforeStartup` | — | after UI5 has loaded, before the launchpad starts | "run this script when the launchpad starts" |
| `BeforeUpdate` | — | before tiles and tile groups are rendered the first time; may return a Promise (the launchpad waits — always resolve) | load data before the tiles appear |
| `AfterUpdate` | — | after the launchpad has loaded its tiles | "do X after login / once everything is loaded" |
| `setUserInfo` | — | when the signed-in user's name is set | personalise for the user |
| `SuccessGetMenu` | — | after every tile fetch (start, login, refresh), before the menu is built | adjust the menu data |
| `AfterTileGroupRenderer` | `Container, dataCat` | after each tile group is rendered | adjust a group's DOM |
| `TileClick` | `dataTile` | on every tile click | "add analytics on tile clicks" |
| `HashNavigation` | `hash` | when the URL hash changes; return `true` to stop the launchpad's own handling | custom deep links |
| `BeforeLogout` / `AfterLogout` | `authType` | when logout starts / after it succeeded | sign out of other systems |
| `RemoteSystemAuth` | `headers` | before calls to a remote system (tiles from a remote system); add fields to `headers` | custom auth headers |
| `RestrictedEnable` / `RestrictedDisable` | — | PWA: after lock or logout / after unlock or login, before the update | |
| `BeforeLock` | `authType` | PWA: before the user is locked | sign out of other systems |
| `BeforeSetSettingsMobile` | `settings` | PWA/mobile: before settings from the server or cache are applied | |
| `ClearCookies` | — | PWA/mobile: when cookies are cleared | |
| `PinCodeValidation` | `pincode, validity` | PWA: when a user sets a PIN; set `validity.isValid = false` and `validity.errorMessage` to refuse it | "PIN must not be 1234" |
| `PushRegistration` / `PushNotification` | `dataDevice` / `notification` | the device registers for push / a push arrives while the launchpad is open | |

Check: the signed-out page `/launchpad/<name>` (and `/public/launchpad/<name>` when public) contains
`sap.n.Enhancement.<name> = function (<param>)` for each active spot and none for inactive ones.

Patterns that work (verified on a public launchpad, 2 spots, desktop and phone):

- **Header links and buttons** — `BeforeStartup`, guarded, real `<a href>` links via `sap.m.Link`:
  `if (!window.AppCacheShellCustomRight || window.navAdded) { return; } window.navAdded = true; try { var nav = new sap.m.HBox({ alignItems: 'Center', renderType: 'Bare' }).addStyleClass('myNav'); nav.addItem(new sap.m.Link({ text: 'Platform', href: 'https://…', target: '_blank' }).addStyleClass('myNavLink')); nav.addItem(new sap.m.Link({ text: 'Book a Demo', href: 'https://…', target: '_blank' }).addStyleClass('myNavCta')); AppCacheShellCustomRight.addItem(nav); } catch (e) { console.error(e); }`
  Style them in `CUSTOM_CSS` (`:root .myNav a.sapMLnk.myNavLink{…}`; add `text-shadow:none` — the shell header gives links a
  shadow; set `:root .nepLaunchpadTopInner{--sapLink_Hover_Color:…;--sapLink_Active_Color:…}` — UI5 links take the theme's
  hover colour, which disappears on a dark header) and hide them on phones with a media query. The launchpad keeps room for both slots when it lays out the header.
- **Section DOM touches** — `AfterTileGroupRenderer` (`Container, dataCat`) runs after every render of each section grid;
  find elements with `Container.getDomRef()` or `.nepGroupHeader<dataCat.id>`, mark what you changed (a class or a flag on
  the element) and skip when it is already there. Used for: wrapping a heading phrase in a coloured span, wiring a
  carousel's buttons, and a keyup guard that stops Enter/Space inside tile HTML from opening the tile (recipes:
  `design-to-launchpad` → `reference/techniques.md`).
- The configuration (with the compiled spots) is written into a `<script>` block of the page: the text `</script>` in a
  spot or in `CUSTOM_CSS` would end that block early (source: `JSON.stringify` into the page, no escaping of `</`).
- **One entry per spot name**: two entries with the same name are both stored and compiled in order, so the later
  assignment replaces the earlier one without an error (verified). Merge recipes into one entry; put shared helpers in
  `global`; wrap each recipe in its own `try { (function () { … })(); } catch (e) {}` so one failing recipe leaves the
  others running.
- Errors: a syntax error or a bad name stops every spot; a runtime error inside `global` or `BeforeStartup` is caught and
  written to `console.error`, inside the other spots only in debug mode.
- `CUSTOM_CSS` is served to every visitor as well: no internal names or notes in its comments.

## Light and dark

| Want | Do |
|---|---|
| Follow the device, users may switch | `layout_preference: 0`, fill `config.designer.light` **and** `dark` |
| Start light (or dark), users may switch | `layout_preference: 1` (or `2`), fill both buckets |
| Light only / dark only, no switch | `layout_preference: 3` / `4`, fill only `light` / `dark` |

- **Which bucket applies**: the mode in force picks `config.designer.light` or `dark`; the two buckets are never
  combined. Mode: `3`/`4` fixed; `1`/`2` the preference on the first visit, then the user's last choice (kept per
  browser and launchpad — changing 1 ↔ 2 later does not move returning users); `0` = the device (or the user's
  Appearance choice) decides.
- **Changing `layout_preference` later** does not move returning visitors: the mode they last had is cached in their
  browser, and `0` keeps it (verified: a launchpad switched from `3` to `0` stayed light in a dark-mode browser until the
  site data was cleared). Decide the preference before publishing.
- **Users switch** in the user menu → Settings → Appearance (System Default / Light / Dark). The choice is hidden for
  `3` and `4`, and it needs the user button, which a public launchpad (`publicAccess: true`) does not have.
- **Only one bucket designed**: the other mode shows the default layout of that brightness — the launchpad's
  `layout_dark`/`layout_light`, else the instance's default Launchpad Layout (System Settings), else the built-in
  Neptune look with its background image (a `layout_dark`/`layout_light` id of a missing layout goes straight to the
  built-in look) — none of your colours, logo, CSS or tile styling. Fill both buckets or lock the mode with `3`/`4`.
- **Per bucket**: `THEME…` keys (a light Theme Generator theme in `light`, a dark one in `dark`, see SKILL.md →
  Themes), every colour, logo and canvas key, `CUSTOM_CSS` (repeat it with dark colours), `tileLayout` and
  `tileGroupLayout`, and the login keys.
- **Login page**: uses the same mode and the bucket's login keys (`LOGIN_*`, `MOB_*`, `BACK_LOGON_*`). Its
  placement (`LOGIN_PLACEMENT`) is decided before the mode is known: from `dark` for `2`, `4`, otherwise from
  `light` — keep `LOGIN_PLACEMENT` equal in both buckets.
- Check headless: the signed-out `/launchpad/<name>` page contains the values of both buckets and both theme CSS URLs
  (`…/neptune-generated-light-<id>.css`, `…/neptune-generated-dark-<id>.css`). The rendered dark look shows only in a
  screenshot taken with the device in dark mode, where the client can take one.

## Rules the Cockpit applies and the server does not

- Name: only letters, digits, `_`, `.`, `-` (spaces become `-`).
- Hide Launchpad Header also switches the other header and menu flags (see above).
- `enableTopMenu` and `verticalMenu` exclude each other; so do `activeAppsSide` and `activeAppsTop`; turning on the
  top menu also turns `oneLineTopMenu` off.
- Enable PWA sets `config.pincode` to the same value and `config.autolock` to `0`; Enable PIN fills tries 5, length 4,
  iterations 40000.
- `languages` without `EN` needs `fallbackLanguage`; the default and fallback language are added to `languages`.
- Client Request Timeout below 5 becomes 120; PIN length 4/6/8, tries 1–10, iterations ≤ 600000; Autolock 0–36000.
- A spot edited in the Cockpit takes the Cockpit's `param`; unknown names appear disabled there but stay stored and still run while active.
- `customCDN` needs `ui5Url`.
- Deleted tile groups are dropped from `cat` on save (the server instead refuses an unknown id).
