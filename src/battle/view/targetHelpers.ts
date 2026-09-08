import { Player } from "../../character/types";
import { Ability } from "../../ability/types";
import { findCombatantData } from "../actions/combatantData";
import { canUsePlayerAbility, isWithinPlayerAbilityArea } from "../actions/playerAbility";
import { isValidTargetForPlayerAbility } from "../actions/targeting/playerTargeting";
import { BattleState, BATTLEFIELD_SIDES } from "../types";

export type ReticleTargetContext = {
    selectedAbilityFromHand?: Ability | null;
    player: Player;
    selectedMinion?: { id?: string } | null;
    allowFriendlyMovement: boolean;
    movementAbility: Ability;
    hoveredCombatant: { side: BATTLEFIELD_SIDES; index: number; id: string | null } | null;
    abilityToUse?: Ability | null;
    battle: BattleState;
    actorId: string;
    combatantSide: BATTLEFIELD_SIDES;
    combatantIndex: number;
};

export const shouldShowReticleForTarget = ({
    selectedAbilityFromHand,
    player,
    selectedMinion,
    allowFriendlyMovement,
    movementAbility,
    hoveredCombatant,
    abilityToUse,
    battle,
    actorId,
    combatantSide,
    combatantIndex,
}: ReticleTargetContext): boolean => {
    if (selectedAbilityFromHand && !canUsePlayerAbility(player, selectedAbilityFromHand)) {
        return false;
    }

    const moveAbility = allowFriendlyMovement && selectedMinion ? movementAbility : undefined;

    if (!abilityToUse && !moveAbility) {
        return false;
    }

    const checkValidTargetForAbility = (ability: Ability | null | undefined) => {
        if (!ability) {
            return false;
        }

        if (
            !isValidTargetForPlayerAbility({
                ability,
                side: combatantSide,
                index: combatantIndex,
                battle,
                actorId,
            })
        ) {
            return false;
        }

        if (
            !hoveredCombatant ||
            !isValidTargetForPlayerAbility({
                ability,
                side: hoveredCombatant.side,
                index: hoveredCombatant.index,
                battle,
                actorId,
            })
        ) {
            return true;
        }

        const actorInfo = findCombatantData(battle, actorId);
        if (!actorInfo) {
            return false;
        }

        return isWithinPlayerAbilityArea({
            ability,
            actor: actorInfo,
            selectedIndex: hoveredCombatant.index,
            targetIndex: combatantIndex,
            battle,
        });
    };

    return checkValidTargetForAbility(abilityToUse) || checkValidTargetForAbility(moveAbility);
};

export type TargetedCombatantContext = {
    hoveredCombatant: { side: BATTLEFIELD_SIDES; index: number; id: string | null } | null;
    abilityToUse?: Ability | null;
    disableActions: boolean;
    actor?: { id?: string } | null;
    battle: BattleState;
    actorId?: string;
    side: BATTLEFIELD_SIDES;
    i: number | null;
};

export const isTargetedForAbility = ({
    hoveredCombatant,
    abilityToUse,
    disableActions,
    actor,
    battle,
    actorId,
    side,
    i,
}: TargetedCombatantContext): boolean => {
    const isValidIndex = (index: unknown): index is number => typeof index === "number";
    const noHover = !isValidIndex(hoveredCombatant?.index);
    const mismatchingSide = side !== hoveredCombatant?.side;

    if (!abilityToUse || disableActions || noHover || mismatchingSide || !actor || !actorId) {
        return false;
    }

    const hoveredIndex = hoveredCombatant?.index;

    if (
        !isValidTargetForPlayerAbility({
            ability: abilityToUse,
            side,
            index: hoveredIndex,
            battle,
            actorId,
        })
    ) {
        return false;
    }

    if (typeof i !== "number") {
        return false;
    }

    const actorInfo = findCombatantData(battle, actorId);
    if (!actorInfo) {
        return false;
    }

    return isWithinPlayerAbilityArea({
        ability: abilityToUse,
        actor: actorInfo,
        selectedIndex: hoveredIndex,
        targetIndex: i,
        battle,
    });
};
