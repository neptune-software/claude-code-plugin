import { createInterface } from "node:readline";
import { saveCredentials, requireAuth } from "./credentials";

// ---------------------------------------------------------------------------
// Authenticated fetch
// ---------------------------------------------------------------------------

async function apiFetch(path: string, options: RequestInit = {}): Promise<unknown> {
    const { server_url, token } = await requireAuth();
    const url = `${server_url}${path}`;
    const res = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...options.headers,
        },
    });
    if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`API ${res.status}: ${body || res.statusText}`);
    }
    return res.json();
}

// ---------------------------------------------------------------------------
// Tool registry
// ---------------------------------------------------------------------------

interface Tool {
    description: string;
    inputSchema: object;
    handler: (args: Record<string, any>) => Promise<string>;
}

const tools: Record<string, Tool> = {
    login: {
        description:
            "Authenticate with a Neptune DXP instance. Stores the token locally so subsequent calls are authenticated automatically.",
        inputSchema: {
            type: "object",
            properties: {
                username: { type: "string", description: "Neptune DXP username" },
                password: { type: "string", description: "Neptune DXP password" },
                server_url: {
                    type: "string",
                    description:
                        "Base URL of the Neptune DXP instance (e.g. https://your-instance.neptune-dxp.com)",
                },
            },
            required: ["username", "password", "server_url"],
        },
        handler: async ({ username, password, server_url }) => {
            const res = await fetch(`${server_url}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });
            if (!res.ok) {
                const body = await res.text().catch(() => "");
                return `Login failed (${res.status}): ${body || res.statusText}`;
            }
            const data = await res.json();
            const token = data.token ?? data.access_token;
            if (!token) {
                return "Login response did not contain a token. Response: " + JSON.stringify(data);
            }
            await saveCredentials(server_url, token);
            return `Successfully logged in to ${server_url}.`;
        },
    },

    list_tables: {
        description: "List all tables in the Neptune DXP workspace.",
        inputSchema: { type: "object", properties: {} },
        handler: async () => {
            const data = await apiFetch("/api/tables");
            return JSON.stringify(data, null, 2);
        },
    },

    get_table_schema: {
        description: "Get the column definitions and types for a specific table.",
        inputSchema: {
            type: "object",
            properties: {
                table_id: { type: "string", description: "ID or name of the table" },
            },
            required: ["table_id"],
        },
        handler: async ({ table_id }) => {
            const data = await apiFetch(`/api/tables/${encodeURIComponent(table_id)}/schema`);
            return JSON.stringify(data, null, 2);
        },
    },

    query_table: {
        description: "Read rows from a table, optionally filtering by a query.",
        inputSchema: {
            type: "object",
            properties: {
                table_id: { type: "string", description: "ID or name of the table" },
                filter: { type: "string", description: "Optional filter expression to narrow results" },
                limit: {
                    type: "integer",
                    description: "Maximum number of rows to return",
                },
            },
            required: ["table_id"],
        },
        handler: async ({ table_id, filter, limit }) => {
            const params = new URLSearchParams();
            if (filter) params.set("filter", filter);
            if (limit) params.set("limit", String(limit));
            const queryString = params.toString();
            const path = `/api/tables/${encodeURIComponent(table_id)}/rows${queryString ? `?${queryString}` : ""}`;
            const data = await apiFetch(path);
            return JSON.stringify(data, null, 2);
        },
    },

    list_scripts: {
        description: "List all server-side scripts in the workspace.",
        inputSchema: { type: "object", properties: {} },
        handler: async () => {
            const data = await apiFetch("/api/scripts");
            return JSON.stringify(data, null, 2);
        },
    },

    get_script: {
        description: "Read the source code of a server-side script.",
        inputSchema: {
            type: "object",
            properties: {
                script_id: { type: "string", description: "ID or name of the script" },
            },
            required: ["script_id"],
        },
        handler: async ({ script_id }) => {
            const data = await apiFetch(`/api/scripts/${encodeURIComponent(script_id)}`);
            return JSON.stringify(data, null, 2);
        },
    },

    update_script: {
        description: "Update the source code of a server-side script.",
        inputSchema: {
            type: "object",
            properties: {
                script_id: { type: "string", description: "ID or name of the script" },
                source: { type: "string", description: "New source code for the script" },
            },
            required: ["script_id", "source"],
        },
        handler: async ({ script_id, source }) => {
            const data = await apiFetch(`/api/scripts/${encodeURIComponent(script_id)}`, {
                method: "PUT",
                body: JSON.stringify({ source }),
            });
            return JSON.stringify(data, null, 2);
        },
    },

    list_apps: {
        description: "List all apps in the Neptune DXP workspace.",
        inputSchema: { type: "object", properties: {} },
        handler: async () => {
            const data = await apiFetch("/api/apps");
            return JSON.stringify(data, null, 2);
        },
    },
};

// ---------------------------------------------------------------------------
// JSON-RPC helpers
// ---------------------------------------------------------------------------

interface JsonRpcMessage {
    jsonrpc: string;
    id?: number | string | null;
    method?: string;
    params?: Record<string, any>;
}

function jsonrpc(id: number | string | null, result: unknown): string {
    return JSON.stringify({ jsonrpc: "2.0", id, result });
}

function jsonrpcError(id: number | string | null, code: number, message: string): string {
    return JSON.stringify({ jsonrpc: "2.0", id, error: { code, message } });
}

// ---------------------------------------------------------------------------
// MCP protocol handler
// ---------------------------------------------------------------------------

async function handleMessage(msg: JsonRpcMessage): Promise<string | null> {
    // Notifications (no id) — ignore silently
    if (msg.id === undefined || msg.id === null) return null;

    const { id, method, params } = msg;

    switch (method) {
        case "initialize":
            return jsonrpc(id, {
                protocolVersion: params?.protocolVersion ?? "2024-11-05",
                capabilities: { tools: {} },
                serverInfo: { name: "neptune-dxp", version: "0.0.1" },
            });

        case "tools/list":
            return jsonrpc(id, {
                tools: Object.entries(tools).map(([name, tool]) => ({
                    name,
                    description: tool.description,
                    inputSchema: tool.inputSchema,
                })),
            });

        case "tools/call": {
            const toolName = params?.name;
            const tool = tools[toolName];
            if (!tool) {
                return jsonrpcError(id, -32602, `Unknown tool: ${toolName}`);
            }
            try {
                const text = await tool.handler(params.arguments ?? {});
                return jsonrpc(id, {
                    content: [{ type: "text", text }],
                });
            } catch (err) {
                return jsonrpc(id, {
                    content: [{ type: "text", text: (err as Error).message }],
                    isError: true,
                });
            }
        }

        default:
            return jsonrpcError(id, -32601, `Method not found: ${method}`);
    }
}

// ---------------------------------------------------------------------------
// stdin/stdout transport
// ---------------------------------------------------------------------------

const rl = createInterface({ input: process.stdin });

rl.on("line", async (line: string) => {
    if (!line.trim()) return;
    try {
        const msg: JsonRpcMessage = JSON.parse(line);
        const response = await handleMessage(msg);
        if (response) {
            process.stdout.write(response + "\n");
        }
    } catch {
        // Malformed JSON — send parse error if we can
        process.stdout.write(
            jsonrpcError(null, -32700, "Parse error") + "\n"
        );
    }
});
