import { ACTION_TYPES, EFFECT_CLASSES, EFFECT_TYPES, TARGET_TYPES } from "../ability/types";
import { rally } from "../enemy/abilities";
import { Enemy } from "../enemy/enemy";
import { goldrichieImage, warriorImage, weaponmasteryImage, wizardImage } from "../images";
import { Wave } from "../Menu/tutorial";
import { NPC } from "./types";

const goldRichie: Enemy = {
    name: "Gold Richie",
    image: goldrichieImage,
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

const goldRichieFight1: { characters: string[]; waves: Wave[] } = {
    characters: [goldRichie.name],
    waves: [
        {
            enemies: [null, null, goldRichie, null, null],
        },
    ],
};

const goldRichie2: Enemy = {
    name: "Gold Richie",
    image: goldrichieImage,
    maxHP: 10,
    armor: 15,
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
            name: "Bolster",
            dialog: "The one who personally defeats that mushroom gets a hefty bonus!",
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    excludePrimaryTarget: true,
                    area: 3,
                    effects: [
                        {
                            icon: weaponmasteryImage,
                            name: "Bolster",
                            damage: 1,
                            duration: 3,
                            type: EFFECT_TYPES.NONE,
                            class: EFFECT_CLASSES.BUFF,
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

const goldRichieFight2: { characters: string[]; waves: Wave[] } = {
    characters: [goldRichie.name],
    waves: [
        {
            enemies: [null, adventurerFighter, goldRichie2, adventurerIceWizard, null],
        },
    ],
};

export const goldRichieMerchant: NPC = {
    character: goldRichie.name,
    scenes: {
        intro: {
            characters: [goldRichie.name],
            script: [
                {
                    scene: () => <div />,
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
                        { text: "Mug Gold Richie", encounter: goldRichieFight1, isExit: true, notoriety: 1 }, // accept function?
                    ],
                },
            ],
        },
        fought: {
            characters: [goldRichie.name],
            script: [
                {
                    scene: () => <div />,
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
                        { text: "Fight Gold Richie and his guards", encounter: goldRichieFight2, notoriety: 1 },
                        { text: "Give up all your mesos", isExit: true },
                    ],
                },
            ],
        },
        notorious: {
            characters: [goldRichie.name],
            script: [
                {
                    scene: () => <div />,
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
            characters: [goldRichie.name],
            script: [
                {
                    scene: () => <div />,
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
    },
};
