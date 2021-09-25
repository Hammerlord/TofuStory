export enum ITEM_TYPES {
    CONSUMABLE = "consumable",
    MATERIAL = "material",
    EQUIPMENT = "equipment",
}

export interface Item {
    name: string;
    /** HP restored when consuming this item */
    healing?: number;
    /** Resources gained when consuming this item */
    resources?: number;
    type: ITEM_TYPES;
    image: string;
    armorReceived?: number;
    sellPrice?: number;
}
