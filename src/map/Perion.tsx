import classNames from "classnames";
import { useState } from "react";
import { createUseStyles } from "react-jss";
import {
    DiamondImage,
    PerionArenaPreviewImage,
    PerionCenterImage,
    PerionDummiesPreviewImage,
    PerionExitImage,
    PerionRegionBGImage,
    PerionRestImage,
    PerionShopImage,
    PerionTradingPostImage,
    PerionWarriorHallImage,
} from "../images";
import { CampingIcon, JapaneseOgreIcon, MedalIcon, MoneyBagIcon, QuestionMarkIcon, ThoughtBubbleIcon, WorldMapIcon } from "../images/icons";
import { dancesWithBalrogScene } from "../scene/Perion/dancesWithBalrogScene";
import Legend from "./Legend";
import Pan from "./Pan";
import TownNode from "./TownNode";
import { TOWN_STYLES } from "./constants";
import { dummiesScene, mapleDummy } from "../scene/Perion/perionDummies";
import { arenaScene } from "../scene/Perion/arena";
import { basicDummy } from "../enemy/dummy";
import { TOWNS, TownProperties } from "./types";
import { getTownPlaces } from "./utils";
import { useAppDispatch, useAppSelector } from "../hooks";
import { EventScene, SceneEncounter } from "../scene/types";
import { playerStateSlice } from "../character/playerReducer";
import Shop from "../shops/Shop";
import { useTradingPostConfig } from "../shops/tradingPostUtils";
import TradingPost from "../shops/TradingPost";
import { undeadMage } from "../enemy/undead";
import { BATTLE_TYPES } from "../battle/types";
import { CAMPAIGN_BOSS_MUSIC } from "../battle/constants";

const useStyles = createUseStyles({
    ...TOWN_STYLES,
    root: {
        width: "100%",
        height: "100%",
        background: `url(${PerionRegionBGImage})`,
        color: "white",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
    },
    player: {
        ...TOWN_STYLES.player,
        bottom: 155,
    },
    dummyCharContainer: {
        bottom: 106,
        left: 175,
        position: "absolute",
    },
    dummyCharContainer2: {
        bottom: 106,
        left: 125,
        position: "absolute",
    },
    dummyCharContainer3: {
        bottom: 106,
        left: 75,
        position: "absolute",
    },
});

const store = {
    merchant: {
        name: "River and Harry",
    },
};

const PERION_PLACES: any = {
    ...getTownPlaces(TOWNS.PERION),
    DUMMIES: "perion-training-dummies",
    ARENA: "perion-arena",
    RICHE: "Riche",
};

const undeadMageFight: SceneEncounter = {
    waves: [
        {
            enemies: [null, null, undeadMage, null, null],
        },
    ],
    type: BATTLE_TYPES.BOSS,
    backgroundMusic: CAMPAIGN_BOSS_MUSIC,
};

export const undeadMageScene: EventScene = {
    id: "undead-mage-scene",
    script: [
        {
            dialog: ["[WIP] Test encounter for Riche, the Undead Mage."],
            responses: [
                {
                    text: "Fight.",
                    encounter: undeadMageFight,
                },
            ],
        },
    ],
};

const { selectInTownNode } = playerStateSlice.actions;

const Perion = ({ player, onExit, onClickScene, onBuyItem, onTrade, onCamp }: TownProperties) => {
    const classes = useStyles();
    const { nodesVisited: visited = {} } = useAppSelector((state) => state.character);
    const [isShopOpen, setIsShopOpen] = useState(false);
    const [isTradingPostOpen, setIsTradingPostOpen] = useState(false);
    const tradingPostConfig = useTradingPostConfig({ player, onTrade });

    const numActivitiesComplete: number = Object.values(PERION_PLACES).reduce((acc: number, val: string) => {
        if (visited[val]) {
            return acc + 1;
        }

        return acc;
    }, 0) as number;
    const canLeaveTown = numActivitiesComplete >= 4;
    const screenCentre = { x: 0, y: window.innerHeight / 2 };
    const dispatch = useAppDispatch();

    /**
     * Logs which places have been visited. If place hasn't been visited, returns true (can visit the place).
     */
    const checkVisitPlace = (key: string): boolean => {
        if (visited[key]) {
            return false;
        }
        dispatch(selectInTownNode(key));
        return true;
    };

    const handleClickTradingPost = () => {
        checkVisitPlace(PERION_PLACES.TRADING_POST);
        if (tradingPostConfig.tradesRemaining > 0) {
            setIsTradingPostOpen(true);
        }
    };

    const handleClickShop = () => {
        // Unlike some other nodes, the player can always revisit the shop.
        checkVisitPlace(PERION_PLACES.SHOP);
        setIsShopOpen(true);
    };

    const handleClickClassLeader = () => {
        if (checkVisitPlace(PERION_PLACES.CLASS_LEADER)) {
            onClickScene(dancesWithBalrogScene);
        }
    };

    const handleClickEvent = (eventKey: string, scene: EventScene) => {
        if (checkVisitPlace(eventKey)) {
            onClickScene(scene);
        }
    };

    const handleClickCamp = () => {
        if (checkVisitPlace(PERION_PLACES.REST)) {
            onCamp();
        }
    };

    return (
        <div className={classes.root}>
            <div className={classes.bg}>
                <Pan userPosition={screenCentre} disableIntroAnimate={true}>
                    <div className={classes.inner}>
                        <TownNode
                            icon={DiamondImage}
                            label={"Trading Post"}
                            nodeImage={PerionTradingPostImage}
                            onClick={handleClickTradingPost}
                            isVisited={tradingPostConfig.tradesRemaining === 0}
                        />
                        <TownNode icon={MoneyBagIcon} label={"Shop"} nodeImage={PerionShopImage} onClick={handleClickShop} />
                        <br />
                        <TownNode
                            icon={CampingIcon}
                            isVisited={visited[PERION_PLACES.REST]}
                            label={"Rest"}
                            nodeImage={PerionRestImage}
                            onClick={handleClickCamp}
                        />

                        <div className={classNames(classes.townCenter)}>
                            <img src={PerionCenterImage} alt="Perion center" className={classes.townCenterImage} />
                            <div className={classes.townHeader}>
                                <h2>Perion</h2>
                            </div>
                            <div className={classes.thoughtBubbleContainer}>
                                <ThoughtBubbleIcon />
                                <span className={classes.thought}>Where to go?</span>
                            </div>
                            <img src={player?.image} alt="You" className={classes.player} />
                        </div>

                        <TownNode
                            icon={WorldMapIcon}
                            isVisited={false}
                            isLocked={!canLeaveTown}
                            label={"Exit to World Map"}
                            nodeImage={PerionExitImage}
                            onClick={onExit}
                        />

                        <br />
                        <TownNode
                            icon={MedalIcon}
                            isVisited={visited[PERION_PLACES.ARENA]}
                            label={"Arena"}
                            onClick={() => handleClickEvent(PERION_PLACES.ARENA, arenaScene)}
                            nodeImage={PerionArenaPreviewImage}
                        />

                        <TownNode
                            icon={QuestionMarkIcon}
                            isVisited={visited[PERION_PLACES.DUMMIES]}
                            label={"Training Grounds"}
                            onClick={() => handleClickEvent(PERION_PLACES.DUMMIES, dummiesScene)}
                            nodeEl={
                                <div>
                                    <img src={PerionDummiesPreviewImage} />
                                    <img src={basicDummy.image} alt="Dummy" className={classes.dummyCharContainer} />
                                    <img src={mapleDummy.image} alt="Dummy" className={classes.dummyCharContainer2} />
                                    <img src={basicDummy.image} alt="Dummy" className={classes.dummyCharContainer3} />
                                </div>
                            }
                        />

                        {/** <TownNode
                            icon={JapaneseOgreIcon}
                            isVisited={visited[PERION_PLACES.CLASS_LEADER]}
                            label={"[Test] Dances With Balrog"}
                            onClick={handleClickClassLeader}
                            nodeImage={PerionWarriorHallImage}
                        />**/}
                        <TownNode
                            icon={JapaneseOgreIcon}
                            isVisited={visited[PERION_PLACES.RICHE]}
                            label={"[Test] Riche, the Undead Mage"}
                            onClick={() => handleClickEvent(PERION_PLACES.RICHE, undeadMageScene)}
                            nodeImage={PerionWarriorHallImage}
                        />
                    </div>
                </Pan>
                <Legend />
                {isShopOpen && <Shop player={player} onExit={() => setIsShopOpen(false)} onBuyItem={onBuyItem} town={TOWNS.PERION} />}
                {isTradingPostOpen && (
                    <TradingPost
                        player={player}
                        onExit={() => setIsTradingPostOpen(false)}
                        onTrade={onTrade}
                        tradingPostConfig={tradingPostConfig}
                    />
                )}
            </div>
        </div>
    );
};

export default Perion;
