import { PLAYER_CLASSES } from "../Menu/types";
import {
    darkImpale,
    darkSpear,
    darkThirst,
    evilEye,
    evilEyeShock,
    lordOfDarkness,
    piercingDrive,
    spearSweep,
} from "./warrior/darkKnightAbilities";
import { intrepidSlash, puncture, brandish, comboFury, chanceStrike, parry, ragingBlow, worldReaver } from "./warrior/fighterAbilities";
import {
    bash,
    block,
    shieldStrike,
    slam,
    slashBlast,
    warLeap,
    anger,
    bloodthirst,
    spikedArmor,
    warBanner,
    yell,
    bunchOBricks,
    hammerang,
    ironWill,
    hyperBody,
    sweepingReach,
    sharpen,
    rush,
    berserk,
    closeCombat,
    magicCrash,
    recovery,
    dash,
    ironBody,
} from "./warrior/warriorAbilities";
import {
    blast,
    blizzardCharge,
    divineCharge,
    flameCharge,
    frostFire,
    judgment,
    lightningCharge,
    parashockGuard,
    shieldMastery,
} from "./warrior/whiteknightAbilities";

export enum WARRIOR_SECONDARY_JOBS {
    FIGHTER = "Fighter",
    DARK_KNIGHT = "Dark Knight",
    WHITE_KNIGHT = "White Knight",
}

export const SECONDARY_JOBS = {
    [PLAYER_CLASSES.WARRIOR]: WARRIOR_SECONDARY_JOBS,
};

export const JOB_CARD_MAP = {
    [PLAYER_CLASSES.WARRIOR]: {
        all: [
            bash,
            warLeap,
            slashBlast,
            block,
            slam,
            anger,
            shieldStrike,
            bloodthirst,
            spikedArmor,
            warBanner,
            yell,
            bunchOBricks,
            hammerang,
            ironWill,
            hyperBody,
            sweepingReach,
            sharpen,
            rush,
            berserk,
            closeCombat,
            recovery,
            magicCrash,
            dash,
            ironBody,
        ],
    },
    [WARRIOR_SECONDARY_JOBS.FIGHTER]: {
        onJobUp: [brandish, puncture],
        all: [intrepidSlash, puncture, brandish, comboFury, chanceStrike, parry, ragingBlow, worldReaver],
    },
    [WARRIOR_SECONDARY_JOBS.DARK_KNIGHT]: {
        onJobUp: [evilEye, piercingDrive],
        all: [evilEye, darkImpale, darkThirst, darkSpear, piercingDrive, spearSweep, evilEyeShock, lordOfDarkness],
    },
    [WARRIOR_SECONDARY_JOBS.WHITE_KNIGHT]: {
        onJobUp: [flameCharge, blizzardCharge],
        all: [flameCharge, blizzardCharge, lightningCharge, blast, divineCharge, frostFire, shieldMastery, judgment, parashockGuard],
    },
};
