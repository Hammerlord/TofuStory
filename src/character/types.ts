import { Effect, Aura } from './../ability/types';
import { Ability } from "../ability/types";

/** Interface of a battle participant */
export interface Combatant {
    HP: number;
    maxHP: number;
    armor: number;
    effects: Effect[];
    id: string;
    resources: number;
    isPlayer: boolean;
    damage?: number;
    aura?: Aura;
}

/** Player in combat */
export interface CombatPlayer extends Combatant {
    hand: Ability[];
    deck: Ability[];
    discard: Ability[];
}