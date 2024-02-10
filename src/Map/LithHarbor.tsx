import Button from "../view/Button";
import classNames from "classnames";
import { useState } from "react";
import { createUseStyles } from "react-jss";
import CardRewards from "../Menu/CardRewards";
import { LithHarborBalconyImage, LithHarborCityBGImage, LithHarborExitImage, LithHarborSharkImage } from "../images";
import { HeavyCheckMarkIcon, WorldMapIcon } from "../images/icons";
import tutorial from "../Menu/tutorial";
import { lithEventsOlaf } from "../scene/olaf";
import { lithEventsTeoJohn } from "../scene/teojohn";
import { PLAYER_CLASSES } from "../Menu/types";
import Icon from "../icon/Icon";

const useStyles = createUseStyles({
    root: {
        width: "100%",
        height: "100%",
        background: `url(${LithHarborCityBGImage})`,
        color: "white",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
    },
    bg: {
        width: "100%",
        height: "100%",
        color: "white",
        position: "fixed",
        background: "rgba(50, 50, 50, 0.7)",
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
    node: {
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
        width: "350px",
        height: "350px",
        margin: "auto",
        position: "relative",
        cursor: "pointer",
        "& > img": {
            maxWidth: "100%",
            maxHeight: "100%",
        },
    },
    shark: {},
    balcony: {},
    exit: {},
    eventsContainer: {
        display: "flex",
    },
    event: {
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
        transform: "translateX(-50%)",
        top: "10%",
    },
    eventInner: {
        width: "32px",
        height: "32px",
        margin: "auto",
    },
    tutorialContainer: {
        background: "rgba(0, 0, 0, 0.7)",
        padding: 24,
        paddingBottom: 48,
        borderRadius: 8,
    },
    icon: {
        margin: "auto",
    },
});

const OLAF = "olaf";
const TEOJOHN = "teo-john";

const LithHarbor = ({ player, deck, updateDeck, onExit, onClickScene, onBattle }) => {
    const classes = useStyles();
    const [promptTutorial, setPromptTutorial] = useState(true);
    const [showAcquireAbility, setShowAcquireAbility] = useState(false);
    const [visitedMap, setVisitedMap] = useState({});

    const handleTutorialConfirmation = () => {
        onBattle &&
            onBattle(
                {
                    ...tutorial,
                    backgroundImage: LithHarborCityBGImage,
                },
                () => setPromptTutorial(false)
            );
    };

    const handleTutorialCancel = () => {
        setPromptTutorial(false);
        setShowAcquireAbility(true);
    };

    return (
        <div className={classes.root}>
            <div className={classes.bg}>
                <div className={classes.inner}>
                    {!promptTutorial && !showAcquireAbility && (
                        <>
                            <h2>Lith Harbor</h2>
                            <div className={classes.eventsContainer}>
                                <div
                                    className={classNames(classes.node, classes.balcony)}
                                    onClick={() => {
                                        if (!visitedMap[OLAF]) {
                                            onClickScene(lithEventsOlaf);
                                            setVisitedMap((prev) => ({ ...prev, [OLAF]: true }));
                                        }
                                    }}
                                >
                                    Event
                                    <img src={LithHarborBalconyImage} />
                                    <div className={classes.event}>{!visitedMap[OLAF] ? "?" : <Icon icon={HeavyCheckMarkIcon} />}</div>
                                </div>
                                <div
                                    className={classNames(classes.node, classes.shark)}
                                    onClick={() => {
                                        if (!visitedMap[TEOJOHN]) {
                                            onClickScene(lithEventsTeoJohn);
                                            setVisitedMap((prev) => ({ ...prev, [TEOJOHN]: true }));
                                        }
                                    }}
                                >
                                    Event
                                    <img src={LithHarborSharkImage} />
                                    <div className={classes.event}>
                                        {!visitedMap[TEOJOHN] ? "?" : <Icon icon={HeavyCheckMarkIcon} className={classes.icon} />}{" "}
                                    </div>
                                </div>
                                <div className={classNames(classes.node, classes.exit)} onClick={onExit}>
                                    Exit to World Map
                                    <img src={LithHarborExitImage} />
                                    <div className={classes.event}>
                                        <div className={classes.eventInner}>
                                            <WorldMapIcon />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                    {promptTutorial && (
                        <div className={classes.tutorialContainer}>
                            <h3>Play the tutorial?</h3>
                            {player?.class === PLAYER_CLASSES.WARRIOR && (
                                <p>The tutorial is an optional introduction to the basics of combat.</p>
                            )}
                            {player?.class !== PLAYER_CLASSES.WARRIOR && (
                                <p>(DEV NOTE: Tutorial is unavailable for your current class, but I'll be back!)</p>
                            )}
                            <Button
                                color="primary"
                                onClick={handleTutorialConfirmation}
                                disabled={player?.class !== PLAYER_CLASSES.WARRIOR}
                            >
                                Yes
                            </Button>{" "}
                            <Button color="secondary" onClick={handleTutorialCancel}>
                                Skip
                            </Button>
                        </div>
                    )}
                </div>

                {showAcquireAbility && (
                    <CardRewards deck={deck} player={player} updateDeck={updateDeck} onClose={() => setShowAcquireAbility(false)} />
                )}
            </div>
        </div>
    );
};

export default LithHarbor;
