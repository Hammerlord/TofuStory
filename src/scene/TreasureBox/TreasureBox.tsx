import { Button } from "@material-ui/core";
import classNames from "classnames";
import { useState } from "react";
import { createUseStyles } from "react-jss";
import { Lock, mesoCoinImage, treasureChest2Image } from "../../images";
import { Item } from "../../item/types";
import BannerNotice from "../../view/BannerNotice";

const useStyles = createUseStyles({
    root: {
        textAlign: "center",
        position: "relative",
        width: "100%",
        height: "100%",
        background: "rgba(25, 25, 25, 0.8)",
    },
    inner: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translateX(-50%) translateY(-50%)",
        textAlign: "center",
    },
    puzzleContainer: {
        display: "flex",
        padding: "1rem 2rem",
        border: "2px solid rgba(214, 214, 128, 0.8)",
        background: "rgba(165, 155, 129, 0.5)",
        borderRadius: "8px",
    },
    bannerContainer: {
        position: "fixed",
        width: "40%",
        top: "64px",
        left: "50%",
        transform: "translateX(-50%)",
    },
    chestContainer: {
        position: "relative",
    },
    center: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translateX(-50%) translateY(-50%)",
    },
    "@keyframes openChest": {
        "0%": {
            transform: "rotate(-2deg) translateY(0)",
        },
        "25%": {
            transform: "rotate(-1deg) translateY(-3px)",
        },
        "50%": {
            transform: "rotate(1deg) translateY(-5px)",
        },
        "75%": {
            transform: "rotate(-1deg) translateY(-3px)",
        },
        "100%": {
            transform: "rotate(-1deg) translateY(0)",
        },
    },
    "@keyframes fadeOut": {
        "0%": {
            opacity: "100%",
        },
        "100%": {
            opacity: "0%",
        },
    },
    treasureContainer: {
        background:
            "linear-gradient(90deg, rgba(0,212,255,0) 0%, rgba(0,0,0,0.9) 30%, rgba(0,0,0,0.9) 50%, rgba(0,0,0,0.9) 30%, rgba(0,212,255,0) 100%)",
        color: "white",
        padding: "16px 8px",
        minWidth: "300px",
        zIndex: 10,
        marginBottom: 16,
    },
    treasure: {
        listStyle: "none",
        padding: 0,
        marginBottom: 0,
    },
    item: {
        margin: 0,
        lineHeight: "16px",
    },
    itemName: {
        verticalAlign: "top",
    },
    treasureChest: {
        width: 200,
        height: 150,
        objectFit: "contain",
        imageRendering: "pixelated",
        marginTop: "32px",
        marginBottom: "16px",
        "&.open": {
            animationDuration: "1s",
            animationName: "$openChest",
            transitionTimingFunction: "ease-in-out",
            animationIterationCount: "infinite",
            cursor: "pointer",
        },
        "&.fadeout": {
            animationDuration: "0.5s",
            animationName: "$fadeOut",
            transitionTimingFunction: "ease-out",
            animationIterationCount: "unset",
            cursor: "unset",
            animationFillMode: "forwards",
        },
    },
    lockContainer: {
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
        top: "50%",
        transform: "translateX(-50%) translateY(-50%)",
    },
    lock: {
        width: "32px",
        height: "32px",
        margin: "auto",
    },
});

const TreasureBox = ({
    onExit,
    items = [],
    mesos = 0,
    title = "Treasure Box",
    onLoot,
    Puzzle,
}: {
    onExit: any;
    items?: Item[];
    mesos?: number;
    title?: string;
    onLoot: Function;
    Puzzle?: ({ onComplete: Function, completed: boolean }) => JSX.Element;
}) => {
    const classes = useStyles();
    const [completed, setCompleted] = useState(!Puzzle);
    const [isChestOpened, setIsChestOpened] = useState(false);

    const handleClickChest = () => {
        if (completed) {
            setIsChestOpened(true);
            onLoot({ mesos, items });
        }
    };

    return (
        <div className={classes.root}>
            <div className={classes.bannerContainer}>
                <BannerNotice>{title}</BannerNotice>
            </div>
            <div className={classes.inner}>
                <div className={classes.chestContainer}>
                    <img
                        src={treasureChest2Image}
                        className={classNames(classes.treasureChest, {
                            open: completed,
                            fadeout: isChestOpened,
                        })}
                        onClick={handleClickChest}
                    />
                    {isChestOpened && (
                        <div className={classes.center}>
                            <div className={classNames(classes.treasureContainer)}>
                                You obtain:
                                <ul className={classes.treasure}>
                                    {items.map((item: Item) => (
                                        <li key={item.name} className={classes.item}>
                                            <img src={item.image} /> <span className={classes.itemName}>{item.name}</span>
                                        </li>
                                    ))}
                                    {mesos > 0 && (
                                        <li className={classes.item}>
                                            <img src={mesoCoinImage} /> {mesos}
                                        </li>
                                    )}
                                </ul>
                            </div>
                            <Button variant="contained" color="primary" onClick={onExit}>
                                Exit
                            </Button>
                        </div>
                    )}
                    {!completed && (
                        <div className={classes.lockContainer}>
                            <Lock className={classes.lock} />
                        </div>
                    )}
                </div>
                {Puzzle && (
                    <div className={classes.puzzleContainer}>
                        <Puzzle onComplete={() => setCompleted(true)} completed={completed} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default TreasureBox;
