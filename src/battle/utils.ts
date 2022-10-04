/**
 * @file Helpers for various battle functions
 */
import { Combatant } from "../character/types";
import { CrossedSwords } from "../images";
import {
    Ability,
    Action,
    ACTION_TYPES,
    EFFECT_CLASSES,
    EFFECT_TYPES,
    HandAbility,
    MULTIPLIER_TYPES,
    TARGET_TYPES,
    TRIGGER_TARGET_TYPES,
    CONDITION_TARGETS,
    Multiplier,
    CombatEffect,
} from "./../ability/types";
import { passesConditions } from "./passesConditions";
import { BATTLEFIELD_SIDES, TriggerSource } from "./types";

export const getCharacterStatChanges = ({ oldCharacter, newCharacter }: { oldCharacter: Combatant; newCharacter: Combatant }) => {
    const updatedStatChanges = {} as any;
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
    if (isSilenced(character)) {
        return character;
    }

    const resourcesGained =
        character.resourcesPerTurn +
        getEnabledEffects(character).reduce((acc: number, { resourcesPerTurn = 0 }) => acc + resourcesPerTurn, 0);

    return {
        ...character,
        resources: Math.min(character.maxResources, character.resources + resourcesGained),
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

export const updateHPByPercentage = (character: Combatant, percentage: number): number => {
    const maxHP = getMaxHP(character);
    return Math.min(maxHP, character.HP + Math.floor(maxHP * percentage));
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

export const checkHalveArmor = (target: Combatant): Combatant => {
    if (getEnabledEffects(target).some((effect) => effect.preventArmorDecay)) {
        return target;
    }
    return {
        ...target,
        armor: Math.floor(target.armor / 2),
    };
};

export const hasEffectType = (target: Combatant, effectType: EFFECT_TYPES | EFFECT_TYPES[]): boolean => {
    return (
        target &&
        getEnabledEffects(target).some(({ type }) => (Array.isArray(effectType) ? effectType.includes(type) : type === effectType))
    );
};

/**
 * Player conditional helpers
 */

export const canUseAbility = (character, ability: HandAbility | undefined): boolean => {
    const { resourceCost = 0, effects = {} } = ability;
    const { resourceCost: temporaryResourceCost = 0 } = effects;
    return resourceCost + temporaryResourceCost <= (character.resources || 0);
};

/**
 * Note to self: This is for PLAYER ACTIONS only
 */
export const isValidTarget = ({ ability, side, playerSide, enemySide, index, actor }): boolean => {
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
            const getCalculationTarget = (targetType) => {
                if (targetType === TRIGGER_TARGET_TYPES.ACTOR) {
                    return actor;
                } else if (targetType === TRIGGER_TARGET_TYPES.TARGET) {
                    return playerSide[index];
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
        const getCalculationTarget = (targetType) => {
            if (targetType === TRIGGER_TARGET_TYPES.ACTOR) {
                return actor;
            } else if (targetType === TRIGGER_TARGET_TYPES.TARGET) {
                return targetedEnemy;
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
    multiplier,
}: {
    actor?: Combatant;
    target?: Combatant;
    allTargets?: Combatant[];
    sourceTargets?: Combatant[];
    multiplier: Multiplier;
}): number => {
    const character = (() => {
        const calculationTarget = multiplier?.calculationTarget;
        if (!calculationTarget) {
            return;
        }

        if (calculationTarget === CONDITION_TARGETS.ACTOR && actor) {
            return actor;
        }

        if (calculationTarget === CONDITION_TARGETS.TARGET && target) {
            return target;
        }
    })();

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

    if (!character) {
        return 1;
    }

    if (multiplier.type === MULTIPLIER_TYPES.ATTACKS_MADE_IN_TURN) {
        return character.turnHistory.filter(({ type }) => type === ACTION_TYPES.ATTACK || type === ACTION_TYPES.RANGE_ATTACK).length + 1;
    }

    if (multiplier.type === MULTIPLIER_TYPES.ARMOR) {
        return character.armor || 1;
    }

    if (multiplier.type === MULTIPLIER_TYPES.MAX_HP) {
        return Math.floor(getMaxHP(character) * numValue);
    }

    if (multiplier.type === MULTIPLIER_TYPES.DEBUFFS) {
        return getEnabledEffects(character).filter((effect: CombatEffect) => effect.class === EFFECT_CLASSES.DEBUFF).length || 1;
    }

    if (multiplier.type === MULTIPLIER_TYPES.BLEEDS) {
        return getEnabledEffects(character).filter((effect: CombatEffect) => effect.type === EFFECT_TYPES.BLEED).length || 1;
    }

    return 1;
};

/**
 * Given a character, return its effects that have not been canceled due to silence or failing conditions.
 */
export const getEnabledEffects = (character?: Combatant | null): CombatEffect[] => {
    if (!character?.effects) {
        return [];
    }

    const silenced = isSilenced(character);

    const getCalculationTarget = (calculationTarget: TRIGGER_TARGET_TYPES) =>
        calculationTarget === TRIGGER_TARGET_TYPES.EFFECT_OWNER ? character : undefined;

    return character.effects?.filter((effect) => {
        const disabled = silenced && effect.canBeSilenced && effect.class === EFFECT_CLASSES.BUFF; // Only buffs can be silenced
        return !disabled && passesConditions({ getCalculationTarget, proc: effect });
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
    ability,
}: {
    actor?: Combatant;
    target?: Combatant;
    targetIndex?: number;
    selectedIndex?: number;
    action: Action;
    ability?: Ability;
}): number => {
    const isAttack = action.type === ACTION_TYPES.ATTACK || action.type === ACTION_TYPES.RANGE_ATTACK;

    if (hasEffectType(target, EFFECT_TYPES.IMMUNITY) || (isAttack && hasEffectType(target, EFFECT_TYPES.ATTACK_IMMUNITY))) {
        return 0;
    }

    const baseDamage: number = (() => {
        if (action.secondaryDamage && targetIndex !== selectedIndex) {
            return action.secondaryDamage;
        }

        if (isAttack) {
            return action.damage || actor?.damage || 0;
        }

        return action.damage || 0;
    })();
    if (!actor) {
        return baseDamage;
    }

    const damageFromEffects = getEnabledEffects(actor).reduce((acc, { attackPower = 0, skillBonus = [], excludeEffectOwner }) => {
        if (excludeEffectOwner) {
            return acc;
        }
        // Attack power only applies to attacks
        const attackPowerIncrease = isAttack ? attackPower : 0;
        return acc + getSkillDamage({ ability, skillBonus }) + attackPowerIncrease;
    }, 0);

    const getAbilityDamageReceived = (abilityDamageReceived): number => {
        if (!abilityDamageReceived) {
            return 0;
        }
        return abilityDamageReceived?.reduce((acc, { abilityName, damage = 0 }) => {
            if (abilityName && abilityName.toLowerCase() === ability?.name.toLowerCase()) {
                acc += damage;
            }
            return acc;
        }, 0);
    };

    const damageReceivedFromEffects =
        getEnabledEffects(target).reduce((acc, { attackDamageReceived = 0, abilityDamageReceived }) => {
            acc += isAttack ? attackDamageReceived : 0;
            acc += getAbilityDamageReceived(abilityDamageReceived);
            return acc;
        }, 0) || 0;

    const damage = (damageFromEffects + baseDamage) * getMultiplier({ multiplier: action.multiplier, actor, target: target });
    const total = damage + damageReceivedFromEffects;
    return Math.max(0, total);
};

export const calculateArmor = ({ actor, target, action }): number => {
    if (!action.armor) {
        return 0;
    }
    const targetArmor = getEnabledEffects(target).reduce((acc: number, { armorReceived = 0 }) => acc + armorReceived, 0) || 0;
    const armor = targetArmor + (action.armor || 0);
    return Math.max(0, armor * getMultiplier({ multiplier: action.multiplier, target: target, actor }));
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
    const newCard = { ...card };
    Object.entries(newEffects).forEach(([key, value]) => {
        newCard.effects[key] = (newCard.effects[key] || 0) + value;
    });
    return newCard;
};

/**
 * Given an actor and the battlefield, find which side is friendly to the actor and which side is hostile.
 */
export const orientate = ({ actorId, enemySide, playerSide }) => {
    const { PLAYER_SIDE, ENEMY_SIDE } = BATTLEFIELD_SIDES;
    const [actorSide, hostileSide] = playerSide.find((c) => c?.id === actorId) ? [PLAYER_SIDE, ENEMY_SIDE] : [ENEMY_SIDE, PLAYER_SIDE];
    const [friendly, hostile] = actorSide === PLAYER_SIDE ? [playerSide, enemySide] : [enemySide, playerSide];
    const actorIndex = friendly.findIndex((c) => c?.id === actorId);
    return {
        friendly: friendly.slice(),
        hostile: hostile.slice(),
        actorSide,
        hostileSide,
        actorIndex,
        actor: friendly[actorIndex],
    };
};

export const calculateActionArea = ({ action, actor }: { action?: Action; actor: Combatant }): number => {
    if (!action) {
        return 0;
    }
    const { type, area = 0 } = action;
    const isAttack = type === ACTION_TYPES.ATTACK || type === ACTION_TYPES.RANGE_ATTACK;
    let totalArea = area;
    if (isAttack) {
        getEnabledEffects(actor).forEach(({ attackAreaIncrease = 0 }) => {
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
        image: CrossedSwords,
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
        if (!f || f.HP === 0) indices.push(i);
    });

    return indices;
};

export const calculateMultiplier = ({
    action,
    actor,
    target,
    allTargets,
    sourceTargets,
    multiplier,
}: {
    action: Action; // The action to apply the mutiplier to
    target: Combatant;
    allTargets?: Combatant[];
    sourceTargets?: Combatant[];
    actor: Combatant;
    multiplier?: Multiplier;
}) => {
    if (!multiplier) {
        return action;
    }
    const multiplierValue = getMultiplier({ actor, allTargets, sourceTargets, target, multiplier });
    const { damage = 0, secondaryDamage = 0, healing = 0, armor = 0 } = action;

    return {
        ...action,
        damage: damage * multiplierValue,
        secondaryDamage: secondaryDamage * multiplierValue,
        healing: healing * multiplierValue,
        armor: armor * multiplierValue,
    } as Action;
};

export const calculateBonus = ({
    action,
    target,
    allTargets,
    actor,
    isTargetSelected,
}: {
    action: Action; // The action to apply the bonus to
    target: Combatant;
    allTargets: Combatant[];
    actor: Combatant;
    isTargetSelected: boolean;
}): Action => {
    if (!action.bonus) {
        return action;
    }

    const { bonus, damage = 0, secondaryDamage, healing = 0, armor = 0, effects = [] } = action;
    const { excludePrimaryTarget = false } = bonus;
    const multiplier = getMultiplier({ actor, target, allTargets, multiplier: bonus.multiplier });

    const getCalculationTarget = (conditionTarget: CONDITION_TARGETS.ACTOR | CONDITION_TARGETS.TARGET) => {
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

/**
 * TODO re-enable auras
 * const renewPersistentAuras = (characters: (Combatant | null)[]) => {
    const updated = characters.map((character) => {
        if (!character) {
            return character;
        }

        return {
            ...cloneDeep(character),
            effects: character.effects.filter((effect) => !effect.isAuraEffect),
        };
    });

    updated.forEach((character: Combatant | null, i) => {
        const { aura, HP = 0 } = character || {};
        if (aura && HP > 0) {
            // Only a subset of aura properties are "persistent" effects -- apply or fade based on proximity to the
            // owner of the aura at any given moment
            const { area = 0, damage = 0, thorns = 0 } = aura;
            for (let j = i - area; j <= i + area; ++j) {
                // Aura effects do not apply to the owner of the aura
                if (i !== j && updated[j] && updated[j].HP > 0) {
                    updated[j].effects.push({
                        thorns,
                        damage,
                        isAuraEffect: true,
                    });
                }
            }
        }
    });
    return updated;
};

 */
