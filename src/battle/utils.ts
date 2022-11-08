/**
 * @file Helpers for various battle functions
 */
import { Combatant } from "../character/types";
import { CrossedSwordsIcon } from "../images/icons";
import { Item } from "../item/types";
import {
    Ability,
    AbilityDamageReceived,
    Action,
    ACTION_TYPES,
    CombatEffect,
    CONDITION_TARGETS,
    EFFECT_CLASSES,
    EFFECT_TYPES,
    HandAbility,
    Multiplier,
    MULTIPLIER_TYPES,
    SCALING_VALUE_TYPES,
    TARGET_TYPES,
    TRIGGER_TARGET_TYPES,
} from "./../ability/types";
import { IndexedCombatant, passesConditions } from "./passesConditions";
import { BATTLEFIELD_SIDES } from "./types";

export const getCharacterStatChanges = ({ oldCharacter, newCharacter }: { oldCharacter: Combatant; newCharacter: Combatant }) => {
    const updatedStatChanges = {} as any;
    if (!oldCharacter || !newCharacter || oldCharacter?.id !== newCharacter?.id) {
        return updatedStatChanges;
    }
    if (newCharacter.HP < oldCharacter.HP) {
        updatedStatChanges.damage = oldCharacter.HP - newCharacter.HP;
    }

    if (newCharacter.HP > oldCharacter.HP) {
        updatedStatChanges.healing = newCharacter.HP - oldCharacter.HP;
    }

    if (newCharacter.armor > oldCharacter.armor) {
        updatedStatChanges.armor = newCharacter.armor - oldCharacter.armor;
    }

    return updatedStatChanges;
};

export const gainResources = (character: Combatant): Combatant => {
    if (isSilenced(character) || isUnableToAct(character)) {
        return character;
    }

    const resourcesGained =
        character.resourcesPerTurn +
        getEnabledEffects({ combatant: character }).reduce((acc: number, { resourcesPerTurn = 0 }) => acc + resourcesPerTurn, 0);

    return {
        ...character,
        resources: Math.max(Math.min(character.maxResources, character.resources + resourcesGained), 0),
    };
};

export const getMaxHP = (character: Combatant): number => {
    const silenced = isSilenced(character);
    const enabledEffects = character.effects?.filter((effect) => {
        const disabled = silenced && effect.canBeSilenced && effect.class === EFFECT_CLASSES.BUFF; // Only buffs can be silenced
        return !disabled;
    });
    // Conditional max HP checking can cause an infinite loop
    // For now assume that there are no conditions tied to max HP effects
    return character.maxHP + enabledEffects.reduce((acc, effect) => acc + (effect.maxHP || 0), 0);
};

export const updateHP = (character: Combatant, amount: number): number => {
    return Math.min(getMaxHP(character), character.HP + amount);
};

export const isSilenced = (character: Combatant): boolean => {
    return character?.effects?.some((effect) => effect.type === EFFECT_TYPES.SILENCE);
};

export const isStealthed = (character?: Combatant): boolean => {
    if (!character) {
        return false;
    }
    const silenced = isSilenced(character);
    return character.effects?.some(({ type, canBeSilenced }) => type === EFFECT_TYPES.STEALTH && (!canBeSilenced || !silenced));
};

export const clearTurnHistory = (character: Combatant): Combatant => {
    return {
        ...character,
        turnHistory: [],
    };
};

export const hasEffectType = (target: Combatant, effectType: EFFECT_TYPES | EFFECT_TYPES[]): boolean => {
    return getEnabledEffects({ combatant: target }).some(({ type }) =>
        Array.isArray(effectType) ? effectType.includes(type) : type === effectType
    );
};

/**
 * Player conditional helpers
 */

export const canUseAbility = (character, ability: HandAbility | undefined): boolean => {
    const { resourceCost = 0, effects = {} } = ability;
    const { resourceCost: temporaryResourceCost = 0 } = effects;
    if (resourceCost === "x") {
        return character.resources >= 1;
    }
    return resourceCost + temporaryResourceCost <= (character.resources || 0);
};

/**
 * Note to self: This is for PLAYER ACTIONS only
 */
export const isValidTarget = ({
    ability,
    side,
    playerSide,
    enemySide,
    index,
    actor,
    actorIndex,
}: {
    ability: Ability;
    side: BATTLEFIELD_SIDES;
    playerSide: (Combatant | null)[];
    enemySide: (Combatant | null)[];
    index: number;
    actor: Combatant;
    actorIndex: number;
}): boolean => {
    // Get the first action target to determine whether a valid target has been clicked.
    const { actions = [], minion } = ability;

    if (minion) {
        return side === BATTLEFIELD_SIDES.PLAYER_SIDE && (!playerSide[index] || playerSide[index].HP === 0);
    }

    const { target } = actions[0] || {};
    const area = calculateActionArea({ action: actions[0], actor }) || actions[0].area || 0;

    if (side === BATTLEFIELD_SIDES.PLAYER_SIDE) {
        if (target === TARGET_TYPES.SELF) {
            return playerSide[index]?.isPlayer;
        }

        if (target === TARGET_TYPES.FRIENDLY) {
            const getCalculationTarget = (targetType: TRIGGER_TARGET_TYPES): IndexedCombatant => {
                if (targetType === TRIGGER_TARGET_TYPES.ACTOR) {
                    return { combatant: actor, index: actorIndex };
                } else if (targetType === TRIGGER_TARGET_TYPES.TARGET) {
                    return { combatant: playerSide[index], index };
                }
            };
            const conditionsPassed = actions.some((action) => passesConditions({ getCalculationTarget, proc: action }));
            if (area === 0) {
                // No sense in letting a single target ability whiff on an empty slot, for now
                return Boolean(playerSide[index]) && playerSide[index].HP > 0 && conditionsPassed;
            }

            return conditionsPassed;
        }
    } else if (side === BATTLEFIELD_SIDES.ENEMY_SIDE && (target === TARGET_TYPES.HOSTILE || target === TARGET_TYPES.RANDOM_HOSTILE)) {
        const targetedEnemy = enemySide[index];
        if (isStealthed(targetedEnemy)) {
            return false;
        }
        const getCalculationTarget = (targetType: TRIGGER_TARGET_TYPES): IndexedCombatant => {
            if (targetType === TRIGGER_TARGET_TYPES.ACTOR) {
                return { combatant: actor, index: actorIndex };
            } else if (targetType === TRIGGER_TARGET_TYPES.TARGET) {
                return { combatant: targetedEnemy, index };
            }
        };
        const conditionsPassed = actions.some((action) => passesConditions({ getCalculationTarget, proc: action }));
        if (area === 0) {
            return targetedEnemy?.HP > 0 && conditionsPassed;
        }
        return true;
    }

    return false;
};

export const updateCharacters = (characters: (Combatant | null)[], updateFn): (Combatant | null)[] => {
    return characters.map((character) => {
        if (!character) {
            return character;
        }

        return updateFn(character);
    });
};

export const getMultiplier = ({
    actor,
    target,
    allTargets = [],
    sourceTargets = [],
    actionParent,
    multiplier,
}: {
    actor?: IndexedCombatant;
    target?: IndexedCombatant;
    allTargets?: IndexedCombatant[];
    sourceTargets?: IndexedCombatant[];
    actionParent?: Ability | Item;
    multiplier?: Multiplier;
}): number => {
    const getCalculationTarget = (calculationTarget) => {
        if (calculationTarget === CONDITION_TARGETS.ACTOR) {
            return actor;
        }

        if (calculationTarget === CONDITION_TARGETS.TARGET) {
            return target;
        }
    };
    const { combatant } = getCalculationTarget(multiplier?.calculationTarget) || {};

    if (!multiplier) {
        return 1;
    }

    const numValue = typeof multiplier.value === "number" ? multiplier.value : 1;

    if (multiplier.type === MULTIPLIER_TYPES.NUM_AFFECTED_TARGETS) {
        return allTargets.length * numValue || 1;
    }

    if (multiplier.type === MULTIPLIER_TYPES.NUM_SOURCE_TARGETS) {
        return sourceTargets.length * numValue || 1;
    }

    if (!combatant) {
        return 1;
    }

    if (multiplier.type === MULTIPLIER_TYPES.ATTACKS_MADE_IN_TURN) {
        return combatant.turnHistory.filter(({ type }) => type === ACTION_TYPES.ATTACK || type === ACTION_TYPES.RANGE_ATTACK).length + 1;
    }

    if (multiplier.type === MULTIPLIER_TYPES.ARMOR) {
        return combatant.armor || 1;
    }

    if (multiplier.type === MULTIPLIER_TYPES.MAX_HP) {
        return Math.ceil(getMaxHP(combatant) * numValue);
    }

    if (multiplier.type === MULTIPLIER_TYPES.HP) {
        return Math.ceil(combatant.HP * numValue);
    }

    if (multiplier.type === MULTIPLIER_TYPES.DEBUFFS) {
        return (
            getEnabledEffects({ combatant, getCalculationTarget }).filter((effect: CombatEffect) => effect.class === EFFECT_CLASSES.DEBUFF)
                .length || 1
        );
    }

    if (multiplier.type === MULTIPLIER_TYPES.BLEEDS) {
        return (
            getEnabledEffects({ combatant, getCalculationTarget }).filter((effect: CombatEffect) => effect.type === EFFECT_TYPES.BLEED)
                .length || 1
        );
    }

    // @ts-ignore -- We are checking the existence of resourceCost here either way
    if (multiplier.type === MULTIPLIER_TYPES.RESOURCES_SPENT && typeof actionParent?.resourceCost === "number") {
        // @ts-ignore
        return actionParent.resourceCost;
    }

    return 1;
};

/**
 * Given a character, return its effects that have not been canceled due to silence or failing conditions.
 */
export const getEnabledEffects = ({
    combatant,
    index,
    getCalculationTarget,
}: {
    combatant?: Combatant;
    index?: number; // Combatant slot index. May not be provided if the case doesn't need to know where combatant is located
    getCalculationTarget?: (
        calculationTarget: CONDITION_TARGETS.ACTOR | CONDITION_TARGETS.TARGET | TRIGGER_TARGET_TYPES
    ) => IndexedCombatant | IndexedCombatant[];
}): CombatEffect[] => {
    if (!combatant?.effects) {
        return [];
    }

    const silenced = isSilenced(combatant);
    const getCalculationTargetFn = (calcTarget) => {
        if (calcTarget === TRIGGER_TARGET_TYPES.EFFECT_OWNER) {
            return { combatant, index };
        }

        // getCalculationTarget allows finding combatants beyond the effect owner, and should be provided for scenarios where a check against an external party needs to be made,
        // for example, proximity between two combatants. It need not be provided by consumers in cases where there is no "other party" in the calculation, such as
        // determining whether `combatant` has a certain effect type has nothing to do with any other combatant.
        if (getCalculationTarget) {
            return getCalculationTarget(calcTarget);
        }
    };

    return combatant.effects?.filter((effect) => {
        const disabled = silenced && effect.canBeSilenced && effect.class === EFFECT_CLASSES.BUFF; // Only buffs can be silenced
        return !disabled && passesConditions({ getCalculationTarget: getCalculationTargetFn, proc: effect });
    });
};

const getSkillDamage = ({ ability, skillBonus }) => {
    if (!skillBonus) {
        return 0;
    }

    for (const { skill, damage = 0 } of skillBonus) {
        if (skill === ability?.name) {
            return damage || 0;
        }
    }

    return 0;
};

export const calculateDamage = ({
    actor,
    target,
    targetIndex,
    selectedIndex,
    action,
    actionParent,
}: {
    actor?: IndexedCombatant;
    target?: IndexedCombatant;
    targetIndex?: number;
    selectedIndex?: number;
    action: Action;
    actionParent?: Ability | Item;
}): number => {
    const isAttack = action.type === ACTION_TYPES.ATTACK || action.type === ACTION_TYPES.RANGE_ATTACK;

    if (
        hasEffectType(target?.combatant, EFFECT_TYPES.IMMUNITY) ||
        (isAttack && hasEffectType(target?.combatant, EFFECT_TYPES.ATTACK_IMMUNITY))
    ) {
        return 0;
    }

    const baseDamage: number = (() => {
        if (action.secondaryDamage && targetIndex !== selectedIndex) {
            return action.secondaryDamage;
        }

        if (isAttack) {
            return action.damage || actor?.combatant?.damage || 0;
        }

        return action.damage || 0;
    })();
    if (!actor) {
        return baseDamage;
    }

    const getCalculationTarget = (calculationTarget: TRIGGER_TARGET_TYPES): IndexedCombatant => {
        if (calculationTarget === TRIGGER_TARGET_TYPES.ACTOR) {
            return actor;
        }

        if (calculationTarget === TRIGGER_TARGET_TYPES.TARGET) {
            return target;
        }
    };

    const damageFromEffects = getEnabledEffects({ ...actor, getCalculationTarget }).reduce(
        (acc, { attackPower = 0, skillBonus = [], excludeEffectOwner }) => {
            if (excludeEffectOwner) {
                return acc;
            }
            // Attack power only applies to attacks
            const attackPowerIncrease = isAttack ? attackPower : 0;
            return acc + getSkillDamage({ ability: actionParent, skillBonus }) + attackPowerIncrease;
        },
        0
    );

    const applyAbilityDamageReceived = (damage): number => {
        const { multiplier, additionalDamageReceived } = getEnabledEffects({ ...target, getCalculationTarget }).reduce(
            (acc, { attackDamageReceived = 0, abilityDamageReceived }) => {
                acc.additionalDamageReceived += isAttack ? attackDamageReceived : 0;

                abilityDamageReceived?.forEach(({ abilityName, damage = 0, type }: AbilityDamageReceived) => {
                    if (abilityName && abilityName.toLowerCase() === actionParent?.name.toLowerCase()) {
                        if (type === SCALING_VALUE_TYPES.PERCENTAGE) {
                            acc.multiplier += damage;
                        } else {
                            acc.additionalDamageReceived += damage;
                        }
                    }
                });

                return acc;
            },
            { multiplier: 0, additionalDamageReceived: 0 }
        );

        return (damage + additionalDamageReceived) * (multiplier || 1);
    };

    const damage = (damageFromEffects + baseDamage) * getMultiplier({ multiplier: action.multiplier, actor, target });
    const total = Math.ceil(applyAbilityDamageReceived(damage));
    return Math.max(0, total);
};

export const calculateArmor = ({
    actor,
    target,
    action,
}: {
    actor: IndexedCombatant;
    target?: IndexedCombatant;
    action: Action;
}): number => {
    if (!action.armor) {
        return 0;
    }
    const targetArmorReceived = getEnabledEffects(target).reduce((acc: number, { armorReceived = 0 }) => acc + armorReceived, 0) || 0;
    const armor = targetArmorReceived + action.armor * getMultiplier({ multiplier: action.multiplier, target, actor });
    return Math.max(0, armor);
};

export const calculateHealing = ({
    actor,
    target,
    action,
}: {
    actor: IndexedCombatant;
    target?: IndexedCombatant;
    action: Action;
}): number => {
    if (!action.healing) {
        return 0;
    }
    const healingReceived = getEnabledEffects(target).reduce((acc: number, { healingReceived = 0 }) => acc + healingReceived, 0) || 0;
    const healing = healingReceived + action.healing * getMultiplier({ multiplier: action.multiplier, target, actor });
    return Math.max(0, healing);
};

/**
 * @param characters
 * @returns indices of characters that are alive
 */
export const getValidTargetIndices = (
    characters: (Combatant | null)[],
    options: { excludeStealth?: boolean; excludeIndex?: number } = {}
): number[] => {
    const indices = [];
    characters.forEach((character: Combatant | null, i: number) => {
        if (character?.HP > 0) {
            const notStealth = !options.excludeStealth || !isStealthed(character);
            const notExcluded = options.excludeIndex !== i;
            if (notStealth && notExcluded) {
                indices.push(i);
            }
        }
    });
    return indices;
};

export const getEmptyIndices = (characters: (Combatant | null)[]): number[] => {
    const indices = [];
    characters.forEach((character: Combatant | null, i: number) => {
        if (!character || character.HP <= 0) {
            indices.push(i);
        }
    });
    return indices;
};

export const getHealableIndices = (characters: (Combatant | null)[]): number[] => {
    const indices = getValidTargetIndices(characters);
    // Injured targets only
    return indices.filter((i) => characters[i].HP < getMaxHP(characters[i]));
};

export const updateCardEffects = (card: HandAbility, newEffects: { resourceCost?: number }): HandAbility => {
    const newCard = { ...card, effects: { ...card.effects } };
    Object.entries(newEffects).forEach(([key, value]) => {
        newCard.effects[key] = (newCard.effects[key] || 0) + value;
    });
    return newCard;
};

export const calculateActionArea = ({ action, actor }: { action?: Action; actor: Combatant }): number => {
    if (!action) {
        return 0;
    }
    const { type, area = 0 } = action;
    const isAttack = type === ACTION_TYPES.ATTACK || type === ACTION_TYPES.RANGE_ATTACK;
    let totalArea = area;
    if (isAttack) {
        getEnabledEffects({ combatant: actor }).forEach(({ attackAreaIncrease = 0 }) => {
            totalArea += attackAreaIncrease;
        });
    }

    return totalArea;
};

export const applyVacuum = ({
    characters,
    index,
    area,
    distance,
}: {
    characters: (Combatant | null)[];
    index: number;
    area: number;
    distance: number;
}) => {
    const newCharacters = characters.slice();
    for (let i = 1; i <= area; ++i) {
        if (newCharacters[index + i]) {
            for (let j = 0; j < i && j < distance; ++j) {
                const existingCharacter = newCharacters[index + j];
                if (!existingCharacter || existingCharacter.HP === 0) {
                    newCharacters[index + j] = newCharacters[index + i];
                    newCharacters[index + i] = null;
                }
            }
        }
        if (newCharacters[index - i]) {
            for (let j = 0; j < i && j < distance; ++j) {
                const existingCharacter = newCharacters[index - j];
                if (!existingCharacter || existingCharacter.HP === 0) {
                    newCharacters[index - j] = newCharacters[index - i];
                    newCharacters[index - i] = null;
                }
            }
        }
    }
    return newCharacters;
};

export const getBasicAttack = (actor: Combatant): Ability => {
    if (actor.attack) {
        return actor.attack;
    }
    return {
        name: "Attack",
        image: CrossedSwordsIcon,
        actions: [
            {
                damage: actor.damage || 0,
                target: TARGET_TYPES.HOSTILE,
                type: ACTION_TYPES.ATTACK,
            },
        ],
    };
};

export const getInducedAttack = (actor: Combatant): Action => {
    return {
        damage: actor.damage || 0,
        target: TARGET_TYPES.RANDOM_HOSTILE,
        type: ACTION_TYPES.ATTACK,
        playbackTime: 400,
    };
};

export const isUnableToAct = (combatant: Combatant): boolean => {
    return combatant?.effects.some((effect) => [EFFECT_TYPES.STUN, EFFECT_TYPES.FREEZE].includes(effect.type));
};

export const getPossibleMoveIndices = ({ currentLocationIndex, friendly, movement = 0 }): number[] => {
    const min = Math.max(0, currentLocationIndex - movement);
    const max = Math.min(friendly.length - 1, currentLocationIndex + movement);
    const moveIndices = [];
    for (let i = min; i <= max; ++i) {
        if (!friendly[i]) {
            moveIndices.push(i);
        }
    }

    return moveIndices;
};

export const getPossibleSummonIndices = (friendly: (Combatant | null)[]): number[] => {
    const indices = [];
    friendly.forEach((f, i) => {
        if (!f || f.HP <= 0) indices.push(i);
    });

    return indices;
};

export const calculateBonus = ({
    action,
    target,
    allTargets,
    actor,
    isTargetSelected,
    actionParent,
}: {
    action: Action; // The action to apply the bonus to
    target: IndexedCombatant;
    allTargets: IndexedCombatant[];
    actor: IndexedCombatant;
    isTargetSelected: boolean;
    actionParent?: Ability | Item;
}): Action => {
    if (!action.bonus) {
        return action;
    }

    const { bonus, damage = 0, secondaryDamage, healing = 0, armor = 0, effects = [], area = 0 } = action;
    const { excludePrimaryTarget = false } = bonus;
    const multiplier = getMultiplier({ actor, target, allTargets, multiplier: bonus.multiplier, actionParent });

    const getCalculationTarget = (conditionTarget: CONDITION_TARGETS.ACTOR | CONDITION_TARGETS.TARGET): IndexedCombatant => {
        if (conditionTarget === CONDITION_TARGETS.TARGET) {
            return target;
        } else if (conditionTarget === CONDITION_TARGETS.ACTOR) {
            return actor;
        }
    };
    const isValidTarget = !excludePrimaryTarget || !isTargetSelected;
    if (passesConditions({ getCalculationTarget, proc: bonus }) && isValidTarget) {
        const bonusDamage = (bonus.damage || 0) * multiplier;
        return {
            ...action,
            area: area + (bonus.area || 0),
            damage: damage + bonusDamage,
            secondaryDamage: secondaryDamage && secondaryDamage + bonusDamage,
            healing: healing + (bonus.healing || 0) * multiplier,
            armor: armor + (bonus.armor || 0) * multiplier,
            effects: [...effects, ...(bonus.effects || [])],
        } as Action;
    }
    return action;
};

export const isWithinAbilityArea = ({ ability, actor, selectedIndex, targetIndex }): boolean => {
    if ([selectedIndex, targetIndex].some((i) => typeof i !== "number")) {
        return false;
    }
    const action = ability.actions[0];
    const area = calculateActionArea({ action, actor }) || action?.area || 0;
    return Math.abs(selectedIndex - targetIndex) <= area;
};
