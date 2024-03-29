import classNames from "classnames";
import { createUseStyles } from "react-jss";
import Icon from "../icon/Icon";
import {
    CaseyImage,
    DiamondImage,
    KerningBarImage,
    KerningCaseyImage,
    KerningCenterImage,
    KerningCityBGImage,
    KerningExitImage,
    KerningSewerImage,
    KerningShopImage,
    KerningTradingPostImage,
} from "../images";
import { JapaneseOgreIcon, MoneyBagIcon, QuestionMarkIcon, ThoughtBubbleIcon, WorldMapIcon } from "../images/icons";
import { barScene } from "../scene/Kerning/darkLordScene";
import kerningMatchingCards from "../scene/Kerning/kerningMatchingCards";
import { KPQ } from "../scene/Kerning/kpq/KPQ";
import Tooltip from "../view/Tooltip";
import Pan from "./Pan";
import { TOWN_STYLES } from "./constants";
import { useState } from "react";
import TownNode from "./TownNode";
import Legend from "./Legend";
import { TOWNS, TownProperties } from "./types";
import { getTownPlaces } from "./utils";
import { useAppDispatch, useAppSelector } from "../hooks";
import { playerStateSlice } from "../character/playerReducer";
import { useShopConfig } from "../Menu/shopUtils";
import Shop from "../Menu/Shop";

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
};

const { selectInTownNode } = playerStateSlice.actions;

const KerningCity = ({ player, onExit, onClickScene, onClickTradingPost, onBuyItem }: TownProperties) => {
    const classes = useStyles();
    const { nodesVisited: visited = {} } = useAppSelector((state) => state.character);
    const dispatch = useAppDispatch();
    const [isShopOpen, setIsShopOpen] = useState(false);
    const shopConfig = useShopConfig({ player, onBuyItem });

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
        if (checkVisitPlace(KERNING_PLACES.TRADING_POST)) {
            onClickTradingPost && onClickTradingPost();
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
                        <TownNode
                            icon={DiamondImage}
                            isVisited={visited[KERNING_PLACES.TRADING_POST]}
                            label={"Trading Post"}
                            nodeImage={KerningTradingPostImage}
                            onClick={handleClickTradingPost}
                        />
                        <TownNode icon={MoneyBagIcon} label={"Shop"} nodeImage={KerningShopImage} onClick={handleClickShop} />
                        <br />
                        <TownNode
                            icon={QuestionMarkIcon}
                            isVisited={visited[KERNING_PLACES.CAMPAIGN]}
                            label={"Campaign"}
                            nodeImage={KerningSewerImage}
                            onClick={handleClickCampaign}
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
                            isVisited={visited[KERNING_PLACES.MATCH_CARDS]}
                            label={"Hmm?"}
                            nodeEl={caseyNodeEl}
                            onClick={() => handleClickEvent(KERNING_PLACES.MATCH_CARDS, kerningMatchingCards)}
                        />
                        <TownNode
                            icon={JapaneseOgreIcon}
                            isVisited={visited[KERNING_PLACES.CLASS_LEADER]}
                            label={"[Test] Dark Lord"}
                            onClick={handleClickClassLeader}
                            nodeImage={KerningBarImage}
                        />
                    </div>
                </Pan>
                <Legend />
                {isShopOpen && <Shop player={player} onExit={() => setIsShopOpen(false)} onBuyItem={onBuyItem} shopConfig={shopConfig} />}
            </div>
        </div>
    );
};

export default KerningCity;
