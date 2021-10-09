import { Effect, Aura, Action } from "./../ability/types";
import { Ability } from "../ability/types";
import { Item } from "../item/types";

/** Interface of a battle participant */
export interface Combatant {
    HP: number;
    maxHP: number;
    armor: number;
    effects: Effect[];
    id: string;
    name: string;
    image: string;
    resources: number;
    isPlayer: boolean;
    damage?: number;
    aura?: Aura;
    casting?: Ability;
    turnHistory: Action[];
    maxResources?: number;
    resourcesPerTurn?: number;
    items: Item[];
}
