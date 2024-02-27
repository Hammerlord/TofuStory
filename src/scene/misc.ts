import { thorns } from "../ability/Effects";
import { Minion } from "../ability/types";
import { STRANGE_ENCOUNTER_MUSIC } from "../battle/constants";
import { BATTLE_TYPES } from "../battle/types";
import { eventBandit, mesoThief, mimic, noobA } from "../enemy/enemy";
import { GuardBanditImage, TreasureChestImage } from "../images";
import { blueJeanShorts, leatherSandals, mesoItem, redHeadband, sword, tShirt } from "../item/items";
import { EventScene, SCENE_CONDITION_TYPES, SceneEncounter } from "./types";

export const mesoThiefScene: EventScene = {
    id: "wanted-poster",
    conditions: [
        {
            type: SCENE_CONDITION_TYPES.INFAMY,
            comparator: "gt",
            value: 3,
        },
    ],
    repeatable: true,
    script: [
        {
            speaker: mesoThief,
            dialog: ["Gimme all your mesos!"],
            responses: [
                {
                    text: "Defend yourself.",
                    encounter: {
                        waves: [{ enemies: [null, null, mesoThief, null, null] }],
                        backgroundMusic: STRANGE_ENCOUNTER_MUSIC,
                    },
                },
            ],
        },
    ],
};

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
            speaker: treasureBox,
            dialog: [
                "[In the middle of a clearing, you spot an old-looking treasure chest. It seems unassuming, but when you look more closely, the chest is surrounded by a sickly aura.",
                "Not only that, half-buried bones are jutting from the dirt next to it.",
                "What do you do?]",
            ],
            responses: [
                {
                    text: "Try to open the cursed chest.",
                    next: [
                        {
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
                            speaker: noobA,
                            dialog: ["[A beginner enters the clearing and eagerly runs toward the chest.]", "Cool, a treasure box!"],
                        },
                        {
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
                                            dialog: [
                                                "Aieeeee!",
                                                "[There's clearly some cursed force reacting to unwitting treasure hunters, as the beginner abruptly drops dead.]",
                                            ],
                                        },
                                        {
                                            speaker: treasureBox,
                                            dialog: ["[The treasure box sits there menacingly...]"],
                                        },
                                        {
                                            speaker: eventBandit,
                                            dialog: ["Well, well, well, is it my turn now?"],
                                        },
                                        {
                                            speaker: eventBandit,
                                            dialog: [
                                                "Silly noobs should've been bandits. Nobody beats a bandit at treasure hunting. Let's see here...",
                                                "[The bandit fiddles with the lock...]",
                                            ],
                                        },
                                        {
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
                                                            dialog: [
                                                                "WTF? My treasure box! You stealer! Well, I'm a stealer, too, but--bah!",
                                                            ],
                                                        },
                                                        {
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
                                                            speaker: eventBandit,
                                                            dialog: ["[The bandit saunters away, whistling.]"],
                                                        },
                                                        {
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
                                            speaker: noobA,
                                            dialog: ["Aieeeee!"],
                                        },
                                        {
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
                                                    text: "[That looks dangerous. Maybe you can check the area for anything useful, and then get out of here.]",
                                                    next: [
                                                        {
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
