import { Ability, CombatAbility, TARGET_TYPES } from "./../ability/types";
import { Action, TRIGGER_TARGET_TYPES } from "../ability/types";
import { calculateTargetIndices, findCombatantData, stageStatChanges } from "../battle/actions/actions";
import { passesConditions } from "../battle/passesConditions";
import { BATTLEFIELD_SIDES, CombatantInfo, TRIGGER_SOURCE_TYPES, TriggerSource } from "../battle/types";
import { getAbilityResourceCost } from "../battle/utils";
import { Combatant, Player } from "./types";
import { BattleState } from "../battle/reducer";
import { getUpdatedStats } from "../battle/actions/getUpdatedStats";
import { PreviewStatUpdate } from "./AbilityPreview";

const getAbilityPreviews = ({
    ability,
    actor,
    target,
    battle,
}: {
    ability: CombatAbility | Ability;
    actor: Combatant;
    target: { side: BATTLEFIELD_SIDES; index: number; id: string };
    battle: BattleState;
}): { [combatantId: string]: PreviewStatUpdate[] } => {
    const result = {};

    const previousCombatantStates = {
        battle: {
            playerSide: [...battle.playerSide],
            enemySide: [...battle.enemySide],
        },
    };

    ability.actions.forEach((action: Action) => {
        if (action.target === TARGET_TYPES.SELF && actor.id !== target.id) {
            return;
        }

        const actorData = findCombatantData(() => previousCombatantStates, actor.id);
        const targetData = findCombatantData(() => previousCombatantStates, target.id);

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
        const source: TriggerSource = { source: actionParent, type: TRIGGER_SOURCE_TYPES.ABILITY, triggerHistory: [] };

        if (
            !passesConditions({
                getCalculationTarget,
                proc: action,
                source,
            })
        ) {
            return;
        }

        const targetIndices = calculateTargetIndices({
            action,
            selectedIndex: target.index,
            side: target.side,
            actorData,
            targetData,
            battle,
            disableRollExtraTargets: true,
            source: { source: ability, type: TRIGGER_SOURCE_TYPES.ABILITY },
        });

        const targetIds = targetIndices
            .map((i: number) => previousCombatantStates.battle[target.side]?.[i]?.id)
            .filter((v) => v !== undefined);

        const updatedStatsProperties = {
            actorId: actor.id,
            targetIds,
            selectedIndex: target.index,
            action,
            getCombatantById: (id: string) => findCombatantData(() => previousCombatantStates, id),
            actionParent,
            source,
            ...battle,
        };

        getUpdatedStats(updatedStatsProperties).forEach(({ statUpdate, action }) => {
            const combatantId = statUpdate.combatantId;
            if (!result[combatantId]) {
                result[combatantId] = [];
            }

            const combatantInfo = findCombatantData(() => previousCombatantStates, combatantId);
            if (!combatantInfo?.combatant) {
                return;
            }

            const { index, combatant, friendlySide } = combatantInfo;
            const hasRandomSecondaryTargets = action.numTargets && target.index !== index;

            const staging = stageStatChanges(statUpdate, combatant);
            // If it's a multi-hit attack being previewed, we want to update the previous combatant state so we can get a more accurate preview of the proceeding hits
            previousCombatantStates.battle[friendlySide][index] = staging;
            const targetsRandomly =
                action.target === TARGET_TYPES.RANDOM_HOSTILE || actorData?.combatant?.effects.some((e) => e.hitRandomTarget);

            result[combatantId].push({
                statUpdate,
                nondeterministic: hasRandomSecondaryTargets || targetsRandomly,
                action,
            });
        });
    });

    return result;
};

export default getAbilityPreviews;
