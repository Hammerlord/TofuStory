import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { Ability } from "../ability/types";
import { Combatant } from "../character/types";
import createCombatant from "../enemy/createEnemy";
import { Wave } from "../Menu/tutorial";
import { shuffle } from "../utils";
import { Event } from "./types";

export interface BattleState {
    enemySide: (Combatant | null)[];
    playerSide: (Combatant | null)[];
    deck: Ability[];
    discard: Ability[];
    hand: Ability[];
    isPlayerTurn: boolean | null;
    eventQueue: Event[];
    playerActionQueue: object[];
    playerSummonsInPlay: object; // { [summonId: string]: Ability }
    charactersAttackedThisTurn: string[];
    /** How many player + enemy turns (paired/combined) have passed since the start of the wave */
    round: number;
    waves: Wave[];
    currentWave: number;
    isEnded: boolean;
}

/**
 * Redux reducer slice for battles
 */
export const battleStateSlice = createSlice({
    name: "battle",
    initialState: null,
    reducers: {
        onWaveClear: (state) => {
            const { presetDeck, description, enemies } = state.waves[state.currentWave - 1] || {}; // 1 indexed currentWave
            if (!enemies) {
            }

            return {
                ...state,
                currentWave: state.currentWave + 1,
                enemySide: enemies.map(createCombatant),
                deck: presetDeck ? shuffle(presetDeck.slice()) : state.deck,
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
            state.eventQueue.unshift();
        },
        onDrawCards: (state, action) => {
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
        endTurn: (state) => {
            state.isPlayerTurn = !state.isPlayerTurn;
        },
        closeBattle: () => {
            return null;
        },
    },
});

export const { onDrawCards } = battleStateSlice.actions;
