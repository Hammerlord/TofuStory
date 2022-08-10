import { Combatant } from "./types";
import uuid from "uuid";
import { oldGladiusImage, warmush } from "../images";
import { PLAYER_CLASSES } from "../Menu/types";

/** Default character stats */
const defaultCharacterProperties = {
    name: "",
    id: uuid.v4(),
    class: PLAYER_CLASSES.WARRIOR,
    secondaryClass: null,
    image: warmush,
    HP: 25,
    maxHP: 25,
    resourcesPerTurn: 3,
    maxResources: 3,
    resources: 3,
    armor: 0,
    turnHistory: [],
    mesos: 0,
    isPlayer: true,
    weapon: oldGladiusImage,
    effects: [],
    items: [],
} as Combatant;

export default defaultCharacterProperties;
