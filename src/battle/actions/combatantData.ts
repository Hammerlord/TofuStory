import { CombatEffect, EFFECT_TYPES } from "../../ability/types";
import { Combatant, Player } from "../../character/types";
import { BATTLEFIELD_SIDES, CombatantInfo, TRIGGER_SOURCE_TYPES, TriggerSource } from "../types";

/**
 * Gets a combatant and details about its position and allies on the battlefield.
 */
export const findCombatantData = (
    battle?: {
        playerSide: (Combatant | null)[];
        enemySide: (Combatant | null)[];
    },
    combatantId?: string,
): CombatantInfo | undefined => {
    if (!battle || !combatantId) {
        return;
    }

    const { playerSide, enemySide } = battle;
    const enemyIndex = enemySide.findIndex(
        (combatant: Combatant | null) => combatant?.id === combatantId,
    );
    if (enemySide[enemyIndex]) {
        return {
            combatant: enemySide[enemyIndex],
            index: enemyIndex,
            friendly: enemySide.slice(),
            hostile: playerSide.slice(),
            friendlySide: BATTLEFIELD_SIDES.ENEMY_SIDE,
            hostileSide: BATTLEFIELD_SIDES.PLAYER_SIDE,
        };
    }

    const index = playerSide.findIndex(
        (combatant: Combatant | null) => combatant?.id === combatantId,
    );
    if (playerSide[index]) {
        return {
            combatant: playerSide[index],
            index,
            friendly: playerSide.slice(),
            hostile: enemySide.slice(),
            friendlySide: BATTLEFIELD_SIDES.PLAYER_SIDE,
            hostileSide: BATTLEFIELD_SIDES.ENEMY_SIDE,
        };
    }
};

export const updateCombatants = (
    characters: (Combatant | null)[],
    updateFn: (character: Combatant) => Combatant,
): (Combatant | null)[] => {
    return characters.map((character) => {
        if (!character) {
            return character;
        }

        return updateFn(character);
    });
};

/*
 * This is used to determine whether a computer-controlled combatant should act during its turn. It shouldn't prevent effect events from triggering.
 */
export const isTurnActionPrevented = (
    combatantInfo: CombatantInfo,
    options?: { bypassStun?: boolean; bypassPreventTurnAction: boolean },
): boolean => {
    if (!combatantInfo) {
        return true;
    }

    const combatant: Combatant | Player = combatantInfo.combatant;
    const turnPreventedFromEffects = combatant.effects.some((effect) => {
        return (
            (effect.preventTurnAction && !options?.bypassPreventTurnAction) ||
            ([EFFECT_TYPES.STUN, EFFECT_TYPES.FREEZE].includes(effect.type) && !options?.bypassStun)
        );
    });

    return turnPreventedFromEffects;
};

export const isActorPlayerSide = ({
    playerSide,
    source,
}: {
    playerSide: (Combatant | Player | null)[];
    source?: TriggerSource;
}) => {
    return playerSide.some((combatant) => {
        if (!combatant) {
            return false;
        }

        if (combatant.id === source?.actorId) {
            return true;
        }

        if (source?.type === TRIGGER_SOURCE_TYPES.EFFECT) {
            return (source?.source as CombatEffect).applierId === combatant.id;
        }

        return false;
    });
};
