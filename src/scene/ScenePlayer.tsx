import classNames from "classnames";
import { useState } from "react";
import { createUseStyles } from "react-jss";
import { Item } from "../item/types";
import { Scene, ScriptResponse } from "./types";

const useStyles = createUseStyles({
    root: {
        width: "100%",
        height: "100%",
        background: "rgba(50, 50, 50, 0.9)",
        color: "white",
    },
    inner: {
        textAlign: "center",
        margin: "auto",
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        fontSize: "1.2rem",
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
    sceneContainer: {
        marginTop: "-150px",
    },
    portraitContainer: {
        minHeight: "100px",
        marginRight: "24px",
        textAlign: "center",
    },
    portrait: {
        minHeight: "70px",
        minWidth: "50px",
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
        animationDelay: "1.5s",
        animationDuration: "0.5s",
        animationFillMode: "forwards",
    },
    option: {
        background:
            "linear-gradient(90deg, rgba(0,212,255,0) 0%, rgba(0,0,0,0.75) 70%, rgba(0,0,0,0.75) 50%, rgba(0,0,0,0.75) 70%, rgba(0,212,255,0) 100%)",
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
});

const ScenePlayer = ({
    scene,
    player,
    updatePlayer,
    onBattle,
    onExit,
    onShop,
}: {
    scene: Scene;
    player: any;
    updatePlayer: Function;
    onBattle: Function;
    onExit: Function;
    onShop: Function;
}) => {
    const [dialogIndex, setDialogIndex] = useState(0);
    const [script, setScript] = useState(scene.script);
    const classes = useStyles();
    const { speaker, dialog, items, responses } = script[dialogIndex] || {};

    const handleClickDialog = () => {
        if (!responses && !items) {
            if (dialogIndex + 1 <= script.length - 1) {
                setDialogIndex(dialogIndex + 1);
            } else {
                onExit();
            }
        }
    };

    const handleClickResponse = ({ next, encounter, isExit, shop }: ScriptResponse) => {
        if (next) {
            setScript(next);
            setDialogIndex(0);
        }
        if (encounter) {
            onBattle(encounter);
        }
        if (shop) {
            onShop(shop);
        }
        if (isExit) {
            onExit();
        }
    };

    const handleClickItems = () => {
        updatePlayer({
            ...player,
            items: [...player.items, ...items],
        });
        if (dialogIndex < scene.script.length - 1) {
            setDialogIndex(dialogIndex + 1);
        } else {
            onExit();
        }
    };

    const SceneBackdrop = scene.scene;
    return (
        <div className={classes.root}>
            <div className={classes.inner}>
                <div className={classes.sceneContainer}>
                    <SceneBackdrop player={player} />
                </div>
                <div className={classes.wrapper}>
                    <div className={classes.dialogContainer}>
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
                                    <p key={i}>{line}</p>
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
                                        {response.text} {response.isExit && "[Leave]"}
                                        {response.encounter && "[Fight]"}
                                        {response.shop && "[Shop]"}
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
            </div>
        </div>
    );
};

export default ScenePlayer;
