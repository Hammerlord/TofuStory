import { EFFECT_TYPES } from "../ability/types";
import { PoisonImage } from "../images";
import { BloodIcon, FireIcon } from "../images/icons";

export const MAX_HAND_SIZE = 9;
export const BASE_RESOURCES_PER_TURN = 3;
export const BASE_MAX_RESOURCES = 4;
export const BOSS_MUSIC = "https://maplestory.io/api/GMS/93T/music/Bgm14/DragonNest";
export const CLASS_LEADER_MUSIC = "https://maplestory.io/api/GMS/93T/music/Bgm14/Hontale";
export const STRANGE_ENCOUNTER_MUSIC = "https://maplestory.io/api/GMS/93T/music/Bgm08/PlotOfPixie";
export const CAMPAIGN_BOSS_MUSIC = "https://maplestory.io/api/GMS/93T/music/Bgm10/Eregos";
export const MARCH_MUSIC = "https://maplestory.io/api/GMS/93T/music/Bgm08/LetsMarch";
// Every attack power grants 1 damage for every 10 damage dealt, minimum 1
// Ditto for def down
export const DAMAGE_COEFF = 10;
export const MULTI_ACTION_PLAYBACK_SPEED = 550;
export const NORMAL_ACTION_PLAYBACK_SPEED = 675;
export const RANGED_ACTION_PLAYBACK_SPEED = 500;
export const INDUCED_ACTION_PLAYBACK_SPEED = 450;
export const RICOCHET_ACTION_PLAYBACK_SPEED = 550;
export const CARD_ADDED_PLAYBACK_SPEED = 1500;
export const CARD_DEPLETED_PLAYBACK_SPEED = 1000;

export const TURN_ANNOUNCEMENT_TIME = 1000; // MS
export const SUMMON_DELAY = 250;

export const battleWarnings = {
    depleteMinCardInHand: "That ability requires at least one other card in your hand to deplete.",
    minCardInHand: "That ability requires at least one other card in your hand.",
    promptFinishSelecting: "Finish selecting cards in the overlay prompt first.",
    minDepleted: "You haven't Depleted any other cards this battle.",
    targetStealth: "That character is stealthed and cannot be targeted directly.",
    unplayable: "That card cannot be played.",
    targetTaunt: "You must target the enemy that has Taunt.",
    handFull: "Your hand is too full!",
    untargetable: "That character cannot be targeted.",
};

export const dotDamageMap = {
    [EFFECT_TYPES.BLEED]: 1,
    [EFFECT_TYPES.POISON]: 1,
    [EFFECT_TYPES.BURN]: 2,
};

export const dotAbilityMap = {
    [EFFECT_TYPES.BLEED]: {
        name: "Bleed",
        image: BloodIcon,
        actions: [],
    },
    [EFFECT_TYPES.POISON]: {
        name: "Poison",
        image: PoisonImage,
        actions: [],
    },
    [EFFECT_TYPES.BURN]: {
        name: "Burn",
        image: FireIcon,
        actions: [],
    },
};
