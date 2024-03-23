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

/**
 * Move `object` elements from a location (HTMLElement) to another location (HTMLElement).
 */
export const playTravelAnimation = ({
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
            opacity: fadeIn ? 0 : 1,
        },
    ];

    const targetElements: HTMLElement[] = Array.isArray(to) ? to : [to];
    const { x, y } = getCenterCoords(from);
    const elementsToAnimate = !Array.isArray(object) ? [object || from] : object;
    if (!elementsToAnimate[0]) {
        return;
    }

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

        animationFrames.push({
            transform: `translateX(${xDiff}px) translateY(${yDiff}px) rotate(${rotation}deg)`,
            opacity: 1,
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

    return elementsToAnimate.map((el, i) => {
        return el.animate(animationFrames, {
            duration: playbackTime,
            delay: i * 50,
        });
    });
};

/**
 * Scale up an `object` at the `from` location rapidly to simulate an 'exploding' effect.
 */
export const playExplodeAnimation = ({
    from,
    object,
    playbackTime,
}: {
    object?: HTMLElement | HTMLElement[]; // Object to move. If not supplied, `from` is used instead.
    from: HTMLElement;
    playbackTime: number;
}) => {
    const elementsToAnimate = !Array.isArray(object) ? [object || from] : object;

    const animationFrames = [
        {
            transform: "scale(1)",
            filter: "brightness(1.5) drop-shadow(0 0 5px #fffee8) drop-shadow(0 0 1px #fffee8)",
            easing: "ease-out",
            offset: 0.2,
            opacity: 0.8,
        },
        {
            transform: "scale(7)",
            opacity: 0,
            filter: "brightness(3) drop-shadow(0 0 5px #fffee8) drop-shadow(0 0 1px #fffee8)",
            easing: "ease-in",
        },
    ];

    return elementsToAnimate.map((el, i) => {
        return el.animate(animationFrames, {
            duration: playbackTime,
            delay: i * 50,
        });
    });
};

/**
 * Throw an `object` up and down at a location. Usually used for consumables.
 */
export const playTossUpAnimation = ({
    from,
    object,
    playbackTime,
}: {
    object?: HTMLElement | HTMLElement[]; // Object to move. If not supplied, `from` is used instead.
    from: HTMLElement;
    playbackTime: number;
}) => {
    const elementsToAnimate = !Array.isArray(object) ? [object || from] : object;

    const animationFrames = [
        {
            transform: "translateY(0)",
            filter: "brightness(1)",
            opacity: 1,
            easing: "ease-out",
        },
        {
            transform: "translateY(-300%) rotate(360deg)",
            opacity: 1,
            filter: "brightness(1.5)",
            easing: "ease-in-out",
        },
        {
            transform: "translateY(0) rotate(720deg)",
            opacity: 0,
            filter: "brightness(1.5)",
            easing: "ease-in",
        },
    ];

    return elementsToAnimate.map((el, i) => {
        return el.animate(animationFrames, {
            duration: playbackTime,
            delay: i * 50,
        });
    });
};

/**
 * Quickly shake `object` vertically.
 */
export const playShakeAnimation = ({ object, delay, playbackTime }) => {
    const animationFrames = [
        {
            transform: "translateY(0%)",
            easing: "ease-out",
        },
        {
            transform: "translateY(0.5%)",
            easing: "ease-in-out",
        },
        {
            transform: "translateY(-0.5%)",
            easing: "ease-in-out",
        },
        {
            transform: "translateY(0%)",
            easing: "ease-in",
        },
    ];

    return object.animate(animationFrames, {
        duration: playbackTime,
        delay,
    });
};

/**
 * Animation when moving an `object` (almost certainly a card) to a card pile.
 */
export const sendToPile = ({
    object,
    playbackTime,
    to,
    desaturate = false,
    darken = false,
}: {
    object;
    playbackTime: number;
    to;
    desaturate?: boolean;
    darken?: boolean;
}) => {
    const { x, y } = getCenterCoords(object);
    const { x: x2, y: y2 } = getCenterCoords(to);
    const xDiff = (x2 - x) * 3; // *3 because of 0.3 scale
    const yDiff = (y2 - y) * 3; // *3 because of 0.3 scale

    const rotation = getRotationToFaceTarget({ x, y, x2, y2 });
    const animationFrames = [
        {
            transform: "translateY(0)",
            easing: "ease-in",
            opacity: 1,
            offset: 0.1,
        },
        {
            transform: "translateY(0)",
            easing: "ease-in",
            offset: 0.15,
            opacity: 1,
        },
        {
            transform: "translateY(0)",
            filter: `saturate(${desaturate ? 0 : 1}) brightness(${darken ? 0.2 : 1})`,
            offset: 0.4,
            opacity: 1,
            easing: "ease-in",
        },
        {
            transform: "translateY(0)",
            filter: `saturate(${desaturate ? 0 : 1}) brightness(${darken ? 0.2 : 1})`,
            offset: 0.75,
            opacity: 1,
            easing: "ease-in",
        },
        {
            transform: `scaleX(0.3) scaleY(0.3) translateX(${xDiff}px) translateY(${yDiff}px) rotate(${rotation}deg)`,
            filter: `saturate(${desaturate ? 0 : 1}) brightness(${darken ? 0.2 : 1})`,
            opacity: 0,
            offset: 0.9,
            easing: "ease-in",
        },
    ];

    return object.animate(animationFrames, {
        duration: playbackTime,
    });
};

/**
 * Animation for when the deck has cycled and discard cards move back into the deck. It's a bit faster/different than sendToPile.
 */
export const refreshToPile = ({ object, to, playbackTime, delay }) => {
    const { x, y } = getCenterCoords(object);
    const { x: x2, y: y2 } = getCenterCoords(to);
    const xDiff = x2 - x; // *3 because of 0.3 scale
    const yDiff = y2 - y; // *3 because of 0.3 scale

    const rotation = getRotationToFaceTarget({ x, y, x2, y2 });
    const animationFrames = [
        {
            transform: "translateY(20px)",
            easing: "ease-in",
            opacity: 0.5,
            offset: 0.1,
        },
        {
            transform: "translateY(0)",
            offset: 0.2,
            opacity: 0.75,
            easing: "ease-in",
        },
        {
            transform: "translateY(0)",
            offset: 0.75,
            opacity: 1,
            easing: "ease-in",
        },
        {
            transform: `translateX(${xDiff}px) translateY(${yDiff}px) rotate(${rotation}deg)`,
            opacity: 0.1,
            easing: "ease-in",
        },
    ];

    return object.animate(animationFrames, {
        duration: playbackTime,
        delay,
    });
};

/**
 * `object` plays a "stomping" animation. The element gets compressed and stretched.
 */
export const playStompAnimation = ({ object, playbackTime = 1000 }) => {
    const animationFrames = [
        {
            transform: "translateY(0)",
            easing: "ease-out",
            transformOrigin: "center bottom",
            offset: 0,
        },
        {
            transform: "translateY(-150px)",
            offset: 0.6,
        },
        {
            transform: "translateY(5px)",
            offset: 0.75,
        },
        {
            transform: "translateY(0) scaleX(1.05) scaleY(0.85)",
            offset: 0.755,
        },
        {
            transform: "scaleX(1.05) scaleY(0.85)",
            offset: 0.8,
        },
        {
            transform: "scaleX(1) scaleY(1)",
            easing: "ease-in",
            offset: 1,
        },
    ];

    return object.animate(animationFrames, {
        duration: playbackTime,
    });
};

export const playDyingAnimation = ({ object, playbackTime = 750 }) => {
    const animationFrames = [
        {
            transform: "translateY(0)",
            opacity: 1,
            easing: "ease-out",
        },
        {
            transform: "translateY(-100px)",
            opacity: 0,
            filter: "brightness(0.5)",
        },
    ];

    return object.animate(animationFrames, {
        duration: playbackTime,
        delay: 0.25,
    });
};

export const playHitAnimation = ({ object, playbackTime = 300, delta, delay }) => {
    const inverse = (num) => -num;

    const animationFrames = [
        {
            transform: `translateX(0%) translateY(0%)`,
            filter: "unset",
        },
        {
            transform: `translateX(0%) translateY(${inverse(delta)}%)`,
            filter: "sepia(0.1) brightness(0.8)",
        },
        {
            transform: `translateX(${Math.ceil(delta / 10)}%) translateY(${inverse(delta)}%)`,
            filter: "sepia(0.1) brightness(0.8)",
        },
        {
            transform: `translateX(${inverse(Math.ceil(delta / 10))}%) translateY(${inverse(delta)}%)`,
            filter: "sepia(0.1) brightness(0.8)",
        },
        {
            transform: `translateX(${Math.ceil(delta / 10)}%) translateY(${inverse(delta)}%)`,
            filter: "sepia(0.1) brightness(0.8)",
        },
        {
            transform: `translateX(${inverse(Math.ceil(delta / 10))}%) translateY(${delta / 3}%)`,
            filter: "sepia(0.1) brightness(0.8)",
        },
        {
            transform: `translateX(0%) translateY(${inverse(delta / 2)}%)`,
            filter: "sepia(0.1) brightness(0.8)",
        },
        {
            transform: `translateX(0%) translateY(0%)`,
        },
    ];

    return object.animate(animationFrames, {
        duration: playbackTime,
        delay,
    });
};
