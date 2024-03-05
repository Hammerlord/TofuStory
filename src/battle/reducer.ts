import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { Ability, CombatAbility, SelectCards } from "../ability/types";
import { Combatant } from "../character/types";
import { Item } from "../item/types";
import { BATTLE_TYPES, BATTLEFIELD_SIDES, Event, Wave } from "./types";
import { getMaxHP } from "./utils";

// Text banner notification to display some info during battle
interface Notification {
    severity?: "warning";
    text: string | JSX.Element;
    id: string; // UUID
}

export interface BattleState {
    enemySide: (Combatant | null)[];
    playerSide: (Combatant | null)[];
    deck: CombatAbility[];
    discard: CombatAbility[];
    hand: CombatAbility[];
    depleted: CombatAbility[];
    isPlayerTurn: boolean | null;
    eventQueue: Event[];
    playerActionQueue: object[];
    playerSummonsInPlay: object; // { [summonId: string]: Ability }
    charactersAttackedThisTurn: string[];
    /** How many player + enemy turns (paired/combined) have passed since the start of the wave */
    round: number;
    waves: Wave[];
    currentWaveIndex: number;
    /** When interacting with cards in your hand, or discovering a card */
    selectCardsPrompt: PlayerSelectCardsPrompt | null;
    mesosAccumulated: number;
    state: BATTLE_STATES;
    backgroundImage?: string; // Path to background image
    backgroundMusic?: string; // 'boss' or path to music URL
    type: BATTLE_TYPES; // Determines the rewards at the end of battle
    itemRewards?: Item[];
    cardRewards?: Ability[];
    disableCardRewards: boolean;
    notification?: Notification;
    totalDamageDealt: number; // Should include DoTs, etc.
    totalKills?: number;
    isTutorial?: boolean;
    addAbilities: CombatAbility[];
}

export interface PlayerSelectCardsPrompt {
    selectCards: SelectCards;
    abilityQueued?: {
        selectedAbilityId: string;
        selectedTargetIndex: number;
        selectedTargetSide: BATTLEFIELD_SIDES;
    };
}

/**
 * These signal the phase of a battle and what events to subsequently trigger (after completing animation playback of the current set of actions)
 */
export enum BATTLE_STATES {
    BATTLE_START = "battle-start",
    WAVE_START = "wave-start",
    TURN_START = "turn-start",
    TURN_IN_PROGRESS = "turn-in-progress",
    TURN_END = "turn-end",
    TURN_ENDING = "turn-ending",
    WAVE_END = "wave-end",
    VICTORY = "victory",
    DEFEAT = "defeat",
}

/**
 * Redux reducer slice for battles
 */
export const battleStateSlice = createSlice({
    name: "battle",
    initialState: null,
    reducers: {
        promptPlayerSelectCards: (state, action: PayloadAction<PlayerSelectCardsPrompt>) => {
            return {
                ...state,
                selectCardsPrompt: action.payload,
            };
        },
        closePlayerSelectCardsPrompt: (state) => {
            return {
                ...state,
                selectCardsPrompt: null,
            };
        },
        updateBattle: (state, action: PayloadAction<object>) => {
            return {
                ...state,
                ...action.payload,
            };
        },
        pushEventQueue: (state, action: PayloadAction<Event>) => {
            state.eventQueue.push(action.payload);
        },
        popEventQueue: (state) => {
            state.eventQueue.shift();
        },
        closeBattle: () => {
            return null;
        },
        updateBattleState: (state, action: PayloadAction<BATTLE_STATES>) => {
            if (!state) {
                return state;
            }
            // If the fight is over, don't overwrite the state
            if ([BATTLE_STATES.VICTORY, BATTLE_STATES.DEFEAT].includes(state.state)) {
                return state;
            }
            return {
                ...state,
                state: action.payload,
            };
        },
        useConsumable: (state, action: PayloadAction<Item>) => {
            const { name, healing = 0, resources = 0, stacks = 0 } = action.payload || {};

            return {
                ...state,
                playerSide: state.playerSide.map((combatant) => {
                    if (!combatant?.isPlayer) {
                        return combatant;
                    }

                    let updatedItems = [...combatant.items];
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
                        ...combatant,
                        HP: Math.min(getMaxHP(combatant), combatant.HP + healing),
                        resources: Math.min(combatant.maxResources, combatant.resources + resources),
                        items: updatedItems,
                    };
                }),
            };
        },
        setNotification: (state, action: PayloadAction<Notification>) => {
            return {
                ...state,
                notification: action.payload,
            };
        },
    },
});
