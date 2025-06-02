import { getBaseUrlFromElectron } from "../utils";
import { TimeConsumingQueriesResponse } from "./analyse.type";

export async function runDiagnostics({accessToken}: { accessToken: string }) {
    const baseUrl = await getBaseUrlFromElectron();
    const response = await fetch(`${baseUrl}/diagnostics`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
    });
    if (!response.ok) {
        throw new Error('Failed to run diagnostics');
    }
    
    const data = await response.json()

    if (Array.isArray(data)) {
        return []
    }

    return data as TimeConsumingQueriesResponse;

}

export async function getStatistics({accessToken}: { accessToken: string }) {
    const baseUrl = await getBaseUrlFromElectron();
    const response = await fetch(`${baseUrl}/statistics`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
    });
    if (!response.ok) {
        throw new Error('Failed to fetch statistics');
    }

    const data = await response.json()

    if (Array.isArray(data)) {
        return []
    }

    return data as TimeConsumingQueriesResponse;
}