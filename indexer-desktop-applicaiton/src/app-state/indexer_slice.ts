import { createSlice } from '@reduxjs/toolkit';
import { AccessToken } from '@/types/redux/states';

interface InitialState {
    dba: AccessToken,
}

const initialState: InitialState = {
    dba: {
        access_token: '',
        token_type: '',
        expires_in: 0,
        refresh_token: '',
        scope: '',
    },
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
    },
});

export const { setDba, clearDba } = indexerSlice.actions;

export default indexerSlice.reducer;
