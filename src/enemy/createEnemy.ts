import { cloneDeep } from "lodash";
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

export const createCombatant = (combatant): Combatant => {
    if (!combatant) {
        return null;
    }
    return {
        id: uuid.v4(),
        ...combatant,
        HP: combatant.HP || combatant.maxHP,
        effects: combatant.effects?.map(cloneDeep) || [],
        armor: 0,
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
                ...Array.from({ length: 3 }).map(() => createSyntheticAttack(enemy)),
            ],
        };

        enemies.push(createCombatant(copy));
    }

    for (let i = numEnemies; i < 5; ++i) {
        enemies.push(null);
    }

    return shuffle(enemies);
};

export default createCombatant;
