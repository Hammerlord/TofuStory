import { cloneDeep } from "lodash";
import uuid from "uuid";
import { Ability, Action, Effect, EFFECT_CLASSES, EFFECT_TYPES } from "../../ability/types";
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
import { IndexedCombatant } from "./../passesConditions";
import { TriggerSource } from "./../types";
import { getMaxHP } from "./../utils";

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
    effects?: Effect[];
    isDeathBlow?: boolean;
}

export const getUpdatedStats = ({
    actorId,
    targetIds,
    selectedIndex,
    action: initialAction,
    actionParent,
    source,
    getCombatantById: getCalculationTarget,
}: {
    actorId?: string;
    targetIds: string[];
    selectedIndex?: number; // Only applicable for abilities with manual selection?
    action: Action;
    actionParent?: Ability | Item;
    source: TriggerSource;
    getCombatantById: (id: string) => IndexedCombatant;
}): [UpdatedCombatantStats, Action][] => {
    const actor = getCalculationTarget(actorId);
    const targets = targetIds.map(getCalculationTarget);
    //const sourceTargets = (source.allTargetIds || []).map(getCalculationTarget); // TODO used to be used in calculating multipliers

    return targets.map((target: IndexedCombatant) => {
        const { combatant: targetCombatant, index: targetIndex } = target;
        const action = calculateBonus({
            action: initialAction,
            target,
            actor,
            allTargets: targets,
            isTargetSelected: targetIndex === selectedIndex,
            actionParent,
            source,
        });
        const { effects: actionEffects = [], resources = 0, destroyArmor = 0, resurrect } = action;

        const multiplier = getMultiplier({ multiplier: action.multiplier, target, actor, source });
        const damage = calculateDamage({ actor, target, targetIndex, selectedIndex, action, actionParent }) * multiplier;
        const baseArmor = Math.floor(targetCombatant.armor * (1 - destroyArmor));
        const updatedTargetArmor = baseArmor + calculateArmor({ target, action }) * multiplier;
        const armorGained = updatedTargetArmor - targetCombatant.armor;
        const healthDamage = Math.max(0, damage - updatedTargetArmor);
        let rawHealing = 0;
        if (targetCombatant.HP - healthDamage > 0 || resurrect) {
            rawHealing = calculateHealing({ target, action }) * multiplier;
        }

        const maxHP = getMaxHP(targetCombatant);
        const healing = Math.min(maxHP - targetCombatant.HP, rawHealing);
        const overhealing = rawHealing - healing;

        const targetIsImmune = hasEffectType(targetCombatant, EFFECT_TYPES.IMMUNITY);
        const isImmuneTo = (effect: Effect): boolean => {
            if (targetIsImmune && effect.class === EFFECT_CLASSES.DEBUFF) {
                return true;
            }
            return getEnabledEffects(target).some((targetEffect: Effect) =>
                targetEffect.immunities?.some((type: EFFECT_TYPES) => type === effect.type)
            );
        };

        const effects: Effect[] = actionEffects
            .map((effect: String | Effect) => {
                if (typeof effect === "string") {
                    return {
                        ...enemyEffectNameMap[effect],
                    };
                }

                return effect as Effect;
            })
            .filter((effect) => !isImmuneTo(effect))
            .map((effect) => ({
                ...cloneDeep(effect),
                uptime: 0,
                id: uuid.v4(),
                applierId: actorId,
            }));

        const resourcesGained = Math.min(targetCombatant.maxResources - targetCombatant.resources, resources);
        return [
            {
                combatantId: targetCombatant.id,
                rawDamage: damage,
                healthDamage,
                healing,
                rawHealing,
                overhealing,
                armor: Math.max(-updatedTargetArmor, armorGained - damage),
                resources: resourcesGained,
                rawResources: resources,
                overcappedResources: resources - resourcesGained,
                effects,
                isDeathBlow: targetCombatant.HP > 0 && targetCombatant.HP - healthDamage + healing <= 0,
            },
            action,
        ];
    });
};
