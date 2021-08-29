import { Ability } from "./../ability/types";
import { slam, bash, cleave, block, charge, snailMinion } from "../ability/Abilities";
import { basicDummy, ragingDummy, spikedDummy } from "../enemy/dummy";
import { createCombatant } from "../enemy/createEnemy";

export interface Wave {
    name?: string;
    description?: string | string[];
    createEnemies: Function;
    presetDeck?: Ability[];
    rewards?: Array<any>;
    winCondition?: {
        surviveRounds?: number;
    };
}

const tutorial: Wave[] = [
    {
        name: "Basic attacks",
        description: [
            "Select an ability and an enemy to use it on.",
            "After usage, the ability goes on Cooldown until you reach the end of your Deck.",
            "When you're out of moves, click End Turn to proceed.",
        ],
        createEnemies: () => [null, basicDummy, null, basicDummy, null].map(createCombatant),
        presetDeck: [bash, charge, slam],
    },
    {
        name: "Area attacks",
        description: "Target multiple enemies with Area attacks like Cleave.",
        createEnemies: () => [null, basicDummy, basicDummy, basicDummy, null].map(createCombatant),
        presetDeck: [bash, bash, bash, cleave, cleave],
    },
    {
        name: "Supportive abilities",
        description: "Use Block on yourself to defend against attacks.",
        createEnemies: () =>
            [basicDummy, basicDummy, basicDummy, basicDummy, basicDummy].map(createCombatant),
        presetDeck: [block, block, block],
        winCondition: {
            surviveRounds: 1,
        },
    },
    {
        name: "Summon minions",
        description: [
            "Summon a minion to assist you in battle.",
            "Once you have placed the minion, select it and use it to attack.",
            "Minions will only return to your Cooldown deck when they are knocked out.",
        ],
        createEnemies: () => [null, null, basicDummy, null, null].map(createCombatant),
        presetDeck: [snailMinion, snailMinion, snailMinion],
    },
    {
        name: "Enemy affixes",
        description: "This dummy has Thorns. Hover over the icon to see what it does.",
        createEnemies: () => [null, null, spikedDummy, null, null].map(createCombatant),
        presetDeck: [bash, slam, snailMinion, snailMinion],
    },
    {
        name: "Defeat the Raging Dummy",
        description: "Defeat the Raging Dummy and its minions!",
        createEnemies: () => [null, basicDummy, ragingDummy, basicDummy, null].map(createCombatant),
        presetDeck: [bash, bash, slam, cleave, block, block, snailMinion, snailMinion, charge],
    },
];

export default tutorial;
