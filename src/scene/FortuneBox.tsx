import { useEffect, useState } from "react";
import { EventScene, SCENE_CONDITION_TYPES, ScriptResponse } from "./types";
import { RARITIES } from "../item/types";
import { getRandomInt, getRandomItem } from "../utils";
import Overlay from "../view/Overlay";
import RarityTag from "../ability/AbilityView/RarityTag";
import { createUseStyles } from "react-jss";
import Button from "../view/Button";
import ItemView from "../item/ItemView";
import { getAllPossibleItems } from "../item/utils";
import { bigMesoItem, hugeMesoItem, mesoItem } from "../item/items";
import Icon from "../icon/Icon";
import { QuestionMarkIcon } from "../images/icons";
import { PuzzleProps } from "./TreasureBox/types";
import { COMMON_STYLES } from "../constants";
import classNames from "classnames";
import { casey } from "../enemy/enemy";

const useStyles = createUseStyles({
    ...COMMON_STYLES,
    gambleRoot: {
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
    },
    itemPlaceholder: {
        display: "inline-block",
        borderRadius: "8px",
        padding: 16,
        verticalAlign: "bottom",
        width: "198px",
        minHeight: "148px",
        color: "white",
        border: "1px solid rgba(255, 255, 255, 0.5)",
        position: "relative",
    },
    placeholderInner: {
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
    },
    collectButtonContainer: {
        marginTop: 64,
        minHeight: 64,
        textAlign: "center",
    },
});

export const FortuneBox = ({ player, onComplete }: PuzzleProps) => {
    const [rarity, setRarity] = useState(RARITIES.COMMON);
    const [counter, setCounter] = useState(getRandomInt(25, 30));
    const [item, setItem] = useState(null);
    const classes = useStyles();

    useEffect(() => {
        if (counter <= 0) {
            const allItems = getAllPossibleItems({ player }).filter((item) => (item.rarity || RARITIES.COMMON) === rarity);
            if (!allItems.length) {
                // All items of this rarity have been acquired. Give mesos instead.
                const mesosChart = {
                    [RARITIES.COMMON]: mesoItem,
                    [RARITIES.UNCOMMON]: bigMesoItem,
                    [RARITIES.RARE]: hugeMesoItem,
                };
                setItem(mesosChart[rarity]);
                return;
            }

            setItem(getRandomItem(allItems));
            return;
        }
        setTimeout(() => {
            const rarityShiftChart = {
                [RARITIES.COMMON]: RARITIES.UNCOMMON,
                [RARITIES.UNCOMMON]: RARITIES.RARE,
                [RARITIES.RARE]: RARITIES.COMMON,
            };

            setRarity((prev) => rarityShiftChart[prev]);
            setCounter((prev) => prev - 1);
        }, 1000 / counter); // MS
    }, [counter]);

    const handleClickCollect = () => {
        onComplete({ items: [item] });
    };

    return (
        <Overlay>
            <div className={classes.gambleRoot}>
                <RarityTag rarity={rarity} />
                {!item && (
                    <div className={classes.itemPlaceholder}>
                        <div className={classes.placeholderInner}>
                            <Icon icon={QuestionMarkIcon} />
                        </div>
                    </div>
                )}
                {item && (
                    <div className={classNames(classes.highlight, classes.fadeIn)}>
                        <ItemView item={item} />
                    </div>
                )}
                <div className={classes.collectButtonContainer}>
                    {item && (
                        <span className={classes.fadeIn}>
                            <Button color="primary" onClick={handleClickCollect}>
                                Collect
                            </Button>
                        </span>
                    )}
                </div>
            </div>
        </Overlay>
    );
};

const playRoute: ScriptResponse = {
    text: "Play. [Exchange 100 mesos for a random item]",
    next: [
        {
            puzzle: FortuneBox,
            speaker: casey,
            dialog: ["Woohoo!"],
            loseMesos: 100,
        },
        {
            speaker: casey,
            dialog: ["Woohoo!"],
        },
        {
            speaker: casey,
            dialog: ["Woohoo!"],
            conditionalNext: [
                {
                    conditions: [
                        {
                            mesos: 99,
                            comparator: "gt",
                        },
                    ],
                    next: [
                        {
                            speaker: casey,
                            dialog: ["Like what you got? Wanna play again?"],
                            responses: [
                                {
                                    text: "Play. [Exchange 100 mesos for a random item]",
                                    next: [
                                        {
                                            puzzle: FortuneBox,
                                            speaker: casey,
                                            dialog: ["Yay!"],
                                            loseMesos: 100,
                                        },
                                        {
                                            speaker: casey,
                                            dialog: ["Yay!"],
                                        },
                                        {
                                            speaker: casey,
                                            dialog: ["And that's it! Thanks for playing, Mushie! Have fun storming the castle."],
                                            responses: [
                                                {
                                                    text: "Bye.",
                                                    isExit: true,
                                                },
                                            ],
                                        },
                                    ],
                                },
                                {
                                    text: "No thanks.",
                                    next: [
                                        {
                                            speaker: casey,
                                            dialog: ["Alrighty, have fun storming the castle, Mushie."],
                                            responses: [
                                                {
                                                    text: "Bye.",
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
                    conditions: [],
                    next: [
                        {
                            speaker: casey,
                            dialog: ["Like what you got? I hope you do! Thanks for playing, Mushie, and have fun storming the castle."],
                            responses: [
                                {
                                    text: "Bye.",
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

const gambleBadRoute: ScriptResponse = {
    text: "Gambling is bad. No thanks.",
    next: [
        {
            speaker: casey,
            dialog: [
                "Saving up those mesos for something? Savvy, Mushie! Let me at least tell you that the odds are in your favor, though.",
            ],
            responses: [
                {
                    ...playRoute,
                    text: "Fine, let's give it a try. [Exchange 100 mesos for a random item]",
                },
                {
                    text: "Shake your head to decline.",
                    next: [
                        {
                            speaker: casey,
                            dialog: ["Well, if you insist. Maybe we'll meet again!"],
                            responses: [
                                {
                                    text: "Continue journey.",
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

export const fortuneBoxScene: EventScene = {
    id: "fortune-box",
    conditions: [
        {
            type: SCENE_CONDITION_TYPES.MESOS,
            comparator: "gt",
            value: 99,
        },
    ],
    script: [
        {
            speaker: casey,
            dialog: ["Hey Mushie, want to win a prize?"],
        },
        {
            speaker: casey,
            dialog: ["Anyone can play, as long as you have 100 mesos!"],
            responses: [
                playRoute,
                gambleBadRoute,
                {
                    text: "Who are you?",
                    next: [
                        {
                            speaker: casey,
                            dialog: ["Ohhh, don't look at me like that. I'm Casey, and I'm a friend, I swear!"],
                        },
                        {
                            speaker: casey,
                            dialog: ["I think everyone could use a break from grinding sometimes, even if only for a minute or so."],
                        },
                        {
                            speaker: casey,
                            dialog: [
                                "Besides, who doesn't want a neat little item to take with them on their journey? And then you can get right back at it afterward.",
                                "Why? 'Cause we can and it's free!",
                            ],
                        },
                        {
                            speaker: casey,
                            dialog: [
                                "[Casey coughs.] Alright, alright, fine, so this time, it's not free. It's 100 mesos.",
                                "Anyway, how about it?",
                            ],
                            responses: [playRoute, gambleBadRoute],
                        },
                    ],
                },
            ],
        },
    ],
};
