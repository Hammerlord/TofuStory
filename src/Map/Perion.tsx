import classNames from "classnames";
import { useState } from "react";
import { createUseStyles } from "react-jss";
import {
    DiamondImage,
    PerionCenterImage,
    PerionExitImage,
    PerionRegionBGImage,
    PerionShopImage,
    PerionTradingPostImage,
    PerionWarriorHallImage,
} from "../images";
import { JapaneseOgreIcon, MoneyBagIcon, QuestionMarkIcon, WorldMapIcon } from "../images/icons";
import { dancesWithBalrogScene } from "../scene/Perion/dancesWithBalrogScene";
import Legend from "./Legend";
import Pan from "./Pan";
import TownNode from "./TownNode";
import { TOWN_PLACES, TOWN_STYLES } from "./constants";

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
        position: "absolute",
        top: 216,
        left: "50%",
    },
});

const store = {
    merchant: {
        name: "River and Harry",
    },
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
                            icon={JapaneseOgreIcon}
                            isVisited={visited[TOWN_PLACES.CLASS_LEADER]}
                            label={"[Test] Dances With Balrog"}
                            onClick={handleClickClassLeader}
                            nodeImage={PerionWarriorHallImage}
                        />

                        <div className={classNames(classes.townCenter)}>
                            <div className={classes.townHeader}>
                                <h2>Perion</h2>
                            </div>
                            <img src={PerionCenterImage} alt="Perion center" draggable={false} />
                            <img src={player?.image} alt="You" className={classes.player} draggable={false} />
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
                            isVisited={true}
                            label={"Placeholder"}
                            onClick={() => {}}
                            nodeImage={PerionWarriorHallImage}
                        />

                        <TownNode
                            icon={QuestionMarkIcon}
                            isVisited={true}
                            label={"Placeholder"}
                            onClick={() => {}}
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
