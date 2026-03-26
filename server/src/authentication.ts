import { refreshAccessToken } from "./oauth.js";
import { saveCredentials } from "./credentials.js";
import { log } from "./log.js";

export interface Credentials {
    serverUrl: string;
    accessToken: string;
    refreshToken: string;
    tokenEndpoint: string;
    clientId: string;
    clientSecret?: string;
    expiresAt: number;
}

let credentials: Credentials | null = null;

export async function requireAuthentication(): Promise<Credentials> {
    if (!credentials) {
        throw new Error(
            "Not authenticated. Please use the oauthLogin tool first."
        );
    }

    const bufferSeconds = 60;
    const now = Math.floor(Date.now() / 1000);
    if (now >= credentials.expiresAt - bufferSeconds) {
        log("Access token expired, refreshing");
        try {
            const newTokens = await refreshAccessToken(
                credentials.tokenEndpoint,
                credentials.refreshToken,
                credentials.clientId,
                credentials.clientSecret,
            );
            credentials = {
                ...credentials,
                accessToken: newTokens.access_token,
                refreshToken: newTokens.refresh_token,
                expiresAt: newTokens.expires_at,
            };
            await saveCredentials(credentials.serverUrl, { oauthTokens: newTokens });
        } catch (err) {
            credentials = null;
            throw new Error(
                `Token refresh failed: ${(err as Error).message}. Please run oauthLogin again.`
            );
        }
    }

    return credentials;
}

export function getAuthHeaders(auth: Credentials): Record<string, string> {
    return { Authorization: `Bearer ${auth.accessToken}` };
}

export function setCredentials(auth: Credentials): void {
    credentials = auth;
}

export function clearAuth(): void {
    credentials = null;
}
