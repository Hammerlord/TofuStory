import { BATTLE_TYPES } from "../../battle/types";
import { manji } from "../../enemy/Manji";
import { tauromacis } from "../../enemy/enemy";
import { ArturoImage, BystanderImage } from "../../images";
import { EventScene, SceneEncounter } from "../types";

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

const manjiFight: SceneEncounter = {
    waves: [
        {
            enemies: [null, null, manji, null, null],
        },
    ],
    type: BATTLE_TYPES.ELITE_ENCOUNTER,
    disableItemRewards: true,
};

export const arenaScene: EventScene = {
    id: "perion-arena",
    script: [
        {
            speaker: announcer,
            dialog: ["[A voice blares from a megaphone.] Hang onto your seats folks, or the coming match will knock you clean out of it!"],
        },
        {
            speaker: announcer,
            dialog: [
                "Are you ready?",
                "From the depths of the Ant Tunnel, a creature cursed by Balrog itself, we have the fearsome Tauromacis!",
            ],
        },
        {
            speaker: announcer,
            dialog: [
                "It's weaker without its brother-in-arms the Taurospear, but not to be underestimated! Countless over-arrogant opponents have been gored by its horns and trampled by its hooves. That pronged staff has laid low many a would-be champion in this arena!",
            ],
        },
        {
            speaker: crowd,
            dialog: ["[The crowd roars.]"],
        },
        {
            speaker: announcer,
            dialog: ["And the Tauromacis' challenger today is the equally-fierce and mighty...", "..."],
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
                            dialog: [
                                "Wha--what an upset! The monster king of the arena has lost its crown to a mushroom! Have you ever seen a mushroom do anything besides run and jump!?",
                            ],
                        },
                        {
                            speaker: crowd,
                            dialog: ["[The crowd leaps to their feet and screams. You can't tell if they're angry or elated.]"],
                        },
                        {
                            speaker: announcer,
                            dialog: [
                                "Next up! Heralding from the peaks of the eastern rocky mountains, our next contestant is the distinguished swordsman Manji, two-time champion of the arena!",
                            ],
                        },
                        {
                            speaker: announcer,
                            dialog: [
                                "He's on a relentless quest to be known as the strongest swordsman in all of Victoria. Some say he's already earned the title!",
                            ],
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
                            dialog: [
                                "Manji has been defeated!!",
                                "The champion today is a mushroom that came from nowhere. What an incredible show!",
                            ],
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
                            speaker: announcer,
                            dialog: [
                                "That's it, folks! Come back again for more nail-biting fights among the island's bravest and strongest contestants as they strive to take the championship!",
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
                    ],
                },
            ],
        },
    ],
};
