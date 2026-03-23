export interface Credentials {
    serverUrl: string;
    cookie: string;
}

let credentials: Credentials | null = null;

export async function login(serverUrl: string, username: string, password: string): Promise<Credentials> {
    const res = await fetch(`${serverUrl}/user/logon/local`, {
        method: 'POST',
        body: JSON.stringify({ username, password }),
        headers: {
            "Content-Type": "application/json"
        }
    });

    if (!res.ok) {
        throw new Error("Login failed: " + await res.text());
    }

    const cookie = res.headers.get('set-cookie');

    if (!cookie) {
        throw new Error("Login response did not contain an authorization cookie");
    }

    credentials = { serverUrl, cookie };
    return credentials;
}

export function requireAuthentication(): Credentials {
    if (!credentials) {
        throw new Error(
            "Not authenticated. Please use the login tool first with your Neptune DXP credentials."
        );
    }
    return credentials;
}

