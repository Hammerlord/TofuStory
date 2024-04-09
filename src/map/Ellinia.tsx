import classNames from "classnames";
import { useState } from "react";
import { createUseStyles } from "react-jss";
import {
    DiamondImage,
    ElliniaBGImage,
    ElliniaCampaignImage,
    ElliniaCenterImage,
    ElliniaExitImage,
    ElliniaMagicianHallImage,
    ElliniaShopImage,
    ElliniaTradingPostImage,
    MarrsForestPreviewImage,
} from "../images";
import { JapaneseOgreIcon, MoneyBagIcon, QuestionMarkIcon, ThoughtBubbleIcon, WorldMapIcon } from "../images/icons";
import { arwenScene } from "../scene/Ellinia/arwenScene";
import { grendelScene } from "../scene/Ellinia/grendelScene";
import Legend from "./Legend";
import Pan from "./Pan";
import TownNode from "./TownNode";
import { TOWN_STYLES } from "./constants";
import { secretGardenScene } from "../scene/Ellinia/secretGarden";
import { getTownPlaces } from "./utils";
import { TOWNS, TownProperties } from "./types";
import { useAppDispatch, useAppSelector } from "../hooks";
import { playerStateSlice } from "../character/playerReducer";
import { useShopConfig } from "../shops/shopUtils";
import Shop from "../shops/Shop";
import { useTradingPostConfig } from "../shops/tradingPostUtils";
import TradingPost from "../shops/TradingPost";

const useStyles = createUseStyles({
    ...TOWN_STYLES,
    player: {
        ...TOWN_STYLES.player,
        bottom: 175,
    },
    root: {
        width: "100%",
        height: "100%",
        background: `url(${ElliniaBGImage})`,
        color: "white",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
    },
});

const store = {
    merchant: {
        name: "Flora and Serabi",
    },
};

const ELLINIA_PLACES: any = {
    ...getTownPlaces(TOWNS.ELLINIA),
    SECRET_GARDEN: "secret-garden",
};

const { selectInTownNode } = playerStateSlice.actions;

const Ellinia = ({ player, onExit, onClickScene, onBuyItem, onTrade }: TownProperties) => {
    const classes = useStyles();
    const { nodesVisited: visited = {} } = useAppSelector((state) => state).character;
    const dispatch = useAppDispatch();
    const [isShopOpen, setIsShopOpen] = useState(false);
    const shopConfig = useShopConfig({ player, onBuyItem });
    const [isTradingPostOpen, setIsTradingPostOpen] = useState(false);
    const tradingPostConfig = useTradingPostConfig({ player, onTrade });

    const numActivitiesComplete: number = Object.values(ELLINIA_PLACES).reduce((acc: number, val: string) => {
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
        checkVisitPlace(ELLINIA_PLACES.TRADING_POST);
        if (tradingPostConfig.tradesRemaining > 0) {
            setIsTradingPostOpen(true);
        }
    };

    const handleClickShop = () => {
        checkVisitPlace(ELLINIA_PLACES.SHOP);
        setIsShopOpen(true);
    };

    const handleClickClassLeader = () => {
        if (checkVisitPlace(ELLINIA_PLACES.CLASS_LEADER)) {
            onClickScene(grendelScene);
        }
    };

    const handleClickEvent = (eventKey, scene) => {
        if (checkVisitPlace(eventKey)) {
            onClickScene(scene);
        }
    };

    const handleClickCampaign = () => {
        if (checkVisitPlace(ELLINIA_PLACES.CAMPAIGN)) {
            onClickScene(arwenScene);
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
                            nodeImage={ElliniaTradingPostImage}
                            onClick={handleClickTradingPost}
                            isVisited={tradingPostConfig.tradesRemaining === 0}
                        />
                        <TownNode icon={MoneyBagIcon} label={"Shop"} nodeImage={ElliniaShopImage} onClick={handleClickShop} />
                        <br />
                        <TownNode
                            icon={QuestionMarkIcon}
                            isVisited={visited[ELLINIA_PLACES.CAMPAIGN]}
                            label={"Campaign"}
                            nodeImage={ElliniaCampaignImage}
                            onClick={handleClickCampaign}
                        />

                        <div className={classNames(classes.townCenter)}>
                            <img src={ElliniaCenterImage} alt="Ellinia Center" className={classes.townCenterImage} />
                            <div className={classes.townHeader}>
                                <h2>Ellinia</h2>
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
                            nodeImage={ElliniaExitImage}
                            onClick={onExit}
                        />
                        <br />
                        <TownNode
                            icon={JapaneseOgreIcon}
                            isVisited={visited[ELLINIA_PLACES.CLASS_LEADER]}
                            label={"[Test] Grendel"}
                            nodeImage={ElliniaMagicianHallImage}
                            onClick={handleClickClassLeader}
                        />
                        <TownNode
                            icon={JapaneseOgreIcon}
                            isVisited={visited[ELLINIA_PLACES.SECRET_GARDEN]}
                            isLocked={!visited[ELLINIA_PLACES.CAMPAIGN]}
                            label={"Secret Garden"}
                            nodeImage={MarrsForestPreviewImage}
                            onClick={() => handleClickEvent(ELLINIA_PLACES.SECRET_GARDEN, secretGardenScene)}
                        />
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
            </div>
        </div>
    );
};

export default Ellinia;
