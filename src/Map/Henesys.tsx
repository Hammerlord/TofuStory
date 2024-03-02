import classNames from "classnames";
import { useState } from "react";
import { createUseStyles } from "react-jss";
import {
    DiamondImage,
    HenesysArcherHallImage,
    HenesysCenterImage,
    HenesysExitImage,
    HenesysPantryImage,
    HenesysRegionBGImage,
    HenesysShopImage,
    HenesysTradingPostImage,
} from "../images";
import { JapaneseOgreIcon, MoneyBagIcon, QuestionMarkIcon, WorldMapIcon } from "../images/icons";
import { athenaPierceScene } from "../scene/Henesys/athenaPierceScene";
import pantry from "../scene/Henesys/pantry";
import TownNode from "./TownNode";
import { TOWN_PLACES, TOWN_STYLES } from "./constants";
import Pan from "./Pan";
import Legend from "./Legend";

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
        position: "absolute",
        top: 185,
        left: "52%",
        transform: "translateX(-50%)",
    },
});

const store = {
    merchant: {
        name: "Karl and Sam",
    },
};

const HENESYS_PLACES = {
    PANTRY: "pantry",
};

const Henesys = ({ player, onExit, onClickScene, onClickShop, onClickTradingPost }) => {
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
            onClickScene(athenaPierceScene);
        }
    };

    const handleClickEvent = (eventKey, scene) => {
        if (checkVisitPlace(eventKey)) {
            onClickScene && onClickScene(scene);
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
                            nodeImage={HenesysTradingPostImage}
                            onClick={handleClickTradingPost}
                        />
                        <TownNode
                            icon={MoneyBagIcon}
                            visited={visited[TOWN_PLACES.SHOP]}
                            label={"Shop"}
                            nodeImage={HenesysShopImage}
                            onClick={handleClickShop}
                        />
                        <br />
                        <TownNode
                            icon={JapaneseOgreIcon}
                            visited={visited[HENESYS_PLACES.PANTRY]}
                            label={"HELP!"}
                            nodeImage={HenesysPantryImage}
                            onClick={() => handleClickEvent(HENESYS_PLACES.PANTRY, pantry)}
                        />

                        <div className={classNames(classes.townCenter)}>
                            <div className={classes.townHeader}>
                                <h2>Henesys</h2>
                            </div>
                            <img src={HenesysCenterImage} alt="Henesys Center" />
                            <img src={player?.image} alt="You" className={classes.player} />
                        </div>

                        <TownNode
                            icon={WorldMapIcon}
                            visited={false}
                            label={"Exit to World Map"}
                            nodeImage={HenesysExitImage}
                            onClick={onExit}
                        />
                        <br />
                        <TownNode
                            icon={JapaneseOgreIcon}
                            visited={visited[TOWN_PLACES.CLASS_LEADER]}
                            label={"[Test] Athena Pierce"}
                            nodeImage={HenesysArcherHallImage}
                            onClick={handleClickClassLeader}
                        />
                        <TownNode
                            icon={QuestionMarkIcon}
                            visited={true}
                            label={"Placeholder"}
                            nodeImage={HenesysArcherHallImage}
                            onClick={() => {}}
                        />
                    </div>
                </Pan>
                <Legend />
            </div>
        </div>
    );
};

export default Henesys;
