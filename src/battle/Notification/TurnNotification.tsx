import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
    root: {
        fontSize: "32px",
        fontWeight: "bold",
        color: "white",
        textAlign: "center",
        position: "fixed",
        left: "50%",
        top: "50%",
        transform: "translateX(-50%) translateY(-50%)",
        zIndex: 5,
    },
    inner: ({ duration }: any) => ({
        background:
            "linear-gradient(90deg, rgba(0,212,255,0) 0%, rgba(0,0,0,0.9) 30%, rgba(0,0,0,0.9) 50%, rgba(0,0,0,0.9) 70%, rgba(0,212,255,0) 100%)",
        padding: "32px 48px",
        minWidth: "500px",
        transform: "translateY(-50%)",
        animationName: "$textAnimation",
        // Make animation slightly longer than visibility duration of the banner to prevent 'flickering' due to position reset
        animationDuration: `${duration / 1000 + 0.001}s`,
        transitionTimingFunction: "ease-in-out",
    }),
    "@keyframes textAnimation": {
        "0%": {
            opacity: 0,
            transform: "translateX(10%)",
        },
        "20%": {
            opacity: 100,
            transform: "translateX(0%)",
        },
        "80%": {
            opacity: 100,
            transform: "translateX(0%)",
        },
        "100%": {
            opacity: 0,
            transform: "translateX(-10%)",
        },
    },
});

/**
 * Duration: how long this turn announcement will persist in milliseconds
 */
const TurnAnnouncement = ({ isPlayerTurn, duration }: { isPlayerTurn: boolean; duration: number }) => {
    const classes = useStyles({ duration } as any);
    return (
        <div className={classes.root}>
            <div className={classes.inner}>{isPlayerTurn ? "Player Turn" : "Enemy Turn"}</div>
        </div>
    );
};

export default TurnAnnouncement;
