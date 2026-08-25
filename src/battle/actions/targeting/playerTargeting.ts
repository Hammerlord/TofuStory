import { Ability, TARGET_TYPES, TRIGGER_TARGET_TYPES, EFFECT_TYPES } from "../../../ability/types";
import { findCombatantData } from "../combatantData";
import { passesConditions } from "../../passesConditions";
import { BattleState } from "../../reducer";
import { BATTLEFIELD_SIDES, TRIGGER_SOURCE_TYPES, CombatantInfo, ActionContext } from "../../types";
import { isUntargetable, isStealthed } from "../../utils";
import { hasEffectType } from "../combatantData";
import { calculateActionArea } from "./targeting";

export const isValidTargetForPlayerAbility = ({
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
    const context: ActionContext = { sourceChain: [{ source: ability, type: TRIGGER_SOURCE_TYPES.ABILITY }] };
    const area =
        calculateActionArea({
            action: actions[0],
            actor: actorData,
            context,
        }) ||
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
            const conditionsPassed = actions.some((action) => passesConditions({ getCalculationTarget, proc: action, context }));
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

        const conditionsPassed = actions.some((action) => passesConditions({ getCalculationTarget, proc: action, context }));
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
