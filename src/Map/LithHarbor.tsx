import classNames from "classnames";
import { useState } from "react";
import { createUseStyles } from "react-jss";
import CardRewards from "../Menu/CardRewards";
import ItemRewards from "../Menu/ItemRewards";
import warriorTutorial, { magicianTutorial } from "../Menu/tutorial";
import { PLAYER_CLASSES } from "../Menu/types";
import { playerStateSlice } from "../character/playerReducer";
import { basicDummy } from "../enemy/dummy";
import { casey, olaf } from "../enemy/enemy";
import { useAppDispatch } from "../hooks";
import {
    LithHarborCenterImage,
    LithHarborCityBGImage,
    LithHarborExitImage,
    LithHarborSharkImage,
    LithHarborShopImage,
    LithTutorial2Image,
    LithTutorialImage,
    NatashaImage,
    SkipLithBackdropImage,
} from "../images";
import { CrossedSwordsIcon, MedalIcon, MoneyBagIcon, QuestionMarkIcon, ThoughtBubbleIcon, WorldMapIcon } from "../images/icons";
import { halfEatenHotdog } from "../item/items";
import { RARITIES } from "../item/types";
import { lithEventsOlaf, olafRewards } from "../scene/olaf";
import { lithEventsTeoJohn } from "../scene/teojohn";
import Legend from "./Legend";
import Pan from "./Pan";
import TownNode from "./TownNode";
import { TOWN_PLACES, TOWN_STYLES } from "./constants";
import { EventScene } from "../scene/types";
import Shop from "../Menu/Shop";
import ScenePlayer from "../scene/ScenePlayer";
import { REGIONS } from "./regions";
import Overlay from "../view/Overlay";

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
        ...TOWN_STYLES.player,
        top: 187,
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
    [LITH_PLACES.TUTORIAL_ELITE_ENCOUNTER]: [LITH_PLACES.TUTORIAL_BASIC, TOWN_PLACES.SHOP],
};

const { acquireItems } = playerStateSlice.actions;

const useCaseyStyles = createUseStyles({
    root: {
        position: "relative",
        width: "100%",
        height: "100%",
    },
    backdrop: {
        width: "100%",
        height: "100%",
    },
    character: {
        position: "absolute",
        filter: "drop-shadow(0 0 3px #fffee8) drop-shadow(0 0 3px #fffee8)",
    },
    player: {
        top: 240,
        left: 550,
        height: "65px",
    },
    casey: {
        top: 227,
        left: 399,
        transform: "scaleX(-1)",
    },
});

const CaseyBackdrop = ({ player }) => {
    const classes = useCaseyStyles();
    return (
        <div className={classes.root}>
            <img src={SkipLithBackdropImage} alt="Background" className={classes.backdrop} />
            <img src={player.image} className={classNames(classes.player, classes.character)} alt="Player" />
            <img src={casey.image} className={classNames(classes.casey, classes.character)} alt="Casey" />
        </div>
    );
};

const skipScript: EventScene = {
    id: "lith-skip",
    disableTransition: true,
    script: [
        {
            speaker: casey,
            background: LithHarborCityBGImage,
            scene: CaseyBackdrop,
            dialog: [
                "Hey Mushie! Before you go, here's the stuff you would've gotten from the remaining events in town. Good luck out there!",
            ],
        },
    ],
};

/**
 * If the player is only missing the hotdog, grant it through a dialog option rather than through ItemRewards
 */
const skipWithHotdogScript: EventScene = {
    ...skipScript,
    script: [
        {
            ...skipScript.script[0],
            items: {
                itemPool: [halfEatenHotdog],
            },
        },
    ],
};

const shopScript: EventScene = {
    id: "lith-shop",
    script: [
        {
            disableBackground: true,
            speaker: { name: "Natasha", image: NatashaImage },
            dialog: ["Ahhh! Out, you pest!"],
        },
        {
            disableBackground: true,
            speaker: { name: "Natasha", image: NatashaImage },
            dialog: ["How dare your penniless mushroom self barge into my shop??"],
        },
        {
            disableBackground: true,
            speaker: { name: "Natasha", image: NatashaImage },
            dialog: [
                "Leave, now! [Natasha waves the brush-end of a broom menacingly.]",
                "And if you really want to buy something, come back with some mesos!",
            ],
            responses: [
                {
                    text: "",
                    isExit: true,
                },
            ],
        },
    ],
};

const LithHarbor = ({ player, deck, updateDeck, onExit, onClickScene, onBattle, onTransition }) => {
    const classes = useStyles();
    const [isExiting, setIsExiting] = useState(false);
    const [showAcquireAbility, setShowAcquireAbility] = useState(0);
    const [showAcquireItem, setShowAcquireItem] = useState(false);
    const [visited, setVisited] = useState({});
    // You're not supposed to be able to buy anything from the Lith Harbor shop. It's just there as a narrative segment.
    // Due to the special combination of scene/shop background, use custom logic here.
    const [isShopOpen, setIsShopOpen] = useState(false);
    const [isShopScriptOpen, setIsShopScriptOpen] = useState(false);

    const exitRequirements = [...Object.values(LITH_PLACES), TOWN_PLACES.SHOP];
    const isFulfilledExitRequirement = Object.values(visited).length >= exitRequirements.length;
    const dispatch = useAppDispatch();

    const handleClickEvent = (eventKey: string, scene: EventScene) => {
        if (checkVisitPlace(eventKey)) {
            onClickScene(scene);
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
        const combatsNotVisited = [visited[LITH_PLACES.TUTORIAL_BASIC], visited[LITH_PLACES.TUTORIAL_ELITE_ENCOUNTER]].filter(
            (v) => !v
        ).length;

        const script = combatsNotVisited === 0 ? skipWithHotdogScript : skipScript;
        onClickScene(script, () => {
            setIsExiting(true);
            setShowAcquireAbility(combatsNotVisited);
            setShowAcquireItem(!visited[LITH_PLACES.TUTORIAL_ELITE_ENCOUNTER]);
        });
    };

    const handleCloseAcquireItems = () => {
        if (!showAcquireAbility) {
            onExit({ eventsSkipped: true });
        } else {
            setShowAcquireItem(false);
        }
    };

    const handleCloseCardRewards = () => {
        if (!showAcquireItem) {
            onExit({ eventsSkipped: true });
        } else {
            setShowAcquireAbility(0);
        }
    };

    const handleClickShop = () => {
        if (checkVisitPlace(TOWN_PLACES.SHOP)) {
            setIsShopOpen(true);
            setTimeout(() => {
                setIsShopScriptOpen(true);
            }, 5000); // 5 seconds
        }
    };

    const screenCentre = { x: 0, y: window.innerHeight / 2 };

    return (
        <div className={classes.root}>
            <div className={classes.bg}>
                {!isExiting && (
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
                                <TownNode
                                    icon={MoneyBagIcon}
                                    isVisited={visited[TOWN_PLACES.SHOP]}
                                    label={"Shop"}
                                    nodeImage={LithHarborShopImage}
                                    onClick={handleClickShop}
                                />
                                <br />

                                <TownNode
                                    icon={QuestionMarkIcon}
                                    isVisited={visited[LITH_PLACES.SHARK]}
                                    label={"By the Dock"}
                                    onClick={() => handleClickEvent(LITH_PLACES.SHARK, lithEventsTeoJohn)}
                                    nodeImage={LithHarborSharkImage}
                                />

                                <div className={classNames(classes.townCenter)}>
                                    <div className={classes.townHeader}>
                                        <h2>Lith Harbor</h2>
                                    </div>
                                    <img src={LithHarborCenterImage} alt="Lith Center" />
                                    <div className={classes.thoughtBubbleContainer}>
                                        <ThoughtBubbleIcon />
                                        <span className={classes.thought}>Where to go?</span>
                                    </div>
                                    <img src={player?.image} alt="You" className={classes.player} />
                                </div>

                                <TownNode
                                    icon={WorldMapIcon}
                                    isVisited={false}
                                    label={isFulfilledExitRequirement ? "Exit to World Map" : "[Exit] Skip Intro"}
                                    nodeImage={LithHarborExitImage}
                                    onClick={handleExitClick}
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
                            </div>
                        </Pan>
                        <Legend />
                    </>
                )}
                {isShopOpen && <Shop player={player} onBuyItem={() => {}} />}
                {isShopScriptOpen && (
                    <Overlay>
                        <ScenePlayer
                            scene={shopScript}
                            player={player}
                            updatePlayer={() => {}}
                            deck={deck}
                            onTransition={onTransition}
                            region={REGIONS.LITH_HARBOR}
                            onExit={() => {
                                setIsShopOpen(false);
                                setIsShopScriptOpen(false);
                            }}
                        />
                    </Overlay>
                )}
                {showAcquireItem && !showAcquireAbility && (
                    <ItemRewards
                        player={player}
                        playerCurrentItems={player.items}
                        overrideItemChoices={olafRewards}
                        onLoot={({ items }) => {
                            dispatch(acquireItems(items));
                        }}
                        onClose={handleCloseAcquireItems}
                        itemRewards={!visited[LITH_PLACES.SHARK] ? [halfEatenHotdog] : []}
                    />
                )}
                {showAcquireAbility > 0 && (
                    <CardRewards
                        player={player}
                        deck={deck}
                        updateDeck={updateDeck}
                        onClose={handleCloseCardRewards}
                        maxAmount={showAcquireAbility}
                        disableRarities={[RARITIES.RARE]}
                        disableIgnoreButton={true}
                    />
                )}
            </div>
        </div>
    );
};

export default LithHarbor;
