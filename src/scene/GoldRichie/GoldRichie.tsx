import { createUseStyles } from "react-jss";
import { Wave } from "../../battle/types";
import { SCENE_CONDITION_TYPES, EventScene } from "../types";
import { adventurerFighter, adventurerIceWizard, goldRichie, goldRichie2 } from "./GoldRichieCharacters";
import { LithCornerImage } from "../../images";
import classNames from "classnames";

const goldRichieFight1: { characters: string[]; waves: Wave[] } = {
    characters: [goldRichie.name],
    waves: [
        {
            enemies: [null, null, goldRichie, null, null],
        },
    ],
};

const goldRichieFight2: { characters: string[]; waves: Wave[] } = {
    characters: [goldRichie.name],
    waves: [
        {
            enemies: [null, adventurerFighter, goldRichie2, adventurerIceWizard, null],
        },
    ],
};

export enum GOLD_RICHIE_EVENTS {
    INTRO = "gold-richie-intro",
    TRADE = "gold-richie-trade",
    FOUGHT = "gold-richie-fought",
    MERCENARIES = "gold-richie-mercenaries",
    RETRADE = "gold-richie-retrade",
}

const useStyles = createUseStyles({
    root: {
        position: "relative",
        width: "100%",
        height: "100%",
    },
    backdrop: {
        width: "100%",
        height: "100%",
    },
    character: {
        position: "absolute",
        filter: "drop-shadow(0 0 3px #fffee8) drop-shadow(0 0 3px #fffee8)",
    },
    goldRichie: {
        top: 334,
        left: 575,
    },
    player: {
        maxHeight: 65,
        top: 367,
        left: 385,
    },
});

const GoldRichieBackdrop = ({ player }) => {
    const classes = useStyles();
    return (
        <div className={classes.root}>
            <img src={LithCornerImage} alt="Lith Corner" className={classes.backdrop} />
            <img src={player.image} alt="Player" className={classNames(classes.character, classes.player)} />
            <img src={goldRichie.image} alt="Gold Richie" className={classNames(classes.character, classes.goldRichie)} />
        </div>
    );
};

export const goldRichieIntro: EventScene = {
    id: GOLD_RICHIE_EVENTS.INTRO,
    script: [
        {
            scene: GoldRichieBackdrop,
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
                    id: GOLD_RICHIE_EVENTS.TRADE,
                },
                { text: "Mug Gold Richie", encounter: goldRichieFight1, isExit: true, infamy: 5, id: GOLD_RICHIE_EVENTS.FOUGHT },
            ],
        },
    ],
};

export const goldRichieMercenaries: EventScene = {
    id: GOLD_RICHIE_EVENTS.MERCENARIES,
    conditions: [
        {
            type: SCENE_CONDITION_TYPES.VISITED_SCENES,
            value: GOLD_RICHIE_EVENTS.FOUGHT,
            comparator: "includes",
        },
    ],
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
            responses: [{ text: "Fight Gold Richie and his guards", encounter: goldRichieFight2, infamy: 5 }],
        },
    ],
};

export const goldRichieRetrade: EventScene = {
    id: GOLD_RICHIE_EVENTS.RETRADE,
    conditions: [
        {
            type: SCENE_CONDITION_TYPES.VISITED_SCENES,
            value: GOLD_RICHIE_EVENTS.TRADE,
            comparator: "includes",
        },
    ],
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
};
