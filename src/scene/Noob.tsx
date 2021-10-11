import { noobA, noobAWarrior, noobB, noobBWarrior } from "../enemy/enemy";
import { leatherSandals } from "../item/items";
import { NPC, ScriptNode } from "./types";

const noobEncounter1 = {
    characters: [noobA.name, noobB.name],
    waves: [{ enemies: [null, noobA, null, noobB, null] }],
};

const noobEncounter2 = {
    characters: [noobA.name, noobB.name],
    waves: [{ enemies: [null, noobAWarrior, null, noobBWarrior, null] }],
};

export const noob: NPC = {
    character: noobA.name,
    scenes: {
        intro: {
            characters: [noobA.name, noobB.name],
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
                            notoriety: 1,
                            next: [
                                {
                                    speaker: noobA,
                                    dialog: ["Uh oh... It's too strong. Run!", "[The beginners flee.]"],
                                    responses: [
                                        {
                                            text: "Chase them!",
                                            notoriety: 1,
                                            next: [
                                                {
                                                    speaker: noobB,
                                                    dialog: ["WTF? It chased us through the portal!"],
                                                },
                                                {
                                                    speaker: noobA,
                                                    dialog: ["WTF? Monsters aren't supposed to do that!"],
                                                },
                                                {
                                                    dialog: ["[The beginners sprint off. One of them dropped something...]"],
                                                    items: [leatherSandals],
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
                                        {
                                            text: "Leave them alone.",
                                            next: [
                                                {
                                                    dialog: ["[The beginners sprint off. One of them dropped something...]"],
                                                    items: [leatherSandals],
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
        },
        fought: {
            characters: [noobA.name, noobB.name],
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
                            notoriety: 1,
                            next: [
                                {
                                    speaker: noobBWarrior,
                                    dialog: ["Well, this was a mistake..."],
                                },
                                {
                                    speaker: noobAWarrior,
                                    dialog: ["Yikes! Run!!", "[The beginners sprint off. One of them dropped something...]"],
                                    items: [],
                                },
                                {
                                    dialog: [],
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
        notorious: {
            characters: [noobA.name, noobB.name],
            script: [
                {
                    dialog: ["[Work in progress]"],
                    responses: [
                        {
                            text: "Leave.",
                            isExit: true,
                        },
                    ],
                },
            ],
        },
        helped: {
            characters: [noobA.name, noobB.name],
            script: [
                {
                    dialog: ["[Work in progress]"],
                    responses: [
                        {
                            text: "Leave.",
                            isExit: true,
                        },
                    ],
                },
            ],
        },
    },
};
