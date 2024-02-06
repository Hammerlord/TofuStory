import classNames from "classnames";
import Handlebars from "handlebars";
import { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
import Camp from "../Map/Camp";
import { REGIONS } from "../Map/regions";
import CardRemovalGrid from "../Menu/CardRemovalGrid";
import { PLAYER_CLASSES } from "../Menu/types";
import { Ability, Minion } from "../ability/types";
import ItemSelection from "../item/ItemSelection";
import { Item } from "../item/types";
import Button from "../view/Button";
import TreasureBox from "./TreasureBox/TreasureBox";
import { Scene, ScriptNode, ScriptResponse } from "./types";

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
        minWidth: "80px",
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
        top: 0,
    },
});

const classesInterpolation = {
    [PLAYER_CLASSES.WARRIOR]: "warrior",
};

const classesPluralInterpolation = {
    [PLAYER_CLASSES.WARRIOR]: "warriors",
};

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
    scene: Scene;
    player: any;
    updatePlayer: (updated: any) => void;
    onBattle: (
        props: {
            addAbilities?: Ability[];
            characters: string[];
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
    deck: Ability[];
    updateDeck: (newDeck: Ability[]) => void;
    onChangeRegion: (region: REGIONS) => void;
}) => {
    const [dialogIndex, setDialogIndex] = useState(0);
    const [script, setScript] = useState(scene.script);
    const [Backdrop, setBackdrop] = useState(() => script[dialogIndex]?.scene || null);
    const [background, setBackground] = useState(script[dialogIndex]?.background);
    const [Puzzle, setPuzzle] = useState(() => script[dialogIndex]?.puzzle || null);
    const [showCamp, setShowCamp] = useState(false);
    const [showTreasure, setShowTreasure] = useState(false);
    const classes = useStyles();
    const [isRemovingAbility, setIsRemovingAbility] = useState(false);
    const { speaker, dialog = [], items, responses, puzzle, itemChoices, loseItems = [], treasureBox } = script[dialogIndex] || ({} as any);

    useEffect(() => {
        if (!script[dialogIndex]) {
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
    }, [dialogIndex]);

    const handleClickDialog = () => {
        if (!responses && !items) {
            const newDialogIndex = dialogIndex + 1;
            if (newDialogIndex <= script.length - 1) {
                const { scene: newScene } = script[newDialogIndex] || {};
                if (newScene && newScene !== Backdrop) {
                    onTransition(() => {
                        setDialogIndex(newDialogIndex);
                    });
                } else {
                    setDialogIndex(newDialogIndex);
                }
            } else {
                onExit();
            }
        }
    };

    const handleClickResponse = ({ next, encounter, isExit, shop, camp, removeAbility }: ScriptResponse) => {
        const callback = () => {
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
                setDialogIndex((prev) => prev + 1);
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

    const handleClickItems = () => {
        updatePlayer({
            items: [...player.items, ...items],
        });
        if (dialogIndex < scene.script.length - 1) {
            setDialogIndex(dialogIndex + 1);
        } else {
            onExit();
        }
    };

    const handleSelectItemChoice = (item: Item) => {
        updatePlayer({
            items: [...player.items, item],
        });
        if (dialogIndex < scene.script.length - 1) {
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

    const handleRemoveAbility = (updatedDeck: Ability[]) => {
        setIsRemovingAbility(false);
        updateDeck(updatedDeck);
    };

    const handleObtainLoot = ({ mesos = 0, items = [] }: { mesos?: number; items?: Item[] }) => {
        updatePlayer({
            mesos: Math.max(0, player.mesos + mesos),
            items: [...player.items, ...items],
        });
    };

    const canSkip = !responses && !items && !itemChoices;

    return (
        <div className={classes.root}>
            <div className={classes.backgroundContainer} style={{ backgroundImage: `url(${background})` }} />
            <div className={classes.backgroundOverlay} />
            <div className={classes.inner}>
                {!Puzzle && !showCamp && !isRemovingAbility && (
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
                                        {dialog.map((line, i) => (
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
                                    {responses.map((response, i) => (
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
                            {items && (
                                <div className={classes.feedbackContainer} onClick={handleClickItems}>
                                    <div className={classes.option}>
                                        - You gain -
                                        {items.map((item) => (
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
                {typeof Puzzle === "function" && <Puzzle player={player} onComplete={handleClickDialog} />}
            </div>
            {showCamp && (
                <Camp deck={deck} player={player} updateDeck={updateDeck} updatePlayer={updatePlayer} onExit={() => setShowCamp(false)} />
            )}
            {itemChoices && (
                <ItemSelection {...itemChoices} player={player} onClose={handleClickDialog} onSelectClick={handleSelectItemChoice} />
            )}
            {isRemovingAbility && <CardRemovalGrid cards={deck} onRemoveAbility={handleRemoveAbility} />}
            {showTreasure && (
                <div className={classes.treasureBoxContainer}>
                    <TreasureBox
                        onExit={() => {
                            setShowTreasure(false);
                            setDialogIndex((prev) => prev + 1);
                        }}
                        onLoot={handleObtainLoot}
                        currentItems={player.items}
                    />
                </div>
            )}
        </div>
    );
};

export default ScenePlayer;
