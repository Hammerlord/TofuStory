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
} from "../images";
import { JapaneseOgreIcon, MoneyBagIcon, QuestionMarkIcon, WorldMapIcon } from "../images/icons";
import { arwenScene } from "../scene/Ellinia/arwenScene";
import { grendelScene } from "../scene/Ellinia/grendelScene";
import Legend from "./Legend";
import Pan from "./Pan";
import TownNode from "./TownNode";
import { TOWN_PLACES, TOWN_STYLES } from "./constants";

const useStyles = createUseStyles({
    ...TOWN_STYLES,
    player: {
        position: "absolute",
        top: 189,
        left: "50%",
        transform: "translateX(-50%)",
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

const Ellinia = ({ player, onExit, onClickScene, onClickShop, onClickTradingPost }) => {
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
            onClickScene(grendelScene);
        }
    };

    const handleClickEvent = (eventKey, scene) => {
        if (checkVisitPlace(eventKey)) {
            onClickScene && onClickScene(scene);
        }
    };

    const handleClickCampaign = () => {
        if (checkVisitPlace(TOWN_PLACES.CAMPAIGN)) {
            onClickScene && onClickScene(arwenScene);
        }
    };

    return (
        <div className={classes.root}>
            <div className={classes.bg}>
                <Pan userPosition={screenCentre} disableIntroAnimate={true}>
                    <div className={classes.inner}>
                        <TownNode
                            icon={DiamondImage}
                            visited={visited[TOWN_PLACES.TRADING_POST]}
                            label={"Trading Post"}
                            nodeImage={ElliniaTradingPostImage}
                            onClick={handleClickTradingPost}
                        />
                        <TownNode
                            icon={MoneyBagIcon}
                            visited={visited[TOWN_PLACES.SHOP]}
                            label={"Shop"}
                            nodeImage={ElliniaShopImage}
                            onClick={handleClickShop}
                        />
                        <br />
                        <TownNode
                            icon={QuestionMarkIcon}
                            visited={visited[TOWN_PLACES.CAMPAIGN]}
                            label={"Campaign"}
                            nodeImage={ElliniaCampaignImage}
                            onClick={handleClickCampaign}
                        />

                        <div className={classNames(classes.townCenter)}>
                            <div className={classes.townHeader}>
                                <h2>Ellinia</h2>
                            </div>
                            <img src={ElliniaCenterImage} alt="Ellinia Center" />
                            <img src={player?.image} alt="You" className={classes.player} />
                        </div>

                        <TownNode
                            icon={WorldMapIcon}
                            visited={false}
                            label={"Exit to World Map"}
                            nodeImage={ElliniaExitImage}
                            onClick={onExit}
                        />
                        <br />
                        <TownNode
                            icon={JapaneseOgreIcon}
                            visited={visited[TOWN_PLACES.CLASS_LEADER]}
                            label={"[Test] Grendel"}
                            nodeImage={ElliniaMagicianHallImage}
                            onClick={handleClickClassLeader}
                        />
                        <TownNode
                            icon={QuestionMarkIcon}
                            visited={true}
                            label={"Placeholder"}
                            nodeImage={ElliniaMagicianHallImage}
                            onClick={() => {}}
                        />
                    </div>
                </Pan>
                <Legend />
            </div>
        </div>
    );
};

export default Ellinia;
