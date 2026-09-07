import { cloneDeep } from "lodash";
import { Ability } from "../../ability/types";
import { PreviewStatUpdate } from "../../character/AbilityPreview";
import { getNextTelegraphedAbility } from "../../character/Telegraph";
import getAbilityPreviews from "../../character/getAbilityPreviews";
import { Combatant, Player } from "../../character/types";
import { getCombatantMoveOrder } from "../actions/phases/getCombatantMoveOrder";
import { findCombatantData, isTurnActionPrevented } from "../actions/combatantData";
import { BATTLEFIELD_SIDES, BattleState } from "../types";

type ReticleCheck = (side: BATTLEFIELD_SIDES, index: number) => boolean;

type PreviewCombatantStates = {
    enemySide: (Combatant | null)[];
    playerSide: (Combatant | null)[];
};

type AbilityPreviewResult = {
    result: Record<string, PreviewStatUpdate[]>;
    combatantStates?: PreviewCombatantStates;
};

export const getAbilityUsePreviews = ({
    selectedAbility,
    hoveredCombatant,
    selectedMinion,
    player,
    playerSide,
    enemySide,
    battle,
    shouldShowReticle,
}: {
    selectedAbility?: Ability;
    hoveredCombatant: { side: BATTLEFIELD_SIDES; index: number; id: string | null } | null;
    selectedMinion?: Combatant | null;
    player: Player;
    playerSide: (Combatant | null)[];
    enemySide: (Combatant | null)[];
    battle: BattleState;
    shouldShowReticle: ReticleCheck;
}): AbilityPreviewResult => {
    const empty: AbilityPreviewResult = { result: {}, combatantStates: undefined };
    if (!selectedAbility || selectedAbility.disablePreview) {
        return empty;
    }

    if (hoveredCombatant && shouldShowReticle(hoveredCombatant.side, hoveredCombatant.index)) {
        return getAbilityPreviews({
            ability: selectedAbility,
            actor: selectedMinion || player,
            target: hoveredCombatant,
            battle,
        });
    }

    const result: { [combatantId: string]: PreviewStatUpdate[] } = {};
    const calculatePotentialResults = (combatants: (Combatant | null)[], side: BATTLEFIELD_SIDES) => {
        combatants.forEach((combatant, index) => {
            if (!combatant?.HP || !shouldShowReticle(side, index)) {
                return;
            }

            const preview = getAbilityPreviews({
                ability: selectedAbility,
                actor: selectedMinion || player,
                target: { index, id: combatant.id, side },
                battle,
            });
            result[combatant.id] = preview.result[combatant.id];
        });
    };

    calculatePotentialResults(enemySide, BATTLEFIELD_SIDES.ENEMY_SIDE);
    calculatePotentialResults(playerSide, BATTLEFIELD_SIDES.PLAYER_SIDE);
    return { result, combatantStates: undefined };
};

export const getTargetedByEnemyAbilities = ({
    battle,
    enemySide,
    round,
    previewAbilityCombatants,
}: {
    battle: BattleState;
    enemySide: (Combatant | null)[];
    round: number;
    previewAbilityCombatants?: PreviewCombatantStates;
}): Record<string, PreviewStatUpdate> => {
    const targetMap: Record<string, PreviewStatUpdate> = {};
    let previousCombatantStates = previewAbilityCombatants;

    getCombatantMoveOrder({ combatants: enemySide, round }).forEach((enemyId) => {
        const enemyInfo = findCombatantData({ ...battle, ...previousCombatantStates }, enemyId);
        if (!enemyInfo) {
            return;
        }

        const enemy = enemyInfo.combatant;
        const { targeting, HP, cantMove } = enemy || {};
        if (!targeting || HP === 0 || isTurnActionPrevented(enemyInfo) || cantMove) {
            return;
        }

        const ability = enemy.targeting?.ability || getNextTelegraphedAbility(enemyInfo);
        if (!ability) {
            return;
        }

        const abilityPreviews = getAbilityPreviews({
            ability,
            actor: enemy,
            battle,
            combatantStates: previousCombatantStates,
        });
        const { result, combatantStates } = abilityPreviews;
        previousCombatantStates = combatantStates;

        Object.entries(result).forEach(([combatantId, previews]) => {
            const traverseAndAggregate = (obj: unknown, otherObj: Record<string, unknown>): Record<string, unknown> => {
                if (!obj || typeof obj !== "object") {
                    return otherObj;
                }

                Object.entries(obj).forEach(([key, val]) => {
                    if (typeof otherObj[key] === "undefined") {
                        otherObj[key] = val;
                        return;
                    }

                    if (typeof val === "number") {
                        otherObj[key] = (typeof otherObj[key] === "number" ? otherObj[key] : 0) + val;
                        return;
                    }

                    if (Array.isArray(val)) {
                        const existingValues = Array.isArray(otherObj[key]) ? otherObj[key] : [];
                        otherObj[key] = [...existingValues, ...val];
                        return;
                    }

                    if (typeof val === "object") {
                        const existingObject =
                            otherObj[key] && typeof otherObj[key] === "object" && !Array.isArray(otherObj[key])
                                ? (otherObj[key] as Record<string, unknown>)
                                : {};
                        otherObj[key] = traverseAndAggregate(val, existingObject);
                        return;
                    }

                    otherObj[key] = val;
                });

                return otherObj;
            };

            const aggregated = previews.reduce((acc, preview: PreviewStatUpdate) => {
                if (!acc) {
                    return cloneDeep(preview);
                }

                return traverseAndAggregate(cloneDeep(preview), acc as unknown as Record<string, unknown>) as unknown as PreviewStatUpdate;
            }, targetMap[combatantId]);

            targetMap[combatantId] = aggregated;
        });
    });

    return targetMap;
};
