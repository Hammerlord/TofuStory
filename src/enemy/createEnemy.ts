import { Combatant } from "../character/types";
import { getRandomItem, shuffle } from "./../utils";
import {
    realtofu,
    theraretofu,
    thefaketofu,
    createSyntheticAttack,
    smalltofu,
    bigBeefy,
} from "./tofu";
import uuid from "uuid";

export const createEnemyCombatant = (enemy): Combatant => {
    if (!enemy) {
        return null;
    }
    return {
        id: uuid.v4(),
        ...enemy,
        HP: enemy.HP || enemy.maxHP,
        effects: [],
    };
};

export const createEnemies = (): Combatant[] => {
    // Test function
    const numEnemies = getRandomItem([2, 3, 3, 4, 4, 5]);
    const enemies = [];
    for (let i = 0; i < numEnemies; ++i) {
        const enemy = getRandomItem([
            smalltofu,
            smalltofu,
            smalltofu,
            thefaketofu,
            thefaketofu,
            realtofu,
            theraretofu,
            bigBeefy,
            bigBeefy,
        ]);
        const copy = {
            ...enemy,
            abilities: [
                ...(enemy.abilities || []),
                ...Array.from({ length: 3 }).map(() =>
                    createSyntheticAttack(enemy)
                ),
            ],
        };

        enemies.push(createEnemyCombatant(copy));
    }

    for (let i = numEnemies; i < 5; ++i) {
        enemies.push(null);
    }

    return shuffle(enemies);
};

export default createEnemyCombatant;
