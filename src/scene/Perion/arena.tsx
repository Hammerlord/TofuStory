import classNames from "classnames";
import { createUseStyles } from "react-jss";
import { BATTLE_TYPES } from "../../battle/types";
import { Player } from "../../character/types";
import { manji } from "../../enemy/Manji";
import { ArturoImage, BystanderImage, DancesWithBalrogSittingImage, PerionArenaFullImage } from "../../images";
import Tooltip from "../../view/Tooltip";
import { EventScene, SceneEncounter, ScriptNode } from "../types";
import { tauromacis, taurospear } from "../../enemy/minotaur";
import { ayanEnemy } from "../../enemy/ayan";

const announcer = {
    name: "Announcer",
    image: ArturoImage,
};

const crowd = {
    name: "Crowd",
    image: BystanderImage,
};

const tauromacisFight: SceneEncounter = {
    waves: [
        {
            enemies: [null, null, tauromacis, null, null],
        },
    ],
    type: BATTLE_TYPES.ELITE_ENCOUNTER,
    disableItemRewards: true,
};

const taurospearFight: SceneEncounter = {
    waves: [
        {
            enemies: [null, null, taurospear, null, null],
        },
    ],
    type: BATTLE_TYPES.ELITE_ENCOUNTER,
    disableItemRewards: true,
};

const manjiFight: SceneEncounter = {
    waves: [
        {
            enemies: [null, null, manji, null, null],
        },
    ],
    type: BATTLE_TYPES.ELITE_ENCOUNTER,
    disableItemRewards: true,
};

const ayanFight: SceneEncounter = {
    waves: [
        {
            enemies: [null, null, ayanEnemy, null, null],
        },
    ],
    type: BATTLE_TYPES.ELITE_ENCOUNTER,
    disableItemRewards: true,
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
        top: 345,
        left: 700,
        height: "65px",
    },
    announcer: {
        top: 36,
        left: 300,
    },
    opponent: {
        left: 250,
        bottom: 194,
        transform: "scaleX(-1)",
    },
    bystander1: {
        right: 100,
        bottom: 410,
    },
    bystander2: {
        right: 200,
        bottom: 345,
    },
    bystander3: {
        transform: "scaleX(-1)",
        top: 108,
        left: 100,
    },
    bystander4: {
        transform: "scaleX(-1)",
        top: 105,
        left: 200,
    },
    bystander5: {
        transform: "scaleX(-1)",
        top: 107,
        left: 130,
    },
    bystander6: {
        transform: "scaleX(-1)",
        top: 101,
        left: 264,
    },
    bystander7: {
        transform: "scaleX(-1)",
        top: 98,
        left: 360,
    },
    dancesWithBalrog: {
        right: 275,
        bottom: 345,
    },
});

const ArenaBackdrop = ({
    player,
    showTauromacis,
    showManji,
    showTaurospear,
    showAyan,
}: {
    player: Player;
    showTauromacis?: boolean;
    showManji?: boolean;
    showTaurospear?: boolean;
    showAyan?: boolean;
}) => {
    const classes = useStyles();

    return (
        <div className={classes.root}>
            <img src={PerionArenaFullImage} alt="Arena" className={classes.backdrop} />
            <img src={player.image} alt="Player" className={classNames(classes.player, classes.character)} />
            <img src={BystanderImage} alt="Bystander" className={classNames(classes.bystander1, classes.character)} />
            <img src={BystanderImage} alt="Bystander" className={classNames(classes.bystander2, classes.character)} />
            <img src={BystanderImage} alt="Bystander" className={classNames(classes.bystander3, classes.character)} />
            <img src={BystanderImage} alt="Bystander" className={classNames(classes.bystander4, classes.character)} />
            <img src={BystanderImage} alt="Bystander" className={classNames(classes.bystander5, classes.character)} />
            <img src={BystanderImage} alt="Bystander" className={classNames(classes.bystander6, classes.character)} />
            <img src={BystanderImage} alt="Bystander" className={classNames(classes.bystander7, classes.character)} />
            <img src={announcer.image} alt="Announcer" className={classNames(classes.announcer, classes.character)} />
            <Tooltip placement="top" title="..." open={true} PopperProps={{ disablePortal: true }}>
                <img
                    src={DancesWithBalrogSittingImage}
                    alt="Dances With Balrog"
                    className={classNames(classes.dancesWithBalrog, classes.character)}
                />
            </Tooltip>
            {showTaurospear && <img src={taurospear.image} alt="Taurospear" className={classNames(classes.opponent, classes.character)} />}
            {showTauromacis && <img src={tauromacis.image} alt="Tauromacis" className={classNames(classes.opponent, classes.character)} />}
            {showManji && <img src={manji.image} alt="Manji" className={classNames(classes.opponent, classes.character)} />}
            {showAyan && <img src={ayanEnemy.image} alt="Ayan" className={classNames(classes.opponent, classes.character)} />}
        </div>
    );
};

const ayanScript = [
    {
        scene: (other) => <ArenaBackdrop showAyan={true} {...other} />,
        speaker: announcer,
        dialog: ["Next up! A decade ago, she appeared at the gates without any memories and without a tribe..."],
    },
    {
        speaker: announcer,
        dialog: [
            "Yet, since coming of age, she quickly rose to become one of Perion's greatest warriors, and is esteemed by the chieftain himself. Our very own Ayan!",
        ],
    },
    {
        speaker: announcer,
        dialog: ["Our brave mushroom challenger is in for a match!"],
    },
    {
        speaker: crowd,
        dialog: ["[The crowd cries out in excitement, arms raised.]"],
    },
    {
        speaker: ayanEnemy,
        dialog: ["Hello there. I watched you defeat that overgrown bull. I expect you'll give me a challenge."],
    },
    {
        speaker: ayanEnemy,
        dialog: ["Ready or not...!"],
        responses: [
            {
                text: "Ready.",
                encounter: ayanFight,
            },
        ],
    },
];

const manjiScript = [
    {
        scene: (other) => <ArenaBackdrop showManji={true} {...other} />,
        speaker: announcer,
        dialog: [
            "Next up! Heralding from the peaks of the eastern rocky mountains, our next contestant is the distinguished swordsman Manji!",
        ],
    },
    {
        speaker: announcer,
        dialog: ["He's on a relentless quest to be the strongest swordsman in all of Victoria. Some say he's already earned the title!"],
    },
    {
        speaker: announcer,
        dialog: ["Our brave mushroom challenger is in for a match!"],
    },
    {
        speaker: manji,
        dialog: ["I see you, Seeker. You are but a stepping stone on my path."],
    },
    {
        speaker: manji,
        dialog: ["Prepare yourself."],
        responses: [
            {
                text: "Prepare.",
                encounter: manjiFight,
            },
        ],
    },
    {
        speaker: manji,
        dialog: ["Impossible.", "I've struck down so many of your kind, but here I find myself bested."],
    },
    {
        speaker: announcer,
        dialog: ["Manji has been defeated!!", "The champion today is a mushroom that came from nowhere. What an incredible show!"],
    },
    {
        speaker: announcer,
        dialog: ["To the winner goes the spoils!"],
    },
    {
        speaker: announcer,
        dialog: ["To the winner goes the spoils!"],
        treasureBox: {
            isOpen: true,
            isCursed: true,
        },
    },
    {
        scene: ArenaBackdrop,
        speaker: announcer,
        dialog: [
            "That's it for today, folks! Come back again for more nail-biting fights among the island's bravest and strongest contestants as they strive to take the championship!",
        ],
    },
    {
        speaker: crowd,
        dialog: ["[The crowd roars.]"],
        responses: [
            {
                text: "Time to go.",
                isExit: true,
            },
        ],
    },
];

export const arenaScene: EventScene = {
    id: "perion-arena",
    script: [
        {
            scene: (other) => <ArenaBackdrop {...other} />,
            speaker: announcer,
            dialog: [
                "[The announcer's voice blares from a megaphone.] Hang onto your seats folks, or the coming match will knock you clean out of it!",
            ],
        },
        {
            speaker: announcer,
            dialog: ["Are you ready?"],
            conditionalNext: [
                {
                    conditions: [
                        {
                            chance: 0.5,
                        },
                    ],
                    next: [
                        {
                            scene: (other) => <ArenaBackdrop showTauromacis={true} {...other} />,

                            speaker: announcer,
                            dialog: [
                                "Are you ready?",
                                "On the left, from the depths of the Ant Tunnel, a creature cursed by Balrog itself, we have the fearsome Tauromacis!",
                            ],
                        },
                        {
                            speaker: announcer,
                            dialog: [
                                "It's weaker without its brother-in-arms the Taurospear, but not to be underestimated!",
                                "Countless over-arrogant opponents have been gored by its horns and trampled by its hooves. That pronged staff has laid low many a would-be champion in this arena!",
                            ],
                        },
                        {
                            speaker: crowd,
                            dialog: ["[The crowd roars.]"],
                        },
                        {
                            speaker: announcer,
                            dialog: ["And on the right, the Tauromacis' challenger today is the equally-fierce and mighty...", "..."],
                        },
                        {
                            speaker: announcer,
                            dialog: ["Mushroom? Who let a mushroom in here!?"],
                        },
                        {
                            speaker: crowd,
                            dialog: ["[The crowd boos.]"],
                        },
                        {
                            speaker: announcer,
                            dialog: ["Alright, looks like mushroom soup is on the appetizer menu tonight. Let the battle commence!"],
                        },
                        {
                            speaker: tauromacis,
                            dialog: [
                                "Hmph. Looks like you've wandered into the wrong place.",
                                "Whatever your circumstances, I've fought too long to stop here. I will regain my freedom!",
                            ],
                            responses: [
                                {
                                    text: "Defend yourself.",
                                    encounter: tauromacisFight,
                                    next: [
                                        {
                                            speaker: announcer,
                                            scene: ArenaBackdrop,
                                            dialog: [
                                                "Wha--what an upset! The monster king of the arena has lost its crown to a mushroom! Have you ever seen a mushroom do anything besides run and jump!?",
                                            ],
                                        },
                                        {
                                            speaker: crowd,
                                            dialog: [
                                                "[The crowd leaps to their feet and screams. You can't tell if they're angry or elated.]",
                                            ],
                                        },
                                        {
                                            speaker: announcer,
                                            dialog: ["Next up!"], // Fix me: This is skipped due to the way conditionalNext is processed
                                            conditionalNext: [
                                                {
                                                    conditions: [
                                                        {
                                                            chance: 0.5,
                                                        },
                                                    ],
                                                    next: manjiScript,
                                                },
                                                {
                                                    conditions: [],
                                                    next: ayanScript,
                                                },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
                {
                    conditions: [],
                    next: [
                        {
                            scene: (other) => <ArenaBackdrop showTaurospear={true} {...other} />,

                            speaker: announcer,
                            dialog: [
                                "Are you ready?",
                                "On the left, from the depths of the Ant Tunnel, a creature cursed by Balrog itself, we have the fearsome Taurospear!",
                            ],
                        },
                        {
                            speaker: announcer,
                            dialog: [
                                "It's weaker without its brother-in-arms the Tauromacis, but not to be underestimated!",
                                "Countless over-arrogant opponents have been gored by its horns and trampled by its hooves. That spear has pierced through the armor of many a would-be champion in this arena!",
                            ],
                        },
                        {
                            speaker: crowd,
                            dialog: ["[The crowd roars.]"],
                        },
                        {
                            speaker: announcer,
                            dialog: ["And on the right, the Taurospear's challenger today is the equally-fierce and mighty...", "..."],
                        },
                        {
                            speaker: announcer,
                            dialog: ["Mushroom? Who let a mushroom in here!?"],
                        },
                        {
                            speaker: crowd,
                            dialog: ["[The crowd boos.]"],
                        },
                        {
                            speaker: announcer,
                            dialog: ["Alright, looks like mushroom soup is on the appetizer menu tonight. Let the battle commence!"],
                        },
                        {
                            speaker: taurospear,
                            dialog: ["I will show you no mercy."],
                            responses: [
                                {
                                    text: "Defend yourself.",
                                    encounter: taurospearFight,
                                    next: [
                                        {
                                            speaker: taurospear,
                                            dialog: [
                                                "Brother... I wanted nothing more than to enjoy one last Tofu Miso Soup with you...",
                                                "I am sorry...",
                                            ],
                                        },
                                        {
                                            speaker: announcer,
                                            scene: ArenaBackdrop,
                                            dialog: [
                                                "Wha--what an upset! The monster king of the arena has lost its crown to a mushroom! Have you ever seen a mushroom do anything besides run and jump!?",
                                            ],
                                        },
                                        {
                                            speaker: crowd,
                                            dialog: [
                                                "[The crowd leaps to their feet and screams. You can't tell if they're angry or elated.]",
                                            ],
                                        },
                                        {
                                            speaker: announcer,
                                            dialog: ["Next up!"], // Fix me: This is skipped due to the way conditionalNext is processed
                                            conditionalNext: [
                                                {
                                                    conditions: [
                                                        {
                                                            chance: 0.5,
                                                        },
                                                    ],
                                                    next: manjiScript,
                                                },
                                                {
                                                    conditions: [],
                                                    next: ayanScript,
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
