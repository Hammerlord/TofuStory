import { cloneDeep } from "lodash";
import { Ability } from "./../ability/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import defaultCharacterProperties from "./defaultCharacterProperties";
import { aggregateItemEffects } from "../Menu/utils";
import { getMaxHP } from "../battle/utils";
import { Item, ITEM_TYPES } from "../item/types";

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
        restartGame: () => {
            return {
                player: null,
                deck: [],
            };
        },
        acquireItems: (state, action: PayloadAction<Item[]>) => {
            const order = [ITEM_TYPES.CONSUMABLE, ITEM_TYPES.MATERIAL, ITEM_TYPES.EQUIPMENT];
            const newItems = [...state.player.items, ...action.payload].sort((a: Item, b: Item) => {
                return order.findIndex((type) => type === a.type) - order.findIndex((type) => type === b.type);
            });

            return {
                ...state,
                player: {
                    ...state.player,
                    effects: aggregateItemEffects(newItems),
                    items: newItems,
                },
            };
        },
        useConsumable: (state, action: PayloadAction<number>) => {
            // Out of combat consumable use. In-combat uses a different action, see battleStateSlice.
            const itemIndex = action.payload;
            const player = state.player;
            const { healing = 0, resources = 0, effects = [] } = player.items[itemIndex];
            return {
                ...state,
                player: {
                    ...state.player,
                    HP: Math.min(getMaxHP(player), player.HP + healing),
                    resources: Math.min(player.maxResources, player.resources + resources),
                    effects: [...player.effects, ...effects.map(cloneDeep)],
                    items: player.items.filter((item, i: number) => i !== itemIndex),
                },
            };
        },
    },
});
