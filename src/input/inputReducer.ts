import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export type InputState = {
    isKeyboardMode: boolean;
};

const INITIAL_STATE: InputState = {
    isKeyboardMode: false,
};

export const inputStateSlice = createSlice({
    name: "input",
    initialState: INITIAL_STATE as InputState,
    reducers: {
        setKeyboardMode: (state: InputState, action: PayloadAction<boolean>) => {
            return {
                ...state,
                isKeyboardMode: action.payload,
            };
        },
    },
});
