import { BATTLE_TYPES } from "../../battle/types";
import { tauromacis } from "../../enemy/enemy";
import { ArturoImage, BystanderImage } from "../../images";
import { EventScene } from "../types";

const announcer = {
    name: "Announcer",
    image: ArturoImage,
};

const crowd = {
    name: "Crowd",
    image: BystanderImage,
};

const tauromacisFight = {
    waves: [
        {
            enemies: [null, null, tauromacis, null, null],
        },
    ],
    type: BATTLE_TYPES.ELITE_ENCOUNTER,
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
                                "Next up! Heralding from the peaks of the eastern rocky mountains, our next contestant is the distinguished swordsman Manji!",
                            ],
                        },
                        {
                            speaker: announcer,
                            dialog: [
                                "He's here on a quest to be known as the strongest swordsman in all of Victoria. Some say he's already earned the title!",
                            ],
                        },
                        {
                            speaker: announcer,
                            dialog: ["Our brave mushroom challenger is in for a match!"],
                        },
                        {
                            dialog: ["[Work in progress.]"],
                        },
                    ],
                },
            ],
        },
    ],
};
