import { readFile, writeFile, mkdir } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

export interface Credentials {
    server_url: string;
    token: string;
}

const CREDENTIALS_DIR = join(homedir(), ".neptune-dxp");
const CREDENTIALS_FILE = join(CREDENTIALS_DIR, "credentials.json");

export async function loadCredentials(): Promise<Credentials | null> {
    try {
        const raw = await readFile(CREDENTIALS_FILE, "utf-8");
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

export async function saveCredentials(serverUrl: string, token: string): Promise<void> {
    await mkdir(CREDENTIALS_DIR, { recursive: true });
    await writeFile(
        CREDENTIALS_FILE,
        JSON.stringify({ server_url: serverUrl, token }, null, 2),
        "utf-8"
    );
}

export async function requireAuth(): Promise<Credentials> {
    const credentials = await loadCredentials();
    if (!credentials?.token || !credentials?.server_url) {
        throw new Error(
            "Not authenticated. Please use the login tool first with your Neptune DXP credentials."
        );
    }
    return credentials;
}

