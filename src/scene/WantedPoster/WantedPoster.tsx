import { Button } from "@material-ui/core";
import classNames from "classnames";
import { useState } from "react";
import { createUseStyles } from "react-jss";
import BannerNotice from "../../view/BannerNotice";
import Overlay from "../../view/Overlay";

const PADDING = 32;

const useStyles = createUseStyles({
    inner: {
        position: "absolute",
        left: `calc(50% - ${PADDING}px)`,
        top: `calc(50% - ${PADDING}px)`,
        transform: "translateX(-50%) translateY(-50%)",
        textAlign: "center",
    },
    poster: {
        background: "#e4ddb9",
        maxWidth: "600px",
        fontSize: "24px",
        padding: PADDING,
        display: "inline-block",
        margin: "32px 0",
        color: "rgba(15, 10, 0, 0.8)",
        fontWeight: "bold",
        overflow: "hidden",
        "&.ripped": {
            transition: "transform 0.25s",
            transform: "scaleX(0)",
        },
    },
    posterInner: {
        padding: "32px",
        border: "1px solid rgba(0, 0, 0, 0.25)",
    },
    playerImage: {
        width: "50%",
        objectFit: "contain",
        imageRendering: "pixelated",
        margin: "32px 0",
        WebkitFilter: "grayscale(0.7)",
        filter: "grayscale(0.7)",
    },
    heading: {
        fontSize: "56px",
        borderTop: "1px solid rgba(0, 0, 0, 0.5)",
        borderBottom: "1px solid rgba(0, 0, 0, 0.5)",
        padding: "8px 0",
    },
    bounty: {
        fontSize: "48px",
    },
});

const WantedPoster = ({ player, onTearDown, onExit, bounty = 10000 }) => {
    const classes = useStyles();
    const [isTornDown, setIsTornDown] = useState(false);

    const onClickTearDown = () => {
        setIsTornDown(true);
        onTearDown();
    };

    return (
        <Overlay>
            <div className={classes.inner}>
                <BannerNotice>You found a poster of yourself...</BannerNotice>
                <div
                    className={classNames(classes.poster, {
                        ripped: isTornDown,
                    })}
                >
                    <div className={classes.posterInner}>
                        <div className={classes.heading}>WANTED</div>
                        <img src={player.image} className={classes.playerImage} />
                        <div>MUSHROOM WITH UNUSUAL CAP</div>
                        <div>CAUTION: VERY DANGEROUS</div>
                        <div className={classes.bounty}>{bounty} MESO BOUNTY</div>
                    </div>
                </div>
                {!isTornDown && (
                    <div>
                        <Button variant="contained" color="primary" onClick={onClickTearDown}>
                            Tear it down
                        </Button>
                        <Button variant="contained" color="secondary" onClick={onExit}>
                            Leave it up
                        </Button>
                    </div>
                )}
                {isTornDown && (
                    <div>
                        <Button variant="contained" onClick={onExit}>
                            Exit
                        </Button>
                    </div>
                )}
            </div>
        </Overlay>
    );
};

export default WantedPoster;
