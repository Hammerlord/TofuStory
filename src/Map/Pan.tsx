import { createRef, useRef, useState } from "react";
import { clamp } from "ramda";
import classNames from "classnames";

const Pan = ({ children }) => {
    const [x, setX] = useState(0);
    const [y, setY] = useState(0);
    const [mousePos, setLastMousePos] = useState([null, null]);
    const [isMouseDown, setIsMouseDown] = useState(false);
    const [containerRef] = useState(useRef(createRef() as any));
    const [positions, setPositions] = useState([]);
    const [isPanning, setIsPanning] = useState(false);
    const [enableDraw] = useState(false);

    const handleMouseDown = (e) => {
        setLastMousePos([e.screenX, e.screenY]);
        setIsMouseDown(true);
    };

    const handleMouseUp = (e) => {
        setIsMouseDown(false);
        if (isPanning) {
            setIsPanning(false);
        } else if (enableDraw) {
            // This is just for generating routes
            const { left, top } = containerRef.current.getBoundingClientRect();
            const newPositions = [...positions, [e.clientX - left, e.clientY - top]];
            console.log(newPositions);
            setPositions(newPositions);
        }
    };

    const handleMouseMove = (e) => {
        if (!isMouseDown) {
            return;
        }

        setIsPanning(true);
        setX(x - (mousePos[0] - e.screenX));
        setY(y - (mousePos[1] - e.screenY));
        setLastMousePos([e.screenX, e.screenY]);
    };
    return (
        <div
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            ref={containerRef}
            style={{
                transform: `translate(${x}px, ${y}px)`,
                width: `150%`,
                height: `150%`,
            }}
        >
            {children}
            {enableDraw && (
                <div style={{ position: "absolute", left: 0, top: 0, width: `100%`, height: `100%` }}>
                    {positions.map(([x, y], i) => (
                        <div
                            key={i}
                            style={{
                                position: "absolute",
                                backgroundColor: "red",
                                width: "2vh",
                                height: "2vh",
                                transform: `translate(${x}px, ${y}px)`,
                            }}
                        >
                            {i + 1}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
export default Pan;
