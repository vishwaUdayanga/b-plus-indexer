export type createTCQueryRequest = {
    query_id: string
}

export type statQuery = {
    query_id: string
    query: string
}

export type statQueryResponse = {
    queries: statQuery[]
}

