export enum ITEM_TYPES {
    CONSUMABLE = "consumable",
    MATERIAL = "material",
}

export interface Item {
    name: string;
    /** HP restored when consuming this item */
    HP?: number;
    type: ITEM_TYPES;
    image: string;
}
