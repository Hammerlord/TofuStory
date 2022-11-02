import { createRef, useEffect, useRef, useState } from "react";

const Pan = ({ defaultPosition, children, style }) => {
    const [x, setX] = useState(0);
    const [y, setY] = useState(0);
    const [mousePos, setLastMousePos] = useState([null, null]);
    const [isMouseDown, setIsMouseDown] = useState(false);
    const containerRef = useRef() as any;
    const [isPanning, setIsPanning] = useState(false);
    const [isIntroPan, setIsIntroPan] = useState(true);

    useEffect(() => {
        if (!defaultPosition.x || !defaultPosition.y) {
            return;
        }

        const panTime = isIntroPan ? 2000 : 400;
        setIsIntroPan(false);
        containerRef.current?.animate(
            [
                {
                    transform: `translate(${x}px, ${y}px)`,
                    easing: "ease-in-out",
                    offset: 0,
                },
                {
                    transform: `translate(${defaultPosition.x}px, ${defaultPosition.y}px)`,
                    easing: "ease-in-out",
                },
            ],
            panTime
        );
        setX(defaultPosition.x);
        setY(defaultPosition.y);
    }, [defaultPosition.x, defaultPosition.y]);

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
            onMouseLeave={handleMouseUp}
            ref={containerRef}
            style={{
                ...style,
                transform: `translate(${x}px, ${y}px)`,
                height: "max-content",
            }}
        >
            {children}
        </div>
    );
};
export default Pan;
