import { Effect } from './../ability/types';
import { Ability } from "../ability/types";

/** Interface of a battle participant */
export interface Combatant {
    HP: number;
    maxHP: number;
    armor: number;
    effects: Effect[];
    id: string;
    resources: number; // Monsters probably do not use resources, but...
    isPlayer: boolean;
    damage?: number;
}

/** Player in combat */
export interface CombatPlayer extends Combatant {
    hand: Ability[];
    deck: Ability[];
    discard: Ability[];
}