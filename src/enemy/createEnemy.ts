import { cloneDeep } from "lodash";
import uuid from "uuid";
import { Combatant } from "../character/types";
import { getRandomItem, shuffle } from "./../utils";
import {
    bigBeefy, createSyntheticAttack,
    smalltofu, thefaketofu, theraretofu, theRegalTofu
} from "./tofu";

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
        resources: combatant.resources || 0,
        casting: null,
        abilities: [
            ...(combatant.abilities || []),
            ...Array.from({ length: 3 }).map(createSyntheticAttack),
        ],
        turnHistory: []
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
            theRegalTofu,
            theRegalTofu,
            bigBeefy,
            theraretofu,
        ]);

        enemies.push(createCombatant(enemy));
    }

    for (let i = numEnemies; i < 5; ++i) {
        enemies.push(null);
    }

    return shuffle(enemies);
};

export default createCombatant;
