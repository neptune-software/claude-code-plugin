import { randomBytes, createHash } from "node:crypto";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { execFile } from "node:child_process";
import { log } from "./log.js";
import { loadCredentials, saveCredentials, clearCredentials, type ClientRegistration, type OAuthTokens } from "./credentials.js";

function generateCodeVerifier(): string {
    return randomBytes(32).toString("base64url");
}

function generateCodeChallenge(verifier: string): string {
    return createHash("sha256").update(verifier).digest("base64url");
}

interface OAuthEndpoints {
    authorizationEndpoint: string;
    tokenEndpoint: string;
    registrationEndpoint: string;
    revocationEndpoint?: string;
}

export interface OAuthResult {
    serverUrl: string;
    accessToken: string;
    refreshToken: string;
    tokenEndpoint: string;
    clientId: string;
    clientSecret?: string;
    expiresAt: number;
}

function parseWwwAuthenticate(header: string): Record<string, string> {
    const params: Record<string, string> = {};
    for (const match of header.matchAll(/(\w+)="([^"]*)"/g)) {
        params[match[1]] = match[2];
    }
    return params;
}

async function discoverOAuthEndpoints(serverUrl: string): Promise<OAuthEndpoints> {
    // Step 1: Hit /mcp to get WWW-Authenticate header
    const mcpRes = await fetch(`${serverUrl}/mcp`, { method: "POST" });
    if (mcpRes.status !== 401) {
        throw new Error(`Expected 401 from ${serverUrl}/mcp, got ${mcpRes.status}. Server may not support OAuth.`);
    }
    const wwwAuth = mcpRes.headers.get("www-authenticate");
    if (!wwwAuth) {
        throw new Error("No WWW-Authenticate header in 401 response from /mcp");
    }
    const authParams = parseWwwAuthenticate(wwwAuth);
    const resourceMetadataUrl = authParams.resource_metadata;
    if (!resourceMetadataUrl) {
        throw new Error(`WWW-Authenticate header missing resource_metadata: ${wwwAuth}`);
    }

    // Step 2: Fetch resource metadata
    const resourceRes = await fetch(resourceMetadataUrl);
    if (!resourceRes.ok) {
        throw new Error(`Resource metadata fetch failed: ${resourceRes.status} ${await resourceRes.text()}`);
    }
    const resourceMeta = await resourceRes.json() as { authorization_servers?: string[] };
    const authServerUrl = resourceMeta.authorization_servers?.[0];
    if (!authServerUrl) {
        throw new Error("Resource metadata missing authorization_servers");
    }

    // Step 3: Fetch authorization server metadata (RFC 8414)
    // For auth server at https://host:port/path, metadata is at https://host:port/.well-known/oauth-authorization-server/path
    const authServerParsed = new URL(authServerUrl);
    const authServerMetaUrl = `${authServerParsed.origin}/.well-known/oauth-authorization-server${authServerParsed.pathname}`;
    const authServerRes = await fetch(authServerMetaUrl);
    if (!authServerRes.ok) {
        throw new Error(`Auth server metadata fetch failed: ${authServerRes.status} ${await authServerRes.text()}`);
    }
    const authMeta = await authServerRes.json() as {
        authorization_endpoint: string;
        token_endpoint: string;
        registration_endpoint: string;
        revocation_endpoint?: string;
    };

    return {
        authorizationEndpoint: authMeta.authorization_endpoint,
        tokenEndpoint: authMeta.token_endpoint,
        registrationEndpoint: authMeta.registration_endpoint,
        revocationEndpoint: authMeta.revocation_endpoint,
    };
}

const CALLBACK_PORTS = [19876, 19877, 19878];

function redirectUri(port: number): string {
    return `http://127.0.0.1:${port}/callback`;
}

async function registerClient(
    registrationEndpoint: string,
    callbackPort: number,
): Promise<ClientRegistration> {
    const res = await fetch(registrationEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            client_name: "Neptune DXP Claude Code Plugin",
            redirect_uris: [redirectUri(callbackPort)],
            grant_types: ["authorization_code", "refresh_token"],
            response_types: ["code"],
            token_endpoint_auth_method: "client_secret_post",
            scope: "mcp:tools",
        }),
    });
    if (!res.ok) {
        throw new Error(`Client registration failed: ${res.status} ${await res.text()}`);
    }
    const data = await res.json() as {
        client_id: string;
        client_secret?: string;
        client_id_issued_at?: number;
        client_secret_expires_at?: number;
    };
    return {
        client_id: data.client_id,
        client_secret: data.client_secret,
        registered_at: data.client_id_issued_at ?? Math.floor(Date.now() / 1000),
        expires_at: data.client_secret_expires_at ?? Math.floor(Date.now() / 1000) + 30 * 86400,
        redirect_uri: redirectUri(callbackPort),
    };
}

function buildAuthorizationUrl(
    authorizationEndpoint: string,
    clientId: string,
    callbackRedirectUri: string,
    codeChallenge: string,
    state: string,
    resource: string,
): string {
    const url = new URL(authorizationEndpoint);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("client_id", clientId);
    url.searchParams.set("redirect_uri", callbackRedirectUri);
    url.searchParams.set("code_challenge", codeChallenge);
    url.searchParams.set("code_challenge_method", "S256");
    url.searchParams.set("scope", "mcp:tools");
    url.searchParams.set("state", state);
    url.searchParams.set("resource", resource);
    return url.toString();
}

async function startCallbackServer(ports: number[]): Promise<{ port: number; server: ReturnType<typeof createServer> }> {
    for (const port of ports) {
        try {
            const server = createServer();
            await new Promise<void>((resolve, reject) => {
                server.once("error", reject);
                server.listen(port, "127.0.0.1", () => {
                    server.removeListener("error", reject);
                    resolve();
                });
            });
            return { port, server };
        } catch {
            // Port in use, try next
        }
    }
    throw new Error(`Could not bind callback server to any of ports: ${ports.join(", ")}`);
}

function waitForAuthorizationCode(
    server: ReturnType<typeof createServer>,
    expectedState: string,
    timeoutMs = 120_000,
): Promise<string> {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            server.close();
            reject(new Error("OAuth authorization timed out. The user did not complete login within 2 minutes."));
        }, timeoutMs);

        server.on("request", (req: IncomingMessage, res: ServerResponse) => {
            const url = new URL(req.url!, `http://${req.headers.host}`);
            if (url.pathname !== "/callback") {
                res.writeHead(404);
                res.end("Not found");
                return;
            }

            const error = url.searchParams.get("error");
            if (error) {
                const desc = url.searchParams.get("error_description") ?? error;
                res.writeHead(200, { "Content-Type": "text/html" });
                res.end("<html><body><h2>Authorization denied.</h2><p>You can close this tab.</p></body></html>");
                clearTimeout(timer);
                server.close();
                reject(new Error(`OAuth authorization denied: ${desc}`));
                return;
            }

            const code = url.searchParams.get("code");
            const state = url.searchParams.get("state");

            if (state !== expectedState) {
                res.writeHead(400, { "Content-Type": "text/html" });
                res.end("<html><body><h2>State mismatch.</h2><p>Possible CSRF attack. You can close this tab.</p></body></html>");
                return;
            }

            if (!code) {
                res.writeHead(400, { "Content-Type": "text/html" });
                res.end("<html><body><h2>Missing authorization code.</h2></body></html>");
                return;
            }

            res.writeHead(200, { "Content-Type": "text/html" });
            res.end("<html><body><h2>Authorization successful!</h2><p>You can close this tab and return to Claude Code.</p></body></html>");
            clearTimeout(timer);
            server.close();
            resolve(code);
        });
    });
}

async function exchangeCodeForTokens(
    tokenEndpoint: string,
    code: string,
    callbackRedirectUri: string,
    codeVerifier: string,
    clientId: string,
    clientSecret: string | undefined,
    resource: string,
): Promise<OAuthTokens> {
    const body = new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: callbackRedirectUri,
        code_verifier: codeVerifier,
        client_id: clientId,
        resource,
    });
    if (clientSecret) body.set("client_secret", clientSecret);

    const res = await fetch(tokenEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
    });
    if (!res.ok) {
        throw new Error(`Token exchange failed: ${res.status} ${await res.text()}`);
    }
    const data = await res.json() as {
        access_token: string;
        refresh_token: string;
        expires_in: number;
    };
    return {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: Math.floor(Date.now() / 1000) + data.expires_in,
    };
}

export async function refreshAccessToken(
    tokenEndpoint: string,
    refreshToken: string,
    clientId: string,
    clientSecret?: string,
): Promise<OAuthTokens> {
    const body = new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: clientId,
    });
    if (clientSecret) body.set("client_secret", clientSecret);

    const res = await fetch(tokenEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
    });
    if (!res.ok) {
        throw new Error(`Token refresh failed: ${res.status} ${await res.text()}`);
    }
    const data = await res.json() as {
        access_token: string;
        refresh_token: string;
        expires_in: number;
    };
    return {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: Math.floor(Date.now() / 1000) + data.expires_in,
    };
}

function openBrowser(url: string): void {
    const cmd = process.platform === "darwin" ? "open"
        : process.platform === "win32" ? "cmd"
        : "xdg-open";
    const args = process.platform === "win32" ? ["/c", "start", "", url] : [url];
    execFile(cmd, args, (err) => {
        if (err) log(`Failed to open browser: ${err.message}`);
    });
}

export async function oauthLogin(serverUrl: string): Promise<OAuthResult> {
    log(`Starting OAuth 2.1 flow for ${serverUrl}`);

    // Check for existing valid tokens
    const stored = await loadCredentials(serverUrl);
    if (stored?.oauthTokens && stored.clientRegistration) {
        const now = Math.floor(Date.now() / 1000);
        const oneMinuteFromNow = now + 60;
        if (stored.oauthTokens.expires_at > oneMinuteFromNow) {
            log("Reusing existing valid access token");
            return {
                serverUrl,
                accessToken: stored.oauthTokens.access_token,
                refreshToken: stored.oauthTokens.refresh_token,
                tokenEndpoint: (await discoverOAuthEndpoints(serverUrl)).tokenEndpoint,
                clientId: stored.clientRegistration.client_id,
                clientSecret: stored.clientRegistration.client_secret,
                expiresAt: stored.oauthTokens.expires_at,
            };
        }

        // Try refresh
        try {
            log("Access token expired, attempting refresh");
            const endpoints = await discoverOAuthEndpoints(serverUrl);
            const newTokens = await refreshAccessToken(
                endpoints.tokenEndpoint,
                stored.oauthTokens.refresh_token,
                stored.clientRegistration.client_id,
                stored.clientRegistration.client_secret,
            );
            await saveCredentials(serverUrl, { oauthTokens: newTokens });
            return {
                serverUrl,
                accessToken: newTokens.access_token,
                refreshToken: newTokens.refresh_token,
                tokenEndpoint: endpoints.tokenEndpoint,
                clientId: stored.clientRegistration.client_id,
                clientSecret: stored.clientRegistration.client_secret,
                expiresAt: newTokens.expires_at,
            };
        } catch (err) {
            log(`Token refresh failed: ${(err as Error).message}, starting full flow`);
            await clearCredentials(serverUrl);
        }
    }

    // Full OAuth flow
    log("Discovering OAuth endpoints");
    const endpoints = await discoverOAuthEndpoints(serverUrl);
    log(`Endpoints: authorize=${endpoints.authorizationEndpoint}, token=${endpoints.tokenEndpoint}, register=${endpoints.registrationEndpoint}`);

    // Start callback server first to know the port
    const { port, server } = await startCallbackServer(CALLBACK_PORTS);
    const callbackUri = redirectUri(port);
    log(`Callback server listening on port ${port}`);

    // Register client (or reuse existing)
    let registration = stored?.clientRegistration;
    const now = Math.floor(Date.now() / 1000);
    if (!registration || registration.expires_at < now + 86400 || registration.redirect_uri !== callbackUri) {
        log("Registering new OAuth client");
        registration = await registerClient(endpoints.registrationEndpoint, port);
        await saveCredentials(serverUrl, { clientRegistration: registration });
    } else {
        log(`Reusing existing client registration: ${registration.client_id}`);
    }

    // PKCE
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);
    const state = randomBytes(16).toString("base64url");
    const resource = `${serverUrl}/mcp`;

    // Build authorization URL and open browser
    const authUrl = buildAuthorizationUrl(
        endpoints.authorizationEndpoint,
        registration.client_id,
        callbackUri,
        codeChallenge,
        state,
        resource,
    );
    log(`Opening browser for authorization: ${authUrl}`);
    openBrowser(authUrl);

    // Wait for callback
    const code = await waitForAuthorizationCode(server, state);
    log("Received authorization code");

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(
        endpoints.tokenEndpoint,
        code,
        callbackUri,
        codeVerifier,
        registration.client_id,
        registration.client_secret,
        resource,
    );
    await saveCredentials(serverUrl, { oauthTokens: tokens });
    log("OAuth login complete, tokens stored");

    return {
        serverUrl,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenEndpoint: endpoints.tokenEndpoint,
        clientId: registration.client_id,
        clientSecret: registration.client_secret,
        expiresAt: tokens.expires_at,
    };
}

export async function tryRestoreOAuthSession(serverUrl: string): Promise<OAuthResult | null> {
    const stored = await loadCredentials(serverUrl);
    if (!stored?.oauthTokens || !stored.clientRegistration) return null;

    const now = Math.floor(Date.now() / 1000);
    if (stored.oauthTokens.expires_at > now + 60) {
        const endpoints = await discoverOAuthEndpoints(serverUrl);
        return {
            serverUrl,
            accessToken: stored.oauthTokens.access_token,
            refreshToken: stored.oauthTokens.refresh_token,
            tokenEndpoint: endpoints.tokenEndpoint,
            clientId: stored.clientRegistration.client_id,
            clientSecret: stored.clientRegistration.client_secret,
            expiresAt: stored.oauthTokens.expires_at,
        };
    }

    // Try refresh
    try {
        const endpoints = await discoverOAuthEndpoints(serverUrl);
        const newTokens = await refreshAccessToken(
            endpoints.tokenEndpoint,
            stored.oauthTokens.refresh_token,
            stored.clientRegistration.client_id,
            stored.clientRegistration.client_secret,
        );
        await saveCredentials(serverUrl, { oauthTokens: newTokens });
        return {
            serverUrl,
            accessToken: newTokens.access_token,
            refreshToken: newTokens.refresh_token,
            tokenEndpoint: endpoints.tokenEndpoint,
            clientId: stored.clientRegistration.client_id,
            clientSecret: stored.clientRegistration.client_secret,
            expiresAt: newTokens.expires_at,
        };
    } catch {
        return null;
    }
}

async function revokeToken(
    revocationEndpoint: string,
    token: string,
    tokenTypeHint: string,
    clientId: string,
    clientSecret?: string,
): Promise<void> {
    const body = new URLSearchParams({
        token,
        token_type_hint: tokenTypeHint,
        client_id: clientId,
    });
    if (clientSecret) body.set("client_secret", clientSecret);

    const res = await fetch(revocationEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
    });
    if (!res.ok) {
        throw new Error(`Token revocation failed: ${res.status} ${await res.text()}`);
    }
}

export async function oauthLogout(serverUrl: string): Promise<void> {
    const stored = await loadCredentials(serverUrl);
    if (!stored?.oauthTokens || !stored.clientRegistration) {
        await clearCredentials(serverUrl);
        return;
    }

    const endpoints = await discoverOAuthEndpoints(serverUrl);
    if (!endpoints.revocationEndpoint) {
        await clearCredentials(serverUrl);
        throw new Error("Server does not support token revocation. Local credentials cleared.");
    }

    const { client_id, client_secret } = stored.clientRegistration;
    const { access_token, refresh_token } = stored.oauthTokens;

    await Promise.all([
        revokeToken(endpoints.revocationEndpoint, access_token, "access_token", client_id, client_secret),
        revokeToken(endpoints.revocationEndpoint, refresh_token, "refresh_token", client_id, client_secret),
    ]);

    await clearCredentials(serverUrl);
    log(`Logged out from ${serverUrl}`);
}
