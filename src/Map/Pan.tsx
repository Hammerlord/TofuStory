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
        }

        handleDraw(e);
    };

    // This is just for generating routes
    const handleDraw = (e) => {
        if (!isPanning && enableDraw) {
            const { left, width, top, height } = containerRef.current.getBoundingClientRect();
            const newPositions = [...positions, [(e.clientX - left) / width, (e.clientY - top) / height]];
            console.log(newPositions);
            setPositions(newPositions);
        }
    };

    const handleErase = (e, i) => {
        if (!isPanning && enableDraw && e.button === 2) {
            const newPositions = positions.slice();
            newPositions.splice(i, 1);
            setPositions(newPositions);
            e.stopPropagation();
            e.preventDefault();
        }
    };

    const { width = 0, height = 0 } = (containerRef.current?.getBoundingClientRect && containerRef.current?.getBoundingClientRect()) || {};

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
                            onClick={(e) => handleErase(e, i)}
                            key={i}
                            style={{
                                position: "absolute",
                                backgroundColor: "red",
                                width: "2vh",
                                height: "2vh",
                                transform: `translate(${x * width}px, ${y * height}px)`,
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
