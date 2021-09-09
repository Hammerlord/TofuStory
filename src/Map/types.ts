export enum NODE_TYPES {
    encounter = "encounter",
    event = "event",
    restingZone = "restingZone",
}

export interface RouteNode {
    x: number;
    y: number;
    type: NODE_TYPES;
    difficulty?: "low" | "medium" | "high";
    //next: RouteNode[];
}
