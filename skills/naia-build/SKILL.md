---
name: naia-build
description: Build or change a Neptune DXP App Designer app with Naia Build, the AI agent inside App Designer, via the MCP tools `naia_build_status`, `naia_build_start`, `naia_build_wait`, `naia_build_answer`, `naia_build_cancel`. Use when the user wants an app designed, extended or restyled from a description rather than by editing its definition with `save_app`. Trigger phrases include "use Naia Build", "let Naia build it", "build the app with Naia", "ask Naia to add", "generate the app with AI", "have the AI design the screen". Read this before the first `naia_build_*` call; the browser tab it needs is the step everyone trips on.
---

# Building apps with Naia Build via MCP

Naia Build is the AI agent that lives inside App Designer. It designs and edits apps in
place: pages, controls, bindings, event code, calls to existing APIs and tables. The
`naia_build_*` tools let you hand it a request and follow the result from here.

Naia Build runs **in an App Designer tab in the user's browser**. The tools do not build
anything themselves; without that tab there is nothing to talk to. Everything below
follows from that.

## The flow

1. **`naia_build_status`** first, every time. It tells you whether a tab is ready, which
   application it has open, and whether a job is already running.
2. **No tab?** The error gives the exact App Designer URL for this server. Open it for the
   user (`xdg-open`, `open` or `start` with the URL) or ask them to. The user signs in to
   Neptune as the same user this MCP connection uses; the error names that user. The first
   time, Naia Build also asks for a Neptune portal sign-in inside the tab. Then call
   `naia_build_status` again. The tab has to stay open for the whole build.
3. **New app?** Create it with `save_app` first (`application` and `appType: "A"` at
   minimum, see `manage-apps`). `naia_build_start` only opens applications that exist.
4. **`naia_build_start`** with the `prompt` and, unless the tab already has the right app
   open, the `app` name. The tab switches the app into edit mode on its own. If the tab
   has unsaved changes the start is refused; the user saves or discards them in App
   Designer and you start again.
5. **`naia_build_wait`** with the returned `jobId`. Builds take minutes. Use a long
   `timeoutSeconds` (up to 300) and call again with the returned `lastSeq` while the status
   is `running`. Events stream back as progress while you wait.
6. Act on the status it returns:

| Status | Meaning | What to do |
|---|---|---|
| `running` | Still working | `naia_build_wait` again with `lastSeq` |
| `waiting_for_answer` | Naia Build asked a question; `questions` holds it and the offered options | Decide, or ask the user, then `naia_build_answer` with one of the offered options and wait again. If the user answers in the tab instead, the job carries on by itself |
| `needs_browser` | Something only the user can do in the tab: the Neptune portal sign-in, choosing a model (the included Foundational Model or a personal API key), a billing source, a consent prompt | Tell the user exactly what the event text says, then wait again; it resumes by itself once resolved |
| `done` | Finished; `response` has Naia Build's summary, `artifacts` any links it produced | Report back, then verify (below) |
| `error` | Could not start or finish; the last event says why | Fix the cause, start again |
| `cancelled` | Stopped with `naia_build_cancel` | Nothing |

`naia_build_cancel` frees the tab for a new start. Naia Build itself may still be
finishing in the browser; the user sees that in the tab.

## Writing the prompt

Naia Build sees the open app and this server's artifacts, not your conversation. Put
everything it needs in the prompt:

- Name the artifacts to use, with their ids where you have them: "use the existing API
  `mock-external`, do not create a new one".
- Describe screens and behaviour, not UI5 control names: "a list of posts with a refresh
  button, tapping a row opens the detail".
- One coherent change per job. Follow-up changes are new jobs on the same app.
- Say what should happen on failure ("show an error message") or Naia Build decides.

## After a build

Naia Build saves the app in App Designer. Confirm with `get_app`, and if the user wants to
run it, `activate_app` pushes the design to runtime (see `manage-apps`). The user can also
keep working in the same App Designer tab; the next `naia_build_start` picks up the app as
it is then.

## Gotchas

- One job per tab at a time. A second `naia_build_start` while one is active is refused
  with the running job's id; wait for it or cancel it.
- The tab belongs to the user who signed in to the browser. If the MCP connection runs as
  another user, `naia_build_status` keeps reporting no tab.
- Closing or reloading the tab mid-job loses the job. The tab also has to be in App
  Designer itself, not the Cockpit home.
- `naia_build_wait` returning on timeout with status `running` is normal, not an error.

## Related skills

- `manage-apps` for creating the app shell, inspecting the result and activating it.
- `manage-apis`, `manage-tables`, `manage-server-scripts` for the backend pieces Naia Build
  should wire the app to; create them first and name them in the prompt.
