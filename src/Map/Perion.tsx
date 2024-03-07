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
    PerionShopImage,
    PerionTradingPostImage,
    PerionWarriorHallImage,
} from "../images";
import { JapaneseOgreIcon, MedalIcon, MoneyBagIcon, QuestionMarkIcon, ThoughtBubbleIcon, WorldMapIcon } from "../images/icons";
import { dancesWithBalrogScene } from "../scene/Perion/dancesWithBalrogScene";
import Legend from "./Legend";
import Pan from "./Pan";
import TownNode from "./TownNode";
import { TOWN_PLACES, TOWN_STYLES } from "./constants";
import { dummiesScene, mapleDummy } from "../scene/Perion/perionDummies";
import { arenaScene } from "../scene/Perion/arena";
import { basicDummy } from "../enemy/dummy";

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

const PERION_PLACES = {
    DUMMIES: "perion-training-dummies",
    ARENA: "perion-arena",
};

const Perion = ({ player, onExit, onClickScene, onClickShop, onClickTradingPost }) => {
    const [visited, setVisited] = useState({});
    const classes = useStyles();

    const screenCentre = { x: 0, y: window.innerHeight / 2 };
    const handleClickTradingPost = () => {
        if (visited[TOWN_PLACES.TRADING_POST]) {
            return;
        }
        setVisited((prev) => ({ ...prev, [TOWN_PLACES.TRADING_POST]: true }));
        onClickTradingPost && onClickTradingPost();
    };

    const handleClickShop = () => {
        if (visited[TOWN_PLACES.SHOP]) {
            return;
        }
        setVisited((prev) => ({ ...prev, [TOWN_PLACES.SHOP]: true }));
        onClickShop && onClickShop(store);
    };

    const handleClickClassLeader = () => {
        if (visited[TOWN_PLACES.CLASS_LEADER]) {
            return;
        }

        setVisited((prev) => ({ ...prev, [TOWN_PLACES.CLASS_LEADER]: true }));
        onClickScene(dancesWithBalrogScene);
    };

    const handleClickEvent = (eventKey: string, scene) => {
        if (visited[eventKey]) {
            return;
        }
        setVisited((prev) => ({ ...prev, [eventKey]: true }));
        onClickScene && onClickScene(scene);
    };

    return (
        <div className={classes.root}>
            <div className={classes.bg}>
                <Pan userPosition={screenCentre} disableIntroAnimate={true}>
                    <div className={classes.inner}>
                        <TownNode
                            icon={DiamondImage}
                            isVisited={visited[TOWN_PLACES.TRADING_POST]}
                            label={"Trading Post"}
                            nodeImage={PerionTradingPostImage}
                            onClick={handleClickTradingPost}
                        />
                        <TownNode
                            icon={MoneyBagIcon}
                            isVisited={visited[TOWN_PLACES.SHOP]}
                            label={"Shop"}
                            nodeImage={PerionShopImage}
                            onClick={handleClickShop}
                        />

                        <br />
                        <TownNode
                            icon={MedalIcon}
                            isVisited={visited[PERION_PLACES.ARENA]}
                            label={"Arena"}
                            onClick={() => handleClickEvent(PERION_PLACES.ARENA, arenaScene)}
                            nodeImage={PerionArenaPreviewImage}
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
                            label={"Exit to World Map"}
                            nodeImage={PerionExitImage}
                            onClick={onExit}
                        />

                        <br />

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

                        <TownNode
                            icon={JapaneseOgreIcon}
                            isVisited={visited[TOWN_PLACES.CLASS_LEADER]}
                            label={"[Test] Dances With Balrog"}
                            onClick={handleClickClassLeader}
                            nodeImage={PerionWarriorHallImage}
                        />
                    </div>
                </Pan>
                <Legend />
            </div>
        </div>
    );
};

export default Perion;
