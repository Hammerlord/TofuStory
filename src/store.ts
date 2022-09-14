import { configureStore } from "@reduxjs/toolkit";
import { battleStateSlice } from "./battle/reducer";
import { playerStateSlice } from "./character/playerReducer";

export const store = configureStore({
    reducer: {
        character: playerStateSlice.reducer,
        battle: battleStateSlice.reducer,
    },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
