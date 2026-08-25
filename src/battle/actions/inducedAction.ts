import { isAttackAbility, isOffensiveAbility } from "../../ability/AbilityView/utils";
import { ACTION_TYPES, Ability, Action, TARGET_TYPES } from "../../ability/types";
import { Combatant } from "../../character/types";
import { CrossedSwordsImage } from "../../images";
import { shuffle } from "../../utils";
import { INDUCED_ACTION_PLAYBACK_SPEED } from "../constants";
import { passesConditions } from "../passesConditions";
import { TRIGGER_SOURCE_TYPES } from "../types";
import { isStunnedOrFrozen } from "../utils";
import { TRIGGER_TARGET_TYPES } from "./../../ability/types";
import { ActionContext } from "./../types";
import { findCombatantData } from "./combatantData";
import { performAction } from "./performAction";
import { autoSelectActionTarget } from "./targeting/targeting";
import { onUseAbility, useAbility } from "./useAbility";

/**
 * Handle the induceCombatantAttack property of an action (tells minions to attack randomly)
 */
export const checkInduce = ({
    action,
    affectedTargetIds,
    parentContext,
}: {
    action: Action;
    affectedTargetIds: string[];
    parentContext: ActionContext;
}) => {
    return (dispatch, getState) => {
        const { induceCombatant, induceCombatantAttack } = action;
        if (induceCombatant) {
            const { mode, action: actions } = induceCombatant;

            const handleInduceAction = (action) => {
                if (mode === "random") {
                    affectedTargetIds = shuffle(affectedTargetIds);
                } else if (mode === "right-to-left") {
                    affectedTargetIds = affectedTargetIds.slice().reverse();
                }

                affectedTargetIds.forEach((id) => {
                    const combatantData = findCombatantData(getState().battle, id);
                    if (!combatantData) {
                        return;
                    }

                    const combatant = combatantData.combatant;

                    const getCalculationTarget = (type) => {
                        if (type === TRIGGER_TARGET_TYPES.ACTOR) {
                            return combatantData;
                        }
                    };
                    if (
                        !combatant.HP ||
                        isStunnedOrFrozen(combatant) ||
                        !passesConditions({ getCalculationTarget, proc: action, context: parentContext })
                    ) {
                        return;
                    }

                    const { index: initialIndex, side: initialSide } = combatant?.targeting?.actionTargets?.[0] || {};

                    const { index, side } = autoSelectActionTarget({
                        action,
                        actorId: id,
                        initialSelectedIndex: initialIndex,
                        initialSelectedSide: initialSide,
                        battle: getState().battle,
                    });

                    if (typeof index === "number") {
                        dispatch(
                            performAction({
                                action,
                                actorId: id,
                                parentContext,
                                selectedIndex: index,
                                side,
                            })
                        );

                        const context: ActionContext = {
                            ...parentContext,
                            sourceChain: [
                                ...(parentContext?.sourceChain || []),
                                { actorId: id, source: action, type: TRIGGER_SOURCE_TYPES.ACTION },
                            ],
                        };
                        dispatch(
                            onUseAbility({
                                actorInfo: findCombatantData(getState().battle, id),
                                context,
                                ability: {
                                    name: "Induced Ability",
                                    actions: [action],
                                },
                            })
                        );
                    }
                });
            };

            if (Array.isArray(actions)) {
                actions.forEach(handleInduceAction);
            } else if (actions) {
                handleInduceAction(actions);
            }
        }

        if (induceCombatantAttack) {
            shuffle(affectedTargetIds).forEach((id) => {
                const { combatant } = findCombatantData(getState().battle, id) || {};
                if (!combatant.HP || isStunnedOrFrozen(combatant)) {
                    return;
                }

                const attackAbility: Ability = getInducedAttack(combatant);

                dispatch(
                    useAbility({
                        ability: attackAbility,
                        actorId: id,
                        isProc: true,
                        playbackCollector: parentContext?.playbackCollector,
                    })
                );
            });
        }
    };
};

export const getInducedAttack = (actor: Combatant): Ability => {
    const abilities = actor.abilities || [];
    const attackAbility =
        abilities.find((ability) => !ability.resourceCost && isAttackAbility(ability)) ||
        abilities.find((ability) => !ability.resourceCost && isOffensiveAbility);

    if (attackAbility) {
        return { ...attackAbility, actions: attackAbility.actions.map((a) => ({ ...a, playbackTime: INDUCED_ACTION_PLAYBACK_SPEED })) };
    }

    let basicAttackDamage = 0;

    for (const ability of abilities) {
        if (!ability.resourceCost) {
            for (const action of ability.actions) {
                if (action.damage) {
                    basicAttackDamage = action.damage;
                    break;
                }
            }
        }
    }

    return {
        name: "Attack",
        image: CrossedSwordsImage,
        actions: [
            {
                damage: basicAttackDamage || 1,
                target: TARGET_TYPES.HOSTILE,
                type: ACTION_TYPES.ATTACK,
                playbackTime: INDUCED_ACTION_PLAYBACK_SPEED,
            },
        ],
    };
};
