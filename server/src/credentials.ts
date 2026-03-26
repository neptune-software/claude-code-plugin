import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { homedir } from "node:os";

const credentialsDir = join(homedir(), ".neptune-dxp");
const credentialsFile = join(credentialsDir, "credentials.json");

export interface ClientRegistration {
    client_id: string;
    client_secret?: string;
    registered_at: number;
    expires_at: number;
    redirect_uri: string;
}

export interface OAuthTokens {
    access_token: string;
    refresh_token: string;
    expires_at: number;
}

export interface StoredCredentials {
    clientRegistration?: ClientRegistration;
    oauthTokens?: OAuthTokens;
}

type CredentialsStore = Record<string, StoredCredentials>;

async function readStore(): Promise<CredentialsStore> {
    try {
        const data = await readFile(credentialsFile, "utf-8");
        return JSON.parse(data);
    } catch {
        return {};
    }
}

async function writeStore(store: CredentialsStore): Promise<void> {
    await mkdir(credentialsDir, { recursive: true });
    await writeFile(credentialsFile, JSON.stringify(store, null, 2));
}

export async function loadCredentials(serverUrl: string): Promise<StoredCredentials | null> {
    const store = await readStore();
    return store[serverUrl] ?? null;
}

export async function saveCredentials(serverUrl: string, data: Partial<StoredCredentials>): Promise<void> {
    const store = await readStore();
    store[serverUrl] = { ...store[serverUrl], ...data };
    await writeStore(store);
}

export async function clearCredentials(serverUrl: string): Promise<void> {
    const store = await readStore();
    delete store[serverUrl];
    await writeStore(store);
}
