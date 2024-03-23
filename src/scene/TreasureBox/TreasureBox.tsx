import classNames from "classnames";
import { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
import { playerStateSlice } from "../../character/playerReducer";
import { useAppDispatch } from "../../hooks";
import Icon from "../../icon/Icon";
import { MesoCoinImage, MesoImage, TreasureChestImage } from "../../images";
import { LockIcon, WarningIcon } from "../../images/icons";
import ItemView from "../../item/ItemView";
import { Item } from "../../item/types";
import { rollItemPool } from "../../item/utils";
import { getRandomInt, getRandomItem } from "../../utils";
import BannerNotice from "../../view/BannerNotice";
import Button from "../../view/Button";
import Overlay from "../../view/Overlay";
import { PuzzleProps } from "./types";
import { Player } from "../../character/types";

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
    puzzlePlaceholder: {
        marginBottom: "96px",
        minHeight: "88px",
    },
    bannerContainer: {
        position: "fixed",
        width: "40%",
        top: "20%",
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
    "@keyframes fadeIn": {
        "0%": {
            opacity: "0%",
        },
        "100%": {
            opacity: "100%",
        },
    },
    "@keyframes cursed": {
        "0%": {
            filter: "brightness(0.4) drop-shadow(0 0 5px purple) drop-shadow(0 0 3px purple)",
        },
        "100%": {
            filter: "brightness(0.25) drop-shadow(0 0 10px purple) drop-shadow(0 0 5px purple)",
        },
    },
    treasureContainer: {
        background:
            "linear-gradient(90deg, rgba(0,212,255,0) 0%, rgba(0,0,0,0.8) 30%, rgba(0,0,0,0.9) 50%, rgba(0,0,0,0.8) 70%, rgba(0,212,255,0) 100%)",
        color: "white",
        padding: "64px 100px",
        zIndex: 10,
        marginBottom: 16,
        position: "absolute",
        top: 0,
        left: "50%",
        transform: "translateX(-50%)",
        opacity: 0,
        animationDuration: "0.5s",
        animationName: "$fadeIn",
        transitionTimingFunction: "ease-out",
        animationDelay: "0.25s",
        animationFillMode: "forwards",
        paddingBottom: 100,
    },
    mesos: {
        lineHeight: "28px",
        fontSize: "18px",
        marginBottom: "16px",
        "& img": {
            verticalAlign: "bottom",
        },
    },
    itemsContainer: {
        display: "flex",
    },
    item: {
        margin: 16,
    },
    border: {
        borderTop: 0,
        width: 250,
        borderBottom: "1px solid rgba(255, 255, 255, 0.5)",
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
    },
    cursed: {
        animationDuration: "2s",
        animationName: "$cursed",
        transitionTimingFunction: "ease-in-out",
        animationIterationCount: "infinite",
        animationDirection: "alternate-reverse",
    },
    open: {
        animationDuration: "1s",
        animationName: "$openChest",
        transitionTimingFunction: "ease-in-out",
        animationIterationCount: "infinite",
        cursor: "pointer",
    },
    fadeOut: {
        animationDuration: "0.5s",
        animationName: "$fadeOut",
        transitionTimingFunction: "ease-out",
        animationIterationCount: "unset",
        cursor: "unset",
        animationFillMode: "forwards",
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
        zIndex: 10,
        position: "relative",
        marginTop: 48,
    },
    warning: {
        color: "rgb(255, 225, 200)",
        background: "rgba(10, 10, 10, 0.9)",
        padding: "8px",
        borderRadius: "4px",
    },
    disableButton: {
        visibility: "hidden",
        pointerEvents: "none",
    },
});

export enum TREASURE_BOX_CURSES {
    damage = "damage",
}

const { updatePlayer } = playerStateSlice?.actions || {};

const CURSE_RARE_BONUS = 0.4;
const CURSE_UNCOMMON_BONUS = 0.2;
const BASE_NUM_CHOICES = 3; // How many choices are offered
const maxAmount = 1; // How many items the player can choose

const TreasureBox = ({
    onExit,
    initItems = [],
    initMesos,
    title = "Treasure Box",
    onLoot,
    Puzzle,
    player,
    curse,
}: {
    onExit: any;
    initItems?: Item[];
    initMesos?: number | number[]; // [min, max]
    title?: string;
    onLoot: ({ mesos, items }: { mesos: number; items: Item[] }) => void;
    Puzzle?: ({ onComplete, completed, onInteraction }: PuzzleProps) => JSX.Element;
    player: Player;
    curse?: "damage";
}) => {
    const classes = useStyles();
    const [isChestUnlocked, setIsChestUnlocked] = useState(!Puzzle);
    const [isChestOpened, setIsChestOpened] = useState(false);
    const [items, setItems] = useState([]);
    const [selectedItemIndices, setSelectedItemIndices]: [number[], Function] = useState([]);
    const [mesos, setMesos] = useState(0);
    const dispatch = useAppDispatch();

    const handleClickChest = () => {
        if (isChestUnlocked) {
            setIsChestOpened(true);
        }
    };

    useEffect(() => {
        let mesosToSet = curse ? getRandomInt(50, 100) : 0;
        if (initItems?.length > 0) {
            setItems(initItems);
        } else {
            const bonuses = curse ? { uncommon: CURSE_UNCOMMON_BONUS, rare: CURSE_RARE_BONUS } : undefined;
            const treasure = [];
            Array.from({ length: BASE_NUM_CHOICES }).forEach(() => {
                const equipment = getRandomItem(rollItemPool({ player, bonuses, excludeItems: treasure }));
                if (equipment) {
                    treasure.push(equipment);
                } else {
                    mesosToSet += getRandomInt(100, 150);
                }
            });
            setItems(treasure);
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

    const handleClickSelect = () => {
        onLoot({ mesos, items: selectedItemIndices.map((i) => items[i]) });
        onExit();
    };

    const handleClickItem = (index: number) => {
        if (maxAmount === 1) {
            setSelectedItemIndices([index]);
            return;
        }
        if (selectedItemIndices.includes(index)) {
            // Deselect if selected
            setSelectedItemIndices((prev) => prev.filter((i) => i !== index));
            return;
        }
        if (selectedItemIndices.length < maxAmount) {
            setSelectedItemIndices((prev) => [...prev, index]);
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
                            [classes.open]: isChestUnlocked,
                            [classes.fadeOut]: isChestOpened,
                            [classes.cursed]: !isChestUnlocked && !isChestOpened && curse,
                        })}
                        onClick={handleClickChest}
                    />
                    {isChestOpened && (
                        <div className={classNames(classes.treasureContainer)}>
                            <div>You obtain</div>

                            {mesos > 0 && mesos < 50 && (
                                <div className={classes.mesos}>
                                    <img src={MesoImage} /> {mesos}
                                </div>
                            )}
                            {mesos >= 50 && (
                                <div className={classes.mesos}>
                                    <img src={MesoCoinImage} /> {mesos}
                                </div>
                            )}
                            <hr className={classes.border} />
                            <h3>Pick an item:</h3>
                            <div className={classes.itemsContainer}>
                                {items.map((item, i) => (
                                    <ItemView
                                        item={item}
                                        key={[item.name, i].join("-")}
                                        highlight={selectedItemIndices.includes(i)}
                                        className={classes.item}
                                        onClick={() => handleClickItem(i)}
                                        playerClass={player.class}
                                    />
                                ))}
                            </div>
                            {isChestOpened && (
                                <div className={classes.buttonContainer}>
                                    <Button color={"primary"} onClick={handleClickSelect} disabled={!selectedItemIndices.length}>
                                        {"Select"}
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                    {!isChestUnlocked && (
                        <div className={classes.lockContainer}>
                            <LockIcon className={classes.lock} />
                        </div>
                    )}
                </div>
                {Puzzle && (
                    <div
                        className={classNames({
                            [classes.fadeOut]: isChestOpened,
                        })}
                    >
                        {curse && (
                            <p className={classes.warning}>
                                <Icon icon={WarningIcon} size="sm" />
                                {"  "}
                                <span>Every time you change the lock, you'll lose 1 HP.</span>
                            </p>
                        )}

                        <div className={classes.puzzleContainer}>
                            <Puzzle
                                onComplete={() => setIsChestUnlocked(true)}
                                completed={isChestUnlocked}
                                onInteraction={handlePuzzleInteraction}
                                player={player}
                            />
                        </div>
                    </div>
                )}
                {!Puzzle && <div className={classes.puzzlePlaceholder} />}
                <div
                    className={
                        (classes.buttonContainer,
                        classNames({
                            [classes.disableButton]: isChestOpened || isChestUnlocked,
                        }))
                    }
                >
                    <Button color={"warning"} onClick={onExit}>
                        {"Abandon"}
                    </Button>
                </div>
            </div>
        </Overlay>
    );
};

export default TreasureBox;
