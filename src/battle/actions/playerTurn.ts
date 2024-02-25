import uuid from "uuid";
import { getAbilityUpgradedFromEffects } from "../../ability/AbilityView/utils";
import { CombatAbility, EFFECT_EVENT_KEYS } from "../../ability/types";
import { Combatant, Player } from "../../character/types";
import { CARD_DEPLETED_PLAYBACK_SPEED, MAX_HAND_SIZE } from "../constants";
import { battleStateSlice } from "../reducer";
import { BATTLEFIELD_SIDES, Event } from "../types";
import { clearTurnHistory, getEnabledEffects, updateCharacters } from "../utils";
import { checkEventTrigger, findCombatantData, onEndTurnTriggers, useAbility } from "./actions";
import { drawCards, recalculateEffectsFromAbilities } from "./cardActions";
import { checkHalveArmor } from "./checkHalveArmor";
import { checkTurnResourceGain } from "./checkTurnResourceGain";

const { updateBattle, pushEventQueue } = battleStateSlice.actions;

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

        const actor = playerSide.find((c: Combatant | null) => c?.isPlayer);
        const ability: CombatAbility = hand.find(({ instanceId }) => instanceId === selectedAbilityId);
        dispatch(removeAbilityFromHand(selectedAbilityId));

        dispatch(
            useAbility({
                ability,
                selectedIndex: selectedTargetIndex,
                side: selectedTargetSide,
                actorId: actor?.id,
            })
        );

        // Do this AFTER the ability has been played, or buffs that you would expect to have effect, eg. ephemeral Greater Bolt, won't apply
        dispatch(recalculateEffectsFromAbilities());
    };
};

const removeAbilityFromHand = (abilityId: string) => {
    return (dispatch, getState) => {
        const { hand: originalHand } = getState().battle;
        const handWithAbilityUsed: CombatAbility[] = originalHand.slice();
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

const handleDiscard = (ability: CombatAbility) => {
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

        if (depletedOnUse) {
            dispatch(
                pushEventQueue({
                    ...getState().battle,
                    id: uuid.v4(),
                    playbackTime: CARD_DEPLETED_PLAYBACK_SPEED,
                    newCards: [ability],
                    cardsAddedTo: "deplete",
                } as Event)
            );
        }

        dispatch(
            updateBattle({
                hand: newHand.map((card: CombatAbility) => {
                    if (card.onAbilityUse) {
                        return {
                            ...card,
                            effects: [...card.effects, { ...card.onAbilityUse }],
                        };
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
        const ability = findCombatantData(getState, actorId)?.combatant?.abilities[0];
        if (!ability) {
            return;
        }

        dispatch(
            useAbility({
                selectedIndex,
                side: BATTLEFIELD_SIDES.ENEMY_SIDE,
                ability,
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

export const prepareForDiscard = (cards: CombatAbility[]): CombatAbility[] => {
    return cards
        .filter((ability) => !ability.removeAfterTurn)
        .map((hand) => ({
            ...hand,
            effects: undefined,
        }));
};
