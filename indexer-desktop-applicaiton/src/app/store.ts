import indexerReducer from '@/app-state/indexer_slice';
import { configureStore } from '@reduxjs/toolkit';

export const store = configureStore({
    reducer: {
        indexer: indexerReducer,
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;