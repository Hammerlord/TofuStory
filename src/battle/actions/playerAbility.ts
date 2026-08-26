import { Ability, AbilityEffect, CombatAbility, EFFECT_EVENT_KEYS } from "../../ability/types";
import { Combatant, Player } from "../../character/types";
import { BASE_MAX_RESOURCES } from "../constants";
import { battleStateSlice } from "../reducer";
import { ActionContext, BATTLEFIELD_SIDES, CombatantInfo, TRIGGER_SOURCE_TYPES } from "../types";
import { getHandAuraEffects } from "../view/Hand";
import { handleDiscardAfterUse } from "./cardActions/discardCards";
import { applyAbilityEventEffects, recalculateEffectsFromAbilities } from "./cardActions/drawCards";
import { findCombatantData } from "./combatantData";
import { playbackCollector } from "./playbackCollector";
import { checkEventTrigger } from "./statusEffect/triggerEffectEvent";
import { checkValidEnemyNextAbility, checkValidEnemyTargeting } from "./targeting/enemyTargeting";
import { calculateActionArea } from "./targeting/targeting";
import { useAbility } from "./useAbility";

const { updateBattle, pushEventQueue, selectHandAbility } = battleStateSlice.actions;

export const isWithinPlayerAbilityArea = ({
    ability,
    actor,
    selectedIndex,
    targetIndex,
}: {
    ability: Ability;
    actor: CombatantInfo;
    selectedIndex: number;
    targetIndex: number;
}): boolean => {
    if (!ability) {
        return false;
    }
    if ([selectedIndex, targetIndex].some((i) => typeof i !== "number")) {
        return false;
    }
    const action = ability.actions[0];
    const context: ActionContext = { sourceChain: [{ source: ability, type: TRIGGER_SOURCE_TYPES.ABILITY }] };
    const area = calculateActionArea({ action, actor, context }) || action?.area || 0;
    return Math.abs(selectedIndex - targetIndex) <= area;
};

/** Returns a card with aura effects applied, if any. */
export const getCardByInstanceId = (hand: CombatAbility[], id: string | null): CombatAbility | undefined => {
    if (!id) {
        return;
    }

    const handAuraEffects = getHandAuraEffects(hand);
    // With hand aura effects applied
    const abilityIndex = hand.findIndex(({ instanceId }) => instanceId === id);
    const ability = hand[abilityIndex];
    if (!ability) {
        return;
    }
    return {
        ...ability,
        effects: [...(ability.effects || []), ...(handAuraEffects[abilityIndex] || [])],
    };
};

export const getPlayerAbilityResourceCost = ({
    combatant,
    effects = [],
    resourceCost = 0,
}: {
    combatant?: Combatant | Player;
    effects: AbilityEffect[];
    resourceCost: number | "x";
}) => {
    if (resourceCost === "x") {
        return combatant?.resources || 0;
    }
    const resourceCostFromEffects = effects.reduce((acc, e: AbilityEffect) => {
        return acc + (e.resourceCost || 0);
    }, 0);

    return Math.max(0, resourceCost + resourceCostFromEffects);
};

export const canUsePlayerAbility = (player: Player, ability: CombatAbility | undefined): boolean => {
    const isUnplayable = ability.unplayable && !ability.effects?.some((e) => e.bypassUnplayable);
    if (!player || !ability || isUnplayable || ability.effects?.some((e) => e.isLocked)) {
        return false;
    }

    const { resourceCost = 0, effects = [] } = ability;
    if (resourceCost === "x") {
        return player.resources > 0;
    }

    const resourceCostFromEffects = effects.reduce((acc, e: AbilityEffect) => {
        return acc + (e.resourceCost || 0);
    }, 0);
    return resourceCost + resourceCostFromEffects <= (player.resources || 0);
};

// We're just going to assume max resource effects always take hold (does not need to pass conditions and cannot be silenced)
// There is only one example of max resource increase, and it is for the player character only:
/** @see emerald */
export const getMaxResources = (character: Combatant): number => {
    if (!character) {
        return 0;
    }
    const { maxResources: initMaxResources = BASE_MAX_RESOURCES, effects = [] } = character;
    return effects.reduce((acc, effect) => acc + (effect?.maxResources || 0), initMaxResources);
};

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
        dispatch(selectHandAbility(null));
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
    isProc,
}: {
    selectedTargetIndex?: number;
    selectedTargetSide?: BATTLEFIELD_SIDES;
    ability: CombatAbility;
    isProc?: boolean;
}) => {
    return (dispatch, getState) => {
        const { playerSide } = getState().battle;
        const actor = playerSide.find((c: Combatant | null) => c?.isPlayer);
        const playbackCollectorInstance = playbackCollector();

        dispatch(
            useAbility({
                ability,
                selectedIndex: selectedTargetIndex,
                side: selectedTargetSide,
                actorId: actor?.id,
                isProc,
                context: { playbackCollector: playbackCollectorInstance },
            })
        );

        const { hostile = [], friendly = [] } = findCombatantData(getState().battle, actor.id) || {};
        hostile.concat(friendly).forEach((combatant) => {
            if (combatant) {
                dispatch(
                    checkEventTrigger({
                        combatantId: combatant.id,
                        effectEventKey: EFFECT_EVENT_KEYS.onPlayCard,
                        context: {
                            triggerHistory: [],
                            sourceChain: [
                                {
                                    type: TRIGGER_SOURCE_TYPES.ABILITY,
                                    source: ability,
                                    actorId: actor.id,
                                    isProc,
                                },
                            ],
                            isProc,
                            playbackCollector: playbackCollectorInstance,
                        },
                    })
                );
            }
        });

        // Do this AFTER the ability has been played, or buffs that you would expect to have effect, eg. ephemeral Greater Bolt, won't apply
        dispatch(recalculateEffectsFromAbilities());
        dispatch(checkValidEnemyNextAbility());
        dispatch(checkValidEnemyTargeting());
        dispatch(pushEventQueue(playbackCollectorInstance.get()));
    };
};

export const removeAbilityFromHand = (abilityId: string) => {
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
        dispatch(handleDiscardAfterUse(ability));
    };
};
