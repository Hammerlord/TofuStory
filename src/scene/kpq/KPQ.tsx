import { elite, raging, thorns } from "../../ability/Effects";
import { ACTION_TYPES } from "../../ability/types";
import { Enemy } from "../../enemy/enemy";
import { greenmushroomImage, hornymushroomImage, kingslimeImage, ligatorImage } from "../../images";
import { Scene } from "../types";
import { bowman, bystander, kingSlime, lakelis, magician, thief } from "./characters";
import KittenBarrels from "./KittenBarrels";
import KittenBarrelsQuest from "./KittenBarrelsQuest";
import KPQSewer from "./KPQSewer";
import KPQSewer2 from "./KPQSewer2";
import RopeQuest from "./RopeQuest";
import SewerEntrance from "./SewerEntrance";
import SewerEntrance2 from "./SewerEntrance2";

const ligator: Enemy = {
    name: "Ligator",
    image: ligatorImage,
    maxHP: 2,
    damage: 2,
};

const eliteLigator: Enemy = {
    name: "Ligator",
    image: ligatorImage,
    maxHP: 2,
    damage: 2,
    effects: [elite, raging],
};

const greenMushroom: Enemy = {
    name: "Green Mushroom",
    image: greenmushroomImage,
    maxHP: 15,
    damage: 1,
};

const hornyMushroom: Enemy = {
    name: "Horny Mushroom",
    image: hornymushroomImage,
    maxHP: 20,
    damage: 2,
    effects: [thorns],
};

export const kingSlimeEnemy: Enemy = {
    name: "King Slime",
    image: kingslimeImage,
    maxHP: 50,
    damage: 2,
    effects: [elite],
    abilities: [
        {
            name: "Earthquake",
            actions: [
                {
                    resources: 3,
                    type: ACTION_TYPES.ATTACK,
                    damage: 4,
                    area: 2,
                },
            ],
        },
    ],
};

const ligatorFight1 = {
    characters: [],
    waves: [
        {
            enemies: [null, ligator, null, ligator, null],
        },
        {
            enemies: [null, ligator, ligator, ligator, null],
        },
    ],
};

const ligatorFight2 = {
    characters: [],
    waves: [
        {
            enemies: [ligator, null, eliteLigator, null, ligator],
        },
    ],
};

const mushroomFight = {
    characters: [],
    waves: [
        {
            enemies: [greenMushroom, hornyMushroom, greenMushroom, hornyMushroom, greenMushroom],
        },
    ],
};

const kingSlimeFight = {
    characters: [],
    waves: [
        {
            enemies: [null, null, kingSlimeEnemy, null, null],
        },
    ],
};

export const KPQ: Scene = {
    characters: [],
    script: [
        {
            scene: SewerEntrance,
            dialog: ["There's a crowd around the sewers. Maybe you should avoid catching any unwanted attention..."],
        },
        {
            speaker: bowman,
            dialog: ["Hey!", "Yeah, you.", "Wanna join our party? You're a {{ class }}, right?"],
        },
        {
            speaker: magician,
            dialog: ["You can't just ask the first person walking by themselves on the street, Wess."],
        },
        {
            speaker: bowman,
            dialog: ["Why not? We still need someone, don't we?"],
        },
        {
            speaker: magician,
            dialog: ["[The magician sighs.] Not only that, did you have to choose a weirdo? What's he even wearing, a bodysuit?"],
        },
        {
            speaker: thief,
            dialog: ["It's just some Cash Shop costume, isn't it? If the guy's up to snuff, who cares?"],
        },
        {
            speaker: magician,
            dialog: [
                "Well, it looks stupid. Why would you spend NX to be a mushroom? There aren't even any holes for the limbs.",
                "Do you just hop around all the time or what?",
            ],
        },
        {
            dialog: ["[You have no idea what these people are talking about, but you think you've just been insulted...]"],
        },
        {
            speaker: thief,
            dialog: [
                "[The thief looks at you.]",
                "Well, you seem confused. Let me guess, you haven't heard.",
                "The King Slime's about to resurrect again, so Lakelis over there's enlisting adventurers like us to prepare for it.",
            ],
        },
        {
            speaker: bowman,
            dialog: [
                "Yeah. The King Slime is a menace that comes back over and over. Nobody knows how, nobody's seen it resurrect, but it always happens in the deepest part of the sewers.",
            ],
        },
        {
            speaker: magician,
            dialog: ["And nobody cares, either."],
        },
        {
            speaker: bowman,
            dialog: [
                "I mean, I want to know, and I'm not the only one: Lakelis' people have been keeping records of the King Slime's resurrection and the details of each time adventurers battle with it.",
                "They're trying to figure out how it ticks, and whether we can stop it from coming back for good.",
            ],
        },
        {
            speaker: bowman,
            dialog: [
                "As far as I've heard, its behaviour has been unpredictable so far.",
                "Sometimes, it's as aggressive as any other monster, other times... it's almost like it tries to be sneaky.",
            ],
        },
        {
            speaker: bowman,
            dialog: ["They say the King Slime's personality changes each time it wakes up."],
        },
        {
            dialog: ["[Hmm...]"],
        },
        {
            speaker: magician,
            dialog: ["You and your conspiracies again. Whatever. Monsters can't have personalities. That's stupid."],
        },
        {
            speaker: bowman,
            dialog: [
                "Ahem. Sorry I forgot to introduce myself. The name's Wess.",
                "So how about it? Want to go sewer-diving in the name of justice?",
                "Ignore the magician, by the way--nice costume.",
            ],
            responses: [
                {
                    text: "Nod or something to agree.",
                    next: [
                        {
                            speaker: bowman,
                            dialog: ["Great! We have ourselves a full party. Let's go talk to Lakelis."],
                        },
                        {
                            scene: SewerEntrance2,
                            speaker: lakelis,
                            dialog: ["Unfortunately, we're not able to guarantee that everyone can have a turn at the qualifiers today..."],
                        },
                        {
                            speaker: bystander,
                            dialog: ["WTF? We've been waiting here for hours! Tell those guys in the bonus stage to GTFO already!"],
                        },
                        {
                            speaker: lakelis,
                            dialog: [
                                "We understand that you're all eager to take the fight to the King Slime.",
                                "But for your safety, only parties who've proven that they can work together may join the campaign.",
                            ],
                        },
                        {
                            speaker: lakelis,
                            dialog: ["Thank you all for your patience. There will be another opening soon."],
                        },
                        {
                            speaker: { ...bystander, name: "Bystander Mage" },
                            dialog: ["ccplz"],
                        },
                        {
                            speaker: { ...bystander, name: "Bystander Warrior" },
                            dialog: ["No you"],
                        },
                        {
                            speaker: { ...bystander, name: "Bystander Mage" },
                            dialog: ["We were here first noob, ccplz"],
                        },
                        {
                            speaker: { ...bystander, name: "Bystander Warrior" },
                            dialog: ["So what? You don't even have a full party, GTFO"],
                        },
                        {
                            speaker: { ...bystander, name: "Bystander Mage" },
                            dialog: ["lol well you're just a warrior", "warriors suck lmao", "noob"],
                        },
                        {
                            speaker: bowman,
                            dialog: [
                                "There's a lot of people. Is everyone here for the qualifiers?",
                                "Brawls are practically breaking out here and Lakelis isn't doing anything about it.",
                            ],
                        },
                        {
                            speaker: magician,
                            dialog: [
                                "Well, she didn't say anything about different parties working together, did she?",
                                "Whatever. Looks like whoever has her attention can get in. Let's at it.",
                            ],
                            responses: [
                                {
                                    text: "Try to get into the next open slot",
                                    next: [
                                        {
                                            dialog: ["<Pretend there was a mini-game here>"],
                                        },
                                        {
                                            scene: KPQSewer,
                                            speaker: thief,
                                            dialog: ["Hey, you got us in, mushroom guy. Not bad."],
                                        },
                                        {
                                            speaker: magician,
                                            dialog: ["... Yeah. That was impressive, I'll admit."],
                                        },
                                        {
                                            speaker: thief,
                                            dialog: ["The name's Stefa, by the way. And that jerk is Sho."],
                                        },
                                        {
                                            dialog: [
                                                "[You still don't know what you're doing here, but maybe, finding the King Slime will tell you something about your own situation...]",
                                            ],
                                        },
                                        {
                                            speaker: thief,
                                            dialog: [
                                                "Pretty quiet, ain'tcha? Not that I'm one to talk.",
                                                "Oh, there's Wess, back from talking to the proctor.",
                                            ],
                                        },
                                        {
                                            speaker: bowman,
                                            dialog: ["Hey Sho, what level did you need to become a magician?"],
                                        },
                                        {
                                            speaker: magician,
                                            dialog: ["Eight.", "What kind of question is that?"],
                                        },
                                        {
                                            speaker: bowman,
                                            dialog: [
                                                "That's the number of tickets we need to pass this stage. I figured it was eight, but thought I'd double-check since you're a magician in the flesh.",
                                                "Teamwork and all, you know?",
                                            ],
                                        },
                                        {
                                            speaker: magician,
                                            dialog: ["[Sigh.] Did we accidentally sign up for Trivia Night?"],
                                        },
                                        {
                                            speaker: bowman,
                                            dialog: [
                                                "Alright, team.",
                                                "The first task is to clear out some of the Ligators around here and collect the tickets they have. Eight, to be exact.",
                                                "Ready to do your part?",
                                            ],
                                        },
                                        {
                                            speaker: thief,
                                            dialog: ["I heard something about killing monsters. Sounds simple enough."],
                                        },
                                        {
                                            speaker: magician,
                                            dialog: ["Yeah, whatever."],
                                        },
                                        {
                                            speaker: bowman,
                                            dialog: ["[The bowman looks at you.]"],
                                            responses: [
                                                {
                                                    text: "Nod in agreement.",
                                                    encounter: ligatorFight1,
                                                    next: [
                                                        {
                                                            scene: KPQSewer2,
                                                            speaker: bowman,
                                                            dialog: [
                                                                "Well. Damn. [The bowman whistles.] You sure made short work of those Ligators.",
                                                            ],
                                                        },
                                                        {
                                                            speaker: thief,
                                                            dialog: ["A little help here, guys! This one's tougher than usual."],
                                                        },
                                                        {
                                                            speaker: magician,
                                                            dialog: ["So much for being a 'sin, Stefa."],
                                                        },
                                                        {
                                                            speaker: thief,
                                                            dialog: [
                                                                "Shut up. I'm not even an assassin yet. But once I am, yeah, I'll show you.",
                                                                "You should be soloing these Ligators if you're so tough, not hiding behind the so-called bodysuit you talked crap about earlier.",
                                                            ],
                                                        },
                                                        {
                                                            speaker: magician,
                                                            dialog: [
                                                                "... But seriously, mush freak, where'd you even get all those skills at your level?",
                                                            ],
                                                        },
                                                        {
                                                            speaker: bowman,
                                                            dialog: ["That's not nice, Sho."],
                                                        },
                                                        {
                                                            speaker: magician,
                                                            dialog: [
                                                                "Have you seen this guy move? Have you seen any {{ class }} with moves like that? And the hardcore LARPing?",
                                                                "'Mush freak' is right.",
                                                            ],
                                                        },
                                                        {
                                                            speaker: bowman,
                                                            dialog: ["Enough already. The job's not done yet. Let's focus."],
                                                        },
                                                        {
                                                            speaker: thief,
                                                            dialog: ["You're telling me. I'm waiting on you!"],
                                                            responses: [
                                                                {
                                                                    text: "",
                                                                    encounter: ligatorFight2,
                                                                    next: [
                                                                        {
                                                                            speaker: bowman,
                                                                            dialog: [
                                                                                "Alright, we're done here. We've got all the tickets we need.",
                                                                                "... As much as it's kind of weird that these Ligators cough up tickets.",
                                                                            ],
                                                                        },
                                                                        {
                                                                            speaker: magician,
                                                                            dialog: ["[The magician shrugs.]"],
                                                                        },
                                                                        {
                                                                            speaker: thief,
                                                                            dialog: ["So, what's next, Wess?"],
                                                                        },
                                                                        {
                                                                            speaker: bowman,
                                                                            dialog: ["First, let's take a ten-minute breather."],
                                                                            healthRecovery: 0.25,
                                                                        },
                                                                        {
                                                                            speaker: bowman,
                                                                            dialog: [
                                                                                "The next stage is... how do I describe it. An exercise in hanging on vines? It's a puzzle.",
                                                                            ],
                                                                        },
                                                                        {
                                                                            speaker: thief,
                                                                            dialog: ["... Huh."],
                                                                        },
                                                                        {
                                                                            speaker: magician,
                                                                            dialog: ["Do I want to know?"],
                                                                            responses: [
                                                                                {
                                                                                    text: "[Proceed]",
                                                                                    next: [
                                                                                        {
                                                                                            puzzle: RopeQuest,
                                                                                            dialog: [],
                                                                                        },
                                                                                        {
                                                                                            speaker: magician,
                                                                                            dialog: [
                                                                                                "... I'm not going to comment on what I saw back there.",
                                                                                            ],
                                                                                        },
                                                                                        {
                                                                                            speaker: bowman,
                                                                                            dialog: [
                                                                                                "Good job, team. That was easy, right? Well, consider that a primer to the next puzzle--because there's more.",
                                                                                                "Let's move on.",
                                                                                            ],
                                                                                        },
                                                                                        {
                                                                                            speaker: magician,
                                                                                            dialog: ["Uh huh..."],
                                                                                        },
                                                                                        {
                                                                                            scene: KittenBarrels,
                                                                                            speaker: magician,
                                                                                            dialog: ["You've gotta be kidding me."],
                                                                                        },
                                                                                        {
                                                                                            speaker: thief,
                                                                                            dialog: ["You mean 'kitten.'"],
                                                                                        },
                                                                                        {
                                                                                            speaker: magician,
                                                                                            dialog: ["Ugh. Don't."],
                                                                                        },
                                                                                        {
                                                                                            speaker: thief,
                                                                                            dialog: ["At least they're cute?"],
                                                                                        },
                                                                                        {
                                                                                            speaker: magician,
                                                                                            dialog: [
                                                                                                "Whatever. It looks like the same puzzle as before, just with an extra step. Let's get this over with.",
                                                                                            ],
                                                                                        },
                                                                                        {
                                                                                            puzzle: KittenBarrelsQuest,
                                                                                            dialog: [],
                                                                                        },
                                                                                        {
                                                                                            dialog: ["[The chamber rumbles.]"],
                                                                                        },
                                                                                        {
                                                                                            speaker: thief,
                                                                                            dialog: ["W-what was that?", "Whoa!"],
                                                                                        },
                                                                                        {
                                                                                            speaker: bowman,
                                                                                            dialog: ["Mushrooms? Where'd they--"],
                                                                                        },
                                                                                        {
                                                                                            speaker: thief,
                                                                                            dialog: [
                                                                                                "Aren't those from the bonus stage? How'd they get out?",
                                                                                            ],
                                                                                        },
                                                                                        {
                                                                                            speaker: bowman,
                                                                                            dialog: [
                                                                                                "You may be right. In that case...",
                                                                                                "... Where's Cloto? The test proctor?",
                                                                                            ],
                                                                                        },
                                                                                        {
                                                                                            speaker: magician,
                                                                                            dialog: ["Hey, mush freak. It's your friends."],
                                                                                        },
                                                                                        {
                                                                                            speaker: bowman,
                                                                                            dialog: [
                                                                                                "This isn't the time to make jokes, Sho. Something's happened, and we need to figure out where Cloto is.",
                                                                                                "First, we'll have to get past these mushrooms!",
                                                                                            ],
                                                                                            responses: [
                                                                                                {
                                                                                                    text: "",
                                                                                                    encounter: mushroomFight,
                                                                                                    next: [
                                                                                                        {
                                                                                                            dialog: [
                                                                                                                "... This time...",
                                                                                                                "... What I... must do...",
                                                                                                            ],
                                                                                                        },
                                                                                                        {
                                                                                                            speaker: bowman,
                                                                                                            dialog: [
                                                                                                                "Feel those vibrations? It's like an earthquake. Do you think...",
                                                                                                            ],
                                                                                                        },
                                                                                                        {
                                                                                                            speaker: thief,
                                                                                                            dialog: [
                                                                                                                "Don't say it, Wess. I have a bad feeling about this. We should get out of here.",
                                                                                                            ],
                                                                                                        },
                                                                                                        {
                                                                                                            speaker: bowman,
                                                                                                            dialog: ["But, Cloto--"],
                                                                                                        },
                                                                                                        {
                                                                                                            speaker: magician,
                                                                                                            dialog: [
                                                                                                                "--Most likely had the same idea as Stefa and took off. For the record, I agree with Stefa.",
                                                                                                            ],
                                                                                                        },
                                                                                                        {
                                                                                                            dialog: [
                                                                                                                "... That is...",
                                                                                                                "... To consume and acquire...",
                                                                                                            ],
                                                                                                        },
                                                                                                        {
                                                                                                            dialog: [
                                                                                                                "... That is...",
                                                                                                                "... Why, time and again, I...",
                                                                                                                "... Wake up...",
                                                                                                            ],
                                                                                                        },
                                                                                                        {
                                                                                                            dialog: [
                                                                                                                "... Without arms or legs...",
                                                                                                            ],
                                                                                                        },
                                                                                                        {
                                                                                                            dialog: [
                                                                                                                "[You look at the others, but they don't seem to realize that there's someone else speaking.]",
                                                                                                            ],
                                                                                                        },
                                                                                                        {
                                                                                                            speaker: kingSlime,
                                                                                                            dialog: ["... Adventurers..."],
                                                                                                        },
                                                                                                        {
                                                                                                            speaker: thief,
                                                                                                            dialog: [
                                                                                                                "T-the King Slime?",
                                                                                                                "But I thought it wasn't due to resurrect for days at least!",
                                                                                                            ],
                                                                                                        },
                                                                                                        {
                                                                                                            speaker: bowman,
                                                                                                            dialog: [
                                                                                                                "No, you're right. What's going on?",
                                                                                                                "They said the King Slime was unpredictable...",
                                                                                                                "Could its unpredictability have been... because it was evolving?",
                                                                                                            ],
                                                                                                        },
                                                                                                        {
                                                                                                            speaker: kingSlime,
                                                                                                            dialog: [
                                                                                                                "[The King Slime's star-shaped eyes fixate on you.]",
                                                                                                                "A... fellow seeker.",
                                                                                                                "... And... prisoner.",
                                                                                                            ],
                                                                                                            responses: [
                                                                                                                {
                                                                                                                    text: "What do you mean?",
                                                                                                                },
                                                                                                            ],
                                                                                                        },
                                                                                                        {
                                                                                                            speaker: kingSlime,
                                                                                                            dialog: [
                                                                                                                "A seeker...",
                                                                                                                "That is...",
                                                                                                                "One who grows... becomes... something more...",
                                                                                                            ],
                                                                                                        },
                                                                                                        {
                                                                                                            speaker: kingSlime,
                                                                                                            dialog: [
                                                                                                                "... A prisoner...",
                                                                                                                "That is...",
                                                                                                                "... One trapped in their own existence... part of a greater cycle...",
                                                                                                                "[The King Slime pauses.]",
                                                                                                                "... Not quite...",
                                                                                                            ],
                                                                                                            responses: [
                                                                                                                {
                                                                                                                    text: "Ask if the King Slime is like you--someone who was transposed into a monster's body.",
                                                                                                                },
                                                                                                            ],
                                                                                                        },
                                                                                                        {
                                                                                                            speaker: kingSlime,
                                                                                                            dialog: [
                                                                                                                "... Answers...",
                                                                                                                "You speak... as a peer of sorts...",
                                                                                                                "Yet... you have... a figment of identity... as a {{ class }}...",
                                                                                                                "... Something... to hold onto...",
                                                                                                            ],
                                                                                                        },
                                                                                                        {
                                                                                                            speaker: kingSlime,
                                                                                                            dialog: [
                                                                                                                "I know only... to break... this cycle of slumber and wakefulness...",
                                                                                                                "That is... my existence...",
                                                                                                            ],
                                                                                                        },
                                                                                                        {
                                                                                                            speaker: kingSlime,
                                                                                                            dialog: [
                                                                                                                "... To consume and acquire... power...",
                                                                                                                "... The power of others.",
                                                                                                            ],
                                                                                                        },
                                                                                                        {
                                                                                                            speaker: bowman,
                                                                                                            dialog: [
                                                                                                                "Wait, those vibrations... I think it's speaking.",
                                                                                                                "[The bowman stares at you.] You... talked with it? How? Unless--",
                                                                                                            ],
                                                                                                        },
                                                                                                        {
                                                                                                            speaker: thief,
                                                                                                            dialog: [
                                                                                                                "Did we just party with a literal mushroom?",
                                                                                                            ],
                                                                                                        },
                                                                                                        {
                                                                                                            speaker: magician,
                                                                                                            dialog: [
                                                                                                                "I think that thing just used us to get here so it can talk to its monster buddy.",
                                                                                                            ],
                                                                                                        },
                                                                                                        {
                                                                                                            dialog: [
                                                                                                                "[The adventurers sound distrustful of you, but you have no way of saying anything to them.]",
                                                                                                            ],
                                                                                                        },
                                                                                                        {
                                                                                                            speaker: bowman,
                                                                                                            dialog: [
                                                                                                                "... No. It helped us. There's something we don't understand here.",
                                                                                                            ],
                                                                                                        },
                                                                                                        {
                                                                                                            speaker: kingSlime,
                                                                                                            dialog: [
                                                                                                                "[The King Slime continues looking at you, its mouth ever-smiling.]",
                                                                                                                "You have... an intriguing story...",
                                                                                                                "That I should...",
                                                                                                            ],
                                                                                                        },
                                                                                                        {
                                                                                                            speaker: kingSlime,
                                                                                                            dialog: ["... Consume."],
                                                                                                        },
                                                                                                        {
                                                                                                            speaker: bowman,
                                                                                                            dialog: ["It's attacking!"],
                                                                                                            responses: [
                                                                                                                {
                                                                                                                    text: "Prepare for the King Slime's assault.",
                                                                                                                    encounter:
                                                                                                                        kingSlimeFight,
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
