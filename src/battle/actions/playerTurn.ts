import { compose } from "ramda";
import { EFFECT_CLASSES, EFFECT_EVENT_KEYS, HandAbility } from "../../ability/types";
import { Combatant } from "../../character/types";
import { battleStateSlice } from "../reducer";
import { BATTLEFIELD_SIDES } from "../types";
import { checkHalveArmor, clearTurnHistory, getBasicAttack, refreshResources, updateCardEffects, updateCharacters } from "../utils";
import { checkEventTrigger, findCombatant, onEndTurnTriggers, tickDownStatusEffects, useAbility } from "./actions";

const { drawCards, updateBattle } = battleStateSlice.actions;

export const onUsePlayerAbility = ({
    selectedIndex,
    side,
    selectedAbilityIndex,
}: {
    selectedIndex: number;
    side: BATTLEFIELD_SIDES;
    selectedAbilityIndex: number;
}) => {
    return (dispatch, getState) => {
        const { playerSide, hand } = getState().battle;

        const ability = hand[selectedAbilityIndex];
        dispatch(removeAbilityFromHand({ index: selectedAbilityIndex }));
        dispatch(useAbility({ ability, selectedIndex, side, actorId: playerSide.find((c: Combatant | null) => c?.isPlayer).id }));

        // Order matters; we don't want to allow card draws to be able to draw itself from the discard pile
        // This is only a bandaid though since there's nothing stopping you from taking multiple card draw abilities (eg. Dash) that can draw each other
        dispatch(handleDiscard(ability));
    };
};

const removeAbilityFromHand = ({ index }) => {
    return (dispatch, getState) => {
        const { hand: originalHand } = getState().battle;
        const handWithAbilityUsed = originalHand.slice();
        handWithAbilityUsed.splice(index, 1);

        dispatch(
            updateBattle({
                hand: handWithAbilityUsed,
            })
        );
    };
};

const handleDiscard = (ability: HandAbility) => {
    return (dispatch, getState) => {
        const { removeAfterTurn, reusable, depletedOnUse, minion } = ability;

        const { hand, discard } = getState().battle;
        const newDiscard = discard.slice();
        const newHand = hand.slice();
        if (reusable) {
            newHand.push({
                ...ability,
                effects: undefined,
            });
        } else if (!minion && !removeAfterTurn && !depletedOnUse) {
            // Minions go into a special bucket rather than immediately to discard; see useAbility
            newDiscard.push(...prepareForDiscard([ability]));
        }

        dispatch(
            updateBattle({
                hand: newHand.map((card: HandAbility) => {
                    if (card.onAbilityUse) {
                        return updateCardEffects(card, card.onAbilityUse);
                    }
                    return card;
                }),
                discard: newDiscard,
            })
        );
    };
};

export const onSummonAttack = ({ selectedIndex, actorId }: { selectedIndex: number; actorId: string }) => {
    return (dispatch, getState) => {
        dispatch(
            useAbility({
                selectedIndex,
                side: BATTLEFIELD_SIDES.ENEMY_SIDE,
                ability: getBasicAttack(findCombatant(getState, actorId)),
                actorId,
            })
        );

        dispatch(
            updateBattle({
                charactersAttackedThisTurn: [...getState().battle.charactersAttackedThisTurn, actorId],
            })
        );
    };
};

export const playerEndTurn = () => {
    return (dispatch, getState) => {
        const { playerSide, discard, hand } = getState().battle;
        dispatch(onEndTurnTriggers(playerSide));

        dispatch(
            updateBattle({
                isPlayerTurn: false,
                discard: [...discard, ...prepareForDiscard(hand)],
                hand: [],
            })
        );
    };
};

export const startPlayerTurn = () => {
    return (dispatch, getState) => {
        const { playerSide, round } = getState().battle;
        const updateFns = [refreshResources, clearTurnHistory];
        if (round > 0) {
            updateFns.push(checkHalveArmor);
        }

        const updatedPlayerSide = updateCharacters(playerSide, compose(...updateFns));
        dispatch(
            updateBattle({
                round: round + 1,
                charactersAttackedThisTurn: [],
                playerSide: updatedPlayerSide,
            })
        );

        updatedPlayerSide.forEach((combatant: Combatant | null) => {
            if (!combatant) {
                return;
            }

            dispatch(checkEventTrigger({ combatantId: combatant.id, effectEventKey: EFFECT_EVENT_KEYS.onTurnStart }));
            dispatch(tickDownStatusEffects(combatant.id, EFFECT_CLASSES.BUFF));
        });

        const { battle } = getState();
        const player = battle.playerSide.find((c: Combatant | null) => c?.isPlayer);
        dispatch(
            drawCards({
                amount: player.drawCardsPerTurn - battle.hand.length, // TODO card draw effects
            })
        );
    };
};

const prepareForDiscard = (cards: HandAbility[]): HandAbility[] => {
    return cards
        .filter((ability) => !ability.removeAfterTurn)
        .map((hand) => ({
            ...hand,
            effects: undefined,
        }));
};
