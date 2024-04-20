export const MAX_HAND_SIZE = 9;
export const BASE_MAX_RESOURCES = 3;
export const BOSS_MUSIC = "https://maplestory.io/api/GMS/93T/music/Bgm14/DragonNest";
export const CLASS_LEADER_MUSIC = "https://vgmtreasurechest.com/soundtracks/maplestory-music/ofdbhseojv/79.%20Hontale.mp3";
export const STRANGE_ENCOUNTER_MUSIC = "https://vgmtreasurechest.com/soundtracks/maplestory-music/ycfxgoahya/47.%20Plot%20of%20Pixie.mp3";
export const CAMPAIGN_BOSS_MUSIC = "https://vgmtreasurechest.com/soundtracks/maplestory-music/lywsorddis/54.%20Eregos.mp3";
export const MARCH_MUSIC = "https://vgmtreasurechest.com/soundtracks/maplestory-music/vbuzxkzqon/46.%20Lets%20March.mp3";
export const ATTACK_POWER_COEFF = 10; // every attack power grants 1 damage for every 10 damage dealt, minimum 1
export const MULTI_ACTION_PLAYBACK_SPEED = 600;
export const NORMAL_ACTION_PLAYBACK_SPEED = 750;
export const CARD_ADDED_PLAYBACK_SPEED = 1500;
export const CARD_DEPLETED_PLAYBACK_SPEED = 1000;

export const TURN_ANNOUNCEMENT_TIME = 1000; // MS
export const SUMMON_DELAY = 250;

export const battleWarnings = {
    depleteMinCardInHand: "That ability requires at least one other card in your hand to deplete.",
    moveToDeckMinCardInHand: "That ability requires at least one other card in your hand.",
    promptFinishSelecting: "Finish selecting cards in the overlay prompt first.",
    minDepleted: "You haven't Depleted any other cards this battle.",
    targetStealth: "That character is stealthed and cannot be targeted directly.",
    unplayable: "That card cannot be played.",
    targetTaunt: "You must target the enemy that has Taunt.",
    handFull: "Your hand is too full!",
};
