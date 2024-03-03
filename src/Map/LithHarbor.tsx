import classNames from "classnames";
import { useState } from "react";
import { createUseStyles } from "react-jss";
import {
    LithHarborCenterImage,
    LithHarborCityBGImage,
    LithHarborExitImage,
    LithHarborSharkImage,
    LithTutorial2Image,
    LithTutorialImage,
} from "../images";
import { CrossedSwordsIcon, MedalIcon, QuestionMarkIcon, WorldMapIcon } from "../images/icons";
import { lithEventsOlaf, olafRewards } from "../scene/olaf";
import Legend from "./Legend";
import Pan from "./Pan";
import TownNode from "./TownNode";
import { TOWN_STYLES } from "./constants";
import { basicDummy } from "../enemy/dummy";
import { olaf } from "../enemy/enemy";
import { lithEventsTeoJohn } from "../scene/teojohn";
import { PLAYER_CLASSES } from "../Menu/types";
import warriorTutorial, { magicianTutorial } from "../Menu/tutorial";
import Button from "../view/Button";
import { useAppDispatch } from "../hooks";
import { halfEatenHotdog } from "../item/items";
import { playerStateSlice } from "../character/playerReducer";
import CardRewards from "../Menu/CardRewards";
import ItemRewards from "../Menu/ItemRewards";

const useStyles = createUseStyles({
    ...TOWN_STYLES,
    root: {
        width: "100%",
        height: "100%",
        background: `url(${LithHarborCityBGImage})`,
        color: "white",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
    },
    player: {
        position: "absolute",
        top: 175,
        left: "50%",
        transform: "translateX(-50%)",
    },
    dummyCharContainer: {
        bottom: "94px",
        left: 175,
        position: "absolute",
    },
    dummyCharContainer2: {
        bottom: "94px",
        left: 100,
        position: "absolute",
    },
    olafCharContainer: {
        bottom: "107px",
        left: "50%",
        transform: "translateX(-50%)",
        position: "absolute",
    },
});

const LITH_PLACES = {
    TUTORIAL_BASIC: "tutorial",
    TUTORIAL_ELITE_ENCOUNTER: "tutorial2",
    SHARK: "shark",
};

const LITH_PREREQUISITES = {
    [LITH_PLACES.TUTORIAL_ELITE_ENCOUNTER]: [LITH_PLACES.TUTORIAL_BASIC],
};

const { acquireItems } = playerStateSlice.actions;

const LithHarbor = ({ player, deck, updateDeck, onExit, onClickScene, onBattle }) => {
    const classes = useStyles();
    const [showAcquireAbility, setShowAcquireAbility] = useState(0);
    const [showAcquireItem, setShowAcquireItem] = useState(false);
    const [visited, setVisited] = useState({});
    const isFulfilledExitRequirement = Object.values(visited).length >= Object.values(LITH_PLACES).length;
    const dispatch = useAppDispatch();

    const handleClickEvent = (eventKey: string, scene) => {
        if (checkVisitPlace(eventKey)) {
            onClickScene && onClickScene(scene);
        }
    };

    /**
     * Logs which places have been visited. If place hasn't been visited, returns true (can visit the place).
     */
    const checkVisitPlace = (key: string): boolean => {
        if (visited[key]) {
            return false;
        }
        setVisited((prev) => ({ ...prev, [key]: true }));
        return true;
    };

    const isLocked = (eventKey: string): boolean => {
        return LITH_PREREQUISITES[eventKey]?.some((prereq: string) => !visited[prereq]);
    };

    const handleExitClick = () => {
        if (isFulfilledExitRequirement) {
            onExit();
            return;
        }

        if (!visited[LITH_PLACES.SHARK]) {
            dispatch(acquireItems([halfEatenHotdog]));
        }

        const combatsNotVisited = [visited[LITH_PLACES.TUTORIAL_BASIC], visited[LITH_PLACES.TUTORIAL_ELITE_ENCOUNTER]].filter(
            (v) => !v
        ).length;
        setShowAcquireAbility(combatsNotVisited);
        setShowAcquireItem(!visited[LITH_PLACES.TUTORIAL_ELITE_ENCOUNTER]);
    };

    const screenCentre = { x: 0, y: window.innerHeight / 2 };

    return (
        <div className={classes.root}>
            <div className={classes.bg}>
                {!showAcquireItem && !showAcquireAbility && (
                    <>
                        <Pan userPosition={screenCentre} disableIntroAnimate={true}>
                            <div className={classes.inner}>
                                <TownNode
                                    icon={CrossedSwordsIcon}
                                    isVisited={visited[LITH_PLACES.TUTORIAL_BASIC]}
                                    label={"[Tutorial] Basic Combat"}
                                    nodeEl={
                                        <div>
                                            <img src={LithTutorialImage} alt="Balcony" />
                                            <img src={basicDummy.image} alt="Dummy" className={classes.dummyCharContainer} />
                                            <img src={basicDummy.image} alt="Dummy" className={classes.dummyCharContainer2} />
                                        </div>
                                    }
                                    onClick={() => {
                                        if (checkVisitPlace(LITH_PLACES.TUTORIAL_BASIC)) {
                                            const tutorialMap = {
                                                [PLAYER_CLASSES.WARRIOR]: warriorTutorial,
                                                [PLAYER_CLASSES.MAGICIAN]: magicianTutorial,
                                            };
                                            onBattle(
                                                {
                                                    ...tutorialMap[player.class],
                                                    backgroundImage: LithHarborCityBGImage,
                                                },
                                                () => {}
                                            );
                                        }
                                    }}
                                />
                                <br />
                                <TownNode
                                    icon={MedalIcon}
                                    isVisited={visited[LITH_PLACES.TUTORIAL_ELITE_ENCOUNTER]}
                                    isLocked={isLocked(LITH_PLACES.TUTORIAL_ELITE_ENCOUNTER)}
                                    label={"[Tutorial] Showoff"}
                                    nodeEl={
                                        <div>
                                            <img src={LithTutorial2Image} alt="Balcony" />
                                            <img src={olaf.image} alt="Olaf" className={classes.olafCharContainer} />
                                        </div>
                                    }
                                    onClick={() => handleClickEvent(LITH_PLACES.TUTORIAL_ELITE_ENCOUNTER, lithEventsOlaf)}
                                />

                                <div className={classNames(classes.townCenter)}>
                                    <div className={classes.townHeader}>
                                        <h2>Lith Harbor</h2>
                                    </div>
                                    <img src={LithHarborCenterImage} alt="Lith Center" />
                                    <img src={player?.image} alt="You" className={classes.player} />
                                </div>

                                <TownNode
                                    icon={WorldMapIcon}
                                    isVisited={false}
                                    label={isFulfilledExitRequirement ? "Exit to World Map" : "Skip Tutorials and Exit"}
                                    nodeImage={LithHarborExitImage}
                                    onClick={handleExitClick}
                                />

                                <br />
                                <TownNode
                                    icon={QuestionMarkIcon}
                                    isVisited={visited[LITH_PLACES.SHARK]}
                                    label={"By the Dock"}
                                    onClick={() => handleClickEvent(LITH_PLACES.SHARK, lithEventsTeoJohn)}
                                    nodeImage={LithHarborSharkImage}
                                />
                            </div>
                        </Pan>
                        <Legend />
                    </>
                )}
                {showAcquireItem && !showAcquireAbility && (
                    <ItemRewards
                        player={player}
                        playerCurrentItems={player.items}
                        overrideItems={olafRewards}
                        onLoot={({ items }) => {
                            dispatch(acquireItems(items));
                        }}
                        onClose={() => {
                            setShowAcquireItem(false);
                            if (!showAcquireAbility) {
                                onExit();
                            }
                        }}
                    />
                )}
                {showAcquireAbility > 0 && (
                    <CardRewards
                        player={player}
                        deck={deck}
                        updateDeck={updateDeck}
                        onClose={() => setShowAcquireAbility(0)}
                        maxAmount={showAcquireAbility}
                    />
                )}
            </div>
        </div>
    );
};

export default LithHarbor;
