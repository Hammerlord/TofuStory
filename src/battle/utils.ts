import { Combatant } from "../character/types";
import {
    Action,
    ACTION_TYPES,
    Effect,
    EFFECT_CLASSES,
    EFFECT_TYPES,
    HandAbility,
    MULTIPLIER_TYPES,
    TARGET_TYPES,
} from "./../ability/types";
import { calculateActionArea } from "./parseAbilityActions";
import { passesConditions } from "./passesConditions";
import { BATTLEFIELD_SIDES } from "./types";

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

export const refreshPlayerResources = (character: Combatant): Combatant => {
    return {
        ...character,
        resources:
            Math.min(character.maxResources, character.resourcesPerTurn) +
            character.effects.reduce((acc: number, { resourcesPerTurn = 0 }) => acc + resourcesPerTurn, 0),
    };
};

export const isSilenced = (character: Combatant): boolean => {
    if (!character) {
        return false;
    }

    return character.effects.some((effect) => effect.type === EFFECT_TYPES.SILENCE);
};

export const addEnemyResources = (character: Combatant): Combatant => {
    if (isSilenced(character)) {
        return character;
    }
    return {
        ...character,
        resources: Math.min(
            character.maxResources,
            character.resources +
                character.resourcesPerTurn +
                character.effects.reduce((acc: number, { resourcesPerTurn = 0 }) => acc + resourcesPerTurn, 0)
        ),
    };
};

export const clearTurnHistory = (character: Combatant): Combatant => {
    return {
        ...character,
        turnHistory: [],
    };
};

/**
 * Reduces the duration of effects by 1 and removes them if they have run out of time
 */
export const tickDownDebuffs = (target: Combatant) => {
    if (!target) {
        return target;
    }
    return {
        ...target,
        effects: target.effects
            .map((effect) => {
                if (effect.class === EFFECT_CLASSES.DEBUFF) {
                    return {
                        ...effect,
                        duration: (isNaN(effect.duration) ? Infinity : effect.duration) - 1,
                    };
                }

                return effect;
            })
            .filter(({ duration = Infinity }) => duration > 0),
    };
};

export const tickDownBuffs = (target: Combatant) => {
    return {
        ...target,
        effects: target.effects
            .map((effect) => {
                if (effect.class === EFFECT_CLASSES.BUFF) {
                    return {
                        ...effect,
                        duration: (isNaN(effect.duration) ? Infinity : effect.duration) - 1,
                    };
                }

                return effect;
            })
            .filter(({ duration = Infinity }) => duration > 0),
    };
};

export const tickEffectUptime = (target: Combatant) => {
    return {
        ...target,
        effects: target.effects.map((effect) => ({
            ...effect,
            uptime: (effect.uptime || 0) + 1,
        })),
    };
};

export const checkHalveArmor = (target: Combatant): Combatant => {
    if (target.effects.some((effect) => effect.preventArmorDecay)) {
        return target;
    }
    return {
        ...target,
        armor: Math.floor(target.armor / 2),
    };
};

export const removeEndedEffects = (target: Combatant) => {
    if (!target) {
        return target;
    }

    return {
        ...target,
        effects: target.effects.filter(({ duration = Infinity }) => duration > 0),
    };
};

/**
 * Player conditional helpers
 */

export const canUseAbility = (character, ability: HandAbility | undefined): boolean => {
    const { resourceCost = 0, effects = {} } = ability;
    const { resourceCost: temporaryResourceCost = 0 } = effects;
    return resourceCost + temporaryResourceCost <= (character.resources || 0);
};

export const isValidTarget = ({ ability, side, allies, enemies, index, actor }): boolean => {
    // Get the first action target to determine whether a valid target has been clicked.
    const { actions = [], minion } = ability;

    if (minion) {
        return side === BATTLEFIELD_SIDES.ALLIES && (!allies[index] || allies[index].HP === 0);
    }

    const { target } = actions[0] || {};
    const area = calculateActionArea({ action: actions[0], actor }) || ability.area || 0;

    if (side === BATTLEFIELD_SIDES.ALLIES) {
        if (target === TARGET_TYPES.SELF) {
            return allies[index]?.isPlayer;
        }

        if (target === TARGET_TYPES.FRIENDLY) {
            const getCalculationTarget = (targetType) => {
                if (targetType === "actor") {
                    return actor;
                } else if (targetType === "target") {
                    return allies[index];
                }
            };
            const conditionsPassed = actions.every(({ conditions = [] }) => passesConditions({ getCalculationTarget, conditions }));
            if (area === 0) {
                // No sense in letting a single target ability whiff on an empty slot, for now
                return Boolean(allies[index]) && allies[index].HP > 0 && conditionsPassed;
            }

            return conditionsPassed;
        }
    } else if (side === BATTLEFIELD_SIDES.ENEMIES && (target === TARGET_TYPES.HOSTILE || target === TARGET_TYPES.RANDOM_HOSTILE)) {
        const targetedEnemy = enemies[index];
        const hasStealth = targetedEnemy?.effects.some(({ type }) => type === EFFECT_TYPES.STEALTH);
        if (hasStealth) {
            return false;
        }
        if (area === 0) {
            return targetedEnemy?.HP > 0;
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

/**
 * Clean up dead characters from previous events, or some staleness may occur.
 */
export const cleanUpDeadCharacters = (characters: (Combatant | null)[]) => {
    return characters.map((character) => {
        if (!character || character.HP > 0) {
            return character;
        }

        return null;
    });
};

export const getMultiplier = ({ actor, target, multiplier }: { actor?: Combatant; target?: Combatant; multiplier: any }): number => {
    const character = (() => {
        const calculationTarget = multiplier?.calculationTarget;
        if (!calculationTarget) {
            return;
        }

        return calculationTarget === "actor" ? actor : target;
    })();
    if (!multiplier || !character) {
        return 1;
    }

    if (multiplier.type === MULTIPLIER_TYPES.ATTACKS_MADE_IN_TURN) {
        return character.turnHistory.filter(({ type }) => type === ACTION_TYPES.ATTACK || type === ACTION_TYPES.RANGE_ATTACK).length + 1;
    }

    if (multiplier.type === MULTIPLIER_TYPES.ARMOR) {
        return character.armor || 1;
    }

    if (multiplier.type === MULTIPLIER_TYPES.MAX_HP) {
        const value = typeof multiplier.value === "number" ? multiplier.value : 1;
        return Math.floor(character.maxHP * value);
    }

    return 1;
};

export const getEnabledEffects = (character: Combatant | null): Effect[] => {
    if (!character) {
        return [];
    }

    if (isSilenced(character)) {
        return character.effects.filter((effect: Effect) => !effect.canBeSilenced);
    }

    return character.effects;
};

export const isCharacterImmune = (character: Combatant | null) => {
    if (!character) return false;
    return character.effects.some(({ type }) => type === EFFECT_TYPES.IMMUNITY);
};

export const isCharacterImmuneToAttacks = (character: Combatant | null) => {
    if (!character) return false;
    return character.effects.some(({ type }) => type === EFFECT_TYPES.ATTACK_IMMUNITY);
};

export const calculateDamage = ({
    actor,
    target,
    targetIndex,
    selectedIndex,
    action,
}: {
    actor?: Combatant;
    target?: Combatant;
    targetIndex?: number;
    selectedIndex?: number;
    action: Action;
}): number => {
    if (isCharacterImmune(target) || isCharacterImmuneToAttacks(target)) {
        return 0;
    }

    const baseDamage: number = (() => {
        if (action.secondaryDamage && targetIndex !== selectedIndex) {
            return action.secondaryDamage;
        }

        if (action.type === ACTION_TYPES.ATTACK || action.type === ACTION_TYPES.RANGE_ATTACK) {
            return action.damage || actor?.damage || 0;
        }

        return action.damage || 0;
    })();
    if (!actor) {
        return baseDamage;
    }

    let damageFromEffects = 0;
    let increaseDamageReceived = 0;
    if (action.type === ACTION_TYPES.ATTACK || action.type === ACTION_TYPES.RANGE_ATTACK) {
        damageFromEffects = getEnabledEffects(actor).reduce((acc, { damage = 0, conditions }) => {
            const getCalculationTarget = (calculationTarget: "effectOwner" | "externalParty") =>
                calculationTarget === "effectOwner" ? actor : target;
            if (passesConditions({ getCalculationTarget, conditions })) {
                return acc + damage;
            }
            return acc;
        }, 0);
        increaseDamageReceived = getEnabledEffects(target).reduce((acc, { damageReceived = 0 }) => acc + damageReceived, 0) || 0;
    }

    const damage = (damageFromEffects + baseDamage) * getMultiplier({ multiplier: action.multiplier, actor, target });
    const total = damage + increaseDamageReceived;
    if (total < 0) {
        return 0;
    }
    return total;
};

export const calculateArmor = ({ target, action }): number => {
    if (!action.armor) {
        return 0;
    }
    const targetArmor = getEnabledEffects(target).reduce((acc: number, { armorReceived = 0 }) => acc + armorReceived, 0) || 0;
    const armor = targetArmor + (action.armor || 0);
    return Math.max(0, armor * getMultiplier({ multiplier: action.multiplier, target }));
};

/**
 * @param characters
 * @returns indices of characters that are alive
 */
export const getValidTargetIndices = (characters: (Combatant | null)[], options: { excludeStealth?: boolean } = {}): number[] => {
    const indices = [];
    characters.forEach((character: Combatant | null, i: number) => {
        if (character && character.HP > 0) {
            if (!options.excludeStealth || !character.effects.some(({ type }) => type === EFFECT_TYPES.STEALTH)) {
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
    return indices.filter((i) => characters[i].HP < characters[i].maxHP);
};

export const updateCardEffects = (card: HandAbility, newEffects: { resourceCost?: number }): HandAbility => {
    const newCard = { ...card };
    Object.entries(newEffects).forEach(([key, value]) => {
        newCard.effects[key] = (newCard.effects[key] || 0) + value;
    });
    return newCard;
};
