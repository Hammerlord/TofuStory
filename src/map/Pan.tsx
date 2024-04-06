import { useEffect, useRef, useState } from "react";
import { createUseStyles } from "react-jss";
import { AnonymushroomImage } from "../images";
import ButtonBase from "@material-ui/core/ButtonBase";
import classNames from "classnames";
import { INTRO_PAN_TIME, RE_PAN_TIME } from "../constants";

const useStyles = createUseStyles({
    panContainer: {
        cursor: "grab",
        "&.-grabbing": {
            cursor: "grabbing",
        },
    },
    userPositionContainer: {
        position: "fixed",
        right: "16px",
        bottom: "372px",
    },
    userPosition: {
        // Override MUI styles:
        "&&": {
            width: "64px",
            height: "64px",
            borderRadius: "100px",
            background: "rgba(240, 240, 240, 0.8)",
            boxShadow: "1px 1px 4px rgba(0, 0, 0, 0.3)",
            boxSizing: "border-box",
            border: "3px solid #3b9ec3",
            "& img": {
                maxWidth: "40px",
                maxHeight: "40px",
            },
        },
    },
});

/**
 * Functionality for panning the overworld map around.
 */
const Pan = ({
    userPosition,
    children,
    style,
    disableIntroAnimate,
}: {
    userPosition?: { x: number; y: number };
    children;
    style?;
    disableIntroAnimate?: boolean;
}) => {
    const [x, setX] = useState(-500); // Start farther to the right
    const [y, setY] = useState(0);
    const [position, setLastInteractionPos] = useState([null, null]);
    const [isInteracting, setIsInteracting] = useState(false);
    const containerRef = useRef() as any;
    const [isPanning, setIsPanning] = useState(false);
    const [isIntroPan, setIsIntroPan] = useState(true);
    const classes = useStyles();

    const panToUserPosition = (panTime = RE_PAN_TIME) => {
        if ([x, y, userPosition?.x, userPosition?.y].some((coords) => isNaN(coords) || coords === null)) {
            return;
        }

        containerRef.current?.animate(
            [
                {
                    transform: `translate(${x}px, ${y}px)`,
                    easing: "ease-in-out",
                    offset: 0,
                },
                {
                    transform: `translate(${userPosition.x}px, ${userPosition.y}px)`,
                    easing: "ease-in-out",
                },
            ],
            panTime
        );

        setX(userPosition.x);
        setY(userPosition.y);
    };

    useEffect(() => {
        if (isIntroPan && disableIntroAnimate) {
            setX(userPosition?.x);
            setY(userPosition?.y);
            setIsIntroPan(false);
            return;
        }
        const panTime = isIntroPan ? INTRO_PAN_TIME : RE_PAN_TIME;
        panToUserPosition(panTime);
        if (isIntroPan) {
            setTimeout(() => {
                setIsIntroPan(false);
            }, panTime);
        }
    }, [userPosition?.x, userPosition?.y]);

    const handleStartInteraction = (e) => {
        if (isIntroPan) {
            return;
        }
        const { screenX, screenY } = e.touches?.[0] || e;
        setLastInteractionPos([screenX, screenY]);
        setIsInteracting(true);
    };

    const handleStopPan = () => {
        setIsInteracting(false);
        if (isPanning) {
            setIsPanning(false);
        }
    };

    const handlePan = (e) => {
        if (!isInteracting) {
            return;
        }

        const { screenX, screenY } = e.touches?.[0] || e;
        setIsPanning(true);
        setX(x - (position[0] - screenX));
        setY(y - (position[1] - screenY));
        setLastInteractionPos([screenX, screenY]);
    };

    return (
        <div>
            <div
                onMouseDown={handleStartInteraction}
                onMouseMove={handlePan}
                onMouseUp={handleStopPan}
                onMouseLeave={handleStopPan}
                onTouchStart={handleStartInteraction}
                onTouchMove={handlePan}
                onTouchEnd={handleStopPan}
                ref={containerRef}
                className={classNames(classes.panContainer, {
                    ["-grabbing"]: isPanning,
                })}
                style={{
                    ...style,
                    transform: `translate(${x}px, ${y}px)`,
                    height: "max-content",
                }}
            >
                {children}
            </div>
            <div className={classes.userPositionContainer}>
                <ButtonBase onClick={() => panToUserPosition(500)} className={classes.userPosition} title="Center on your current location">
                    <img src={AnonymushroomImage} />
                </ButtonBase>
            </div>
        </div>
    );
};
export default Pan;
