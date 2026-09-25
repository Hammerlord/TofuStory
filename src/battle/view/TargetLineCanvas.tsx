import { useEffect, useRef } from "react";
import { createUseStyles } from "react-jss";
import { getZoomFactor } from "../../constants";

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

const getCenter = (rect: DOMRect | undefined, scale: number) => {
    if (!rect) {
        return null;
    }
    return {
        x: (rect.left + rect.width / 2) / scale,
        y: (rect.top + rect.height / 2) / scale,
    };
};

/**
 * Draws a targeting line from eg. a selected ally to the mouse position.
 * When `targetRef` is provided, the line is drawn to the centre of that element instead of the mouse (eg. keyboard targeting).
 */
type TargetLineCanvasProps = {
    children: React.ReactNode;
    originationRef?: Element | null;
    targetRef?: Element | null;
    color?: string;
} & React.HTMLAttributes<HTMLDivElement>;

const TargetLineCanvas = ({
    children,
    originationRef,
    targetRef,
    color = "rgb(221, 46, 68)",
    ...other
}: TargetLineCanvasProps) => {
    const scale = getZoomFactor();
    const origination =
        originationRef?.getBoundingClientRect && originationRef.getBoundingClientRect();
    const target = targetRef?.getBoundingClientRect && targetRef.getBoundingClientRect();
    const targetLineRef: React.RefObject<SVGPathElement> = useRef(null);
    const circleRef: React.RefObject<SVGCircleElement> = useRef(null);
    const bullseyeRef: React.RefObject<SVGCircleElement> = useRef(null);
    const frameRef = useRef<number | null>(null);
    const lastMouseRef = useRef<{ x: number; y: number } | null>(null);

    const classes = useStyles();

    const originationCenter = getCenter(origination, scale);
    const targetCenter = getCenter(target, scale);
    // The line ends at a fixed target while keyboard-targeting, otherwise it follows the mouse.
    const lineEnd = targetCenter || lastMouseRef.current;

    useEffect(() => {
        const onWindowMouseMove = (e: MouseEvent) => {
            lastMouseRef.current = {
                x: e.clientX / scale,
                y: e.clientY / scale,
            };
        };
        window.addEventListener("mousemove", onWindowMouseMove);
        return () => window.removeEventListener("mousemove", onWindowMouseMove);
    }, [scale]);

    const getInitialLine = () => {
        const { x, y } = originationCenter || { x: 0, y: 0 };
        const end = lineEnd || originationCenter || { x, y };

        return `M ${x} ${y} Q ${end.x} ${end.y} ${end.x} ${end.y}`;
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!origination) return;
        if (target) return;

        lastMouseRef.current = {
            x: e.clientX / scale,
            y: e.clientY / scale,
        };

        if (frameRef.current !== null) return;

        frameRef.current = requestAnimationFrame(() => {
            frameRef.current = null;

            const point = lastMouseRef.current;
            if (!point || !targetLineRef.current) return;

            const { x: clientX, y: clientY } = point;

            const x = (origination.left + origination.width / 2) / scale;
            const y = (origination.top + origination.height / 2) / scale;

            const offset = (x - clientX) / 3;
            const c1 = (x + clientX) / 2 + offset;
            const c2 = (y + clientY) / 1.75;

            targetLineRef.current.setAttribute(
                "d",
                `M ${x} ${y} Q ${c1} ${c2} ${clientX} ${clientY}`,
            );

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
                            cx={lineEnd?.x ?? originationCenter?.x}
                            cy={lineEnd?.y ?? originationCenter?.y}
                        />
                        <circle
                            ref={circleRef}
                            stroke={color}
                            strokeWidth="5px"
                            fill="transparent"
                            r="16"
                            cx={lineEnd?.x ?? originationCenter?.x}
                            cy={lineEnd?.y ?? originationCenter?.y}
                        />
                    </svg>
                )}
            </div>
        </div>
    );
};

export default TargetLineCanvas;
