import { getAbilityUpgradedFromEffects, isOffensiveAbility, isSupportAbility } from "../../ability/AbilityView/utils";
import { Ability, Action, CONDITION_TARGETS, CombatAbility, EFFECT_EVENT_KEYS, TARGET_TYPES } from "../../ability/types";
import { getRandomInt } from "../../utils";
import { passesConditions } from "../passesConditions";
import { BattleState } from "../reducer";
import { BATTLEFIELD_SIDES, CombatantInfo, TRIGGER_SOURCE_TYPES, TriggerSource } from "../types";
import { getPlayerAbilityResourceCost } from "./playerAbility";
import { isTurnActionPrevented } from "./combatantData";
import { findCombatantData } from "./combatantData";
import { TRIGGER_TARGET_TYPES } from "./../../ability/types";
import { ActionContext } from "./../types";
import { performAction } from "./performAction";
import { applyStatChanges, triggerStatChangeEvents } from "./statChanges";
import { checkSummonMinion } from "./summon/summon";
import { autoSelectActionTarget } from "./targeting/targeting";
import { checkEventTrigger } from "./statusEffect/triggerEffectEvent";
import { updateCombatant } from "./combatantData";
import { handleAddCardsToHand } from "./cardActions/addCards";
import { cloneDeep } from "lodash";

export const useAbility = ({
    ability,
    selectedIndex,
    side: initialSide,
    actorId,
    isAutoCast,
    isProc,
    context,
}: {
    side?: BATTLEFIELD_SIDES;
    selectedIndex?: number;
    ability: CombatAbility | Ability;
    actorId: string;
    isAutoCast?: boolean;
    isProc?: boolean;
    context?: ActionContext;
}) => {
    return (dispatch, getState) => {
        // @ts-ignore -- We're providing a fallback so it doesn't matter whether effects exists or not
        const { resourceCost = 0, actions = [], effects = [], echo } = getAbilityUpgradedFromEffects({ ability }) as CombatAbility;
        const { combatant, friendlySide } = findCombatantData(getState().battle, actorId) || {};

        const totalResourceCost = getPlayerAbilityResourceCost({ combatant, resourceCost, effects });
        ability = {
            ...ability,
            resourceCost: totalResourceCost, // Primarily used for calculating resourceCost === 'x' multiplier
        };

        const resourceSpend = { resources: -totalResourceCost, combatantId: combatant.id };

        if (!isAutoCast) {
            dispatch(applyStatChanges([resourceSpend]));
        }

        const source: TriggerSource = { type: TRIGGER_SOURCE_TYPES.ABILITY, source: ability, actorId, isProc };
        const parentContext: ActionContext = { ...context, sourceChain: [...(context?.sourceChain || []), source], isProc };

        dispatch(checkSummonMinion({ ability, selectedIndex, side: friendlySide, actorId, parentContext, isAutoCast }));

        const { target: initialTarget } = actions[0] || {};

        // This could become stale between actions but not an issue at the time of implementation. Only Curse Eye applies this effect.
        const isEffectRandomTargeting = combatant.effects?.some((e) => e.hitRandomTarget);

        let prevSelection;

        const handleAction = (action: Action, i: number) => {
            const actorInfo = findCombatantData(getState().battle, actorId);
            const actor = actorInfo?.combatant;
            // Something could've happened between actions that killed the actor
            const canAct = actor?.HP > 0 && !isTurnActionPrevented(actorInfo, { bypassPreventTurnAction: action.bypassPreventTurnAction });
            if (!canAct) {
                return;
            }

            let selection;

            const targetingAbility = actor.targeting?.ability;
            const selectedActionTargets = actor.targeting?.actionTargets?.[i];
            if (targetingAbility?.name === ability.name && typeof selectedActionTargets?.index === "number") {
                selection = selectedActionTargets;
            } else if (isEffectRandomTargeting && action.target === TARGET_TYPES.HOSTILE) {
                selection = autoSelectActionTarget({
                    initialSelectedIndex: selectedIndex,
                    initialSelectedSide: initialSide,
                    action: {
                        ...action,
                        target: TARGET_TYPES.RANDOM_HOSTILE,
                    },
                    actorId,
                    battle: getState().battle,
                });
            }
            // If it is a multi-hit ability, the attacks should go to the same target
            else if (action.target === TARGET_TYPES.HOSTILE && action.target === initialTarget && prevSelection) {
                selection = prevSelection;
            } else {
                selection = autoSelectActionTarget({
                    initialSelectedIndex: selectedIndex,
                    initialSelectedSide: initialSide,
                    action,
                    actorId,
                    battle: getState().battle,
                });

                prevSelection = selection;
            }

            const { side, index } = selection;

            const getCalculationTarget = (calculationTarget: CONDITION_TARGETS | TRIGGER_TARGET_TYPES): CombatantInfo | BattleState => {
                if (calculationTarget === CONDITION_TARGETS.BATTLE) {
                    return getState().battle;
                }
                if (calculationTarget === CONDITION_TARGETS.ACTOR) {
                    return findCombatantData(getState().battle, actorId);
                }

                return findCombatantData(getState().battle, getState().battle[side]?.[index]?.id);
            };

            if (passesConditions({ getCalculationTarget, proc: action, context: parentContext })) {
                dispatch(performAction({ action, selectedIndex: index, side, actorId, parentContext, isAutoCast }));
            }
        };

        if (resourceCost === "x") {
            const numTimesToCast = isAutoCast ? getRandomInt(1, 3) : totalResourceCost;
            Array.from({ length: numTimesToCast }).forEach(() => {
                actions.forEach(handleAction);
            });
        } else {
            actions.forEach(handleAction);
        }

        // Resource spend events triggered down here due to Bounce otherwise causing Furious Strike to be discarded
        if (!isAutoCast) {
            dispatch(triggerStatChangeEvents([{ statUpdate: resourceSpend, context: parentContext }]));
        }

        const actorInfo = findCombatantData(getState().battle, actorId);
        // Due to morph, the combatant may no longer exist
        if (actorInfo) {
            dispatch(onUseAbility({ actorInfo, context: parentContext, ability, isAutoCast }));
        }

        if (echo) {
            const { hand, deck, discard } = getState().battle;
            const removeEchoRegex = /(?:<b>)?Echo\.?(?:<\/b>)?/g;
            const newDescription = ability.description.replace(removeEchoRegex, "");
            const copy: CombatAbility = { ...cloneDeep(ability), echo: false, removeAfterTurn: true, description: newDescription };
            const ownedCards = [...hand, ...deck, ...discard].reduce((acc, card) => {
                acc[card.name] = true;
                return acc;
            }, {});
            dispatch(handleAddCardsToHand({ addCards: [copy], ownedCards, context }));
        }
    };
};

export const onUseAbility =
    ({
        actorInfo,
        context,
        ability,
        isAutoCast,
    }: {
        actorInfo: CombatantInfo;
        context: ActionContext;
        ability: CombatAbility;
        isAutoCast?: boolean;
    }) =>
    (dispatch) => {
        if (!actorInfo) {
            return;
        }

        const { combatant: actor } = actorInfo;
        if (!actor) {
            return;
        }

        dispatch(
            updateCombatant({
                combatantId: actor.id,
                newProperties: {
                    abilityHistory: [...actor.abilityHistory, ability],
                },
            })
        );

        dispatch(
            checkEventTrigger({
                combatantId: actor.id,
                effectEventKey: EFFECT_EVENT_KEYS.onAbility,
                context: context,
            })
        );

        ability?.effects?.forEach((effect) => {
            if (effect.onUse?.ability) {
                dispatch(
                    useAbility({
                        ability: effect.onUse?.ability,
                        actorId: actor.id,
                        isProc: true,
                        context,
                    })
                );
            }
        });

        if (isOffensiveAbility(ability)) {
            dispatch(
                checkEventTrigger({
                    combatantId: actor.id,
                    effectEventKey: EFFECT_EVENT_KEYS.onOffensiveAbility,
                    context: context,
                })
            );
        } else if (isSupportAbility(ability)) {
            dispatch(
                checkEventTrigger({
                    combatantId: actor.id,
                    effectEventKey: EFFECT_EVENT_KEYS.onSupportAbility,
                    context: context,
                })
            );
        }

        actorInfo.hostile.forEach((combatant) => {
            if (combatant) {
                dispatch(
                    checkEventTrigger({
                        combatantId: combatant.id,
                        effectEventKey: EFFECT_EVENT_KEYS.onHostileAbility,
                        context: context,
                    })
                );

                if (actor.isPlayer) {
                    dispatch(
                        checkEventTrigger({
                            combatantId: combatant.id,
                            effectEventKey: EFFECT_EVENT_KEYS.onPlayerAbility,
                            context: context,
                        })
                    );
                }

                if (isSupportAbility(ability)) {
                    dispatch(
                        checkEventTrigger({
                            combatantId: combatant.id,
                            effectEventKey: EFFECT_EVENT_KEYS.onHostileSupportAbility,
                            context: context,
                        })
                    );
                }
            }
        });

        actorInfo.friendly.forEach((combatant) => {
            if (combatant) {
                dispatch(
                    checkEventTrigger({
                        combatantId: combatant.id,
                        effectEventKey: EFFECT_EVENT_KEYS.onFriendlyAbility,
                        context: context,
                    })
                );

                if (actor.isPlayer) {
                    dispatch(
                        checkEventTrigger({
                            combatantId: combatant.id,
                            effectEventKey: EFFECT_EVENT_KEYS.onPlayerAbility,
                            context: context,
                        })
                    );
                }

                if (isSupportAbility(ability)) {
                    dispatch(
                        checkEventTrigger({
                            combatantId: combatant.id,
                            effectEventKey: EFFECT_EVENT_KEYS.onFriendlySupportAbility,
                            context: context,
                        })
                    );
                }

                // Only the player character depletes abilities.
                // Friendly: used to activate Red Hearted Earrings for minions
                if (ability.depletedOnUse && !isAutoCast) {
                    dispatch(
                        checkEventTrigger({
                            combatantId: combatant.id,
                            effectEventKey: EFFECT_EVENT_KEYS.onDepleteAbility,
                            context: context,
                        })
                    );
                }
            }
        });
    };
