import { createRef, useEffect, useRef, useState } from "react";

const Pan = ({ defaultPosition, children, style }) => {
    const [x, setX] = useState(0);
    const [y, setY] = useState(0);
    const [position, setLastInteractionPos] = useState([null, null]);
    const [isInteracting, setIsInteracting] = useState(false);
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

    const handleStartInteraction = (e) => {
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
        <div
            onMouseDown={handleStartInteraction}
            onMouseMove={handlePan}
            onMouseUp={handleStopPan}
            onMouseLeave={handleStopPan}
            onTouchStart={handleStartInteraction}
            onTouchMove={handlePan}
            onTouchEnd={handleStopPan}
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
