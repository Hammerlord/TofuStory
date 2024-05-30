import { isOffensiveAction, isSupportAbility } from "../../ability/AbilityView/utils";
import { ACTION_TYPES, Ability, CONDITION_TARGETS, EFFECT_EVENT_KEYS, EFFECT_TYPES } from "../../ability/types";
import { getNextTelegraphedAbility } from "../../character/Telegraph";
import getAbilityPreviews from "../../character/getAbilityPreviews";
import { Combatant } from "../../character/types";
import { ITEM_TYPES, Item } from "../../item/types";
import { getRandomInt, shuffle } from "../../utils";
import { BASE_MAX_RESOURCES } from "../constants";
import { passesConditions } from "../passesConditions";
import { BattleState, battleStateSlice } from "../reducer";
import { clearTurnHistory, getEnabledEffects, isStunnedOrFrozen, isTurnActionPrevented, updateCharacters } from "../utils";
import { BATTLE_STATES } from "./../reducer";
import { BATTLEFIELD_SIDES, CombatantInfo } from "./../types";
import {
    autoSelectActionTarget,
    checkEventTrigger,
    findCombatantData,
    handleDoTs,
    onEndTurnTriggers,
    updateCombatant,
    useAbility,
    useItem,
} from "./actions";
import { checkHalveArmor } from "./checkHalveArmor";
import { checkTurnResourceGain } from "./checkTurnResourceGain";

const { updateBattle, updateBattleState } = battleStateSlice.actions;

const handleCastTick = (combatantId: string) => {
    return (dispatch, getState) => {
        const { combatant } = findCombatantData(getState, combatantId);
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

        dispatch(useAbility({ actorId: combatantId, ability }));
        const { combatant: postAbilityActor } = findCombatantData(getState, combatantId) || {};
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

const enemyAction = (combatantId: string) => {
    return (dispatch, getState) => {
        const actorData = findCombatantData(getState, combatantId);
        if (!actorData) {
            return;
        }

        const itemIndex = checkUseItem(actorData.combatant);
        if (itemIndex !== undefined) {
            dispatch(useItem({ itemIndex, actorId: combatantId }));
        }

        dispatch(enemyUseAbility(combatantId));
    };
};

export const getUseAbilityIndex = (actorInfo: CombatantInfo): number => {
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
        const disabledActionTypes = {};
        getEnabledEffects({ combatantInfo: actorInfo }).forEach((e) => {
            e?.disableAbilities?.forEach((type: ACTION_TYPES) => (disabledActionTypes[type] = true));
        });

        return ability.actions.every((action) => !disabledActionTypes[action.type]);
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

// FIX ME: The recently used ability log also contains proc abilities, when we want just the ability the enemy used for its main turn
const requeueRecentlyUsedAbility =
    ({ combatantId, battle, isRecentlySummoned }: { combatantId: string; battle: BattleState; isRecentlySummoned: boolean }) =>
    (dispatch) => {
        const getState = () => ({ battle });
        const actorInfo = findCombatantData(getState, combatantId);
        if (!actorInfo?.combatant?.HP) {
            return;
        }

        const actor = actorInfo.combatant;

        const postUpdateActorInfo = {
            ...actorInfo,
        };

        if (!actorInfo.combatant.casting?.channelDuration) {
            const abilityUsed = actor.abilityHistory[actor.abilityHistory.length - 1];
            let abilityIndex = -1;
            if (abilityUsed) {
                abilityIndex = actor.abilities.findIndex((ability) => ability.name === abilityUsed?.name);
            } else if (!isRecentlySummoned) {
                abilityIndex = getUseAbilityIndex(actorInfo);
            }

            if (abilityIndex !== -1) {
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
            return;
        }

        let mutableUpdatedActionTargets = [];
        ability.actions.forEach((action, i) => {
            const targeting = autoSelectActionTarget({ action, actorId: combatantId, getState });
            mutableUpdatedActionTargets[i] = targeting;

            const previews = getAbilityPreviews({
                ability,
                actor: {
                    ...postUpdateActorInfo.combatant,
                    targeting: {
                        ability,
                        actionTargets: mutableUpdatedActionTargets,
                    },
                },
                battle,
            });

            battle = {
                ...battle,
                ...previews.combatantStates,
            };
        });

        dispatch(
            updateCombatant({
                combatantId,
                newProperties: {
                    targeting: {
                        actionTargets: mutableUpdatedActionTargets,
                        ability,
                    },
                },
            })
        );

        return battle;
    };

const enemyUseAbility = (combatantId: string) => {
    return (dispatch, getState) => {
        const actorData = findCombatantData(getState, combatantId);
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
            dispatch(useAbility({ ability, actorId: combatantId }));
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
            dispatch(useAbility({ ability, actorId: combatantId }));

            const { combatant: postAbilityActor } = findCombatantData(getState, combatantId);
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
        dispatch(onEndTurnTriggers({ combatants: getState().battle.enemySide, side: BATTLEFIELD_SIDES.ENEMY_SIDE }));

        const { playerSide, enemySide } = getState().battle; // Grabbing enemySide state AFTER onEndTurnTriggers have played out
        const isLifeLinked = (combatant) => combatant?.effects?.some((effect) => effect.type === EFFECT_TYPES.LIFE_LINK);

        dispatch(
            updateBattle({
                playerSide: playerSide.map((combatant: Combatant | null) => {
                    if (!combatant?.HP && !isLifeLinked(combatant)) {
                        return null;
                    }

                    return combatant;
                }),
                enemySide: enemySide.map((combatant: Combatant | null) => {
                    if (!combatant?.HP && !isLifeLinked) {
                        return null;
                    }
                    if (combatant?.resources > combatant?.maxResources) {
                        return {
                            ...combatant,
                            resources: combatant.maxResources,
                        };
                    }

                    if (combatant?.resources < 0) {
                        return {
                            ...combatant,
                            resources: 0,
                        };
                    }
                    return combatant;
                }),
            })
        );
    };
};

export const startEnemyTurn = () => {
    return (dispatch, getState) => {
        const { enemySide, round } = getState().battle;

        dispatch(
            updateBattle({
                enemySide: updateCharacters(enemySide, clearTurnHistory),
            })
        );

        const combatantIds = enemySide.map((combatant) => combatant?.id).filter((v) => v);
        dispatch(handleDoTs({ combatantIds, side: BATTLEFIELD_SIDES.ENEMY_SIDE }));

        const getEnemySideInfo = () => {
            return getState().battle.enemySide.map((combatant) => {
                return findCombatantData(getState, combatant?.id);
            });
        };

        if (round > 0) {
            dispatch(checkHalveArmor(getEnemySideInfo()));
        }

        enemySide.forEach((combatant: Combatant | null) => {
            if (!combatant) {
                return;
            }

            dispatch(checkEventTrigger({ combatantId: combatant.id, effectEventKey: EFFECT_EVENT_KEYS.onTurnStart, source: null }));
        });
    };
};

export const enemyMoves = () => {
    return (dispatch, getState) => {
        const getEnemySideInfo = () => {
            return getState().battle.enemySide.map((combatant) => {
                return findCombatantData(getState, combatant?.id);
            });
        };

        const isEligibleToMove = (char: Combatant | null) => {
            return char?.HP > 0 && (char.abilities.length > 0 || char.damage > 0);
        };

        const makeEnemyMove = (enemyId: string) => {
            const enemyInfo = findCombatantData(getState, enemyId);
            const enemy = enemyInfo?.combatant;
            if (!isEligibleToMove(enemy)) {
                return;
            }

            const { state } = getState().battle;
            if (state === BATTLE_STATES.DEFEAT || state === BATTLE_STATES.VICTORY) {
                return;
            }

            const { id, casting } = enemy;
            const unableToAct = isTurnActionPrevented(enemyInfo) || !enemy.abilities?.length || enemy.uncontrollable;

            // Enemies who are unable to act still must lose a turn when casting an ability
            if (casting) {
                dispatch(handleCastTick(id));
            } else if (!unableToAct) {
                dispatch(enemyAction(id));
            }
        };

        const { enemySide, round } = getState().battle;
        const moveOrderIds = getEnemyMoveOrder({ enemies: enemySide, round });
        moveOrderIds.forEach(makeEnemyMove);

        const { state } = getState().battle;
        if (state === BATTLE_STATES.DEFEAT || state === BATTLE_STATES.VICTORY) {
            return;
        }

        dispatch(checkTurnResourceGain(getEnemySideInfo()));

        let prevBattleState = getState().battle;
        // Queue the next ability unless the combatant is channeling.
        // This should occur after resource gain so that the telegraph doesn't flicker to an ability it can newly use with the updated resources
        getState().battle.enemySide.forEach((combatant) => {
            if (!combatant?.HP) {
                return;
            }

            const isRecentlySummoned = !moveOrderIds.includes(combatant.id);
            const battleStateSnapshot =
                dispatch(requeueRecentlyUsedAbility({ combatantId: combatant.id, battle: prevBattleState, isRecentlySummoned })) || {};
            prevBattleState = {
                ...prevBattleState,
                ...battleStateSnapshot,
            };
        });
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
