import { LoginRequest } from "./login.type"
import { getBaseUrlFromElectron } from "../utils";

export async function login(request: LoginRequest) {
    const baseUrl = await getBaseUrlFromElectron();
    const response = await fetch(`${baseUrl}/dba/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
    });

    if (!response.ok) {
        throw new Error('Login failed');
    }

    const data = await response.json();
    return data;
}