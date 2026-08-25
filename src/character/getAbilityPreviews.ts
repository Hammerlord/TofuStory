import { isOffensiveAction } from "../ability/AbilityView/utils";
import { Action, TRIGGER_TARGET_TYPES } from "../ability/types";
import { performAction } from "../battle/actions/performAction";
import { checkValidEnemyTargeting } from "../battle/actions/targeting/enemyTargeting";
import { UpdatedCombatantStats } from "../battle/actions/getUpdatedStats";
import { checkSummonMinion } from "../battle/actions/summon/summon";
import { passesConditions } from "../battle/passesConditions";
import { BattleState } from "../battle/reducer";
import { BATTLEFIELD_SIDES, CombatantInfo, Event, TRIGGER_SOURCE_TYPES, ActionContext } from "../battle/types";
import { getPlayerAbilityResourceCost } from "../battle/actions/playerAbility";
import { findCombatantData } from "../battle/actions/combatantData";
import { Ability, CombatAbility, TARGET_TYPES } from "./../ability/types";
import { PreviewStatUpdate } from "./AbilityPreview";
import { Combatant } from "./types";
import { validate as uuidValidate } from "uuid";

export const getEmptyTileKey = (index: number, side: BATTLEFIELD_SIDES) => [index, side].join("-");

type BattleStateEventPayload = BattleState & Event;

export const previewAction = ({
    actionFn,
    battle,
}: {
    actionFn: (dispatch, getState) => void;
    battle: BattleState;
}): { battle: BattleState; statUpdates: { [key: string]: UpdatedCombatantStats[] } } => {
    const statUpdates = {};

    const dispatch = (reduxAction) => {
        if (typeof reduxAction === "function") {
            return reduxAction(dispatch, getState);
        }

        const payload: BattleStateEventPayload = reduxAction?.payload || {};
        battle = {
            ...battle,
            playerSide: payload.playerSide || battle.playerSide,
            enemySide: payload.enemySide || battle.enemySide,
        };

        // RIP issue where addCards actions were causing damage to display twice, because its event payload object reuses the same set of stat updates as the actual action
        if (!payload?.statUpdates || payload.addCards?.length) {
            return;
        }

        const { statUpdates: currentStatUpdates, selectedIndex, allTargetIndices, targetSide, action } = payload;

        if (currentStatUpdates) {
            Object.entries(currentStatUpdates).forEach(([combatantId, value]: [string, object]) => {
                if (!statUpdates[combatantId]) {
                    statUpdates[combatantId] = [];
                }

                statUpdates[combatantId].push({ ...value, action: payload.action });
            });
        }

        // Projected stat updates for empty spaces during AoE effects:
        if (allTargetIndices && targetSide && action) {
            allTargetIndices.forEach((index: number) => {
                const key = getEmptyTileKey(index, targetSide);
                if (!statUpdates[key]) {
                    statUpdates[key] = [];
                }

                const {
                    damage = 0,
                    secondaryDamage = 0,
                    armor = 0,
                    healing = 0,
                    resources = 0,
                    effects = [],
                    damageDividedByTargets,
                    resurrect,
                } = action;

                let finalDamage = index === selectedIndex ? damage : secondaryDamage || damage;
                if (damageDividedByTargets) {
                    const allTargets = battle[targetSide]?.filter((combatant: Combatant | null, i: number) => {
                        return (combatant?.HP || resurrect) && allTargetIndices.includes(i);
                    });
                    finalDamage = Math.ceil(finalDamage / allTargets.length);
                }

                const projectedStatUpdate: UpdatedCombatantStats = {
                    combatantId: key,
                    rawDamage: finalDamage,
                    healthDamage: finalDamage,
                    armor,
                    resources,
                    // @ts-ignore It's just a preview, not a CombatEffect; it doesn't need metadata like `id` etc.
                    effects,
                    healing,
                    overkill: 0,
                };
                statUpdates[key].push({ ...projectedStatUpdate, action });
            });
        }
    };

    const getState = () => ({
        battle,
    });

    actionFn(dispatch, getState);
    return {
        battle,
        statUpdates,
    };
};

const previewTargetChange = ({
    targetChangeCheckFn,
    battle,
}: {
    targetChangeCheckFn: (dispatch, getState) => void;
    battle: BattleState;
}) => {
    const getState = () => ({
        battle,
    });

    const dispatch = (reduxAction) => {
        if (typeof reduxAction === "function") {
            return reduxAction(dispatch, getState);
        }

        const { combatantId, newProperties } = reduxAction?.payload || {};
        if (!combatantId) {
            return;
        }
        battle = {
            ...battle,
            enemySide: battle.enemySide.map((c) => {
                if (c?.id !== combatantId) {
                    return c;
                }

                return {
                    ...c,
                    ...newProperties,
                };
            }),

            playerSide: battle.playerSide.map((c) => {
                if (c?.id !== combatantId) {
                    return c;
                }

                return {
                    ...c,
                    ...newProperties,
                };
            }),
        };
    };

    targetChangeCheckFn(dispatch, getState);

    return battle;
};

const getAbilityPreviews = ({
    ability,
    actor,
    target: initTarget, // Provide this for previewing a player ability. If previewing an enemy ability, actor.targeting.actionTargets is used instead.
    battle,
    combatantStates,
}: {
    ability: CombatAbility | Ability;
    actor: Combatant;
    target?: { side: BATTLEFIELD_SIDES; index: number; id: string };
    battle: BattleState;
    combatantStates?: { enemySide: (Combatant | null)[]; playerSide: (Combatant | null)[] };
}): {
    result: { [combatantId: string]: PreviewStatUpdate[] };
    combatantStates: { enemySide: (Combatant | null)[]; playerSide: (Combatant | null)[] };
} => {
    const result = {};
    const hasYetToCastAbility = !actor.casting && ability?.castTime;

    const previousCombatantStates = combatantStates || {
        playerSide: [...battle.playerSide],
        enemySide: [...battle.enemySide],
    };

    if (!ability || hasYetToCastAbility) {
        return {
            result,
            combatantStates: previousCombatantStates,
        };
    }

    const resourceCost = getPlayerAbilityResourceCost({
        combatant: actor,
        resourceCost: ability.resourceCost,
        // @ts-ignore
        effects: ability.effects || [],
    });
    const actionParent = {
        ...ability,
        resourceCost,
    };

    const context: ActionContext = {
        sourceChain: [{ source: actionParent, actorId: actor.id, type: TRIGGER_SOURCE_TYPES.ABILITY }],
        triggerHistory: [],
        isPreviewMode: true,
    };

    const lookupCombatantDataHelper = (id: string): CombatantInfo => {
        return findCombatantData({ ...battle, ...previousCombatantStates }, id);
    };

    const handleStatUpdatePreviews = ({
        targetsRandomly,
        previews,
        targetIndex,
    }: {
        targetsRandomly?: boolean;
        previews: { battle: BattleState; statUpdates: { [key: string]: UpdatedCombatantStats[] } };
        targetIndex?: number;
    }) => {
        previousCombatantStates.playerSide = previews.battle.playerSide;
        previousCombatantStates.enemySide = previews.battle.enemySide;
        const affectedTargetCount = Object.keys(previews.statUpdates).filter((id) => uuidValidate(id)).length;

        Object.values(previews.statUpdates).forEach((statUpdates: UpdatedCombatantStats[]) => {
            statUpdates.forEach((statUpdate) => {
                // @ts-ignore .action property appended by previewAction
                const currentAction = statUpdate.action;
                if (!currentAction) {
                    return;
                }

                const id = statUpdate.combatantId;

                if (!result[id]) {
                    result[id] = [];
                }

                const combatantInfo = lookupCombatantDataHelper(id);
                if (!combatantInfo?.combatant) {
                    // It's an empty tile preview.
                    result[id].push({
                        statUpdate,
                        nondeterministic: targetsRandomly,
                        action: currentAction,
                    });

                    return;
                }

                const { index } = combatantInfo;
                const totalTargets = currentAction?.numTargets + 1 || 0;
                const hasRandomSecondaryTargets = totalTargets && affectedTargetCount > totalTargets && targetIndex !== index;
                const isProc = statUpdate.context?.sourceChain?.at(-1)?.isProc;
                const isProcHostileAction = isProc && isOffensiveAction(currentAction) && affectedTargetCount > 1;

                result[id].push({
                    statUpdate,
                    nondeterministic: hasRandomSecondaryTargets || targetsRandomly || isProcHostileAction,
                    action: currentAction,
                });
            });
        });
    };

    const summonPreviews = previewAction({
        actionFn: checkSummonMinion({
            ability,
            selectedIndex: initTarget?.index,
            side: initTarget?.side,
            actorId: actor.id,
            parentContext: context,
            isAutoCast: false,
        }),
        battle: { ...battle, ...previousCombatantStates },
    });

    handleStatUpdatePreviews({ previews: summonPreviews });

    const actions: Action[] =
        ability.resourceCost === "x"
            ? (Array.from({ length: actor.resources }).reduce((acc: Action[]) => {
                  acc.push(...ability.actions);
                  return acc;
              }, []) as Action[])
            : ability.actions;

    actions.forEach((action: Action, i) => {
        const actorCurrentTarget = actor.targeting?.actionTargets?.[i];

        const target = (() => {
            if (initTarget) {
                return initTarget;
            }

            if (actorCurrentTarget) {
                return {
                    ...actorCurrentTarget,
                    id: battle[actorCurrentTarget.side]?.[actorCurrentTarget.index]?.id,
                };
            }
        })();

        if (!target) {
            return;
        }

        if (action.target === TARGET_TYPES.SELF && actor.id !== target.id) {
            return;
        }

        if (action.target === TARGET_TYPES.RANDOM_FRIENDLY) {
            return;
        }

        const actorData = lookupCombatantDataHelper(actor.id);
        const targetData = lookupCombatantDataHelper(target.id);

        const getCalculationTarget = (calculationTarget: TRIGGER_TARGET_TYPES): CombatantInfo => {
            if (calculationTarget === TRIGGER_TARGET_TYPES.ACTOR) {
                return actorData;
            }

            if (calculationTarget === TRIGGER_TARGET_TYPES.TARGET) {
                return targetData;
            }
        };

        if (
            !passesConditions({
                getCalculationTarget,
                proc: action,
                context,
            })
        ) {
            return;
        }

        if (action.autoCastAbilities) {
            // Random auto-cast abilities cannot be simulated in a preview because it will only ever give a random snapshot of what could happen
            result[actor.id] = [
                {
                    statUpdate: {},
                    nondeterministic: false,
                    action,
                },
            ];
            return;
        }

        const previews = previewAction({
            actionFn: performAction({
                action,
                parentContext: context,
                selectedIndex: target.index,
                side: target.side,
                actorId: actor.id,
            }),
            battle: { ...battle, ...previousCombatantStates },
        });

        previousCombatantStates.playerSide = previews.battle.playerSide;
        previousCombatantStates.enemySide = previews.battle.enemySide;
        const targetChangePreview = previewTargetChange({
            targetChangeCheckFn: checkValidEnemyTargeting,
            battle: { ...battle, ...previousCombatantStates },
        });
        previousCombatantStates.playerSide = targetChangePreview.playerSide;
        previousCombatantStates.enemySide = targetChangePreview.enemySide;

        const targetsRandomly =
            !actorCurrentTarget &&
            (action.target === TARGET_TYPES.RANDOM_HOSTILE || actorData?.combatant?.effects.some((e) => e.hitRandomTarget));

        handleStatUpdatePreviews({ targetsRandomly, previews: previews, targetIndex: target.index });
    });

    return {
        result,
        combatantStates: previousCombatantStates,
    };
};

export default getAbilityPreviews;
