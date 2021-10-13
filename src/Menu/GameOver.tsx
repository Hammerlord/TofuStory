import { Button } from "@material-ui/core";
import { createUseStyles } from "react-jss";
import { goldMesoImage, mesoBagImage, mesoCoinImage, mesoStackImage } from "../images";
import BannerNotice from "../view/BannerNotice";
import Overlay from "../view/Overlay";

const useStyles = createUseStyles({
    root: {
        width: "100%",
        height: "100%",
        left: 0,
        top: 0,
        position: "fixed",
        background: "rgba(50, 50, 50, 0.95)",
        zIndex: 1001,
        fontSize: "1.2rem",
        color: "white",
    },
    inner: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translateX(-50%) translateY(-50%)",
        textAlign: "center",
        minHeight: "50vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
    },
    body: {
        marginTop: 64,
    },
    loot: {
        display: "flex",
        justifyContent: "center",
        margin: "48px 0",
    },
    "@keyframes upAndDown": {
        from: {
            transform: "translateY(0)",
        },
        to: {
            transform: "translateY(8px)",
        },
    },
    item: {
        margin: "0 4px",
        animationName: "$upAndDown",
        animationDuration: "1s",
        animationIterationCount: "infinite",
        animationDirection: "alternate-reverse",
    },
});

const GameOver = ({ onExit, player }) => {
    const classes = useStyles();
    const mesoImage = (() => {
        if (player.mesos < 100) {
            return mesoCoinImage;
        } else if (player.mesos >= 100 && player.mesos < 250) {
            return goldMesoImage;
        } else if (player.mesos >= 250 && player.mesos < 500) {
            return mesoStackImage;
        }

        return mesoBagImage;
    })();
    return (
        <div className={classes.root}>
            <div className={classes.inner}>
                <BannerNotice>With your untimely demise, your journey has ended.</BannerNotice>
                <div className={classes.body}>
                    <p>Somewhere out there is a happy adventurer...</p>
                    <div className={classes.loot}>
                        {player.items.map((item, i: number) => (
                            <img src={item.image} key={i} className={classes.item} style={{ animationDelay: `${0.1 * i}s` }} />
                        ))}
                        <img src={mesoImage} className={classes.item} style={{ animationDelay: `${0.1 * player.items.length}s` }} />
                    </div>
                </div>
                <div>
                    <Button onClick={onExit} variant="contained" color="primary">
                        Try again
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default GameOver;
