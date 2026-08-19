import { cloneDeep } from "lodash";
import * as uuid from "uuid";
import { Ability, Action, CombatAbility, CombatEffect, Effect, EFFECT_CLASSES, EFFECT_TYPES } from "../../ability/types";
import { Player } from "../../character/types";
import { Item } from "../../item/types";
import { getRandomItem } from "../../utils";
import { passesValueComparison } from "../passesConditions";
import {
    calculateArmor,
    calculateBonus,
    calculateDamage,
    calculateHealing,
    calculateMesoMultiplier,
    getEnabledEffects,
    getMultiplier,
    hasEffectType,
} from "../utils";
import { effectNameMap } from "./../../enemy/effect";
import { ActionContext, BATTLEFIELD_SIDES, CombatantInfo } from "./../types";
import { getMaxHP } from "./../utils";
import { getHalveArmorAmount } from "./checkHalveArmor";

export interface UpdatedCombatantStats {
    id?: string; // Unique identifier for this set of updates
    combatantId?: string;
    actorId?: string;
    // Raw damage, including overkill figure
    rawDamage?: number;
    healthDamage?: number;
    overhealing?: number;
    healing?: number;
    armor?: number;
    resources?: number;
    rawResources?: number;
    effects?: CombatEffect[];
    isDeathBlow?: boolean;
    mesos?: number;
    removedEffects?: CombatEffect[];
    isArmorDecay?: boolean;
    isArmorBroken?: boolean;
    failedToApplyEffects?: CombatEffect[]; // Effects that were immuned
    overkill?: number;
    context?: ActionContext;
}

export const getUpdatedStats = ({
    actorId,
    targetIds,
    recipientIds,
    selectedIndex,
    action: initialAction,
    actionParent,
    context,
    getCombatantById,
    deck,
    hand,
    discard,
}: {
    actorId?: string;
    targetIds: string[];
    recipientIds?: string[]; // When the recipient of the stat change is different from the targetIds. Used for `secondaryAction`
    selectedIndex?: number; // Only applicable for abilities with manual selection?
    action: Action;
    actionParent?: Ability | CombatAbility | Item;
    context?: ActionContext;
    getCombatantById: (id: string) => CombatantInfo;
    deck: CombatAbility[];
    hand: CombatAbility[];
    discard: CombatAbility[];
}): { statUpdate: UpdatedCombatantStats; action: Action; actorId?: string }[] => {
    const actor = getCombatantById(actorId);
    const targets = targetIds.map(getCombatantById).filter((v) => v);
    const recipients = recipientIds?.map(getCombatantById).filter((v) => v);
    const triggerSource = context?.sourceChain?.at(-1);
    const sourceEntity = triggerSource?.source;

    return (recipients || targets).map((target: CombatantInfo) => {
        const { combatant: targetCombatant, index: targetIndex, friendlySide: targetSide, friendly: targetSideCombatants } = target;
        const action = calculateBonus({
            action: initialAction,
            target,
            actor,
            allTargets: targets,
            isTargetSelected: targetIndex === selectedIndex,
            actionParent,
            source: triggerSource,
            deck,
            hand,
            discard,
        });
        const {
            effects: actionEffects = [],
            resources = 0,
            destroyArmor = 0,
            resurrect,
            mesos = 0,
            stealMesos = 0,
            removeDebuffs,
            removeEffects = [],
            flatDamage = 0,
            targetMinHP = 0,
            decayArmor = false,
            damageDividedByTargets = false,
            bypassArmor = false,
        } = action;

        const enabledEffects = getEnabledEffects({ combatantInfo: target });
        const multiplier = getMultiplier({
            multiplier: action.multiplier,
            target,
            allTargets: targets,
            actor,
            actionParent,
            source: triggerSource,
            deck,
            hand,
            discard,
        });

        let damage = 0;
        if (flatDamage) {
            damage = flatDamage * multiplier;
        } else {
            damage = calculateDamage({
                actor,
                target,
                targetIndex,
                selectedIndex,
                action,
                actionParent,
                multiplier,
                source: triggerSource,
            });
        }

        if (destroyArmor) {
            damage += Math.floor(targetCombatant.armor * destroyArmor);
        }

        if (damageDividedByTargets) {
            damage = Math.ceil(damage / (targets.length || 1));
        }

        let totalArmor = targetCombatant.armor + calculateArmor({ target, action, multiplier, source: triggerSource });
        if (decayArmor) {
            const halveArmorAmount = getHalveArmorAmount(target);
            totalArmor += halveArmorAmount;
        }

        const updatedTargetArmor = Math.max(0, bypassArmor ? totalArmor : totalArmor - damage);
        const armorGained = updatedTargetArmor - targetCombatant.armor;
        const targetApplicableHP = targetCombatant.HP - targetMinHP;
        const healthDamage = Math.min(targetApplicableHP, Math.max(0, bypassArmor ? damage : damage - totalArmor));
        const rawDamage = damage;

        let rawHealing = 0;
        if (targetCombatant.HP - healthDamage > 0 || resurrect) {
            rawHealing = calculateHealing({ target, action }) * multiplier;
        }

        const maxHP = getMaxHP(targetCombatant);
        const healing = Math.min(maxHP - targetCombatant.HP, rawHealing);
        const overhealing = rawHealing - healing;

        const targetIsImmune = hasEffectType(target, EFFECT_TYPES.IMMUNITY);
        const isImmuneTo = (effect: Effect): boolean => {
            const isPreviousActionTriggeredBypass = (context?.sourceChain || []).some((source) =>
                (source.source as CombatAbility)?.actions?.some((a) => a.bypassImmunity)
            );
            if (effect.bypassImmunity || action.bypassImmunity || isPreviousActionTriggeredBypass) {
                return false;
            }
            if (targetIsImmune && effect.class === EFFECT_CLASSES.DEBUFF) {
                return true;
            }
            return enabledEffects.some((targetEffect: Effect) => {
                const { type, value = [] } = targetEffect.immunities || {};

                if (type === "effect-type") {
                    return value.some((type: EFFECT_TYPES) => type === effect.type);
                }

                if (type === "effect") {
                    return value.some((name: string) => name === effect.name);
                }

                if (type === "effect-class") {
                    return value.some((type: EFFECT_CLASSES) => type === effect.class);
                }
            });
        };

        const allEnabledEffects = getEnabledEffects({ combatantInfo: actor }).concat(enabledEffects);

        const getEffectDuration = (incomingEffect: Effect) => {
            if (isNaN(incomingEffect.duration) || incomingEffect.duration === Infinity) {
                return Infinity;
            }

            const totalBonusDuration = allEnabledEffects.reduce((acc, e) => {
                const { amount, filters } = e.extendEffectDuration || {};

                if (!amount) {
                    return acc;
                }

                if (
                    !filters ||
                    filters.every((filter) => {
                        const { value, property, comparator } = filter;
                        return passesValueComparison({ val: incomingEffect[property], otherVal: value, comparator });
                    })
                ) {
                    return acc + amount;
                }

                return acc;
            }, 0);

            return incomingEffect.duration + totalBonusDuration;
        };

        const effects: CombatEffect[] = [];
        const failedToApplyEffects: CombatEffect[] = [];

        const allActionEffects = [...actionEffects];
        ((sourceEntity as CombatAbility)?.effects || []).forEach((e) => {
            if (Array.isArray(e.effects)) {
                allActionEffects.push(...e.effects);
            }
        });

        Array.from({ length: multiplier }).forEach(() => {
            const effectsToAdd = allActionEffects
                .map((effect: String | Effect) => {
                    if (typeof effect === "string") {
                        return {
                            ...effectNameMap[effect],
                        };
                    }

                    return effect as Effect | CombatEffect;
                })
                .filter((effect) => {
                    if (isImmuneTo(effect)) {
                        // ID for differentiation purposes when announcing that the effect failed to apply
                        failedToApplyEffects.push({ ...effect, id: uuid.v4(), uptime: 0 });
                        return false;
                    }

                    return true;
                })
                .map((effect: Effect | CombatEffect) => {
                    let overrideObj;
                    if (effect.override) {
                        const portrait = effect.override.portrait;
                        overrideObj = {
                            ...effect.override,
                            portrait: (Array.isArray(portrait) && getRandomItem(portrait)) || portrait,
                        };
                    }
                    const duration = getEffectDuration(effect);
                    return {
                        ...cloneDeep(effect),
                        duration,
                        override: overrideObj,
                        uptime: effect.uptime || 1,
                        id: uuid.v4(),
                        applierId: actorId,
                        originalAbilityId: (actionParent as CombatAbility)?.instanceId,
                        originalDuration: duration,
                    };
                });

            effects.push(...effectsToAdd);
        });

        const resourcesGained = resources * multiplier;
        const removedEffects = targetCombatant.effects.filter((effect: CombatEffect) => {
            if (removeDebuffs && effect.class === EFFECT_CLASSES.DEBUFF && effect.dispellable !== false) {
                return true;
            }

            if (removeEffects.some((name) => name === effect.name)) {
                return true;
            }
        });

        const isDeathBlow = targetCombatant.HP > 0 && targetCombatant.HP - healthDamage + healing <= 0;

        let moneyDiff = mesos - stealMesos;
        let targetMesos = targetCombatant?.mesos || 0;

        // TRICKY: all money operations on the player side affect the PLAYER, even if minions were the ones who were hit
        if (targetSide === BATTLEFIELD_SIDES.PLAYER_SIDE) {
            const player: Player = targetSideCombatants.find((c) => c?.isPlayer) as Player;
            if (player && moneyDiff > 0) {
                moneyDiff = calculateMesoMultiplier({ player, mesos: moneyDiff });
            }
            targetMesos = player.mesos;
        }

        if (targetMesos + moneyDiff < 0) {
            moneyDiff = -targetMesos;
        }

        const statUpdate: UpdatedCombatantStats = {
            id: uuid.v4(),
            combatantId: targetCombatant.id,
            rawDamage,
            healthDamage,
            healing,
            overhealing,
            armor: armorGained,
            resources: resourcesGained,
            rawResources: resources,
            effects,
            isDeathBlow,
            overkill: isDeathBlow ? targetCombatant.HP - healthDamage + healing : 0,
            mesos: moneyDiff,
            removedEffects,
            isArmorDecay: decayArmor,
            isArmorBroken: targetCombatant.armor > 0 && updatedTargetArmor === 0,
            failedToApplyEffects,
            context: context,
        };

        return {
            statUpdate,
            action,
            actorId,
        };
    });
};
