import { bigBeefy, realtofu, theraretofu } from "./../enemy/tofu";
import { createCombatant } from "./../enemy/createEnemy";
import { Wave } from "./tutorial";
import { smalltofu, thefaketofu, theRegalTofu } from "../enemy/tofu";

export const challenge: Wave[] = [
    {
        createEnemies: () => [smalltofu, smalltofu, thefaketofu, smalltofu, smalltofu].map(createCombatant),
    },
    {
        createEnemies: () => [null, thefaketofu, theRegalTofu, thefaketofu, null].map(createCombatant),
    },
    {
        createEnemies: () => [realtofu, thefaketofu, realtofu, thefaketofu, realtofu].map(createCombatant),
    },
    {
        createEnemies: () => [smalltofu, null, bigBeefy, null, smalltofu].map(createCombatant),
    },
    {
        createEnemies: () => [null, theRegalTofu, theraretofu, theRegalTofu, null].map(createCombatant),
    },
];
