import { createInterface } from "node:readline";
import { requireAuthentication, getAuthHeaders, setCredentials, clearAuth } from "./authentication.js";
import { oauthLogin, oauthLogout } from "./oauth.js";

interface Tool {
    description: string;
    inputSchema?: object;
    handler: (args: Record<string, any>) => Promise<string>;
}

async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
    const credentials = await requireAuthentication();
    const authHeaders = getAuthHeaders(credentials);
    return fetch(`${credentials.serverUrl}${path}`, {
        ...options,
        headers: {
            ...authHeaders,
            ...(options.headers as Record<string, string> | undefined),
        },
    });
}

const tools: Record<string, Tool> = {
    oauthLogin: {
        description: "Authenticate with a Neptune DXP Planet9 instance using OAuth 2.1. Opens a browser for login and consent. Use this for OAuth-enabled Planet9 servers.",
        inputSchema: {
            type: "object",
            properties: {
                serverUrl: {
                    type: "string",
                    description: "Base URL of the Planet9 instance (e.g. https://p9:8081)",
                },
            },
            required: ["serverUrl"],
        },
        handler: async ({ serverUrl }) => {
            const result = await oauthLogin(serverUrl);
            setCredentials({
                serverUrl: result.serverUrl,
                accessToken: result.accessToken,
                refreshToken: result.refreshToken,
                tokenEndpoint: result.tokenEndpoint,
                clientId: result.clientId,
                clientSecret: result.clientSecret,
                expiresAt: result.expiresAt,
            });
            return `Successfully authenticated with ${serverUrl} via OAuth 2.1. Access token valid for ~1 hour (auto-refreshes).`;
        },
    },
    oauthLogout: {
        description: "Log out from a Neptune DXP Planet9 instance. Revokes OAuth tokens and clears stored credentials.",
        inputSchema: {
            type: "object",
            properties: {
                serverUrl: {
                    type: "string",
                    description: "Base URL of the Planet9 instance (e.g. https://p9:8081)",
                },
            },
            required: ["serverUrl"],
        },
        handler: async ({ serverUrl }) => {
            await oauthLogout(serverUrl);
            clearAuth();
            return `Successfully logged out from ${serverUrl}. Tokens revoked and credentials cleared.`;
        },
    },
    getTableDefinitions: {
        description: "List all table definitions from the Neptune DXP data dictionary.",
        inputSchema: { type: "object", properties: {} },
        handler: async () => {
            const res = await apiFetch("/api/functions/Dictionary/List", { method: "POST" });
            if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
            return JSON.stringify(await res.json(), null, 2);
        },
    },
    getTableData: {
        description: "Read rows from a Neptune DXP table. Returns all rows by default, or filter by field values.",
        inputSchema: {
            type: "object",
            properties: {
                tableName: { type: "string", description: "Name of the table to read from" },
                filter: {
                    type: "object",
                    description: "Optional key-value pairs to filter rows (e.g. { \"mood\": \"philosophical\" })",
                    additionalProperties: true,
                },
                limit: { type: "number", description: "Maximum number of rows to return (default: 100)" },
            },
            required: ["tableName"],
        },
        handler: async ({ tableName, filter, limit }) => {
            const params = new URLSearchParams();
            if (limit) params.set("$top", String(limit));
            if (filter) {
                Object.entries(filter).forEach(([key, value]) => params.set(key, String(value)));
            }
            const query = params.toString() ? `?${params}` : "";
            const res = await apiFetch(`/api/entity/${tableName}${query}`);
            if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
            return JSON.stringify(await res.json(), null, 2);
        },
    },
    saveTableData: {
        description: "Create or update a row in a Neptune DXP table. To update an existing row, include the id field.",
        inputSchema: {
            type: "object",
            properties: {
                tableName: { type: "string", description: "Name of the table to write to" },
                data: {
                    type: "object",
                    description: "Row data as key-value pairs. Include 'id' to update an existing row.",
                    additionalProperties: true,
                },
            },
            required: ["tableName", "data"],
        },
        handler: async ({ tableName, data }) => {
            const res = await apiFetch(`/api/entity/${tableName}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
            return JSON.stringify(await res.json(), null, 2);
        },
    },
    saveTable: {
        description: "Create or update a table definition in the Neptune DXP data dictionary. To create a new table, omit the id field. To update an existing table, include its id.",
        inputSchema: {
            type: "object",
            properties: {
                name: { type: "string", description: "Table name" },
                description: { type: "string", description: "Table description" },
                fields: {
                    type: "array",
                    description: "Array of field definitions",
                    items: {
                        type: "object",
                        properties: {
                            fieldName: { type: "string", description: "Field name" },
                            fieldType: { type: "string", description: "Field type (e.g. text, integer, boolean, decimal, timestamp)" },
                            isUnique: { type: "boolean", description: "Whether the field value must be unique" },
                        },
                        required: ["fieldName", "fieldType"],
                    },
                },
                id: { type: "string", description: "Table ID (omit for new tables, include to update existing)" },
            },
            required: ["name", "fields"],
        },
        handler: async ({ name, description, fields, id }) => {
            const body: Record<string, any> = {
                name,
                description: description ?? null,
                fields: fields.map((field: any) => ({
                    fieldName: field.fieldName,
                    fieldType: field.fieldType,
                    isUnique: field.isUnique ?? false,
                    ...(field.id ? { id: field.id } : {}),
                })),
                indices: [],
                foreignKeys: [],
                enableAudit: false,
                includeDataInPackage: false,
                rolesRead: [],
                rolesWrite: [],
                ignoreWarning: false,
            };
            if (id) body.id = id;
            const res = await apiFetch("/api/functions/Dictionary/Save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
            return JSON.stringify(await res.json(), null, 2);
        },
    },
};

interface JsonRpcMessage {
    id?: number | null;
    method?: string;
    params?: Record<string, any>;
}

function jsonrpc(id: number | null, result: unknown): string {
    return JSON.stringify({ jsonrpc: "2.0", id, result });
}

function jsonrpcError(id: number | null, code: number, message: string): string {
    return JSON.stringify({ jsonrpc: "2.0", id, error: { code, message } });
}

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
                const text = await tool.handler(params?.arguments ?? {});
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

const rl = createInterface({ input: process.stdin });

rl.on("line", async (line: string) => {
    if (!line.trim()) return;

    try {
        const msg: JsonRpcMessage = JSON.parse(line);
        const response = await handleMessage(msg);
        if (response) {
            process.stdout.write(response + "\n");
        }
    } catch (error) {
        // Malformed JSON — send parse error if we can
        process.stdout.write(
            jsonrpcError(null, -32700, "Parse error") + "\n"
        );
    }
});
