import { createUseStyles } from "react-jss";
import { chill } from "../../ability/Effects";
import { EFFECT_CLASSES, EFFECT_TYPES, Minion, TRIGGER_TARGET_TYPES } from "../../ability/types";
import { Wave } from "../../battle/types";
import { ElementalAdaptationImage, SanctuaryCrystalAImage, SanctuaryCrystalBImage, TrunkNestImage } from "../../images";
import {
    adamantiumPlate,
    amethyst,
    aquamarine,
    blackCrystal,
    diamond,
    diamondOre,
    emerald,
    garnet,
    opal,
    pieceOfIce,
    topaz,
} from "../../item/items";
import { EventScene } from "../types";
import { SCENE_STYLES } from "../constants";
import classNames from "classnames";

const crystalA: Minion = {
    name: "Crystal Formation",
    image: SanctuaryCrystalAImage,
    maxHP: 100,
    abilities: [],
    effects: [
        {
            name: "Frosty",
            description: "Chills attackers.",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.BUFF,
            icon: ElementalAdaptationImage,
            onReceiveAttack: {
                targetType: TRIGGER_TARGET_TYPES.ACTOR,
                effects: [
                    {
                        ...chill,
                        attackPower: -1,
                        maxApplications: undefined,
                        duration: 1,
                        description: "Reduces ATT by 1.",
                    },
                ],
            },
        },
    ],
};

const crystalB: Minion = {
    ...crystalA,
    image: SanctuaryCrystalBImage,
};

const crystalsFight: { disableCardRewards: boolean; waves: Wave[] } = {
    disableCardRewards: true,
    waves: [
        {
            enemies: [crystalA, null, crystalB, null, crystalA],
            description: [<>Deal as much damage as you can to the crystals in 6 turns.</>],
            winCondition: {
                surviveRounds: 6,
            },
        },
    ],
};

const useStyles = createUseStyles({
    ...SCENE_STYLES,
    player: {
        ...SCENE_STYLES.player,
        top: 309,
        left: 355,
    },
    crystalB: {
        bottom: 300,
        left: 550,
    },
    crystalA: {
        bottom: 300,
        left: 500,
    },
    crystalA2: {
        bottom: 300,
        left: 600,
    },
});

const CrystalsBackdrop = ({ player }) => {
    const classes = useStyles();
    return (
        <div>
            <img src={TrunkNestImage} alt="Trunk Nest" className={classes.backdrop} />
            <img src={crystalA.image} alt="Crystal B" className={classNames(classes.character, classes.crystalA)} />
            <img src={crystalB.image} alt="Crystal A" className={classNames(classes.character, classes.crystalB)} />
            <img src={crystalA.image} alt="Crystal B" className={classNames(classes.character, classes.crystalA2)} />
            <img src={player.image} alt="Player" className={classNames(classes.character, classes.player)} />
        </div>
    );
};

export const crystalScene: EventScene = {
    id: "crystals",
    script: [
        {
            scene: CrystalsBackdrop,
            dialog: ["[You come across a cluster of crystal formations jutting from the ground.]"],
        },
        {
            dialog: [
                "[They gleam with an almost otherworldly light, and as you approach, you can feel a chill emanating from them as if they're made of ice.",
                "Something about these crystals promises power. Maybe you can mine them for something of value.]",
            ],
            responses: [
                {
                    text: "Mine the crystals.",
                    encounter: crystalsFight,
                    next: [
                        {
                            dialog: ["...!"],
                        },
                        {
                            dialog: ["...!"], // This dialog is not displayed when there is conditionalNext
                            conditionalNext: [
                                {
                                    conditions: [
                                        {
                                            battle: {
                                                totalKills: 3,
                                            },
                                            comparator: "eq",
                                        },
                                    ],
                                    next: [
                                        {
                                            speaker: crystalA,
                                            dialog: [
                                                "[You destroyed all the crystals! Hunks of glowing ore lie strewn all around, still cold to the touch. Among them, you find precious minerals freed from their confines, glittering with power.]",
                                            ],
                                        },
                                        {
                                            dialog: ["..."],
                                            itemChoices: {
                                                numChoices: 3,
                                                items: [opal, blackCrystal, emerald, pieceOfIce, adamantiumPlate],
                                                bonuses: {
                                                    rare: 0.65,
                                                    uncommon: 0.25,
                                                },
                                            },
                                        },
                                        {
                                            speaker: crystalA,
                                            dialog: ["[There's nothing left here.]"],
                                            responses: [
                                                {
                                                    text: "Leave.",
                                                    isExit: true,
                                                },
                                            ],
                                        },
                                    ],
                                },
                                {
                                    conditions: [
                                        {
                                            battle: {
                                                totalKills: 2,
                                            },
                                            comparator: "eq",
                                        },
                                        {
                                            battle: {
                                                totalDamage: 249,
                                            },
                                            comparator: "gt",
                                        },
                                    ],
                                    next: [
                                        {
                                            speaker: crystalA,
                                            dialog: [
                                                "[You dealt {{ totalDamage }} damage to the crystals and destroyed {{ totalKills }} of them. Many of the crystals are cracked and broken open. Among the pieces, you find...]",
                                            ],
                                        },
                                        {
                                            dialog: ["..."],
                                            itemChoices: {
                                                numChoices: 3,
                                                items: [
                                                    opal,
                                                    blackCrystal,
                                                    emerald,
                                                    pieceOfIce,
                                                    adamantiumPlate,
                                                    diamond,
                                                    garnet,
                                                    amethyst,
                                                    topaz,
                                                ],
                                                bonuses: {
                                                    rare: 0.1,
                                                    uncommon: 0.2,
                                                },
                                            },
                                        },
                                        {
                                            speaker: crystalA,
                                            dialog: ["[A chilling draft encourages your departure from the site.]"],
                                            responses: [
                                                {
                                                    text: "Leave.",
                                                    isExit: true,
                                                },
                                            ],
                                        },
                                    ],
                                },
                                {
                                    conditions: [
                                        {
                                            battle: {
                                                totalKills: 1,
                                            },
                                            comparator: "eq",
                                        },
                                        {
                                            battle: {
                                                totalDamage: 149,
                                            },
                                            comparator: "gt",
                                        },
                                    ],
                                    next: [
                                        {
                                            speaker: crystalA,
                                            dialog: [
                                                "[You dealt {{ totalDamage }} damage to the crystals and destroyed {{ totalKills }} of them. Something gleaming tumbles out.]",
                                            ],
                                        },
                                        {
                                            dialog: ["..."],
                                            items: {
                                                itemPool: [
                                                    opal,
                                                    blackCrystal,
                                                    emerald,
                                                    pieceOfIce,
                                                    adamantiumPlate,
                                                    diamond,
                                                    garnet,
                                                    amethyst,
                                                    topaz,
                                                    aquamarine,
                                                    diamondOre,
                                                ],
                                                amount: 1,
                                            },
                                        },
                                        {
                                            speaker: crystalA,
                                            dialog: ["[A chilling draft encourages your departure from the site.]"],
                                            responses: [
                                                {
                                                    text: "Leave.",
                                                    isExit: true,
                                                },
                                            ],
                                        },
                                    ],
                                },
                                {
                                    conditions: [
                                        {
                                            battle: {
                                                totalDamage: 99,
                                            },
                                            comparator: "gt",
                                        },
                                    ],
                                    next: [
                                        {
                                            speaker: crystalA,
                                            dialog: [
                                                "[You dealt {{ totalDamage }} damage to the crystals and destroyed {{ totalKills }} of them. Something gleaming tumbles out.]",
                                            ],
                                        },
                                        {
                                            dialog: ["..."],
                                            items: {
                                                itemPool: [diamond, garnet, amethyst, topaz, aquamarine, diamondOre],
                                                amount: 1,
                                            },
                                        },
                                        {
                                            speaker: crystalA,
                                            dialog: ["[A chilling draft encourages your departure from the site.]"],
                                            responses: [
                                                {
                                                    text: "Leave.",
                                                    isExit: true,
                                                },
                                            ],
                                        },
                                    ],
                                },
                                {
                                    conditions: [],
                                    next: [
                                        {
                                            speaker: crystalA,
                                            dialog: [
                                                "[Nothing happens. The crystals stand unaffected by your assault. A bitter draft follows in your departure.]",
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ],
};
