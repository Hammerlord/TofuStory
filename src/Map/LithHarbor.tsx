import { createUseStyles } from "react-jss";
import { lithHarbor, lithHarborBalcony, lithHarborExit, lithHarborShark, WorldMap } from "../images";
import { lithEventsOlaf } from "../scene/olaf";
import { lithEventsTeoJohn } from "../scene/teojohn";

const useStyles = createUseStyles({
    root: {
        width: "100%",
        height: "100%",
        background: `url(${lithHarbor})`,
        color: "white",
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
    shark: {
        background: `url(${lithHarborShark}) no-repeat`,
        backgroundSize: "contain",
        width: "400px",
        height: "400px",
        margin: "auto",
        position: "relative",
        cursor: "pointer",
    },
    balcony: {
        background: `url(${lithHarborBalcony}) no-repeat`,
        backgroundSize: "contain",
        width: "600px",
        height: "300px",
        margin: "auto",
        position: "relative",
        cursor: "pointer",
    },
    exit: {
        background: `url(${lithHarborExit}) no-repeat`,
        backgroundSize: "contain",
        width: "295px",
        height: "400px",
        margin: "auto",
        position: "relative",
        cursor: "pointer",
    },
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

const LithHarbor = ({ player, onExit, onClickScene }) => {
    const classes = useStyles();
    return (
        <div className={classes.root}>
            <div className={classes.bg}>
                <div className={classes.inner}>
                    <h2>Lith Harbor</h2>
                    <div className={classes.eventsContainer}>
                        <div className={classes.balcony} onClick={() => onClickScene(lithEventsOlaf)}>
                            Event
                            <div className={classes.event}>?</div>
                        </div>
                        <div className={classes.shark} onClick={() => onClickScene(lithEventsTeoJohn)}>
                            Event
                            <div className={classes.event}>?</div>
                        </div>
                        <div className={classes.exit} onClick={onExit}>
                            <div className={classes.event}>
                                <div className={classes.eventInner}>
                                    <WorldMap />
                                </div>
                            </div>
                            Exit to World Map
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LithHarbor;
