import classNames from "classnames";
import { useMemo, useState } from "react";
import { createUseStyles } from "react-jss";
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
} from "../images";
import { CampingIcon, JapaneseOgreIcon, MoneyBagIcon, QuestionMarkIcon, ThoughtBubbleIcon, WorldMapIcon } from "../images/icons";
import { athenaPierceScene } from "../scene/Henesys/athenaPierceScene";
import pantry from "../scene/Henesys/pantry";
import TownNode from "./TownNode";
import { TOWN_PLACES, TOWN_STYLES } from "./constants";
import Pan from "./Pan";
import Legend from "./Legend";
import { gachaponEvents } from "../scene/gachapon/Gachapon";

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

const HENESYS_PLACES = {
    PANTRY: "pantry",
    GACHAPON: "gachapon",
};

const HENESYS_BOSSES = {
    ATHENA: "athena",
    MINI_BEAN: "minibean",
};

const Henesys = ({ player, onExit, onClickScene, onClickShop, onClickTradingPost, onCamp }) => {
    const classes = useStyles();
    const [visited, setVisited] = useState({});
    const activitiesRequiredToLeave = 4;

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

    const handleClickCamp = () => {
        if (checkVisitPlace(TOWN_PLACES.REST)) {
            onCamp && onCamp();
        }
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
                        <TownNode
                            icon={DiamondImage}
                            isVisited={visited[TOWN_PLACES.TRADING_POST]}
                            label={"Trading Post"}
                            nodeImage={HenesysTradingPostImage}
                            onClick={handleClickTradingPost}
                        />
                        <TownNode
                            icon={MoneyBagIcon}
                            isVisited={visited[TOWN_PLACES.SHOP]}
                            label={"Shop"}
                            nodeImage={HenesysShopImage}
                            onClick={handleClickShop}
                        />
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
                                isVisited={visited[TOWN_PLACES.REST]}
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
                            isLocked={Object.keys(visited).length < activitiesRequiredToLeave}
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
                                isVisited={visited[TOWN_PLACES.CLASS_LEADER]}
                                label={"[Test] Athena Pierce"}
                                nodeImage={HenesysArcherHallImage}
                                onClick={handleClickClassLeader}
                            />
                        )}

                        {boss !== HENESYS_BOSSES.ATHENA && (
                            <TownNode
                                icon={CampingIcon}
                                isVisited={visited[TOWN_PLACES.REST]}
                                label={"Rest"}
                                nodeImage={HenesysRestImage}
                                onClick={handleClickCamp}
                            />
                        )}
                    </div>
                </Pan>
                <Legend />
            </div>
        </div>
    );
};

export default Henesys;
