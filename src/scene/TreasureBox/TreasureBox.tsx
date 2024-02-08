import classNames from "classnames";
import { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
import { MesoImage, TreasureChestImage } from "../../images";
import { LockIcon, WarningIcon } from "../../images/icons";
import { Item, ITEM_TYPES, RARITIES } from "../../item/types";
import { ITEMS } from "../../Map/routes/eventList";
import { getRandomInt, getRandomItem } from "../../utils";
import BannerNotice from "../../view/BannerNotice";
import Button from "../../view/Button";
import { PuzzleProps } from "./types";
import { useAppDispatch } from "../../hooks";
import { playerStateSlice } from "../../character/playerReducer";
import Icon from "../../icon/Icon";
import Overlay from "../../view/Overlay";
import { COMMON_ITEM_CHANCE, UNCOMMON_ITEM_CHANCE } from "../../constants";

const useStyles = createUseStyles({
    inner: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translateX(-50%) translateY(-50%)",
        textAlign: "center",
    },
    puzzleContainer: {
        display: "inline-block",
        padding: "1rem 2rem",
        border: "2px solid rgba(214, 214, 128, 0.8)",
        background: "rgba(165, 155, 129, 0.5)",
        borderRadius: "8px",
        marginBottom: "96px",
    },
    bannerContainer: {
        position: "fixed",
        width: "40%",
        top: "25%",
        left: "50%",
        transform: "translateX(-50%)",
    },
    chestContainer: {
        position: "relative",
    },
    center: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translateX(-50%) translateY(-50%)",
    },
    "@keyframes openChest": {
        "0%": {
            transform: "rotate(-2deg) translateY(0)",
        },
        "25%": {
            transform: "rotate(-1deg) translateY(-3px)",
        },
        "50%": {
            transform: "rotate(1deg) translateY(-5px)",
        },
        "75%": {
            transform: "rotate(-1deg) translateY(-3px)",
        },
        "100%": {
            transform: "rotate(-1deg) translateY(0)",
        },
    },
    "@keyframes fadeOut": {
        "0%": {
            opacity: "100%",
        },
        "100%": {
            opacity: "0%",
        },
    },
    "@keyframes cursed": {
        "0%": {
            WebkitFilter: "brightness(0.4) drop-shadow(0 0 5px purple) drop-shadow(0 0 3px purple)",
            filter: "brightness(0.4) drop-shadow(0 0 5px purple) drop-shadow(0 0 3px purple)",
        },
        "100%": {
            WebkitFilter: "brightness(0.25) drop-shadow(0 0 10px purple) drop-shadow(0 0 5px purple)",
            filter: "brightness(0.25) drop-shadow(0 0 10px purple) drop-shadow(0 0 5px purple)",
        },
    },
    treasureContainer: {
        background:
            "linear-gradient(90deg, rgba(0,212,255,0) 0%, rgba(0,0,0,0.9) 30%, rgba(0,0,0,0.9) 50%, rgba(0,0,0,0.9) 30%, rgba(0,212,255,0) 100%)",
        color: "white",
        padding: "16px 8px",
        minWidth: "300px",
        zIndex: 10,
        marginBottom: 16,
    },
    treasure: {
        listStyle: "none",
        padding: 0,
        marginBottom: 0,
    },
    item: {
        margin: 0,
        lineHeight: "16px",
    },
    itemName: {
        verticalAlign: "top",
    },
    treasureChest: {
        width: 200,
        height: 150,
        objectFit: "contain",
        imageRendering: "pixelated",
        marginTop: "32px",
        marginBottom: "16px",
        "&.open": {
            animationDuration: "1s",
            animationName: "$openChest",
            transitionTimingFunction: "ease-in-out",
            animationIterationCount: "infinite",
            cursor: "pointer",
        },
        "&.fadeout": {
            animationDuration: "0.5s",
            animationName: "$fadeOut",
            transitionTimingFunction: "ease-out",
            animationIterationCount: "unset",
            cursor: "unset",
            animationFillMode: "forwards",
        },
        "&.cursed": {
            animationDuration: "2s",
            animationName: "$cursed",
            transitionTimingFunction: "ease-in-out",
            animationIterationCount: "infinite",
            animationDirection: "alternate-reverse",
        },
    },
    lockContainer: {
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        color: "white",
        width: "48px",
        height: "48px",
        fontSize: "32px",
        borderRadius: "48px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: "translateX(-50%) translateY(-50%)",
    },
    lock: {
        width: "32px",
        height: "32px",
        margin: "auto",
    },
    buttonContainer: {
        minHeight: "38px",
    },
    warning: {
        color: "rgb(255, 225, 200)",
        background: "rgba(10, 10, 10, 0.9)",
        padding: "8px",
        borderRadius: "4px",
    },
    warningText: {},
});

export enum TREASURE_BOX_CURSES {
    damage = "damage",
}

const { updatePlayer } = playerStateSlice?.actions || {};

const TreasureBox = ({
    onExit,
    initItems = [],
    initMesos,
    title = "Treasure Box",
    onLoot,
    currentItems = [],
    Puzzle,
    player,
    curse,
}: {
    onExit: any;
    initItems?: Item[];
    initMesos?: number | number[]; // [min, max]
    title?: string;
    currentItems?: Item[]; // Items already held by the player
    onLoot: ({ mesos, items }: { mesos: number; items: Item[] }) => void;
    Puzzle?: ({ onComplete, completed, onInteraction }: PuzzleProps) => JSX.Element;
    player: any;
    curse?: "damage";
}) => {
    const classes = useStyles();
    const [completed, setCompleted] = useState(!Puzzle);
    const [isChestOpened, setIsChestOpened] = useState(false);
    const [items, setItems] = useState([]);
    const [mesos, setMesos] = useState(0);
    const dispatch = useAppDispatch();

    const handleClickChest = () => {
        if (completed) {
            setIsChestOpened(true);
            onLoot({ mesos, items });
        }
    };

    useEffect(() => {
        let mesosToSet = 0;
        if (initItems?.length > 0) {
            setItems(initItems);
        } else {
            const alreadyObtained = currentItems.reduce((acc, item: Item) => {
                if (item.type === ITEM_TYPES.EQUIPMENT) {
                    acc[item.name] = true;
                }
                return acc;
            }, {});

            const selectedRarity = (() => {
                const roll = Math.random();

                if (roll <= COMMON_ITEM_CHANCE) {
                    return RARITIES.COMMON;
                }

                if (roll > COMMON_ITEM_CHANCE && roll <= UNCOMMON_ITEM_CHANCE + COMMON_ITEM_CHANCE) {
                    return RARITIES.UNCOMMON;
                }

                return RARITIES.RARE;
            })();

            let itemPool = ITEMS.filter((item: Item) => !alreadyObtained[item.name]);
            let filteredByRarity = itemPool.filter((item) => (item.rarity || RARITIES.COMMON) === selectedRarity);
            if (!filteredByRarity.length) {
                const upRarity = {
                    [RARITIES.COMMON]: RARITIES.UNCOMMON,
                    [RARITIES.UNCOMMON]: RARITIES.RARE,
                }[selectedRarity];

                if (upRarity) {
                    filteredByRarity = itemPool.filter((item) => item.rarity === upRarity);
                }
            }

            itemPool = filteredByRarity;

            const equipment = getRandomItem(itemPool);
            if (equipment) {
                setItems([equipment]);
            } else {
                mesosToSet += getRandomInt(100, 150);
            }
        }

        if (Array.isArray(initMesos)) {
            mesosToSet += getRandomInt(initMesos[0], initMesos[1]);
        } else if (typeof initMesos === "number") {
            mesosToSet += initMesos;
        }

        setMesos(mesosToSet);
    }, []);

    const handlePuzzleInteraction = () => {
        if (curse) {
            if (player.HP > 1) {
                dispatch(
                    updatePlayer({
                        HP: player.HP - 1,
                    })
                );
            }
        }
    };

    return (
        <Overlay>
            <div className={classes.bannerContainer}>
                <BannerNotice>
                    {curse && "Cursed"} {title}
                </BannerNotice>
            </div>
            <div className={classes.inner}>
                <div className={classes.chestContainer}>
                    <img
                        src={TreasureChestImage}
                        className={classNames(classes.treasureChest, {
                            open: completed,
                            fadeout: isChestOpened,
                            cursed: !completed && !isChestOpened && curse,
                        })}
                        onClick={handleClickChest}
                    />
                    {isChestOpened && (
                        <div className={classes.center}>
                            <div className={classNames(classes.treasureContainer)}>
                                You obtain:
                                <ul className={classes.treasure}>
                                    {items.map((item: Item) => (
                                        <li key={item.name} className={classes.item}>
                                            <img src={item.image} /> <span className={classes.itemName}>{item.name}</span>
                                        </li>
                                    ))}
                                    {mesos > 0 && (
                                        <li className={classes.item}>
                                            <img src={MesoImage} /> {mesos}
                                        </li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    )}
                    {!completed && (
                        <div className={classes.lockContainer}>
                            <LockIcon className={classes.lock} />
                        </div>
                    )}
                </div>
                {Puzzle && (
                    <>
                        {curse && (
                            <p className={classes.warning}>
                                <Icon icon={WarningIcon} size="sm" />
                                {"  "}
                                <span className={classes.warningText}>Every time you change the lock, you'll lose 1 HP.</span>
                            </p>
                        )}

                        <div className={classes.puzzleContainer}>
                            <Puzzle onComplete={() => setCompleted(true)} completed={completed} onInteraction={handlePuzzleInteraction} />
                        </div>
                    </>
                )}

                <div className={classes.buttonContainer}>
                    {!completed && (
                        <Button color={"warning"} onClick={onExit}>
                            {"Abandon"}
                        </Button>
                    )}
                    {isChestOpened && (
                        <Button color={"primary"} onClick={onExit}>
                            {"Continue Journey"}
                        </Button>
                    )}
                </div>
            </div>
        </Overlay>
    );
};

export default TreasureBox;
