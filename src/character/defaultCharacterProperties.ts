import * as uuid from "uuid";
import { PLAYER_CLASSES } from "../Menu/types";
import { BASE_MAX_RESOURCES, BASE_RESOURCES_PER_TURN } from "../battle/constants";
import {
    AvengersArrowImage,
    BlueUmbrellaImage,
    BowMushImage,
    FrozenTunaImage,
    OldGladiusImage,
    OldWoodenStaffImage,
    PicoPicoHammerImage,
    StarCandyPopsicleImage,
    WarBowImage,
    WarMushImage,
    WizMushImage,
    WoodenStaffImage,
    YellowUmbrellaImage,
} from "../images";
import { chargingStone, honestyStone, rageStone } from "../item/starterItems";
import WeaponSkins from "../Menu/WeaponSkins";
import { ACTION_TYPES, ANIMATION_TYPES, TARGET_TYPES } from "../ability/types";

/** Default character stats */
const defaultCharacterProperties = {
    name: "",
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
    ],
};

export const wizardProperties = {
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
    ],
};

export const bowmanProperties = {
    ...defaultCharacterProperties,
    class: PLAYER_CLASSES.BOWMAN,
    image: BowMushImage,
    HP: 65,
    maxHP: 65,
    weapon: WarBowImage,
    items: [honestyStone],
    WeaponSkins: [],
    abilities: [
        {
            name: "Shoot",
            image: AvengersArrowImage,
            resourceCost: 0,
            actions: [
                {
                    type: ACTION_TYPES.RANGE_ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    animation: ANIMATION_TYPES.ONE_WAY,
                    icon: AvengersArrowImage,
                    damage: 2,
                    animationOptions: {
                        rotateToFaceTarget: true,
                        rotate: 135,
                    },
                },
            ],
        },
    ],
};

export default defaultCharacterProperties;
