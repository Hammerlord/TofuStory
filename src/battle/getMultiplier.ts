import _ from "lodash";
import {
    Ability,
    Multiplier,
    CONDITION_TARGETS,
    MULTIPLIER_TYPES,
    CombatEffect,
    ACTION_TYPES,
    EFFECT_CLASSES,
    Action,
    CombatAbility,
} from "../ability/types";
import { Item } from "../item/types";
import { passesValueComparison } from "./passesConditions";
import { ActionContext, ActionParent, CombatantInfo, TRIGGER_SOURCE_TYPES, TriggerSource } from "./types";
import { getMaxHP } from "./utils";
import { calculateDamage } from "./calculateDamage";
import { getEnabledEffects } from "./actions/statusEffect/getEnabledEffects";
import { isOffensiveAbility, isAttackAction } from "../ability/AbilityView/utils";

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
    actionParent?: ActionParent;
    multiplier?: Multiplier;
    source?: TriggerSource;
    deck: CombatAbility[];
    hand: CombatAbility[];
    discard: CombatAbility[];
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

    if (type === MULTIPLIER_TYPES.ALL_CARDS || type === MULTIPLIER_TYPES.CARDS_IN_HAND) {
        const cardsToCheck: CombatAbility[] = hand.filter((card: CombatAbility) => {
            // Greater Bolt should not affect itself
            return card.instanceId !== (source?.source as CombatAbility)?.instanceId;
        });

        if (type === MULTIPLIER_TYPES.ALL_CARDS) {
            cardsToCheck.push(...deck, ...discard);
        }
        const multValue = typeof value === "number" ? value : 1;

        if (!filters) {
            return Math.floor(cardsToCheck.length * multValue);
        }

        let filtered = cardsToCheck.filter((card) => {
            return filters.some(({ property, value, comparator }) =>
                passesValueComparison({ val: card[property], otherVal: value, comparator })
            );
        }).length;

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

        const unique = {};
        debuffs.forEach((d) => {
            unique[d.name] = true;
        });

        return Object.keys(unique).length;
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

        const unique = {};
        buffs.forEach((b) => {
            unique[b.name] = true;
        });

        return Object.keys(unique).length;
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
    actionParent?: ActionParent;
}): number => {
    let damage = 0;
    hand.forEach((card) => {
        const isSameCard = actionParent && card.instanceId === (actionParent as CombatAbility)?.instanceId;
        if (isSameCard || !isOffensiveAbility(card)) {
            return;
        }

        const context: ActionContext = {
            name: "Attack Damage in Hand",
            sourceChain: [{ source: card, type: TRIGGER_SOURCE_TYPES.ABILITY }],
        };

        (card.actions || []).forEach((action: Action) => {
            if (isAttackAction(action)) {
                const actionDamage = calculateDamage({
                    actor,
                    action,
                    actionParent: card,
                    context,
                });
                damage += actionDamage;
            }
        });
    });

    return damage;
};
