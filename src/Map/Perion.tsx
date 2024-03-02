import classNames from "classnames";
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
import { CrossedSwordsIcon, JapaneseOgreIcon, MoneyBagIcon, QuestionMarkIcon, WorldMapIcon } from "../images/icons";
import { dancesWithBalrogScene } from "../scene/Perion/dancesWithBalrogScene";
import Icon from "../icon/Icon";
import Pan from "./Pan";

const useStyles = createUseStyles({
    root: {
        width: "100%",
        height: "100%",
        background: `url(${PerionRegionBGImage})`,
        color: "white",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
    },
    bg: {
        width: "100%",
        height: "100%",
        color: "white",
        position: "fixed",
        background: "rgba(50, 50, 50, 0.8)",
    },
    inner: {
        textAlign: "center",
        margin: "auto",
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        fontSize: "1.2rem",
        width: "100%",
        minWidth: 1500,
    },
    player: {
        position: "absolute",
        top: 216,
        left: "50%",
    },
    node: {
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
        margin: "auto",
        position: "relative",
        cursor: "pointer",
        display: "inline-block",
        padding: "0 64",
        verticalAlign: "middle",
    },
    nodeLabel: {
        position: "absolute",
        left: "50%",
        transform: "translateX(-50%)",
        top: "50",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        padding: "6px 16px",
        borderRadius: 4,
        textShadow: Array.from({ length: 10 })
            .map(() => "0 0 3px black")
            .join(", "),
        whiteSpace: "nowrap",
    },
    townCenter: {
        cursor: "grab",
    },
    townHeader: {
        position: "absolute",
        left: "50%",
        transform: "translateX(-50%)",
        textShadow: Array.from({ length: 10 })
            .map(() => "0 0 3px black")
            .join(", "),
    },
    iconWrapper: {
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        color: "white",
        width: "48px",
        height: "48px",
        fontSize: "32px",
        borderRadius: "48px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        position: "absolute",
        left: "50%",
        transform: "translateX(-50%)",
        top: "0",
    },
    icon: {
        margin: "auto",
    },
});

const store = {
    merchant: {
        name: "River and Harry",
    },
};

const Perion = ({ player, onExit, onClickScene, onClickShop, onClickTradingPost }) => {
    const classes = useStyles();

    const screenCentre = { x: 0, y: window.innerHeight / 2 };
    return (
        <div className={classes.root}>
            <div className={classes.bg}>
                <Pan userPosition={screenCentre} disableIntroAnimate={true}>
                    <div className={classes.inner}>
                        <div>
                            <div className={classNames(classes.node)} onClick={() => onClickTradingPost()}>
                                <span className={classes.iconWrapper}>
                                    <Icon icon={DiamondImage} size="md" className={classes.icon} />
                                </span>
                                <br />

                                <span className={classes.nodeLabel}>Trading Post</span>
                                <img src={PerionTradingPostImage} />
                            </div>
                            <div className={classNames(classes.node)} onClick={() => onClickShop(store)}>
                                <span className={classes.iconWrapper}>
                                    <Icon icon={MoneyBagIcon} size="md" className={classes.icon} />
                                </span>
                                <br />
                                <span className={classes.nodeLabel}>Shop</span>
                                <img src={PerionShopImage} />
                            </div>
                            <br />
                            <div className={classNames(classes.node)} onClick={() => onClickScene(dancesWithBalrogScene)}>
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
                    </div>
                </Pan>
            </div>
        </div>
    );
};

export default Perion;
