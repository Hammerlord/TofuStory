import { isOffensiveAction } from "../../ability/AbilityView/utils";
import { ACTION_TYPES, Action, TARGET_TYPES } from "../../ability/types";
import { Combatant } from "../../character/types";
import { getRandomItem, shuffle } from "../../utils";
import { BattleState } from "../reducer";
import { BATTLEFIELD_SIDES, CombatantInfo, TriggerSource } from "../types";
import { calculateActionArea, findCombatantData, getValidTargetIndices, hasTruesight } from "../utils";

export const calculateTargetIndices = ({
    action,
    selectedIndex,
    side,
    actorData,
    targetData,
    battle,
    source,
    isPreviewMode = false,
}: {
    action: Action;
    selectedIndex: number;
    side: BATTLEFIELD_SIDES;
    actorData: CombatantInfo;
    targetData: CombatantInfo;
    battle: BattleState;
    source?: TriggerSource;
    isPreviewMode: boolean;
}): {
    allIndices: number[];
    targetedIndices: number[];
} => {
    const { numTargets: extraTargets = 0, excludePrimaryTarget, resurrect, affectsDeadCharacters, targetArea = 0, targetName } = action;

    const area = calculateActionArea({ action, actor: actorData, target: targetData, source });

    let extraTargetIndices = getValidTargetIndices(battle[side], action.area, {
        excludeStealth: action.type === ACTION_TYPES.ATTACK || action.type === ACTION_TYPES.RANGE_ATTACK,
        excludeIndex: selectedIndex,
    }).filter((i) => Math.abs(i - selectedIndex) <= targetArea);

    if (!isPreviewMode) {
        extraTargetIndices = shuffle(extraTargetIndices).slice(0, extraTargets);
    }

    const isAffected = (combatant: Combatant | null, i: number): boolean => {
        // When summoning a minion, it can auto attack an enemy target. Display that proc as an indeterminate ability.
        const isProcPreview = isPreviewMode && source?.isProc && isOffensiveAction(action) && side === BATTLEFIELD_SIDES.ENEMY_SIDE;
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

    const isTargetableCombatant = (combatant: Combatant): boolean => {
        return combatant && (combatant?.HP > 0 || resurrect || affectsDeadCharacters);
    };

    const combatants = battle[side];
    const allIndices = [];
    const targetedIndices = [];

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
}): { index: number | undefined; side: BATTLEFIELD_SIDES | undefined } => {
    const actorData = findCombatantData(battle, actorId);
    if (!actorData) {
        return { index: undefined, side: undefined };
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
            const index = pickHostileIndex({ targetIndices: indices.map((item) => item.index), actorData });
            return { index, side: indices[0].side };
        }
        return getRandomItem(indices);
    }

    return { index: initialSelectedIndex, side: initialSelectedSide };
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
}): { index: number | undefined; side: BATTLEFIELD_SIDES | undefined }[] => {
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
            excludeStealth: true,
            onlyTaunt: true,
            onlyPriorityTarget: true,
        }).filter((i) => {
            return Math.abs(i - initialSelectedIndex || 0) <= (area || Infinity);
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
            excludeStealth: !hasTruesight(actorData.combatant),
            onlyTaunt: true,
            onlyPriorityTarget: true,
        })
            .filter((i) => {
                return Math.abs(i - initialSelectedIndex || 0) <= (area || Infinity);
            })
            .map((index) => ({ index, side: hostileSide }));
    }

    if (target === TARGET_TYPES.RANDOM_HOSTILE || isPlayerHostile) {
        const targetIndices = getValidTargetIndices(hostile, action.area, { onlyTaunt: true, onlyPriorityTarget: true })
            .filter((i) => {
                return Math.abs(i - initialSelectedIndex || 0) <= (area || Infinity);
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

            return Math.abs(i - initialSelectedIndex || 0) <= (area || Infinity);
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

    return [{ index: initialSelectedIndex, side: initialSelectedSide }];
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
