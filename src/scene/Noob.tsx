import { PLAYER_CLASSES } from "../Menu/types";
import { noobA, noobAWarrior, noobB, noobBWarrior } from "../enemy/enemy";
import { blueJeanShorts, leatherSandals, mesoItem, redHeadband, sportyTShirt, sword } from "../item/items";
import { EventScene, SCENE_CONDITION_TYPES } from "./types";

const noobEncounter1 = {
    characters: [noobA.name, noobB.name],
    waves: [{ enemies: [null, noobA, null, noobB, null] }],
    backgroundMusic: "https://dl.vgmdownloads.com/soundtracks/maplestory-music/ycfxgoahya/47.%20Plot%20of%20Pixie.mp3",
};

const noobEncounter2 = {
    characters: [noobA.name, noobB.name],
    waves: [{ enemies: [null, noobAWarrior, null, noobBWarrior, null] }],
    backgroundMusic: "https://dl.vgmdownloads.com/soundtracks/maplestory-music/ycfxgoahya/47.%20Plot%20of%20Pixie.mp3",
};

enum NOOB_EVENT_IDS {
    INTRO = "noob-event-intro",
    FOUGHT_WARRIOR = "noob-event-fight-warrior",
}

export const noobIntro: EventScene = {
    id: NOOB_EVENT_IDS.INTRO,
    script: [
        {
            scene: () => <div />,
            speaker: noobA,
            dialog: ["Hey, hey, hey! Look at that mushroom with the weird cap. It's gotta be a rare mob, right?"],
        },
        {
            speaker: noobB,
            dialog: ["Uh... it looks scary. Do you think we should fight it?"],
        },
        {
            speaker: noobA,
            dialog: [
                "If we beat it and it drops something good, we can get rich. What if it drops Ilbis?",
                "Come on! [The beginner jabs at you with his stick.]",
            ],
        },
        {
            speaker: noobB,
            dialog: ["But we already have such a hard time with the orange ones..."],
            responses: [
                {
                    text: "Fight the beginners.",
                    encounter: noobEncounter1,
                    infamy: 1,
                    next: [
                        {
                            speaker: noobA,
                            dialog: ["Uh oh... It's too strong. Run!", "[The beginners flee.]"],
                            responses: [
                                {
                                    text: "Chase them!",
                                    infamy: 1,
                                    next: [
                                        {
                                            speaker: noobB,
                                            dialog: ["WTF? It chased us through the portal!"],
                                        },
                                        {
                                            speaker: noobA,
                                            dialog: ["WTF? Monsters aren't supposed to do that! Hey, do something!"],
                                        },
                                        {
                                            speaker: noobB,
                                            dialog: [
                                                "But this was your idea...",
                                                "[The beginner looks at you.] Uh, um, think quick, what'll make it go away!?",
                                            ],
                                        },
                                        {
                                            speaker: noobB,
                                            dialog: [
                                                "But this was your idea...",
                                                "[The beginner looks at you.] Uh, um, think quick, what'll make it go away!?",
                                            ],
                                            itemChoices: {
                                                items: [leatherSandals, sportyTShirt, sword, redHeadband, blueJeanShorts, mesoItem],
                                                numChoices: 3,
                                                disableItemReplacements: true,
                                            },
                                        },
                                        {
                                            dialog: ["[While you picked up the item, the beginners made their escape.]"],
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
                                    text: "Leave them alone.",
                                    next: [
                                        {
                                            dialog: ["[The beginners sprint off. One of them dropped something...]"],
                                            items: {
                                                itemPool: [leatherSandals, sportyTShirt, sword, redHeadband, blueJeanShorts, mesoItem],
                                                amount: 1,
                                            },
                                        },
                                        {
                                            dialog: ["[The beginners are gone.]"],
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
                    text: "Run away.",
                    isExit: true,
                },
            ],
        },
    ],
};

export const noobRivalWarrior: EventScene = {
    id: NOOB_EVENT_IDS.FOUGHT_WARRIOR,
    conditions: [
        {
            type: SCENE_CONDITION_TYPES.VISITED_SCENES,
            value: NOOB_EVENT_IDS.FOUGHT_WARRIOR,
            comparator: "includes",
        },
        {
            type: SCENE_CONDITION_TYPES.PLAYER_CLASS,
            value: PLAYER_CLASSES.WARRIOR,
            comparator: "eq",
        },
    ],
    script: [
        {
            speaker: noobAWarrior,
            dialog: ["Hey! It's that weird {{ class }} mushroom again!"],
        },
        {
            speaker: noobBWarrior,
            dialog: ["Yeah. It was pretty strong...", "So strong that you even said we should become {{ classPlural }}, too."],
        },
        {
            speaker: noobAWarrior,
            dialog: ["Yeah, 'cuz I know something's OP when I see it. Now we can be the OP ones!"],
        },
        {
            speaker: noobBWarrior,
            dialog: ["Uh huh..."],
        },
        {
            speaker: noobAWarrior,
            dialog: ["So, you think we can take it on now?"],
        },
        {
            speaker: noobBWarrior,
            dialog: ["Well, I mean, it was stronger than us last time..."],
        },
        {
            speaker: noobAWarrior,
            dialog: [
                "Come on, man. We're stronger now, too!",
                "[The beginner pokes at you with his weapon.] I'll show you who the better {{ class }} is. I'll be the best {{ class }} ever!",
            ],
            responses: [
                {
                    text: "Fight the beginners.",
                    encounter: noobEncounter2,
                    infamy: 1,
                    next: [
                        {
                            speaker: noobBWarrior,
                            dialog: ["Well, this was a mistake..."],
                        },
                        {
                            speaker: noobAWarrior,
                            dialog: ["Yikes! Run!!", "[The beginners sprint off once again.]"],
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
};
