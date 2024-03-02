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
import { JapaneseOgreIcon, MoneyBagIcon, QuestionMarkIcon, WorldMapIcon } from "../images/icons";
import { barScene } from "../scene/Kerning/darkLord";
import kerningMatchingCards from "../scene/Kerning/kerningMatchingCards";
import { KPQ } from "../scene/Kerning/kpq/KPQ";
import Tooltip from "../view/Tooltip";
import Pan from "./Pan";
import { TOWN_PLACES, TOWN_STYLES } from "./constants";
import { useState } from "react";
import TownNode from "./TownNode";

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
        position: "absolute",
        top: 189,
        left: "50%",
        transform: "translateX(-50%)",
    },
    caseyCharContainer: {
        bottom: "80px",
        left: "50%",
        transform: "translateX(-50%)",
        position: "absolute",
    },
});

const store = {
    merchant: {
        name: "Cutthroat Manny and Don Hwang",
    },
};

const KERNING_PLACES = {
    MATCH_CARDS: "match-cards",
};

const KerningCity = ({ player, onExit, onClickScene, onClickShop, onClickTradingPost }) => {
    const classes = useStyles();
    const [visited, setVisited] = useState({});

    const screenCentre = { x: 0, y: window.innerHeight / 2 };

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

    const handleClickTradingPost = () => {
        if (checkVisitPlace(TOWN_PLACES.TRADING_POST)) {
            onClickTradingPost && onClickTradingPost();
        }
    };

    const handleClickShop = () => {
        if (checkVisitPlace(TOWN_PLACES.SHOP)) {
            onClickShop && onClickShop(store);
        }
    };

    const handleClickClassLeader = () => {
        if (checkVisitPlace(TOWN_PLACES.CLASS_LEADER)) {
            onClickScene(barScene);
        }
    };

    const handleClickCampaign = () => {
        if (checkVisitPlace(TOWN_PLACES.CAMPAIGN)) {
            onClickScene && onClickScene(KPQ);
        }
    };

    const handleClickEvent = (eventKey, scene) => {
        if (checkVisitPlace(eventKey)) {
            onClickScene && onClickScene(scene);
        }
    };

    const caseyNodeEl = (
        <>
            {" "}
            <img src={KerningCaseyImage} alt="Kerning City Crane" />
            <div className={classes.caseyCharContainer}>
                <Tooltip title="Hey Mushie, over here!" open={true} PopperProps={{ disablePortal: true }}>
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
                            visited={visited[TOWN_PLACES.TRADING_POST]}
                            label={"Trading Post"}
                            nodeImage={KerningTradingPostImage}
                            onClick={handleClickTradingPost}
                        />
                        <TownNode
                            icon={DiamondImage}
                            visited={visited[TOWN_PLACES.SHOP]}
                            label={"Shop"}
                            nodeImage={KerningShopImage}
                            onClick={handleClickShop}
                        />
                        <br />
                        <TownNode
                            icon={QuestionMarkIcon}
                            visited={visited[TOWN_PLACES.CAMPAIGN]}
                            label={"Campaign"}
                            nodeImage={KerningSewerImage}
                            onClick={handleClickCampaign}
                        />

                        <div className={classNames(classes.townCenter)}>
                            <div className={classes.townHeader}>
                                <h2>Kerning City</h2>
                            </div>
                            <img src={KerningCenterImage} alt="Kerning Center" />
                            <img src={player?.image} alt="You" className={classes.player} />
                        </div>

                        <TownNode
                            icon={WorldMapIcon}
                            visited={false}
                            label={"Exit to World Map"}
                            nodeImage={KerningExitImage}
                            onClick={onExit}
                        />

                        <br />
                        <TownNode
                            icon={QuestionMarkIcon}
                            visited={visited[KERNING_PLACES.MATCH_CARDS]}
                            label={"Hmm?"}
                            nodeEl={caseyNodeEl}
                            onClick={() => handleClickEvent(KERNING_PLACES.MATCH_CARDS, kerningMatchingCards)}
                        />
                        <TownNode
                            icon={JapaneseOgreIcon}
                            visited={visited[TOWN_PLACES.CLASS_LEADER]}
                            label={"[Test] Dark Lord"}
                            onClick={handleClickClassLeader}
                            nodeImage={KerningBarImage}
                        />
                    </div>
                </Pan>
            </div>
        </div>
    );
};

export default KerningCity;
