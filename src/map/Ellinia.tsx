import classNames from "classnames";
import { useState } from "react";
import { createUseStyles } from "react-jss";
import { playerStateSlice } from "../character/playerReducer";
import { useAppDispatch, useAppSelector } from "../hooks";
import {
    DiamondImage,
    ElliniaBGImage,
    ElliniaCampaignImage,
    ElliniaCenterImage,
    ElliniaExitImage,
    ElliniaMagicianHallImage,
    ElliniaShopImage,
    ElliniaTradingPostImage,
    ElliniaTreeHoleImage,
    MarrsForestPreviewImage,
} from "../images";
import { JapaneseOgreIcon, MoneyBagIcon, QuestionMarkIcon, ThoughtBubbleIcon, WorldMapIcon } from "../images/icons";
import { arwenScene } from "../scene/Ellinia/arwenScene";
import { grendelScene } from "../scene/Ellinia/grendelScene";
import { secretGardenScene } from "../scene/Ellinia/secretGarden";
import Shop from "../shops/Shop";
import TradingPost from "../shops/TradingPost";
import Legend from "./Legend";
import Pan from "./Pan";
import TownNode from "./TownNode";
import { TOWN_STYLES } from "./constants";
import { TOWNS, TownProperties } from "./types";
import { getTownPlaces } from "./utils";
import { crystalScene } from "../scene/crystals/Crystals";

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
    CRYSTAL_CAVE: "crystal-cave",
};

const { selectInTownNode } = playerStateSlice.actions;

const Ellinia = ({ player, onExit, onClickScene }: TownProperties) => {
    const classes = useStyles();
    const { nodesVisited: visited = {}, townShops } = useAppSelector((state) => state).character;
    const dispatch = useAppDispatch();
    const [isShopOpen, setIsShopOpen] = useState(false);
    const [isTradingPostOpen, setIsTradingPostOpen] = useState(false);
    const { tradingPost } = townShops[TOWNS.ELLINIA] || {};

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
        if (tradingPost?.numTradesRemaining > 0) {
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
                            isVisited={tradingPost.numTradesRemaining === 0}
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
                        <TownNode
                            icon={QuestionMarkIcon}
                            isVisited={visited[ELLINIA_PLACES.CRYSTAL_CAVE]}
                            label={"Crystal Cave"}
                            nodeImage={ElliniaTreeHoleImage}
                            onClick={() => handleClickEvent(ELLINIA_PLACES.CRYSTAL_CAVE, crystalScene)}
                        />
                    </div>
                </Pan>
                <Legend />
                {isShopOpen && <Shop onExit={() => setIsShopOpen(false)} town={TOWNS.ELLINIA} />}
                {isTradingPostOpen && <TradingPost onExit={() => setIsTradingPostOpen(false)} town={TOWNS.ELLINIA} />}
            </div>
        </div>
    );
};

export default Ellinia;
