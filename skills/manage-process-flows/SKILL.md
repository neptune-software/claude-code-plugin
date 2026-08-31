---
name: manage-process-flows
description: Author, inspect, run and troubleshoot Neptune DXP Process Flows (workflows) via the MCP tools `list_processflows`, `get_processflow`, `save_processflow`, `delete_processflow`, `run_processflow`, `list_processflow_executions`, `get_processflow_execution`, `stop_processflow_execution`, `list_assigned_processflow_user_tasks`, `get_processflow_user_task`, `continue_processflow_user_task`. Covers the graph JSON (nodes, edges, handles, gateway conditions, binding expressions) that a process flow actually is. Use when the user wants to build or change a process flow, wire up an approval, add a decision branch, run a flow, approve a pending task, or work out why an execution stalled. Trigger phrases include "create a process flow", "build a workflow", "add an approval step", "add a decision", "run the process flow", "approve the task", "why is my flow stuck", "process flow designer".
---

# Building Neptune DXP process flows via MCP

A **process flow** (older name: workflow; `workflow` table, edited in the Cockpit's Process Flow Designer) is an orchestration artifact. It calls out to the other artifacts you already know — server scripts, tables, AI agents, email and PDF templates — and adds branching, joins, and human approval steps between them. See `dxp-overview` for the artifact model those steps reference.

## Tools

| Tool | Purpose |
|---|---|
| `list_processflows` | Flow definitions. Supports `listOptions` (`where`/`select`/`take`/`skip`/`order`) to filter, project, and sort by field. |
| `get_processflow({ id })` | One definition: `graph`, `interface`, `testdata`. Returns `{ data, validation }`. |
| `save_processflow({ processFlow })` | Create (no `id`) or update (with `id`). Returns `{ data, validation }`. |
| `delete_processflow({ id })` | Delete. Refused with a conflict if executions are still running. |
| `run_processflow({ id, body })` | Start an execution. Returns `{ executionId }`. |
| `list_processflow_executions` | Execution history, filterable by flow, status, date, trigger. |
| `get_processflow_execution({ processFlowId, executionId })` | One execution: graph with per-node status, plus a timeline of events with each node's inputs and outputs. |
| `stop_processflow_execution({ id, executionId })` | Force-stop a running execution. |
| `list_assigned_processflow_user_tasks` | Pending/complete user tasks assigned to the caller (admins see all). |
| `get_processflow_user_task` | One user task by flow + execution + activity execution id. |
| `continue_processflow_user_task` | Complete a pending user task and resume the flow. |

## The graph is the artifact

Everything else on a process flow — name, description, roles, package — is metadata. The behaviour lives entirely in one JSON object:

```json
{ "nodes": [ ... ], "edges": [ ... ] }
```

At run time this is compiled to BPMN 2.0 XML and handed to a BPMN engine. That compilation is why the structural rules below are strict: they are not designer conveniences, they are what makes valid BPMN.

Every node has the same envelope. `position` is canvas pixels — it does not affect execution, but a flow with everything at `{ x: 0, y: 0 }` is unreadable when the user opens it, so lay it out left to right with roughly 200-260px between steps.

```json
{
    "id": "Activity_7k2m9x1",
    "type": "runScript",
    "position": { "x": 480, "y": 290 },
    "data": { "label": "Build reorder proposal", "scriptId": "<uuid>" }
}
```

Node ids follow BPMN convention and are referenced by edges, execution logs, and binding expressions, so choose them deliberately and never renumber an id that a live execution or an expression already points at:

- `Event_*` — start and end
- `Activity_*` — every task (script, email, user, agent, table interaction)
- `Gateway_*` — every gateway, merge included
- `Flow_*` — edges

## Node types and their `data`

| `type` | Required in `data` | Notes |
|---|---|---|
| `start` | — | Exactly one per flow. |
| `end` | — | Exactly one per flow. |
| `runScript` | `scriptId` | A server script id. The script's output is the node's output — see "Data between nodes". |
| `tableInteraction` | `tableDefinition`, `selectedOperation` | Reads/writes a table through its API artifact. See below. |
| `userTask` | `title`, `approverGroup`, `taskActions` | Pauses the flow until a human answers. |
| `sendEmail` | `to`, `templateId` | Optional `cc`, `bcc`, `tokens`, `pdfAttachment` + `pdfTemplateId`. Addresses may be literal or a binding token. |
| `agentTask` | `agentId` | Hands the whole visible output model to an AI agent as its prompt. |
| `exclusiveGateway` | `conditions` (>= 1) | Takes the **first** branch whose condition is true. |
| `inclusiveGateway` | `conditions` (>= 1) | Takes **every** branch whose condition is true. |
| `mergeGateway` | — | The join. Brings branches back together. |

### `tableInteraction`

This node does not point at a table definition directly — it points at the **API artifact** that exposes the table, and at one path on that API. Create the API first (`manage-apis`) if the table doesn't have one.

```json
{
    "tableDefinition": { "id": "<api artifact uuid>", "name": "API inventory_stock" },
    "selectedOperation": { "id": "<path uuid>", "name": "/inventory_stock", "method": "GET" },
    "parameters": [
        { "name": "order", "default": "{\"sku\": \"ASC\"}" },
        { "name": "take", "default": "500" }
    ],
    "body": ""
}
```

`selectedOperation.name` is the URL path, and the entity name is derived from it by stripping the leading slash. A parameter's value goes in `default` (it is a default in name only) and may itself be a binding expression. Only list parameters you actually want — an entry with no `default` is still sent, as an empty string. A `DELETE` operation must have a `where` parameter with a non-empty value.

### `userTask`

```json
{
    "title": "Approve replenishment purchase order",
    "description": "Shown to the approver.",
    "approverGroup": { "roles": [], "users": ["<user uuid>"] },
    "taskActions": [
        { "id": "<uuid>", "title": "Approve", "value": "approve" },
        { "id": "<uuid>", "title": "Reject", "value": "reject" }
    ]
}
```

`roles` and `users` are uuids, not names. `taskActions` entries are `{ id, title, value }` — `title` is the button label, `value` is what the branch condition downstream compares against. At least one approver and one action are required, and the flow will sit pending forever if the approver group is empty of anyone real.

## Edges and handles

An edge names both ends *and* the socket at each end:

```json
{
    "id": "Flow_3a91k02",
    "source": "Activity_7k2m9x1",
    "sourceHandle": "out-1",
    "target": "Gateway_5b2p8q4",
    "targetHandle": "in-1"
}
```

The handle rule is the single most common way to get a flow that saves cleanly and then behaves wrongly:

- **Every node's input handle is `in-1`**, including a merge with three branches arriving at it. Handles are not slots to be numbered per edge.
- **Every non-gateway node's output handle is `out-1`.**
- **A gateway's output handle is the `id` of the condition that branch belongs to** — not `out-1`, not an index. An edge leaving a gateway with `sourceHandle: "out-1"` is orphaned from its condition: it draws on the canvas, carries no condition into the BPMN, and the branch silently misbehaves.

So a gateway with two conditions has exactly two outgoing edges, and their `sourceHandle` values are those two condition ids.

## Gateway conditions

Conditions live on the **gateway node**, and each is bound to an edge by the handle rule above.

```json
{
    "id": "<condition uuid>",
    "label": "Reorder needed",
    "expression": "{= ${Outputs>/Activity_7k2m9x1/lineCount} > 0}",
    "isDefault": false
}
```

`expression` is UI5 expression-binding syntax: `{= ... }` wrapping a JavaScript comparison, with `${...}` around each value read from the flow. Three models can be read:

| Binding | Reads |
|---|---|
| `${Outputs>/<nodeId>/<field>}` | Any earlier node's output, by node id. **Prefer this** — it is explicit and survives someone inserting a step in between. |
| `${InterfaceData>/<field>}` | The shared interface bag, seeded at start and writable throughout the run. |
| `${<field>}` | The immediately preceding activity's output. Terse, but breaks the moment a node is inserted before it. |

`expression` is the field to author — it's the source of truth the engine reads.

A condition can also be marked `isDefault: true` — the gateway's fallback branch, exempt from needing an `expression` at all. Prefer it over hand-writing an inverse condition (`=== 0`, `=== 'reject'`) to cover the remaining case.

An **exclusive** gateway takes only the first condition that evaluates true, in the order the conditions appear in the array — so order them deliberately. An **inclusive** gateway takes all of them. A **merge** is an inclusive join: it waits for the branches that are actually active, so a flow where only one of two branches ran still reaches the end.

## Data between nodes

Each node's output becomes readable by everything downstream.

- **`tableInteraction`** outputs `{ entity, method, result }`, where `result` is the rows (GET) or the write result.
- **`userTask`** outputs the answer payload, i.e. `{ approverDecision: "approve" }`.
- **`runScript`** outputs whatever the script assigns to **`result.data`**. A script that sets `result = {...}` the way a plain server script does produces an empty output here. This catches people out constantly.

A script node's script reads the flow through a `pfData` global:

| Field | Holds |
|---|---|
| `pfData.data` | The previous non-gateway node's output. |
| `pfData.outputs` | Every visible node's output, keyed by node id — the same model the `Outputs>` bindings read. Also `$start`, `$latest`, `$types`, `$predecessors`, `$history`. |
| `pfData.interfaceData` | The shared interface bag. |
| `pfData.header` | `{ workflowId, executionId, activityExecutionId, activityId }`. |

Everything else about authoring that script is normal server-script work — see `manage-server-scripts`, and note that a script reading or writing table rows still needs its `entitySets` dependency declared.

## Getting data in

`run_processflow({ id, body })` accepts:

- `body.interfaceData` — an object seeding the InterfaceData bag, readable everywhere as `${InterfaceData>/field}`.

The flow's `interface` array is the declared shape of that input (`{ id, parent, name, objectType }` per field, `objectType` one of `string`, `number`, `integer`, `boolean`, `object`, `array`). It documents and drives the designer's binding pickers; it does not reject a run whose payload disagrees with it. `testdata` holds a sample payload for the designer's test runs.

## Validation

`validateProcessFlowGraph` runs on both save and run, but they treat it differently:

- **`save_processflow` is lenient.** It saves anything and reports problems in `validation.errors`. An empty `errors` array is the only confirmation that the graph is sound — always read it back.
- **`run_processflow` is strict.** It refuses to start an execution while any error stands.

What it checks: exactly one `start` and exactly one `end`; no node connected to itself; every node reachable from the start; the end reachable; no node other than the end left without an outgoing edge; and each node type's own required fields (a script node needs a script, a gateway needs at least one condition with a non-empty expression, a user task needs a title, approvers and actions, an email node needs a valid recipient and a template).

It does **not** check that your handles are right, that a referenced script or api id exists, or that a binding expression names a real node — those fail at run time, usually as a branch quietly not taken.

## A worked example graph

Every node type in one flow: start, table interaction, script, exclusive gateway splitting to a user task and an email, a merge, an agent task, end. The email, agent and table nodes are shown as the designer drops them, with only a label — each still needs its required `data` fields filled in before the flow will pass validation.

Fields the canvas maintains for itself appear here too, and you do not author them: `hasMultipleIncomingWarning`, `hasMergeWarning` and `mergeWarning` drive warning badges on a node, and an edge's `isRouteAbove` picks which way the connector routes around obstacles.

```json
{
    "nodes": [
        { "id": "Event_str001", "type": "start", "position": { "x": -361, "y": 256 }, "data": { "label": "Started" } },
        { "id": "Activity_chk01", "type": "runScript", "position": { "x": 125, "y": 219 },
          "data": { "label": "Check", "scriptId": "<uuid>", "hasMultipleIncomingWarning": false } },
        { "id": "Gateway_dec01", "type": "exclusiveGateway", "position": { "x": 425, "y": 195 },
          "data": { "label": "Over limit?",
            "conditions": [
              { "id": "c-over", "label": "Over", "isExpression": true,
                "expression": "{= ${Outputs>/Activity_chk01/total} > 100}" },
              { "id": "c-under", "label": "Within limit", "isExpression": true,
                "expression": "{= ${Outputs>/Activity_chk01/total} <= 100}" }
            ],
            "hasMergeWarning": false, "mergeWarning": null } },
        { "id": "Activity_esc01", "type": "userTask", "position": { "x": 779, "y": 127 },
          "data": { "label": "Escalate", "title": "Approve overspend",
            "approverGroup": { "roles": [], "users": ["<user uuid>"] },
            "taskActions": [ { "id": "<uuid>", "title": "Approve", "value": "approve" } ],
            "hasMultipleIncomingWarning": false } },
        { "id": "Gateway_join1", "type": "mergeGateway", "position": { "x": 1180, "y": 304 }, "data": { "label": "Join" } },
        { "id": "Event_end001", "type": "end", "position": { "x": 1897, "y": 307 }, "data": { "label": "Done" } },
        { "id": "Activity_i28ecxi", "type": "sendEmail", "position": { "x": 779.26953125, "y": 373.52734375 },
          "data": { "label": "Send Email", "hasMultipleIncomingWarning": false } },
        { "id": "Activity_2wgxw3g", "type": "agentTask", "position": { "x": 1529.6953125, "y": 279.6171875 },
          "data": { "label": "Agent Task", "hasMultipleIncomingWarning": false } },
        { "id": "Activity_9iuabt2", "type": "tableInteraction", "position": { "x": -201.9921875, "y": 202.17578125 },
          "data": { "label": "Table Interaction", "hasMultipleIncomingWarning": false } }
    ],
    "edges": [
        { "id": "Flow_2", "source": "Activity_chk01", "sourceHandle": "out-1",
          "target": "Gateway_dec01", "targetHandle": "in-1", "data": {} },
        { "id": "Flow_3", "source": "Gateway_dec01", "sourceHandle": "c-over",
          "target": "Activity_esc01", "targetHandle": "in-1", "data": {} },
        { "id": "Flow_5", "source": "Activity_esc01", "sourceHandle": "out-1",
          "target": "Gateway_join1", "targetHandle": "in-1", "data": {} },
        { "id": "Flow_qzz45n3", "source": "Gateway_dec01", "sourceHandle": "c-under",
          "target": "Activity_i28ecxi", "targetHandle": "in-1", "data": { "isRouteAbove": false } },
        { "id": "Flow_jt5z9n9", "source": "Activity_i28ecxi", "sourceHandle": "out-1",
          "target": "Gateway_join1", "targetHandle": "in-1", "data": { "isRouteAbove": false } },
        { "id": "Flow_cpjdkla", "source": "Gateway_join1", "sourceHandle": "out-1",
          "target": "Activity_2wgxw3g", "targetHandle": "in-1", "data": { "isRouteAbove": false } },
        { "id": "Flow_9e8nsmz", "source": "Activity_2wgxw3g", "sourceHandle": "out-1",
          "target": "Event_end001", "targetHandle": "in-1", "data": { "isRouteAbove": false } },
        { "id": "Flow_hpapjvi", "source": "Event_str001", "sourceHandle": "out-1",
          "target": "Activity_9iuabt2", "targetHandle": "in-1", "data": { "isRouteAbove": false } },
        { "id": "Flow_qq6p4ay", "source": "Activity_9iuabt2", "sourceHandle": "out-1",
          "target": "Activity_chk01", "targetHandle": "in-1", "data": { "isRouteAbove": false } }
    ]
}
```

## Running and finishing a flow

1. `run_processflow({ id, body })` → `{ executionId }`. It returns as soon as the engine starts, not when the flow finishes.
2. `list_processflow_executions` for status: `running`, `awaiting_user`, `completed`, `error`, `stopped`.
3. A flow that reaches a user task stays open. `list_assigned_processflow_user_tasks({ status: ["pending"] })` gives you the `activityExecutionId` and the task `id`.
4. `continue_processflow_user_task({ processFlowId, executionId, activityExecutionId, userTaskId, payload: { approverDecision: "<value>" } })`. `approverDecision` must be one of that task's configured action **values**, or the call is rejected.
5. `get_processflow_execution` for the post-mortem: each node's status plus the actual inputs and outputs it saw. This is the fastest way to find out why a branch went the way it did.

## Gotchas

- **Author the graph, then read `validation.errors` back.** Save will happily persist a broken flow.
- **Gateway edges must carry the condition id as `sourceHandle`.** Covered above; it is the defect you will hit first.
- **Only `isDefault: true` lets a condition skip having an expression.** An ordinary condition left with an empty `expression` fails validation — it does not silently become the fallback branch.
- **Script nodes must write `result.data`.** `result = {...}` yields nothing downstream.
- **A node's `data.executionStatus` is runtime state.** It comes back on `get_processflow_execution`; never author it into a saved graph.
- **Ids referenced across artifacts are uuids** — `scriptId`, `agentId`, `templateId`, `tableDefinition.id`, approver roles and users. Look them up with the matching skill's list tool rather than guessing.
- **Renaming a node id breaks every expression pointing at it.** Nothing warns you; the branch just stops matching.
- **`delete_processflow` is refused while executions run.** Stop them first with `stop_processflow_execution`.

## Related skills

- **`dxp-overview`** — the artifact model every node type points into.
- **`manage-server-scripts`** — authoring the scripts a `runScript` node calls, including `entitySets` for table access.
- **`manage-apis`** — the API artifact and path that a `tableInteraction` node targets.
- **`manage-tables`** — defining the table behind that API, and reading its rows to check what a flow did.
- **`inspect-system-logs`** — server log when an execution errors rather than just branching oddly.
