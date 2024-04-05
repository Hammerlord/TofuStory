import uuid from "uuid";
import { getAbilityUpgradedFromEffects } from "../../ability/AbilityView/utils";
import { AbilityEffect, CombatAbility, EFFECT_EVENT_KEYS, EFFECT_TYPES } from "../../ability/types";
import { Combatant, Player } from "../../character/types";
import { CARD_DEPLETED_PLAYBACK_SPEED, MAX_HAND_SIZE } from "../constants";
import { battleStateSlice } from "../reducer";
import { BATTLEFIELD_SIDES, Event, TRIGGER_SOURCE_TYPES } from "../types";
import { clearTurnHistory, getEnabledEffects, updateCharacters } from "../utils";
import { checkEventTrigger, findCombatantData, handleDoTs, onEndTurnTriggers, useAbility } from "./actions";
import { applyAbilityEventEffects, drawCards, recalculateEffectsFromAbilities } from "./cardActions";
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
        if (ability?.reusable) {
            // Reusable cards are not discarded when used. They used to be re-appended to the end of the hand, but the position change throws players off.
            dispatch(
                updateBattle({
                    hand: hand.map((card: CombatAbility) => {
                        if (card.instanceId === selectedAbilityId) {
                            return {
                                ...card,
                                effects: (card.effects || []).filter((effect: AbilityEffect) => {
                                    // Do not keep any resource cost change or players can reuse the ability indefinitely
                                    return !effect.resourceCost;
                                }),
                            };
                        }
                        return applyAbilityEventEffects({
                            event: card.onAbilityUse,
                            ability: card,
                            source: { source: ability, type: TRIGGER_SOURCE_TYPES.ABILITY, triggerHistory: [] },
                        });
                    }),
                })
            );
        } else {
            dispatch(removeAbilityFromHand(selectedAbilityId));
        }

        dispatch(
            useAbility({
                ability,
                selectedIndex: selectedTargetIndex,
                side: selectedTargetSide,
                actorId: actor?.id,
            })
        );

        hand.forEach((card: CombatAbility) => {
            if (card.onAbilityUse?.ability) {
                dispatch(useAbility({ ability: card.onAbilityUse.ability, actorId: actor?.id, isProc: true }));
            }
        });

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
        const { removeAfterTurn, depletedOnUse, minion } = ability;

        const { hand, discard, depleted } = getState().battle;
        const newDiscard = discard.slice();
        const newHand = hand.slice();
        const newDepleted = depleted.slice();
        if (depletedOnUse) {
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
                    return applyAbilityEventEffects({
                        event: card.onAbilityUse,
                        ability: card,
                        source: { source: ability, type: TRIGGER_SOURCE_TYPES.ABILITY, triggerHistory: [] },
                    });
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
        dispatch(onEndTurnTriggers(getState().battle.playerSide));
        const playerSide = getState().battle.playerSide; // Grabbing playerSide state AFTER onEndTurnTriggers have played out
        dispatch(
            updateBattle({
                playerSide: playerSide.map((combatant) => {
                    if (combatant?.resources > combatant?.maxResources) {
                        return {
                            ...combatant,
                            resources: combatant.maxResources,
                        };
                    }
                    return combatant;
                }),
            })
        );

        setTimeout(() => {
            const { discard, hand } = getState().battle;
            dispatch(
                updateBattle({
                    discard: [...prepareForDiscard(hand), ...discard],
                    hand: [],
                })
            );
        }, 500);
    };
};

export const startPlayerTurn = (isNewWave: boolean) => {
    return (dispatch, getState) => {
        const { playerSide, round, hand } = getState().battle;
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

        // If it's a new wave, draw only to the drawCardsPerTurn maximum. We have kept the cards from the previous wave for this.
        const drawCardsAmount = isNewWave ? drawCardsPerTurn - hand.length : drawCardsPerTurn;
        dispatch(
            drawCards({
                amount: drawCardsAmount,
            })
        );

        playerSide.forEach((combatant: Combatant | null) => {
            if (combatant) {
                dispatch(checkEventTrigger({ combatantId: combatant.id, effectEventKey: EFFECT_EVENT_KEYS.onTurnInProgress }));
            }
        });
    };
};

export const prepareForDiscard = (cards: CombatAbility[]) => {
    return cards
        .filter((ability: CombatAbility) => !ability.removeAfterTurn)
        .map((ability: CombatAbility) => {
            return applyAbilityEventEffects({
                event: ability.onLeaveHand,
                ability: {
                    ...ability,
                    effects: (ability.effects || []).filter((e) => {
                        const { removeOnDiscard = true } = e;
                        return !removeOnDiscard;
                    }),
                },
            });
        });
};
