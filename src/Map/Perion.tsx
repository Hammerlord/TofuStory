import classNames from "classnames";
import { createUseStyles } from "react-jss";
import { PerionRegionBGImage } from "../images";
import { WorldMapIcon } from "../images/icons";
import { dancesWithBalrogScene } from "../scene/Perion/dancesWithBalrogScene";

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
        background: "rgba(50, 50, 50, 0.7)",
    },
    inner: {
        textAlign: "center",
        margin: "auto",
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        fontSize: "1.2rem",
    },
    node: {
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
        width: "350px",
        height: "350px",
        margin: "auto",
        position: "relative",
        cursor: "pointer",
        "& > img": {
            maxWidth: "100%",
            maxHeight: "100%",
        },
    },
    shark: {},
    balcony: {},
    exit: {},
    eventsContainer: {
        display: "flex",
    },
    event: {
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
        top: "10%",
    },
    eventInner: {
        width: "32px",
        height: "32px",
        margin: "auto",
    },
});

const Perion = ({ player, onExit, onClickScene }) => {
    const classes = useStyles();
    return (
        <div className={classes.root}>
            <div className={classes.bg}>
                <div className={classes.inner}>
                    <h2>Perion</h2>
                    <div className={classes.eventsContainer}>
                        <div className={classNames(classes.node)} onClick={() => onClickScene(dancesWithBalrogScene)}>
                            Dances With Balrog - Test
                            <div className={classes.event}>?</div>
                        </div>
                        <div className={classNames(classes.node)} onClick={onExit}>
                            Exit to World Map
                            <img src={null} />
                            <div className={classes.event}>
                                <div className={classes.eventInner}>
                                    <WorldMapIcon />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Perion;
