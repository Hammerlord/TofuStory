import { PLAYER_CLASSES } from "../Menu/types";
import { Ability, Minion } from "../ability/types";
import { BATTLEFIELD_SIDES } from "../battle/types";
import { Item } from "../item/types";
import { Action, CombatEffect } from "./../ability/types";

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
    casting?: {
        ability: Ability;
        channelDuration?: number;
        castTime?: number;
        selectedIndex?: number;
        selectedSide?: BATTLEFIELD_SIDES;
    };
    turnHistory: Action[];
    abilityHistory: Ability[];
    maxResources?: number;
    resourcesPerTurn?: number;
    items: Item[];
    mesos?: number;
    weapon?: string; // Weapon image
}

export interface Player extends Combatant {
    class?: PLAYER_CLASSES;
    secondaryClass?: string | null;
    drawCardsPerTurn: number;
    weaponSkins: { name: string; image: string }[];
}
