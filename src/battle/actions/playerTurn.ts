import { EFFECT_EVENT_KEYS, HandAbility } from "../../ability/types";
import { Combatant, Player } from "../../character/types";
import { MAX_HAND_SIZE } from "../constants";
import { battleStateSlice } from "../reducer";
import { BATTLEFIELD_SIDES } from "../types";
import { clearTurnHistory, getEnabledEffects, updateCardEffects, updateCharacters } from "../utils";
import { checkEventTrigger, drawCards, findCombatantData, onEndTurnTriggers, recalculateEffectsFromAbilities, useAbility } from "./actions";
import { checkHalveArmor } from "./checkHalveArmor";
import { checkTurnResourceGain } from "./checkTurnResourceGain";

const { updateBattle } = battleStateSlice.actions;

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
        dispatch(
            useAbility({
                ability,
                selectedIndex: selectedTargetIndex,
                side: selectedTargetSide,
                actorId: playerSide.find((c: Combatant | null) => c?.isPlayer).id,
            })
        );

        // Some cards grant an effect when you hold them, so only remove it after the ability has been used
        dispatch(removeAbilityFromHand(selectedAbilityId));
        dispatch(recalculateEffectsFromAbilities());
    };
};

const removeAbilityFromHand = (abilityId: string) => {
    return (dispatch, getState) => {
        const { hand: originalHand } = getState().battle;
        const handWithAbilityUsed: HandAbility[] = originalHand.slice();
        const index = handWithAbilityUsed.findIndex(({ instanceId }) => abilityId === instanceId);
        if (index === -1) {
            return;
        }

        const [ability] = handWithAbilityUsed.splice(index, 1);
        if (!ability) {
            return;
        }

        dispatch(
            updateBattle({
                hand: handWithAbilityUsed,
            })
        );

        // Order matters; we don't want to allow card draws to be able to draw itself from the discard pile
        // This is only a bandaid though since there's nothing stopping you from taking multiple card draw abilities (eg. Dash) that can draw each other
        dispatch(handleDiscard(ability));
    };
};

const handleDiscard = (ability: HandAbility) => {
    return (dispatch, getState) => {
        const { removeAfterTurn, reusable, depletedOnUse, minion } = ability;

        const { hand, discard, depleted } = getState().battle;
        const newDiscard = discard.slice();
        const newHand = hand.slice();
        const newDepleted = depleted.slice();
        if (reusable) {
            newHand.push({
                ...ability,
                effects: undefined,
            });
        } else if (depletedOnUse) {
            newDepleted.push(ability);
        } else if (!minion && !removeAfterTurn) {
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
                depleted: newDepleted,
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
                ability: findCombatantData(getState, actorId)?.combatant?.abilities[0],
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
                    discard: [...prepareForDiscard(hand), ...discard],
                    hand: [],
                })
            );
        }, 1000);
    };
};

export const startPlayerTurn = () => {
    return (dispatch, getState) => {
        const { playerSide, enemySide, round } = getState().battle;
        dispatch(
            updateBattle({
                round: round + 1,
                charactersAttackedThisTurn: [],
                playerSide: updateCharacters(playerSide, clearTurnHistory),
            })
        );

        const getPlayerSideInfo = () => getState().battle.playerSide.map((combatant) => findCombatantData(getState, combatant?.id));

        if (round > 0) {
            dispatch(checkHalveArmor(getPlayerSideInfo()));
        }

        dispatch(checkTurnResourceGain(getPlayerSideInfo()));

        playerSide.forEach((combatant: Combatant | null) => {
            if (combatant) {
                dispatch(checkEventTrigger({ combatantId: combatant.id, effectEventKey: EFFECT_EVENT_KEYS.onTurnStart }));
            }
        });

        // Drawing cards last so that eg. drawing Zap (stun) can benefit from Star Earrings (draw a card on CC).
        // Maybe I'll regret this ordering for some other reason later.
        const { battle } = getState();
        const player: Player = battle.playerSide.find((c: Combatant | null) => c?.isPlayer);
        const drawCardsPerTurn = getEnabledEffects({ combatantInfo: findCombatantData(getState, player?.id) }).reduce(
            (acc, { drawCardsPerTurn = 0 }) => acc + drawCardsPerTurn,
            player.drawCardsPerTurn
        );

        dispatch(
            drawCards({
                amount: Math.min(MAX_HAND_SIZE - battle.hand.length, drawCardsPerTurn - battle.hand.length),
            })
        );

        playerSide.forEach((combatant: Combatant | null) => {
            if (combatant) {
                dispatch(checkEventTrigger({ combatantId: combatant.id, effectEventKey: EFFECT_EVENT_KEYS.onTurnInProgress }));
            }
        });
    };
};

export const prepareForDiscard = (cards: HandAbility[]): HandAbility[] => {
    return cards
        .filter((ability) => !ability.removeAfterTurn)
        .map((hand) => ({
            ...hand,
            effects: undefined,
        }));
};
