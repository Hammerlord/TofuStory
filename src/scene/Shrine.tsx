import { createUseStyles } from "react-jss";
import { ShrineSceneImage } from "../images";
import { mesoItem } from "../item/items";
import { SCENE_STYLES } from "./constants";
import { EventScene } from "./types";
import classNames from "classnames";

const useShrineStyles = createUseStyles({
    ...SCENE_STYLES,
    player: {
        ...SCENE_STYLES.player,
        bottom: 238,
        left: 500,
    },
});

const ShrineBackdrop = ({ player }) => {
    const classes = useShrineStyles();
    return (
        <div className={classes.root}>
            <img src={ShrineSceneImage} alt="Shrine" />
            <img src={player.image} alt="Player" className={classNames(classes.player, classes.character)} />
        </div>
    );
};

export const shrineScene: EventScene = {
    id: "shrine",
    script: [
        {
            scene: ShrineBackdrop,
            dialog: ["Pink petals drift in the wind, temporarily giving you pause. Spring blossoms? Here?"],
        },
        {
            dialog: [
                "Looking farther down the path, you see an old shrine. It appears as if nobody has visited it in a long time.",
                "What will you do?",
            ],
            responses: [
                {
                    text: "Light some incense.",
                    removeAbility: true,
                    next: [
                        {
                            dialog: ["You breathe in the incense, and feel lighter."],
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
                    text: "Wish for a safe journey.",
                    upgradeCards: 2,
                    next: [
                        {
                            dialog: ["..."],
                        },
                        {
                            dialog: ["You feel mysteriously strengthened."],
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
                    text: "Wish for good fortune. [Gain 100 mesos.]",
                    next: [
                        {
                            dialog: ["You hear the clink of coins, and..."],
                            items: {
                                itemPool: [mesoItem],
                                amount: 1,
                            },
                        },
                        {
                            dialog: ["Your metaphorical coin bag has grown heavier."],
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
                    text: "Leave.",
                    isExit: true,
                },
            ],
        },
    ],
};
