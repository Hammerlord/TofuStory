import { burrowing } from "./effect";
import { hardy } from "../ability/Effects";
import { ACTION_TYPES, ANIMATION_TYPES, Ability, EFFECT_CLASSES, EFFECT_TYPES, Minion, TARGET_TYPES } from "../ability/types";
import { MushmomBurrowImage, MushmomImage, MushmomJumpImage, OrangeMushroomImage } from "../images";
import { MountainIcon, ShieldIcon } from "../images/icons";
import { moveTailToHead } from "../utils";
import { attack, doOtherWave, doWave, loaf, whomp } from "./abilities";
import { orangeMushroom } from "./enemy";

const mushroomMinion = {
    ...orangeMushroom,
    abilities: moveTailToHead(orangeMushroom.abilities),
};

const callMushrooms: Ability = {
    name: "Call Mushroom",
    image: OrangeMushroomImage,
    actions: [
        {
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
            summon: [
                { minion: [mushroomMinion], placement: "adjacent", tributePossible: true },
                { minion: [mushroomMinion], placement: "adjacent", tributePossible: true },
            ],
        },
    ],
};

export const mushmom: Minion = {
    name: "Mushmom",
    image: MushmomImage,
    isBoss: true,
    maxHP: 225,
    abilities: [
        { ...whomp, resourceCost: 0, castTime: undefined },
        loaf,
        {
            ...attack,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 3,
                },
            ],
        },
        {
            ...attack,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 3,
                },
            ],
        },
        {
            name: "Do the Wave!",
            image: MushmomJumpImage,
            resourceCost: 3,
            castTime: 1,
            actions: [doWave.actions[0], doOtherWave.actions[0]],
        },
        {
            name: "Burrow",
            image: ShieldIcon,
            resourceCost: 3,
            description: "Dispels debuffs. Gains {{ actions.0.armor }} Armor and heals while Armor holds.",
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    armor: 50,
                    removeDebuffs: true,
                    effects: [
                        {
                            ...burrowing,
                            override: {
                                portrait: MushmomBurrowImage,
                            },
                        },
                    ],
                },
            ],
        },
        {
            name: "Earthquake",
            resourceCost: 3,
            castTime: 1,
            image: MountainIcon,
            actions: [
                {
                    type: ACTION_TYPES.RANGE_ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 7,
                    secondaryDamage: 3,
                    area: 2,
                    animation: ANIMATION_TYPES.STOMP,
                },
            ],
        },
    ],
    effects: [
        hardy,
        {
            name: "Call Mushrooms",
            description: "After the countdown, summons 2 mushrooms.",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            disableDisplayIcon: true,
            icon: OrangeMushroomImage,
            onWaveStart: {
                ability: callMushrooms,
            },
            extraDisplayOptions: {
                container: "left",
                property: "onTurnEnd.eventTriggeredTimes",
                modulo: "onTurnEnd.eventTriggerFrequency",
            },
            onTurnEnd: {
                usableWhileStunned: true,
                eventTriggerFrequency: 5,
                ability: callMushrooms,
            },
        },
    ],
};
