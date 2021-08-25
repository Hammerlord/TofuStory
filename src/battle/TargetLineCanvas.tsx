import { createRef, useState } from "react";
import { createUseStyles } from "react-jss";

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
const TargetLineCanvas = ({ children, originationRef, color = 'rgb(221, 46, 68)', ...other }) => {
    const origination = originationRef?.getBoundingClientRect && originationRef.getBoundingClientRect();
    const [targetLineRef] = useState(createRef() as React.RefObject<SVGLineElement>);
    const [circleRef] = useState(createRef() as React.RefObject<SVGCircleElement>);
    const [bullseyeRef] = useState(createRef() as React.RefObject<SVGCircleElement>);

    const classes = useStyles();

    return (
        <div
            onMouseMove={(e) => {
                if (origination && targetLineRef.current) {
                    targetLineRef.current.setAttribute("x2", e.clientX.toString());
                    targetLineRef.current.setAttribute("y2", e.clientY.toString());
                    bullseyeRef.current.setAttribute("cx", e.clientX.toString());
                    bullseyeRef.current.setAttribute("cy", e.clientY.toString());
                    circleRef.current.setAttribute("cx", e.clientX.toString());
                    circleRef.current.setAttribute("cy", e.clientY.toString());
                }
            }}
            {...other}
        >
            {children}
            <div className={classes.canvas}>
                {origination && (
                    <svg width="100%" height="100%">
                        <line
                            ref={targetLineRef}
                            x1={origination.left + origination.width / 2}
                            y1={origination.top + origination.height / 2}
                            x2={origination.left + origination.width / 2}
                            y2={origination.top + origination.height / 2}
                            stroke={color}
                            strokeDasharray="10"
                            strokeWidth="5"
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
