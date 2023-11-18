import uuid from "uuid";
import { PLAYER_CLASSES } from "../Menu/types";
import { BlueUmbrellaImage, FrozenTunaImage, OldGladiusImage, PicoPicoHammerImage, WarMushImage, YellowUmbrellaImage } from "../images";
import { engravedStone } from "./../item/items";
import { Combatant } from "./types";

/** Default character stats */
const defaultCharacterProperties = {
    name: "",
    id: uuid.v4(),
    class: PLAYER_CLASSES.WARRIOR,
    secondaryClass: null,
    image: WarMushImage,
    HP: 50,
    maxHP: 50,
    resourcesPerTurn: 1,
    maxResources: 5,
    resources: 1,
    armor: 0,
    turnHistory: [],
    abilityHistory: [],
    mesos: 0,
    isPlayer: true,
    weapon: OldGladiusImage,
    effects: [],
    items: [engravedStone],
    drawCardsPerTurn: 3,
    weaponSkins: [
        { name: "Old Gladius", image: OldGladiusImage },
        { name: "Pico Pico", image: PicoPicoHammerImage },
        { name: "Frozen Tuna", image: FrozenTunaImage },
        { name: "Blue Umbrella", image: BlueUmbrellaImage },
        { name: "Yellow Umbrella", image: YellowUmbrellaImage },
    ],
} as Combatant;

export default defaultCharacterProperties;
