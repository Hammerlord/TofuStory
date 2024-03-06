import { createUseStyles } from "react-jss";
import { CLASS_LEADER_MUSIC } from "../../battle/constants";
import { BATTLE_TYPES } from "../../battle/types";
import { darkLord } from "../../enemy/darkLord";
import { thiefAssassin } from "../../enemy/enemy";
import { DarkLordImage, KerningBarFullImage, KerningBarUndergroundImage, LeetSinImage } from "../../images";
import { EventScene, ScriptNode } from "../types";
import classNames from "classnames";
import { Player } from "../../character/types";

const darkLordCharacter = {
    name: "Dark Lord",
    image: DarkLordImage,
};

const aVoice = {
    name: "A Voice",
    image: DarkLordImage,
};

const thiefAssassinFight = {
    characters: [],
    waves: [
        {
            enemies: [null, null, thiefAssassin, null, null],
        },
    ],
};

const darkLordFight = {
    characters: [],
    waves: [
        {
            enemies: [null, null, darkLord, null, null],
        },
    ],
    type: BATTLE_TYPES.BOSS,
    backgroundMusic: CLASS_LEADER_MUSIC,
};

const useBarStyles = createUseStyles({
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
        top: 315,
        left: 600,
        height: "65px",
    },
    assassin: {
        left: 300,
        top: 220,
        transform: "scaleX(-1)",
    },
});

const BarBackdrop = ({ player, showThief }: { player: Player; showThief?: boolean }) => {
    const classes = useBarStyles();
    return (
        <div className={classes.root}>
            <img src={KerningBarFullImage} alt="Bar" className={classes.backdrop} />
            <img src={player.image} alt="Player" className={classNames(classes.player, classes.character)} />
            {showThief && <img src={LeetSinImage} alt="Assassin" className={classNames(classes.character, classes.assassin)} />}
        </div>
    );
};

const useBarUndergroundStyles = createUseStyles({
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
        top: 360,
        left: 300,
        height: "65px",
    },
    assassin: {
        left: 294,
        top: 260,
    },
});

const BasementBackdrop = ({ player }: { player: Player }) => {
    const classes = useBarUndergroundStyles();
    return (
        <div className={classes.root}>
            <img src={KerningBarUndergroundImage} alt="Bar Underground" className={classes.backdrop} />
            <img src={player.image} alt="Player" className={classNames(classes.player, classes.character)} />
            <img src={DarkLordImage} alt="Dark Lord" className={classNames(classes.assassin, classes.character)} />
        </div>
    );
};

export const toilet: ScriptNode[] = [
    {
        speaker: thiefAssassin,
        dialog: ["WTF? You're just a {{ class }}! How did I get beaten?"],
    },
    {
        speaker: thiefAssassin,
        dialog: ["My EXP! I grinded almost a whole hour for that!"],
    },
    {
        dialog: ["[With a final cry of outrage, the ghost of the defeated assassin promptly vanishes.]"],
    },
    {
        scene: BarBackdrop,
        speaker: aVoice,
        dialog: ["So you've defeated one of my disciples.", "[The voice seems to be coming from the toilet in the back.]"],
        responses: [
            {
                text: "That was one of your disciples?",
                next: [
                    {
                        speaker: aVoice,
                        dialog: [
                            "[The voice sighs.] I know what you're thinking. Yes, XxLeetSinxX was one of my disciples.",
                            "Becoming an assassin is a fine choice to make. Finer than most decisions. But it is not enough to simply choose the path--the undertaking must be tempered, constantly, with discipline.",
                        ],
                    },
                    {
                        speaker: aVoice,
                        dialog: ["Hopefully, my disciple has learned his lesson."],
                    },
                    {
                        speaker: aVoice,
                        dialog: ["Come forward. I sense a peculiarity about you. You are a monster, yes, but no ordinary one."],
                    },
                    {
                        speaker: aVoice,
                        dialog: ["And do not think of running away. Cowards will not leave this place alive."],
                        responses: [
                            {
                                text: "[Climb down the toilet...]",
                                next: [
                                    {
                                        speaker: darkLordCharacter,
                                        scene: BasementBackdrop,
                                        dialog: [
                                            "There you are.",
                                            "Mmm. I did not expect to see a mushroom, of all creatures.",
                                            "My disciple's shame is surely great.",
                                        ],
                                    },
                                    {
                                        speaker: darkLordCharacter,
                                        dialog: ["...", "[The Dark Lord appears to be studying you.]"],
                                        responses: [
                                            {
                                                text: "[Attempt to explain that you don't think you're supposed to be a monster.]",
                                            },
                                        ],
                                    },
                                    {
                                        speaker: darkLordCharacter,
                                        dialog: [
                                            "[If the Dark Lord understands, he shows no indication. He merely looks at you, dispassionate beneath his black mask.]",
                                        ],
                                    },
                                    {
                                        speaker: darkLordCharacter,
                                        dialog: [
                                            "Grendel has foretold a grave danger to all of Victoria Island--not in the sense of a world-shaking catastrophe, but the kind that is insidious and creeping. Your existence troubles me, and I cannot help but believe it is related to his warning.",
                                        ],
                                    },
                                    {
                                        speaker: darkLordCharacter,
                                        dialog: ["I have decided.", "One such as you cannot be allowed to live."],
                                    },
                                    {
                                        speaker: darkLordCharacter,
                                        dialog: [
                                            "Whatever you once were does not matter. You are but a monster now, and monsters are to be eliminated.",
                                        ],
                                        responses: [
                                            {
                                                text: "Prepare for the Dark Lord's assault.",
                                                encounter: darkLordFight,
                                                next: [
                                                    {
                                                        speaker: darkLordCharacter,
                                                        dialog: [
                                                            "[The Dark Lord stumbles back, clutching his wounds.]",
                                                            "(This seeker has already become far more powerful than I expected.",
                                                            "I must warn Grendel. I pray I am not too late.)",
                                                        ],
                                                    },
                                                    {
                                                        speaker: darkLordCharacter,
                                                        dialog: ["[The Dark Lord vanishes in a puff of smoke.]"],
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
];

export const barScene: EventScene = {
    id: "rogue-class-leader-event",
    script: [
        {
            scene: BarBackdrop,
            dialog: ["[It seems all empty in the club house. Is the place abandoned?]"],
        },
        {
            dialog: ["[You take a step (or a hop) farther in...]"],
        },
        {
            dialog: ["[A ninja star comes flying out of nowhere. It bounces off the floor and goes clattering.", "A warning shot.]"],
        },
        {
            scene: (other) => <BarBackdrop showThief={true} {...other} />,
            speaker: thiefAssassin,
            dialog: [
                "Stop right there. This place is for pros like me only... peeps with ugly NX costumes aren't allowed. Go away before I kick your ass.",
            ],
            responses: [
                {
                    text: "Uh huh...",
                    infamy: 3,
                    next: [
                        {
                            speaker: thiefAssassin,
                            dialog: ["What, you wanna fight, noob? I'll beat you up."],
                            responses: [
                                {
                                    text: "Prepare for a fight.",
                                    encounter: thiefAssassinFight,
                                    next: toilet,
                                },
                            ],
                        },
                    ],
                },
                {
                    text: "[You don't want trouble, so maybe you should back out.]",
                    next: [
                        {
                            speaker: thiefAssassin,
                            dialog: [
                                "[Another ninja star comes flying, this time nicking your stubby body.]",
                                "Ha! Just kidding! You really thought I was gonna let you leave?",
                            ],
                        },
                        {
                            speaker: thiefAssassin,
                            dialog: ["[It seems that a confrontation is unavoidable.]"],
                            responses: [
                                {
                                    text: "Prepare for a fight.",
                                    encounter: thiefAssassinFight,
                                    next: toilet,
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ],
};
