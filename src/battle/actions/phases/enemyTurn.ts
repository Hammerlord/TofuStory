import { isSupportAbility } from "../../../ability/AbilityView/utils";
import { ACTION_TYPES, Ability, CONDITION_TARGETS, EFFECT_EVENT_KEYS, EFFECT_TYPES } from "../../../ability/types";
import { getNextTelegraphedAbility } from "../../../character/Telegraph";
import { previewAction } from "../../../character/getAbilityPreviews";
import { Combatant } from "../../../character/types";
import { ITEM_TYPES, Item } from "../../../item/types";
import { getRandomInt } from "../../../utils";
import { BASE_MAX_RESOURCES } from "../../constants";
import { passesConditions } from "../../passesConditions";
import { BATTLE_STATES, BattleState, battleStateSlice } from "../../reducer";
import { ActionContext, BATTLEFIELD_SIDES, CombatantInfo, TRIGGER_SOURCE_TYPES } from "../../types";
import { isStunnedOrFrozen } from "../../utils";
import { findCombatantData, isTurnActionPrevented, updateCombatant, updateCombatants } from "../combatantData";
import { performAction } from "../performAction";
import { PlaybackCollector, playbackCollector } from "../playbackCollector";
import { getEnabledEffects } from "../statusEffect/getEnabledEffects";
import { checkEventTrigger } from "../statusEffect/triggerEffectEvent";
import { checkValidEnemyTargeting } from "../targeting/enemyTargeting";
import { autoSelectActionTarget } from "../targeting/targeting";
import { useAbility } from "../useAbility";
import { useItem } from "../useItem";
import { checkHalveArmor } from "./checkHalveArmor";
import { checkTurnResourceGain } from "./checkTurnResourceGain";
import { handleDoTs } from "./damageOverTime";
import { onEndTurnTriggers } from "./phases";

const { updateBattle, updateBattleState, pushEventQueue } = battleStateSlice.actions;

const handleCastTick = (combatantId: string, playbackCollector: PlaybackCollector) => {
    return (dispatch, getState) => {
        const { combatant } = findCombatantData(getState().battle, combatantId);
        const { ability, castTime = 0, channelDuration } = combatant.casting;

        const updatedCasting = { ...combatant.casting };
        if (castTime > 0) {
            updatedCasting.castTime = castTime - 1;
        }

        if (!updatedCasting.castTime && channelDuration) {
            updatedCasting.channelDuration = channelDuration - 1;
        }

        dispatch(
            updateCombatant({
                combatantId,
                newProperties: {
                    // If a character is CCed, channeled abilities lose a tick no matter what, but cast times are merely delayed.
                    // Fix an issue where the cast time would reset if the enemy was CCed.
                    casting: updatedCasting.channelDuration || castTime > 0 ? updatedCasting : null,
                },
            })
        );

        if (updatedCasting.castTime || isStunnedOrFrozen(combatant)) {
            return;
        }

        dispatch(useAbility({ actorId: combatantId, ability, context: { name: "Enemy Cast", playbackCollector } }));
        const { combatant: postAbilityActor } = findCombatantData(getState().battle, combatantId) || {};
        if (!postAbilityActor) {
            return;
        }
        const resourceCost = (ability.resourceCost === "x" ? postAbilityActor.resources : ability.resourceCost) || 0;

        dispatch(
            updateCombatant({
                combatantId,
                newProperties: {
                    resources: postAbilityActor.resources - resourceCost,
                    // Continued from the note about CC, if the casted spell finally went through, check its cast time again.
                    casting: updatedCasting.channelDuration || updatedCasting.castTime > 0 ? updatedCasting : null,
                },
            })
        );
    };
};

const enemyAction = (combatantId: string, playbackCollector: PlaybackCollector) => {
    return (dispatch, getState) => {
        const actorData = findCombatantData(getState().battle, combatantId);
        if (!actorData) {
            return;
        }

        const itemIndex = checkUseItem(actorData.combatant);
        if (itemIndex !== undefined) {
            dispatch(useItem({ itemIndex, actorId: combatantId, playbackCollector }));
        }

        dispatch(enemyUseAbility(combatantId, playbackCollector));
    };
};

export const getUseAbilityIndex = (actorInfo: CombatantInfo, options?: { ignoreDisabled: boolean }): number => {
    const { resources = 0, maxResources = BASE_MAX_RESOURCES, abilities = [] } = actorInfo?.combatant || {};

    const getCalculationTarget = (type: CONDITION_TARGETS) => {
        if (!type || type === CONDITION_TARGETS.ACTOR) {
            return actorInfo;
        }
    };

    const abilityPassesConditions = (ability) => passesConditions({ getCalculationTarget, proc: ability });

    if (!abilities.length) {
        return -1;
    }

    const notDisabled = (ability: Ability): boolean => {
        if (options?.ignoreDisabled) {
            return true;
        }
        const disabledActionTypes = {};
        getEnabledEffects({ combatantInfo: actorInfo }).forEach((e) => {
            e?.disableAbilities?.forEach((type: ACTION_TYPES) => (disabledActionTypes[type] = true));
        });

        return (ability.actions || []).every((action) => !disabledActionTypes[action.type]);
    };
    if (resources >= maxResources) {
        const specialAbilityIndex = abilities.findIndex(
            (ability) =>
                abilityPassesConditions(ability) && (ability.resourceCost === "x" || ability.resourceCost > 0) && notDisabled(ability)
        );
        if (specialAbilityIndex > -1) {
            return specialAbilityIndex;
        }
    }

    const abilityIndex = abilities.findIndex(
        (ability) => abilityPassesConditions(ability) && !ability.resourceCost && notDisabled(ability)
    );
    const { resourceCost = 0 } = abilities[abilityIndex] || {};
    if (resourceCost === "x" || resourceCost <= resources) {
        return abilityIndex;
    }

    return -1;
};

export const requeueRecentlyUsedAbility =
    ({ combatantId }: { combatantId: string }) =>
    (dispatch, getState) => {
        const battle = getState().battle;
        const actorInfo = findCombatantData(battle, combatantId);
        if (!actorInfo?.combatant?.HP || !actorInfo?.combatant?.abilities?.length) {
            return;
        }

        const actor: Combatant = actorInfo.combatant;

        const postUpdateActorInfo = {
            ...actorInfo,
        };

        if (!actorInfo.combatant.casting?.channelDuration) {
            const validAbilityIds = actor.abilities.map((a) => a.instanceId);
            // Exclude procs from being considered for requeuing
            const history = actor.abilityHistory.filter((a) => validAbilityIds.includes(a.instanceId));
            const abilityUsed = history[history.length - 1];
            let abilityIndex = -1;
            if (abilityUsed) {
                abilityIndex = actor.abilities.findIndex((ability) => ability.instanceId === abilityUsed?.instanceId);
            } else {
                abilityIndex = getUseAbilityIndex(actorInfo);
            }

            if (abilityIndex > -1) {
                const updatedAbilities = [...actor.abilities];
                const [used] = updatedAbilities.splice(abilityIndex, 1);
                updatedAbilities.push(used);

                dispatch(
                    updateCombatant({
                        combatantId,
                        newProperties: {
                            abilities: updatedAbilities,
                        },
                    })
                );

                postUpdateActorInfo.combatant = {
                    ...actorInfo.combatant,
                    abilities: updatedAbilities,
                };
            }
        }

        const ability = getNextTelegraphedAbility(postUpdateActorInfo);
        if (!ability?.actions) {
            dispatch(
                updateCombatant({
                    combatantId,
                    newProperties: {
                        targeting: null,
                    },
                })
            );
        }

        dispatch(
            updateCombatant({
                combatantId,
                newProperties: {
                    targeting: {
                        actionTargets: [], // This is updated by checkValidEnemyTargeting() in the function that calls this
                        ability,
                    },
                },
            })
        );
    };

export const getUpdatedBattleActionTargets = ({
    ability,
    battle,
    actorInfo,
}: {
    ability: Ability;
    battle: BattleState;
    actorInfo: CombatantInfo;
}) => {
    let targets: { index: number | undefined; side: BATTLEFIELD_SIDES }[] = [];
    ability.actions.forEach((action, i) => {
        const target = autoSelectActionTarget({ action, actorId: actorInfo.combatant.id, battle });
        targets = targets.slice();
        targets[i] = target;

        const preview = previewAction({
            actionFn: performAction({
                action,
                parentContext: {
                    name: "Action Preview",
                    sourceChain: [{ type: TRIGGER_SOURCE_TYPES.ABILITY, source: ability }],
                    triggerHistory: [],
                },
                selectedIndex: target.index,
                side: target.side,
                actorId: actorInfo.combatant.id,
            }),
            battle: battle,
        });

        battle = {
            ...battle,
            playerSide: preview.battle.playerSide,
            enemySide: preview.battle.enemySide,
        };
    });

    return { battle, targets };
};

const enemyUseAbility = (combatantId: string, playbackCollector: PlaybackCollector) => {
    return (dispatch, getState) => {
        const actorData = findCombatantData(getState().battle, combatantId);
        if (!actorData?.combatant) {
            return;
        }

        const { combatant: actor } = actorData;
        let ability = actor.targeting?.ability;

        if (!ability) {
            // Should there be a backup ability usage here?
            return;
        }

        const { castTime, channelDuration } = ability || {};
        if (!castTime && !channelDuration) {
            dispatch(useAbility({ ability, actorId: combatantId, context: { name: "Enemy Ability", playbackCollector } }));
            return;
        }

        const casting = {
            ability,
            castTime,
            channelDuration: !castTime ? (channelDuration || 1) - 1 : channelDuration,
        };

        dispatch(
            updateCombatant({
                combatantId,
                newProperties: {
                    casting,
                },
            })
        );

        if (!castTime) {
            dispatch(useAbility({ ability, actorId: combatantId, context: { name: "Enemy Ability", playbackCollector } }));

            const { combatant: postAbilityActor } = findCombatantData(getState().battle, combatantId);
            const resourceCost = (ability.resourceCost === "x" ? postAbilityActor.resources : ability.resourceCost) || 0;

            dispatch(
                updateCombatant({
                    combatantId,
                    newProperties: {
                        resources: postAbilityActor.resources - resourceCost,
                    },
                })
            );
        }
    };
};

export const endEnemyTurn = () => {
    return (dispatch, getState) => {
        dispatch(onEndTurnTriggers({ combatants: getState().battle.enemySide }));

        const { round } = getState().battle; // Grabbing enemySide state AFTER onEndTurnTriggers have played out

        // Queue the next ability unless the combatant is channeling.
        // This should occur after resource gain so that the telegraph doesn't flicker to an ability it can newly use with the updated resources
        const nextMoveOrderIds = getEnemyMoveOrder({ enemies: getState().battle.enemySide, round: round + 1 });

        nextMoveOrderIds.forEach((combatantId) => {
            const combatant = getState().battle.enemySide.find((enemy) => enemy?.id === combatantId);
            if (!combatant?.HP) {
                return;
            }

            dispatch(requeueRecentlyUsedAbility({ combatantId: combatantId }));
        });

        dispatch(checkValidEnemyTargeting());
    };
};

export const startEnemyTurn = () => {
    return (dispatch, getState) => {
        const { enemySide, round } = getState().battle;

        dispatch(
            updateBattle({
                enemySide: updateCombatants(enemySide, clearTurnHistory),
            })
        );

        // The "source" acts as a context object just to pass in a playbackCollector.
        // The effect events at turn start technically don't have a `trigger source`.
        const playbackCollectorInstance = playbackCollector();
        const context: ActionContext = { name: "Enemy Turn", sourceChain: [], playbackCollector: playbackCollectorInstance };
        const combatantIds = enemySide.map((combatant) => combatant?.id).filter((v) => v);
        dispatch(handleDoTs({ combatantIds, side: BATTLEFIELD_SIDES.ENEMY_SIDE, context }));

        const getEnemySideInfo = () => {
            return getState().battle.enemySide.map((combatant) => {
                return findCombatantData(getState().battle, combatant?.id);
            });
        };

        if (round > 0) {
            dispatch(checkHalveArmor(getEnemySideInfo(), context));
        }

        enemySide.forEach((combatant: Combatant | null) => {
            if (!combatant) {
                return;
            }

            dispatch(checkEventTrigger({ combatantId: combatant.id, effectEventKey: EFFECT_EVENT_KEYS.onTurnStart, context }));
        });

        dispatch(pushEventQueue(playbackCollectorInstance.get()));
    };
};

export const enemyMoves = () => {
    return (dispatch, getState) => {
        const getEnemySideInfo = () => {
            return getState().battle.enemySide.map((combatant) => {
                return findCombatantData(getState().battle, combatant?.id);
            });
        };

        const isEligibleToMove = (char: Combatant | null) => {
            return char?.HP > 0 && (char.abilities.length > 0 || char.damage > 0);
        };

        const playbackCollectorInstance = playbackCollector();

        const makeEnemyMove = (enemyId: string) => {
            const enemyInfo = findCombatantData(getState().battle, enemyId);
            const enemy = enemyInfo?.combatant;
            if (!isEligibleToMove(enemy)) {
                return;
            }

            const { state } = getState().battle;
            if (state === BATTLE_STATES.DEFEAT || state === BATTLE_STATES.VICTORY) {
                return;
            }

            const { id, casting } = enemy;
            const unableToAct = isTurnActionPrevented(enemyInfo) || !enemy.abilities?.length || enemy.cantMove;

            // Enemies who are unable to act still must lose a turn when casting an ability
            if (casting) {
                dispatch(handleCastTick(id, playbackCollectorInstance));
            } else if (!unableToAct) {
                dispatch(enemyAction(id, playbackCollectorInstance));
            }
        };

        const { enemySide, round } = getState().battle;
        const moveOrderIds = getEnemyMoveOrder({ enemies: enemySide, round });
        moveOrderIds.forEach(makeEnemyMove);
        dispatch(pushEventQueue(playbackCollectorInstance.get()));

        const { state } = getState().battle;
        if (state === BATTLE_STATES.DEFEAT || state === BATTLE_STATES.VICTORY) {
            return;
        }

        // Not having a playbackCollector (in the source object) probably doesn't matter here ATM?
        dispatch(checkTurnResourceGain(getEnemySideInfo()));
        dispatch(updateBattleState(BATTLE_STATES.TURN_END));
    };
};

/**
 * Decides whether the enemy should use an item. If true, it returns the index of the item to use.
 */
const checkUseItem = (combatant: Combatant): number | undefined => {
    const { items = [], maxHP, HP } = combatant || {};

    const missingHP = maxHP - HP;
    const consumablesWorthUsing = items.filter((item: Item) => item.type === ITEM_TYPES.CONSUMABLE && item.healing <= missingHP);
    if (consumablesWorthUsing.length === 0) {
        return;
    }

    // Chance whether it uses an item this turn
    if (Math.random() > HP / maxHP) {
        return getRandomInt(0, consumablesWorthUsing.length - 1);
    }
};

/**
 * Get the order in which enemies move on their turn.
 */
export const getEnemyMoveOrder = ({
    enemies,
    round,
    ignoreSupport,
}: {
    enemies: (Combatant | null)[];
    round: number;
    ignoreSupport?: boolean;
}): string[] => {
    const isEvenRound = round % 2 === 0;
    if (isEvenRound) {
        enemies = enemies.slice().reverse();
    }

    return enemies
        .filter((v) => v)
        .sort((a, b) => {
            const aVal = isSupportAbility(a.targeting?.ability) ? 1 : -1;
            const bVal = isSupportAbility(b.targeting?.ability) ? 1 : -1;
            const compareSupport = aVal - bVal;
            if (!ignoreSupport && compareSupport !== 0) {
                return compareSupport;
            }

            const middle = 2;
            const aIndex = enemies.findIndex((enemy: Combatant | null) => enemy?.id === a.id);
            const bIndex = enemies.findIndex((enemy: Combatant | null) => enemy?.id === b.id);

            return Math.abs(aIndex - middle) - Math.abs(bIndex - middle);
        })
        .map((e) => e.id);
};

const clearTurnHistory = (character: Combatant): Combatant => {
    return {
        ...character,
        turnHistory: [],
    };
};
