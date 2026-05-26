---
name: search-docs
description: Search the public Neptune DXP documentation (docs.neptune-software.com) via its Typesense index when you need to look up how a DXP feature works, troubleshoot an error returned by a Neptune MCP tool, or answer a "how do I…" question about App Designer, Server Scripts, API Designer, Workflow, Cockpit, Adaptive Designer, or Table/Dictionary. Trigger phrases include "search the docs", "what does the doc say", "how does X work in DXP", "is this DXP error documented", "find the reference for". Also use proactively when a Neptune MCP call fails or returns an error you don't recognize — check the docs before guessing.
---

# Searching the Neptune DXP documentation

The public docs at https://docs.neptune-software.com are indexed in Typesense Cloud. The search-only API key below is the same one the live docs site ships in its client JS — it's intended to be public.

Query Typesense directly with `curl`, parse with `jq`, and if a snippet isn't enough, WebFetch the top hit's URL for the full page.

## When to use

- A Neptune MCP tool returned an error or unexpected behavior — search before guessing.
- The user asks how something in DXP works (App Designer events, server-script `req` context, API role gating, workflow tasks, etc.).
- The user mentions a Neptune concept by name and you want to link the canonical write-up.

Do not use for general programming questions or non-Neptune topics.

## The search call

```bash
curl -s -X POST "https://9lbzk8omsjqd1cwup-1.a1.typesense.net/multi_search" \
  -H "X-TYPESENSE-API-KEY: zfHraaz2Nl6ICiwohnaVPhXKymX1vesK" \
  -H "Content-Type: application/json" \
  -d '{"searches":[{
    "collection": "neptune-docs",
    "q": "<your query>",
    "query_by": "hierarchy.lvl0,hierarchy.lvl1,hierarchy.lvl2,hierarchy.lvl3,hierarchy.lvl4,hierarchy.lvl5,hierarchy.lvl6,content",
    "sort_by": "_eval([(component:=neptune-dxp-open-edition):9]):desc,version_sort:desc",
    "per_page": 8,
    "include_fields": "hierarchy,url,content,component,version"
  }]}' \
  | jq '.results[0].hits[] | {component: .document.component, version: .document.version, url: .document.url, title: .document.hierarchy.lvl1, section: .document.hierarchy.lvl2, snippet: (.document.content // "" | .[0:300])}'
```

The `_eval` clause biases toward `neptune-dxp-open-edition` (this plugin's target) while still letting SAP Edition, Cloud, Portal, release notes etc. surface when nothing better exists in OE. `version_sort:desc` then prefers newer versions.

## Query tips

- Keep `q` to 2–6 words. Typesense does typo tolerance and prefix matching.
- Use the user's terminology first; on zero hits, retry with canonical Neptune terms ("server script" not "backend function", "Adaptive Designer" not "form builder").
- For error messages, search the most distinctive 3–5 words, not the whole stack trace.

## Filtering (only when you need to narrow)

Add `filter_by` only to constrain. Components: `neptune-dxp-open-edition`, `neptune-sap-edition`, `neptune-dxp-cloud`, `neptune-dxp-portal`, `neptune-dxp-proxy`, `neptune-dxp-release-notes`, `naia-build`, `neptune-dxp-support`. `version` is stored as a string array (e.g. `["24"]`).

```json
"filter_by": "component:=neptune-dxp-open-edition && version:=24"
```

## Reading results

| Field | What it is |
|---|---|
| `document.url` | Full page URL with anchor. WebFetch this for full content. |
| `document.hierarchy.lvl0..lvl6` | Breadcrumb. `lvl1` = page title; `lvl2`+ = section headings. |
| `document.content` | The matched paragraph. Often enough to answer directly. |
| `document.component` | DXP edition/section. |
| `document.version` | Array of version tags. Null for unversioned components. |

If a snippet answers the question, cite the URL and stop. If partial, WebFetch the URL for the full page. On zero useful hits, rephrase once with canonical vocabulary; if still nothing, tell the user the docs don't cover it.

## Notes

- **Public key, public docs.** Don't put credentials or customer data into queries — they go to Typesense Cloud.
- **If you get a 401**, the embedded key has rotated — surface that to the user; don't try to find another key.
