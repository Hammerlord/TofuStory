import { createUseStyles } from "react-jss";
import { SCENE_STYLES } from "./constants";
import { KerningWorkshopBGImage } from "../images";
import classNames from "classnames";
import { EventScene } from "./types";
import { adamantiumPlate, amethyst, aquamarine, diamond, diamondOre, garnet, topaz } from "../item/items";

const useStyles = createUseStyles({
    ...SCENE_STYLES,
    player: {
        ...SCENE_STYLES.player,
        left: 383,
        bottom: 370,
    },
});

const AbandonedWorkshopBackdrop = ({ player }) => {
    const classes = useStyles();
    return (
        <div className={classes.root}>
            <img src={KerningWorkshopBGImage} alt="Workshop" />
            <img src={player.image} alt="Player" className={classNames(classes.player, classes.character)} />
        </div>
    );
};

export const workshopScene: EventScene = {
    id: "abandoned-workshop",
    script: [
        {
            scene: AbandonedWorkshopBackdrop,
            dialog: [
                "[You come across an old, run-down building with an ajar door. A warm light shines through the open threshold, and when you enter, you feel a great heat emanating from inside.]",
            ],
        },
        {
            dialog: [
                "[The place appears to be a workshop, with crates of ore lining the walls, and a forge glowing unattended at the chamber's center. Nobody seems to be home.",
                "What will you do?]",
            ],
            responses: [
                {
                    text: "Steal something from the shelves.",
                    infamy: 2,
                    next: [
                        {
                            dialog: ["[You reach into one of the baskets, and...]"],
                            items: {
                                itemPool: [adamantiumPlate, diamond, garnet, amethyst, topaz, aquamarine, diamondOre],
                                amount: 1,
                            },
                        },
                        {
                            dialog: ["..."],
                            responses: [
                                {
                                    text: "Continue journey.",
                                    isExit: true,
                                },
                            ],
                        },
                    ],
                },
                {
                    text: "Transmute. [Replace an ability with 1 of 3 options (up to 2 times)]",
                    transmutation: true,
                    next: [
                        {
                            dialog: ["..."],
                        },
                        {
                            dialog: ["[Hopefully the owner of this place doesn't mind you borrowing the forge.]"],
                            responses: [
                                {
                                    text: "Continue journey.",
                                    isExit: true,
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ],
};
