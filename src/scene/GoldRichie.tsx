import { rally } from "../enemy/abilities";
import { MerchantScenes, ScriptNode } from "./types";
import { TARGET_TYPES } from "../ability/types";
import { ACTION_TYPES } from "../ability/types";
import { Wave } from "../Menu/tutorial";
import { goldrichieImage, warriorImage, wizardImage } from "../images";

const goldRichie = {
    name: "Gold Richie",
    image: goldrichieImage,
    HP: 10,
    maxHP: 10,
    damage: 0,
    abilities: [
        {
            name: "Curl Up in Fetal Position",
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    armor: 2,
                },
            ],
        },
    ],
};

const goldRichieFight1: { waves: Wave[] } = {
    waves: [
        {
            enemies: [null, null, goldRichie, null, null],
        },
    ],
};

const goldRichie2 = {
    name: "Gold Richie",
    image: goldrichieImage,
    HP: 10,
    maxHP: 10,
    damage: 0,
    abilities: [
        {
            name: "Curl Up in Fetal Position",
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    armor: 2,
                },
            ],
        },
        {
            actions: [
                {
                    name: "Bolster",
                    dialog: "The one who personally defeats that mushroom gets a hefty bonus!",
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.FRIENDLY_EXCLUDE_SELF,
                    area: 3,
                    effects: [
                        {
                            name: "Bolster",
                            damage: 1,
                            duration: 3,
                        },
                    ],
                },
            ],
        },
    ],
};

const adventurerFighter = {
    name: "Fighter",
    image: warriorImage,
    HP: 25,
    maxHP: 25,
    damage: 2,
    abilities: [rally],
};

const adventurerIceWizard = {
    name: "Ice-Lightning Wizard",
    image: wizardImage,
    HP: 20,
    maxHP: 20,
    damage: 3,
};

const goldRichieFight2: { waves: Wave[] } = {
    waves: [
        {
            enemies: [null, adventurerFighter, goldRichie, adventurerIceWizard, null],
        },
    ],
};

export const goldRichieMerchant = {
    id: goldRichie.name,
    scenes: {
        intro: {
            scene: () => <div />,
            script: [
                {
                    speaker: goldRichie,
                    dialog: ["Ahh! A monster!"],
                },
                {
                    speaker: goldRichie,
                    dialog: [
                        "I knew I should have hired an adventurer, but every last one of them says they 'hate escort quests'!",
                        "Well, I can't help that I'm a merchant in need of escorting! If I could dash and jump around like those youngsters, I wouldn't need to hire anyone, now would I?",
                    ],
                },
                {
                    speaker: goldRichie,
                    dialog: ["... Wait, you want to trade? Please tell me you want to trade, um... Mushroom sir and-or ma'am."],
                    responses: [
                        {
                            text: "Trade with Gold Richie",
                            shop: {
                                merchant: goldRichie,
                            },
                        },
                        { text: "Offer to help Gold Richie reach his destination", isExit: true },
                        { text: "Mug Gold Richie", encounter: goldRichieFight1 }, // accept function?
                    ],
                },
            ],
        },
        robbed: {
            scene: () => <div />,
            script: [
                {
                    speaker: goldRichie,
                    dialog: ["You again! The mushroom with the weird cap!"],
                },
                {
                    speaker: goldRichie,
                    dialog: [
                        "This time, you dastardly creature, I'm prepared. And I plan on taking back every last meso you stole from me, plus premium.",
                    ],
                },
                {
                    speaker: goldRichie,
                    dialog: ["Guards!"],
                    responses: [
                        { text: "Fight Gold Richie and his guards", encounter: goldRichieFight2 },
                        { text: "Give up all your mesos", isExit: true },
                    ],
                },
            ],
        },
        notorious: {
            scene: () => <div />,

            script: [
                {
                    speaker: goldRichie,
                    dialog: [
                        "We meet again! I heard you've made something of a name for yourself.",
                        "But, that's not necessarily the business of a merchant like me, is it?",
                    ],
                    responses: [
                        {
                            text: "Trade with Gold Richie",
                            shop: {
                                merchant: goldRichie,
                            },
                        },
                    ],
                },
            ],
        },
        helped: {
            scene: () => <div />,

            script: [
                {
                    speaker: goldRichie,
                    dialog: ["Ah, Sir Mushroom! [Gold Richie squints.] Or... lady, whichever it is."],
                },
                {
                    speaker: goldRichie,
                    dialog: [
                        "Now, a merchant remembers past favours granted to him, and I'm no different, so why don't I offer you a deal on my wares this time around?",
                    ],
                    responses: [
                        {
                            text: "Trade with Gold Richie",
                            shop: {
                                merchant: goldRichie,
                            },
                        },
                    ],
                },
            ],
        },
    } as MerchantScenes,
};
