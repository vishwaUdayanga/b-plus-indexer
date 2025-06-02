export type AccessToken = {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
    scope: string;
};

export type TimeConsumingQueries = {
    id: number;
    query: string;
    total_exec_time: number;
    mean_exec_time: number;
    calls: number;
    shared_blks_read: number;
    temp_blks_written: number;
    score: number;
    indexes: string[];
    estimated_time_for_indexes: number;
    next_time_execution: number | null;
    auto_indexing: boolean;
}