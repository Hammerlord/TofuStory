import { ancientMixedGolem } from "../../enemy/ancientMixedGolem";
import { manoEnemy, minionSnail, mutantSnailEnemy } from "../../enemy/bossSnails";
import { mushmom } from "../../enemy/mushmom";
import { pillagingWildBoar } from "../../enemy/pillagingBoar";
import { strangePig } from "../../enemy/strangePig";
import { stumpy } from "../../enemy/stumpy";

export const mutantSnailFight = {
    id: mutantSnailEnemy.name,
    waves: [
        {
            enemies: [null, minionSnail, mutantSnailEnemy, minionSnail, null],
            winCondition: {
                defeatBoss: true,
            },
        },
    ],
};

export const strangePigFight = {
    id: strangePig.name,
    waves: [
        {
            enemies: [null, null, strangePig, null, null],
            winCondition: {
                defeatBoss: true,
            },
        },
    ],
};

export const manoFight = {
    id: manoEnemy.name,
    waves: [
        {
            enemies: [null, minionSnail, manoEnemy, minionSnail, null],
            winCondition: {
                defeatBoss: true,
            },
        },
    ],
};

export const stumpyFight = {
    id: stumpy.name,
    waves: [
        {
            enemies: [null, null, stumpy, null, null],
            winCondition: {
                defeatBoss: true,
            },
        },
    ],
};

export const mushmomFight = {
    id: mushmom.name,
    waves: [
        {
            enemies: [null, null, mushmom, null, null],
            winCondition: {
                defeatBoss: true,
            },
        },
    ],
};

export const pillagingBoarFight = {
    id: pillagingWildBoar.name,
    waves: [
        {
            enemies: [null, null, pillagingWildBoar, null, null],
            winCondition: {
                defeatBoss: true,
            },
        },
    ],
};

export const ancientMixedGolemFight = {
    id: ancientMixedGolem.name,
    waves: [
        {
            enemies: [null, null, ancientMixedGolem, null, null],
            winCondition: {
                defeatBoss: true,
            },
        },
    ],
};

export const OVERWORLD_BOSS_ID_MAP = {
    [mutantSnailFight.id]: mutantSnailFight,
    [strangePigFight.id]: strangePigFight,
    [manoFight.id]: manoFight,
    [stumpyFight.id]: stumpyFight,
    [mushmomFight.id]: mushmomFight,
    [ancientMixedGolemFight.id]: ancientMixedGolemFight,
    [pillagingBoarFight.id]: pillagingBoarFight,
};
