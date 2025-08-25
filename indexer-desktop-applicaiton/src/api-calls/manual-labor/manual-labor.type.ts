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

export type indexStatus = {
    index_name: string
    status: string
}

export type indexStatusResponse = {
    indexes: indexStatus[]
}

export type changeAutoIndexRequest = {
    query_id: number
    enable: boolean
}

export type removeIndexRequest = {
    query_id: number
    index: string
}

export type addIndexRequest = {
    query_id: number
    index: string
}
