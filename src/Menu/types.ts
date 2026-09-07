import { BATTLE_TYPES } from "../battle/types";
import { Item } from "../item/types";

export enum PLAYER_CLASSES {
    WARRIOR = "Warrior",
    MAGICIAN = "Magician",
    BOWMAN = "Bowman",
}

export type ItemRewardsOptions = {
    rewardType: BATTLE_TYPES;
    itemRewards?: Item[] | undefined;
    overrideItemChoices?: Item[] | undefined;
    disableAttainConsumable?: boolean | undefined;
    numChoicesOffered: number;
};
