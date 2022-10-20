import { ACTION_TYPES, EFFECT_CLASSES, EFFECT_TYPES, TARGET_TYPES, TRIGGER_TARGET_TYPES } from "../ability/types";
import { OmokPigImage, PigsHeadImage, PigsRibbonImage } from "../images";
import { Effect } from "./../ability/types";

export const championsRibbon: Effect = {
    name: "Champion's Ribbon",
    description: "Once per turn, this character will counter when attacked.",
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    icon: PigsRibbonImage,
    canBeSilenced: true,
    onTurnEnd: {
        targetType: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
        effects: [
            {
                name: "Retaliation",
                description: "Countering on the next attack",
                type: EFFECT_TYPES.NONE,
                class: EFFECT_CLASSES.BUFF,
                icon: OmokPigImage,
                canBeSilenced: true,
                duration: 1,
                onReceiveAttack: {
                    usableWhileStunned: false,
                    removeEffect: true,
                    targetType: TRIGGER_TARGET_TYPES.ACTOR,
                    ability: {
                        name: "Retaliate",
                        actions: [
                            {
                                type: ACTION_TYPES.ATTACK,
                                target: TARGET_TYPES.HOSTILE,
                            },
                        ],
                    },
                },
            },
        ],
    },
};

export const pigHeaded: Effect = {
    name: "Pig-Headed",
    description: "While stunned:",
    icon: PigsHeadImage,
    type: EFFECT_TYPES.NONE,
    class: EFFECT_CLASSES.BUFF,
    attackDamageReceived: 2,
    conditions: [
        {
            hasEffectType: [EFFECT_TYPES.STUN],
            calculationTarget: TRIGGER_TARGET_TYPES.EFFECT_OWNER,
        },
    ],
};
