import classNames from "classnames";
import { useState } from "react";
import { createUseStyles } from "react-jss";
import warriorTutorial from "../Menu/tutorial";
import {
    LithHarborCenterImage,
    LithHarborCityBGImage,
    LithHarborExitImage,
    LithHarborSharkImage,
    LithTutorial2Image,
    LithTutorialImage,
} from "../images";
import { CrossedSwordsIcon, MedalIcon, QuestionMarkIcon, WorldMapIcon } from "../images/icons";
import { lithEventsOlaf } from "../scene/olaf";
import Legend from "./Legend";
import Pan from "./Pan";
import TownNode from "./TownNode";
import { TOWN_STYLES } from "./constants";
import { basicDummy } from "../enemy/dummy";
import { olaf } from "../enemy/enemy";
import { lithEventsTeoJohn } from "../scene/teojohn";

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

const LithHarbor = ({ player, deck, updateDeck, onExit, onClickScene, onBattle }) => {
    const classes = useStyles();
    const [promptTutorial, setPromptTutorial] = useState(true);
    const [showAcquireAbility, setShowAcquireAbility] = useState(false);
    const [visited, setVisited] = useState({});
    const exitRequirement = Object.values(LITH_PLACES).length;

    const handleTutorialConfirmation = () => {
        onBattle &&
            onBattle(
                {
                    ...warriorTutorial,
                    backgroundImage: LithHarborCityBGImage,
                },
                () => setPromptTutorial(false)
            );
    };

    const handleTutorialCancel = () => {
        setPromptTutorial(false);
        setShowAcquireAbility(true);
    };

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

    const screenCentre = { x: 0, y: window.innerHeight / 2 };

    return (
        <div className={classes.root}>
            <div className={classes.bg}>
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
                                    onBattle(
                                        {
                                            ...warriorTutorial,
                                            backgroundImage: LithHarborCityBGImage,
                                        },
                                        () => setPromptTutorial(false)
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
                            label={"Exit to World Map"}
                            nodeImage={LithHarborExitImage}
                            onClick={onExit}
                            isLocked={Object.values(visited).length < exitRequirement}
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
            </div>
        </div>
    );
};

export default LithHarbor;
