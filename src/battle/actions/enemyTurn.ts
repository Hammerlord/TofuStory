import { compose, partition } from "ramda";
import { Ability, Action, EFFECT_CLASSES, EFFECT_EVENT_KEYS } from "../../ability/types";
import { Combatant } from "../../character/types";
import { getRandomItem, shuffle } from "../../utils";
import { battleStateSlice } from "../reducer";
import {
    clearTurnHistory,
    gainResources,
    getBasicAttack,
    getHealableIndices,
    getMaxHP,
    getPossibleMoveIndices,
    getPossibleSummonIndices,
    getValidTargetIndices,
    isUnableToAct,
    updateCharacters,
} from "../utils";
import { TARGET_TYPES } from "./../../ability/types";
import { BATTLE_STATES } from "./../reducer";
import { BATTLEFIELD_SIDES, CombatantInfo } from "./../types";
import { checkEventTrigger, findCombatantData, onEndTurnTriggers, tickDownStatusEffects, updateCombatant, useAbility } from "./actions";
import { checkHalveArmor } from "./checkHalveArmor";

const { updateBattle, updateBattleState } = battleStateSlice.actions;

/**
 * 1) If a movement ability was picked, check that there are no obstructions blocking that movement.
 * Otherwise, pick a different ability.
 * 2) Check the resource cost of the ability.
 * 3) Check if there is space for a minion.
 * 4) If the ability applies a buff that the actor already has, don't use it.
 * 5) If the ability only heals, do not use it at full health.
 */
const canUseAbility = ({
    actor,
    ability,
    hostile,
    friendly,
}: {
    actor: Combatant;
    ability: Ability;
    hostile: (Combatant | null)[];
    friendly: (Combatant | null)[];
}): boolean => {
    const resourceCost = ability.resourceCost || 0;
    if ((actor.resources || 0) < resourceCost) {
        return false;
    }

    if (ability.minion) {
        return friendly.some((combatant) => !combatant || combatant.HP === 0);
    }

    const abilityEffects = ability.actions.reduce((acc, { effects = [] }) => {
        return [...acc, ...effects];
    }, []);
    if (actor.effects.some(({ name }) => abilityEffects.some((effect) => effect.name === name))) {
        return false;
    }
    if (ability.actions.length === 1 && ability.actions[0].healing > 0) {
        return actor.HP < getMaxHP(actor); // ? It's not just the actor who needs a healing
    }

    const movementAction = ability.actions.find((action) => action.movement);
    if (movementAction) {
        const index = friendly.findIndex((e: Combatant) => e && e.id === actor.id);
        return (
            getPossibleMoveIndices({
                currentLocationIndex: index,
                friendly,
                movement: movementAction.movement,
            }).length > 0
        );
    }

    if (ability.depletedOnUse) {
        // If it is a deplete ability, never use it again
        return actor.abilityHistory.every((a) => a.name !== ability.name);
    }

    return true;
};

/**
 * Given an ability, pick a target that makes sense
 */
const autoPickTarget = ({ ability, actor }: { ability: Ability; actor: CombatantInfo }): { index: number; side: BATTLEFIELD_SIDES } => {
    const { hostile, friendly, friendlySide, hostileSide, index } = actor;

    const { actions = [], minion } = ability;
    if (minion) {
        return {
            side: friendlySide,
            index: getRandomItem(getPossibleSummonIndices(friendly)),
        };
    }

    // For now we only make one selection, and assume that all abilities that contain at least one offensive action must select a hostile target
    const offensiveAction = actions.find(({ target }) => target === TARGET_TYPES.HOSTILE || target === TARGET_TYPES.RANDOM_HOSTILE);
    if (offensiveAction) {
        return {
            side: hostileSide,
            index: getRandomItem(
                getValidTargetIndices(hostile, {
                    // TODO area attacks are still applicable to stealthed units
                    excludeStealth: true,
                })
            ),
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

const handleCastTick = (actorId: string) => {
    return (dispatch, getState) => {
        const { combatant } = findCombatantData(getState, actorId);
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
                combatantId: actorId,
                newProperties: {
                    casting: updatedCasting.channelDuration || updatedCasting.castTime ? updatedCasting : null,
                },
            })
        );

        if (updatedCasting.castTime || isUnableToAct(combatant)) {
            return;
        }

        const battle = getState().battle;

        // If the original selected target is no longer valid, switch to a random new target. TODO area abilities could still be valid in the same spot
        const index =
            battle[selectedIndex]?.HP > 0 ? selectedIndex : autoPickTarget({ ability, actor: findCombatantData(getState, actorId) }).index;
        if (typeof index === "number") {
            dispatch(useAbility({ actorId, ability, side: selectedSide, selectedIndex: index }));
        }
    };
};

const CHANCE_TO_SKIP_REPEAT_ABILITY = 0.8;
const CHANCE_TO_SUMMON_MULTIPLIER = 0.15;

/**
 * Given an enemy or minion, pick an ability from its pool of abilities. (Not meant to be used for the player character who has cards etc.)
 * TODO -- If it is a single target attack, check that there is an enemy that can be targeted (eg. handle stealth).
 */
const pickAbility = ({ actor, hostile, friendly }: { actor: Combatant; hostile: Combatant[]; friendly: Combatant[] }): Ability => {
    let [specialAbilities, regularAbilities] = partition(
        (a) => a.resourceCost > 0,
        actor.abilities.filter((a) => canUseAbility({ actor, ability: a, hostile, friendly }))
    );

    const validPreemptiveAbilities = specialAbilities
        .concat(regularAbilities)
        .filter((ability: Ability) => ability.preemptive && actor.abilityHistory.every(({ name }) => name !== ability.name));
    if (validPreemptiveAbilities.length > 0) {
        return getRandomItem(validPreemptiveAbilities);
    }

    // If we are capped resources, we should always use a special ability, preferably the most expensive ones
    if (specialAbilities.length > 0 && actor.resources === actor.maxResources) {
        // TS does not have findLast array method
        const lastMaxSpecialAbilityUsed = (actor.abilityHistory as any).findLast((ability) => ability.resourceCost === actor.maxResources);
        let validMaxResourceAbilities = specialAbilities.filter(({ resourceCost }) => resourceCost === actor.maxResources);
        if (validMaxResourceAbilities.length > 1 && lastMaxSpecialAbilityUsed) {
            validMaxResourceAbilities = validMaxResourceAbilities.filter(({ name }) => name !== lastMaxSpecialAbilityUsed?.name);
        }
        return getRandomItem(validMaxResourceAbilities.length ? validMaxResourceAbilities : specialAbilities);
    }

    if (actor.damage > 0) {
        regularAbilities.push(getBasicAttack(actor));
    }

    if (Math.random() <= CHANCE_TO_SKIP_REPEAT_ABILITY) {
        // We are assuming that same name === same ability even though that is not actually guaranteed
        const lastAbilityUsed = actor.abilityHistory[actor.abilityHistory.length - 1];
        if (lastAbilityUsed) {
            // Don't remove its only ability though
            if (regularAbilities.length > 1) {
                const filtered = regularAbilities.filter(({ name }) => name !== lastAbilityUsed.name);
                // Deprioritize defensive abilities
                const isSupportAbility = ({ actions }) =>
                    actions.every(({ targetType }) => ![TARGET_TYPES.HOSTILE, TARGET_TYPES.RANDOM_HOSTILE].includes(targetType));
                const isAllSupportAbilitiesRemaining = filtered.every(isSupportAbility);
                if (!isAllSupportAbilitiesRemaining && !isSupportAbility(lastAbilityUsed)) {
                    regularAbilities = filtered;
                }
            }
            specialAbilities = specialAbilities.filter(({ name }) => name !== lastAbilityUsed.name);
        }
    }

    // Higher chance of picking minion summon if there are many spaces to summon
    let [minionSummonAbilities, otherAbilities] = partition(
        (ability) => ability.minion || ability.actions.some((a: Action) => a.summon),
        regularAbilities
    );
    const chanceToSummon = getPossibleSummonIndices(friendly).length * CHANCE_TO_SUMMON_MULTIPLIER;
    if (minionSummonAbilities.length > 0 && Math.random() <= chanceToSummon) {
        return getRandomItem(minionSummonAbilities);
    }

    // Pick a special ability at just a chance
    if (specialAbilities.length > 0) {
        let mostExpensive = 0;
        specialAbilities.forEach(({ resourceCost }) => {
            if (resourceCost > mostExpensive) {
                mostExpensive = resourceCost;
            }
        });

        if (Math.random() < actor.resources / (mostExpensive + 1)) {
            return getRandomItem(specialAbilities);
        }
    }

    return getRandomItem(otherAbilities);
};

const enemyUseAbility = (combatantId: string) => {
    return (dispatch, getState) => {
        const actorData = findCombatantData(getState, combatantId);
        const { combatant: actor, friendly, hostile } = actorData;
        const ability = pickAbility({ actor, friendly, hostile }); // Needs to be upfront resource cost?
        if (!ability) {
            return;
        }
        const { side, index } = autoPickTarget({ ability, actor: actorData });
        const { castTime, channelDuration } = ability;

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

        const resourceCost = (ability.resourceCost === "x" ? actor.resources : ability.resourceCost) || 0;
        dispatch(
            updateCombatant({
                combatantId,
                newProperties: {
                    casting,
                    resources: actor.resources - resourceCost,
                },
            })
        );
        if (!ability.castTime) {
            dispatch(useAbility({ ability, actorId: combatantId, side, selectedIndex: index }));
        }
    };
};

export const endEnemyTurn = () => {
    return (dispatch, getState) => {
        dispatch(onEndTurnTriggers(getState().battle.enemySide));
        setTimeout(() => {
            dispatch(
                updateBattle({
                    isPlayerTurn: true,
                })
            );
        }, 1000);
    };
};

export const startEnemyTurn = () => {
    return (dispatch, getState) => {
        const { enemySide, round } = getState().battle;
        const updateFns = [gainResources, clearTurnHistory];
        const updated = updateCharacters(enemySide, compose(...updateFns));
        dispatch(
            updateBattle({
                enemySide: updated,
            })
        );

        if (round > 0) {
            dispatch(checkHalveArmor(enemySide));
        }

        updated.forEach((combatant: Combatant | null) => {
            if (!combatant) {
                return;
            }

            dispatch(checkEventTrigger({ combatantId: combatant.id, effectEventKey: EFFECT_EVENT_KEYS.onTurnStart, source: null }));
            dispatch(tickDownStatusEffects(combatant.id, EFFECT_CLASSES.BUFF));
        });

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
                dispatch(updateBattleState(BATTLE_STATES.TURN_END));
                return;
            }

            const { id, casting } = enemy;
            acted[id] = true;
            const unableToAct = isUnableToAct(enemy);
            const delay = unableToAct ? 500 : 1500;
            setTimeout(() => {
                // Enemies who are unable to act still must lose a turn when casting an ability
                if (casting) {
                    dispatch(handleCastTick(id));
                } else if (!unableToAct) {
                    dispatch(enemyUseAbility(id));
                }
                makeEnemyMove();
            }, delay);
        };

        makeEnemyMove();
    };
};
