import { Ability } from "../ability/types";
import { BATTLEFIELD_SIDES } from "../battle/types";
import { Item } from "../item/types";
import { Action, Aura, CombatEffect } from "./../ability/types";

/** Interface of a battle participant */
export interface Combatant {
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
    aura?: Aura;
    casting?: {
        ability: Ability;
        channelDuration?: number;
        castTime?: number;
        selectedIndex?: number;
        selectedSide?: BATTLEFIELD_SIDES;
    };
    turnHistory: Action[];
    maxResources?: number;
    resourcesPerTurn?: number;
    items: Item[];
    mesos?: number;
    drawCardsPerTurn: number;
}
