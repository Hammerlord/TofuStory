import { PLAYER_CLASSES } from "../Menu/types";
import { Ability, CombatAbility, Minion, WeaponImageOptions } from "../ability/types";
import { BATTLEFIELD_SIDES } from "../battle/types";
import { Item } from "../item/types";
import { Action, CombatEffect } from "./../ability/types";

export interface TurnHistoryAction extends Action {
    parent: CombatAbility;
}

export type ActionTarget = {
    side: BATTLEFIELD_SIDES;
    index: number;
};

/** Interface of a battle participant */
export interface Combatant extends Minion {
    HP: number;
    maxHP: number;
    armor: number;
    effects: CombatEffect[];
    id: string;
    name: string;
    image: string;
    resources: number;
    isPlayer: boolean;
    damage?: number;
    // For storing an ability with a cast time/channel time. Merge this with Combatant targeting?
    casting?: {
        ability: Ability;
        channelDuration?: number;
        castTime?: number;
    } | null;
    turnHistory: TurnHistoryAction[];
    abilities: CombatAbility[];
    abilityHistory: (Ability | CombatAbility)[];
    maxResources?: number;
    resourcesPerTurn: number;
    items: Item[];
    mesos: number;
    targeting?: {
        // A targeting object for each ability.action
        actionTargets: ActionTarget[];
        ability: Ability;
    } | null;
}

export interface Player extends Combatant {
    class: PLAYER_CLASSES;
    drawCardsPerTurn: number;
    weaponSkins: { name: string; image: string; weaponImageOptions?: WeaponImageOptions; projectileOverride?: string | string[] }[];
}
