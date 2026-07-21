import { configureStore } from "@reduxjs/toolkit";
import { ThunkDispatch } from "redux-thunk";
import { battleStateSlice } from "./battle/reducer";
import { playerStateSlice } from "./character/playerReducer";

export const getConfiguredStore = () =>
    configureStore({
        reducer: {
            character: playerStateSlice.reducer,
            battle: battleStateSlice.reducer,
        },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                serializableCheck: false,
            }),
    });

export const store = getConfiguredStore();

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = ThunkDispatch<any, any, any>;
