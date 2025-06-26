export type HitsRequest = {
    accessToken: string;
    tc_query_id: number;
    duration: number;
    optimized: boolean;
};

type QueryLog = {
    id: number
    time_stamp: string
    optimized: boolean
}

export type HitsResponse = {
    query_logs: QueryLog[] | [];
};