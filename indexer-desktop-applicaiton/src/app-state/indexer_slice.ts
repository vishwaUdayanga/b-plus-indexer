import { createSlice,  PayloadAction } from '@reduxjs/toolkit';
import { AccessToken, TimeConsumingQueries } from '@/types/redux/states';

interface InitialState {
    dba: AccessToken,
    queries: TimeConsumingQueries[];
}

const initialState: InitialState = {
    dba: {
        access_token: '',
        token_type: '',
        expires_in: 0,
        refresh_token: '',
        scope: '',
    },
    queries: [],
};

export const indexerSlice = createSlice({
    name: 'indexer',
    initialState,
    reducers: {
        setDba: (state, action) => {
            state.dba = action.payload;
        },
        clearDba: (state) => {
            state.dba = initialState.dba;
        },

        setQueries: (state, action) => {
            state.queries = action.payload;
        },

        clearQueries: (state) => {
            state.queries = [];
        },

        addQuery: (state, action: PayloadAction<TimeConsumingQueries>) => {
            state.queries.push(action.payload);
        },
    },
});

export const { setDba, clearDba, setQueries, clearQueries, addQuery } = indexerSlice.actions;

export default indexerSlice.reducer;
