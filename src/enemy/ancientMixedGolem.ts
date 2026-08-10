import { hardy, preventArmorDecay } from "../ability/Effects";
import { ACTION_TYPES, EFFECT_CLASSES, EFFECT_TYPES, Minion, TARGET_TYPES, TRIGGER_TARGET_TYPES } from "../ability/types";
import { AncientMixedGolemImage, DarkStoneGolemRubbleImage, StoneGolemRubbleImage } from "../images";
import { ShieldIcon } from "../images/icons";
import { attack } from "./abilities";
import { armorDown, temporaryResist } from "./effect";

export const ancientMixedGolem: Minion = {
    name: "Ancient Mixed Golem",
    maxHP: 200,
    image: AncientMixedGolemImage,
    isBoss: true,
    armor: 150,
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
            name: "Stone Skin",
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
            image: StoneGolemRubbleImage,
            actions: [
                {
                    damage: 15,
                    target: TARGET_TYPES.HOSTILE,
                    type: ACTION_TYPES.ATTACK,
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
                    target: TARGET_TYPES.HOSTILE,
                    type: ACTION_TYPES.ATTACK,
                },
            ],
        },
    ],
    effects: [
        temporaryResist,
        hardy,
        preventArmorDecay,
        {
            name: "Strength",
            description: "Attacks apply Armor Down.",
            icon: StoneGolemRubbleImage,
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            canBeSilenced: false,
            onAttack: {
                targetType: TRIGGER_TARGET_TYPES.ALL_TARGETS,
                effects: [armorDown],
            },
        },
    ],
};
