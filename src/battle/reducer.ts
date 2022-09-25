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
    flagTurnEnd: boolean; // Signals intention to end the turn (to be applied at the end of animations)
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
    /** When interacting with cards in your hand, or discovering a card */
    selectCards: object | null;
}

/**
 * Redux reducer slice for battles
 */
export const battleStateSlice = createSlice({
    name: "battle",
    initialState: null,
    reducers: {
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
        updateFlagTurnEnd: (state, action: PayloadAction<boolean>) => {
            return {
                ...state,
                flagTurnEnd: action.payload,
            };
        },
    },
});

export const { drawCards } = battleStateSlice.actions;
