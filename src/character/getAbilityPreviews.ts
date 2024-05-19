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

const previewAction = ({ actionFn, battle }) => {
    const statUpdates = {};
    const dispatch = (arg) => {
        if (typeof arg === "function") {
            return arg(dispatch, getState);
        }

        if (arg?.payload) {
            battle = { ...battle, ...arg.payload };

            if (arg?.payload?.statUpdates) {
                Object.entries(arg.payload.statUpdates).forEach(([key, value]: [string, object]) => {
                    if (!statUpdates[key]) {
                        statUpdates[key] = [];
                    }

                    statUpdates[key].push({ ...value, action: arg.payload.action });
                });
            }
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
    target,
    battle,
    combatantStates,
}: {
    ability: CombatAbility | Ability;
    actor: Combatant;
    target: { side: BATTLEFIELD_SIDES; index: number; id: string };
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

    ability.actions.forEach((action: Action) => {
        if (action.target === TARGET_TYPES.SELF && actor.id !== target.id) {
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
            disableRollExtraTargets: true,
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
            action.target === TARGET_TYPES.RANDOM_HOSTILE || actorData?.combatant?.effects.some((e) => e.hitRandomTarget);

        const affectedTargetCount = Object.keys(previews.statUpdates).length;

        Object.values(previews.statUpdates).forEach((statUpdates: UpdatedCombatantStats[]) => {
            statUpdates.forEach((statUpdate) => {
                // @ts-ignore .action property appended by previewAction
                const currentAction = statUpdate.action || action;
                const combatantId = statUpdate.combatantId;
                if (!result[combatantId]) {
                    result[combatantId] = [];
                }

                const combatantInfo = lookupCombatantDataHelper(combatantId);
                if (!combatantInfo?.combatant) {
                    return;
                }

                const { index } = combatantInfo;
                const totalTargets = currentAction.numTargets + 1;
                const hasRandomSecondaryTargets = affectedTargetCount > totalTargets && target.index !== index;

                result[combatantId].push({
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
