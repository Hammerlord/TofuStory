import classNames from "classnames";
import { useState } from "react";
import { createUseStyles } from "react-jss";
import CardRewards from "../Menu/CardRewards";
import ItemRewards from "../Menu/ItemRewards";
import warriorTutorial, { magicianTutorial } from "../Menu/tutorial";
import { PLAYER_CLASSES } from "../Menu/types";
import { ACTION_TYPES, EFFECT_CLASSES, EFFECT_TYPES, Minion, TARGET_TYPES } from "../ability/types";
import { playerStateSlice } from "../character/playerReducer";
import { attack } from "../enemy/abilities";
import { basicDummy } from "../enemy/dummy";
import { casey, olaf } from "../enemy/enemy";
import { useAppDispatch } from "../hooks";
import Icon from "../icon/Icon";
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
    SkullPatchImage,
} from "../images";
import { CrossedSwordsIcon, MedalIcon, MoneyBagIcon, QuestionMarkIcon, ShieldIcon, ThoughtBubbleIcon, WorldMapIcon } from "../images/icons";
import { halfEatenHotdog } from "../item/consumables";
import { bigMesoItem, leatherSandals, mesoItem, redHeadband } from "../item/items";
import { RARITIES } from "../item/types";
import ScenePlayer from "../scene/ScenePlayer";
import { lithEventsOlaf } from "../scene/olaf";
import { lithEventsTeoJohn } from "../scene/teojohn";
import { EventScene, SceneEncounter } from "../scene/types";
import Shop from "../shops/Shop";
import Overlay from "../view/Overlay";
import Legend from "./Legend";
import Pan from "./Pan";
import TownNode from "./TownNode";
import { TOWN_STYLES } from "./constants";
import { REGIONS } from "./regions";
import { TOWNS } from "./types";
import { getTownPlaces } from "./utils";

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

const LITH_PLACES: any = {
    ...getTownPlaces(TOWNS.LITH_HARBOR),
    TUTORIAL_BASIC: "tutorial",
    TUTORIAL_ELITE_ENCOUNTER: "tutorial2",
    SHARK: "shark",
};

const LITH_PREREQUISITES = {
    [LITH_PLACES.TUTORIAL_ELITE_ENCOUNTER]: [LITH_PLACES.TUTORIAL_BASIC, LITH_PLACES.SHOP],
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

const shopkeeper: Minion = {
    name: "Shopkeeper",
    image: NatashaImage,
    maxHP: 15,
    abilities: [
        {
            ...attack,
        },
        {
            name: "Block",
            dialog: "Uh oh!",
            image: ShieldIcon,
            actions: [
                {
                    type: ACTION_TYPES.EFFECT,
                    target: TARGET_TYPES.SELF,
                    armor: 3,
                    playbackTime: 1000,
                },
            ],
        },
        {
            ...attack,
            dialog: "Shoo!",
        },
    ],
    effects: [
        {
            name: "",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.NONE,
            onWaveStart: {
                ability: {
                    name: "",
                    dialog: "I say, shoo!",
                    actions: [
                        {
                            target: TARGET_TYPES.SELF,
                            type: ACTION_TYPES.NONE,
                            playbackTime: 1500,
                        },
                    ],
                },
                removeEffect: true,
            },
        },
        {
            name: "",
            type: EFFECT_TYPES.NONE,
            class: EFFECT_CLASSES.NONE,
            onReceiveDamage: {
                ability: {
                    name: "",
                    dialog: "Oof!",
                    actions: [
                        {
                            target: TARGET_TYPES.SELF,
                            type: ACTION_TYPES.NONE,
                            playbackTime: 1000,
                        },
                    ],
                },
                removeEffect: true,
            },
        },
    ],
};

const shopkeeperEncounter: SceneEncounter = {
    waves: [
        {
            enemies: [null, null, shopkeeper, null, null],
            description: [
                <>
                    Certain actions, like mugging NPCs, will increase your <Icon icon={SkullPatchImage} /> Infamy.
                </>,
                <>
                    <Icon icon={SkullPatchImage} /> Infamy increases the chance that vengeful entities will come after you.
                </>,
            ],
        },
    ],
    disableCardRewards: true,
    disableItemRewards: true,
};

const shopScript: EventScene = {
    id: "lith-shop",
    script: [
        {
            disableBackground: true,
            speaker: { name: "Shopkeeper", image: NatashaImage },
            dialog: ["Ahhh! Out, you pest!"],
        },
        {
            disableBackground: true,
            speaker: { name: "Shopkeeper", image: NatashaImage },
            dialog: ["How dare your penniless mushroom self barge into my shop??"],
        },
        {
            disableBackground: true,
            speaker: { name: "Shopkeeper", image: NatashaImage },
            dialog: [
                "Leave, now! [Natasha waves the brush-end of a broom menacingly.]",
                "And if you really want to buy something, come back with some mesos!",
            ],
            responses: [
                {
                    text: "Mug the shopkeeper.",
                    encounter: shopkeeperEncounter,
                    infamy: 1,
                    next: [
                        {
                            disableBackground: true,
                            speaker: { name: "Shopkeeper", image: NatashaImage },
                            dialog: ["Alright, alright, you're not penniless! Yeow!"],
                            items: {
                                itemPool: [mesoItem],
                            },
                        },
                        {
                            disableBackground: true,
                            dialog: [
                                "[Your Infamy has increased by 1.",
                                "Though you mugged this NPC, being amicable to NPCs can be beneficial down the line, if you meet them again.]",
                            ],
                        },
                        {
                            disableBackground: true,
                            dialog: ["[In this case, it's just a tutorial, and you'll never see this shopkeeper again.]"],
                            responses: [
                                {
                                    text: "Hey, who's talking to me?",
                                    next: [
                                        {
                                            disableBackground: true,
                                            dialog: ["[Uh, don't worry about it. Adventure awaits! Let's go!]"],
                                            responses: [
                                                {
                                                    text: "",
                                                    isExit: true,
                                                },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
                {
                    text: "Best not to get into trouble here. I should leave.",
                    next: [
                        {
                            disableBackground: true,
                            speaker: { name: "Shopkeeper", image: NatashaImage },
                            dialog: ["Hmph, that's more like it!"],
                        },
                        {
                            disableBackground: true,
                            dialog: [
                                "[You've avoided a confrontation.",
                                "Being amicable to NPCs can be beneficial down the line--if you meet them again.]",
                            ],
                        },
                        {
                            disableBackground: true,
                            dialog: [
                                "[On the other hand, picking hostile options will raise your Infamy, making it more likely that adventurers will come after you during events.",
                                "Sometimes, NPCs may even seek revenge.",
                                "In this case, it's just a tutorial, and you'll never see this shopkeeper again.]",
                            ],
                        },
                        {
                            disableBackground: true,
                            dialog: ["[Here are the mesos from the other option.]"],
                            infamy: 1,
                            items: {
                                itemPool: [mesoItem],
                            },
                        },
                        {
                            disableBackground: true,
                            dialog: ["[You can't spend them here, but you'll find other shops later on.]"],
                            responses: [
                                {
                                    text: "Hey, who's talking to me?",
                                    next: [
                                        {
                                            disableBackground: true,

                                            dialog: ["[Uh, don't worry about it. Adventure awaits!]"],
                                            responses: [
                                                {
                                                    text: "",
                                                    isExit: true,
                                                },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ],
};

export const skipOlafRewards = [redHeadband, leatherSandals, bigMesoItem];

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

    const exitRequirements = [LITH_PLACES.SHARK, LITH_PLACES.TUTORIAL_BASIC, LITH_PLACES.TUTORIAL_ELITE_ENCOUNTER, LITH_PLACES.SHOP];
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

    const getGrantedItemPool = () => {
        const itemPool = [];

        if (!visited[LITH_PLACES.SHARK]) {
            itemPool.push(halfEatenHotdog);
        }

        if (!visited[LITH_PLACES.SHOP]) {
            itemPool.push(mesoItem);
        }

        return itemPool;
    };

    const handleExitClick = () => {
        if (isFulfilledExitRequirement) {
            onExit();
            return;
        }
        const combatsNotVisited = [visited[LITH_PLACES.TUTORIAL_BASIC], visited[LITH_PLACES.TUTORIAL_ELITE_ENCOUNTER]].filter(
            (v) => !v
        ).length;

        let script;
        if (combatsNotVisited === 0) {
            /**
             * If the player is missing the hotdog and/or shop mesos, grant it through a dialog option rather than through ItemRewards
             */
            script = {
                ...skipScript,
                script: [
                    {
                        ...skipScript.script[0],
                        items: {
                            itemPool: getGrantedItemPool(),
                        },
                    },
                ],
            };
        } else {
            script = skipScript;
        }

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
        if (checkVisitPlace(LITH_PLACES.SHOP)) {
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
                                    isVisited={visited[LITH_PLACES.SHOP]}
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
                {isShopOpen && <Shop />}
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
                            onBattle={onBattle}
                        />
                    </Overlay>
                )}
                {showAcquireItem && !showAcquireAbility && (
                    <ItemRewards
                        player={player}
                        overrideItemChoices={skipOlafRewards}
                        onLoot={({ items }) => {
                            dispatch(acquireItems(items));
                        }}
                        onClose={handleCloseAcquireItems}
                        itemRewards={getGrantedItemPool()}
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
