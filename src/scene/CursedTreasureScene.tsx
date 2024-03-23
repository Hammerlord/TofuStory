import classNames from "classnames";
import { BATTLE_TYPES } from "../battle/types";
import { eventBandit, mimic, noobA } from "../enemy/enemy";
import { GuardBanditImage, RockyRoad2Image, RockyRoadImage, TreasureChestImage } from "../images";
import { blueJeanShorts, leatherSandals, mesoItem, redHeadband, sword, tShirt } from "../item/items";
import { EventScene, SCENE_CONDITION_TYPES, SceneEncounter } from "./types";
import { createUseStyles } from "react-jss";
import { SCENE_STYLES } from "./constants";

const treasureBox = {
    image: TreasureChestImage,
    name: "Treasure Box",
};

const mimicFight: SceneEncounter = {
    waves: [
        {
            enemies: [null, null, mimic, null, null],
            generateEliteAffixes: true,
        },
    ],
    type: BATTLE_TYPES.ELITE_ENCOUNTER,
};

const banditFight: SceneEncounter = {
    waves: [
        {
            enemies: [null, null, eventBandit, null, null],
        },
    ],
};

const useStyles = createUseStyles({
    ...SCENE_STYLES,
    player: {
        ...SCENE_STYLES.player,
        top: 430,
        left: 549,
    },
    noobA: {
        top: 206,
        left: 300,
        transform: "scaleX(-1)",
    },
    "@keyframes cursed": {
        "0%": {
            filter: "brightness(0.5) drop-shadow(0 0 5px purple) drop-shadow(0 0 3px purple)",
        },
        "100%": {
            filter: "brightness(0.25) drop-shadow(0 0 10px purple) drop-shadow(0 0 5px purple)",
        },
    },
    cursed: {
        animationDuration: "2s",
        animationName: "$cursed",
        transitionTimingFunction: "ease-in-out",
        animationIterationCount: "infinite",
        animationDirection: "alternate",
    },
    chest: {
        transform: "scaleX(-1)",
        width: 75,
        position: "absolute",
        left: 736,
        top: 194,
    },
    dead: {
        filter: "brightness(0.25)",
    },
    bandit: {
        top: 192,
        left: 300,
        transform: "scaleX(-1)",
    },
    moved: {
        top: 194,
        left: 695,
    },
    banditMoved: {
        top: 181,
        left: 695,
    },
    playerMoved: {
        top: 196,
        left: 645,
    },
    intercepted: {
        transform: "unset",
    },
    playerInterceptBandit: {
        top: 260,
        left: 549,
    },
});

const CursedTreasureBackdrop = ({
    player,
    showBeginner = false,
    showBandit = false,
    beginnerMoved = false,
    beginnerDead = false,
    playerMoved = false,
    banditMoved = false,
    playerInterceptBandit = false,
    curseDispelled = false,
    showChest = true,
}) => {
    const classes = useStyles();
    return (
        <div>
            <img src={RockyRoad2Image} alt="Rocky Road" className={classes.backdrop} />
            {showChest && (
                <img
                    src={TreasureChestImage}
                    alt="Treasure Chest"
                    className={classNames(classes.chest, {
                        [classes.cursed]: !curseDispelled,
                    })}
                />
            )}
            {showBeginner && (
                <img
                    src={noobA.image}
                    alt="Bob"
                    className={classNames(classes.character, classes.noobA, {
                        [classes.moved]: beginnerMoved,
                        [classes.dead]: beginnerDead,
                    })}
                />
            )}
            <img
                src={player.image}
                alt="Player"
                className={classNames(classes.character, classes.player, {
                    [classes.playerMoved]: playerMoved,
                    [classes.playerInterceptBandit]: playerInterceptBandit,
                })}
            />
            {showBandit && (
                <img
                    src={GuardBanditImage}
                    alt="Bandit"
                    className={classNames(classes.character, classes.bandit, {
                        [classes.banditMoved]: banditMoved || playerInterceptBandit,
                        [classes.intercepted]: playerInterceptBandit,
                        [classes.dead]: playerInterceptBandit,
                    })}
                />
            )}
        </div>
    );
};

export const cursedChestScene: EventScene = {
    id: "cursed-chest-adventurers",
    conditions: [
        {
            type: SCENE_CONDITION_TYPES.INFAMY,
            comparator: "gt",
            value: 6,
        },
    ],
    script: [
        {
            scene: CursedTreasureBackdrop,
            speaker: treasureBox,
            dialog: [
                "[You spot an old-looking treasure chest. It seems unassuming at first glance, but when you look again, the chest is surrounded by a sickly aura.",
                "Not only that, half-buried bones are jutting from the dirt next to it.",
                "What do you do?]",
            ],
            responses: [
                {
                    text: "Try to open the cursed chest.",
                    next: [
                        {
                            scene: (other) => <CursedTreasureBackdrop playerMoved={true} {...other} />,
                            dialog: ["..."],
                            treasureBox: {
                                isOpen: false,
                                isCursed: true,
                            },
                        },
                        {
                            dialog: [
                                "[Something tells you that isn't the last of those chests you'll see... Who places curses on treasure boxes, and what is their goal?]",
                            ],
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
                    text: "Wait and see what happens.",
                    next: [
                        {
                            scene: (other) => <CursedTreasureBackdrop showBeginner={true} {...other} />,
                            speaker: noobA,
                            dialog: ["Cool, a treasure box!"],
                        },
                        {
                            speaker: noobA,
                            dialog: ["The beginner eagerly runs toward the chest.]"],
                        },
                        {
                            scene: (other) => <CursedTreasureBackdrop showBeginner={true} beginnerMoved={true} {...other} />,
                            speaker: noobA,
                            dialog: ["Come on, come on, give me Steelies!", "[The beginner fiddles with the lock...]"],
                        },
                        {
                            speaker: noobA,
                            // TODO this gets skipped by conditionalNext
                            dialog: ["[The beginner fiddles with the lock...]"],
                            conditionalNext: [
                                {
                                    conditions: [
                                        {
                                            chance: 0.5,
                                        },
                                    ],
                                    next: [
                                        {
                                            speaker: treasureBox,
                                            dialog: ["[In response to the beginner's meddling, the treasure box flashes purple.]"],
                                        },
                                        {
                                            speaker: noobA,
                                            scene: (other) => (
                                                <CursedTreasureBackdrop
                                                    showBeginner={true}
                                                    beginnerMoved={true}
                                                    beginnerDead={true}
                                                    {...other}
                                                />
                                            ),
                                            dialog: [
                                                "Aieeeee!",
                                                "[There's clearly some cursed force reacting to unwitting treasure hunters, as the beginner abruptly drops dead.]",
                                            ],
                                        },
                                        {
                                            scene: (other) => <CursedTreasureBackdrop {...other} />,
                                            speaker: treasureBox,
                                            dialog: ["[The treasure box sits there menacingly...]"],
                                        },
                                        {
                                            scene: (other) => <CursedTreasureBackdrop showBandit={true} {...other} />,
                                            speaker: eventBandit,
                                            dialog: ["Well, well, well, is it my turn now?"],
                                        },
                                        {
                                            scene: (other) => <CursedTreasureBackdrop showBandit={true} banditMoved={true} {...other} />,
                                            speaker: eventBandit,
                                            dialog: [
                                                "Silly noobs should've been bandits. Nobody beats a bandit at treasure hunting. Let's see here...",
                                                "[The bandit fiddles with the lock...]",
                                            ],
                                        },
                                        {
                                            scene: (other) => (
                                                <CursedTreasureBackdrop
                                                    showBandit={true}
                                                    banditMoved={true}
                                                    curseDispelled={true}
                                                    {...other}
                                                />
                                            ),
                                            speaker: treasureBox,
                                            dialog: ["[After a moment, the treasure box lock clicks and the sickly aura fades away.]"],
                                        },
                                        {
                                            speaker: eventBandit,
                                            dialog: ["Ha! Who's the best?"],
                                            responses: [
                                                {
                                                    text: "Intercept the bandit before he can open the chest.",
                                                    infamy: 3,
                                                    encounter: banditFight,
                                                    next: [
                                                        {
                                                            speaker: eventBandit,
                                                            scene: (other) => (
                                                                <CursedTreasureBackdrop
                                                                    showBandit={true}
                                                                    playerInterceptBandit={true}
                                                                    curseDispelled={true}
                                                                    {...other}
                                                                />
                                                            ),
                                                            dialog: [
                                                                "WTF? My treasure box! You stealer! Well, I'm a stealer, too, but--bah!",
                                                            ],
                                                        },
                                                        {
                                                            scene: (other) => (
                                                                <CursedTreasureBackdrop
                                                                    playerInterceptBandit={true}
                                                                    curseDispelled={true}
                                                                    {...other}
                                                                />
                                                            ),
                                                            speaker: eventBandit,
                                                            dialog: ["[Without another word, the bandit's ghost vanishes.]"],
                                                        },
                                                        {
                                                            dialog: ["[What's in the box?]"],
                                                            treasureBox: {
                                                                isOpen: true,
                                                                isCursed: true,
                                                            },
                                                        },
                                                        {
                                                            dialog: ["[That seems to be all there is.]"],
                                                            responses: [
                                                                {
                                                                    text: "Time to go.",
                                                                    isExit: true,
                                                                },
                                                            ],
                                                        },
                                                    ],
                                                },
                                                {
                                                    text: "[Wait for the bandit to leave.]",
                                                    next: [
                                                        {
                                                            speaker: eventBandit,
                                                            dialog: [
                                                                "That's right, I am! Show me the goods, treasure box!",
                                                                "...",
                                                                "Sweet, Steelies!",
                                                            ],
                                                        },
                                                        {
                                                            scene: (other) => <CursedTreasureBackdrop showChest={false} {...other} />,
                                                            speaker: eventBandit,
                                                            dialog: ["[The bandit saunters away, whistling.]"],
                                                        },
                                                        {
                                                            scene: (other) => (
                                                                <CursedTreasureBackdrop showChest={false} playerMoved={true} {...other} />
                                                            ),
                                                            dialog: [
                                                                "[With the bandit gone, you scope out the area. Something was left behind by one of the Mimic's victims...]",
                                                            ],
                                                            items: {
                                                                itemPool: [
                                                                    leatherSandals,
                                                                    tShirt,
                                                                    sword,
                                                                    redHeadband,
                                                                    blueJeanShorts,
                                                                    mesoItem,
                                                                ],
                                                                amount: 1,
                                                            },
                                                        },
                                                        {
                                                            dialog: ["[That seems to be all there is.]"],
                                                            responses: [
                                                                {
                                                                    text: "Time to go.",
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
                                {
                                    conditions: [],
                                    next: [
                                        {
                                            speaker: treasureBox,
                                            dialog: [
                                                "[The treasure box lid yawns open... to reveal a pitch-black void and gnashing teeth!]",
                                            ],
                                        },
                                        {
                                            scene: (other) => (
                                                <CursedTreasureBackdrop
                                                    showBeginner={true}
                                                    beginnerMoved={true}
                                                    beginnerDead={true}
                                                    {...other}
                                                />
                                            ),
                                            speaker: noobA,
                                            dialog: ["Aieeeee!"],
                                        },
                                        {
                                            scene: (other) => <CursedTreasureBackdrop {...other} />,
                                            speaker: treasureBox,
                                            dialog: [
                                                "[The Mimic snaps up the beginner, who promptly disappears into its dark depths screaming.",
                                                "With the beginner gone, the treasure box sits there motionless once more...]",
                                            ],
                                            responses: [
                                                {
                                                    text: "Fight the Mimic.",
                                                    encounter: mimicFight,
                                                    next: [
                                                        {
                                                            scene: (other) => <CursedTreasureBackdrop playerMoved={true} {...other} />,
                                                            dialog: ["[The Mimic defeated, you search the area for anything else useful.]"],
                                                        },
                                                        {
                                                            dialog: ["[Something was left behind by one of the Mimic's victims.]"],
                                                            items: {
                                                                itemPool: [
                                                                    leatherSandals,
                                                                    tShirt,
                                                                    sword,
                                                                    redHeadband,
                                                                    blueJeanShorts,
                                                                    mesoItem,
                                                                ],
                                                                amount: 1,
                                                            },
                                                        },
                                                        {
                                                            dialog: ["..."],
                                                            responses: [
                                                                {
                                                                    text: "Time to go.",
                                                                    isExit: true,
                                                                },
                                                            ],
                                                        },
                                                    ],
                                                },
                                                {
                                                    text: "[That looks dangerous. Maybe you can check for anything useful, and then get out of here.]",
                                                    next: [
                                                        {
                                                            scene: (other) => <CursedTreasureBackdrop playerMoved={true} {...other} />,
                                                            dialog: [
                                                                "[You search the area.",
                                                                "Yes, something was left behind by one of the Mimic's victims.]",
                                                            ],
                                                            items: {
                                                                itemPool: [
                                                                    leatherSandals,
                                                                    tShirt,
                                                                    sword,
                                                                    redHeadband,
                                                                    blueJeanShorts,
                                                                    mesoItem,
                                                                ],
                                                                amount: 1,
                                                            },
                                                        },
                                                        {
                                                            dialog: ["..."],
                                                        },
                                                        {
                                                            dialog: ["[The treasure box continues to be motionless. Search again?]"],
                                                            responses: [
                                                                {
                                                                    text: "Search the area.",
                                                                    next: [
                                                                        {
                                                                            dialog: [
                                                                                "You search the area for anything else that might be useful...",
                                                                            ],
                                                                            conditionalNext: [
                                                                                {
                                                                                    conditions: [
                                                                                        {
                                                                                            chance: 0.5,
                                                                                        },
                                                                                    ],
                                                                                    next: [
                                                                                        {
                                                                                            speaker: treasureBox,
                                                                                            dialog: [
                                                                                                "The Mimic comes alive and attacks you!",
                                                                                            ],
                                                                                            responses: [
                                                                                                {
                                                                                                    text: "Defend yourself.",
                                                                                                    encounter: mimicFight,
                                                                                                },
                                                                                            ],
                                                                                        },
                                                                                    ],
                                                                                },
                                                                                {
                                                                                    conditions: [],
                                                                                    next: [
                                                                                        {
                                                                                            dialog: ["[You find something.]"],
                                                                                            items: {
                                                                                                itemPool: [
                                                                                                    leatherSandals,
                                                                                                    tShirt,
                                                                                                    sword,
                                                                                                    redHeadband,
                                                                                                    blueJeanShorts,
                                                                                                    mesoItem,
                                                                                                ],
                                                                                                amount: 1,
                                                                                            },
                                                                                        },
                                                                                        {
                                                                                            dialog: [
                                                                                                "[That seems to be all there is. You escape the area safely.]",
                                                                                            ],
                                                                                            responses: [
                                                                                                {
                                                                                                    text: "Leave.",
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
                                                                {
                                                                    text: "Might be pushing it. Let's leave.",
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
