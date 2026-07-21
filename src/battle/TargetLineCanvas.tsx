import { useRef } from "react";
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
const TargetLineCanvas = ({ children, originationRef, color = "rgb(221, 46, 68)", ...other }) => {
    const origination = originationRef?.getBoundingClientRect && originationRef.getBoundingClientRect();
    const targetLineRef: React.RefObject<SVGPathElement> = useRef(null);
    const circleRef: React.RefObject<SVGCircleElement> = useRef(null);
    const bullseyeRef: React.RefObject<SVGCircleElement> = useRef(null);
    const frameRef = useRef<number | null>(null);
    const lastMouseRef = useRef<{ x: number; y: number } | null>(null);

    const classes = useStyles();

    const getInitialLine = () => {
        const x = origination.left + origination.width / 2;
        // TODO: x2 and y2 same as x and y, should grab the coordinates from the initial card click mouse event instead
        const x2 = origination.left + origination.width / 2;
        const y = origination.top + origination.height / 2;
        const y2 = origination.top + origination.height / 2;

        return `M ${x} ${y} Q ${x2} ${y2} ${x2} ${y2}`;
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!origination) return;

        lastMouseRef.current = {
            x: e.clientX,
            y: e.clientY,
        };

        if (frameRef.current !== null) return;

        frameRef.current = requestAnimationFrame(() => {
            frameRef.current = null;

            const point = lastMouseRef.current;
            if (!point || !targetLineRef.current) return;

            const { x: clientX, y: clientY } = point;

            const x = origination.left + origination.width / 2;
            const y = origination.top + origination.height / 2;

            const offset = (x - clientX) / 3;
            const c1 = (x + clientX) / 2 + offset;
            const c2 = (y + clientY) / 1.75;

            targetLineRef.current.setAttribute("d", `M ${x} ${y} Q ${c1} ${c2} ${clientX} ${clientY}`);

            bullseyeRef.current?.setAttribute("cx", String(clientX));
            bullseyeRef.current?.setAttribute("cy", String(clientY));

            circleRef.current?.setAttribute("cx", String(clientX));
            circleRef.current?.setAttribute("cy", String(clientY));
        });
    };

    return (
        <div onMouseMove={handleMouseMove} {...other}>
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
