import { useEffect, useRef, useState } from "react";
import { createUseStyles } from "react-jss";
import { AnonymushroomImage } from "../images";
import classNames from "classnames";
import { RE_PAN_TIME } from "../constants";
import { ButtonBase } from "@mui/material";

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
        bottom: "430px",
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

// Since the player travels from left to right, move the centred X position closer to the left so that more nodes can be shown.
const X_RATIO = 3;

/**
 * Functionality for panning the overworld map around.
 */
const Pan = ({
    userPosition,
    children,
    style,
}: {
    userPosition?: { x: number; y: number };
    children: React.ReactNode;
    style?: React.CSSProperties;
}) => {
    const classes = useStyles();

    const containerRef = useRef<HTMLDivElement>(null);

    const xRef = useRef(0);
    const yRef = useRef(0);

    const interactionPosRef = useRef<[number, number] | null>(null);
    const isInteractingRef = useRef(false);
    const [mounted, setMounted] = useState(false);
    const [isIntroPan, setIsIntroPan] = useState(true);

    const applyTransform = () => {
        if (!containerRef.current) return;

        containerRef.current.style.transform = `translate(${xRef.current}px, ${yRef.current}px)`;
    };

    const panToUserPosition = (panTime = RE_PAN_TIME) => {
        if (!userPosition || [xRef.current, yRef.current, userPosition.x, userPosition.y].some((v) => v == null || isNaN(v))) {
            return;
        }

        const newUserPosX = userPosition.x / X_RATIO;
        const animation = containerRef.current?.animate(
            [
                {
                    transform: `translate(${xRef.current}px, ${yRef.current}px)`,
                },
                {
                    transform: `translate(${newUserPosX}px, ${userPosition.y}px)`,
                },
            ],
            {
                duration: panTime,
                easing: "ease-in-out",
            }
        );

        animation?.finished.then(() => {
            animation.commitStyles();
            animation.cancel();
        });

        xRef.current = newUserPosX;
        yRef.current = userPosition.y;

        applyTransform();
    };

    useEffect(() => {
        if (!mounted) {
            setMounted(true);
        }
    }, [mounted]);

    useEffect(() => {
        if (!userPosition || !mounted) return;

        if (isIntroPan) {
            xRef.current = userPosition.x / X_RATIO;
            yRef.current = userPosition.y;
            applyTransform();
            setIsIntroPan(false);
            return;
        }

        panToUserPosition(RE_PAN_TIME);
    }, [mounted, userPosition?.x, userPosition?.y]);

    const handleStartInteraction = (e) => {
        if (isIntroPan) return;

        const { screenX, screenY } = e.touches?.[0] || e;

        interactionPosRef.current = [screenX, screenY];
        isInteractingRef.current = true;
    };

    const handleStopPan = () => {
        isInteractingRef.current = false;
        containerRef.current?.classList.remove("-grabbing");
    };

    const handlePan = (e) => {
        if (!isInteractingRef.current || !interactionPosRef.current) {
            return;
        }

        const { screenX, screenY } = e.touches?.[0] || e;

        const [lastX, lastY] = interactionPosRef.current;

        xRef.current += screenX - lastX;
        yRef.current += screenY - lastY;

        applyTransform();

        interactionPosRef.current = [screenX, screenY];
        containerRef.current?.classList.add("-grabbing");
    };

    return (
        <div>
            <div
                ref={containerRef}
                onMouseDown={handleStartInteraction}
                onMouseMove={handlePan}
                onMouseUp={handleStopPan}
                onMouseLeave={handleStopPan}
                onTouchStart={handleStartInteraction}
                onTouchMove={handlePan}
                onTouchEnd={handleStopPan}
                className={classNames(classes.panContainer)}
                style={{
                    ...style,
                    transform: `translate(${xRef.current}px, ${yRef.current}px)`,
                    height: "max-content",
                }}
            >
                {children}
            </div>

            <div className={classes.userPositionContainer}>
                <ButtonBase onClick={() => panToUserPosition(500)} className={classes.userPosition} title="Pan to your current location">
                    <img src={AnonymushroomImage} />
                </ButtonBase>
            </div>
        </div>
    );
};
export default Pan;
