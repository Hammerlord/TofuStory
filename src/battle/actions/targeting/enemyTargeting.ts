import { CombatEffect, EFFECT_TYPES } from "../../../ability/types";
import { previewAction } from "../../../character/getAbilityPreviews";
import { getNextTelegraphedAbility } from "../../../character/Telegraph";
import { Combatant } from "../../../character/types";
import { BattleState } from "../../reducer";
import { BATTLEFIELD_SIDES, CombatantInfo, TRIGGER_SOURCE_TYPES } from "../../types";
import { findCombatantData } from "../combatantData";
import { performAction } from "../actions";
import { getEnemyMoveOrder, getUpdatedBattleActionTargets } from "../enemyTurn";
import { autoSelectActionTarget, getValidTargetIndicesForAction } from "./targeting";
import { updateCombatant } from "../combatantData";

/**
 * Enemy targeting is rolled once after their turn. But if during the player's turn, the board changes such that their targeting
 * becomes invalid (eg. applying armor to a Taunt unit that would have died), update the targeting here.
 */
export const checkValidEnemyTargeting = (options?: { validTargetSwitchId?: string }) => {
    return (dispatch, getState) => {
        let battle: BattleState = getState().battle;
        const validTargetSwitchId: string = options?.validTargetSwitchId;
        let targetSwitch: CombatantInfo | undefined;

        if (validTargetSwitchId) {
            targetSwitch = findCombatantData(battle, validTargetSwitchId);
        }

        const enemyOrderIds = getEnemyMoveOrder({ enemies: battle.enemySide, round: battle.round });
        enemyOrderIds.forEach((enemyId: string) => {
            const enemyInfo = findCombatantData(battle, enemyId);
            const combatant = enemyInfo?.combatant;
            if (!combatant?.HP) {
                return;
            }

            const currentTargeting = combatant.targeting;
            const ability = currentTargeting?.ability;
            if (!ability?.actions) {
                return;
            }

            let mutableUpdatedActionTargets = [];
            ability.actions.forEach((action, i) => {
                let target;
                const { side, index: currentTarIndex } = currentTargeting?.actionTargets?.[i] || {};
                const validIndices = getValidTargetIndicesForAction({ action, actorData: enemyInfo });
                if (validIndices.some((item) => item.side === side && item.index === currentTarIndex)) {
                    target = currentTargeting?.actionTargets?.[i];

                    if (targetSwitch) {
                        const randomTarget = autoSelectActionTarget({ action, actorId: enemyId, battle: battle });
                        if (randomTarget.index === targetSwitch.index && randomTarget.side === targetSwitch.friendlySide) {
                            target = randomTarget;
                        }
                    }
                }

                if (!target) {
                    target = autoSelectActionTarget({ action, actorId: enemyId, battle: battle });
                }

                mutableUpdatedActionTargets[i] = target;

                // If it's casting, it's not going to actually use the ability yet.
                const castAboutToTrigger = (combatant.casting?.castTime || 0) === 1;
                const notQueuingCast = !ability.castTime && !combatant.casting?.castTime;
                if (castAboutToTrigger || notQueuingCast) {
                    const preview = previewAction({
                        actionFn: performAction({
                            action,
                            selectedIndex: target.index,
                            side: target.side,
                            actorId: enemyId,
                            parentContext: { sourceChain: [{ source: ability, type: TRIGGER_SOURCE_TYPES.ABILITY }] },
                        }),
                        battle: battle,
                    });

                    battle = {
                        ...battle,
                        playerSide: preview.battle.playerSide,
                        enemySide: preview.battle.enemySide,
                    };
                }
            });

            dispatch(
                updateCombatant({
                    combatantId: enemyId,
                    newProperties: {
                        targeting: {
                            actionTargets: mutableUpdatedActionTargets,
                            ability,
                        },
                    },
                })
            );
        });
    };
};

/**
 * Switches the enemy's current telegraphed ability if it suddenly doesn't have the resources or requirements to use it,
 * eg. Grendel should stop casting the Storm Barrier attack if he has no armor.
 */
export const checkValidEnemyNextAbility = () => {
    return (dispatch, getState) => {
        let battle = getState().battle;
        battle.enemySide.forEach((enemy: Combatant | null) => {
            if (!enemy) {
                return;
            }

            const actorInfo = findCombatantData(getState().battle, enemy.id);
            if (!actorInfo) {
                return;
            }

            // ignoreDisabled: abilities disabled due to eg. stun do not count here since the target
            // would continue to use that ability after the stun fades.
            const ability = getNextTelegraphedAbility(actorInfo, { ignoreDisabled: true });
            const currentlyChosenAbility = enemy.targeting?.ability;
            if (!ability || !currentlyChosenAbility) {
                return;
            }

            if (!ability.actions) {
                console.error("Something bad happened to the actions of the ability:", ability.name, ability);
                return;
            }

            if (currentlyChosenAbility.name !== ability.name) {
                const { battle: updatedBattle, targets } = getUpdatedBattleActionTargets({ ability, battle, actorInfo });
                battle = updatedBattle;

                dispatch(
                    updateCombatant({
                        combatantId: enemy.id,
                        newProperties: {
                            targeting: {
                                ...targets,
                                ability,
                            },
                        },
                    })
                );
            }
        });
    };
};

/**
 * If a player or an ally taunts, the enemy targeting should reorient to it.
 */
export const updateEnemyTargetingAfterEffectsApplied = ({
    combatantId,
    effectsApplied = [],
}: {
    combatantId: string;
    effectsApplied: CombatEffect[];
}) => {
    return (dispatch, getState) => {
        if (effectsApplied.every((effect) => effect.type !== EFFECT_TYPES.TAUNT)) {
            return;
        }

        const combatant = findCombatantData(getState().battle, combatantId);
        if (combatant.friendlySide === BATTLEFIELD_SIDES.PLAYER_SIDE) {
            dispatch(checkValidEnemyTargeting({ validTargetSwitchId: combatantId }));
        }
    };
};
