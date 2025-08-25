import { createTCQueryRequest, statQueryResponse } from "./manual-labor.type";
import { TimeConsumingQueries } from '../../types/redux/states'
import { getBaseUrlFromElectron } from "../utils";

export async function createTCQuery({data, access_token}: {data: createTCQueryRequest, access_token: string}): Promise<TimeConsumingQueries> {
    const baseUrl = await getBaseUrlFromElectron();
    const response = await fetch(`${baseUrl}/queries/add`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${access_token}`,
        },
        body: JSON.stringify({
            query_id: data.query_id
        }),
    });

    if (!response.ok) {
        throw new Error('Failed to retrieve hits');
    }

    const responseData = await response.json();
    return responseData as TimeConsumingQueries;
}

export async function getStatQueries({access_token}: {access_token: string}): Promise<statQueryResponse> {
    const baseUrl = await getBaseUrlFromElectron();
    const response = await fetch(`${baseUrl}/queries/get-queries`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${access_token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to retrieve stats');
    }

    const responseData = await response.json();
    return responseData as statQueryResponse;
}
