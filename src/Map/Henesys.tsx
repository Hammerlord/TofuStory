import classNames from "classnames";
import { useMemo, useState } from "react";
import { createUseStyles } from "react-jss";
import { playerStateSlice } from "../character/playerReducer";
import { useAppDispatch, useAppSelector } from "../hooks";
import {
    DiamondImage,
    GachaponImage,
    HenesysArcherHallImage,
    HenesysCenterImage,
    HenesysExitImage,
    HenesysGachaponImage,
    HenesysPantryImage,
    HenesysRegionBGImage,
    HenesysRestImage,
    HenesysShopImage,
    HenesysTradingPostImage,
    PersonalAnvilImage,
    TownTransmuteImage,
} from "../images";
import { CampingIcon, JapaneseOgreIcon, MoneyBagIcon, QuestionMarkIcon, ThoughtBubbleIcon, WorldMapIcon } from "../images/icons";
import { athenaPierceScene } from "../scene/Henesys/athenaPierceScene";
import pantry from "../scene/Henesys/pantry";
import { gachaponEvents } from "../scene/gachapon/Gachapon";
import Legend from "./Legend";
import Pan from "./Pan";
import TownNode from "./TownNode";
import { TOWN_STYLES } from "./constants";
import { TOWNS, TownProperties } from "./types";
import { getTownPlaces } from "./utils";
import { useShopConfig } from "../shops/shopUtils";
import Shop from "../shops/Shop";
import { useTradingPostConfig } from "../shops/tradingPostUtils";
import TradingPost from "../shops/TradingPost";
import { CombatAbility } from "../ability/types";
import Transmutation from "../shops/Transmutation";

const useStyles = createUseStyles({
    ...TOWN_STYLES,
    root: {
        width: "100%",
        height: "100%",
        background: `url(${HenesysRegionBGImage})`,
        color: "white",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
    },
    player: {
        ...TOWN_STYLES.player,
        bottom: 185,
        left: "52%",
    },
    gachaponMachine: {
        position: "absolute",
        left: 100,
        top: 59,
    },
});

const store = {
    merchant: {
        name: "Karl and Sam",
    },
};

const HENESYS_PLACES: any = {
    ...getTownPlaces(TOWNS.HENESYS),
    PANTRY: "pantry",
};

const HENESYS_BOSSES = {
    ATHENA: "athena",
    MINI_BEAN: "minibean",
};

const { selectInTownNode } = playerStateSlice.actions;

const Henesys = ({ player, onExit, onClickScene, onBuyItem, onTrade, onCamp, onTransmute }: TownProperties) => {
    const classes = useStyles();
    const { nodesVisited: visited = {} } = useAppSelector((state) => state.character);
    const dispatch = useAppDispatch();
    const [isShopOpen, setIsShopOpen] = useState(false);
    const shopConfig = useShopConfig({ player, onBuyItem });
    const [isTradingPostOpen, setIsTradingPostOpen] = useState(false);
    const tradingPostConfig = useTradingPostConfig({ player, onTrade });
    const [isWorkshopOpen, setIsWorkshopOpen] = useState(false);
    const [transmutationsRemaining, setTransmutationsRemaining] = useState(2);

    const numActivitiesComplete: number = Object.values(HENESYS_PLACES).reduce((acc: number, val: string) => {
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
        checkVisitPlace(HENESYS_PLACES.TRADING_POST);
        if (tradingPostConfig.tradesRemaining > 0) {
            setIsTradingPostOpen(true);
        }
    };

    const handleClickWorkshop = () => {
        if (transmutationsRemaining > 0) {
            checkVisitPlace(HENESYS_PLACES.WORKSHOP);
            setIsWorkshopOpen(true);
        }
    };

    const handleClickShop = () => {
        checkVisitPlace(HENESYS_PLACES.SHOP);
        setIsShopOpen(true);
    };

    const handleClickClassLeader = () => {
        if (checkVisitPlace(HENESYS_PLACES.CLASS_LEADER)) {
            onClickScene(athenaPierceScene);
        }
    };

    const handleClickEvent = (eventKey, scene) => {
        if (checkVisitPlace(eventKey)) {
            onClickScene(scene);
        }
    };

    const handleClickCamp = () => {
        if (checkVisitPlace(HENESYS_PLACES.REST)) {
            onCamp();
        }
    };

    const handleTransmute = (options: { card: string; for: CombatAbility }) => {
        setTransmutationsRemaining((prev) => prev - 1);
        onTransmute(options);
    };

    const boss = useMemo(() => {
        if (Math.random() < 0.5) {
            return HENESYS_BOSSES.ATHENA;
        }

        return HENESYS_BOSSES.MINI_BEAN;
    }, []);

    return (
        <div className={classes.root}>
            <div className={classes.bg}>
                <Pan userPosition={screenCentre} disableIntroAnimate={true}>
                    <div className={classes.inner}>
                        {/**
                           <TownNode
                            isVisited={tradingPostConfig.tradesRemaining === 0}
                            icon={DiamondImage}
                            label={"Trading Post"}
                            nodeImage={HenesysTradingPostImage}
                            onClick={handleClickTradingPost}
                        />
                        */}
                        <TownNode
                            icon={PersonalAnvilImage}
                            label={"Workshop"}
                            nodeImage={TownTransmuteImage}
                            onClick={handleClickWorkshop}
                            isVisited={transmutationsRemaining === 0}
                        />
                        <TownNode icon={MoneyBagIcon} label={"Shop"} nodeImage={HenesysShopImage} onClick={handleClickShop} />
                        <br />
                        {boss === HENESYS_BOSSES.MINI_BEAN && (
                            <TownNode
                                icon={JapaneseOgreIcon}
                                isVisited={visited[HENESYS_PLACES.PANTRY]}
                                label={"HELP!"}
                                nodeImage={HenesysPantryImage}
                                onClick={() => handleClickEvent(HENESYS_PLACES.PANTRY, pantry)}
                            />
                        )}

                        {boss !== HENESYS_BOSSES.MINI_BEAN && (
                            <TownNode
                                icon={CampingIcon}
                                isVisited={visited[HENESYS_PLACES.REST]}
                                label={"Rest"}
                                nodeImage={HenesysRestImage}
                                onClick={handleClickCamp}
                            />
                        )}

                        <div className={classNames(classes.townCenter)}>
                            <img src={HenesysCenterImage} alt="Henesys Center" className={classes.townCenterImage} />
                            <div className={classes.townHeader}>
                                <h2>Henesys</h2>
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
                            nodeImage={HenesysExitImage}
                            onClick={onExit}
                        />
                        <br />
                        <TownNode
                            icon={QuestionMarkIcon}
                            isVisited={visited[HENESYS_PLACES.GACHAPON]}
                            label={"Gachapon Machine"}
                            nodeEl={
                                <div>
                                    <img src={HenesysGachaponImage} alt="Gachapon Preview" />
                                    <img src={GachaponImage} className={classes.gachaponMachine} />
                                </div>
                            }
                            onClick={() => handleClickEvent(HENESYS_PLACES.GACHAPON, gachaponEvents)}
                        />

                        {boss === HENESYS_BOSSES.ATHENA && (
                            <TownNode
                                icon={JapaneseOgreIcon}
                                isVisited={visited[HENESYS_PLACES.CLASS_LEADER]}
                                label={"[Test] Athena Pierce"}
                                nodeImage={HenesysArcherHallImage}
                                onClick={handleClickClassLeader}
                            />
                        )}

                        {boss !== HENESYS_BOSSES.ATHENA && (
                            <TownNode
                                icon={CampingIcon}
                                isVisited={visited[HENESYS_PLACES.REST]}
                                label={"Rest"}
                                nodeImage={HenesysRestImage}
                                onClick={handleClickCamp}
                            />
                        )}
                    </div>
                </Pan>
                <Legend />
                {isShopOpen && <Shop player={player} onExit={() => setIsShopOpen(false)} onBuyItem={onBuyItem} shopConfig={shopConfig} />}
                {isTradingPostOpen && (
                    <TradingPost
                        player={player}
                        onExit={() => setIsTradingPostOpen(false)}
                        onTrade={onTrade}
                        tradingPostConfig={tradingPostConfig}
                    />
                )}
                {isWorkshopOpen && (
                    <Transmutation
                        player={player}
                        onExit={() => setIsWorkshopOpen(false)}
                        onTransmute={handleTransmute}
                        numTransmutations={transmutationsRemaining}
                    />
                )}
            </div>
        </div>
    );
};

export default Henesys;
