import { Ability } from "./../ability/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import defaultCharacterProperties from "./defaultCharacterProperties";
import { aggregateItemEffects } from "../Menu/utils";

export const playerStateSlice = createSlice({
    name: "player",
    initialState: {
        player: null,
        deck: [],
    },
    reducers: {
        updatePlayer: (state, action: PayloadAction<object>) => {
            return {
                ...state,
                player: {
                    ...(state.player || {}),
                    ...action.payload,
                },
            };
        },
        onSelectClass: (state, action: PayloadAction<any>) => {
            return {
                ...state,
                player: {
                    ...defaultCharacterProperties,
                    class: action.payload.selectedClass,
                    effects: aggregateItemEffects(defaultCharacterProperties.items),
                },
                deck: action.payload.deck,
            };
        },
        updateDeck: (state, action: PayloadAction<Ability[]>) => {
            return {
                ...state,
                deck: action.payload,
            };
        },
    },
});
