import { AbilityEffect, ActionOptionalProperties, SkillBonus } from "./../ability/types";
/**
 * @file Helpers for various battle functions
 */
import _ from "lodash";
import { isAttackAbility, isAttackAction, isOffensiveAbility, isOffensiveAction } from "../ability/AbilityView/utils";
import { Combatant, Player } from "../character/types";
import { CrossedSwordsImage } from "../images";
import { Item } from "../item/types";
import {
    ACTION_TYPES,
    Ability,
    Action,
    Bonus,
    CONDITION_TARGETS,
    CombatAbility,
    CombatEffect,
    EFFECT_CLASSES,
    EFFECT_TYPES,
    Effect,
    MULTIPLIER_TYPES,
    Multiplier,
    TARGET_TYPES,
    TRIGGER_TARGET_TYPES,
} from "./../ability/types";
import { findCombatantData } from "./actions/actions";
import { BASE_MAX_RESOURCES, DAMAGE_COEFF, INDUCED_ACTION_PLAYBACK_SPEED } from "./constants";
import { getHandAuraEffects } from "./Hand";
import { passesConditions, passesValueComparison } from "./passesConditions";
import { BattleState } from "./reducer";
import { BATTLEFIELD_SIDES, CombatantInfo, Displacement, TRIGGER_SOURCE_TYPES, TriggerSource } from "./types";

export const getMaxHP = (character?: Combatant | null): number => {
    if (!character) {
        return 0;
    }

    const silenced = isSilenced(character);
    const enabledEffects = character.effects?.filter((effect) => {
        const disabled = silenced && effect.canBeSilenced && effect.class === EFFECT_CLASSES.BUFF; // Only buffs can be silenced
        return !disabled;
    });
    // Conditional max HP checking can cause an infinite loop
    // For now assume that there are no conditions tied to max HP effects
    return (
        character.maxHP +
        enabledEffects.reduce((acc, effect) => {
            const maxHP = (effect.maxHP || 0) * (effect.stacks || 1);
            return acc + maxHP;
        }, 0)
    );
};

// We're just going to assume max resource effects always take hold (does not need to pass conditions and cannot be silenced)
// There is only one example of max resource increase, and it is for the player character only:
/** @see emerald */
export const getMaxResources = (character: Combatant): number => {
    if (!character) {
        return 0;
    }
    const { maxResources: initMaxResources = BASE_MAX_RESOURCES, effects = [] } = character;
    return effects.reduce((acc, effect) => acc + (effect?.maxResources || 0), initMaxResources);
};

export const updateHP = (character: Combatant, amount: number): number => {
    return Math.min(getMaxHP(character), character.HP + amount);
};

export const isSilenced = (character: Combatant): boolean => {
    return character?.effects?.some((effect) => effect.type === EFFECT_TYPES.SILENCE);
};

export const canTargetIfStealthed = (actor: Combatant, target: Combatant, action?: Action): boolean => {
    return !isStealthed(target) || hasTruesight(actor) || action?.bypassStealth;
};

export const isStealthed = (character?: Combatant | null): boolean => {
    if (!character) {
        return false;
    }
    const silenced = isSilenced(character);
    return character.effects?.some(({ type, canBeSilenced }) => type === EFFECT_TYPES.STEALTH && (!canBeSilenced || !silenced));
};

export const isUntargetable = (character?: Combatant | null): boolean => {
    if (!character) {
        return false;
    }
    return character.effects?.some(({ untargetable }) => untargetable);
};

export const hasTruesight = (character?: Combatant): boolean => {
    if (!character) {
        return false;
    }
    const silenced = isSilenced(character);
    return character.effects?.some(({ truesight, canBeSilenced }) => truesight && (!canBeSilenced || !silenced));
};

export const clearTurnHistory = (character: Combatant): Combatant => {
    return {
        ...character,
        turnHistory: [],
    };
};

export const hasEffectType = (target: CombatantInfo | undefined, effectType: EFFECT_TYPES | EFFECT_TYPES[]): boolean => {
    if (!target) {
        return false;
    }

    return getEnabledEffects({ combatantInfo: target }).some(({ type }) =>
        Array.isArray(effectType) ? effectType.includes(type) : type === effectType
    );
};

/**
 * Player conditional helpers
 */
export const canUseAbility = (character: Combatant, ability: CombatAbility | undefined): boolean => {
    const isUnplayable = ability.unplayable && !ability.effects?.some((e) => e.bypassUnplayable);
    if (!character || !ability || isUnplayable || ability.effects?.some((e) => e.isLocked)) {
        return false;
    }

    const { resourceCost = 0, effects = [] } = ability;
    if (resourceCost === "x") {
        return character.resources > 0;
    }

    const resourceCostFromEffects = effects.reduce((acc, e: AbilityEffect) => {
        return acc + (e.resourceCost || 0);
    }, 0);
    return resourceCost + resourceCostFromEffects <= (character.resources || 0);
};

/**
 * Note to self: This is for PLAYER ACTIONS only
 */
export const isValidTarget = ({
    ability,
    side,
    battle,
    index,
    actorId,
}: {
    ability: Ability;
    side: BATTLEFIELD_SIDES;
    battle: BattleState;
    index: number;
    actorId: string;
}): boolean => {
    if (!ability) {
        return false;
    }

    // Get the first action target to determine whether a valid target has been clicked.
    const { actions = [], minion } = ability;
    const actorData = findCombatantData(battle, actorId);
    if (!actorData) {
        return false;
    }

    const { friendly: playerSide, hostile: enemySide } = actorData;

    if (minion) {
        const { isPlayer, disableTribute } = playerSide?.[index] || {};
        const isValidSpot = !isPlayer && (!disableTribute || minion.bypassDisableTribute);
        return side === BATTLEFIELD_SIDES.PLAYER_SIDE && Boolean(isValidSpot);
    }

    const { target } = actions[0] || {};
    const area =
        calculateActionArea({ action: actions[0], actor: actorData, source: { source: ability, type: TRIGGER_SOURCE_TYPES.ABILITY } }) ||
        actions[0]?.area ||
        0;

    if (side === BATTLEFIELD_SIDES.PLAYER_SIDE) {
        // Is it just a typing technicality that playerSide can be undefined?
        if (!playerSide) {
            return false;
        }

        if (target === TARGET_TYPES.SELF) {
            return playerSide[index]?.isPlayer || false;
        }

        if (target === TARGET_TYPES.FRIENDLY) {
            const targetedFriendly = playerSide[index];

            if (isUntargetable(targetedFriendly)) {
                return false;
            }
            const getCalculationTarget = (targetType: TRIGGER_TARGET_TYPES): CombatantInfo | undefined => {
                if (targetType === TRIGGER_TARGET_TYPES.ACTOR) {
                    return actorData;
                } else if (targetType === TRIGGER_TARGET_TYPES.TARGET) {
                    return findCombatantData(battle, playerSide[index]?.id);
                }
            };
            const conditionsPassed = actions.some((action) => passesConditions({ getCalculationTarget, proc: action }));
            if (!conditionsPassed) {
                return false;
            }

            // No whiffing on empty slots
            if (area === 0) {
                return (targetedFriendly?.HP || 0) > 0;
            }

            for (let i = index - area; i <= index + area; ++i) {
                if ((playerSide[i]?.HP || 0) > 0) {
                    return true;
                }
            }
            return false;
        }

        if (target === TARGET_TYPES.MOVE) {
            return true;
        }
    } else if (side === BATTLEFIELD_SIDES.ENEMY_SIDE && (target === TARGET_TYPES.HOSTILE || target === TARGET_TYPES.RANDOM_HOSTILE)) {
        if (!enemySide) {
            return false;
        }

        const targetedEnemy = enemySide[index];
        if (isStealthed(targetedEnemy) && !area && !ability?.actions?.[0].bypassStealth) {
            return false;
        }
        if (isUntargetable(targetedEnemy)) {
            return false;
        }

        const tauntEnemies = enemySide
            .filter((combatant) => combatant?.HP)
            .map((combatant) => findCombatantData(battle, combatant?.id))
            .filter((combatantInfo?: CombatantInfo) => hasEffectType(combatantInfo, EFFECT_TYPES.TAUNT));

        if (tauntEnemies.length && tauntEnemies.every((enemy) => enemy?.combatant?.id !== targetedEnemy?.id)) {
            return false;
        }

        const getCalculationTarget = (targetType: TRIGGER_TARGET_TYPES): CombatantInfo | undefined => {
            if (targetType === TRIGGER_TARGET_TYPES.ACTOR) {
                return actorData;
            } else if (targetType === TRIGGER_TARGET_TYPES.TARGET) {
                return findCombatantData(battle, targetedEnemy?.id);
            }
        };

        const conditionsPassed = actions.some((action) => passesConditions({ getCalculationTarget, proc: action }));
        if (!conditionsPassed) {
            return false;
        }

        // No whiffing on empty slots
        if (area === 0) {
            return (targetedEnemy?.HP || 0) > 0;
        }

        for (let i = index - area; i <= index + area; ++i) {
            if ((enemySide[i]?.HP || 0) > 0) {
                return true;
            }
        }
        return false;
    }

    return false;
};

export const updateCharacters = (
    characters: (Combatant | null)[],
    updateFn: (character: Combatant | null) => any
): (Combatant | null)[] => {
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
    source,
    deck = [],
    hand = [],
    discard = [],
}: {
    actor?: CombatantInfo;
    target?: CombatantInfo;
    allTargets?: CombatantInfo[];
    sourceTargets?: CombatantInfo[];
    actionParent?: Ability | Item;
    multiplier?: Multiplier;
    source?: TriggerSource;
    deck: Ability[];
    hand: Ability[];
    discard: Ability[];
}): number => {
    if (!multiplier) {
        return 1;
    }

    const getCalculationTarget = (calculationTarget) => {
        if (calculationTarget === CONDITION_TARGETS.ACTOR) {
            return actor;
        }

        if (calculationTarget === CONDITION_TARGETS.TARGET) {
            return target;
        }
    };
    const combatantInfo = getCalculationTarget(multiplier.calculationTarget);
    const { combatant, friendly = [] } = combatantInfo || {};

    const { value, type, filters, filterUnique, filterOutProcs } = multiplier;

    const numValue = typeof value === "number" ? value : 1;

    if (type === MULTIPLIER_TYPES.NUM_AFFECTED_TARGETS) {
        return allTargets.length * numValue || 1;
    }

    if (type === MULTIPLIER_TYPES.NUM_SOURCE_TARGETS) {
        return sourceTargets.length * numValue || 1;
    }

    if (type === MULTIPLIER_TYPES.OVERHEALING) {
        return (source?.statUpdate?.overhealing || 1) * numValue;
    }

    if (type === MULTIPLIER_TYPES.HEALING) {
        return (source?.statUpdate?.healing || 1) * numValue;
    }

    if (type === MULTIPLIER_TYPES.DAMAGE) {
        return (source?.statUpdate?.rawDamage || 1) * numValue;
    }

    if (type === MULTIPLIER_TYPES.ALL_CARDS) {
        const allCards = [...deck, ...hand, ...discard];
        const multValue = typeof value === "number" ? value : 1;

        if (!filters) {
            return Math.floor(allCards.length * multValue);
        }

        let filtered = allCards.filter((card) => {
            return filters.some(({ property, value, comparator }) =>
                passesValueComparison({ val: card[property], otherVal: value, comparator })
            );
        }).length;

        const ownCardPassesCondition = filters.some(({ property, value, comparator }) =>
            passesValueComparison({ val: actionParent?.[property], otherVal: value, comparator })
        );

        // For example, Greatest Bolt should not buff itself.
        // TODO probably want to do this via instance IDs instead
        if (ownCardPassesCondition && filtered > 0) {
            filtered -= 1;
        }

        return Math.floor(filtered * multValue);
    }

    if (type === MULTIPLIER_TYPES.EFFECT_STACKS) {
        if (!combatant) {
            return 0;
        }

        return combatant.effects.reduce((acc, effect: CombatEffect) => {
            if (
                filters &&
                !filters.some(({ property, value, comparator }) =>
                    passesValueComparison({ val: effect[property], otherVal: value, comparator })
                )
            ) {
                return acc;
            }

            return acc + (effect.stacks || 1);
        }, 0);
    }

    // @ts-ignore -- We are checking the existence of resourceCost here either way
    if (type === MULTIPLIER_TYPES.RESOURCES_SPENT && typeof actionParent?.resourceCost === "number") {
        // @ts-ignore
        return actionParent.resourceCost;
    }

    if (!combatant) {
        return 1;
    }

    if (type === MULTIPLIER_TYPES.ATTACKS_MADE_IN_TURN) {
        return combatant.turnHistory.filter(({ type, parent }) => {
            if (!type || ![ACTION_TYPES.ATTACK, ACTION_TYPES.RANGE_ATTACK].includes(type)) {
                return false;
            }

            // @ts-ignore Procced abilities do not have instance ids, only cards do
            if (filterOutProcs && !parent?.instanceId) {
                return false;
            }

            if (filters) {
                return filters.some(({ property, value, comparator }) =>
                    passesValueComparison({ val: parent[property], otherVal: value, comparator })
                );
            }

            return true;
        }).length;
    }

    if (type === MULTIPLIER_TYPES.ARMOR) {
        return combatant.armor || 1;
    }

    if (type === MULTIPLIER_TYPES.MAX_HP) {
        return Math.ceil(getMaxHP(combatant) * numValue);
    }

    if (type === MULTIPLIER_TYPES.HP) {
        return Math.ceil(combatant.HP * numValue);
    }

    if (type === MULTIPLIER_TYPES.DEBUFFS) {
        let debuffs = getEnabledEffects({ combatantInfo, getCalculationTarget }).filter(
            (effect: CombatEffect) => effect.class === EFFECT_CLASSES.DEBUFF
        );

        if (filters) {
            debuffs = debuffs.filter((effect) => {
                return filters.some(({ property, value, comparator }) =>
                    passesValueComparison({ val: effect[property], otherVal: value, comparator })
                );
            });
        }

        return debuffs.length;
    }

    if (type === MULTIPLIER_TYPES.BUFFS) {
        let buffs = getEnabledEffects({ combatantInfo, getCalculationTarget }).filter(
            (effect: CombatEffect) => effect.class === EFFECT_CLASSES.BUFF
        );

        if (filters) {
            buffs = buffs.filter((effect) => {
                return filters.some(({ property, value, comparator }) =>
                    passesValueComparison({ val: effect[property], otherVal: value, comparator })
                );
            });
        }

        return buffs.length;
    }

    if (type === MULTIPLIER_TYPES.ABILITIES_USED) {
        const abilitiesUsed = combatant.abilityHistory.filter((ability) => {
            // @ts-ignore Procced abilities do not have instance ids, only cards do
            if (filterOutProcs && !ability.instanceId) {
                return false;
            }

            if (filters) {
                return filters.some(({ property, value, comparator }) => {
                    const propertyVal = _.get(ability, property) || 0;
                    return passesValueComparison({ val: propertyVal, otherVal: value, comparator });
                });
            }

            return true;
        });

        if (filterUnique) {
            const abilityMap = abilitiesUsed.reduce((acc, ability) => {
                acc[ability.name] = true;
                return acc;
            }, {});

            return Object.keys(abilityMap).length;
        }

        return abilitiesUsed.length;
    }

    if (type === MULTIPLIER_TYPES.NUM_ALLIES) {
        // Excluding itself
        const totalAllies = (friendly || []).filter((combatant) => combatant && combatant.HP >= 0).length;
        return Math.max(totalAllies - 1, 0);
    }

    if (type === MULTIPLIER_TYPES.ATTACK_DAMAGE_IN_HAND) {
        return calculateAttackDamageInHand({ hand, actor: combatantInfo, actionParent: source?.source });
    }

    if (type === MULTIPLIER_TYPES.MISSING_HP) {
        if (!combatant) {
            return 0;
        }

        const HP = combatant.HP || 0;
        const maxHP = combatant.maxHP || 1;
        return (maxHP - HP) / maxHP;
    }

    return 1;
};

const calculateAttackDamageInHand = ({
    hand,
    actor,
    actionParent,
}: {
    hand: CombatAbility[];
    actor: CombatantInfo;
    actionParent?: Ability | Item | Action | CombatEffect;
}): number => {
    let damage = 0;
    hand.forEach((card) => {
        const isSameCard = actionParent && card.instanceId === (actionParent as CombatAbility)?.instanceId;
        if (isSameCard || !isOffensiveAbility(card)) {
            return;
        }

        (card.actions || []).forEach((action: Action) => {
            if (isAttackAction(action)) {
                const actionDamage = calculateDamage({
                    actor,
                    action,
                    actionParent: card,
                    source: { source: card, type: TRIGGER_SOURCE_TYPES.ABILITY },
                });
                damage += actionDamage;
            }
        });
    });

    return damage;
};

export const isTurnToTrigger = ({ turnsTriggerFrequency, uptime }): boolean => {
    if (!turnsTriggerFrequency) {
        return true;
    }

    if (uptime === 1) {
        return false;
    }

    return uptime % turnsTriggerFrequency === 0;
};

/**
 * Given a character, return its effects that have not been canceled due to silence or failing conditions.
 */
export const getEnabledEffects = ({
    combatantInfo,
    getCalculationTarget,
    source,
}: {
    combatantInfo?: CombatantInfo;
    getCalculationTarget?: (
        calculationTarget: CONDITION_TARGETS.ACTOR | CONDITION_TARGETS.TARGET | TRIGGER_TARGET_TYPES
    ) => CombatantInfo | CombatantInfo[] | Ability;
    source?: TriggerSource;
}): CombatEffect[] => {
    const { combatant } = combatantInfo || {};
    if (!combatant?.effects) {
        return [];
    }

    const silenced = isSilenced(combatant);
    const getCalculationTargetFn = (calcTarget) => {
        if (!calcTarget || calcTarget === TRIGGER_TARGET_TYPES.EFFECT_OWNER) {
            return combatantInfo;
        }

        // getCalculationTarget allows finding combatants beyond the effect owner, and should be provided for scenarios where a check against an external party needs to be made,
        // for example, proximity between two combatants. It need not be provided by consumers in cases where there is no "other party" in the calculation, such as
        // determining whether `combatant` has a certain effect type has nothing to do with any other combatant.
        if (getCalculationTarget) {
            return getCalculationTarget(calcTarget);
        }
    };

    return combatant.effects?.filter((effect) => {
        const { canBeSilenced, turnsTriggerFrequency, uptime } = effect;
        const disabled = silenced && canBeSilenced && effect.class === EFFECT_CLASSES.BUFF; // Only buffs can be silenced

        return (
            !disabled &&
            passesConditions({ getCalculationTarget: getCalculationTargetFn, proc: effect, source }) &&
            isTurnToTrigger({ turnsTriggerFrequency, uptime })
        );
    });
};

export const getSkillBonusDamage = ({ ability, skillBonus }: { ability: Ability | Item; skillBonus: SkillBonus[] }) => {
    if (!skillBonus || !ability) {
        return 0;
    }

    let totalDamage = 0;
    for (const { skill, damage = 0, comparator } of skillBonus) {
        if (comparator === "includes" && ability?.name?.toLowerCase().includes(skill.toLowerCase())) {
            totalDamage += damage || 0;
        } else if (skill === ability?.name) {
            totalDamage += damage || 0;
        }
    }

    return totalDamage;
};

export const calculateDamageModifierCoeff = ({ damage, totalDamageMod }: { damage: number; totalDamageMod: number }): number => {
    if (!totalDamageMod) {
        return damage;
    }
    const withAttackPower = Math.ceil(damage + Math.max(1, damage / DAMAGE_COEFF) * totalDamageMod);
    // Enemy damage cannot be reduced below 1 by ATT down modifiers
    if (damage && withAttackPower < 1) {
        return 1;
    }

    return withAttackPower;
};

export const calculateDamage = ({
    actor,
    target,
    targetIndex,
    selectedIndex,
    action,
    actionParent,
    multiplier = 1,
    source,
}: {
    actor?: CombatantInfo;
    target?: CombatantInfo;
    targetIndex?: number;
    selectedIndex?: number;
    action: Action | ActionOptionalProperties;
    actionParent?: CombatAbility | Item; // TODO can this just be from `source` (source.source should probably be equivalent to this object) instead of having this separate param?
    multiplier?: number;
    source?: TriggerSource;
}): number => {
    const isAttack = action.type === ACTION_TYPES.ATTACK || action.type === ACTION_TYPES.RANGE_ATTACK;

    if (
        !action.bypassImmunity &&
        (hasEffectType(target, EFFECT_TYPES.IMMUNITY) || (isAttack && hasEffectType(target, EFFECT_TYPES.ATTACK_IMMUNITY)))
    ) {
        return 0;
    }

    let baseDamage: number = (() => {
        if (action.secondaryDamage && targetIndex !== selectedIndex) {
            return action.secondaryDamage;
        }

        const damage = action.damage || 0;
        if (damage) {
            // Check if the damage is overridden by an `override` effect (eg. Polymorph)
            const overrideDamage = actor?.combatant?.effects?.find((effect) => effect.override?.damage)?.override?.damage;
            if (overrideDamage) {
                return overrideDamage;
            }
        }

        return damage;
    })();

    const parentEffects = (actionParent as CombatAbility)?.effects;
    if (parentEffects?.length) {
        baseDamage += parentEffects.reduce((acc, effect: AbilityEffect) => {
            return acc + (effect.damage || 0);
        }, 0);

        baseDamage = Math.max(0, baseDamage);
    }

    if (!actor) {
        return baseDamage;
    }

    const getCalculationTarget = (calculationTarget: TRIGGER_TARGET_TYPES): CombatantInfo | undefined => {
        if (calculationTarget === TRIGGER_TARGET_TYPES.ACTOR) {
            return actor;
        }

        if (calculationTarget === TRIGGER_TARGET_TYPES.TARGET) {
            return target;
        }
    };

    let totalAttackPower = 0;
    let totalSkillBonus = 0;
    let minimumDamage = 0;
    let maximumDamage = action.maxDamage;

    if (isAttack) {
        getEnabledEffects({ combatantInfo: actor, getCalculationTarget, source }).forEach(
            ({
                attackPower = 0,
                skillBonus = [],
                excludeEffectOwner,
                minimumAttackDamage = 0,
                stacks = 1,
                multiplier: multiplierConfig,
            }) => {
                if (excludeEffectOwner) {
                    return;
                }

                const effectMultiplier = getMultiplier({
                    actor,
                    target,
                    allTargets: [target],
                    multiplier: multiplierConfig,
                    // TODO needs access to deck, hand, discard for multiplier to work for those.
                    deck: [],
                    hand: [],
                    discard: [],
                });
                totalSkillBonus += getSkillBonusDamage({ ability: actionParent, skillBonus }) * stacks;
                totalAttackPower += attackPower * effectMultiplier * stacks;
                if (minimumAttackDamage > minimumDamage) {
                    minimumDamage = minimumAttackDamage;
                }
            }
        );
    }

    let totalDefDown = 0;
    const targetEnabledEffects = getEnabledEffects({ combatantInfo: target, getCalculationTarget, source });

    targetEnabledEffects.forEach((effect: CombatEffect) => {
        const { maxDamageTaken, excludeEffectOwner, defenseDown: defDown = 0, stacks = 1 } = effect;
        if (excludeEffectOwner) {
            return;
        }

        if ((maxDamageTaken && isNaN(maximumDamage)) || maximumDamage < maxDamageTaken) {
            maximumDamage = maxDamageTaken;
        }

        totalDefDown += defDown * stacks;
    });

    const damage = baseDamage * multiplier + totalSkillBonus;
    let debuffModifiers = 0;
    if (isAttack || (isOffensiveAction(action) && typeof action.damage === "number")) {
        const hasBleed = targetEnabledEffects.some((e) => e.type === EFFECT_TYPES.BLEED);
        const bleedModifier = hasBleed ? 1 : 0;
        debuffModifiers += bleedModifier + totalDefDown;
    }

    const withDamageMods = calculateDamageModifierCoeff({ damage, totalDamageMod: totalAttackPower + debuffModifiers });

    let total = withDamageMods;
    // Between minimum and maximum damage, minimum damage wins (arbitrarily).
    if (typeof maximumDamage === "number") {
        total = Math.min(total, maximumDamage);
    }
    return Math.max(minimumDamage, Math.ceil(total));
};

export const calculateArmor = ({
    target,
    action,
    multiplier = 1,
    source,
}: {
    target?: CombatantInfo;
    action: { armor?: number; maxArmor?: number; flatArmor?: number };
    multiplier: number;
    source?: TriggerSource;
}): number => {
    const { armor: initArmor, maxArmor = Infinity, flatArmor } = action;
    if (!initArmor && !flatArmor) {
        return 0;
    }

    if (flatArmor) {
        const armor = Math.min(maxArmor, flatArmor * multiplier);
        return Math.max(0, armor);
    }

    let armor = Math.min(maxArmor, (initArmor || 0) * multiplier);

    const parentEffects = (source?.source as CombatAbility)?.effects;
    if (parentEffects?.length) {
        armor += parentEffects.reduce((acc, effect: AbilityEffect) => {
            return acc + (effect.armor || 0);
        }, 0);
    }

    const targetArmorReceived =
        getEnabledEffects({ combatantInfo: target }).reduce(
            (acc: number, { armorReceived = 0, stacks = 1 }) => acc + armorReceived * stacks,
            0
        ) || 0;

    const totalArmor = targetArmorReceived + armor;
    return Math.max(0, totalArmor);
};

export const calculateHealing = ({ target, action }: { target?: CombatantInfo; action: { healing?: number } }): number => {
    if (!action.healing) {
        return 0;
    }
    const healingReceived =
        getEnabledEffects({ combatantInfo: target }).reduce(
            (acc: number, { healingReceived = 0, stacks = 1 }) => acc + healingReceived * stacks,
            0
        ) || 0;
    const healing = healingReceived + action.healing;
    return Math.max(0, healing);
};

/**
 * @returns indices of characters that are alive
 */
export const getValidTargetIndices = (
    characters: (Combatant | null)[],
    area: number,
    options: {
        excludeStealth?: boolean;
        excludeIndex?: number;
        onlyTaunt?: boolean;
        excludeUntargetable?: boolean;
        onlyPriorityTarget?: boolean;
    } = {}
): number[] => {
    const { excludeStealth, excludeIndex, onlyTaunt, excludeUntargetable = true, onlyPriorityTarget } = options;

    const getIndicesForEffectType = (effectType: EFFECT_TYPES) => {
        const effectIndices = [];
        characters.forEach((character: Combatant | null, i: number) => {
            const notExcluded = excludeIndex !== i;
            if (character?.effects?.some((effect) => effect.type === effectType) && character?.HP > 0 && notExcluded) {
                effectIndices.push(i);
            }
        });

        return effectIndices;
    };

    let priorityIndices;
    if (onlyPriorityTarget) {
        priorityIndices = getIndicesForEffectType(EFFECT_TYPES.PRIORITY_TARGET);
    }

    if (onlyTaunt) {
        const tauntingIndices = getIndicesForEffectType(EFFECT_TYPES.TAUNT);

        if (priorityIndices?.length) {
            const intersected = _.intersection(tauntingIndices, priorityIndices);
            if (intersected.length > 0) {
                return intersected;
            }
        }

        if (tauntingIndices.length) {
            return tauntingIndices;
        }
    }

    if (priorityIndices?.length) {
        return priorityIndices;
    }

    area = area || 0;
    const indices = {};
    characters.forEach((character: Combatant | null, i: number) => {
        const hp = character?.HP || 0;
        if (hp > 0) {
            const notStealth = !excludeStealth || !isStealthed(character);
            const notExcluded = excludeIndex !== i;
            const untargetable = excludeUntargetable && isUntargetable(character);
            if (notStealth && notExcluded && !untargetable) {
                indices[i] = true;
            }
        } else if (area >= 1) {
            for (let j = i - area; j <= i + area; ++j) {
                if ((characters[j]?.HP || 0) > 0) {
                    indices[i] = true;
                    break;
                }
            }
        }
    });
    return Object.keys(indices).map((key) => Number(key));
};

export const calculateActionArea = ({
    action,
    actor,
    target,
    source,
}: {
    action?: Action;
    actor: CombatantInfo;
    target?: CombatantInfo;
    source: TriggerSource;
}): number => {
    if (!action) {
        return 0;
    }
    const { type, area = 0 } = action;
    const isAttack = type === ACTION_TYPES.ATTACK || type === ACTION_TYPES.RANGE_ATTACK;
    let totalArea = area;
    if (isAttack) {
        const getCalculationTarget = (calculationTarget: CONDITION_TARGETS | TRIGGER_TARGET_TYPES) => {
            if (calculationTarget === CONDITION_TARGETS.ACTOR || calculationTarget === TRIGGER_TARGET_TYPES.EFFECT_OWNER) {
                return actor;
            }

            if (target && calculationTarget === CONDITION_TARGETS.TARGET) {
                return target;
            }
        };

        getEnabledEffects({ combatantInfo: actor, getCalculationTarget, source }).forEach(({ attackAreaIncrease = 0 }) => {
            totalArea += attackAreaIncrease;
        });

        if (action.bonus) {
            const bonuses = Array.isArray(action.bonus) ? action.bonus : [action.bonus];
            bonuses.forEach((bonus) => {
                if (bonus.area && passesConditions({ getCalculationTarget, proc: bonus })) {
                    totalArea += bonus.area;
                }
            });
        }
    }

    return totalArea;
};

export const applyVacuum = ({
    characters: initCharacters,
    index,
    area,
    distance,
    side,
}: {
    characters: (Combatant | null)[];
    index: number;
    area: number;
    distance: number;
    side: BATTLEFIELD_SIDES;
}): {
    updatedCharacters: (Combatant | null)[];
    displacements: Displacement;
} => {
    const characters = initCharacters.slice();
    const isValidSlot = (combatant: Combatant | null): Boolean => {
        return !combatant || (combatant.HP === 0 && combatant.effects.every((effect) => effect.type !== EFFECT_TYPES.LIFE_LINK));
    };

    const displacements = {};

    for (let i = 1; i <= area; ++i) {
        if (characters[index + i]) {
            for (let j = 0; j < i && j < distance; ++j) {
                const existingCharacter = characters[index + j];
                if (isValidSlot(existingCharacter)) {
                    characters[index + j] = characters[index + i];
                    characters[index + i] = null;
                    const id = characters[index + j]?.id;
                    if (id) {
                        displacements[id] = {
                            from: index + i,
                            to: index + j,
                        };
                    }
                }
            }
        }
        if (characters[index - i]) {
            for (let j = 0; j < i && j < distance; ++j) {
                const existingCharacter = characters[index - j];
                if (isValidSlot(existingCharacter)) {
                    characters[index - j] = characters[index - i];
                    characters[index - i] = null;

                    const id = characters[index - j].id;
                    if (id) {
                        displacements[id] = {
                            from: index - i,
                            to: index - j,
                        };
                    }
                }
            }
        }
    }

    return {
        updatedCharacters: characters,
        displacements,
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

// This is used to determine whether an enemy should act during its turn. It shouldn't prevent effect events from triggering.
export const isTurnActionPrevented = (
    combatantInfo: CombatantInfo,
    options?: { bypassStun?: boolean; bypassPreventTurnAction: boolean }
): boolean => {
    if (!combatantInfo) {
        return true;
    }

    const combatant: Combatant | Player = combatantInfo.combatant;
    const turnPreventedFromEffects = combatant.effects.some((effect) => {
        return (
            (effect.preventTurnAction && !options?.bypassPreventTurnAction) ||
            ([EFFECT_TYPES.STUN, EFFECT_TYPES.FREEZE].includes(effect.type) && !options?.bypassStun)
        );
    });

    return turnPreventedFromEffects;

    /**
    const ability = combatant.abilities?.[getUseAbilityIndex(combatantInfo)];
    // Silence prevents using abilities which are pure support/effects
    const isSilenced = combatant.effects.some((effect) => effect.type === EFFECT_TYPES.SILENCE);
    return isSilenced && ability?.actions.every((action) => action.type === ACTION_TYPES.EFFECT);
    */
};

export const isStunnedOrFrozen = (combatant: Combatant): boolean => {
    return combatant?.effects.some((effect: Effect) => [EFFECT_TYPES.STUN, EFFECT_TYPES.FREEZE].includes(effect.type));
};

export const getPossibleMoveIndices = ({
    currentLocationIndex,
    friendly,
    action,
}: {
    currentLocationIndex: number;
    friendly: (Combatant | null)[];
    action: Action;
}): number[] => {
    const { movement = 0, movementOptions = {} } = action;
    if (!movement) {
        return [];
    }

    const { canSwapCharacterPlaces: swapPlaces } = movementOptions;
    const min = Math.max(0, currentLocationIndex - movement);
    const max = Math.min(friendly.length - 1, currentLocationIndex + movement);
    const moveIndices = [];
    for (let i = min; i <= max; ++i) {
        if (!friendly[i]?.HP || swapPlaces) {
            moveIndices.push(i);
        }
    }

    return moveIndices;
};

export const getPossibleSummonIndices = (friendly: (Combatant | null)[]): number[] => {
    const indices: number[] = [];
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
    source,
    deck,
    hand,
    discard,
}: {
    action: ActionOptionalProperties; // The action to apply the bonus to
    target?: CombatantInfo;
    allTargets: CombatantInfo[];
    actor?: CombatantInfo;
    isTargetSelected: boolean;
    actionParent?: Ability | Item;
    source?: TriggerSource;
    deck: Ability[];
    hand: Ability[];
    discard: Ability[];
}): ActionOptionalProperties => {
    if (!action.bonus) {
        return action;
    }

    const bonuses = Array.isArray(action.bonus) ? action.bonus : [action.bonus];
    const getCalculationTarget = (conditionTarget: CONDITION_TARGETS.ACTOR | CONDITION_TARGETS.TARGET): CombatantInfo | undefined => {
        if (conditionTarget === CONDITION_TARGETS.TARGET) {
            return target;
        } else if (conditionTarget === CONDITION_TARGETS.ACTOR) {
            return actor;
        }
    };

    return bonuses.reduce(
        (acc: Action, bonus: Bonus) => {
            const { excludePrimaryTarget = false, effects: bonusEffects = [] } = bonus;
            const multiplier = getMultiplier({
                actor,
                target,
                allTargets,
                multiplier: bonus.multiplier,
                actionParent,
                source,
                deck,
                hand,
                discard,
            });

            const isValidTarget = !excludePrimaryTarget || !isTargetSelected;
            if (passesConditions({ getCalculationTarget, proc: bonus, source }) && isValidTarget) {
                const bonusDamage = (bonus.damage || 0) * multiplier;
                const { damage = 0, secondaryDamage, healing = 0, armor = 0, effects = [], area = 0, drawCards } = acc;
                const drawCardsAmount = (bonus?.drawCards?.amount || 0) + (drawCards?.amount || 0);
                const drawCardsObj = drawCardsAmount ? { amount: drawCardsAmount } : undefined;

                const totalBonusEffects = bonusEffects.map((effect) => ({
                    ...effect,
                    stacks: (effect.stacks || 1) * multiplier,
                }));

                return {
                    ...acc,
                    area: area + (bonus.area || 0),
                    damage: damage + bonusDamage,
                    secondaryDamage: secondaryDamage && secondaryDamage + bonusDamage,
                    healing: healing + (bonus.healing || 0) * multiplier,
                    armor: armor + (bonus.armor || 0) * multiplier,
                    effects: [...effects, ...totalBonusEffects],
                    drawCards: drawCardsObj,
                } as Action;
            }
            return acc;
        },
        { ...action }
    );
};

export const isWithinAbilityArea = ({
    ability,
    actor,
    selectedIndex,
    targetIndex,
}: {
    ability: Ability;
    actor: CombatantInfo;
    selectedIndex: number;
    targetIndex: number;
}): boolean => {
    if (!ability) {
        return false;
    }
    if ([selectedIndex, targetIndex].some((i) => typeof i !== "number")) {
        return false;
    }
    const action = ability.actions[0];
    const area =
        calculateActionArea({ action, actor, source: { source: ability, type: TRIGGER_SOURCE_TYPES.ABILITY } }) || action?.area || 0;
    return Math.abs(selectedIndex - targetIndex) <= area;
};

export const calculateMesoMultiplier = ({ player, mesos = 0 }: { player: Player; mesos?: number }): number => {
    const mesosGainedMultiplier = player.effects.reduce((acc, { mesosGained = 0 }) => {
        return acc + mesosGained;
    }, 1);

    return Math.floor(mesos * mesosGainedMultiplier);
};

/** Returns a card with aura effects applied, if any. */
export const getCardByInstanceId = (hand: CombatAbility[], id: string | null): CombatAbility | undefined => {
    if (!id) {
        return;
    }

    const handAuraEffects = getHandAuraEffects(hand);
    // With hand aura effects applied
    const abilityIndex = hand.findIndex(({ instanceId }) => instanceId === id);
    const ability = hand[abilityIndex];
    if (!ability) {
        return;
    }
    return {
        ...ability,
        effects: [...(ability.effects || []), ...(handAuraEffects[abilityIndex] || [])],
    };
};

export const getAbilityResourceCost = ({
    combatant,
    effects = [],
    resourceCost = 0,
}: {
    combatant?: Combatant | Player;
    effects: AbilityEffect[];
    resourceCost: number | "x";
}) => {
    if (resourceCost === "x") {
        return combatant?.resources || 0;
    }
    const resourceCostFromEffects = effects.reduce((acc, e: AbilityEffect) => {
        return acc + (e.resourceCost || 0);
    }, 0);

    return Math.max(0, resourceCost + resourceCostFromEffects);
};
