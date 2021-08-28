import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
    inner: {
        fontSize: "32px",
        fontWeight: "bold",
        background:
            "linear-gradient(90deg, rgba(0,212,255,0) 0%, rgba(0,0,0,0.9) 30%, rgba(0,0,0,0.9) 50%, rgba(0,0,0,0.9) 30%, rgba(0,212,255,0) 100%)",
        color: "white",
        textAlign: "center",
        position: "fixed",
        padding: "32px 48px",
        minWidth: "500px",
        left: "50%",
        top: "50%",
        transform: "translateX(-50%) translateY(-50%)",
        zIndex: 5,
    },
});

const TurnAnnouncement = ({ isPlayerTurn }) => {
    const classes = useStyles();
    return <div className={classes.inner}>{isPlayerTurn ? "Player Turn" : "Enemy Turn"}</div>;
};

export default TurnAnnouncement;
