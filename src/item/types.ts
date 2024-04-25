import { BATTLE_TYPES } from "../battle/types";
import { Ability, Effect } from "./../ability/types";
export enum ITEM_TYPES {
    CONSUMABLE = "consumable",
    MATERIAL = "material",
    EQUIPMENT = "equipment",
    OTHER = "other",
}

export enum RARITIES {
    STARTER = "Starter",
    COMMON = "Common",
    UNCOMMON = "Uncommon",
    RARE = "Rare",
}

export interface Item {
    name: string;
    description?: string;
    flavourText?: string;
    /** HP restored when consuming this item */
    healing?: number;
    /** Resources gained when consuming this item */
    resources?: number;
    type: ITEM_TYPES;
    image: string;
    effects?: Effect[];
    upgradeCard?: boolean;
    removeCard?: boolean;
    // Card reward screens grant an extra option
    abilityChoices?: {
        battleTypes?: BATTLE_TYPES[]; // If not supplied, this applies to all battle types
        amount: number;
        abilities?: Ability[]; // Specific abilities to grant. If amount < abilities.length, a random one is chosen.
    };
    rarity?: RARITIES;
    stacks?: number;
    isStackable?: boolean;
    // If true, item's `effects` will be appended to summons' effects
    applyEffectsToSummons?: boolean;
    upgradeScreen?: {
        maxUpgradeLevel: number;
    };
    camp?: {
        abilityChoices?: number;
        healing?: number;
        extraActivities?: number;
        // If true, enables the Meditate option at the campsite.
        allowAbilityRemoval?: boolean;
        allowTransmute?: boolean;
    };
    merchant?: {
        // Number of times you are allowed to refresh the items per visit
        refreshTimes?: number;
        // Percentage discount on prices
        discount?: number;
        freeFood?: boolean;
    };
    equipment?: {
        // These take share out of the common drop rate
        uncommonRateIncrease?: number;
        rareRateIncrease?: number;
    };
    // Gives you something when picked up. The item itself disappears.
    pickUp?: {
        mesos?: number;
    };
}
