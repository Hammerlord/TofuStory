import { immunity } from "../ability/Effects";
import {
    ACTION_TYPES,
    ANIMATION_TYPES,
    Ability,
    CONDITION_TARGETS,
    Condition,
    EFFECT_CLASSES,
    EFFECT_TYPES,
    MORPH_TYPES,
    Minion,
    TARGET_TYPES,
    TRIGGER_TARGET_TYPES,
} from "../ability/types";
import { EncroachingDarknessImage, TheRemembererImage } from "../images";
import { CloudyIcon } from "../images/icons";
import { critical } from "./effect";
import { axeStump, copperDrake, darkStoneGolem, elliniaHornyMushroom, redSnail, slime, wildBoar, zombieLupin, wildKargo } from "./enemy";
import { tauromacis, taurospear } from "./minotaur";

const getManifestAbility = (minion) => {
    return {
        name: "Manifest",
        description: `Manifesting a ${minion.name}.`,
        castTime: 1,
        image: minion.image,
        actions: [
            {
                type: ACTION_TYPES.EFFECT,
                target: TARGET_TYPES.SELF,
                morph: {
                    type: MORPH_TYPES.MAP,
                    minions: [
                        {
                            minion,
                        },
                    ],
                },
            },
        ],
    };
};

const coalescingMistsBase = {
    name: "Coalescing Mists",
    image: CloudyIcon,
    imageOptions: {
        fadeInOut: true,
    },
};

const coalescingMistsRedSnail: Minion = {
    ...coalescingMistsBase,
    maxHP: 5,
    abilities: [getManifestAbility(redSnail)],
};

const coalescingMistsSlime: Minion = {
    ...coalescingMistsBase,
    maxHP: 5,
    abilities: [getManifestAbility(slime)],
};

// Do not allow summoned mists to have an immediate turn (tick down cast time)
// Excluding snail/slime because they were summoned at start of battle
const justSummoned = {
    name: "Just Summoned",
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.NONE,
    preventTurnAction: true,
    duration: 0,
};

const coalescingMistsWildBoar: Minion = {
    ...coalescingMistsBase,
    maxHP: 15,
    abilities: [getManifestAbility(wildBoar)],
    effects: [justSummoned],
};

const coalescingMistsAxeStump: Minion = {
    ...coalescingMistsBase,
    maxHP: 15,
    abilities: [getManifestAbility(axeStump)],
    effects: [justSummoned],
};

const coalescingMistsHornyMushroom: Minion = {
    ...coalescingMistsBase,
    maxHP: 15,
    abilities: [getManifestAbility(elliniaHornyMushroom)],
    effects: [justSummoned],
};

const coalescingMistsDrake: Minion = {
    ...coalescingMistsBase,
    maxHP: 30,
    abilities: [getManifestAbility(copperDrake)],
    effects: [justSummoned],
};

const coalescingMistsGolem: Minion = {
    ...coalescingMistsBase,
    maxHP: 30,
    abilities: [getManifestAbility(darkStoneGolem)],
    effects: [justSummoned],
};

const coalescingMistsZombieLupin: Minion = {
    ...coalescingMistsBase,
    maxHP: 30,
    abilities: [getManifestAbility(zombieLupin)],
    effects: [justSummoned],
};

const coalescingMistsKargo: Minion = {
    ...coalescingMistsBase,
    maxHP: 50,
    abilities: [getManifestAbility({ ...wildKargo, effects: [critical] })], // No Avenger
    effects: [justSummoned],
};

const coalescingMistsTauromacis: Minion = {
    ...coalescingMistsBase,
    maxHP: 50,
    abilities: [getManifestAbility({ ...tauromacis, effects: [] })], // No Avenger
    effects: [justSummoned],
};

const coalescingMistsTauroSpear: Minion = {
    ...coalescingMistsBase,
    maxHP: 50,
    abilities: [getManifestAbility({ ...taurospear, effects: [] })], // No Avenger
    effects: [justSummoned],
};

const coalescingMistsRequirements: Condition[] = [
    {
        hasEffect: "Coalescing Mists Available",
        calculationTarget: CONDITION_TARGETS.ACTOR,
        comparator: "eq",
    },
    {
        calculationTarget: TRIGGER_TARGET_TYPES.ACTOR,
        comparator: "eq",
        numFriendly: 1,
    },
];

const summonCoalescingMists: Ability = {
    name: "Expel Mists",
    image: CloudyIcon,
    castTime: 1,
    actions: [
        {
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
            summon: [
                { minion: [coalescingMistsSlime, coalescingMistsRedSnail] },
                { minion: [coalescingMistsSlime, coalescingMistsRedSnail] },
                { minion: [coalescingMistsSlime, coalescingMistsRedSnail] },
                { minion: [coalescingMistsSlime, coalescingMistsRedSnail] },
            ],
        },
    ],
    conditionOperator: "and",
    conditions: coalescingMistsRequirements,
};

const summonCoalescingMists2: Ability = {
    name: "Expel Mists",
    image: CloudyIcon,
    castTime: 1,
    actions: [
        {
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
            summon: [
                { minion: [coalescingMistsWildBoar, coalescingMistsAxeStump, coalescingMistsHornyMushroom] },
                { minion: [coalescingMistsWildBoar, coalescingMistsAxeStump, coalescingMistsHornyMushroom] },
                { minion: [coalescingMistsWildBoar, coalescingMistsAxeStump, coalescingMistsHornyMushroom] },
                { minion: [coalescingMistsWildBoar, coalescingMistsAxeStump, coalescingMistsHornyMushroom] },
            ],
        },
    ],
    conditionOperator: "and",
    conditions: coalescingMistsRequirements,
};

const summonCoalescingMists3: Ability = {
    name: "Expel Mists",
    image: CloudyIcon,
    castTime: 1,
    actions: [
        {
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
            summon: [
                { minion: [coalescingMistsDrake, coalescingMistsGolem, coalescingMistsZombieLupin] },
                { minion: [coalescingMistsDrake, coalescingMistsGolem, coalescingMistsZombieLupin] },
                { minion: [coalescingMistsDrake, coalescingMistsGolem, coalescingMistsZombieLupin] },
                { minion: [coalescingMistsDrake, coalescingMistsGolem, coalescingMistsZombieLupin] },
            ],
        },
    ],
    conditionOperator: "and",
    conditions: coalescingMistsRequirements,
};

const summonCoalescingMists4: Ability = {
    name: "Expel Mists",
    image: CloudyIcon,
    castTime: 1,
    actions: [
        {
            target: TARGET_TYPES.SELF,
            type: ACTION_TYPES.EFFECT,
            summon: [
                { minion: [coalescingMistsTauromacis, coalescingMistsTauroSpear] },
                { minion: [coalescingMistsTauromacis, coalescingMistsKargo] },
                { minion: [coalescingMistsTauromacis, coalescingMistsTauroSpear] },
                { minion: [coalescingMistsTauroSpear, coalescingMistsKargo] },
            ],
            removeEffects: ["Coalescing Mists Available"],
        },
    ],
    conditionOperator: "and",
    conditions: coalescingMistsRequirements,
};

const pulsingNightmare: Ability = {
    name: "Pulsing Night Terror",
    image: EncroachingDarknessImage,
    description: "Damage dealt is split among targets.",
    actions: [
        {
            type: ACTION_TYPES.RANGE_ATTACK,
            target: TARGET_TYPES.HOSTILE,
            icon: EncroachingDarknessImage,
            animationOptions: {
                width: 100,
                height: 100,
            },
            damage: 5,
            damageDividedByTargets: true,
            area: 1,
        },
    ],
    conditions: [
        {
            hasEffect: "Coalescing Mists Available",
            calculationTarget: CONDITION_TARGETS.ACTOR,
            comparator: "not",
        },
    ],
};

export const theRememberer: Minion = {
    name: "The Rememberer",
    image: TheRemembererImage,
    isBoss: true,
    mesos: 100,
    maxHP: 500,
    abilities: [summonCoalescingMists2, summonCoalescingMists3, summonCoalescingMists4, pulsingNightmare],
    effects: [
        {
            ...immunity,
            description: "Impervious to harm while another character on the same side is alive.",
            duration: Infinity,
            conditions: [
                {
                    calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                    comparator: "gt",
                    numFriendly: 1,
                },
            ],
        },
        {
            name: "Coalescing Mists Available",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.NONE,
            icon: CloudyIcon,
            disableDisplayIcon: true,
            onBattleStart: {
                ability: summonCoalescingMists,
            },
            onTurnEnd: {
                ability: {
                    name: "Pulsing Nightmare",
                    image: EncroachingDarknessImage,
                    actions: [
                        {
                            type: ACTION_TYPES.RANGE_ATTACK,
                            target: TARGET_TYPES.HOSTILE,
                            icon: EncroachingDarknessImage,
                            damage: 3,
                            area: 1,
                            animationOptions: {
                                width: 75,
                                height: 75,
                            },
                        },
                    ],
                },
            },
        },
        {
            name: "Encroaching Nightmare",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.NONE,
            onTurnEnd: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                effects: [
                    {
                        name: "Growing Nightmare",
                        description: "+1 Pulsing damage. Increases every turn.",
                        alwaysDisplayStacks: true,
                        icon: EncroachingDarknessImage,
                        type: EFFECT_TYPES.NONE,
                        class: EFFECT_CLASSES.NONE,
                        maxApplications: 10,
                        skillBonus: [
                            {
                                skill: "Pulsing Nightmare",
                                damage: 1,
                            },
                            {
                                skill: "Pulsing Night Terror",
                                damage: 1,
                            },
                        ],
                    },
                ],
            },
        },
    ],
};
