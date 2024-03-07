import { createUseStyles } from "react-jss";
import { STRANGE_ENCOUNTER_MUSIC } from "../battle/constants";
import { bob } from "../enemy/enemy";
import { EventScene } from "./types";
import { SCENE_STYLES } from "./constants";
import { LithCorner2Image } from "../images";
import classNames from "classnames";

const bobEncounter = {
    characters: [bob.name],
    waves: [{ enemies: [null, null, bob, null, null] }],
    backgroundMusic: STRANGE_ENCOUNTER_MUSIC,
};
const useStyles = createUseStyles({
    ...SCENE_STYLES,
    player: {
        ...SCENE_STYLES.player,
        top: 286,
        left: 355,
    },
    bob: {
        top: 323,
        left: 550,
    },
});

const BobBackdrop = ({ player }) => {
    const classes = useStyles();
    return (
        <div>
            <img src={LithCorner2Image} alt="Right around Lith Harbor" className={classes.backdrop} />
            <img src={bob.image} alt="Bob" className={classNames(classes.character, classes.bob)} />
            <img src={player.image} alt="Bob" className={classNames(classes.character, classes.player)} />
        </div>
    );
};

export const bobSnailScene: EventScene = {
    id: "bob-intro",
    script: [
        {
            speaker: bob,
            scene: BobBackdrop,
            dialog: ["[On the path ahead sits a regular snail... or is it?]"],
            responses: [
                {
                    text: "Attack the snail.",
                    encounter: bobEncounter,
                },
                {
                    text: "Leave the snail alone.",
                    next: [
                        {
                            speaker: bob,
                            dialog: ["Hey, man! Thanks for not steamrolling me. It's tough out here being a lowly green snail."],
                        },
                        {
                            speaker: bob,
                            dialog: [
                                "I dunno what's with my rotten luck, but I've died about 17 times now, mostly within minutes of spawning.",
                            ],
                        },
                        {
                            speaker: bob,
                            dialog: [
                                "Sure sucks! How am I supposed to level up like this? This is the longest story I've gotten so far, and all I have to show for it is getting help from monsters just as strong as me.",
                                "Yeah, other green snails! Real helpful!",
                            ],
                        },
                        {
                            speaker: bob,
                            dialog: [
                                "You'd think I'd get some super strong cheat skill for being the weakest monster or something, but nope! Just dead, dead, and dead!",
                                "Well, you're a mushroom... How're YOU doing?",
                            ],
                            responses: [
                                {
                                    text: "I'm not supposed to be a mushroom. Can you tell me what's going on?",
                                    next: [
                                        {
                                            speaker: bob,
                                            dialog: [
                                                "Oh, yea, nobody's supposed to be what they are. I'm not SUPPOSED to be a green snail. If I had a choice, do you think I'd be a green snail? No opposable thumbs, no arms and legs? But you go with it till you get used to it. At least that's what I did.",
                                            ],
                                        },
                                        {
                                            speaker: bob,
                                            dialog: ["Get used to dying over and over, that is."],
                                        },
                                        {
                                            speaker: bob,
                                            dialog: [
                                                "Though I mean, you might have better luck than me. You look like a {{ class }}. Never seen that before. I mean, I've seen human {{ classPlural }}, but not monster ones.",
                                            ],
                                        },
                                        {
                                            speaker: bob,
                                            dialog: [
                                                "Anyway, I don't remember how I got here before it all started. I was just dying repeatedly until I figured out how to live for a little longer. And then a little longer. And now I'm here.",
                                            ],
                                        },
                                        {
                                            speaker: bob,
                                            dialog: ["Can't really give you any pointers, but maybe you can find out more in the towns."],
                                            responses: [
                                                {
                                                    text: "Alright, good luck out there.",
                                                    isExit: true,
                                                },
                                            ],
                                        },
                                    ],
                                },
                                {
                                    text: "Not bad all told. I get stuff from fighting everything in sight.",
                                    next: [
                                        {
                                            speaker: bob,
                                            dialog: ["Well I'll be damned. Bet it's second nature to ya."],
                                        },
                                        {
                                            speaker: bob,
                                            dialog: ["Some seekers have an easier time of it than others, growing, leveling up."],
                                        },
                                        {
                                            speaker: bob,
                                            dialog: ["Why'd they give ME the ability to grow if I'm just a damn snail!?"],
                                            responses: [
                                                {
                                                    text: "They?",
                                                    next: [
                                                        {
                                                            speaker: bob,
                                                            dialog: [
                                                                "Oh naw, that was just me doing the equivalent of cursing the heavens. But maybe there is a them out there, laughing at us. At ME.",
                                                                "Come on, who the hell does this?",
                                                            ],
                                                        },
                                                        {
                                                            speaker: bob,
                                                            dialog: [
                                                                "Anyway, I haven't lived long enough to give you any pointers, but maybe you can find out more in the towns.",
                                                            ],
                                                        },
                                                        {
                                                            speaker: bob,
                                                            dialog: [
                                                                "There are guys like us out there. Mostly jerks. I got killed by a few of them. Maybe you can wring out some answers if you come across 'em.",
                                                            ],
                                                            responses: [
                                                                {
                                                                    text: "Alright, good luck out there.",
                                                                    isExit: true,
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
                        },
                    ],
                },
            ],
        },
    ],
};
