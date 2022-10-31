import { getMaxHP } from "./../utils";
import { cloneDeep } from "lodash";
import uuid from "uuid";
import { Ability, Action, Effect, EFFECT_CLASSES, EFFECT_TYPES } from "../../ability/types";
import { Combatant } from "../../character/types";
import { Item } from "../../item/types";
import { calculateArmor, calculateBonus, calculateDamage, calculateHealing, getEnabledEffects, hasEffectType } from "../utils";
import { enemyEffectNameMap } from "./../../enemy/effect";
import { TriggerSource } from "./../types";

export interface UpdatedCombatantStats {
    combatantId: string;
    rawDamage: number;
    healthDamage: number;
    healing: number;
    armor: number;
    resources: number;
    overcappedResources: number;
    effects: Effect[];
    isDeathBlow: boolean;
}

export const getUpdatedStats = ({
    actorId,
    targetIds,
    targetIndices,
    selectedIndex,
    action: initialAction,
    actionParent,
    source,
    getCombatantById,
}: {
    actorId?: string;
    targetIds: string[];
    targetIndices: number[];
    selectedIndex?: number; // Only applicable for abilities with manual selection?
    action: Action;
    actionParent?: Ability | Item;
    source: TriggerSource;
    getCombatantById: (id: string) => Combatant;
}): [UpdatedCombatantStats, Action][] => {
    const actor = getCombatantById(actorId);
    const targets = targetIds.map(getCombatantById);
    const sourceTargets = (source.allTargetIds || []).map(getCombatantById); // TODO used to be used in calculating multipliers

    return targets.map((target: Combatant, i: number) => {
        const targetIndex = targetIndices[i];
        const action = calculateBonus({
            action: initialAction,
            target,
            actor,
            allTargets: targets,
            isTargetSelected: targetIndex === selectedIndex,
            actionParent,
        });
        const { effects: actionEffects = [], resources = 0, destroyArmor = 0, resurrect } = action;

        const damage = calculateDamage({ actor, target, targetIndex, selectedIndex, action, actionParent });
        const baseArmor = Math.floor(target.armor * (1 - destroyArmor));
        const updatedTargetArmor = baseArmor + calculateArmor({ target, action, actor });
        const armorGained = updatedTargetArmor - target.armor;
        const healthDamage = Math.max(0, damage - updatedTargetArmor);
        let rawHealing = 0;
        if (target.HP - healthDamage > 0 || resurrect) {
            rawHealing = calculateHealing({ actor, target, action });
        }

        const healing = Math.min(getMaxHP(target) - target.HP, rawHealing);

        const targetIsImmune = hasEffectType(target, EFFECT_TYPES.IMMUNITY);
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

        const resourcesGained = Math.min(target.maxResources - target.resources, resources);
        return [
            {
                combatantId: target.id,
                rawDamage: damage,
                healthDamage,
                healing,
                rawHealing,
                armor: Math.max(-updatedTargetArmor, armorGained - damage),
                resources: resourcesGained,
                overcappedResources: resources - resourcesGained,
                effects,
                isDeathBlow: target.HP > 0 && target.HP - healthDamage + healing <= 0,
            },
            action,
        ];
    });
};
