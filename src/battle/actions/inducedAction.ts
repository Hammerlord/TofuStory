import { isAttackAbility, isOffensiveAbility } from "../../ability/AbilityView/utils";
import { ACTION_TYPES, Ability, Action, TARGET_TYPES } from "../../ability/types";
import { Combatant } from "../../character/types";
import { CrossedSwordsImage } from "../../images";
import { AppDispatch, RootState } from "../../store";
import { shuffle } from "../../utils";
import { INDUCED_ACTION_PLAYBACK_SPEED } from "../constants";
import { passesConditions } from "../passesConditions";
import { CombatantInfo, TRIGGER_SOURCE_TYPES } from "../types";
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
    return (dispatch: AppDispatch, getState: () => RootState) => {
        const { induceCombatant, induceCombatantAttack } = action;

        const getInitialTargetIndex = (combatantData: CombatantInfo): number | undefined => {
            const combatant = combatantData?.combatant;
            const enemyAutoTargeting = combatant?.targeting?.actionTargets?.[0];
            if (enemyAutoTargeting) {
                return enemyAutoTargeting.index;
            }

            if (Array.isArray(parentContext?.sourceChain)) {
                // Try to target the same enemy struck earlier in the chain, if applicable
                for (const source of parentContext.sourceChain) {
                    if (source?.type !== TRIGGER_SOURCE_TYPES.ABILITY) {
                        continue;
                    }

                    const targetData = findCombatantData(getState().battle!, source.targetId);
                    if (typeof targetData?.index === "number" && targetData?.friendlySide !== combatantData.friendlySide) {
                        return targetData.index;
                    }
                }
            }
        };

        if (induceCombatant) {
            const { mode, action: actions } = induceCombatant;

            const handleInduceAction = (action: Action) => {
                if (mode === "standard") {
                    affectedTargetIds = shuffle(affectedTargetIds);
                } else if (mode === "right-to-left") {
                    affectedTargetIds = affectedTargetIds.slice().reverse();
                }

                affectedTargetIds.forEach((id) => {
                    const combatantData = findCombatantData(getState().battle!, id);
                    if (!combatantData) {
                        return;
                    }

                    const combatant = combatantData.combatant;

                    const getCalculationTarget = (type: TRIGGER_TARGET_TYPES) => {
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
                        battle: getState().battle!,
                    });

                    if (typeof index !== "number" || !side) {
                        return;
                    }

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
                        name: "Induced Action",
                        sourceChain: [
                            ...(parentContext?.sourceChain || []),
                            { actorId: id, source: action, type: TRIGGER_SOURCE_TYPES.ACTION },
                        ],
                    };

                    const actorInfo = findCombatantData(getState().battle!, id);
                    if (actorInfo) {
                        dispatch(
                            onUseAbility({
                                actorInfo,
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
                const combatantData = findCombatantData(getState().battle!, id);
                if (!combatantData) {
                    return;
                }

                const { combatant } = combatantData;
                if (!combatant || !combatant.HP || isStunnedOrFrozen(combatant)) {
                    return;
                }

                const attackAbility: Ability = getInducedAttack(combatant);

                dispatch(
                    useAbility({
                        ability: attackAbility,
                        selectedIndex: getInitialTargetIndex(combatantData),
                        side: combatantData.hostileSide,
                        actorId: id,
                        isProc: true,
                        context: parentContext,
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
