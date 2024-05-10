import { TRIGGER_SOURCE_TYPES } from "../battle/types";
import { CurseImage, SquishyLiquidImage } from "../images";
import { DizzyIcon, SpeechBubbleIcon } from "../images/icons";
import { ACTION_TYPES, Ability, CONDITION_TARGETS, TARGET_TYPES } from "./../ability/types";

export const gooCurse: Ability = {
    name: "Goo",
    image: SquishyLiquidImage,
    resourceCost: 2,
    description: "Reduce cost by 1 for every attack played this turn.",
    depletedOnUse: true,
    onAbility: {
        abilityEffects: [
            {
                resourceCost: -1,
            },
        ],
        conditions: [
            {
                calculationTarget: CONDITION_TARGETS.TRIGGER_SOURCE,
                sourceType: TRIGGER_SOURCE_TYPES.ABILITY,
                isOffense: true,
                comparator: "eq",
            },
        ],
    },
    actions: [
        {
            type: ACTION_TYPES.HINDER,
            target: TARGET_TYPES.SELF,
        },
    ],
};

export const sealCard: Ability = {
    name: "Seal",
    image: SpeechBubbleIcon,
    description: "Adjacent cards are unplayable.",
    depletedOnUse: true,
    resourceCost: 1,
    aura: {
        area: 1,
        effects: [
            {
                isLocked: true,
            },
        ],
        filters: [
            {
                actionTypes: [ACTION_TYPES.HINDER],
                comparator: "not",
            },
        ],
    },
    actions: [
        {
            type: ACTION_TYPES.HINDER,
            target: TARGET_TYPES.SELF,
        },
    ],
};

export const curseCard: Ability = {
    name: "Curse",
    image: CurseImage,
    resourceCost: 2,
    description: "Reduce cost by 1 for every {{{ _support_ }}} {{{ _summon_ }}} card played this turn.",
    depletedOnUse: true,
    onAbility: {
        abilityEffects: [
            {
                resourceCost: -1,
            },
        ],
        conditions: [
            {
                calculationTarget: CONDITION_TARGETS.TRIGGER_SOURCE,
                sourceType: TRIGGER_SOURCE_TYPES.ABILITY,
                isOffense: false,
                comparator: "eq",
            },
        ],
    },
    actions: [
        {
            type: ACTION_TYPES.HINDER,
            target: TARGET_TYPES.SELF,
        },
    ],
};

export const dazedCurse: Ability = {
    name: "Dazed",
    image: DizzyIcon,
    removeAfterTurn: true,
    unplayable: true,
    actions: [
        {
            type: ACTION_TYPES.HINDER,
            target: TARGET_TYPES.SELF,
        },
    ],
};
