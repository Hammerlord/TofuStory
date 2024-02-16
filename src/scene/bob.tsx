import { bob } from "../enemy/enemy";
import { NPC } from "./types";

const bobEncounter = {
    characters: [bob.name],
    waves: [{ enemies: [null, null, bob, null, null] }],
};

export const bobSnailScene = {
    speaker: bob,
    dialog: ["[In the road sits a regular snail... or is it?]"],
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
                    dialog: ["I dunno what's with my rotten luck, but I've died about 17 times now, mostly within minutes of spawning."],
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
                                        "Oh, yea, nobody's supposed to be what they are. I'm not SUPPOSED to be a green snail. If I had a choice, do you think I'd be a green snail? No arms and legs? But you go with it till you get used to it. At least that's what I did.",
                                    ],
                                },
                                {
                                    speaker: bob,
                                    dialog: ["Get used to dying over and over, that is."],
                                },
                                {
                                    speaker: bob,
                                    dialog: [
                                        "Though I mean, you might have better luck than me. You look like a {{ class }}. Never seen that before.",
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
};

// WIP: Just following the contract for now, NPC interaction tracking needs to change
export const bobScenario: NPC = {
    character: bob.name,
    scenes: {
        intro: {
            characters: [bob.name],
            script: [bobSnailScene],
        },
        fought: {
            characters: [bob.name],
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
        notorious: {
            characters: [bob.name],
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
            characters: [bob.name],
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
