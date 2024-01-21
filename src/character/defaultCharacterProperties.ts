import uuid from "uuid";
import { PLAYER_CLASSES } from "../Menu/types";
import {
    BlueUmbrellaImage,
    FrozenTunaImage,
    OldGladiusImage,
    OldWoodenStaffImage,
    PicoPicoHammerImage,
    StarCandyPopsicleImage,
    WarMushImage,
    WizMushImage,
    WoodenStaffImage,
    YellowUmbrellaImage,
} from "../images";
import { chargingStone, engravedStone } from "./../item/items";
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

export const wizardProperties = {
    ...defaultCharacterProperties,
    class: PLAYER_CLASSES.MAGICIAN,
    image: WizMushImage,
    HP: 45,
    maxHP: 45,
    resourcesPerTurn: 2,
    maxResources: 10,
    resources: 0,
    weapon: OldWoodenStaffImage,
    items: [chargingStone],
    weaponSkins: [
        { name: "Old Wooden Staff", image: OldWoodenStaffImage },
        { name: "Wooden Staff", image: WoodenStaffImage },
        { name: "Star Candy Popsicle", image: StarCandyPopsicleImage },
        { name: "Blue Umbrella", image: BlueUmbrellaImage },
        { name: "Yellow Umbrella", image: YellowUmbrellaImage },
    ],
};

export default defaultCharacterProperties;
