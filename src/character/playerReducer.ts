import { BattleState } from "./../battle/reducer";
import uuid from "uuid";
import { cloneDeep } from "lodash";
import { Ability, HandAbility } from "./../ability/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import defaultCharacterProperties, { wizardProperties } from "./defaultCharacterProperties";
import { aggregateItemEffects } from "../Menu/utils";
import { getMaxHP } from "../battle/utils";
import { Item, ITEM_TYPES } from "../item/types";
import { BATTLE_TYPES } from "../battle/types";
import { PLAYER_CLASSES } from "../Menu/types";

const INITIAL_STATE = {
    player: null,
    deck: [],
    battlesWon: {
        [BATTLE_TYPES.ENCOUNTER]: 0,
        [BATTLE_TYPES.ELITE_ENCOUNTER]: 0,
        [BATTLE_TYPES.BOSS]: 0,
    },
    battleHistory: [],
    visitedEvents: {}, // { [eventId: string]: number } - value is number of times visited
    infamy: 0,
};

export const playerStateSlice = createSlice({
    name: "player",
    initialState: INITIAL_STATE,
    reducers: {
        incrementEncounterTypeWon: (state, action: PayloadAction<BATTLE_TYPES>) => {
            return {
                ...state,
                battlesWon: {
                    ...state.battlesWon,
                    [action.payload]: state.battlesWon[action.payload] + 1,
                },
            };
        },
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
            const classMap = {
                [PLAYER_CLASSES.WARRIOR]: defaultCharacterProperties,
                [PLAYER_CLASSES.MAGICIAN]: wizardProperties,
            };
            return {
                ...state,
                player: {
                    ...classMap[action.payload.selectedClass],
                    class: action.payload.selectedClass,
                    effects: aggregateItemEffects(classMap[action.payload.selectedClass].items),
                },
                deck: action.payload.deck.map((card: Ability) => ({ ...card, instanceId: uuid.v4() })),
            };
        },
        updateDeck: (state, action: PayloadAction<(HandAbility | Ability)[]>) => {
            return {
                ...state,
                deck: action.payload.map((card) => {
                    // @ts-ignore We are checking the existence of instanceId here anyway
                    if (card.instanceId) {
                        return card;
                    }

                    return { ...card, instanceId: uuid.v4() };
                }),
            };
        },
        restartGame: () => {
            return INITIAL_STATE;
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
        pushBattleHistory: (state, action: PayloadAction<{ totalDamageDealt: number }>) => {
            return {
                ...state,
                battleHistory: [...(state?.battleHistory || []), action.payload],
            };
        },
        logVisitedEvent: (state, action: PayloadAction<string>) => {
            const eventId = action.payload;
            return {
                ...state,
                visitedEvents: {
                    ...state.visitedEvents,
                    [eventId]: (state.visitedEvents[eventId] || 0) + 1,
                },
            };
        },
        addInfamy: (state, action: PayloadAction<number>) => {
            return {
                ...state,
                infamy: state.infamy + action.payload,
            };
        },
    },
});
