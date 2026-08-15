import * as uuid from "uuid";
import { PLAYER_CLASSES } from "../Menu/types";
import { bowmanDefaultAttack } from "../ability/bowman/bowmanAbilities";
import { WeaponImageOptions } from "../ability/types";
import { BASE_MAX_RESOURCES, BASE_RESOURCES_PER_TURN } from "../battle/constants";
import {
    BlueUmbrellaImage,
    BowMushImage,
    ChickenEggImage,
    ChickenLegImage,
    ChickenSmackarooImage,
    FantasticComboImage,
    FrozenTunaImage,
    GoldenChickImage,
    GreenCrayonImage,
    MagicArrow2Image,
    MagicArrow3Image,
    MagicArrow4Image,
    MagicArrow5Image,
    MagicArrowImage,
    MelonPopsicleImage,
    OldGladiusImage,
    OldWoodenStaffImage,
    OlympusImage,
    OrangeCrayonImage,
    PicoPicoHammerImage,
    PinkFlowerTubeImage,
    RainbowBowImage,
    RedCrayonImage,
    StarCandyPopsicleImage,
    StrawberryPopsicleImage,
    ToyMachineGunImage,
    ToyRifleImage,
    WarBowImage,
    WarMushImage,
    WaterBombImage,
    WaterGunImage,
    WatermelonPopsicleImage,
    WhiteNeschereImage,
    WizMushImage,
    WoodenStaffImage,
    YellowCrayonImage,
    YellowUmbrellaImage,
} from "../images";
import { chargingStone, honestyStone, rageStone } from "../item/starterItems";
import { Player } from "./types";

// Bows/oblong weapons have a different shape compared to swords and need to be positioned closer to the character
const bowImageOptions: WeaponImageOptions = {
    top: "-25px",
    left: "50px",
};

const sharedSkins = [
    { name: "Golden Chick", image: GoldenChickImage },
    {
        name: "Pink Flower Tube",
        image: PinkFlowerTubeImage,
        weaponImageOptions: bowImageOptions,
        projectileOverride: [MelonPopsicleImage, StrawberryPopsicleImage, WatermelonPopsicleImage],
    },
    {
        name: "Chicken Smackaroo",
        image: ChickenSmackarooImage,
        weaponImageOptions: { top: "-60px", left: "35px" },
        projectileOverride: [ChickenEggImage, ChickenLegImage, FantasticComboImage],
    },
];

const defaultCharacterProperties: Player = {
    name: "Player",
    id: uuid.v4(),
    class: PLAYER_CLASSES.WARRIOR,
    secondaryClass: null,
    image: WarMushImage,
    HP: 70,
    maxHP: 70,
    resourcesPerTurn: BASE_RESOURCES_PER_TURN,
    maxResources: BASE_MAX_RESOURCES, // Maximum resources that resourcesPerTurn can grant up to
    resources: 0,
    armor: 0,
    abilities: [],
    turnHistory: [],
    abilityHistory: [],
    mesos: 0,
    isPlayer: true,
    weapon: OldGladiusImage,
    effects: [],
    items: [rageStone],
    drawCardsPerTurn: 4,
    weaponSkins: [
        { name: "Old Gladius", image: OldGladiusImage },
        { name: "Pico Pico", image: PicoPicoHammerImage },
        { name: "Frozen Tuna", image: FrozenTunaImage },
        { name: "Blue Umbrella", image: BlueUmbrellaImage },
        { name: "Yellow Umbrella", image: YellowUmbrellaImage },
        ...sharedSkins,
    ],
};

export const wizardProperties: Player = {
    ...defaultCharacterProperties,
    class: PLAYER_CLASSES.MAGICIAN,
    image: WizMushImage,
    HP: 65,
    maxHP: 65,
    weapon: OldWoodenStaffImage,
    items: [chargingStone],
    weaponSkins: [
        { name: "Old Wooden Staff", image: OldWoodenStaffImage },
        { name: "Wooden Staff", image: WoodenStaffImage },
        { name: "Star Candy Popsicle", image: StarCandyPopsicleImage },
        { name: "Blue Umbrella", image: BlueUmbrellaImage },
        { name: "Yellow Umbrella", image: YellowUmbrellaImage },
        ...sharedSkins,
    ],
};

export const bowmanProperties: Player = {
    ...defaultCharacterProperties,
    class: PLAYER_CLASSES.BOWMAN,
    image: BowMushImage,
    HP: 65,
    maxHP: 65,
    weapon: WarBowImage,
    weaponImageOptions: bowImageOptions,
    items: [honestyStone],
    weaponSkins: [
        { name: "War Bow", image: WarBowImage, weaponImageOptions: bowImageOptions },
        { name: "Olympus", image: OlympusImage, weaponImageOptions: bowImageOptions },
        {
            name: "Toy Rifle",
            image: ToyRifleImage,
            projectileOverride: [RedCrayonImage, OrangeCrayonImage, YellowCrayonImage, GreenCrayonImage],
        },
        { name: "White Neschere", image: WhiteNeschereImage },
        { name: "Toy Machine Gun", image: ToyMachineGunImage },
        {
            name: "Rainbow Bow",
            image: RainbowBowImage,
            weaponImageOptions: bowImageOptions,
            projectileOverride: [MagicArrowImage, MagicArrow2Image, MagicArrow3Image, MagicArrow4Image, MagicArrow5Image],
        },
        { name: "Water Gun", image: WaterGunImage, projectileOverride: WaterBombImage },
        ...sharedSkins,
    ],
    abilities: [bowmanDefaultAttack],
};

export default defaultCharacterProperties;
