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
    HP: 50,
    maxHP: 50,
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
    drawCardsPerTurn: 3,
} as Combatant;

export default defaultCharacterProperties;
