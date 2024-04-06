import { TOWN_PLACES } from "./constants";
import { TOWNS } from "./types";

/**
 * Grab the list of TOWN_PLACES but append the town name to them so that the key is unique for each node.
 * Used to log places that the player has visited.
 */
export const getTownPlaces = (townKey: TOWNS): { [key: string]: string } =>
    Object.entries(TOWN_PLACES).reduce((acc, [key, value]) => {
        return { ...acc, [key]: `${townKey}-${value}` };
    }, {});
