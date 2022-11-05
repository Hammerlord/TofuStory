import { Effect } from "./../ability/types";
export enum ITEM_TYPES {
    CONSUMABLE = "consumable",
    MATERIAL = "material",
    EQUIPMENT = "equipment",
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
    sellPrice?: number;
    effects?: Effect[];
    upgradeCard?: boolean;
    abilityChoices?: 1;
    camp?: {
        abilityChoices?: number;
        healing?: number;
        extraActivities?: number;
    };
}
