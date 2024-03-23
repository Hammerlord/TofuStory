export const COLOR_RARITY_COMMON = "rgb(230, 230, 230)";
export const COLOR_RARITY_UNCOMMON = "#309eff";
export const COLOR_RARITY_RARE = "#ffda72";

export const COMMON_ITEM_CHANCE = 0.55;
export const UNCOMMON_ITEM_CHANCE = 0.35;
export const RARE_ITEM_CHANCE = 0.1;

export const BOSS_RARE_RATE = 0.3;
export const BOSS_UNCOMMON_RATE = 0.25;

export const ELITE_RARE_RATE = 0.1;
export const ELITE_UNCOMMON_RATE = 0.2;

export const REGULAR_BATTLE_LOOT_CHANCE = 0.2;

export const INTRO_PAN_TIME = 2000;
export const RE_PAN_TIME = 400;

export const DECK_CYCLE_TIME = 1000;

export const COMMON_STYLES = {
    "@keyframes highlightAnimation": {
        from: {
            filter: "drop-shadow(0 0 1px #45ff61) drop-shadow(0 0 1px #45ff61)",
        },
        to: {
            filter: "drop-shadow(0 0 3px #45ff61) drop-shadow(0 0 3px #45ff61)",
        },
    },
    highlightAnimation: {
        animationName: "$highlightAnimation",
        animationDuration: "2s",
        animationIterationCount: "infinite",
        animationDirection: "alternate-reverse",
    },
    highlight: {
        filter: "drop-shadow(0 0 3px #45ff61) drop-shadow(0 0 3px #45ff61)",
    },
    "@keyframes fadeIn": {
        "0%": {
            opacity: 0,
        },
        "100%": {
            opacity: 1,
        },
    },
    fadeIn: {
        animationName: "$fadeIn",
        animationDuration: "0.5s",
        animationFillMode: "forwards",
    },
};
