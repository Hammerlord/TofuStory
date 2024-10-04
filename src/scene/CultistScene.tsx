import classNames from "classnames";
import { createUseStyles } from "react-jss";
import { attackPower, hardy, ward } from "../ability/Effects";
import { ACTION_TYPES, EFFECT_CLASSES, EFFECT_TYPES, Minion, TARGET_TYPES } from "../ability/types";
import { BATTLE_TYPES } from "../battle/types";
import { attack } from "../enemy/abilities";
import { armorDown } from "../enemy/effect";
import { martialArtist } from "../enemy/martialArtist";
import {
    BrokenHeartEmojiImage,
    DoubleStabImage,
    EncroachingDarknessImage,
    NefariousMonkBlueImage,
    NefariousMonkRedImage,
    TwilightPerionImage,
    WeaponMasteryImage,
    ZakumImage,
} from "../images";
import { zakumHelmet } from "../item/items";
import { SCENE_STYLES } from "./constants";
import { EventScene, SCENE_CONDITION_TYPES, SceneEncounter, ScriptResponse } from "./types";

const cultistA: Minion = {
    name: "Cultist A",
    image: NefariousMonkRedImage,
    maxHP: 300,
    isElite: true,
    abilities: [
        {
            name: "Double Stab",
            image: DoubleStabImage,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 6,
                },
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 6,
                },
            ],
        },
        {
            ...attack,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 9,
                },
            ],
        },
        {
            name: "Heartbreaker",
            image: BrokenHeartEmojiImage,
            description: "Adds a Hindrance card to your deck.",
            resourceCost: 3,
            castTime: 1,
            actions: [
                {
                    type: ACTION_TYPES.ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    damage: 6,
                    addCardsToDeck: [
                        {
                            name: "Broken Vitality",
                            image: BrokenHeartEmojiImage,
                            description: "When drawn, you are afflicted by Armor Down and reduced healing for the turn.",
                            removeAfterTurn: true,
                            onDraw: {
                                ability: {
                                    name: "Broken Vitality",
                                    image: BrokenHeartEmojiImage,
                                    actions: [
                                        {
                                            type: ACTION_TYPES.EFFECT,
                                            target: TARGET_TYPES.SELF,
                                            effects: [
                                                { ...armorDown, duration: 1 },
                                                {
                                                    name: "Broken Vitality",
                                                    icon: BrokenHeartEmojiImage,
                                                    type: EFFECT_TYPES.NONE,
                                                    class: EFFECT_CLASSES.DEBUFF,
                                                    healingReceived: -1,
                                                    duration: 1,
                                                },
                                            ],
                                        },
                                    ],
                                },
                            },
                            actions: [
                                {
                                    type: ACTION_TYPES.HINDER,
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ],
    effects: [hardy],
};

const cultistB: Minion = {
    name: "Cultist B",
    image: NefariousMonkBlueImage,
    maxHP: 250,
    abilities: [
        {
            name: "Rally",
            image: WeaponMasteryImage,
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    area: 2,
                    effects: [
                        {
                            ...attackPower,
                            stacks: 2,
                            duration: 3,
                        },
                    ],
                },
            ],
        },
        {
            name: "Echo of the Exiled One",
            image: EncroachingDarknessImage,
            actions: [
                {
                    type: ACTION_TYPES.RANGE_ATTACK,
                    target: TARGET_TYPES.HOSTILE,
                    icon: EncroachingDarknessImage,
                    animationOptions: {
                        width: 100,
                        height: 100,
                    },
                    damage: 7,
                },
            ],
        },
        {
            name: "Warding",
            image: ward.icon,
            description: "Grants a shield that wards off the next attack.",
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    area: 2,
                    effects: [ward],
                },
            ],
        },
    ],
    effects: [hardy],
};

const useStyles = createUseStyles({
    ...SCENE_STYLES,
    player: {
        ...SCENE_STYLES.player,
        top: 273,
        left: 377,
    },
    cultistA: {
        top: 235,
        left: 500,
    },
    cultistB: {
        top: 235,
        left: 550,
    },
    zakum: {
        position: "absolute",
        transform: "translateX(-50%)",
        top: 5,
        left: 300,
        filter: "brightness(0.5)",
        animationName: "$upAndDown",
        animationDuration: "2s",
        animationIterationCount: "infinite",
        animationDirection: "alternate-reverse",
        opacity: 0.5,
    },
    "@keyframes upAndDown": {
        from: {
            transform: "translateY(0)",
        },
        to: {
            transform: "translateY(-8px)",
        },
    },
});

const CultistBackdrop = ({ player, showZakum }) => {
    const classes = useStyles();
    return (
        <div>
            <img src={TwilightPerionImage} alt="Rocky backdrop" className={classes.backdrop} />
            <img src={cultistA.image} alt="Cultist A" className={classNames(classes.character, classes.cultistA)} />
            <img src={cultistB.image} alt="Cultist B" className={classNames(classes.character, classes.cultistB)} />
            <img src={player.image} alt="Player" className={classNames(classes.character, classes.player)} />
            {showZakum && <img src={ZakumImage} alt="Zakum" className={classNames(classes.zakum)} />}
        </div>
    );
};

const tributeAmount = 35;

const bloodTributeResponse: ScriptResponse = {
    text: `Pay the blood tribute. [Lose ${tributeAmount} HP]`,
    infamy: 3,
    next: [
        { dialog: [`[You lost ${tributeAmount} HP.]`], loseHP: tributeAmount },
        { dialog: ["..."] },
        {
            scene: (other) => <CultistBackdrop {...other} showZakum={true} />,
            speaker: cultistA,
            dialog: ["Behold, the visage of the Great One!", "With this offering, you have received Zakum's favor."],
            items: {
                itemPool: [zakumHelmet],
            },
        },
        {
            speaker: cultistB,
            dialog: ["Go forth. The Four Arms will prove the sign. Let the power of the Exiled One flow through you."],
            responses: [
                {
                    text: "Thanks, I guess...",
                    isExit: true,
                },
            ],
        },
    ],
};

const cultistFight: SceneEncounter = {
    waves: [
        {
            enemies: [null, cultistA, null, cultistB, null],
        },
    ],
    type: BATTLE_TYPES.ELITE_ENCOUNTER,
};

export const cultistScene: EventScene = {
    conditions: [
        {
            type: SCENE_CONDITION_TYPES.INFAMY,
            comparator: "gt",
            value: 5,
        },
        {
            type: SCENE_CONDITION_TYPES.ITEMS,
            comparator: "not-includes",
            value: zakumHelmet.name,
        },
    ],
    id: "cultists-of-the-exiled-one",
    script: [
        {
            scene: CultistBackdrop,
            speaker: cultistA,
            dialog: [
                "Dusk comes! The exiled Great One shall soon spread its roots across Victoria Island. Know and fear its arrival, before it is too late!",
            ],
        },
        {
            speaker: cultistB,
            dialog: ["Step forward, be measured by the Great One's watchful eye.", "... By paying tribute in blood!"],
            responses: [
                bloodTributeResponse,
                {
                    text: "Who is this, uh... Great One?",
                    next: [
                        {
                            speaker: cultistA,
                            dialog: ["The Sealed One, the Exiled One, the Great One... Zakum has many names."],
                        },
                        {
                            speaker: cultistA,
                            dialog: [
                                "It is an ancient spirit, who dwells deep within a faraway land. But its name and its glory has spread far beyond those shores, and shall soon encompass the whole world.",
                            ],
                        },
                        {
                            speaker: cultistB,
                            dialog: [
                                "We are Zakum's acolytes, who have heard its call. Mere servants. Few are worthy of becoming its true herald.",
                            ],
                        },
                        {
                            speaker: cultistB,
                            dialog: [
                                "Ambition! Devotion! An insatiable appetite for power! Those are the qualities that Zakum favors in its chosen. If you yearn for more in this lifetime, then the benevolent Great One has much to offer you.",
                            ],

                            responses: [
                                bloodTributeResponse,
                                {
                                    text: "Decline Zakum's blessing.",
                                    next: [
                                        {
                                            speaker: cultistA,
                                            dialog: ["How dare you refuse the Great One? Die!"],
                                            responses: [
                                                {
                                                    text: "Defend yourself.",
                                                    encounter: cultistFight,
                                                },
                                            ],
                                        },
                                        {
                                            speaker: cultistB,
                                            dialog: [
                                                "It is futile! The Great One reaches all, and in time, it will claim Victoria and all its inhabitants, including you!",
                                            ],
                                        },
                                        {
                                            dialog: [
                                                "[You hear a rumbling in the distance, deep and resonant enough to make the mountains quake. It sounds like laughter.]",
                                            ],
                                        },
                                        {
                                            dialog: ["..."],
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
