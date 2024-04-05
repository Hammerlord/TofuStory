import { isOffensiveAbility } from "../../ability/AbilityView/utils";
import { ACTION_TYPES, Ability, CONDITION_TARGETS, CombatEffect, EFFECT_EVENT_KEYS, EFFECT_TYPES } from "../../ability/types";
import { Combatant } from "../../character/types";
import { ITEM_TYPES, Item } from "../../item/types";
import { getRandomInt, getRandomItem, shuffle } from "../../utils";
import { NORMAL_ACTION_PLAYBACK_SPEED } from "../constants";
import { passesConditions } from "../passesConditions";
import { battleStateSlice } from "../reducer";
import {
    clearTurnHistory,
    getEnabledEffects,
    getHealableIndices,
    getPossibleMoveIndices,
    getPossibleSummonIndices,
    getValidTargetIndices,
    hasTruesight,
    isStunnedOrFrozen,
    isTurnActionPrevented,
    updateCharacters,
} from "../utils";
import { TARGET_TYPES } from "./../../ability/types";
import { BATTLE_STATES } from "./../reducer";
import { BATTLEFIELD_SIDES, CombatantInfo } from "./../types";
import {
    checkEventTrigger,
    findCombatantData,
    handleDoTs,
    onEndTurnTriggers,
    pickHostileIndex,
    updateCombatant,
    useAbility,
    useItem,
} from "./actions";
import { checkHalveArmor } from "./checkHalveArmor";
import { checkTurnResourceGain } from "./checkTurnResourceGain";

const { updateBattle, updateBattleState } = battleStateSlice.actions;

/**
 * Given an ability, pick a target that makes sense.
 * Index may be undefined if there were no valid indices to choose from.
 */
const autoPickTarget = ({
    ability,
    actor,
}: {
    ability: Ability;
    actor: CombatantInfo;
}): { index: number | undefined; side: BATTLEFIELD_SIDES } => {
    const { hostile, friendly, friendlySide, hostileSide, index } = actor;

    const { actions = [], minion } = ability;
    if (minion) {
        return {
            side: friendlySide,
            index: getRandomItem(getPossibleSummonIndices(friendly)),
        };
    }

    // For now we only make one selection, and assume that all abilities that contain at least one offensive action must select a hostile target
    if (isOffensiveAbility(ability)) {
        return {
            side: hostileSide,
            index: pickHostileIndex({ hostile, actorData: actor }),
        };
    }

    const movementAction = ability.actions.find((action) => action.movement);
    if (movementAction) {
        const index = friendly.findIndex((e: Combatant) => e && e.id === actor.combatant?.id);
        const possibleMoves = getPossibleMoveIndices({
            currentLocationIndex: index,
            friendly,
            movement: movementAction.movement,
        });

        return {
            side: friendlySide,
            index: shuffle(possibleMoves)[0],
        };
    }

    const friendlySupportAction = actions.find(({ target }) => target === TARGET_TYPES.FRIENDLY);
    if (friendlySupportAction) {
        // If it's a healing spell, it should prioritize injured units (TODO: the most injured unit)
        let targetIndices = getValidTargetIndices(friendly);
        if (friendlySupportAction.healing) {
            const healingIndices = getHealableIndices(friendly);
            if (healingIndices.length > 0) {
                targetIndices = healingIndices;
            }
        }

        return {
            side: friendlySide,
            index: getRandomItem(targetIndices),
        };
    }

    // Else it is assumed to be a self-targeting ability
    return {
        side: friendlySide,
        index: index,
    };
};

const handleCastTick = (combatantId: string) => {
    return (dispatch, getState) => {
        const { combatant } = findCombatantData(getState, combatantId);
        const { ability, castTime = 0, channelDuration, selectedIndex, selectedSide } = combatant.casting;

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
                    casting: updatedCasting.channelDuration || updatedCasting.castTime ? updatedCasting : null,
                },
            })
        );

        if (updatedCasting.castTime || isStunnedOrFrozen(combatant)) {
            return;
        }

        const battle = getState().battle;

        // If the original selected target is no longer valid, switch to a random new target. TODO area abilities could still be valid in the same spot
        const index =
            battle[selectedIndex]?.HP > 0
                ? selectedIndex
                : autoPickTarget({ ability, actor: findCombatantData(getState, combatantId) }).index;

        if (typeof index !== "number") {
            return;
        }

        dispatch(useAbility({ actorId: combatantId, ability, side: selectedSide, selectedIndex: index }));
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
    const { resources = 0, maxResources = 3, abilities = [] } = actorInfo?.combatant || {};

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
const requeueRecentlyUsedAbility = (combatantId: string) => (dispatch, getState) => {
    const actorInfo = findCombatantData(getState, combatantId);
    if (!actorInfo) {
        return;
    }

    const actor = actorInfo.combatant;
    const abilityUsed = actor.abilityHistory[actor.abilityHistory.length - 1];
    let abilityIndex;
    if (abilityUsed) {
        abilityIndex = actor.abilities.findIndex((ability) => ability.name === abilityUsed?.name);
    } else {
        abilityIndex = getUseAbilityIndex(actorInfo);
    }

    if (abilityIndex === -1) {
        return;
    }
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
};

const enemyUseAbility = (combatantId: string) => {
    return (dispatch, getState) => {
        const actorData = findCombatantData(getState, combatantId);
        if (!actorData) {
            return;
        }

        const abilityIndex = getUseAbilityIndex(actorData);

        const { combatant: actor } = actorData;
        const ability = actor.abilities[abilityIndex];
        if (!ability) {
            return;
        }

        const { side, index } = autoPickTarget({ ability, actor: actorData });
        const { castTime, channelDuration } = ability;

        if (typeof index === "undefined") {
            return;
        }

        if (!castTime && !channelDuration) {
            dispatch(useAbility({ ability, actorId: combatantId, side, selectedIndex: index }));
            return;
        }

        const casting = {
            ability,
            castTime,
            channelDuration: !castTime ? (channelDuration || 1) - 1 : channelDuration,
            selectedIndex: index,
            selectedSide: side,
        };

        dispatch(
            updateCombatant({
                combatantId,
                newProperties: {
                    casting,
                },
            })
        );

        if (!ability.castTime) {
            dispatch(useAbility({ ability, actorId: combatantId, side, selectedIndex: index }));

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
        dispatch(onEndTurnTriggers(getState().battle.enemySide));
        const enemySide = getState().battle.enemySide; // Grabbing enemySide state AFTER onEndTurnTriggers have played out
        dispatch(
            updateBattle({
                enemySide: enemySide.map((combatant: Combatant) => {
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
        const acted = {};
        const isEligibleToMove = (char: Combatant | null) => {
            return char?.HP > 0 && !acted[char.id] && (char.abilities.length > 0 || char.damage > 0);
        };
        const makeEnemyMove = () => {
            const { state, enemySide } = getState().battle;
            if (state === BATTLE_STATES.DEFEAT || state === BATTLE_STATES.VICTORY) {
                return;
            }

            const eligible = shuffle(enemySide)
                .filter(isEligibleToMove)
                .sort((a, b) => (b?.isBoss || false) - (a?.isBoss || false));

            const enemy = eligible[0];
            if (!enemy) {
                dispatch(checkTurnResourceGain(getEnemySideInfo()));
                // Queue the next ability unless the combatant is channeling.
                // This should occur after resource gain so that the telegraph doesn't flicker to an ability it can newly use with the updated resources
                getEnemySideInfo().forEach((combatantInfo) => {
                    if (!combatantInfo) {
                        return;
                    }

                    const combatant = combatantInfo.combatant;
                    if (combatant.HP > 0 && !combatant.casting?.channelDuration) {
                        dispatch(requeueRecentlyUsedAbility(combatant.id));
                    }
                });
                dispatch(updateBattleState(BATTLE_STATES.TURN_END));
                return;
            }

            const { id, casting } = enemy;
            acted[id] = true;
            const enemyInfo = findCombatantData(getState, id);
            const unableToAct = isTurnActionPrevented(enemyInfo) || !enemy.abilities?.length || enemy.uncontrollable;

            // Enemies who are unable to act still must lose a turn when casting an ability
            if (casting) {
                dispatch(handleCastTick(id));
            } else if (!unableToAct) {
                dispatch(enemyAction(id));
            }
            makeEnemyMove();
        };

        makeEnemyMove();
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
