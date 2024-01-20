import { getRandomArbitrary } from "./../utils";

export const getCenterCoords = (element: HTMLElement): { x: number; y: number } => {
    const { x, y, height, width } = element.getBoundingClientRect();
    return {
        x: x + width / 2,
        y: y + height / 2,
    };
};

export const getTargetPoints = ({ from, to }) => {
    const { x, y } = getCenterCoords(from);
    const { x: x2, y: y2 } = getCenterCoords(to);

    return { x, y, x2, y2 };
};

export const getRotationToFaceTarget = ({ x, y, x2, y2 }): number => {
    const yDist = y - y2;
    const xDist = x - x2;
    return Math.atan(xDist / yDist) * (180 / Math.PI) * -1;
};

const getTotalTravelDistance = ({ travelCoordinates, returnToOrigin }) => {
    let totalTraveldistance = travelCoordinates.reduce((acc, { xDiff, yDiff }) => {
        return acc + Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2));
    }, 0);
    if (returnToOrigin) {
        const { x, y } = travelCoordinates[0];
        const { x2, y2 } = travelCoordinates[travelCoordinates.length - 1];
        totalTraveldistance += Math.sqrt(Math.pow(x2 - x, 2) + Math.pow(y2 - y, 2));
    }
    return totalTraveldistance;
};

export const travel = ({
    object,
    from,
    to,
    playbackTime,
    spin = 0,
    rotation: initialRotation = 0,
    rotateToFaceTarget = false,
    returnToOrigin = false,
    sidewinder = false,
    freezeAxis,
    fadeIn = false,
}: {
    object?: HTMLElement | HTMLElement[]; // Object to move. If not supplied, `from` is used instead.
    from: HTMLElement;
    to: HTMLElement | HTMLElement[];
    playbackTime: number;
    spin?: number;
    rotation?: number;
    rotateToFaceTarget?: boolean;
    returnToOrigin?: boolean;
    sidewinder?: boolean;
    freezeAxis?: "x" | "y";
    fadeIn?: boolean;
}) => {
    if (!from || !to || (Array.isArray(to) && !to.length)) {
        return;
    }

    const animationFrames: {
        transform?: string;
        easing?: "ease-in" | "ease-out";
        offset?: number;
        opacity?: number;
    }[] = [
        {
            transform: `unset`,
        },
    ];

    const targetElements: HTMLElement[] = Array.isArray(to) ? to : [to];
    const { x, y } = getCenterCoords(from);
    const elementsToAnimate = !Array.isArray(object) ? [object || from] : object;
    const objectCoords = getCenterCoords(elementsToAnimate[0]);

    // If `object` and `from` are both supplied, make sure the object starts at the `from` position
    // TODO object is potentially an array where all items need to have their origin adjusted to `from`
    const originOffsetX = freezeAxis === "x" ? 0 : x - objectCoords.x;
    const originOffsetY = freezeAxis === "y" ? 0 : y - objectCoords.y;

    const travelCoordinates = targetElements.reduce((acc, element: HTMLElement) => {
        const { x: toX, y: toY } = getCenterCoords(element);
        const x2 = freezeAxis === "x" ? x : toX;
        const y2 = freezeAxis === "y" ? y : toY;
        const xDiff = x2 - x + originOffsetX;
        const yDiff = y2 - y + originOffsetY;
        if (sidewinder) {
            const jitterX = getRandomArbitrary(50, 50);
            const jitterY = getRandomArbitrary(2, 3);
            const sidewinderX = x + jitterX;
            const sideWinderX2 = x2 + jitterX;
            const sidewinderY = y / jitterY;
            const sidewinderY2 = y2 / jitterY;

            acc.push({
                x: sidewinderX,
                x2: sideWinderX2,
                y: sidewinderY,
                y2: sidewinderY2,
                xDiff: sideWinderX2 - sidewinderX,
                yDiff: sidewinderY2 - sidewinderY,
            });
        }

        acc.push({ x, x2, y, y2, xDiff, yDiff });

        return acc;
    }, []);
    const totalTravelDistance = getTotalTravelDistance({ travelCoordinates, returnToOrigin });

    let rotation = initialRotation;
    if (rotateToFaceTarget) {
        rotation += getRotationToFaceTarget({ x, y, x2: travelCoordinates[0]?.x2, y2: travelCoordinates[0]?.y2 });
    }

    animationFrames.push({
        transform: `translateX(${originOffsetX}px) translateY(${originOffsetY}px) rotate(${rotation}deg)`,
        offset: 0,
    });

    travelCoordinates.forEach(({ x, y, x2, y2, xDiff, yDiff }, i: number) => {
        let rotation = initialRotation;
        if (spin) {
            const isEven = i % 2 === 0;
            rotation = spin * (isEven ? -1 : 1);
        } else if (rotateToFaceTarget) {
            rotation += getRotationToFaceTarget({ x, y, x2, y2 });
        }
        const travelDist = travelCoordinates
            .slice(0, i + 1)
            .reduce((acc, { xDiff, yDiff }) => acc + Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2)), 0);

        const opacity = fadeIn && i === 0 ? 0 : 1;

        animationFrames.push({
            transform: `translateX(${xDiff}px) translateY(${yDiff}px) rotate(${rotation}deg)`,
            opacity,
            offset: travelDist / totalTravelDistance || null,
        });
    });

    if (returnToOrigin) {
        animationFrames.push({
            transform: `unset`,
        });
    }

    animationFrames[0].easing = "ease-out";
    animationFrames[animationFrames.length - 1].easing = "ease-in";

    elementsToAnimate.forEach((el, i) => {
        el.animate(animationFrames, {
            duration: playbackTime,
            delay: i * 50,
        });
    });
};
