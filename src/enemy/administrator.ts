import { ward } from "./../ability/Effects";
import { attackPower, warding } from "../ability/Effects";
import { ACTION_TYPES, ANIMATION_TYPES, EFFECT_CLASSES, EFFECT_TYPES, Minion, TARGET_TYPES, TRIGGER_TARGET_TYPES } from "../ability/types";
import {
    BlueSnailShellImage,
    MapleAdminImage,
    NimbleFeetImage,
    PicoPicoHammerImage,
    RedSnailShellImage,
    SackImage,
    SelfRecoveryImage,
    SnailShellImage,
    SuitcaseImage,
    ThreeSnailsImage,
} from "../images";
import { wildKargo } from "./enemy";
import { tauromacis, taurospear } from "./minotaur";

export const administrator: Minion = {
    name: "Maple Administrator",
    image: MapleAdminImage,
    maxHP: 999,
    mesos: 100,
    isBoss: true,
    abilities: [
        {
            name: "Three Snails",
            image: ThreeSnailsImage,
            actions: [
                {
                    type: ACTION_TYPES.RANGE_ATTACK,
                    target: TARGET_TYPES.RANDOM_HOSTILE,
                    icon: SnailShellImage,
                    animation: ANIMATION_TYPES.ONE_WAY_SPIN_FAST,
                    damage: 10,
                },
                {
                    type: ACTION_TYPES.RANGE_ATTACK,
                    target: TARGET_TYPES.RANDOM_HOSTILE,
                    icon: BlueSnailShellImage,
                    animation: ANIMATION_TYPES.ONE_WAY_SPIN_FAST,
                    damage: 10,
                },
                {
                    type: ACTION_TYPES.RANGE_ATTACK,
                    target: TARGET_TYPES.RANDOM_HOSTILE,
                    icon: RedSnailShellImage,
                    animation: ANIMATION_TYPES.ONE_WAY_SPIN_FAST,
                    damage: 10,
                },
            ],
        },
        {
            name: "Recovery",
            image: SelfRecoveryImage,
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    effects: [
                        {
                            name: "Recovery",
                            icon: SelfRecoveryImage,
                            type: EFFECT_TYPES.NONE,
                            class: EFFECT_CLASSES.BUFF,
                            canBeSilenced: true,
                            duration: 3,
                            onTurnEnd: {
                                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                                healing: 10,
                            },
                        },
                    ],
                },
            ],
        },
        {
            name: "GM Summon Monsters",
            image: SackImage,
            actions: [
                {
                    target: TARGET_TYPES.SELF,
                    type: ACTION_TYPES.EFFECT,
                    summon: [{ minion: [tauromacis, taurospear, wildKargo] }, { minion: [tauromacis, taurospear, wildKargo] }],
                },
            ],
        },
        {
            name: "Throw Suitcase",
            image: SuitcaseImage,
            actions: [
                {
                    type: ACTION_TYPES.RANGE_ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    icon: SuitcaseImage,
                    animation: ANIMATION_TYPES.ONE_WAY_SPIN_FAST,
                    animationOptions: {
                        ricochet: true,
                    },
                    damage: 15,
                    secondaryDamage: 7,
                    targetArea: 2,
                    numTargets: 5,
                },
            ],
        },
        {
            name: "Ban Hammer",
            image: PicoPicoHammerImage,
            castTime: 1,
            resourceCost: 3,
            dialog: "You have been blocked by Police GM for the HACK reason.",
            actions: [
                {
                    type: ACTION_TYPES.NONE,
                    target: TARGET_TYPES.SELF,
                    icon: PicoPicoHammerImage,
                    animation: ANIMATION_TYPES.ACTION_EXPLODE,
                },
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 50,
                    secondaryAction: {
                        effects: [attackPower],
                    },
                },
            ],
        },
    ],
    effects: [
        {
            ...warding,
            name: "Nimble Feet",
            image: NimbleFeetImage,
            description: "Every turn, gains a shield that wards off a single attack.",
            turnsTriggerFrequency: undefined,
            onBattleStart: {
                targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
                effects: [
                    {
                        ...ward,
                        duration: 2,
                    },
                ],
                ability: {
                    name: "",
                    dialog: "GM will never ask for your username or password",
                    actions: [
                        {
                            target: TARGET_TYPES.SELF,
                            type: ACTION_TYPES.NONE,
                            playbackTime: 1250,
                        },
                    ],
                },
            },
        },
    ],
};
