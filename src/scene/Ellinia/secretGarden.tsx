import { createUseStyles } from "react-jss";
import { CLASS_LEADER_MUSIC } from "../../battle/constants";
import { BATTLE_TYPES } from "../../battle/types";
import { lostDragon } from "../../enemy/dragon";
import { grendel, introGrendel } from "../../enemy/grendel";
import {
    BlueManonDormantImage,
    BlueManonImage,
    ElliniaBGImage,
    ElliniaLibraryOutsideImage,
    LenImage,
    MarrsForestImage,
} from "../../images";
import { EventScene } from "../types";
import classNames from "classnames";
import { glassShoe } from "../../item/items";
import { Player } from "../../character/types";

const lostDragonFight = {
    waves: [
        {
            enemies: [null, null, lostDragon, null, null],
        },
    ],
    type: BATTLE_TYPES.BOSS,
    backgroundMusic: "https://vgmsite.com/soundtracks/maplestory-music/otkvinbeci/77.%20Dragon%20Load.mp3",
};

const useStyles = createUseStyles({
    root: {
        position: "relative",
        width: "100%",
        height: "100%",
    },
    backdrop: {
        width: "100%",
        height: "100%",
    },
    character: {
        position: "absolute",
        filter: "drop-shadow(0 0 3px #fffee8) drop-shadow(0 0 3px #fffee8)",
    },
    player: {
        top: 289,
        left: 220,
        height: "65px",
    },
    len: {
        right: 200,
        top: 200,
        animationName: "$upAndDown",
        animationDuration: "2s",
        animationIterationCount: "infinite",
        animationDirection: "alternate-reverse",
        animationDelay: "0.5s",
    },
    dragon: {
        position: "absolute",
        transform: "translateX(-50%)",
        top: 200,
        left: 415,
    },
    dormant: {
        filter: "brightness(0.5)",
    },
    "@keyframes upAndDown": {
        from: {
            transform: "translateY(0)",
        },
        to: {
            transform: "translateY(-8px)",
        },
    },
    float: {
        animationName: "$upAndDown",
        animationDuration: "2s",
        animationIterationCount: "infinite",
        animationDirection: "alternate-reverse",
    },
});

export const SecretGardenBackdrop = ({ player, showLen, awakenDragon }: { player: Player; showLen?: boolean; awakenDragon?: boolean }) => {
    const classes = useStyles();

    return (
        <div className={classes.root}>
            <img src={MarrsForestImage} alt="Secret Garden Backdrop" className={classes.backdrop} />
            <img src={player.image} alt="Player" className={classNames(classes.character, classes.player)} />
            {!awakenDragon && (
                <img src={BlueManonDormantImage} alt="Dragon" className={classNames(classes.dragon, classes.float, classes.dormant)} />
            )}
            {awakenDragon && <img src={BlueManonImage} alt="Dragon" className={classNames(classes.dragon, classes.float)} />}
            {showLen && <img src={LenImage} alt="Fairy" className={classNames(classes.character, classes.len)} />}
        </div>
    );
};

const useBackToElliniaStyles = createUseStyles({
    root: {
        position: "relative",
        width: "100%",
        height: "100%",
    },
    backdrop: {
        width: "100%",
        height: "100%",
    },
    character: {
        position: "absolute",
        filter: "drop-shadow(0 0 3px #fffee8) drop-shadow(0 0 3px #fffee8)",
    },
    player: {
        top: 343,
        left: 500,
        height: "65px",
    },
});

export const BackToElliniaScene = ({ player }) => {
    const classes = useBackToElliniaStyles();
    return (
        <div className={classes.root}>
            <img src={ElliniaLibraryOutsideImage} alt="Ellinia Backdrop" className={classes.backdrop} />
            <img src={player.image} className={classNames(classes.player, classes.character)} />
        </div>
    );
};

const lenFairy = {
    name: "Fairy",
    image: LenImage,
};

export const secretGardenScene: EventScene = {
    id: "secret-garden",
    script: [
        {
            scene: SecretGardenBackdrop,
            dialog: ["[You find yourself in a secluded garden.]"],
        },
        {
            dialog: [
                "Floating suspended in mid-air is a dragon. It appears to be dormant, held in stasis by the mystical runes that hang over it.",
            ],
        },
        {
            dialog: ["..."],
        },
        {
            scene: (other) => <SecretGardenBackdrop showLen={true} {...other} />,
            speaker: lenFairy,
            dialog: ["How did one find this place?"],
        },
        {
            speaker: lenFairy,
            dialog: [
                "One is not to be here! Shoo! And forget what one has seen--it is not for adventuring eyes.",
                "[With that, the fairy begins to cast a spell, one that you can feel is meant to transport you away, possibly taking your memories with it...]",
            ],
        },
        {
            dialog: ["..."],
            conditionalNext: [
                {
                    conditions: [
                        {
                            items: [glassShoe.name],
                        },
                    ],
                    next: [
                        {
                            scene: (other) => <SecretGardenBackdrop showLen={true} awakenDragon={true} {...other} />,
                            speaker: lenFairy,
                            dialog: ["[The fairy gasps.]"],
                        },
                        {
                            speaker: lostDragon,
                            dialog: ["[The dragon shifts and growls in its slumber. It doesn't seem so asleep anymore.]"],
                        },
                        {
                            speaker: lenFairy,
                            dialog: ["Mar? Oh, no! No! No! [The fairy addresses you.] What has one done? What does one hold?"],
                        },
                        {
                            speaker: lenFairy,
                            dialog: [
                                "[The fairy zips toward you in a blur.]",
                                "Ahh! That shoe belongs to poor Arwen! Where did one find that!?",
                            ],
                        },
                        {
                            speaker: lostDragon,
                            dialog: [
                                "[Too late. The dragon awakens with an ear-shattering, bone-rattling roar. If you had any ears or bones, that is.]",
                            ],
                        },
                        {
                            speaker: lenFairy,
                            dialog: ["Mar thinks one has done something to Arwen!", "No, Mar!", "[The fairy tries to cast another spell.]"],
                        },
                        {
                            speaker: lostDragon,
                            dialog: [
                                "[... To no avail. The dragon thrashes, swinging its tail into the fairy, who sails far, far away and out of sight.]",
                            ],
                        },
                        {
                            scene: (other) => <SecretGardenBackdrop awakenDragon={true} {...other} />,
                            speaker: lostDragon,
                            dialog: ["[It's just you and the dragon now. The dragon glares at you with bright, maddened eyes.]"],
                            responses: [
                                {
                                    text: "Defend yourself.",
                                    encounter: lostDragonFight,
                                },
                            ],
                        },
                    ],
                },
                {
                    conditions: [],
                    next: [
                        {
                            speaker: lenFairy,
                            dialog: ["[Abruptly, your vision fills with magic, and...]"],
                        },
                        {
                            scene: BackToElliniaScene,
                            dialog: ["[You find yourself back outside once more. What just happened?]"],
                        },
                        {
                            dialog: ["[You can't think clearly... but an unsettling feeling lingers.]"],
                            responses: [
                                {
                                    text: "Continue your journey.",
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
