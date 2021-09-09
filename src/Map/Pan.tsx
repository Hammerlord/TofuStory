import { createRef, useRef, useState } from "react";

const Pan = ({ children }) => {
    const [x, setX] = useState(0);
    const [y, setY] = useState(0);
    const [mousePos, setLastMousePos] = useState([null, null]);
    const [isMouseDown, setIsMouseDown] = useState(false);
    const [containerRef] = useState(useRef(createRef() as any));
    const [isPanning, setIsPanning] = useState(false);

    const handleMouseDown = (e) => {
        setLastMousePos([e.screenX, e.screenY]);
        setIsMouseDown(true);
    };

    const handleMouseUp = (e) => {
        setIsMouseDown(false);
        if (isPanning) {
            setIsPanning(false);
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
                height: "max-content",
            }}
        >
            {children}
        </div>
    );
};
export default Pan;
