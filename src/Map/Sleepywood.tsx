import classNames from "classnames";
import { useState } from "react";
import { createUseStyles } from "react-jss";
import {
    BalrogTombImage,
    DeepDungeonBGImage,
    DiamondImage,
    SleepywoodAntTunnelImage,
    SleepywoodCenterImage,
    SleepywoodRegionBGImage,
    SleepywoodRestImage,
    SleepywoodShopImage,
    SleepywoodTradingPostImage,
} from "../images";
import { CampingIcon, JapaneseOgreIcon, MoneyBagIcon, QuestionMarkIcon, ThoughtBubbleIcon, WorldMapIcon } from "../images/icons";
import Legend from "./Legend";
import Pan from "./Pan";
import TownNode from "./TownNode";
import { TOWN_PLACES, TOWN_STYLES } from "./constants";
import { balrog } from "../enemy/balrog";
import { BATTLE_TYPES } from "../battle/types";
import { theRememberer } from "../enemy/rememberer";
import { TownProperties } from "./types";
import { useShopConfig } from "../Menu/shopUtils";
import Shop from "../Menu/Shop";

const useStyles = createUseStyles({
    ...TOWN_STYLES,
    root: {
        width: "100%",
        height: "100%",
        background: `url(${SleepywoodRegionBGImage})`,
        color: "white",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
    },
    player: {
        ...TOWN_STYLES.player,
        position: "absolute",
        bottom: 175,
        left: "50%",
        transform: "translateX(-50%)",
    },
});

const store = {
    merchant: {
        name: "",
    },
};

const SLEEPYWOOD_PLACES = {
    BALROG: "balrog",
    REMEMBERER: "rememberer",
};

const Sleepywood = ({ player, onExit, onClickScene, onBuyItem, onClickTradingPost, onCamp, onBattle }: TownProperties) => {
    const classes = useStyles();
    const [visited, setVisited] = useState({});
    const [isShopOpen, setIsShopOpen] = useState(false);
    const shopConfig = useShopConfig({ player, onBuyItem });
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
        checkVisitPlace(TOWN_PLACES.SHOP);
    };

    const handleClickEvent = (eventKey: string, scene) => {
        if (checkVisitPlace(eventKey)) {
            onClickScene && onClickScene(scene);
        }
    };

    const handleClickCamp = () => {
        if (checkVisitPlace(TOWN_PLACES.REST)) {
            onCamp && onCamp();
        }
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
                            nodeImage={SleepywoodTradingPostImage}
                            onClick={handleClickTradingPost}
                        />
                        <TownNode icon={MoneyBagIcon} label={"Shop"} nodeImage={SleepywoodShopImage} onClick={handleClickShop} />
                        <br />
                        <TownNode
                            icon={CampingIcon}
                            isVisited={visited[TOWN_PLACES.REST]}
                            label={"Rest"}
                            nodeImage={SleepywoodRestImage}
                            onClick={handleClickCamp}
                        />

                        <div className={classNames(classes.townCenter)}>
                            <img src={SleepywoodCenterImage} alt="Sleepywood Center" className={classes.townCenterImage} />
                            <div className={classes.townHeader}>
                                <h2>Sleepywood</h2>
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
                            isLocked={true}
                            label={"[Placeholder]"}
                            nodeImage={SleepywoodAntTunnelImage}
                            onClick={onExit}
                        />

                        <br />

                        <TownNode
                            icon={JapaneseOgreIcon}
                            isVisited={false}
                            label={"[Test] Balrog's Tomb"}
                            nodeImage={BalrogTombImage}
                            onClick={() => {
                                if (checkVisitPlace(SLEEPYWOOD_PLACES.BALROG)) {
                                    onBattle(
                                        {
                                            waves: [{ enemies: [null, null, balrog, null, null], winCondition: { defeatBoss: true } }],
                                            type: BATTLE_TYPES.BOSS,
                                            backgroundImage: DeepDungeonBGImage,
                                        },
                                        () => {}
                                    );
                                }
                            }}
                        />

                        <TownNode
                            icon={JapaneseOgreIcon}
                            isVisited={false}
                            label={"[Test] The Rememberer"}
                            nodeImage={SleepywoodAntTunnelImage}
                            onClick={() => {
                                if (checkVisitPlace(SLEEPYWOOD_PLACES.REMEMBERER)) {
                                    onBattle(
                                        {
                                            waves: [
                                                { enemies: [null, null, theRememberer, null, null], winCondition: { defeatBoss: true } },
                                            ],
                                            type: BATTLE_TYPES.BOSS,
                                            backgroundImage: SleepywoodRegionBGImage,
                                        },
                                        () => {}
                                    );
                                }
                            }}
                        />
                    </div>
                </Pan>
                <Legend />
                {isShopOpen && <Shop player={player} onExit={() => setIsShopOpen(false)} onBuyItem={onBuyItem} shopConfig={shopConfig} />}
            </div>
        </div>
    );
};

export default Sleepywood;
