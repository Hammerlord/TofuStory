import classNames from "classnames";
import { useState } from "react";
import { createUseStyles } from "react-jss";
import { CombatAbility } from "../ability/types";
import { BATTLE_TYPES } from "../battle/types";
import { playerStateSlice } from "../character/playerReducer";
import { dyle } from "../enemy/dyle";
import { useAppDispatch, useAppSelector } from "../hooks";
import {
    CaseyImage,
    KerningBarImage,
    KerningCaseyImage,
    KerningCenterImage,
    KerningCityBGImage,
    KerningExitImage,
    KerningRestImage,
    KerningSewerImage,
    KerningShopImage,
    KerningSwampImage,
    PersonalAnvilImage,
    SwampRegionBGImage,
    TownTransmuteImage,
} from "../images";
import { CampingIcon, JapaneseOgreIcon, MoneyBagIcon, QuestionMarkIcon, ThoughtBubbleIcon, WorldMapIcon } from "../images/icons";
import { barScene } from "../scene/Kerning/darkLordScene";
import { KPQ } from "../scene/Kerning/kpq/KPQ";
import { EventScene, SceneEncounter } from "../scene/types";
import Shop from "../shops/Shop";
import TradingPost from "../shops/TradingPost";
import Transmutation from "../shops/Transmutation";
import Tooltip from "../view/Tooltip";
import Legend from "./Legend";
import Pan from "./Pan";
import TownNode from "./TownNode";
import { TOWN_STYLES } from "./constants";
import { TOWNS, TownProperties } from "./types";
import { getTownPlaces } from "./utils";

const useStyles = createUseStyles({
    ...TOWN_STYLES,
    root: {
        width: "100%",
        height: "100%",
        background: `url(${KerningCityBGImage})`,
        color: "white",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
    },
    player: {
        ...TOWN_STYLES.player,
        position: "absolute",
        bottom: 184,
        left: "50%",
        transform: "translateX(-50%)",
    },
    caseyCharContainer: {
        bottom: "80px",
        left: "50%",
        transform: "translateX(-50%)",
        position: "absolute",
    },
    caseyDialog: {
        minWidth: 150,
    },
});

const store = {
    merchant: {
        name: "Cutthroat Manny and Don Hwang",
    },
};

const KERNING_PLACES: any = {
    ...getTownPlaces(TOWNS.KERNING),
    MATCH_CARDS: "match-cards",
    DYLE: "dyle",
};

const { selectInTownNode } = playerStateSlice.actions;

const dyleFight: SceneEncounter = {
    waves: [
        {
            enemies: [null, null, dyle, null, null],
            winCondition: {
                defeatBoss: true,
            },
        },
    ],
    type: BATTLE_TYPES.BOSS,
    backgroundMusic: "https://maplestory.io/api/GMS/93T/music/Bgm12/AquaCave",
};

export const dyleScene: EventScene = {
    id: "dyle-event",
    script: [
        {
            dialog: ["[WIP - Dyle] An evil crocodile has taken over the sewers!"],
            background: SwampRegionBGImage,
            responses: [
                {
                    text: "Fight.",
                    encounter: dyleFight,
                },
            ],
        },
    ],
};

const KerningCity = ({ player, onExit, onClickScene, onCamp }: TownProperties) => {
    const classes = useStyles();
    const { nodesVisited: visited = {}, townShops, rolledBosses } = useAppSelector((state) => state.character);
    const dispatch = useAppDispatch();
    const [isShopOpen, setIsShopOpen] = useState(false);
    const [isTradingPostOpen, setIsTradingPostOpen] = useState(false);
    const [isWorkshopOpen, setIsWorkshopOpen] = useState(false);
    const { workshop, tradingPost } = townShops[TOWNS.KERNING] || {};
    const numTransmutesRemaining = workshop?.numTransmutesRemaining || 0;

    const numActivitiesComplete: number = Object.values(KERNING_PLACES).reduce((acc: number, val: string) => {
        if (visited[val]) {
            return acc + 1;
        }

        return acc;
    }, 0) as number;

    const canLeaveTown = numActivitiesComplete >= 4;
    const screenCentre = { x: 0, y: window.innerHeight / 2 };

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
        checkVisitPlace(KERNING_PLACES.TRADING_POST);
        if (tradingPost.numTradesRemaining > 0) {
            setIsTradingPostOpen(true);
        }
    };

    const handleClickWorkshop = () => {
        if (numTransmutesRemaining > 0) {
            checkVisitPlace(KERNING_PLACES.WORKSHOP);
            setIsWorkshopOpen(true);
        }
    };

    const handleClickShop = () => {
        checkVisitPlace(KERNING_PLACES.SHOP);
        setIsShopOpen(true);
    };

    const handleClickClassLeader = () => {
        if (checkVisitPlace(KERNING_PLACES.CLASS_LEADER)) {
            onClickScene(barScene);
        }
    };

    const handleClickCampaign = () => {
        if (checkVisitPlace(KERNING_PLACES.CAMPAIGN)) {
            onClickScene(KPQ);
        }
    };

    const handleClickEvent = (eventKey: string, scene) => {
        if (checkVisitPlace(eventKey)) {
            onClickScene(scene);
        }
    };

    const handleClickCamp = () => {
        if (checkVisitPlace(KERNING_PLACES.REST)) {
            onCamp();
        }
    };

    const caseyNodeEl = (
        <>
            <img src={KerningCaseyImage} alt="Kerning City Crane" />
            <div className={classes.caseyCharContainer}>
                <Tooltip
                    title="Hey Mushie, over here!"
                    open={true}
                    PopperProps={{ disablePortal: true }}
                    classes={{ tooltip: classes.caseyDialog }}
                >
                    <img src={CaseyImage} alt="Your friend?" />
                </Tooltip>
            </div>
        </>
    );

    return (
        <div className={classes.root}>
            <div className={classes.bg}>
                <Pan userPosition={screenCentre} disableIntroAnimate={true}>
                    <div className={classes.inner}>
                        {/**
                        <TownNode
                            icon={DiamondImage}
                            label={"Trading Post"}
                            nodeImage={KerningTradingPostImage}
                            onClick={handleClickTradingPost}
                            isVisited={tradingPostConfig.tradesRemaining === 0}
                        />
                         */}

                        <TownNode
                            icon={PersonalAnvilImage}
                            label={"Workshop"}
                            nodeImage={TownTransmuteImage}
                            onClick={handleClickWorkshop}
                            isVisited={numTransmutesRemaining === 0}
                        />
                        <TownNode icon={MoneyBagIcon} label={"Shop"} nodeImage={KerningShopImage} onClick={handleClickShop} />
                        <br />
                        <TownNode
                            icon={CampingIcon}
                            isVisited={visited[KERNING_PLACES.REST]}
                            label={"Rest"}
                            nodeImage={KerningRestImage}
                            onClick={handleClickCamp}
                        />

                        <div className={classNames(classes.townCenter)}>
                            <img src={KerningCenterImage} alt="Kerning Center" className={classes.townCenterImage} />
                            <div className={classes.townHeader}>
                                <h2>Kerning City</h2>
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
                            nodeImage={KerningExitImage}
                            onClick={onExit}
                        />

                        <br />

                        <TownNode
                            icon={QuestionMarkIcon}
                            isVisited={visited[KERNING_PLACES.CAMPAIGN]}
                            label={"Campaign"}
                            nodeImage={KerningSewerImage}
                            onClick={handleClickCampaign}
                        />

                        {/*<TownNode
                            icon={QuestionMarkIcon}
                            isVisited={visited[KERNING_PLACES.MATCH_CARDS]}
                            label={"Hmm?"}
                            nodeEl={caseyNodeEl}
                            onClick={() => handleClickEvent(KERNING_PLACES.MATCH_CARDS, kerningMatchingCards)}
                        />*/}
                        {rolledBosses[TOWNS.KERNING] === dyle.name ? (
                            <TownNode
                                icon={JapaneseOgreIcon}
                                isVisited={visited[KERNING_PLACES.DYLE]}
                                label={"[Test] Dyle"}
                                onClick={() => handleClickEvent(KERNING_PLACES.DYLE, dyleScene)}
                                nodeImage={KerningSwampImage}
                            />
                        ) : (
                            <TownNode
                                icon={JapaneseOgreIcon}
                                isVisited={visited[KERNING_PLACES.CLASS_LEADER]}
                                label={"[Test] Dark Lord"}
                                onClick={handleClickClassLeader}
                                nodeImage={KerningBarImage}
                            />
                        )}
                    </div>
                </Pan>
                <Legend />
                {isShopOpen && <Shop onExit={() => setIsShopOpen(false)} town={TOWNS.KERNING} />}
                {isTradingPostOpen && <TradingPost onExit={() => setIsTradingPostOpen(false)} town={TOWNS.KERNING} />}
                {isWorkshopOpen && <Transmutation onExit={() => setIsWorkshopOpen(false)} town={TOWNS.KERNING} />}
            </div>
        </div>
    );
};

export default KerningCity;
