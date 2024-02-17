import classNames from "classnames";
import Handlebars from "handlebars";
import { useEffect, useMemo, useState } from "react";
import { createUseStyles } from "react-jss";
import Camp from "../Map/Camp";
import { REGIONS } from "../Map/regions";
import CardRemovalGrid from "../Menu/CardRemovalGrid";
import { PLAYER_CLASSES } from "../Menu/types";
import { Ability, HandAbility, Minion } from "../ability/types";
import ItemSelection from "../item/ItemSelection";
import { ITEM_TYPES, Item } from "../item/types";
import Button from "../view/Button";
import TreasureBox from "./TreasureBox/TreasureBox";
import { EventScene, ScriptConditions, ScriptNode, ScriptResponse } from "./types";
import { Player } from "../character/types";
import { useAppDispatch, useAppSelector } from "../hooks";
import { passesValueComparison } from "../battle/passesConditions";
import { playerStateSlice } from "../character/playerReducer";
import { shuffle } from "../utils";
import { mesoItem } from "../item/items";

const useStyles = createUseStyles({
    root: {
        width: "100%",
        height: "100%",
        background: "rgba(25, 25, 25, 0.9)",
        color: "white",
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    backgroundContainer: {
        width: "100%",
        height: "100%",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
    },
    backgroundOverlay: {
        position: "fixed",
        background: "rgba(50, 50, 50, 0.7)",
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    inner: {
        textAlign: "center",
        margin: "auto",
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        fontSize: "1.2rem",
        height: "700px",
    },
    wrapper: {
        position: "absolute",
        display: "flex",
        flexDirection: "column",
        left: "50%",
        transform: "translateX(-50%)",
        marginTop: "-100px",
    },
    dialogContainer: {
        border: "1px solid rgba(255, 255, 255, 0.5)",
        borderRadius: "8px",
        display: "flex",
        minHeight: "100px",
        width: "40vw",
        minWidth: "600px",
        padding: "16px 32px",
        textAlign: "left",
        letterSpacing: "0.015rem",
        lineHeight: "26px",
        background: "rgba(25, 25, 25, 0.9)",
        cursor: "pointer",
        marginBottom: "8px",

        "& p": {
            marginTop: 0,

            "&:(:last-child)": {
                marginBottom: 0,
            },
        },
    },
    portraitContainer: {
        minHeight: "100px",
        marginRight: "24px",
        textAlign: "center",
        fontSize: "1rem",
    },
    portrait: {
        minHeight: "70px",
        minWidth: "100px",
        maxHeight: "100px",
        objectFit: "contain",
        display: "flex",
        alignItems: "flex-end",

        "& img": {
            margin: "0 auto",
        },
    },
    dialog: {
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        userSelect: "none",
    },
    speakerName: {
        marginTop: "8px",
    },
    "@keyframes fade": {
        "0%": {
            opacity: 0,
        },
        "100%": {
            opacity: 1,
        },
    },
    feedbackContainer: {
        width: "40vw",
        minWidth: "600px",
        opacity: 0,
        animationName: "$fade",
        animationTimingFunction: "ease-in",
        animationDelay: "1s",
        animationDuration: "0.5s",
        animationFillMode: "forwards",
    },
    option: {
        background:
            "linear-gradient(90deg, rgba(0,212,255,0) 0%, rgba(0,0,0,0.75) 30%, rgba(0,0,0,0.75) 50%, rgba(0,0,0,0.75) 70%, rgba(0,212,255,0) 100%)",
        padding: "8px 16px",
        width: "100%",
        cursor: "pointer",
        "& *": {
            verticalAlign: "bottom",
        },
    },
    response: {
        marginBottom: "8px",
        "& span:before": {
            content: "'◇'",
            marginRight: "8px",
        },
        "&:hover span:before": {
            content: "'◆'",
        },
    },
    dialogArrow: {
        animationName: "$fade",
        animationDuration: "1.5s",
        animationIterationCount: "infinite",
        animationDirection: "alternate-reverse",
        width: "100%",
        textAlign: "right",
        "& > span": {
            transform: "rotate(90deg)",
            display: "inline-block",
        },
    },
    skipButton: {
        position: "absolute",
        right: 0,
        top: -40,
    },
    treasureBoxContainer: {
        position: "absolute",
        top: "50%",
        left: "50%",
        width: "100%",
        height: "100%",
    },
});

const classesInterpolation = {
    [PLAYER_CLASSES.WARRIOR]: "warrior",
    [PLAYER_CLASSES.MAGICIAN]: "magician",
};

const classesPluralInterpolation = {
    [PLAYER_CLASSES.WARRIOR]: "warriors",
    [PLAYER_CLASSES.MAGICIAN]: "magicians",
};

const { logVisitedEvent, addInfamy: addInfamy } = playerStateSlice.actions;

const ScenePlayer = ({
    scene,
    player,
    updatePlayer,
    onBattle,
    onExit,
    onShop,
    onTransition,
    deck,
    updateDeck,
    onChangeRegion,
}: {
    scene: EventScene;
    player: Player;
    updatePlayer: (updated: any) => void;
    onBattle: (
        props: {
            addAbilities?: Ability[];
            waves: {
                enemies: Minion[];
            }[];
            backgroundImage?: string;
        },
        callback: () => void
    ) => void;
    onExit: Function;
    onShop: Function;
    onTransition?: Function;
    deck: HandAbility[];
    updateDeck: (newDeck: HandAbility[]) => void;
    onChangeRegion: (region: REGIONS) => void;
}) => {
    const { battleHistory = [] } = useAppSelector((state) => state)?.character || {};
    const dispatch = useAppDispatch();

    const [dialogIndex, setDialogIndex] = useState(0);
    const [script, setScript] = useState(scene.script);
    const [Puzzle, setPuzzle] = useState(() => script[dialogIndex]?.puzzle || null);
    const [Backdrop, setBackdrop] = useState(() => script[dialogIndex]?.scene || null);
    const [background, setBackground] = useState(script[dialogIndex]?.background);
    const [showCamp, setShowCamp] = useState(false);
    const [showTreasure, setShowTreasure] = useState(false);
    const [isRemovingAbility, setIsRemovingAbility] = useState(false);

    const classes = useStyles();

    const {
        speaker,
        dialog = [],
        items,
        responses,
        puzzle,
        itemChoices,
        loseItems = [],
        treasureBox,
        conditionalNext,
        infamy,
    } = script[dialogIndex] || ({} as any);

    const itemsObtainedFromScene: Item[] | undefined = useMemo(() => {
        if (!items) {
            return;
        }

        let { itemPool = [], amount } = items;
        const alreadyObtained = player.items.reduce((acc, item: Item) => {
            if (item.type === ITEM_TYPES.EQUIPMENT) {
                acc[item.name] = true;
            }
            return acc;
        }, {});

        itemPool = itemPool.filter((item: Item) => !alreadyObtained[item.name]);
        if (!itemPool.length) {
            itemPool.push(mesoItem);
        }

        if (amount) {
            return shuffle(itemPool).slice(0, amount);
        }

        return itemPool;
    }, [items]);

    useEffect(() => {
        if (!script[dialogIndex]) {
            onExit();
            return;
        }

        const { scene: newScene, background, region }: ScriptNode = script[dialogIndex];
        if (region) {
            onChangeRegion(region);
        }
        if (newScene && newScene !== Backdrop) {
            setBackdrop(() => newScene || null);
        }

        const transitioningPuzzle = (Puzzle && !puzzle) || (!puzzle && Puzzle);
        if (transitioningPuzzle) {
            onTransition &&
                onTransition(() => {
                    setPuzzle(null);
                    background && setBackground(background);
                });
        } else {
            setPuzzle(() => puzzle);
            background && setBackground(background);
        }

        if (loseItems.length) {
            updatePlayer({
                items: player.items.filter((item) => !loseItems.includes(item.name)),
            });
        }

        if (treasureBox) {
            setShowTreasure(true);
        }

        if (conditionalNext) {
            const passing = conditionalNext.find(({ conditions }) => passesScriptConditions(conditions));
            if (passing) {
                setScript(passing.next);
                setDialogIndex(0);
            }
        }

        if (infamy) {
            dispatch(addInfamy(infamy));
        }
    }, [dialogIndex]);

    const onProceedDialog = () => {
        const newDialogIndex = dialogIndex + 1;
        if (newDialogIndex <= script.length) {
            const { scene: newScene, disableTransition } = script[newDialogIndex] || {};
            if (newScene && newScene !== Backdrop && !disableTransition) {
                onTransition(() => {
                    setDialogIndex(newDialogIndex);
                });
            } else {
                setDialogIndex(newDialogIndex);
            }
        } else {
            onExit();
        }
    };

    const handleClickDialog = () => {
        if (!responses && !items) {
            onProceedDialog();
        }
    };

    const onCompletePuzzle = (completionPayload: { success?: boolean; infamy?: number }) => {
        const { infamy = 0 } = completionPayload || {};
        dispatch(addInfamy(infamy));
        handleClickDialog();
    };

    const passesScriptConditions = (conditions: ScriptConditions[]): boolean => {
        if (!conditions?.length) {
            return true;
        }

        const recentBattle = battleHistory[battleHistory.length - 1];

        const passesCondition = (condition: ScriptConditions): boolean => {
            const { battleTotalDamage, comparator } = condition || {};
            return passesValueComparison({ val: recentBattle?.totalDamageDealt, otherVal: battleTotalDamage, comparator });
        };

        return conditions.some(passesCondition);
    };

    const handleClickResponse = ({ next, encounter, isExit, shop, camp, removeAbility, id, infamy }: ScriptResponse) => {
        const callback = () => {
            if (id) {
                dispatch(logVisitedEvent(id));
            }

            if (next) {
                setScript(next);
                setDialogIndex(0);
            }

            if (shop) {
                onShop(shop);
                if (!next) {
                    onExit();
                }
            }

            if (isExit) {
                onExit();
            }

            if (camp) {
                setShowCamp(true);
            }

            if (removeAbility) {
                setIsRemovingAbility(true);
            }

            if (!next && !shop && !isExit) {
                // This dialogue node just goes to the next index
                onProceedDialog();
            }

            if (infamy) {
                dispatch(addInfamy(infamy));
            }
        };
        if (encounter) {
            //callback();
            // skip battles
            onBattle(
                {
                    ...encounter,
                    backgroundImage: background,
                },
                callback
            );
        } else {
            callback();
        }
    };

    const handleClickItemsObtained = () => {
        const itemsWithPickUpEffects = [];
        const regularItems = [];
        itemsObtainedFromScene.forEach((item) => {
            if (item.pickUp) {
                itemsWithPickUpEffects.push(item);
            } else {
                regularItems.push(item);
            }
        });

        const mesos = itemsWithPickUpEffects.reduce((acc, item: Item) => {
            return acc + (item.pickUp?.mesos || 0);
        }, 0);

        updatePlayer({
            items: [...player.items, ...regularItems],
            mesos: player.mesos + mesos,
        });

        if (dialogIndex < scene.script.length - 1) {
            setDialogIndex(dialogIndex + 1);
        } else {
            onExit();
        }
    };

    const handleSelectItemChoice = (item: Item) => {
        if (item.pickUp) {
            updatePlayer({
                mesos: player.mesos + (item.pickUp.mesos || 0),
            });
        } else {
            updatePlayer({
                items: [...player.items, item],
            });
        }

        if (dialogIndex <= scene.script.length - 1) {
            setDialogIndex(dialogIndex + 1);
        } else {
            onExit();
        }
    };

    const getResponseAffix = (response: ScriptResponse) => {
        if (response.encounter) {
            return "[Fight]";
        }

        if (response.isExit) {
            return "[Leave]";
        }

        if (response.shop) {
            return "[Shop]";
        }

        if (response.removeAbility) {
            return "[Remove ability from deck]";
        }
    };

    const handleSkip = () => {
        const newDialogIndex = script.findIndex((scriptNode: ScriptNode, i) => {
            const { responses, items, itemChoices, puzzle, scene } = scriptNode || {};
            return i > dialogIndex && (responses || items || itemChoices || puzzle || scene);
        });
        if (newDialogIndex > -1) {
            setDialogIndex(newDialogIndex);
        } else {
            setDialogIndex(script.length - 1);
        }
    };

    const interpolateDialog = (text: string) => {
        return Handlebars.compile(text)({
            class: classesInterpolation[player.class],
            classPlural: classesPluralInterpolation[player.class],
        });
    };

    const handleRemoveAbility = (updatedDeck: HandAbility[]) => {
        setIsRemovingAbility(false);
        updateDeck(updatedDeck);
    };

    const handleObtainLoot = ({ mesos = 0, items = [] }: { mesos?: number; items?: Item[] }) => {
        updatePlayer({
            mesos: Math.max(0, player.mesos + mesos),
            items: [...player.items, ...items],
        });
    };

    const canSkip = !responses && !items && !itemChoices && dialogIndex < script.length - 1;

    return (
        <>
            <div className={classes.root}>
                <div className={classes.backgroundContainer} style={{ backgroundImage: `url(${background})` }} />
                <div className={classes.backgroundOverlay} />
                <div className={classes.inner}>
                    {!Puzzle && !showCamp && !isRemovingAbility && !showTreasure && (
                        <>
                            <div>{typeof Backdrop === "function" && <Backdrop player={player} />}</div>

                            <div className={classes.wrapper}>
                                <div className={classes.dialogContainer}>
                                    {canSkip && (
                                        <div className={classes.skipButton}>
                                            <Button onClick={handleSkip}>Skip</Button>
                                        </div>
                                    )}
                                    <div className={classes.portraitContainer}>
                                        {speaker && (
                                            <>
                                                <div className={classes.portrait}>
                                                    <img src={speaker.image} key={speaker.name} />
                                                </div>{" "}
                                                <div className={classes.speakerName}>{speaker?.name}</div>
                                            </>
                                        )}
                                    </div>
                                    <div className={classes.dialog} onClick={handleClickDialog}>
                                        <div>
                                            {dialog.map((line: string, i: number) => (
                                                <p key={i}>{interpolateDialog(line)}</p>
                                            ))}
                                        </div>
                                        {!responses && !items && (
                                            <div className={classes.dialogArrow}>
                                                <span>❯</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {responses && (
                                    <div className={classes.feedbackContainer}>
                                        {responses.map((response, i: number) => (
                                            <div
                                                className={classNames(classes.option, classes.response)}
                                                key={i}
                                                onClick={() => handleClickResponse(response)}
                                            >
                                                <span>
                                                    {interpolateDialog(response.text)} {getResponseAffix(response)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {itemsObtainedFromScene && (
                                    <div className={classes.feedbackContainer} onClick={handleClickItemsObtained}>
                                        <div className={classes.option}>
                                            - You gain -
                                            {itemsObtainedFromScene.map((item) => (
                                                <div key={item.name}>
                                                    <img src={item.image} /> {item.name}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                    {typeof Puzzle === "function" && <Puzzle player={player} onComplete={onCompletePuzzle} onExit={handleClickDialog} />}
                </div>
                {showCamp && (
                    <Camp
                        deck={deck}
                        player={player}
                        updateDeck={updateDeck}
                        updatePlayer={updatePlayer}
                        onExit={() => setShowCamp(false)}
                    />
                )}
                {itemChoices && (
                    <ItemSelection {...itemChoices} player={player} onClose={handleClickDialog} onSelectClick={handleSelectItemChoice} />
                )}
                {isRemovingAbility && <CardRemovalGrid cards={deck} onRemoveAbility={handleRemoveAbility} />}
            </div>
            {showTreasure && (
                <TreasureBox
                    onExit={() => {
                        setShowTreasure(false);
                        setDialogIndex((prev) => prev + 1);
                    }}
                    onLoot={handleObtainLoot}
                    player={player}
                />
            )}
        </>
    );
};

export default ScenePlayer;
