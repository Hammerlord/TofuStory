import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { HandAbility, SelectCards } from "../ability/types";
import { Combatant } from "../character/types";
import { shuffle } from "../utils";
import { BATTLEFIELD_SIDES, Event, Wave } from "./types";

export interface BattleState {
    enemySide: (Combatant | null)[];
    playerSide: (Combatant | null)[];
    deck: HandAbility[];
    discard: HandAbility[];
    hand: HandAbility[];
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
    backgroundMusic?: "boss" | string; // 'boss' or path to music URL
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
    WAVE_START = "wave-start",
    TURN_START = "turn-start",
    TURN_IN_PROGRESS = "turn-in-progress",
    TURN_END = "turn-end",
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
        drawCards: (state, action: PayloadAction<{ effects?: object; amount: number }>) => {
            const { deck, hand, discard } = state;
            let newDeck = deck.slice();
            let newHand = hand.slice();
            let newDiscard = discard.slice();
            const { effects = {}, amount } = action.payload;
            const cardsToDraw = [];
            if (newDeck.length < amount) {
                cardsToDraw.push(...newDeck.slice());
                newDeck = shuffle(discard);
                newDiscard = [];
                cardsToDraw.push(...newDeck.splice(0, amount - cardsToDraw.length));
            } else {
                cardsToDraw.push(...newDeck.splice(0, amount));
            }

            return {
                ...state,
                deck: newDeck,
                hand: [
                    ...newHand,
                    ...cardsToDraw.map((card) => ({
                        ...card,
                        effects: { ...effects },
                    })),
                ],
                discard: newDiscard,
            };
        },
        closeBattle: () => {
            return null;
        },
        updateBattleState: (state, action: PayloadAction<BATTLE_STATES>) => {
            // If the fight is over, don't overwrite the state
            if ([BATTLE_STATES.VICTORY, BATTLE_STATES.DEFEAT].includes(state.state)) {
                return state;
            }
            return {
                ...state,
                state: action.payload,
            };
        },
    },
});

export const { drawCards } = battleStateSlice.actions;
