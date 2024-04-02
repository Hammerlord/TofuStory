import Button from "../view/Button";
import { createUseStyles } from "react-jss";
import { MesoBagImage, MesoCoinImage, MesoImage, MesoStackImage } from "../images";
import BannerNotice from "../view/BannerNotice";

const useStyles = createUseStyles({
    root: {
        width: "100%",
        height: "100%",
        left: 0,
        top: 0,
        position: "fixed",
        background: "rgba(20, 20, 20, 0.95)",
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
    itemContainer: {
        margin: "0 4px",
    },
    item: {
        animationName: "$upAndDown",
        animationDuration: "1s",
        animationIterationCount: "infinite",
        animationDirection: "alternate-reverse",
        height: "100%",
    },
});

const GameOver = ({ onExit, player }) => {
    const classes = useStyles();
    const mesoImage = (() => {
        if (player.mesos < 100) {
            return MesoImage;
        } else if (player.mesos >= 100 && player.mesos < 250) {
            return MesoCoinImage;
        } else if (player.mesos >= 250 && player.mesos < 500) {
            return MesoStackImage;
        }

        return MesoBagImage;
    })();
    return (
        <div className={classes.root}>
            <div className={classes.inner}>
                <BannerNotice>With your untimely demise, your journey has ended.</BannerNotice>
                <div className={classes.body}>
                    <div className={classes.loot}>
                        {player.items.map((item, i: number) => (
                            <div className={classes.itemContainer} key={i}>
                                <img src={item.image} className={classes.item} style={{ animationDelay: `${0.1 * i}s` }} />
                            </div>
                        ))}
                        <div className={classes.itemContainer}>
                            <img src={mesoImage} className={classes.item} style={{ animationDelay: `${0.1 * player.items.length}s` }} />
                        </div>
                    </div>
                    <p>Somewhere out there is a happy adventurer...</p>
                </div>
                <div>
                    <Button onClick={onExit} variant="contained" color="primary">
                        Restart
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default GameOver;
