import classNames from "classnames";
import { createUseStyles } from "react-jss";
import Icon from "../icon/Icon";
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
import Pan from "./Pan";
import { useState } from "react";
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
                        <div
                            className={classNames(classes.node, { [classes.visited]: visited[TOWN_PLACES.TRADING_POST] })}
                            onClick={handleClickTradingPost}
                        >
                            <span className={classes.iconWrapper}>
                                <Icon icon={DiamondImage} size="md" className={classes.icon} />
                            </span>
                            <br />

                            <span className={classes.nodeLabel}>Trading Post</span>
                            <img src={PerionTradingPostImage} />
                        </div>
                        <div
                            className={classNames(classes.node, { [classes.visited]: visited[TOWN_PLACES.SHOP] })}
                            onClick={handleClickShop}
                        >
                            <span className={classes.iconWrapper}>
                                <Icon icon={MoneyBagIcon} size="md" className={classes.icon} />
                            </span>
                            <br />
                            <span className={classes.nodeLabel}>Shop</span>
                            <img src={PerionShopImage} />
                        </div>
                        <br />
                        <div
                            className={classNames(classes.node, { [classes.visited]: visited[TOWN_PLACES.CLASS_LEADER] })}
                            onClick={handleClickClassLeader}
                        >
                            <span className={classes.iconWrapper}>
                                <Icon icon={JapaneseOgreIcon} size="md" className={classes.icon} />
                            </span>
                            <br />
                            <span className={classes.nodeLabel}>[Test] Dances With Balrog</span>
                            <img src={PerionWarriorHallImage} alt="Perion warrior hall" />
                        </div>
                        <div className={classNames(classes.node, classes.townCenter)}>
                            <div className={classes.townHeader}>
                                <h2>Perion</h2>
                            </div>
                            <img src={PerionCenterImage} alt="Perion center" draggable={false} />
                            <img src={player?.image} alt="You" className={classes.player} draggable={false} />
                        </div>

                        <div className={classNames(classes.node)} onClick={onExit}>
                            <span className={classes.iconWrapper}>
                                <Icon icon={WorldMapIcon} size="md" className={classes.icon} />
                            </span>
                            <br />
                            <span className={classes.nodeLabel}>
                                Exit to World Map
                                <br />
                            </span>
                            <img src={PerionExitImage} alt="Exit" />
                        </div>

                        <br />
                        <div className={classes.node}>
                            <span className={classes.iconWrapper}>
                                <Icon icon={QuestionMarkIcon} size="md" className={classes.icon} />
                            </span>
                            <br />
                            <span className={classes.nodeLabel}>Placeholder</span>
                            <img src={PerionWarriorHallImage} alt="Perion warrior hall" />
                        </div>
                        <div className={classes.node}>
                            <span className={classes.iconWrapper}>
                                <Icon icon={QuestionMarkIcon} size="md" className={classes.icon} />
                            </span>
                            <br />
                            <span className={classes.nodeLabel}>Placeholder</span>
                            <img src={PerionWarriorHallImage} alt="Perion warrior hall" />
                        </div>
                    </div>
                </Pan>
            </div>
        </div>
    );
};

export default Perion;
