import { createUseStyles } from "react-jss";
import Overlay from "./Overlay";

const useStyles = createUseStyles({
    inner: {
        fontSize: "24px",
        fontWeight: "bold",
        background: "rgba(0, 0, 0, 0.75)",
        color: "white",
        textAlign: "center",
        position: "absolute",
        padding: "32px 48px",
        left: "50%",
        top: "50%",
        transform: "translateX(-50%) translateY(-50%)",
        zIndex: 5,
    },
});

const TurnAnnouncement = ({ isPlayerTurn }) => {
    const classes = useStyles();
    return (
        <Overlay>
            <div className={classes.inner}>
                {isPlayerTurn ? "Player Turn" : "Enemy Turn"}
            </div>
        </Overlay>
    );
};

export default TurnAnnouncement;
