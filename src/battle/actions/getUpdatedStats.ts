import { cloneDeep } from "lodash";
import uuid from "uuid";
import { Ability, Action, CombatEffect, Effect, EFFECT_CLASSES, EFFECT_TYPES } from "../../ability/types";
import { Item } from "../../item/types";
import {
    calculateArmor,
    calculateBonus,
    calculateDamage,
    calculateHealing,
    getEnabledEffects,
    getMultiplier,
    hasEffectType,
} from "../utils";
import { enemyEffectNameMap } from "./../../enemy/effect";
import { CombatantInfo, TriggerSource } from "./../types";
import { getMaxHP } from "./../utils";
import { getRandomItem } from "../../utils";

export interface UpdatedCombatantStats {
    combatantId: string;
    rawDamage?: number;
    healthDamage?: number;
    overhealing?: number;
    healing?: number;
    armor?: number;
    resources?: number;
    rawResources?: number;
    overcappedResources?: number;
    effects?: CombatEffect[];
    isDeathBlow?: boolean;
    mesos?: number;
    removedEffects?: CombatEffect[];
}

export const getUpdatedStats = ({
    actorId,
    targetIds,
    recipientIds,
    selectedIndex,
    action: initialAction,
    actionParent,
    source,
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
    actionParent?: Ability | Item;
    source?: TriggerSource;
    getCombatantById: (id: string) => CombatantInfo;
    deck: Ability[];
    hand: Ability[];
    discard: Ability[];
}): [UpdatedCombatantStats, Action][] => {
    const actor = getCombatantById(actorId);
    const targets = targetIds.map(getCombatantById).filter((v) => v);
    const recipients = recipientIds?.map(getCombatantById).filter((v) => v);
    //const sourceTargets = (source.allTargetIds || []).map(getCalculationTarget); // TODO used to be used in calculating multipliers

    return (recipients || targets).map((target: CombatantInfo) => {
        const { combatant: targetCombatant, index: targetIndex } = target;
        const action = calculateBonus({
            action: initialAction,
            target,
            actor,
            allTargets: targets,
            isTargetSelected: targetIndex === selectedIndex,
            actionParent,
            source,
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
        } = action;

        const enabledEffects = getEnabledEffects({ combatantInfo: target });
        const multiplier = getMultiplier({
            multiplier: action.multiplier,
            target,
            allTargets: targets,
            actor,
            source,
            deck,
            hand,
            discard,
        });
        const damage =
            calculateDamage({ actor, target, targetIndex, selectedIndex, action, actionParent, multiplier }) +
            Math.floor(targetCombatant.armor * destroyArmor) +
            flatDamage * multiplier;

        const totalArmor = targetCombatant.armor + calculateArmor({ target, action }) * multiplier;
        const updatedTargetArmor = Math.max(0, totalArmor - damage);
        const armorGained = updatedTargetArmor - targetCombatant.armor;
        const healthDamage = Math.max(0, damage - totalArmor);

        let rawHealing = 0;
        if (targetCombatant.HP - healthDamage > 0 || resurrect) {
            rawHealing = calculateHealing({ target, action }) * multiplier;
        }

        const maxHP = getMaxHP(targetCombatant);
        const healing = Math.min(maxHP - targetCombatant.HP, rawHealing);
        const overhealing = rawHealing - healing;

        const targetIsImmune = hasEffectType(target, EFFECT_TYPES.IMMUNITY);
        const isImmuneTo = (effect: Effect): boolean => {
            if (effect.bypassImmunity) {
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
            });
        };

        const effects: CombatEffect[] = actionEffects
            .map((effect: String | Effect) => {
                if (typeof effect === "string") {
                    return {
                        ...enemyEffectNameMap[effect],
                    };
                }

                return effect as Effect | CombatEffect;
            })
            .filter((effect) => !isImmuneTo(effect))
            .map((effect: Effect | CombatEffect) => {
                let overrideObj;
                if (effect.override) {
                    const portrait = effect.override.portrait;
                    overrideObj = {
                        ...effect.override,
                        portrait: (Array.isArray(portrait) && getRandomItem(portrait)) || portrait,
                    };
                }
                return {
                    ...cloneDeep(effect),
                    override: overrideObj,
                    // @ts-ignore
                    uptime: effect.uptime || 1,
                    id: uuid.v4(),
                    applierId: actorId,
                };
            });

        const resourcesGained = Math.min(targetCombatant.maxResources - targetCombatant.resources, resources * multiplier);
        const removedEffects = targetCombatant.effects.filter((effect: CombatEffect) => {
            if (removeDebuffs && effect.class === EFFECT_CLASSES.DEBUFF) {
                return true;
            }

            if (removeEffects.some((name) => name === effect.name)) {
                return true;
            }
        });

        return [
            {
                combatantId: targetCombatant.id,
                rawDamage: Math.min(targetCombatant.HP + targetCombatant.armor, damage),
                healthDamage,
                healing,
                rawHealing,
                overhealing,
                armor: armorGained,
                resources: resourcesGained,
                rawResources: resources,
                overcappedResources: resources - resourcesGained,
                effects,
                isDeathBlow: targetCombatant.HP > 0 && targetCombatant.HP - healthDamage + healing <= 0,
                mesos: mesos - stealMesos,
                removedEffects,
            },
            action,
        ];
    });
};
