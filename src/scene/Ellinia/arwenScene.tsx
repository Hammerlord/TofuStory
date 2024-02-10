import { REGIONS } from "../../Map/regions";
import { ACTION_TYPES, EFFECT_CLASSES, EFFECT_TYPES, MORPH_TYPES, Minion, TARGET_TYPES } from "../../ability/types";
import { lostEcho, lostGuardEcho, lostNobleEcho } from "../../enemy/echoes";
import { lifeLink } from "../../enemy/effect";
import { lupin, malady, zombieLupin } from "../../enemy/enemy";
import { faust, ghostlyPuppeteerL, ghostlyPuppeteerR } from "../../enemy/faust";
import { AltForestBG2Image, AltForestBGImage, ArwenTheFairyImage, ElliniaBGImage, RowenTheFairyImage } from "../../images";
import { glassShoe } from "../../item/items";
import { Scene, ScriptNode } from "../types";
import {
    ArwenIntroScene,
    DarkForest1,
    DarkForest2,
    DarkForestMaladies,
    LupinForest,
    LupinForest2,
    LupinForest3,
    LupinForest4,
    LupinForestMaladies,
    TombstonesTwilitForest,
    TombstonesTwilitForestFairies,
    TwilitForest,
    TwilitForest2,
    TwilitForest3,
    TwilitForest4,
} from "./ArwenBackdrops";
import DimPath from "./DimPath";
import FollowFairies from "./FollowFairies";
import Tombstones from "./Tombstones";

const arwen = {
    name: "Arwen the Fairy",
    image: ArwenTheFairyImage,
};

const rowen = {
    name: "Rowen the Fairy",
    image: RowenTheFairyImage,
};

const sickLupin: Minion = {
    ...lupin,
    effects: [
        {
            name: "Infected",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.NONE,
            onWaveStart: {
                ability: {
                    name: "Mutate",
                    actions: [
                        {
                            target: TARGET_TYPES.SELF,
                            type: ACTION_TYPES.EFFECT,
                            morph: {
                                type: MORPH_TYPES.MAP,
                                minions: [
                                    {
                                        minion: zombieLupin,
                                    },
                                ],
                            },
                        },
                    ],
                },
            },
        },
    ],
};

const lupinFight = {
    characters: [],
    waves: [
        {
            enemies: [null, null, sickLupin, null, null],
        },
    ],
};

const eventZombieLupin: Minion = {
    ...zombieLupin,
    isElite: true,
    effects: [...zombieLupin.effects, lifeLink],
};

const zombieLupinsFight = {
    characters: [],
    waves: [
        {
            enemies: [null, eventZombieLupin, eventZombieLupin, eventZombieLupin, null],
        },
    ],
};

const echoesFight = {
    characters: [],
    waves: [
        {
            enemies: [lostEcho, lostGuardEcho, lostNobleEcho, lostGuardEcho, lostEcho],
        },
    ],
};

const maladysFight = {
    characters: [],
    waves: [
        {
            enemies: [null, malady, null, malady, null],
        },
    ],
};

const aVoice = {
    ...malady,
    name: "A Voice",
};

const faustFight = {
    characters: [],
    waves: [
        {
            enemies: [ghostlyPuppeteerL, null, faust, null, ghostlyPuppeteerR],
            winCondition: {
                defeatBoss: true,
            },
        },
    ],
};

const glassShoeDialog = [
    {
        loseItems: [glassShoe.name],
        dialog: ["[You return the glass shoe to Arwen.]"],
    },
    {
        speaker: arwen,
        dialog: [
            "Arwen is most grateful! The glass shoe one has returned is very precious to Arwen.",
            "It was given to Arwen by her mother, one called Gwen.",
            "Oneself cannot thank one enough. Is one called by a name?",
        ],
        responses: [
            {
                text: "I don't remember my name.",
                next: [
                    {
                        speaker: arwen,
                        dialog: [
                            "Might oneself call one Gwestyl, then? A brave one from fairy legend is called such.",
                            "Gwestyl has Arwen's deepest gratitude.",
                        ],
                    },
                    {
                        speaker: rowen,
                        dialog: [
                            "Rowen believes that Lord Grendel will be glad to receive one's audience after one's deeds. Let oneselves inform him now.",
                        ],
                    },
                    {
                        dialog: ["[Arwen and Rowen zip off.]"],
                    },
                ],
            },
            {
                text: "Uh... 'Mushroom' will do.",
                next: [
                    {
                        speaker: arwen,
                        dialog: ["Mushroom has Arwen's deepest gratitude."],
                    },
                    {
                        speaker: rowen,
                        dialog: [
                            "Rowen believes that Lord Grendel will be glad to receive one's audience after one's deeds. Let oneselves inform him now.",
                        ],
                    },
                    {
                        dialog: ["[Arwen and Rowen zip off.]"],
                    },
                ],
            },
        ],
    },
];

const endingDialog = [
    {
        scene: ArwenIntroScene,
        speaker: arwen,
        dialog: ["Ah, an adventuring one has returned!"],
    },
    {
        speaker: rowen,
        dialog: [
            "Oneselves sensed much of the darkness recede after you left. One has done far better than most ones.",
            "Rowen and Arwen are grateful.",
            "Though oddly, oneself feels a sense of loss.",
        ],
        responses: [
            {
                text: "I found your glass shoe.",
                next: glassShoeDialog,
            },
            {
                text: "Who is Erylen?",
                next: [
                    {
                        speaker: arwen,
                        dialog: ["How did one hear about Erylen?"],
                    },
                    {
                        speaker: rowen,
                        dialog: [
                            "Was it those evil ones called Malady? Their words are corrupt, and it is a good thing most adventuring ones cannot comprehend their lies.",
                        ],
                    },
                    {
                        speaker: arwen,
                        dialog: ["Yes, yes. Please pay the ones called Malady no mind."],
                        responses: [
                            {
                                text: "Okay. I found your glass shoe, by the way.",
                                next: glassShoeDialog,
                            },
                            {
                                text: "[Tell Arwen and Rowen what Malady said about their bitter history.]",
                                next: [
                                    {
                                        speaker: rowen,
                                        dialog: [
                                            "It's not true. Lord Grendel loved virtuous Queen Erylen, as did all oneselves so many years ago. The evil ones who call themselves Malady are the treacherous ones, concocting such a curse like that to attack innocent ones.",
                                        ],
                                    },
                                    {
                                        speaker: arwen,
                                        dialog: [
                                            "The ones called Malady have no business pretending to have been close to Erylen. Best that one forgets this terrible exchange ever happened!",
                                        ],
                                    },
                                    {
                                        speaker: rowen,
                                        dialog: [
                                            "Arwen is right. Oneself believes that Lord Grendel will be glad to receive one's audience after one's deeds. Let oneselves inform him now.",
                                        ],
                                    },
                                    {
                                        dialog: ["[Arwen and Rowen zip off.]"],
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

const maladyDialog: ScriptNode[] = [
    {
        speaker: aVoice,
        dialog: ["Eheeheehee! Ohohoho!"],
    },
    {
        speaker: aVoice,
        dialog: ["Send another one, did the fools? It seems they have no shortage of useful idiots!"],
        responses: [
            {
                text: "Who are you?",
                next: [
                    {
                        speaker: malady,
                        dialog: ["The pawn may call us Malady. Eheehee!"],
                    },
                    {
                        speaker: malady,
                        dialog: [
                            "We know what the pawn is thinking--that we are Malady, we must be the ones behind the curse. Is that what the treacherous fools said?",
                            "Bolder adventurers have made loud, stupid proclamations about it. All have died the same.",
                        ],
                    },
                    {
                        scene: DarkForestMaladies,
                        speaker: malady,
                        dialog: [
                            "[The Malady swoop down.] Hmm! What's this we spy with our little eye? They sent a seeker. An unusual one who could almost pass as human to a less discerning gaze... Did they know?",
                        ],
                    },
                    {
                        speaker: malady,
                        dialog: [
                            "Heehee, yet it is true, who are we to say if that matters, seeker or human? Seekers are stupid and greedy to the last, just like adventurers. No difference in any important way.",
                        ],
                        responses: [
                            {
                                text: "So you... Malady... aren't seekers, or human, I take it.",
                                next: [
                                    {
                                        speaker: malady,
                                        dialog: [
                                            "We, Malady, were warped long ago. Yes, monsters we are; monsters Malady shall be.",
                                            "We did not create the curse that plagues the forest heart. But the curse creates us instruments to exact misery on those fools. A fitting use for a terrible thing.",
                                        ],
                                    },
                                    {
                                        speaker: malady,
                                        dialog: [
                                            "The one you defeated we lovingly called Faust. He slew countless adventurers before you.",
                                            "Call us monstrous ones for his creation, if the hypocrites will. At least we do not hide it behind sparkles and glitter. Heehee!",
                                        ],
                                    },
                                    {
                                        speaker: malady,
                                        dialog: [
                                            "Now shall the pawn pay for opposing us. We, Malady, consign this seeker to wander these forests forevermore.",
                                            "Abracadabra, kapish and kapoosh!",
                                        ],
                                    },
                                    {
                                        scene: TwilitForest,
                                        background: AltForestBGImage,
                                        region: REGIONS.HIDDEN_FOREST,
                                        dialog: [
                                            "[The world shifts. Suddenly, you find yourself surrounded by unfamiliar trees and foliage, Malady nowhere in sight. A pall of shadow hangs all around you.]",
                                        ],
                                    },
                                    {
                                        speaker: malady,
                                        dialog: [
                                            "[Malady's voices echo around the trees.]",
                                            "Ohoho! Malady are monstrous, but we are not merciless. There is a way out to be found. If the pawn is not idiotic, then escape is possible.",
                                        ],
                                    },
                                    {
                                        dialog: [
                                            "[Silence falls. Is there a reason Malady haven't confronted you directly? They also don't seem upset that you killed their creation.]",
                                        ],
                                    },
                                    {
                                        scene: TwilitForest2,
                                        dialog: [
                                            "[As you venture forward, the path grows unnaturally darker and darker... You won't be able to find your way like this.",
                                        ],
                                    },
                                    {
                                        dialog: [
                                            "[In front of you, something glimmers feebly with old magic, so feebly you almost missed it. Maybe you can restore the light somehow.]",
                                        ],
                                        responses: [
                                            {
                                                text: "Inspect the source of the magic.",
                                                next: [
                                                    {
                                                        puzzle: DimPath,
                                                        dialog: [],
                                                    },
                                                    {
                                                        scene: TwilitForest3,
                                                        background: AltForestBG2Image,
                                                        dialog: ["[The light restored, you can now continue forward.]"],
                                                    },
                                                    {
                                                        speaker: malady,
                                                        dialog: [
                                                            "[Malady's voices echo around the trees.]",
                                                            "Centuries ago, a young, arrogant wizard conducted an experiment using one of the great veins of magic in the forest as his power font. A festering wound opened, though its most devastating effects would not be felt for decades, when most humans had forgotten.",
                                                        ],
                                                    },
                                                    {
                                                        speaker: malady,
                                                        dialog: [
                                                            "But Malady have not forgotten what his ambitions wrought, when we sacrificed so much to prevent catastrophe.",
                                                            "Not least of all, wise and beloved Erylen confronted our pupil for his misdeeds, and was slain for it.",
                                                        ],
                                                    },
                                                    {
                                                        speaker: malady,
                                                        dialog: [
                                                            "Those days are lost. And still the treacherous fools follow. Blind, blind.",
                                                            "Do they know what he does in that library of his?",
                                                        ],
                                                    },
                                                    {
                                                        scene: TwilitForest4,
                                                        dialog: [
                                                            "[You sense yourself being surrounded by strange presences. You can feel their forlorn stares even as they say nothing to you.]",
                                                        ],
                                                    },
                                                    {
                                                        dialog: [
                                                            "[They seem to be echoes, or something thereabouts--they definitely don't seem alive. The echoes manifest into dark, fluttering shapes, like large moths.",
                                                            "They meander closer and closer as if drawn to a flame.",
                                                            "...",
                                                        ],
                                                    },
                                                    {
                                                        dialog: ["Abruptly, the echoes turn hostile, and poise to attack you."],
                                                        responses: [
                                                            {
                                                                text: "Confront them.",
                                                                encounter: echoesFight,
                                                            },
                                                        ],
                                                    },
                                                    {
                                                        scene: TwilitForest3,
                                                        speaker: malady,
                                                        dialog: [
                                                            "[Malady's voices echo around the trees.]",
                                                            "Oh, how long has it been since we met one who could hear us! When the curse spread 500 years ago, it twisted our forms and our voices, especially those of us closest to the source.",
                                                        ],
                                                    },
                                                    {
                                                        speaker: malady,
                                                        dialog: [
                                                            "One of many sacrifices. And what was our reward, but to be spurned, hated?",
                                                        ],
                                                    },
                                                    {
                                                        speaker: malady,
                                                        dialog: ["Is the seeker the same as they are?"],
                                                    },
                                                    {
                                                        scene: TombstonesTwilitForest,
                                                        dialog: [
                                                            "[You come across a small group of ancient grave markers. It appears to be a gravesite.]",
                                                        ],
                                                        responses: [
                                                            {
                                                                text: "Inspect the tombstones.",
                                                                next: [
                                                                    {
                                                                        puzzle: Tombstones,
                                                                        dialog: [],
                                                                    },
                                                                    {
                                                                        speaker: malady,
                                                                        dialog: [
                                                                            "The one called Grendel is an ancient among humans. But we, Malady, were already old before the curse.",
                                                                        ],
                                                                    },
                                                                    {
                                                                        speaker: malady,
                                                                        dialog: [
                                                                            "For all that he believes his age lends him wisdom, he does not know that the magic he craves is not to be tampered with. It is corrosive, and what is corroded cannot be restored.",
                                                                            "Desperate to unravel its secrets, he extends his life over and over. A fool on a fool's errand.",
                                                                        ],
                                                                    },
                                                                    {
                                                                        speaker: malady,
                                                                        dialog: [
                                                                            "Those who joined him are afraid of what he might do if they stand in his way. Nothing more.",
                                                                        ],
                                                                    },
                                                                    {
                                                                        speaker: malady,
                                                                        dialog: ["We, Malady, are not afraid."],
                                                                    },
                                                                    {
                                                                        scene: TombstonesTwilitForestFairies,
                                                                        dialog: [
                                                                            "[The tiny fairy-creatures you saw from the gravesite are now fluttering around you. They seem to be trying to get your attention. Maybe they can help you get out of here.]",
                                                                        ],
                                                                        responses: [
                                                                            {
                                                                                text: "Follow the fairies.",
                                                                                next: [
                                                                                    {
                                                                                        puzzle: FollowFairies,
                                                                                        dialog: [],
                                                                                    },
                                                                                    {
                                                                                        scene: LupinForest,
                                                                                        region: REGIONS.ELLINIA,
                                                                                        background: ElliniaBGImage,
                                                                                        dialog: [
                                                                                            "[You find yourself where you began in the forest, along with a treasure chest.]",
                                                                                        ],
                                                                                    },
                                                                                    {
                                                                                        treasureBox: true,
                                                                                        dialog: [""],
                                                                                    },
                                                                                    {
                                                                                        scene: LupinForestMaladies,
                                                                                        speaker: malady,
                                                                                        dialog: [
                                                                                            "Ohohoho! Well done. It seems the pawn was even able to befriend the lost echoes of fae folk--perhaps the seeker was once one favored by the forest.",
                                                                                            "But time severs most ties, and so it is with us and our kin.",
                                                                                        ],
                                                                                    },
                                                                                    {
                                                                                        speaker: malady,
                                                                                        dialog: [
                                                                                            "But we, Malady, have decided what we are long ago. Twisted, betrayed, shunned. Our will shall not be stopped.",
                                                                                        ],
                                                                                        responses: [
                                                                                            {
                                                                                                text: "Confront Malady.",
                                                                                                encounter: maladysFight,
                                                                                            },
                                                                                        ],
                                                                                    },
                                                                                    {
                                                                                        scene: LupinForest,
                                                                                        speaker: malady,
                                                                                        dialog: [
                                                                                            "The curse will continue on, even if Malady do not.",
                                                                                            "May it swallow the humans whole, along with that creature in his undying skin, who is far more a monster than anything he calls such.",
                                                                                            "A miserable end for what began torturous centuries ago. Eheeheeheehee!",
                                                                                        ],
                                                                                    },
                                                                                    {
                                                                                        dialog: [
                                                                                            "[The monsters known as Malady dissipate into ashes, which are borne away by the wind.",
                                                                                            "Perhaps it's time to return to Ellinia.]",
                                                                                        ],
                                                                                    },
                                                                                    ...endingDialog,
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
                    },
                ],
            },
        ],
    },
];

const lupinsDialog = [
    {
        scene: LupinForest3,
        speaker: zombieLupin,
        dialog: ["[The infected Lupin makes more gargling sounds, but none are discernible.]"],
    },
    {
        scene: LupinForest4,
        dialog: [
            "[As the creature crumples to the grass, you realize you're being flanked by a group of infected Lupins. These Zombie Lupins seem even more aggressive than the one you just fought.]",
        ],
        responses: [
            {
                text: "Prepare for a fight.",
                encounter: zombieLupinsFight,
                next: [
                    {
                        scene: LupinForest,
                        dialog: [
                            "[That seems to be the last of them... for now. The forest is eerily quiet, but you can feel an unsettling aura emanate from beyond the trees.",
                            "First, a quick break before moving forward.]",
                        ],
                        responses: [
                            {
                                text: "[Camp]",
                                camp: true,
                                next: [
                                    {
                                        scene: DarkForest1,
                                        dialog: [
                                            "[If you could figure out who, or what, is behind this so-called curse, maybe you could stop it at its source.",
                                            "Meanwhile, you get this sense that you're being watched...]",
                                        ],
                                    },
                                    {
                                        dialog: [
                                            "[There's a rumbling in the distance. It feels like footsteps, very large ones. Something tells you that whatever it is, it's far worse than the zombified Lupins from earlier.]",
                                        ],
                                    },
                                    {
                                        dialog: ["[The footsteps are approaching.]"],
                                    },
                                    {
                                        scene: DarkForest2,
                                        speaker: faust,
                                        dialog: ["......"],
                                    },
                                    {
                                        speaker: faust,
                                        dialog: ["[The giant Zombie Lupin charges you!]"],
                                        responses: [
                                            {
                                                text: "Defend yourself.",
                                                encounter: faustFight,
                                                next: [
                                                    {
                                                        scene: DarkForest1,
                                                        dialog: ["[Something shiny tumbles from the fallen heap of rotten fur.]"],
                                                        items: [glassShoe],
                                                    },
                                                    {
                                                        dialog: ["[That oversized Zombie Lupin was being controlled by someone. But who?]"],
                                                    },
                                                    ...maladyDialog,
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

const inLupinForest = {
    speaker: arwen,
    dialog: [
        "If one must wait, perhaps one could help? Lord Grendel works so hard, he hasn't time to leave the library, and there is always so much trouble happening outside.",
        "Adventurers are helpful ones, yes?",
    ],
    responses: [
        {
            text: "I think you're mistaken, I'm...",
            next: [
                {
                    speaker: rowen,
                    dialog: [
                        "If one would be a listening one: Rowen and Arwen do not judge by appearances, and neither does old, wise Grendel. Oneselves are oneselves. The adventuring one is an adventurer.",
                        "Monstrous ones are monsters. All different.",
                    ],
                },
                {
                    speaker: arwen,
                    dialog: [
                        "But now may oneself inquire, is the adventuring one a helping one?",
                        "In the forest is a curse spread by evil ones called Malady. Oneselves have cast magic to stop the curse from reaching Ellinia, but outside, the curse infects many of the ones called monsters.",
                    ],
                },
                {
                    speaker: rowen,
                    dialog: ["When monstrous ones are infected, infected ones are dangerous, and can spread the curse to others."],
                },
                {
                    speaker: arwen,
                    dialog: ["However, adventuring ones have no need to worry! The curse doesn't affect adventurers."],
                },
                {
                    speaker: rowen,
                    dialog: ["If one would clear out the monsters, oneselves would be grateful."],
                },
                {
                    speaker: arwen,
                    dialog: [
                        "Very grateful. And might an extra helpful one do another favor, if possible?",
                        "Arwen lost a very precious glass shoe in the forest when escaping an infected monstrous one. If one could retrieve it, Arwen would be happy.",
                    ],
                },
                {
                    speaker: rowen,
                    dialog: [
                        "Rowen remembers. It was a powerful infected one who chased Arwen. If one seeks the glass shoe, one should be careful. That infected one could be even stronger now.",
                    ],
                },
                {
                    scene: LupinForest,
                    dialog: [
                        "[Somehow, you find yourself back in Ellinia forest on an errand...",
                        "Maybe taking care of this curse will convince Grendel and his assistants to help you in turn.]",
                    ],
                },
                {
                    dialog: ["[The thought seems more and more naive every second.]"],
                },
                {
                    scene: LupinForest2,
                    speaker: lupin,
                    dialog: ["[As you venture forward, a furry shape darts into sight.]"],
                },
                {
                    speaker: lupin,
                    dialog: ["[It's just a Lupin. But something seems off. The Lupin looks at you and makes a wet, gargling noise.]"],
                },
                {
                    speaker: lupin,
                    dialog: ["R-r... uh...", "Rrrun...!"],
                },
                {
                    speaker: lupin,
                    dialog: ["[Even as it speaks, the Lupin is lunging toward you, its eyes milky.]"],
                    responses: [
                        {
                            text: "Defend yourself.",
                            encounter: lupinFight,
                            next: lupinsDialog,
                        },
                    ],
                },
            ],
        },
    ],
};

export const arwenScene: Scene = {
    characters: [],
    script: [
        {
            background: ElliniaBGImage,
            scene: ArwenIntroScene,
            dialog: [
                "[This forest village is home to the sagacious magicians. Maybe the old wizard who oversees it will have some insight about your situation...]",
            ],
        },
        {
            speaker: arwen,
            dialog: ["Greetings, adventuring one!", "Looking to have an audience with the old and wise one called Grendel?"],
        },
        {
            speaker: rowen,
            dialog: ["Adventurers always want to meet Grendel. He's a very busy one, too busy for casual appointments."],
        },
        {
            speaker: arwen,
            dialog: ["Yes! Saving Victoria Island is hard work."],
        },
        {
            speaker: rowen,
            dialog: [
                "Very hard. Too hard for just one, even if it's one such as Lord Grendel.",
                "[Rowen looks at you.] This adventurer will have to come back later, Rowen is afraid.",
            ],
            responses: [
                {
                    text: "Um... who are you?",
                    next: [
                        {
                            speaker: arwen,
                            dialog: [
                                "Oh! Allow oneselves to introduce oneselves. [Arwen gestures.] Oneself is called Arwen, and that one is called Rowen.",
                            ],
                        },
                        {
                            speaker: rowen,
                            dialog: ["Together, oneselves assist the one called Grendel."],
                        },
                        {
                            dialog: ["[Something about these beings seems uncanny... almost like...]"],
                            responses: [
                                {
                                    text: "So you're fairies? Does that mean you're monsters?",
                                    next: [
                                        {
                                            speaker: arwen,
                                            dialog: [
                                                "No! Oneselves are oneselves and not otherselves. Oneselves may be called fairies, if an inquiring one must, but not called monsters.",
                                            ],
                                        },
                                        {
                                            speaker: rowen,
                                            dialog: ["Fairies are not monsters. Very big difference, see?"],
                                        },
                                        inLupinForest,
                                    ],
                                },
                                {
                                    text: "You can understand me?",
                                    next: [
                                        {
                                            speaker: arwen,
                                            dialog: ["Yes, how clearly one speaks!"],
                                        },
                                        {
                                            speaker: rowen,
                                            dialog: ["Perfectly clearly."],
                                        },
                                        {
                                            speaker: arwen,
                                            dialog: ["O-of course--that is oneselves are wise and knowing creatures of the forest!"],
                                        },
                                        {
                                            speaker: rowen,
                                            dialog: [
                                                "[Rowen nods.] Yes, Arwen is right exactly. Of course oneselves understand mushroom-speak, even speak from mushroom enthusiasts such as this adventuring one.",
                                            ],
                                        },
                                        {
                                            dialog: ["[Hm. It seems they really think you're just a regular adventurer?]"],
                                        },
                                        inLupinForest,
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
