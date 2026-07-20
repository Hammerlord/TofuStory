import { hardy } from "../ability/Effects";
import {
    ACTION_TYPES,
    ANIMATION_TYPES,
    Ability,
    EFFECT_CLASSES,
    EFFECT_TYPES,
    Minion,
    SELECT_CARD_TYPES,
    TARGET_TYPES,
} from "../ability/types";
import {
    MushmomBurrowImage,
    MushmomImage,
    MushmomJumpImage,
    NimbleFeetImage,
    OrangeMushroomCapImage,
    OrangeMushroomImage,
    WoodenMalletImage,
} from "../images";
import { MountainIcon, ShieldIcon } from "../images/icons";
import { moveTailToHead, shuffle } from "../utils";
import { attack, doOtherWave, doWave, whomp } from "./abilities";
import { burrowing } from "./effect";
import { orangeMushroom } from "./enemy";

const wallopCard: Ability = {
    name: "Wallop",
    resourceCost: 0,
    removeAfterTurn: true,
    image: WoodenMalletImage,
    actions: [
        {
            damage: 25,
            target: TARGET_TYPES.HOSTILE,
            type: ACTION_TYPES.ATTACK,
            area: 1,
            animationOptions: {
                weapon: {
                    hide: true,
                },
            },
        },
    ],
    upgrades: [
        {
            actions: [
                {
                    damage: 7,
                },
            ],
        },
    ],
};

export const mushcapCard: Ability = {
    name: "Springy Mushcap",
    image: OrangeMushroomCapImage,
    resourceCost: 1,
    description: "Draw a card. Then, Deplete a card to add Wallop to your hand.",
    overrideBodyText: true,
    actions: [
        {
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
            drawCards: {
                amount: 1,
            },
            playbackTime: 400,
        },
        {
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
            selectCards: {
                type: SELECT_CARD_TYPES.DEPLETE_FROM_HAND,
                then: {
                    addCards: [wallopCard],
                },
            },
        },
    ],
};

const mushroomMinion: Minion = {
    ...orangeMushroom,
    maxHP: 50,
    mesos: 1,
    abilities: moveTailToHead(orangeMushroom.abilities),
    effects: [
        ...orangeMushroom.effects,
        {
            name: "Orange Mushroom Cap",
            icon: OrangeMushroomCapImage,
            portraitImage: OrangeMushroomCapImage,
            description: "Drops a usable Mushcap when it dies.",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.NONE,
            onDeath: {
                usableWhileStunned: true,
                addCards: [mushcapCard],
            },
        },
    ],
};

const callMushrooms: Ability = {
    name: "Call Mushroom",
    image: OrangeMushroomImage,
    actions: [
        {
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
            bypassPreventTurnAction: true,
            summon: [{ minion: [mushroomMinion], placement: "adjacent", tributePossible: true }],
        },
    ],
};

const mushmomSpecials: Ability[] = [
    {
        name: "Burrow",
        image: ShieldIcon,
        resourceCost: 3,
        description: "Dispels debuffs. Gains {{ actions.0.armor }} Armor and heals while Armor holds.",
        actions: [
            {
                type: ACTION_TYPES.EFFECT,
                target: TARGET_TYPES.SELF,
                armor: 100,
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
        name: "Do the Wave!",
        image: MushmomJumpImage,
        resourceCost: 3,
        castTime: 1,
        actions: [doWave.actions[0], doOtherWave.actions[0]],
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
];

export const mushmom: Minion = {
    name: "Mushmom",
    image: MushmomImage,
    isBoss: true,
    maxHP: 300,
    mesos: 100,
    abilities: [
        { ...whomp, resourceCost: 0, castTime: undefined },
        {
            name: "Hop",
            image: NimbleFeetImage,
            description: "Moves around.",
            actions: [
                {
                    movement: 2,
                    movementOptions: {
                        canSwapCharacterPlaces: true,
                    },
                    description: "{{caster}} has moved.",
                    target: TARGET_TYPES.SELF,
                    type: ACTION_TYPES.MOVEMENT,
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
            ...attack,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 3,
                },
            ],
        },
        ...shuffle(mushmomSpecials),
    ],
    effects: [
        hardy,
        {
            name: "Call Mushroom",
            description: "After the countdown, summons a mushroom.",
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
                eventTriggerFrequency: 3,
                ability: callMushrooms,
            },
        },
    ],
};
