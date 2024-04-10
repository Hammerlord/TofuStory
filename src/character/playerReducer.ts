import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { partition } from "ramda";
import uuid from "uuid";
import { saveGame } from "../Menu/gameFiles";
import { PLAYER_CLASSES } from "../Menu/types";
import { aggregateItemEffects } from "../Menu/utils";
import { BATTLE_TYPES } from "../battle/types";
import { calculateMesoGain, getMaxHP } from "../battle/utils";
import { STARTER_ITEM_UPGRADE_MAP } from "../item/starterItems";
import { ITEM_TYPES, Item, RARITIES } from "../item/types";
import generateTravelRoute from "../map/routes/generateTravelRoute";
import { GeneratedRouteNode, NODE_TYPES, TOWNS } from "../map/types";
import { ShopAbility, ShopItem } from "../shops/constants";
import { Ability, CombatAbility, Effect } from "./../ability/types";
import { toLith } from "./../map/routes/routes";
import defaultCharacterProperties, { wizardProperties } from "./defaultCharacterProperties";
import { Player } from "./types";
import { generateShopInventory } from "../shops/shopUtils";
import { generateTradingPostInventory } from "../shops/tradingPostUtils";

export type ShopState = {
    abilities: (ShopAbility | null)[]; // null: item at that index has been purchased
    items: (ShopItem | null)[];
    usedFreeFood: number;
    usedNumRefreshes: number;
};

export type TownShops = {
    shop: ShopState;
    tradingPost: {
        items: Item[];
        numTradesRemaining: number;
    };
    workshop: {
        numTransmutesRemaining: number;
    };
};

export type BattleHistory = { totalDamageDealt: number; totalKills: number };

export type CharacterState = {
    player: null | Player;
    deck: CombatAbility[];
    battlesWon: {
        [BATTLE_TYPES.ENCOUNTER]: number;
        [BATTLE_TYPES.ELITE_ENCOUNTER]: number;
        [BATTLE_TYPES.BOSS]: number;
    };
    battleHistory: BattleHistory[];
    activityHistory: ActivityHistoryLog[];
    visitedEvents: { [eventId: string]: number };
    infamy: number;
    currentMapLocation: null | GeneratedRouteNode;
    currentTown: TOWNS;
    route;
    nodesVisited: { [nodeId: string]: true };
    townShops: { [key in TOWNS]?: TownShops };
    purchasedConsumables: {
        [itemName: string]: number; // Number of purchases for a given item name
    };
};

const INITIAL_STATE: CharacterState = {
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
    currentMapLocation: null, // The current location node on the overworld map
    currentTown: null, // The currently visited town (if any)
    route: null, // The generated route that the player is currently on
    nodesVisited: {}, // The location nodes the player has visited. { [nodeId: string]: true }
    townShops: {}, // Logs shop inventory in the recent town. See TownShops type.
    purchasedConsumables: {},
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
        updatePlayer: (state, action: PayloadAction<{ [key in keyof Player]?: Player[key] }>) => {
            return {
                ...state,
                player: {
                    ...(state.player || {}),
                    ...action.payload,
                } as Player,
            };
        },
        onSelectClass: (state, action: PayloadAction<{ selectedClass: PLAYER_CLASSES; deck: Ability[] }>) => {
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
        loseItems: (state, action: PayloadAction<String[]>) => {
            const player = state.player;
            const [remainingItems, lostItems] = partition((item) => !action.payload.includes(item.name), player.items);

            const lostItemsMaxHP = aggregateItemEffects(lostItems).reduce((acc, effect: Effect) => {
                return acc + (effect.maxHP || 0);
            }, 0);

            return {
                ...state,
                player: {
                    ...player,
                    items: remainingItems,
                    HP: Math.max(1, player.HP - lostItemsMaxHP), // Losing a max HP item cannot kill you
                    effects: aggregateItemEffects(remainingItems),
                },
            };
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

            const newItemsMaxHP = aggregateItemEffects(regularItems).reduce((acc, effect: Effect) => {
                return acc + (effect.maxHP || 0);
            }, 0);

            return {
                ...state,
                player: {
                    ...state.player,
                    effects: aggregateItemEffects(newItems),
                    items: newItems,
                    mesos: updatedMesos,
                    HP: state.player.HP + newItemsMaxHP,
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
        pushBattleHistory: (state, action: PayloadAction<BattleHistory>) => {
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
        loadState: (state, action) => {
            return {
                ...state,
                ...action.payload,
            };
        },
        newGame: (state) => {
            const route = generateTravelRoute({ startingRoute: { ...toLith, next: [] } });

            return {
                ...state,
                route,
                currentMapLocation: route,
                currentTown: null,
            };
        },
        selectMapNode: (state, action) => {
            const node = action.payload;

            if (node.type === NODE_TYPES.RESTING_ZONE || state.currentMapLocation?.type === NODE_TYPES.TOWN) {
                saveGame({
                    ...state,
                });
            }
            return {
                ...state,
                currentMapLocation: node,
                nodesVisited: { ...state.nodesVisited, [node.id]: true },
            };
        },
        selectInTownNode: (state, action: PayloadAction<string>) => {
            const node = action.payload;
            return {
                ...state,
                nodesVisited: { ...state.nodesVisited, [node]: true },
            };
        },
        setRoute: (state, action) => {
            const route = action.payload;
            return {
                ...state,
                route,
                currentMapLocation: route,
            };
        },
        setTown: (state, action: PayloadAction<TOWNS>) => {
            const townName = action.payload;
            const newState = {
                ...state,
                currentTown: townName,
            };

            if (townName) {
                newState.townShops = {
                    ...newState.townShops,
                    [townName]: {
                        shop: {
                            ...generateShopInventory({ player: state.player }),
                            usedFreeFood: 0,
                            usedNumRefreshes: 0,
                        },
                        tradingPost: {
                            items: generateTradingPostInventory(state.player),
                            numTradesRemaining: 2,
                        },
                        workshop: {
                            numTransmutesRemaining: 2,
                        },
                    },
                };
            }

            saveGame(newState);
            return newState;
        },
        updateTownShop: (state, action: PayloadAction<{ town: TOWNS; shopKey: string; shopState: any }>) => {
            const { town, shopKey, shopState } = action.payload;
            if (!shopKey) {
                return state;
            }
            const newState = {
                ...state,
                townShops: {
                    ...state.townShops,
                    [town]: {
                        ...state.townShops[town],
                        [shopKey]: {
                            ...state.townShops?.[town]?.[shopKey],
                            ...shopState,
                        },
                    },
                },
            };

            saveGame(newState);
            return newState;
        },
        onPurchaseConsumable: (state, action: PayloadAction<string>) => {
            const itemName = action.payload;
            return {
                ...state,
                purchasedConsumables: {
                    ...state.purchasedConsumables,
                    [itemName]: (state.purchasedConsumables[itemName] || 0) + 1,
                },
            };
        },
        refreshTownItemShop: (state, action: PayloadAction<TOWNS>) => {
            const town = action.payload;
            const newState = {
                ...state,
                townShops: {
                    ...state.townShops,
                    [town]: {
                        ...state.townShops[town],
                        shop: {
                            ...state.townShops?.[town]?.shop,
                            ...generateShopInventory({ player: state.player }),
                            usedNumRefreshes: (state.townShops?.[town]?.shop?.usedNumRefreshes || 0) + 1,
                        },
                    },
                },
            };

            saveGame(newState);
            return newState;
        },
    },
});
