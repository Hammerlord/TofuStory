import classNames from "classnames";
import Handlebars from "handlebars";
import { useEffect, useMemo, useState } from "react";
import { createUseStyles } from "react-jss";
import Camp from "../Map/Camp";
import { REGIONS } from "../Map/regions";
import CardRemovalGrid from "../Menu/CardRemovalGrid";
import { PLAYER_CLASSES } from "../Menu/types";
import { Ability, CombatAbility, Minion } from "../ability/types";
import ItemSelection from "../item/ItemSelection";
import { ITEM_TYPES, Item } from "../item/types";
import Button from "../view/Button";
import TreasureBox from "./TreasureBox/TreasureBox";
import { EventScene, ScriptConditions, ScriptNode, ScriptNodeTreasure, ScriptResponse } from "./types";
import { Player } from "../character/types";
import { useAppDispatch, useAppSelector } from "../hooks";
import { passesValueComparison } from "../battle/passesConditions";
import { playerStateSlice } from "../character/playerReducer";
import { getRandomItem, shuffle } from "../utils";
import { mesoItem } from "../item/items";
import { SkullPatchImage } from "../images";
import Icon from "../icon/Icon";
import ReelLockPuzzle from "./TreasureBox/ReelLockPuzzle";
import OnOffPuzzle from "./TreasureBox/OnOffPuzzle";
import SortingPuzzle from "./TreasureBox/SortingPuzzle";
import RowPuzzle from "./TreasureBox/RowPuzzle";
import { BG_MAP } from "../Map/types";
import { getUpgradeCard } from "../Menu/utils";
import Overlay from "../view/Overlay";
import AbilityView from "../ability/AbilityView/AbilityView";

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
        top: "45%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        fontSize: "1.2rem",
        cursor: "pointer",
    },
    wrapper: {
        position: "absolute",
        display: "flex",
        flexDirection: "column",
        left: "50%",
        transform: "translateX(-50%)",
        marginTop: "-150px",
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
        marginBottom: "8px",

        "& p": {
            marginTop: 0,

            "&:(:last-child)": {
                marginBottom: 0,
            },
        },
    },
    backdropContainer: {
        width: 1000,
        height: 675,
    },
    backdropInner: {
        width: "100%",
        height: 600,
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
        "& > span:before": {
            content: "'◇'",
            marginRight: "8px",
        },
        "&:hover > span:before": {
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
    infamyContainer: {
        filter: "drop-shadow(0 0 2px #ff3a3a) drop-shadow(0 0 2px #ff3a3a)",
        marginRight: 8,
    },
    abilityContainer: {
        display: "inline-block",
        margin: 8,
    },
    abilityUpgradeSection: {
        marginBottom: 64,
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

const { logVisitedEvent, addInfamy, acquireItems, updateMesos, pushActivityHistory } = playerStateSlice.actions;

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
    region,
}: {
    scene: EventScene;
    player: Player;
    updatePlayer: (updated: any) => void;
    onBattle: (
        props: {
            addAbilities?: Ability[];
            waves: {
                enemies: Minion[];
                generateEliteAffixes?: boolean;
            }[];
            backgroundImage?: string;
        },
        callback: () => void
    ) => void;
    onExit: Function;
    onShop: Function;
    onTransition?: Function;
    deck: CombatAbility[];
    updateDeck: (newDeck: CombatAbility[]) => void;
    onChangeRegion: (region: REGIONS) => void;
    region: REGIONS;
}) => {
    const { battleHistory = [], activityHistory = [] } = useAppSelector((state) => state)?.character || {};
    const dispatch = useAppDispatch();

    const [dialogIndex, setDialogIndex] = useState(0);
    const [script, setScript] = useState(scene.script);
    const [Puzzle, setPuzzle] = useState(() => script[dialogIndex]?.puzzle || null);
    const [Backdrop, setBackdrop] = useState(() => script[dialogIndex]?.scene || null);
    const [background, setBackground] = useState(script[dialogIndex]?.background);
    const [showCamp, setShowCamp] = useState(false);
    const [treasureBoxOptions, setTreasureBoxOptions] = useState(null);
    const [isRemovingAbility, setIsRemovingAbility] = useState(false);
    const [upgradedCards, setUpgradedCards] = useState(null);

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
    }: ScriptNode = script[dialogIndex] || ({} as any);

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

        const { scene: newScene, background: scriptBackground, region: scriptRegion }: ScriptNode = script[dialogIndex];
        if (scriptRegion) {
            onChangeRegion(scriptRegion);
        }
        if (newScene && newScene !== Backdrop) {
            setBackdrop(() => newScene || null);
        }

        const transitioningPuzzle = (Puzzle && !puzzle) || (!puzzle && Puzzle);
        if (transitioningPuzzle) {
            onTransition &&
                onTransition(() => {
                    setPuzzle(null);
                    if (scriptBackground) {
                        setBackground(scriptBackground);
                    } else if (!background) {
                        setBackground(BG_MAP[region]);
                    }
                });
        } else {
            setPuzzle(() => puzzle);
            if (scriptBackground) {
                setBackground(scriptBackground);
            } else if (!background) {
                setBackground(BG_MAP[region]);
            }
        }

        if (loseItems.length) {
            updatePlayer({
                items: player.items.filter((item) => !loseItems.includes(item.name)),
            });
        }

        if (treasureBox) {
            const { isOpen, isCursed }: ScriptNodeTreasure = treasureBox;
            setTreasureBoxOptions({
                Puzzle: isOpen ? null : getRandomItem([ReelLockPuzzle, OnOffPuzzle, SortingPuzzle, RowPuzzle]),
                curse: isCursed ? "damage" : undefined,
            });
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
    }, [script?.[dialogIndex]]);

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

    const onCompletePuzzle = (completionPayload: { success?: boolean; infamy?: number; score?: number; type? }) => {
        const { infamy = 0 } = completionPayload || {};
        dispatch(addInfamy(infamy));
        dispatch(pushActivityHistory(completionPayload));
        handleClickDialog();
    };

    const recentBattle = battleHistory[battleHistory.length - 1];
    const passesScriptConditions = (conditions: ScriptConditions[]): boolean => {
        if (!conditions?.length) {
            return true;
        }

        const recentActivity = activityHistory[activityHistory.length - 1];

        const passesCondition = (condition: ScriptConditions): boolean => {
            const { battle = {}, comparator, chance, activityScore, items = [] } = condition || {};
            if (chance) {
                return Math.random() <= chance;
            }

            if (typeof battle.totalDamage === "number") {
                return passesValueComparison({ val: recentBattle?.totalDamageDealt, otherVal: battle.totalDamage, comparator });
            }

            if (typeof battle.totalKills === "number") {
                return passesValueComparison({ val: recentBattle?.totalKills, otherVal: battle.totalKills, comparator });
            }

            if (typeof activityScore === "number") {
                return passesValueComparison({ val: recentActivity?.score, otherVal: activityScore, comparator });
            }

            if (items.length) {
                return items.every((itemName: string) => player.items.some((i) => i.name === itemName));
            }
        };

        return conditions.some(passesCondition);
    };

    const handleUpgradeCards = (numCards: number) => {
        const eligibleCards = deck.filter((card: CombatAbility) => !card.level || card.level === 1);
        const upgraded = shuffle(eligibleCards)
            .slice(0, numCards)
            .map((card) => getUpgradeCard(card, { retainId: true }));

        const updatedDeck = deck.map((card: CombatAbility) => {
            return upgraded.find((upgradedCard: CombatAbility) => upgradedCard.instanceId === card.instanceId) || card;
        });

        updateDeck(updatedDeck);
        setUpgradedCards(upgraded);
    };

    const handleClickResponse = ({ next, encounter, isExit, shop, camp, removeAbility, id, infamy, upgradeCards }: ScriptResponse) => {
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

            if (upgradeCards) {
                handleUpgradeCards(upgradeCards);
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
        dispatch(acquireItems(itemsObtainedFromScene));

        if (dialogIndex < script.length - 1) {
            setDialogIndex(dialogIndex + 1);
        } else {
            onExit();
        }
    };

    const handleSelectItemChoice = (item: Item) => {
        dispatch(acquireItems([item]));

        if (dialogIndex < script.length - 1) {
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

        if (response.upgradeCards) {
            return `[Upgrade ${response.upgradeCards} random abilities]`;
        }
    };

    const handleSkip = (e) => {
        const newDialogIndex = script.findIndex((scriptNode: ScriptNode, i) => {
            const { responses, items, itemChoices, puzzle, scene } = scriptNode || {};
            return i > dialogIndex && (responses || items || itemChoices || puzzle || scene);
        });
        if (newDialogIndex > -1) {
            setDialogIndex(newDialogIndex);
        } else {
            setDialogIndex(script.length - 1);
        }

        e.stopPropagation(); // Prevent the click from going to the scene background, which will advance the dialog by 1 instead of skip
    };

    const interpolateDialog = (text: string) => {
        return Handlebars.compile(text)({
            class: classesInterpolation[player.class],
            classPlural: classesPluralInterpolation[player.class],
            totalKills: recentBattle?.totalKills || 0,
        });
    };

    const handleRemoveAbility = (updatedDeck: CombatAbility[]) => {
        setIsRemovingAbility(false);
        updateDeck(updatedDeck);
    };

    const handleObtainLoot = ({ mesos = 0, items = [] }: { mesos?: number; items?: Item[] }) => {
        dispatch(acquireItems(items));
        dispatch(updateMesos(mesos));
    };

    const canSkip = !responses && !items && !itemChoices && dialogIndex < script.length - 1;

    return (
        <>
            <div className={classes.root}>
                <div className={classes.backgroundContainer} style={{ backgroundImage: `url(${background})` }} />
                <div className={classes.backgroundOverlay} />

                <div className={classes.inner}>
                    {!Puzzle && !showCamp && !isRemovingAbility && !treasureBoxOptions && (
                        <>
                            <div className={classes.backdropContainer} onClick={handleClickDialog}>
                                <div className={classes.backdropInner}>
                                    {typeof Backdrop === "function" && <Backdrop player={player} />}
                                </div>
                            </div>

                            <div className={classes.wrapper}>
                                <div className={classes.dialogContainer} onClick={handleClickDialog}>
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
                                    <div className={classes.dialog}>
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
                                                    {response.infamy && (
                                                        <span className={classes.infamyContainer}>
                                                            <Icon icon={SkullPatchImage} size="sm" />
                                                        </span>
                                                    )}
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
                {upgradedCards && (
                    <Overlay>
                        <div className={classes.inner}>
                            <h3>The following cards were upgraded</h3>
                            <div className={classes.abilityUpgradeSection}>
                                {upgradedCards
                                    .sort((a, b) => (a.resourceCost || 0) - (b.resourceCost || 0))
                                    .map((ability) => (
                                        <div className={classes.abilityContainer}>
                                            <AbilityView ability={ability} key={ability.instanceId} />
                                        </div>
                                    ))}
                            </div>
                            <Button color="secondary" onClick={() => setUpgradedCards(null)}>
                                Continue
                            </Button>
                        </div>
                    </Overlay>
                )}
            </div>
            {treasureBoxOptions && (
                <TreasureBox
                    onExit={() => {
                        setTreasureBoxOptions(null);
                        setDialogIndex((prev) => prev + 1);
                    }}
                    onLoot={handleObtainLoot}
                    player={player}
                    {...treasureBoxOptions}
                />
            )}
        </>
    );
};

export default ScenePlayer;
