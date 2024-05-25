import { Action, TRIGGER_TARGET_TYPES } from "../ability/types";
import { findCombatantData, performAction } from "../battle/actions/actions";
import { UpdatedCombatantStats } from "../battle/actions/getUpdatedStats";
import { passesConditions } from "../battle/passesConditions";
import { BattleState } from "../battle/reducer";
import { BATTLEFIELD_SIDES, CombatantInfo, TRIGGER_SOURCE_TYPES, TriggerSource } from "../battle/types";
import { getAbilityResourceCost } from "../battle/utils";
import { Ability, CombatAbility, TARGET_TYPES } from "./../ability/types";
import { PreviewStatUpdate } from "./AbilityPreview";
import { Combatant } from "./types";
import { validate as uuidValidate } from "uuid";

export const getEmptyTileKey = (index: number, side: BATTLEFIELD_SIDES) => [index, side].join("-");

const previewAction = ({ actionFn, battle }) => {
    const statUpdates = {};
    // id: statUpdates so that we don't get duplicates
    const statUpdateMemo = {};

    const dispatch = (arg) => {
        if (typeof arg === "function") {
            return arg(dispatch, getState);
        }

        const payload = arg?.payload || {};
        battle = { ...battle, ...payload };

        // RIP issue where newCards actions were causing damage to display twice, because its event payload object reuses the same set of stat updates as the actual action
        if (!payload?.statUpdates || payload.newCards) {
            return;
        }

        const { statUpdates: currentStatUpdates, allTargetIndices, targetSide, action } = payload;
        if (currentStatUpdates.id && statUpdateMemo[currentStatUpdates.id]) {
            return;
        }

        statUpdateMemo[currentStatUpdates.id] = true;

        if (currentStatUpdates) {
            Object.entries(currentStatUpdates).forEach(([key, value]: [string, object]) => {
                if (!statUpdates[key]) {
                    statUpdates[key] = [];
                }

                statUpdates[key].push({ ...value, action: payload.action });
            });
        }

        // Projected stat updates for empty spaces during AoE effects:
        if (allTargetIndices && targetSide && action) {
            allTargetIndices.forEach((index: number) => {
                const key = getEmptyTileKey(index, targetSide);
                if (!statUpdates[key]) {
                    statUpdates[key] = [];
                }

                const { damage = 0, armor = 0, healing = 0, resources = 0, effects = [] } = action;
                const projectedStatUpdate: UpdatedCombatantStats = {
                    combatantId: key,
                    rawDamage: damage,
                    healthDamage: damage,
                    armor,
                    resources,
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

        const lookupCombatantDataHelper = (id: string) => {
            return findCombatantData(() => ({ battle: previousCombatantStates }), id);
        };

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

        const resourceCost = getAbilityResourceCost({
            combatant: actor,
            resourceCost: ability.resourceCost,
            // @ts-ignore
            effects: ability.effects || [],
        });
        const actionParent = {
            ...ability,
            resourceCost,
        };

        const source: TriggerSource = {
            source: actionParent,
            actorId: actor.id,
            type: TRIGGER_SOURCE_TYPES.ABILITY,
            triggerHistory: [],
            isPreviewMode: true,
        };

        if (
            !passesConditions({
                getCalculationTarget,
                proc: action,
                source,
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
                parent: actionParent,
                parentSource: source,
                selectedIndex: target.index,
                side: target.side,
                actorId: actor.id,
            }),
            battle: { ...battle, ...previousCombatantStates },
        });

        previousCombatantStates.playerSide = previews.battle.playerSide;
        previousCombatantStates.enemySide = previews.battle.enemySide;
        const targetsRandomly =
            !actorCurrentTarget &&
            (action.target === TARGET_TYPES.RANDOM_HOSTILE || actorData?.combatant?.effects.some((e) => e.hitRandomTarget));

        const affectedTargetCount = Object.keys(previews.statUpdates).filter((id) => uuidValidate(id)).length;

        Object.values(previews.statUpdates).forEach((statUpdates: UpdatedCombatantStats[]) => {
            statUpdates.forEach((statUpdate) => {
                // @ts-ignore .action property appended by previewAction
                const currentAction = statUpdate.action;
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
                const hasRandomSecondaryTargets = totalTargets && affectedTargetCount > totalTargets && target.index !== index;

                result[id].push({
                    statUpdate,
                    nondeterministic: hasRandomSecondaryTargets || targetsRandomly,
                    action: currentAction,
                });
            });
        });
    });

    return {
        result,
        combatantStates: previousCombatantStates,
    };
};

export default getAbilityPreviews;
