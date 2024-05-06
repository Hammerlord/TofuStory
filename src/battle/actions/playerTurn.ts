import uuid from "uuid";
import { AbilityEffect, CARD_PILE_TYPES, CombatAbility, EFFECT_EVENT_KEYS } from "../../ability/types";
import { Combatant, Player } from "../../character/types";
import { CARD_DEPLETED_PLAYBACK_SPEED } from "../constants";
import { battleStateSlice } from "../reducer";
import { BATTLEFIELD_SIDES, Event, TRIGGER_SOURCE_TYPES } from "../types";
import { clearTurnHistory, getCardByInstanceId, getEnabledEffects, getMaxResources, updateCharacters } from "../utils";
import { checkEventTrigger, findCombatantData, handleDoTs, onEndTurnTriggers, tickDownStatusEffects, useAbility } from "./actions";
import { applyAbilityEventEffects, drawCards, recalculateEffectsFromAbilities } from "./cardActions";
import { checkHalveArmor } from "./checkHalveArmor";
import { checkTurnResourceGain } from "./checkTurnResourceGain";

const { updateBattle, pushEventQueue } = battleStateSlice.actions;

export const useHandAbility = ({
    selectedTargetIndex,
    selectedTargetSide,
    selectedAbilityId,
}: {
    selectedTargetIndex: number;
    selectedTargetSide: BATTLEFIELD_SIDES;
    selectedAbilityId: string;
}) => {
    return (dispatch, getState) => {
        const { hand } = getState().battle;

        // Why not just pass ability object from BattleView instead of performing a lookup again?
        const ability: CombatAbility = getCardByInstanceId(hand, selectedAbilityId);
        const isReusable = ability.reusable || ability.effects?.some((effect) => effect.reusable);
        if (isReusable) {
            // Reusable cards are not discarded when used. They used to be re-appended to the end of the hand, but the position change throws players off.
            dispatch(
                updateBattle({
                    hand: hand.map((card: CombatAbility) => {
                        if (card.instanceId === selectedAbilityId) {
                            card = applyAbilityEventEffects({
                                event: card.onUse,
                                ability: card,
                            });
                            return {
                                ...card,
                                effects: (card.effects || []).filter((effect: AbilityEffect) => {
                                    // Do not keep any resource cost change or players can reuse the ability indefinitely
                                    return !effect.resourceCost;
                                }),
                            };
                        }
                        return card;
                    }),
                })
            );
        } else {
            dispatch(removeAbilityFromHand(selectedAbilityId));
        }

        dispatch(usePlayerAbility({ selectedTargetIndex, selectedTargetSide, ability }));
    };
};

export const usePlayerAbility = ({
    selectedTargetIndex,
    selectedTargetSide,
    ability,
}: {
    selectedTargetIndex?: number;
    selectedTargetSide?: BATTLEFIELD_SIDES;
    ability: CombatAbility;
}) => {
    return (dispatch, getState) => {
        const { playerSide } = getState().battle;
        const actor = playerSide.find((c: Combatant | null) => c?.isPlayer);

        dispatch(
            useAbility({
                ability,
                selectedIndex: selectedTargetIndex,
                side: selectedTargetSide,
                actorId: actor?.id,
            })
        );

        const { hostile = [], friendly = [] } = findCombatantData(getState, actor.id) || {};
        hostile.concat(friendly).forEach((combatant) => {
            if (combatant) {
                dispatch(
                    checkEventTrigger({
                        combatantId: combatant.id,
                        effectEventKey: EFFECT_EVENT_KEYS.onPlayCard,
                        source: {
                            type: TRIGGER_SOURCE_TYPES.ABILITY,
                            source: ability,
                            actorId: actor.id,
                            triggerHistory: [],
                            isProc: false,
                        },
                    })
                );
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

export const handleDiscard = (ability: CombatAbility) => {
    return (dispatch, getState) => {
        const { removeAfterTurn, depletedOnUse, minion } = ability;

        const { discard, depleted } = getState().battle;
        const newDiscard = discard.slice();
        const newDepleted = depleted.slice();
        if (depletedOnUse) {
            newDepleted.push(ability);
        } else if (!minion && !removeAfterTurn) {
            // Minions go into a special bucket rather than immediately to discard; see useAbility
            const discarded = prepareForDiscard([ability]).map((card) => {
                return applyAbilityEventEffects({
                    event: card.onUse,
                    ability: card,
                });
            });

            newDiscard.unshift(...discarded);
        }

        if (depletedOnUse) {
            dispatch(
                pushEventQueue({
                    ...getState().battle,
                    id: uuid.v4(),
                    playbackTime: CARD_DEPLETED_PLAYBACK_SPEED,
                    newCards: [ability],
                    cardsAddedTo: CARD_PILE_TYPES.DEPLETED,
                } as Event)
            );
        }

        dispatch(
            updateBattle({
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
        dispatch(onEndTurnTriggers({ combatants: getState().battle.playerSide, side: BATTLEFIELD_SIDES.PLAYER_SIDE }));
        const playerSide = getState().battle.playerSide; // Grabbing playerSide state AFTER onEndTurnTriggers have played out
        dispatch(
            updateBattle({
                playerSide: playerSide.map((combatant) => {
                    if (!combatant) {
                        return combatant;
                    }

                    const { resources = 0 } = combatant;
                    const maxResources = getMaxResources(combatant);
                    if (resources > maxResources) {
                        return {
                            ...combatant,
                            resources: maxResources,
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

        const combatantIds = playerSide.map((combatant) => combatant?.id).filter((v) => v);
        dispatch(handleDoTs({ combatantIds, side: BATTLEFIELD_SIDES.PLAYER_SIDE }));

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
                dispatch(checkEventTrigger({ combatantId: combatant.id, effectEventKey: EFFECT_EVENT_KEYS.onTurnDraw }));
            }
        });
    };
};

export const initiatePlayerTurnInProgress = () => {
    return (dispatch, getState) => {
        const { playerSide } = getState().battle;

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
