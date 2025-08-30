import { createTCQueryRequest, statQueryResponse, indexStatusResponse, changeAutoIndexRequest, addIndexRequest, removeIndexRequest } from "./manual-labor.type";
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

export async function deleteTCQuery({query_id, access_token}: {query_id: string, access_token: string}): Promise<{message: string}> {
    const baseUrl = await getBaseUrlFromElectron();
    const response = await fetch(`${baseUrl}/queries/${query_id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${access_token}`,
        }
    });

    if (!response.ok) {
        throw new Error('Failed to delete query');
    }

    const responseData = await response.json();
    return responseData as {message: string};
}

export async function getIndexStatus({query_id, access_token}: {query_id: string, access_token: string}): Promise<indexStatusResponse> {
    const baseUrl = await getBaseUrlFromElectron();
    const response = await fetch(`${baseUrl}/queries/${query_id}/index-status`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${access_token}`,
        }
    });

    if (!response.ok) {
        throw new Error('Failed to retrieve index status');
    }

    const responseData = await response.json();
    return responseData as indexStatusResponse;
}

export async function materializeIndexes({query_id, access_token}: {query_id: string, access_token: string}): Promise<{message: string}> {
    const baseUrl = await getBaseUrlFromElectron();
    const response = await fetch(`${baseUrl}/queries/${query_id}/create-indexes`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${access_token}`,
        }
    });

    if (!response.ok) {
        throw new Error('Failed to materialize index');
    }

    const responseData = await response.json();
    return responseData as {message: string};
}

export async function deMaterializeIndexes({query_id, access_token}: {query_id: string, access_token: string}): Promise<{message: string}> {
    const baseUrl = await getBaseUrlFromElectron();
    const response = await fetch(`${baseUrl}/queries/${query_id}/delete-indexes`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${access_token}`,
        }
    });

    if (!response.ok) {
        throw new Error('Failed to de-materialize indexes');
    }

    const responseData = await response.json();
    return responseData as {message: string};
}

export async function changeAutoIndex({data, access_token}: {data: changeAutoIndexRequest, access_token: string}) {
    const baseUrl = await getBaseUrlFromElectron();
    const response = await fetch(`${baseUrl}/queries/change-auto-indexing`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${access_token}`,
        },
        body: JSON.stringify({
            query_id: data.query_id,
            enable: data.enable
        })
    });

    if (!response.ok) {
        throw new Error('Failed to change auto index');
    }

    const responseData = await response.json();
    return responseData as {message: string};
}

export async function addIndex({data, access_token}: {data: addIndexRequest, access_token: string}) {
    const baseUrl = await getBaseUrlFromElectron();
    const response = await fetch(`${baseUrl}/queries/add-index`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${access_token}`,
        },
        body: JSON.stringify({
            query_id: data.query_id,
            index: data.index
        })
    });

    if (!response.ok) {
        throw new Error('Failed to add index');
    }

    const responseData = await response.json();
    return responseData as {message: string};
}

export async function removeIndex({data, access_token}: {data: removeIndexRequest, access_token: string}) {
    const baseUrl = await getBaseUrlFromElectron();
    const response = await fetch(`${baseUrl}/queries/remove-index`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${access_token}`,
        },
        body: JSON.stringify({
            query_id: data.query_id,
            index: data.index
        })
    });

    if (!response.ok) {
        throw new Error('Failed to remove index');
    }

    const responseData = await response.json();
    return responseData as {message: string};
}
