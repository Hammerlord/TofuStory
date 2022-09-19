import { configureStore } from "@reduxjs/toolkit";
import { battleStateSlice } from "./battle/reducer";
import { playerStateSlice } from "./character/playerReducer";
import thunk, { ThunkMiddleware, ThunkDispatch } from "redux-thunk";

export const getConfiguredStore = () =>
    configureStore({
        reducer: {
            character: playerStateSlice.reducer,
            battle: battleStateSlice.reducer,
        },
        // Ignore serializable action object errors with this middleware override (do not care about it right now)
        middleware: [thunk as ThunkMiddleware],
    });

export const store = getConfiguredStore();

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = ThunkDispatch<any, any, any>;
