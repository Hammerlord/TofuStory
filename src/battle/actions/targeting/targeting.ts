import _ from "lodash";
import { isOffensiveAction } from "../../../ability/AbilityView/utils";
import { ACTION_TYPES, Action, CombatAbility, EFFECT_TYPES, TARGET_TYPES } from "../../../ability/types";
import { Combatant } from "../../../character/types";
import { getRandomItem, shuffle } from "../../../utils";
import { passesConditions } from "../../passesConditions";
import { ActionContext, BATTLEFIELD_SIDES, BattleState, CombatantInfo, NonCombatPlayerInfo } from "../../types";
import { hasTruesight, isStealthed, isUntargetable } from "../../utils";
import { findCombatantData, hasEffectType } from "../combatantData";
import { getEnabledEffects } from "../statusEffect/getEnabledEffects";

export const calculateTargetIndices = ({
    action,
    selectedIndex,
    side,
    actorData,
    targetData,
    battle,
    context,
    isPreviewMode = false,
}: {
    action: Action;
    selectedIndex: number;
    side: BATTLEFIELD_SIDES;
    actorData: CombatantInfo;
    targetData: CombatantInfo;
    battle: BattleState;
    context?: ActionContext;
    isPreviewMode: boolean;
}): {
    allIndices: number[];
    targetedIndices: number[];
    area: number;
} => {
    const {
        numExtraTargets: extraTargets = 0,
        excludePrimaryTarget,
        resurrect,
        affectsDeadCharacters,
        targetArea = 0,
        targetName,
    } = action;

    const area = calculateActionArea({ action, actor: actorData, target: targetData, context });

    let extraTargetIndices = getValidTargetIndices(battle[side], action.area || 0, {
        excludeIndex: selectedIndex,
    }).filter((i) => Math.abs(i - selectedIndex) <= targetArea);

    if (!isPreviewMode) {
        extraTargetIndices = shuffle(extraTargetIndices).slice(0, extraTargets);
    }

    const isAffected = (combatant: Combatant | null, i: number): boolean => {
        // When summoning a minion, it can auto attack an enemy target. Display that proc as an indeterminate ability.
        const isProcPreview = isPreviewMode && context?.isProc && isOffensiveAction(action) && side === BATTLEFIELD_SIDES.ENEMY_SIDE;
        if (isProcPreview) {
            return true;
        }

        const inArea = [selectedIndex, ...extraTargetIndices].some((j) => Math.abs(j - i) <= area);

        if (excludePrimaryTarget) {
            return inArea && i !== selectedIndex;
        }

        if (targetName && targetName === combatant?.name) {
            return true;
        }

        return inArea;
    };

    const isTargetableCombatant = (combatant: Combatant | null): boolean => {
        return Boolean(combatant && (combatant?.HP > 0 || resurrect || affectsDeadCharacters));
    };

    const combatants = battle[side];
    const allIndices: number[] = [];
    const targetedIndices: number[] = [];

    combatants.forEach((combatant: Combatant | null, i: number) => {
        if (isAffected(combatant, i)) {
            if (isTargetableCombatant(combatant)) {
                targetedIndices.push(i);
            }
            allIndices.push(i);
        }
    });

    return {
        allIndices,
        targetedIndices,
        area,
    };
};

/**
 * Sometimes, multi-action abilities have you select an enemy, but then have an additional action that eg. targets yourself.
 * This orients the target to the right place (if applicable) as actions are parsed.
 */
export const autoSelectActionTarget = ({
    initialSelectedIndex,
    initialSelectedSide,
    action,
    actorId,
    battle: battle,
}: {
    initialSelectedIndex?: number;
    initialSelectedSide?: BATTLEFIELD_SIDES;
    action: Action;
    actorId: string;
    battle: BattleState;
}): { index: number; side: BATTLEFIELD_SIDES } | undefined => {
    const actorData = findCombatantData(battle, actorId);
    if (!actorData) {
        return;
    }

    const indices = getValidTargetIndicesForAction({
        initialSelectedIndex,
        initialSelectedSide,
        action,
        actorData,
    });

    if (indices.length === 1) {
        return indices[0];
    }

    if (indices.length > 1) {
        const noValidSelection = typeof initialSelectedIndex !== "number" || !initialSelectedSide;
        if (action?.target === TARGET_TYPES.HOSTILE && noValidSelection) {
            const index = pickHostileIndex({ targetIndices: indices.map((item) => item.index).filter((v) => v !== undefined), actorData });
            if (typeof index === "number") {
                return { index, side: indices[0].side };
            }
            return;
        }
        return getRandomItem(indices);
    }

    if (initialSelectedSide && typeof initialSelectedIndex === "number") {
        return { index: initialSelectedIndex, side: initialSelectedSide };
    }
};

export const getValidTargetIndicesForAction = ({
    initialSelectedIndex,
    initialSelectedSide,
    action,
    actorData,
}: {
    initialSelectedIndex?: number;
    initialSelectedSide?: BATTLEFIELD_SIDES;
    action: Action;
    actorData: CombatantInfo;
}): { index: number; side: BATTLEFIELD_SIDES }[] => {
    let isPlayerHostile: boolean | undefined;
    const { friendly, hostile, friendlySide, hostileSide, combatant, index } = actorData;
    const actorId = combatant?.id;
    const { targetArea: area = 0, target, targetName, excludeActor, radiate } = action || {};

    if (radiate) {
        return [
            {
                index,
                side: friendlySide,
            },
        ];
    }

    if (target === TARGET_TYPES.PLAYER) {
        const friendlyPlayerIndex = friendly.findIndex((combatant) => combatant?.isPlayer);
        if (friendlyPlayerIndex > -1) {
            return [
                {
                    index: friendlyPlayerIndex,
                    side: friendlySide,
                },
            ];
        }

        const hostilePlayerIndex = hostile.findIndex((combatant) => combatant?.isPlayer);
        const targetIndices = getValidTargetIndices(hostile, action.area, {
            onlyTaunt: true,
            onlyPriorityTarget: true,
        }).filter((i) => {
            return Math.abs(i - (initialSelectedIndex || 0)) <= (area || Infinity);
        });

        if (hostilePlayerIndex > -1 && targetIndices.includes(hostilePlayerIndex)) {
            return [
                {
                    index: hostilePlayerIndex,
                    side: hostileSide,
                },
            ];
        }

        isPlayerHostile = hostilePlayerIndex > -1;
    }

    const noValidSelection = typeof initialSelectedIndex !== "number" || !initialSelectedSide;

    if ((target === TARGET_TYPES.HOSTILE || isPlayerHostile) && (noValidSelection || initialSelectedSide === friendlySide)) {
        return getValidTargetIndices(hostile, action.area, {
            onlyTaunt: true,
            onlyPriorityTarget: true,
        })
            .filter((i) => {
                return Math.abs(i - (initialSelectedIndex || 0)) <= (area || Infinity);
            })
            .map((index) => ({ index, side: hostileSide }));
    }

    if (target === TARGET_TYPES.RANDOM_HOSTILE || isPlayerHostile) {
        const targetIndices = getValidTargetIndices(hostile, action.area, { onlyTaunt: true, onlyPriorityTarget: true })
            .filter((i) => {
                return Math.abs(i - (initialSelectedIndex || 0)) <= (area || Infinity);
            })
            .map((index) => ({ index, side: hostileSide }));

        if (targetIndices.length) {
            return targetIndices;
        }

        const hostilePlayerIndex = hostile.findIndex((combatant) => combatant?.isPlayer);
        return [
            {
                index: hostilePlayerIndex,
                side: hostileSide,
            },
        ];
    }

    if (
        target === TARGET_TYPES.RANDOM_FRIENDLY ||
        (target === TARGET_TYPES.FRIENDLY && (noValidSelection || initialSelectedSide === hostileSide))
    ) {
        const targetIndices = getValidTargetIndices(friendly, action.area, { excludeUntargetable: false }).filter((i) => {
            if (excludeActor && actorId && friendly[i]?.id === actorId) {
                return false;
            }

            return Math.abs(i - (initialSelectedIndex || 0)) <= (area || Infinity);
        });

        return [
            {
                index: getRandomItem(targetIndices),
                side: friendlySide,
            },
        ];
    }

    if (target === TARGET_TYPES.SELF) {
        return [
            {
                index: friendly.findIndex((ally) => ally?.id === actorId),
                side: friendlySide,
            },
        ];
    }

    if (target === TARGET_TYPES.FRIENDLY_CHARACTER) {
        const index = friendly.findIndex((ally) => ally?.name === targetName);
        if (index > -1) {
            return [
                {
                    index,
                    side: friendlySide,
                },
            ];
        }
    }

    if (target === TARGET_TYPES.HOSTILE_CHARACTER) {
        const index = hostile.findIndex((ally) => ally?.name === targetName);
        if (index > -1) {
            return [
                {
                    index,
                    side: hostileSide,
                },
            ];
        }
    }

    if (initialSelectedSide && typeof initialSelectedIndex === "number") {
        return [{ index: initialSelectedIndex, side: initialSelectedSide }];
    }

    return [];
};

const pickHostileIndex = ({ targetIndices, actorData }: { targetIndices: number[]; actorData: CombatantInfo }): number | undefined => {
    const actorIndex = actorData.index;

    let baseProbability = 1 / targetIndices.length;
    // Enemies are more likely to attack targets closer to them. 0 proximity: +25%, 1 proximity: +15%; 2: +5%
    if (targetIndices.includes(actorIndex) && Math.random() < baseProbability + 0.25) {
        return actorIndex;
    }

    const adjacent = targetIndices.filter((index) => Math.abs(index - actorIndex) === 1);
    if (adjacent.length && Math.random() < baseProbability + 0.15) {
        return getRandomItem(adjacent);
    }

    const outer = targetIndices.filter((index) => Math.abs(index - actorIndex) === 2);
    if (outer.length && Math.random() < baseProbability + 0.05) {
        return getRandomItem(outer);
    }

    const rest = targetIndices.filter((index) => Math.abs(index - actorIndex) > 2);
    if (rest.length) {
        return getRandomItem(rest);
    }

    return getRandomItem(targetIndices);
};

/**
 * @returns indices of characters that are alive
 */
export const getValidTargetIndices = (
    characters: (Combatant | null)[],
    area: number | undefined,
    options: {
        excludeIndex?: number;
        onlyTaunt?: boolean;
        excludeUntargetable?: boolean;
        onlyPriorityTarget?: boolean;
    } = {}
): number[] => {
    const { excludeIndex, onlyTaunt, excludeUntargetable = true, onlyPriorityTarget } = options;

    const getIndicesForEffectType = (effectType: EFFECT_TYPES) => {
        const effectIndices: number[] = [];
        characters.forEach((character: Combatant | null, i: number) => {
            const notExcluded = excludeIndex !== i;
            if (character?.effects?.some((effect) => effect.type === effectType) && character?.HP > 0 && notExcluded) {
                effectIndices.push(i);
            }
        });

        return effectIndices;
    };

    let priorityIndices: number[] | undefined;
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
    const indices: { [index: string]: true } = {};
    characters.forEach((character: Combatant | null, i: number) => {
        const hp = character?.HP || 0;
        if (hp > 0) {
            const notExcluded = excludeIndex !== i;
            const untargetable = excludeUntargetable && isUntargetable(character);
            if (notExcluded && !untargetable) {
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
    context,
    battle,
}: {
    action?: Action;
    actor?: CombatantInfo | NonCombatPlayerInfo;
    target?: CombatantInfo;
    context?: ActionContext;
    battle?: BattleState | null;
}): number => {
    if (!action) {
        return 0;
    }
    const { area = 0 } = action;
    const isOffense = isOffensiveAction(action);
    let totalArea = area;
    if (isOffense) {
        getEnabledEffects({ combatantInfo: actor, context, battle }).forEach(({ offenseAreaIncrease = 0 }) => {
            totalArea += offenseAreaIncrease;
        });

        if (action.bonus) {
            const bonuses = Array.isArray(action.bonus) ? action.bonus : [action.bonus];
            bonuses.forEach((bonus) => {
                const allTargets = target ? [target] : [];
                if (bonus.area && passesConditions({ actor, target, allTargets, proc: bonus, context, battle })) {
                    totalArea += bonus.area;
                }
            });
        }
    }

    return totalArea;
};

export const isNegatedByStealth = ({
    action,
    actor,
    target,
    context,
}: {
    action: Action;
    actor?: CombatantInfo | NonCombatPlayerInfo;
    target?: CombatantInfo;
    context?: ActionContext;
}): boolean => {
    const isOffense = isOffensiveAction(action);
    if (!isOffense) {
        return false;
    }

    if (!hasEffectType(target, EFFECT_TYPES.STEALTH)) {
        return false;
    }

    const isPreviousActionTriggeredBypass = (context?.sourceChain || []).some((source) =>
        (source.source as CombatAbility)?.actions?.some((a) => a.bypassImmunity)
    );

    if (isPreviousActionTriggeredBypass || action.bypassStealth || action.bypassImmunity) {
        return false;
    }

    const area = calculateActionArea({ action, actor, target, context });
    if (area > 0) {
        return false;
    }

    return true;
};
