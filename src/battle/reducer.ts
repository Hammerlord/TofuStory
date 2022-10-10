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
    flagTurnEnd: boolean; // Signals intention to end the turn (to be applied at the end of animations)
    isPlayerTurn: boolean | null;
    eventQueue: Event[];
    playerActionQueue: object[];
    playerSummonsInPlay: object; // { [summonId: string]: Ability }
    charactersAttackedThisTurn: string[];
    /** How many player + enemy turns (paired/combined) have passed since the start of the wave */
    round: number;
    waves: Wave[];
    currentWaveIndex: number;
    isEnded: boolean; // Actually the victory state
    /** When interacting with cards in your hand, or discovering a card */
    selectCardsPrompt: PlayerSelectCardsPrompt | null;
    isLost: boolean;
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
        updateFlagTurnEnd: (state, action: PayloadAction<boolean>) => {
            return {
                ...state,
                flagTurnEnd: action.payload,
            };
        },
    },
});

export const { drawCards } = battleStateSlice.actions;
