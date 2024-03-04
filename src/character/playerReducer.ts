import { BattleState } from "./../battle/reducer";
import uuid from "uuid";
import { cloneDeep } from "lodash";
import { Ability, CombatAbility } from "./../ability/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import defaultCharacterProperties, { wizardProperties } from "./defaultCharacterProperties";
import { aggregateItemEffects } from "../Menu/utils";
import { calculateMesoGain, getMaxHP } from "../battle/utils";
import { Item, ITEM_TYPES, RARITIES } from "../item/types";
import { BATTLE_TYPES } from "../battle/types";
import { PLAYER_CLASSES } from "../Menu/types";
import { STARTER_ITEM_UPGRADE_MAP } from "../item/starterItems";

const INITIAL_STATE = {
    player: null,
    deck: [],
    battlesWon: {
        [BATTLE_TYPES.ENCOUNTER]: 0,
        [BATTLE_TYPES.ELITE_ENCOUNTER]: 0,
        [BATTLE_TYPES.BOSS]: 0,
    },
    battleHistory: [], // Logs configs of battles encountered
    activityHistory: [], // Logs the result of minigames etc. encountered
    visitedEvents: {}, // { [eventId: string]: number } - value is number of times visited
    infamy: 0,
};

export type ActivityHistoryLog = {
    score?: number;
    success?: boolean;
    infamy?: number;
    type?: "card-matching";
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
        updateDeck: (state, action: PayloadAction<(CombatAbility | Ability)[]>) => {
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
            let newItems = [...state.player.items];

            const regularItems = [];
            const itemsWithPickUpEffects = [];
            action.payload.forEach((item) => {
                if (item.pickUp) {
                    itemsWithPickUpEffects.push(item);
                } else {
                    regularItems.push(item);
                }
            });

            // Stack consumable/material items
            regularItems.forEach((item: Item) => {
                if (item.type === ITEM_TYPES.EQUIPMENT) {
                    newItems.push(item);
                    return;
                }

                const existingIndex = newItems.findIndex((i) => i.name === item.name);
                if (existingIndex === -1) {
                    newItems.push(item);
                    return;
                }

                newItems[existingIndex] = {
                    ...newItems[existingIndex],
                    stacks: (newItems[existingIndex].stacks || 1) + 1,
                };
            });

            if (regularItems.some((item) => item.name === STARTER_ITEM_UPGRADE_MAP[state.player?.class]?.name)) {
                // This is the upgraded starter item. The starter item will be replaced.
                newItems = newItems.filter((item) => item.rarity !== RARITIES.STARTER);
            }

            newItems.sort((a: Item, b: Item) => {
                return order.findIndex((type) => type === a.type) - order.findIndex((type) => type === b.type);
            });

            const incomingMesos = itemsWithPickUpEffects.reduce((acc, item: Item) => {
                return acc + (item.pickUp?.mesos || 0);
            }, 0);
            let updatedMesos = 0;
            if (incomingMesos > 0) {
                updatedMesos = calculateMesoGain({ player: state.player, mesos: incomingMesos });
            } else {
                updatedMesos = Math.max(0, state.player.mesos + incomingMesos);
            }

            return {
                ...state,
                player: {
                    ...state.player,
                    effects: aggregateItemEffects(newItems),
                    items: newItems,
                    mesos: updatedMesos,
                },
            };
        },
        updateMesos: (state, action: PayloadAction<number | undefined>) => {
            const incomingMesos = action.payload || 0;
            let updated = 0;
            if (incomingMesos > 0) {
                updated = calculateMesoGain({ player: state.player, mesos: incomingMesos });
            } else {
                updated = Math.max(0, state.player.mesos + incomingMesos);
            }

            return {
                ...state,
                player: {
                    ...state.player,
                    mesos: updated,
                },
            };
        },
        useConsumable: (state, action: PayloadAction<Item>) => {
            // Out of combat consumable use. In-combat uses a different action, see battleStateSlice.
            const player = state.player;
            const { name, healing = 0, resources = 0, stacks = 0 } = action.payload || {};

            let updatedItems = [...player.items];
            if (!stacks || stacks === 1) {
                updatedItems = updatedItems.filter((item) => item.name !== name);
            } else {
                updatedItems = updatedItems.map((item) => {
                    if (item.name === name) {
                        return {
                            ...item,
                            stacks: item.stacks - 1,
                        };
                    }

                    return item;
                });
            }

            return {
                ...state,
                player: {
                    ...player,
                    HP: Math.min(getMaxHP(player), player.HP + healing),
                    resources: Math.min(player.maxResources, player.resources + resources),
                    items: updatedItems,
                },
            };
        },
        pushBattleHistory: (state, action: PayloadAction<{ totalDamageDealt: number }>) => {
            return {
                ...state,
                battleHistory: [...(state?.battleHistory || []), action.payload],
            };
        },
        pushActivityHistory: (state, action: PayloadAction<ActivityHistoryLog>) => {
            return {
                ...state,
                activityHistory: [...(state.activityHistory || []), action.payload],
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
