import { configureStore, Middleware } from "@reduxjs/toolkit";
import { battleStateSlice } from "./battle/reducer";
import { playerStateSlice } from "./character/playerReducer";

const characterPersistenceActions = new Set(["player/setTown", "player/updateTownShop", "player/refreshTownItemShop"]);

const isCharacterPersistenceAction = (action: unknown): action is { type: string } => {
    return typeof action === "object" && action !== null && "type" in action && typeof action.type === "string";
};

const characterPersistenceMiddleware: Middleware = (storeApi) => (next) => (action) => {
    const result = next(action);

    if (isCharacterPersistenceAction(action) && characterPersistenceActions.has(action.type)) {
        void import("./Menu/gameFiles").then(({ saveGame }) => saveGame(storeApi.getState().character));
    }

    return result;
};

export const getConfiguredStore = () =>
    configureStore({
        reducer: {
            character: playerStateSlice.reducer,
            battle: battleStateSlice.reducer,
        },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                serializableCheck: false,
            }).concat(characterPersistenceMiddleware),
    });

export const store = getConfiguredStore();

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
