import { createRef, useRef, useState } from "react";
import { createUseStyles } from "react-jss";
import { ZOOM_AMOUNT_MED, ZOOM_AMOUNT_SM, ZOOM_HEIGHT_MED, ZOOM_HEIGHT_SM } from "../constants";

const useStyles = createUseStyles({
    canvas: {
        width: "100%",
        height: "100%",
        position: "absolute",
        left: 0,
        top: 0,
        pointerEvents: "none",
    },
});

/**
 * Draws a targeting line from eg. a selected ally to the mouse position
 */
const TargetLineCanvas = ({ children, originationRef, color = "rgb(221, 46, 68)", ...other }) => {
    const origination = originationRef?.getBoundingClientRect && originationRef.getBoundingClientRect();
    const targetLineRef: React.RefObject<SVGPathElement> = useRef();
    const circleRef: React.RefObject<SVGCircleElement> = useRef();
    const bullseyeRef: React.RefObject<SVGCircleElement> = useRef();

    const classes = useStyles();

    const getInitialLine = () => {
        const x = origination.left + origination.width / 2;
        // TODO: x2 and y2 same as x and y, should grab the coordinates from the initial card click mouse event instead
        const x2 = origination.left + origination.width / 2;
        const y = origination.top + origination.height / 2;
        const y2 = origination.top + origination.height / 2;

        return `M ${x} ${y} Q ${x2} ${y2} ${x2} ${y2}`;
    };

    return (
        <div
            onMouseMove={(e) => {
                if (origination && targetLineRef.current) {
                    let { clientX, clientY } = e;
                    if (window.innerHeight <= ZOOM_HEIGHT_SM) {
                        clientX /= ZOOM_AMOUNT_SM;
                        clientY /= ZOOM_AMOUNT_SM;
                    } else if (window.innerHeight <= ZOOM_HEIGHT_MED) {
                        clientX /= ZOOM_AMOUNT_MED;
                        clientY /= ZOOM_AMOUNT_MED;
                    }

                    const x = origination.left + origination.width / 2;
                    const x2 = clientX;
                    const y = origination.top + origination.height / 2;
                    const y2 = clientY;

                    const offset = (x - clientX) / 3;
                    const c1 = (x + x2) / 2 + offset;
                    const c2 = (y + y2) / 1.75;

                    const d = `M ${x} ${y} Q ${c1} ${c2} ${x2} ${y2}`;
                    targetLineRef.current.setAttribute("d", d);
                    targetLineRef.current.setAttribute("qx", clientX.toString());
                    targetLineRef.current.setAttribute("qy", clientY.toString());
                    bullseyeRef.current.setAttribute("cx", clientX.toString());
                    bullseyeRef.current.setAttribute("cy", clientY.toString());
                    circleRef.current.setAttribute("cx", clientX.toString());
                    circleRef.current.setAttribute("cy", clientY.toString());
                }
            }}
            {...other}
        >
            {children}
            <div className={classes.canvas}>
                {/** 0, 0 happens sometimes when you select cards too quickly */}
                {origination && origination.x !== 0 && origination.y !== 0 && (
                    <svg width="100%" height="100%">
                        <path
                            ref={targetLineRef}
                            d={getInitialLine()}
                            stroke={color}
                            strokeDasharray="14"
                            strokeWidth="5"
                            strokeLinecap="round"
                            fill="none"
                        />
                        <circle
                            ref={bullseyeRef}
                            fill={color}
                            r="8"
                            cx={origination.left + origination.width / 2}
                            cy={origination.top + origination.height / 2}
                        />
                        <circle
                            ref={circleRef}
                            stroke={color}
                            strokeWidth="5px"
                            fill="transparent"
                            r="16"
                            cx={origination.left + origination.width / 2}
                            cy={origination.top + origination.height / 2}
                        />
                    </svg>
                )}
            </div>
        </div>
    );
};

export default TargetLineCanvas;
