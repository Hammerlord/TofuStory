import { Ability } from "./../ability/types";
import { slam, bash, cleave, block, charge } from "../ability/Abilities";
import { basicDummy, ragingDummy, spikedDummy } from "../enemy/dummy";
import { createCombatant } from "../enemy/createEnemy";

export interface Wave {
    name?: string;
    description?: string;
    createEnemies: Function;
    presetDeck?: Ability[];
    rewards?: Array<any>;
    winCondition?: {
        surviveRounds?: number;
    }
}

const tutorial: Wave[] = [
    {
        name: "Basic attacks",
        description: "Defeat enemies by using your attacks on them.",
        createEnemies: () => [null, basicDummy, null, basicDummy, null].map(createCombatant),
        presetDeck: [bash, charge, slam],
    },
    {
        name: "Area attacks",
        description: "Target multiple enemies with Area attacks.",
        createEnemies: () => [null, basicDummy, basicDummy, basicDummy, null].map(createCombatant),
        presetDeck: [bash, bash, bash, cleave, cleave],
    },
    {
        name: "Supportive abilities",
        description: "Defend against attacks by using Block on yourself.",
        createEnemies: () =>
            [basicDummy, basicDummy, basicDummy, basicDummy, basicDummy].map(createCombatant),
        presetDeck: [block, block, block],
        winCondition: {
            surviveRounds: 1,
        },
    },
    {
        name: "Enemy affixes",
        description: "This dummy has Thorns. Hover over the icon to see what it does.",
        createEnemies: () => [null, null, spikedDummy, null, null].map(createCombatant),
        presetDeck: [bash, bash, slam],
    },
    {
        name: "Defeat the Raging Dummy",
        description: "Defeat the Raging Dummy and its minions!",
        createEnemies: () => [null, basicDummy, ragingDummy, basicDummy, null].map(createCombatant),
        presetDeck: [bash, bash, slam, cleave, block, block, charge],
    },
];

export default tutorial;
