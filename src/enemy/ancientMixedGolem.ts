import { attackPower, hardy, preventArmorDecay } from "../ability/Effects";
import { ACTION_TYPES, Minion, TARGET_TYPES } from "../ability/types";
import { AncientMixedGolemImage, DarkStoneGolemRubbleImage } from "../images";
import { ShieldIcon } from "../images/icons";
import { attack } from "./abilities";
import { temporaryResist } from "./effect";
import { strength } from "./enemy";

export const ancientMixedGolem: Minion = {
    name: "Ancient Mixed Golem",
    maxHP: 100,
    image: AncientMixedGolemImage,
    isBoss: true,
    armor: 250,
    mesos: 50,
    abilities: [
        {
            ...attack,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 5,
                },
            ],
        },
        {
            name: "Harden",
            image: ShieldIcon,
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    armor: 3,
                },
            ],
        },
        {
            name: "Crushing Blow",
            resourceCost: 3,
            castTime: 1,
            image: DarkStoneGolemRubbleImage,
            actions: [
                {
                    damage: 15,
                    area: 1,
                    damageDividedByTargets: true,
                    target: TARGET_TYPES.HOSTILE,
                    type: ACTION_TYPES.ATTACK,
                },
                {
                    effects: [attackPower],
                    target: TARGET_TYPES.SELF,
                    type: ACTION_TYPES.EFFECT,
                },
            ],
        },
    ],
    effects: [{ ...temporaryResist, stacks: 5 }, hardy, preventArmorDecay, strength],
};
