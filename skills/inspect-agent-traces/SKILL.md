---
name: inspect-agent-traces
description: Read Neptune DXP Agent Trace (the record of AI agent turns) via the MCP tools `list_agent_trace_logs` and `get_agent_trace_log`. Use when the user wants to debug an AI agent, see why an agent failed, answered wrongly or did not call a tool, read one conversation, find the turns of one agent, user, script or process flow, check tokens and response time, or review feedback. Trigger phrases include "agent trace", "why did the agent fail", "what did the agent call", "show the agent's last runs", "debug my agent", "trace logs for this agent", "which tool failed", "negative feedback on the agent", "token usage of the agent".
---

# Inspecting Agent Trace via MCP

A request to an AI agent normally writes one **trace**: the input, the final answer, each model step with its tool calls and results, guardrail checks, tokens, response time, status, who triggered it and from where. Thread compaction writes an extra trace (`triggeredFrom: "compaction"`). Rejected requests (no access, daily token limit, an input guardrail) still get a trace with status `access-denied` or `content-filter`; only a request that fails while its trace is being created (unknown agent, agent without a model) leaves none. Both tools are read-only and need the Agent Trace permission (`aiagenttrace`: `List` for the list, `Detail` for one trace) in one of the user's roles; without it they return `Access denied: no permission for aiagenttrace`. With it, a user sees **every user's** traces of **every** agent, as in the Cockpit.

| Tool | Purpose |
|---|---|
| `list_agent_trace_logs({ dateStart, dateEnd, agentId?, status?, triggeredBy?, triggeredFrom?, threads?, feedback?, start?, end? })` | Traces in a time window, newest first, filtered. Each log already holds input, answer, steps and tool calls. |
| `get_agent_trace_log({ id })` | One trace, plus `files`, `vectors`, `guardrails`, `promptObj` (the instruction version used) and `agentObj` (the agent as it is now). |

## Debug one agent

1. Get the agent's id: `list_ai_agents` (`manage-ai-agents`). The list carries only the agent id; `get_agent_trace_log` adds the agent's current name in `agentObj.name`.
2. List its recent traces: `list_agent_trace_logs({ dateStart, dateEnd, agentId: ["<id>"], start: 0, end: 5 })` over the last hours or days. Add `status: ["error"]` for failures only.
3. Read the trace that matters: `status`, `error`, then `steps` in order, meaning what the model did at each step, which tools it called, with what `args`, and what came back. Open it with `get_agent_trace_log` when you also need the files, knowledge hits, guardrail results or the instruction version.
4. Narrow down when needed: one user (`triggeredBy`), one script or process flow (`triggeredFrom`), one conversation (`threads`, which also returns that thread's compaction traces), user feedback (`feedback`).
5. Fix the cause with `manage-ai-agents` (instructions, model, `maxSteps`, `response_format`) or `manage-ai-tools`, run the agent again, and compare the new trace.

What ran in a turn is on the trace itself: `modelProvider`, `modelId`, `temperature`, `promptObj` and `finalSystemPrompt`. `agentObj` (its full `config`, and `modelObj`) is the agent's **current** setup, which may have changed since.

## Filters (`list_agent_trace_logs`)

| Field | Meaning |
|---|---|
| `dateStart`, `dateEnd` | Required, inclusive. Send ISO 8601 date-times with `Z` or an offset (`2026-11-03T08:00:00Z`). A date without a time means midnight at the **start** of that day, so `dateEnd: "2026-11-03"` leaves out all of 3 November. A time without an offset is read in the server's time zone. A string that cannot be parsed as a date fails with `Could not retrieve AI logs`. |
| `agentId` | Array of agent ids. A value that is not a UUID fails with `Could not retrieve AI logs`. Omit it to list the traces of all agents (and of SAP data sources). |
| `status` | Any of `success`, `paused`, `error`. `success` = stored as `stop` or `tool-calls`, which **includes a turn cut off by the step limit while calling tools** (often with an empty `output`). `paused` = halted on a sub-agent's question to the user (`paused`, or `expired` when it went unanswered). `error` = the other end states, such as `error`, `length`, `content-filter` (also an input guardrail block), `timeout`, `token-limit`, `access-denied` (also the daily token limit) and `aborted`. A trace still running, or interrupted before it ended, has no status and matches **no** status filter. All three values, or none, means no filter. |
| `triggeredBy` | Case-insensitive part of a user's name, email or username; `_` and `%` act as wildcards. When it matches no user, the result is `{"requests":[],"logs":[],"tools":{},"feedback":{}}` with no `numRecords`. |
| `triggeredFrom` | Exact source strings, no partial match. On this platform: `agentPlayground` (Cockpit Playground), `chatbox`, `launchpad:<launchpad id>`, `agentic-apps` and `ia-evaluator` (Agentic Apps; older traces say `intelligent-apps`), `scriptEditor: <script name>` (an agent called from a server script), `processFlow: <flow name>` (older traces may lack the space), `workflow:<workflow title>`, `a2a.respond` (an agent answering over A2A), `compaction`, and free text an app sends (for example `AssetManagement`). No tool lists the values in use, so read them from a page of traces first. |
| `threads` | Thread ids (`threadID` on a trace): every turn of one conversation. A value that is not a UUID fails with `Could not retrieve AI logs`. |
| `feedback` | Any of `GIVEN`, `NOT_GIVEN`, `POSITIVE`, `NEGATIVE`. Several values are combined with OR. |
| `start`, `end` | Paging, `end` exclusive, default 0 to 10. **Always send both, with `end` from `start + 1` to `start + 5`.** `end: 0` returns every match unpaged, and `start` alone pages only up to the default `end` of 10 (an empty page at 10, `Could not retrieve AI logs` above). |

There is no filter by SAP data source and no way to change the histogram's aggregation or time zone; such extra fields are dropped without an error.

## Keep results small

A list result is `{ numRecords, logs, requests, feedback, tools }`. Only `numRecords` counts every match. `requests` (an hourly histogram), `feedback` and `tools` (calls per tool name; pending calls count as successful) summarize **only the returned page**.

- **Use a short window.** `requests` has one entry per hour for every whole day in the window (a partial last day gets none), even when `end` is 1. Two years produced about 17,500 entries (about 320 KB). A window under 24 hours returns `requests: []`.
- **Page in fives.** Each log carries the full input, answer, filled-in instructions, variables and every step with tool arguments and results: 166 error traces came to about 10 MB.
- `get_agent_trace_log` can be large too: `files[].data` is the whole file sent with the request, and `vectors[].data` the matched rows.
- `createdBy` is the triggering user's username, `changedBy` a user id. `temperature` is a string, `"undefined"` when the agent sets none.

## What a trace contains

| Field | Content |
|---|---|
| `status`, `error` | How the turn ended. `error` holds the provider's raw error or the server's stack trace. For chat and Playground turns it can contain the whole request sent to the model (instructions, input, history). A script or process flow that called the agent only saw `An error occurred, please try again later or contact your administrator.` Quote only the part the user needs. |
| `input`, `output`, `structuredOutput` | The user's message, the answer, and the JSON answer of a `json_schema` agent. |
| `steps[]` | The model steps in order (`stepOrder`, `type`, `text`, `reasoning`, tokens). `steps[].tools[]` are the tool calls of that step: `toolName`, `args`, `result`, `status` (`SUCCESS`, `ERROR`, `PENDING`), `error`, `toolOrder`. |
| `finalSystemPrompt`, `variables`, `promptObj` | The instructions as sent (variables filled in), the variable values, and the instruction version used (`promptObj.prompt` is the template). |
| `guardrails[]` | Get only. Each check with `stage`, `pass` and `guardrail.name` (`manage-ai-guardrails`). The reason for a block is in `error` (`Content filter violation: …`); the guardrail's own check is not readable. |
| `files`, `vectors` | Get only. Files sent with the request, and knowledge hits from vectorized tables. |
| Usage | `promptTokens`, `completionTokens`, `cachedPromptTokens`, `cacheWritePromptTokens`, `reasoningTokens`, `totalTokens`, `modelResponseTime`, `modelProvider`, `modelId`, `temperature`. |
| Context | `triggeredFrom`, `createdBy`, `threadID`, `resumedFromLogId` (the paused turn this one continues), `feedbackPositive`, `feedbackComment`. `parentLogId` exists but is always empty, so a sub-agent's turn cannot be linked to its caller through it. |
| `agentObj` | Get only. The agent as it is **now**: `id`, `name`, full `config`, and `modelObj` (`id`, `name`, `type`, `config`) with the API key, base URL, access key id and secret access key removed. |

## "Hide log content" agents

Hiding works **per trace**, by the agent's `config.onlyMetadata` (`manage-ai-agents`) at the time of the turn: switching it on later does not hide older traces, and switching it off does not reveal hidden ones. On a hidden trace `input` and `output` are null and `steps`, `files` and `vectors` are empty, on both tools.

Still returned for hidden turns:
- `variables`, `finalSystemPrompt` (which contains the variable values), `structuredOutput` (the full JSON answer), `feedbackComment`;
- `error`, which for chat turns can hold the whole request;
- the tool counts in the list's `tools` summary;
- **compaction traces** of the agent's threads (`triggeredFrom: "compaction"`), which are never hidden; their `output` summarizes the whole conversation.

Treat these traces as containing user data. When the user relies on hidden content, tell them which fields are still visible and do not quote them unprompted.

## Gotchas

- **Traces of a deleted agent drop out of the list**: filtering by its old id returns `numRecords: 0`, and `get_agent_trace_log` on such a trace fails with `Cannot read properties of null (reading 'modelObj')`. The same error comes back for SAP data-source traces, which have no agent; an agent without a model fails with `… (reading 'config')`.
- Unknown id: `Log not found`. An id that is not a UUID fails input validation (`Invalid uuid at id`).
- Cannot over MCP: delete traces, give or change feedback, replay a turn, list the `triggeredFrom` values or threads, filter by SAP data source, read an LLM guardrail's own check. Running an agent is not a trace tool either: call it from a script (`manage-server-scripts`, `run-server-script`) or start a process flow (`run_processflow`), then read the new trace.

## Related skills

- **`manage-ai-agents`**: fix instructions, model, step limit, structured output, "Hide log content".
- **`manage-ai-tools`**: a tool that fails or is never called.
- **`manage-ai-guardrails`**: a guardrail that blocked a turn.
- **`agentic-apps`**: turns of an Agentic Apps agent (`triggeredFrom` `agentic-apps`); these often end on `tool-calls` by design.
- **`inspect-system-logs`**: server-side errors around the same time.
