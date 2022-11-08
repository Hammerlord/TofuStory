import { compose } from "ramda";
import { EFFECT_CLASSES, EFFECT_EVENT_KEYS, HandAbility } from "../../ability/types";
import { Combatant } from "../../character/types";
import { MAX_HAND_SIZE } from "../constants";
import { battleStateSlice } from "../reducer";
import { BATTLEFIELD_SIDES } from "../types";
import { clearTurnHistory, gainResources, getBasicAttack, getEnabledEffects, updateCardEffects, updateCharacters } from "../utils";
import { checkEventTrigger, findCombatantData, onEndTurnTriggers, tickDownStatusEffects, useAbility } from "./actions";
import { checkHalveArmor } from "./checkHalveArmor";

const { drawCards, updateBattle } = battleStateSlice.actions;

export const onUsePlayerAbility = ({
    selectedTargetIndex,
    selectedTargetSide,
    selectedAbilityId,
}: {
    selectedTargetIndex: number;
    selectedTargetSide: BATTLEFIELD_SIDES;
    selectedAbilityId: string;
}) => {
    return (dispatch, getState) => {
        const { playerSide, hand } = getState().battle;

        const ability = hand.find(({ instanceId }) => instanceId === selectedAbilityId);
        dispatch(removeAbilityFromHand(selectedAbilityId));
        dispatch(
            useAbility({
                ability,
                selectedIndex: selectedTargetIndex,
                side: selectedTargetSide,
                actorId: playerSide.find((c: Combatant | null) => c?.isPlayer).id,
            })
        );

        // Order matters; we don't want to allow card draws to be able to draw itself from the discard pile
        // This is only a bandaid though since there's nothing stopping you from taking multiple card draw abilities (eg. Dash) that can draw each other
        dispatch(handleDiscard(ability));
    };
};

const removeAbilityFromHand = (abilityId: string) => {
    return (dispatch, getState) => {
        const { hand: originalHand } = getState().battle;
        const handWithAbilityUsed = originalHand.slice();
        const index = handWithAbilityUsed.findIndex(({ instanceId }) => abilityId === instanceId);
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
                ability: getBasicAttack(findCombatantData(getState, actorId)?.combatant),
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

        setTimeout(() => {
            dispatch(
                updateBattle({
                    isPlayerTurn: false,
                    discard: [...discard, ...prepareForDiscard(hand)],
                    hand: [],
                })
            );
        }, 1000);
    };
};

export const startPlayerTurn = () => {
    return (dispatch, getState) => {
        const { playerSide, round } = getState().battle;
        const updateFns = [gainResources, clearTurnHistory];
        const updatedPlayerSide = updateCharacters(playerSide, compose(...updateFns));
        dispatch(
            updateBattle({
                round: round + 1,
                charactersAttackedThisTurn: [],
                playerSide: updatedPlayerSide,
            })
        );

        if (round > 0) {
            dispatch(checkHalveArmor(playerSide));
        }

        const { battle } = getState();
        const player: Combatant = battle.playerSide.find((c: Combatant | null) => c?.isPlayer);
        const drawCardsPerTurn = getEnabledEffects({ combatant: player }).reduce(
            (acc, { drawCardsPerTurn = 0 }) => acc + drawCardsPerTurn,
            player.drawCardsPerTurn
        );

        dispatch(
            drawCards({
                amount: Math.min(MAX_HAND_SIZE - battle.hand.length, drawCardsPerTurn - battle.hand.length), // TODO card draw effects
            })
        );

        updatedPlayerSide.forEach((combatant: Combatant | null) => {
            if (!combatant) {
                return;
            }

            dispatch(checkEventTrigger({ combatantId: combatant.id, effectEventKey: EFFECT_EVENT_KEYS.onTurnStart }));
            dispatch(tickDownStatusEffects(combatant.id, EFFECT_CLASSES.BUFF));
        });
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
