import { useEffect, useRef } from "react";
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
    inner: {
        background:
            "linear-gradient(90deg, rgba(0,212,255,0) 0%, rgba(0,0,0,0.9) 30%, rgba(0,0,0,0.9) 50%, rgba(0,0,0,0.9) 70%, rgba(0,212,255,0) 100%)",
        padding: "32px 48px",
        minWidth: "500px",
        transform: "translateY(-50%)",
        // HACK: we only want banner visible for the duration of the animation. So set it to be invisible otherwise.
        // Issue where the banner will "flicker" back into existence after the animation has finished.
        opacity: 0,
    },
});

/**
 * Duration: how long this turn announcement will persist in milliseconds
 */
const TurnAnnouncement = ({ isPlayerTurn, duration }: { isPlayerTurn: boolean; duration: number }) => {
    const classes = useStyles();
    const bannerRef: React.RefObject<HTMLDivElement> = useRef();

    useEffect(() => {
        if (!bannerRef.current) {
            return;
        }

        const animationFrames = [
            {
                opacity: 0,
                transform: "translateX(10%)",
                easing: "ease-in-out",
            },
            {
                opacity: 1,
                transform: "translateX(0%)",
                offset: 0.15,
                easing: "ease-in-out",
            },
            {
                opacity: 1,
                transform: "translateX(0%)",
                offset: 0.85,
                easing: "ease-in-out",
            },
            {
                opacity: 0,
                transform: "translateX(-10%)",
                easing: "ease-in-out",
            },
        ];

        const animation = bannerRef.current.animate(animationFrames, {
            duration,
        });

        return () => animation.cancel();
    }, [isPlayerTurn]);
    return (
        <div className={classes.root}>
            <div className={classes.inner} ref={bannerRef}>
                {isPlayerTurn ? "Player Turn" : "Enemy Turn"}
            </div>
        </div>
    );
};

export default TurnAnnouncement;
