import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { ReactElement } from "react";
import { Ability, CombatAbility, SelectCards } from "../ability/types";
import { Combatant } from "../character/types";
import { Item } from "../item/types";
import { BATTLE_TYPES, BATTLEFIELD_SIDES, EventGroup, TriggerSource, Wave } from "./types";
import { getMaxHP } from "./utils";
import { battleWarnings, MAX_HAND_SIZE } from "./constants";
import * as uuid from "uuid";
import { prepareForDiscard } from "./actions/cardActions/utils";

// Text banner notification to display some info during battle
interface Notification {
    severity?: "warning";
    text: string | ReactElement;
    id: string; // UUID
}

export interface BattleStatistics {
    totalDamage: number;
    damageByEnemyName: {
        [enemyName: string]: number;
    };
    totalKills: number;
}

export interface BattleState {
    enemySide: (Combatant | null)[];
    playerSide: (Combatant | null)[];
    deck: CombatAbility[];
    discard: CombatAbility[];
    hand: CombatAbility[];
    depleted: CombatAbility[];
    isPlayerTurn: boolean | null;
    eventQueue: EventGroup[];
    playerActionQueue: object[];
    charactersAttackedThisTurn: string[];
    /** How many player + enemy turns (paired/combined) have passed since the start of the wave */
    round: number;
    waves: Wave[];
    currentWaveIndex: number;
    /** When interacting with cards in your hand, or discovering a card */
    selectCardsPrompt: PlayerSelectCardsPrompt | null;
    state: BATTLE_STATES;
    backgroundImage?: string; // Path to background image
    backgroundMusic?: string; // 'boss' or path to music URL
    type: BATTLE_TYPES; // Determines the rewards at the end of battle
    itemRewards?: Item[];
    overrideItemChoices?: Item[];
    cardRewards?: Ability[];
    disableCardRewards?: boolean;
    disableItemRewards?: boolean;
    notification?: Notification;
    statistics: BattleStatistics;
    isTutorial?: boolean;
    addAbilities: CombatAbility[];
    deckCycled?: boolean;
    selectedHandAbilityId?: string | null;
    selectedAllyId?: string | null;
}

// TODO add what card triggered this prompt and pass it into applyAbilityEventEffects for condition check
export interface PlayerSelectCardsPrompt {
    selectCards: SelectCards;
    source?: TriggerSource;
    isAutoCast?: boolean;
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
    TURN_STARTING = "turn-starting",
    TURN_IN_PROGRESS = "turn-in-progress",
    TURN_END = "turn-end",
    TURN_ENDING = "turn-ending",
    WAVE_END = "wave-end",
    VICTORY = "victory",
    DEFEAT = "defeat",
}

// Partially to address a weird bug where abilities were duplicated in the hand for some reason
function dedupeByInstanceId(pile: CombatAbility[]) {
    const seen = new Set<string>();

    return pile.filter((ability) => {
        if (seen.has(ability.instanceId)) {
            return false;
        }

        seen.add(ability.instanceId);
        return true;
    });
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
        pushEventQueue: (state, action: PayloadAction<EventGroup | EventGroup[]>) => {
            let payload = action.payload;
            if (!Array.isArray(payload)) {
                payload = [payload];
            }
            state.eventQueue.push(...payload);
        },
        popEventQueue: (state) => {
            if (state?.eventQueue) {
                state.eventQueue.shift();
            }
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

            // If the wave is over due to end of turn effects like DoTs or Charged Bolt, don't proceed to the enemy's turn
            if (state.state === BATTLE_STATES.WAVE_END && action.payload === BATTLE_STATES.TURN_ENDING) {
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
        selectHandAbility: (state, action: PayloadAction<string | null>) => {
            return {
                ...state,
                selectedAllyId: null,
                selectedHandAbilityId: action.payload,
            };
        },
        selectAlly: (state, action: PayloadAction<string | null>) => {
            return {
                ...state,
                selectedAllyId: action.payload,
                selectedHandAbilityId: null,
            };
        },
        addCardsToHand: (state: BattleState, action: PayloadAction<CombatAbility[]>) => {
            const newCards = action.payload.slice().map((card) => ({ ...card, instanceId: card.instanceId || uuid.v4() }));
            let newHand: CombatAbility[] = dedupeByInstanceId([...newCards, ...state.hand]);
            const newDiscard = state.discard.slice();

            if (newHand.length >= MAX_HAND_SIZE) {
                const toDiscard = newHand.slice(MAX_HAND_SIZE);
                newHand = newHand.slice(0, MAX_HAND_SIZE);
                newDiscard.unshift(...prepareForDiscard(toDiscard));

                return {
                    ...state,
                    hand: newHand,
                    notification: { text: battleWarnings.handFull, severity: "warning", id: uuid.v4() },
                    discard: dedupeByInstanceId(newDiscard),
                };
            }

            return {
                ...state,
                hand: newHand,
            };
        },
    },
});
