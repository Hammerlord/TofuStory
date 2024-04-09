import classNames from "classnames";
import { useEffect, useRef } from "react";
import { createUseStyles } from "react-jss";
import { BLUE, RED } from "../../ability/AbilityView/constants";

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
            "linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.9) 25%, rgba(0,0,0,1) 50%, rgba(0,0,0,0.9) 75%, rgba(0,0,0,0) 100%)",
        padding: "0 48px",
        minWidth: "500px",
        transform: "translateY(-50%)",
        // HACK: we only want banner visible for the duration of the animation. So set it to be invisible otherwise.
        // Issue where the banner will "flicker" back into existence after the animation has finished.
        opacity: 0,

        "&.playerTurn": {
            color: BLUE,
        },

        "&.enemyTurn": {
            color: RED,
        },
    },
    playerTurnText: {
        padding: "16px 0",
        display: "inline-block",
    },
    divider: {
        position: "relative",
        "&.playerTurn hr": {
            borderBottom: `1px solid ${BLUE}`,
        },
        "&.enemyTurn hr": {
            borderBottom: `1px solid ${RED}`,
        },
    },
    diamond: {
        width: "7px",
        height: "7px",
        transform: "rotate(45deg) translate(-50%, 0)",
        display: "inline-block",
        position: "absolute",
        top: "0px",
        left: "50%",
        "&.playerTurn": {
            background: BLUE,
        },
        "&.enemyTurn": {
            background: RED,
        },
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
                offset: 0.1,
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
            <div
                className={classNames(classes.inner, {
                    playerTurn: isPlayerTurn,
                    enemyTurn: !isPlayerTurn,
                })}
                ref={bannerRef}
            >
                <div
                    className={classNames(classes.divider, {
                        playerTurn: isPlayerTurn,
                        enemyTurn: !isPlayerTurn,
                    })}
                >
                    <hr />
                    <span className={classNames(classes.diamond, { playerTurn: isPlayerTurn, enemyTurn: !isPlayerTurn })} />
                </div>
                <span className={classes.playerTurnText}>{isPlayerTurn ? "Player Turn" : "Enemy Turn"}</span>
                <div
                    className={classNames(classes.divider, {
                        playerTurn: isPlayerTurn,
                        enemyTurn: !isPlayerTurn,
                    })}
                >
                    <hr />
                    <span className={classNames(classes.diamond, { playerTurn: isPlayerTurn, enemyTurn: !isPlayerTurn })} />
                </div>
            </div>
        </div>
    );
};

export default TurnAnnouncement;
