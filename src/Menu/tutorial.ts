import { Ability } from "./../ability/types";
import { slam, bash, slashBlast, block, warLeap, snailMinion } from "../ability/warrior/warriorAbilities";
import { basicDummy, ragingDummy, spikedDummy } from "../enemy/dummy";

export interface Wave {
    description?: string | string[];
    enemies: Array<any>;
    presetDeck?: Ability[];
    rewards?: Array<any>;
    winCondition?: {
        surviveRounds?: number;
    };
}

const tutorial: Wave[] = [
    {
        description: [
            "Select an ability and an enemy to use it on.",
            "After usage, the ability goes on cooldown until you reach the end of your deck.",
            "When you're out of moves, click End Turn to proceed.",
        ],
        enemies: [null, basicDummy, null, basicDummy, null],
        presetDeck: [bash, bash, slam],
    },
    {
        description: "Target multiple enemies with Area attacks like Slash Blast.",
        enemies: [null, basicDummy, basicDummy, basicDummy, null],
        presetDeck: [bash, bash, bash, slashBlast, slashBlast],
    },
    {
        description: "Use Block on yourself to defend against attacks.",
        enemies: [basicDummy, basicDummy, basicDummy, basicDummy, basicDummy],
        presetDeck: [block, block, block],
        winCondition: {
            surviveRounds: 1,
        },
    },
    {
        description: [
            "Summon a minion to assist you in battle.",
            "Once you have placed the minion, select it and use it to attack.",
            "Minions will only return to your Cooldown deck when they are knocked out.",
        ],
        enemies: [null, null, basicDummy, null, null],
        presetDeck: [snailMinion, snailMinion, snailMinion],
    },
    {
        description: "This dummy has Thorns. Hover over the icon to see what it does.",
        enemies: [null, null, spikedDummy, null, null],
        presetDeck: [bash, slam, snailMinion, snailMinion],
    },
    {
        description: "Defeat the Raging Dummy and its minions!",
        enemies: [null, basicDummy, ragingDummy, basicDummy, null],
        presetDeck: [bash, bash, slam, slashBlast, block, block, snailMinion, snailMinion, warLeap],
    },
];

export default tutorial;
