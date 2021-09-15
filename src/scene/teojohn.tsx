import { createUseStyles } from "react-jss";
import { hotdog, johnImage, lithHarborSharkFull, teoImage } from "../images";
import { halfEatenHotdog } from "../item/items";
import { Scene, ScriptNode } from "./types";

const teo = {
    name: "Teo",
    image: teoImage,
};

const john = {
    name: "John",
    image: johnImage,
};

const useStyles = createUseStyles({
    root: {
        position: "relative",
        background: `url(${lithHarborSharkFull}) no-repeat`,
        width: "700px",
        height: "506px",
    },

    player: {
        position: "absolute",
        left: "75px",
        top: "228px",
        height: "65px",
        WebkitFilter: "drop-shadow(0 0 3px #fffee8) drop-shadow(0 0 3px #fffee8)",
        filter: "drop-shadow(0 0 3px #fffee8) drop-shadow(0 0 3px #fffee8)",
    },
    character1: {
        position: "absolute",
        left: "500px",
        top: "213px",
        WebkitFilter: "drop-shadow(0 0 3px #fffee8) drop-shadow(0 0 3px #fffee8)",
        filter: "drop-shadow(0 0 3px #fffee8) drop-shadow(0 0 3px #fffee8)",
    },
    character2: {
        position: "absolute",
        left: "550px",
        top: "224px",
        WebkitFilter: "drop-shadow(0 0 3px #fffee8) drop-shadow(0 0 3px #fffee8)",
        filter: "drop-shadow(0 0 3px #fffee8) drop-shadow(0 0 3px #fffee8)",
    },
});

const TeoJohn = ({ player }) => {
    const classes = useStyles();
    return (
        <div className={classes.root}>
            <img src={player.image} className={classes.player} />
            <img src={teoImage} className={classes.character1} />
            <img src={johnImage} className={classes.character2} />
        </div>
    );
};

export const lithEventsTeoJohn: Scene = {
    scene: TeoJohn,
    script: [
        {
            speaker: teo,
            dialog: ["Oh hey, John, wouldja look over there."],
        },
        {
            speaker: john,
            dialog: ["What?"],
        },
        {
            speaker: teo,
            dialog: [
                "There, see? A mushroom got into Lith Harbor.",
                "I hear there's an awful of them around Henesys lately. Maybe they've started to migrate over here.",
            ],
        },
        {
            speaker: john,
            dialog: ["[John squints.]", "Is that a... hat it's wearing?"],
        },
        {
            speaker: teo,
            dialog: [
                "Well, it definitely ain't like any mushroom I've seen in my life.",
                "Hey there, fella. Why'd you come into town? You ain't causin' any trouble, are you?",
            ],
            responses: [
                {
                    text: "Explain that you aren't supposed to be a mushroom... you think.",
                    next: [
                        {
                            speaker: john,
                            dialog: ["It looks like it's trying to say something.", "[John laughs.]", "I think it's hungry."],
                        },
                        {
                            speaker: teo,
                            dialog: ["Ha, probably.", "Here, mushroom, take this."],
                        },
                        {
                            speaker: teo,
                            dialog: ["[Teo tosses something at you.]"],
                            items: [halfEatenHotdog],
                        },
                        {
                            dialog: ["(Something tells you that being misunderstood by people is going to be a pattern...)"],
                        },
                        {
                            speaker: john,
                            dialog: ["You sure you should be feeding the wildlife, Teo?"],
                        },
                        {
                            speaker: teo,
                            dialog: [
                                "If there's a problem, I'm sure one of the greenhorns will handle it on the quick.",
                                "A couple decades ago I might've been running in swords swinging, myself. These days?",
                                "Eh... it's just a mushroom, John.",
                            ],
                        },
                    ],
                },
            ],
        },
    ],
};
