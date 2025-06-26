import { HitsRequest, HitsResponse } from "./hits.type";
import { getBaseUrlFromElectron } from "../utils";

export async function getHits(request: HitsRequest): Promise<HitsResponse> {
    const baseUrl = await getBaseUrlFromElectron();
    const response = await fetch(`${baseUrl}/hits`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${request.accessToken}`,
        },
        body: JSON.stringify({
            tc_query_id: request.tc_query_id,
            duration: request.duration,
            optimized: request.optimized,
        }),
    });

    if (!response.ok) {
        throw new Error('Failed to retrieve hits');
    }

    const data = await response.json();
    return data as HitsResponse;
}