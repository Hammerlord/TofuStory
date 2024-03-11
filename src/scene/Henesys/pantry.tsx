import { BATTLE_TYPES } from "../../battle/types";
import { eat, miniBean } from "../../enemy/miniBean";
import { CakeSliceImage, HenesysRegionBGImage, MayaImage, MiniBeanImage, UnagiImage } from "../../images";
import { ITEM_TYPES, Item } from "../../item/types";
import { EventScene, ScriptResponse } from "../types";
import PantryScene from "./PantryScene";

const miniBeanCharacter = {
    name: "Mini Bean",
    image: MiniBeanImage,
};

const mayaCharacter = {
    name: "Maya",
    image: MayaImage,
};

const miniBeanFight = {
    characters: [],
    addAbilities: [eat, eat],
    waves: [
        {
            enemies: [null, null, miniBean, null, null],
            winCondition: {
                defeatBoss: true,
            },
        },
    ],
    backgroundMusic: "https://maplestory.io/api/GMS/236/music/Bgm16/FightingPinkBeen",
    type: BATTLE_TYPES.BOSS,
};

const cake: Item = {
    name: "Slice of Cake",
    healing: 10,
    image: CakeSliceImage,
    type: ITEM_TYPES.CONSUMABLE,
};

const unagi: Item = {
    name: "Unagi",
    healing: 20,
    image: UnagiImage,
    type: ITEM_TYPES.CONSUMABLE,
};

const postFightDialog = {
    scene: (other) => <PantryScene {...other} hideMiniBean={true} />,
    speaker: mayaCharacter,
    dialog: ["[Maya is covered in food scraps and seems shaken, although unharmed.]", "Oh no! The festival is going to be ruined!"],
    responses: [
        {
            text: "Check that Maya is okay.",
            next: [
                {
                    speaker: mayaCharacter,
                    dialog: [
                        "D-did you save me?",
                        "Thank you, sir {{ class }}, um...? Is that a costume you're wearing? I thought you were an actual mushroom!",
                    ],
                },
                {
                    speaker: mayaCharacter,
                    dialog: ["Um... it isn't much, but this piece of cake seems to be in okay shape. Please take it."],
                    items: {
                        itemPool: [cake],
                    },
                },
                {
                    speaker: mayaCharacter,
                    dialog: ["Oh, what am I going to do now...?"],
                },
                {
                    dialog: ["[Maybe you should leave before Maya realizes that you aren't just a {{ class }}...]"],
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
};

const postFightDialog2 = {
    ...postFightDialog,
    responses: [
        ...postFightDialog.responses,
        {
            scene: (other) => <PantryScene {...other} hideMiniBean={true} />,
            text: "Help yourself to a bunch of leftover food.",
            next: [
                {
                    dialog: ["[You started grabbing some food.]"],
                    items: {
                        itemPool: [cake, unagi],
                    },
                },
                {
                    speaker: mayaCharacter,
                    dialog: ["Eeek! Robber!"],
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
};

const miniBeanFightOption: ScriptResponse = {
    text: "Fight Mini Bean.",
    encounter: miniBeanFight,
    next: [
        {
            speaker: miniBeanCharacter,
            dialog: ["Urgh, not again... Just needed more... food!", "Curse... this... bo... dy..."],
        },
        {
            speaker: miniBeanCharacter,
            dialog: ["..."],
        },
        postFightDialog,
    ],
};

const miniBeanFightOption2: ScriptResponse = {
    text: "Fight Mini Bean.",
    encounter: miniBeanFight,
    next: [
        {
            speaker: miniBeanCharacter,
            dialog: ["Urgh, not again... Just needed more... food!", "Curse... this... bo... dy..."],
        },
        {
            speaker: miniBeanCharacter,
            dialog: ["..."],
        },
        postFightDialog2,
    ],
};

const pantry: EventScene = {
    id: "Pantry",
    script: [
        {
            background: HenesysRegionBGImage,
            scene: PantryScene,
            speaker: mayaCharacter,
            dialog: ["Help! Help! Somebody, there's a monster in my home!"],
        },
        {
            speaker: miniBeanCharacter,
            dialog: ["Gimme all your food!"],
        },
        {
            speaker: mayaCharacter,
            dialog: ["Oh no, those are for the festival! Help! Please, somebody!"],
        },
        {
            speaker: miniBeanCharacter,
            dialog: [
                "What's with the melodrama? Look, you're real lucky I don't care for NPCs, just good old tasty food.",
                "Buuuut yanno, keep up that screeching and I might change my mind.",
            ],
            responses: [
                {
                    text: "What's going on here?",
                    next: [
                        {
                            speaker: miniBeanCharacter,
                            dialog: ["[Mini Bean notices you.]", "Hey, you! Mind your own business."],
                        },
                        {
                            speaker: mayaCharacter,
                            dialog: ["Wh-who are you? Can you help me?", "O-or are you a monster, too!?"],
                            responses: [
                                {
                                    text: "Tell the creature to stop.",
                                    next: [
                                        {
                                            speaker: miniBeanCharacter,
                                            dialog: [
                                                "Stop? Like YOU stopped when you steamrolled all those snails on your way to town. Betcha even picked off an adventurer or two.",
                                            ],
                                        },
                                        {
                                            speaker: miniBeanCharacter,
                                            dialog: [
                                                "Oooh yeah, I know what you did to get here. It's obvious. Hehehehahaha! I can tell just by looking. Even if I didn't have eyes, I'd be able to tell.",
                                                "'Cause--you consume, you grow, or you die! That's the story of us seekers! Not so different from those pesky adventurers, are we?",
                                            ],
                                            responses: [
                                                {
                                                    text: "Seekers, what?",
                                                    next: [
                                                        {
                                                            speaker: miniBeanCharacter,
                                                            dialog: [
                                                                "Huh? I'm talking about folks like you and me. Look, it's really not complicated.",
                                                            ],
                                                        },
                                                        {
                                                            speaker: miniBeanCharacter,
                                                            dialog: [
                                                                "A noob steps off a boat and is called an adventurer.",
                                                                "Now someone wakes up lacking in the arms and legs department, they're called a seeker.",
                                                            ],
                                                        },
                                                        {
                                                            speaker: miniBeanCharacter,
                                                            dialog: ["..."],
                                                        },
                                                        {
                                                            speaker: miniBeanCharacter,
                                                            dialog: ["I spy with my beady eyes confusion!"],
                                                        },
                                                        {
                                                            speaker: miniBeanCharacter,
                                                            dialog: [
                                                                "Eheheheh, well, if you don't get it yet, I'm not gonna spoonfeed you all day. I've got food to eat, so sod off.",
                                                            ],
                                                            responses: [
                                                                {
                                                                    text: "Reassert yourself.",
                                                                    next: [
                                                                        {
                                                                            speaker: miniBeanCharacter,
                                                                            dialog: [
                                                                                "Yeah, leave behind a trail of casualties, why not? But scare some poor maiden and now there's a problem!",
                                                                                "'Stop', huh? You sure sound like some kinda human, and I mean that in the worst way. Ooohoohoohoo... well, it'd be funny if it wasn't so annoying.",
                                                                            ],
                                                                        },
                                                                        {
                                                                            speaker: miniBeanCharacter,
                                                                            dialog: [
                                                                                "I'm not much in the business of eating my fellows, either, but hey, if you wanna scrap, have at it!",
                                                                                "[The creature boxes the air with its fists.]",
                                                                            ],
                                                                            responses: [miniBeanFightOption],
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
                                {
                                    text: "Lay claim to the food.",
                                    next: [
                                        {
                                            speaker: miniBeanCharacter,
                                            dialog: [
                                                "Hands off, bozo! I got here first. The food's all miiine!",
                                                "Oh, not that you have hands, hehehehahaha!",
                                            ],
                                        },
                                        {
                                            speaker: miniBeanCharacter,
                                            dialog: [
                                                "But yeah, I'm thiiis close to leveling up, so I ain't sharing.",
                                                "What do they say? CC PLZZZZzzzz.",
                                            ],
                                        },
                                        {
                                            speaker: miniBeanCharacter,
                                            dialog: [
                                                "What're you looking so surprised for? 'Cause I said 'level up'?",
                                                "You consume, you grow, or you die! That's the story of us seekers! Not so different from those pesky adventurers, are we?",
                                            ],
                                            responses: [
                                                {
                                                    text: "Seekers, what?",
                                                    next: [
                                                        {
                                                            speaker: miniBeanCharacter,
                                                            dialog: [
                                                                "Huh? I'm talking about folks like you and me. Look, it's really not complicated.",
                                                            ],
                                                        },
                                                        {
                                                            speaker: miniBeanCharacter,
                                                            dialog: [
                                                                "A noob steps off a boat and is called an adventurer.",
                                                                "Now someone wakes up lacking in the arms and legs department, they're called a seeker.",
                                                            ],
                                                        },
                                                        {
                                                            speaker: miniBeanCharacter,
                                                            dialog: ["..."],
                                                        },
                                                        {
                                                            speaker: miniBeanCharacter,
                                                            dialog: ["I spy with my beady eyes confusion!"],
                                                        },
                                                        {
                                                            speaker: miniBeanCharacter,
                                                            dialog: [
                                                                "Eheheheh, well, if you don't get it yet, I'm not gonna spoonfeed you all day. I've got food to eat, so sod off.",
                                                            ],
                                                            responses: [
                                                                {
                                                                    text: "Gear up to fight the creature.",
                                                                    next: [
                                                                        {
                                                                            speaker: miniBeanCharacter,
                                                                            dialog: [
                                                                                "You've got some gall, yanno. I'd almost like it if it wasn't so annoying.",
                                                                                "I'm not much in the business of eating my fellows, either, but hey, if you wanna scrap, have at it!",
                                                                                "[The creature boxes the air with its fists.]",
                                                                            ],
                                                                            responses: [miniBeanFightOption2],
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
                                {
                                    text: "Try to convince Maya that you aren't a monster.",
                                    next: [
                                        {
                                            speaker: mayaCharacter,
                                            dialog: [
                                                "Eeek! There are two monsters in my home! Please, somebody!",
                                                "[Maya doesn't seem to be able to understand you.]",
                                            ],
                                        },
                                        {
                                            speaker: miniBeanCharacter,
                                            dialog: [
                                                "It's pointless trying to talk to 'em, stupid! Even if they could hear you, they wouldn't listen!",
                                                "Why not just run 'em over like you do the snails? Should be easy enough. Free EXP sitting right there, I tell ya.",
                                            ],
                                            responses: [
                                                {
                                                    text: "Insist that you aren't a monster.",
                                                    next: [
                                                        {
                                                            speaker: miniBeanCharacter,
                                                            dialog: [
                                                                "Yeah, yeah, yeah. Nobody cares, least of all humans!",
                                                                "Here's a bit of advice: if they call you a monster, then you should just act like one. Hehehehahaha! It's done me well, I can say that much.",
                                                            ],
                                                            responses: [
                                                                {
                                                                    text: "Assist Maya and fight Mini Bean.",
                                                                    next: [
                                                                        {
                                                                            speaker: miniBeanCharacter,
                                                                            dialog: [
                                                                                "Hey hey hey! Why do you gotta help the NPC like some clueless adventurer?",
                                                                                "Tryin' to act like you got morals or something? Or does it come with the {{ class }} fantasy? Stupid!",
                                                                            ],
                                                                        },
                                                                        {
                                                                            speaker: miniBeanCharacter,
                                                                            dialog: [
                                                                                "I'm not much in the business of eating my fellows, either, but hey, if you wanna scrap, have at it!",
                                                                                "[The creature boxes the air with its fists.]",
                                                                            ],
                                                                            responses: [miniBeanFightOption],
                                                                        },
                                                                    ],
                                                                },
                                                            ],
                                                        },
                                                    ],
                                                },
                                                {
                                                    text: "In that case, why don't you do the running over?",
                                                    next: [
                                                        {
                                                            speaker: miniBeanCharacter,
                                                            dialog: [
                                                                "Do I look like the kinda bean who beats up NPCs?",
                                                                "I want FOOD. Food's my jam! Get it, mush-brains?",
                                                            ],
                                                        },
                                                        {
                                                            dialog: ["[There is perhaps something the creature isn't telling you.]"],
                                                        },
                                                        {
                                                            speaker: miniBeanCharacter,
                                                            dialog: [
                                                                "Here's a bit of advice: if they call you a monster, then you should just act like one. Hehehehahaha! It's done me well, I can say that much.",
                                                            ],
                                                            responses: [
                                                                {
                                                                    text: "Turn against Mini Bean.",
                                                                    next: [
                                                                        {
                                                                            speaker: miniBeanCharacter,
                                                                            dialog: [
                                                                                "Hey hey hey! Why do you gotta help the NPC like some clueless adventurer?",
                                                                                "Tryin' to act like you got morals or something? Or does it come with the {{ class }} fantasy? Stupid!",
                                                                            ],
                                                                            responses: [miniBeanFightOption],
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
};

export default pantry;
