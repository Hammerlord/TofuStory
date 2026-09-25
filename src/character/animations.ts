import { getRandomArbitrary } from "./../utils";
import { getZoomFactor } from "../constants";

type TravelCoordinates = {
    x: number;
    x2: number;
    y: number;
    y2: number;
    xDiff: number;
    yDiff: number;
};

export const getCenterCoords = (element: HTMLElement): { x: number; y: number } => {
    const { x, y, height, width } = element.getBoundingClientRect();
    return {
        x: x + width / 2,
        y: y + height / 2,
    };
};

export const getUnscaledCenterCoords = (element: HTMLElement): { x: number; y: number } => {
    const { x, y, height, width } = element.getBoundingClientRect();
    const scale = getZoomFactor();
    return {
        x: (x + width / 2) / scale,
        y: (y + height / 2) / scale,
    };
};

export const getTargetPoints = ({ from, to }: { from: HTMLElement; to: HTMLElement }) => {
    const { x, y } = getCenterCoords(from);
    const { x: x2, y: y2 } = getCenterCoords(to);

    return { x, y, x2, y2 };
};

export const getRotationToFaceTarget = ({
    x,
    y,
    x2,
    y2,
}: {
    x: number;
    y: number;
    x2: number;
    y2: number;
}): number => {
    const yDist = y - y2;
    const xDist = x - x2;
    return Math.atan(xDist / yDist) * (180 / Math.PI) * -1;
};

const getTotalTravelDistance = ({
    travelCoordinates,
    returnToOrigin,
}: {
    travelCoordinates: TravelCoordinates[];
    returnToOrigin: boolean;
}): number => {
    if (!travelCoordinates.length) {
        return 0;
    }

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
    rotate: initialRotation = 0,
    rotateToFaceTarget = false,
    returnToOrigin = false,
    sidewinder = false,
    windup = 0,
    freezeAxis,
    fadeIn = false,
    fill,
    delay,
    startEase = "ease-out",
    endEase = "ease-in",
}: {
    object?: HTMLElement | HTMLElement[] | null; // Object to move. If not supplied, `from` is used instead.
    from: HTMLElement | null | undefined;
    to: HTMLElement | HTMLElement[] | null | undefined;
    playbackTime: number;
    spin?: number;
    rotate?: number;
    rotateToFaceTarget?: boolean;
    returnToOrigin?: boolean;
    sidewinder?: boolean;
    windup?: number;
    freezeAxis?: "x" | "y";
    fadeIn?: boolean | "fast";
    fill?: "forwards";
    delay?: number;
    startEase?: "ease-in" | "ease-out";
    endEase?: "ease-in" | "ease-out";
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

    const elementsToAnimate = !Array.isArray(object) ? [object || from] : object;
    if (!elementsToAnimate[0]) {
        return;
    }

    const targetElements: HTMLElement[] = Array.isArray(to) ? to : [to];
    const { x, y } = getUnscaledCenterCoords(from);
    const objectCoords = getUnscaledCenterCoords(elementsToAnimate[0]);

    // If `object` and `from` are both supplied, make sure the object starts at the `from` position
    // TODO object is potentially an array where all items need to have their origin adjusted to `from`
    const originOffsetX = freezeAxis === "x" ? 0 : x - objectCoords.x;
    const originOffsetY = freezeAxis === "y" ? 0 : y - objectCoords.y;

    const travelCoordinates = targetElements.reduce((acc, element: HTMLElement) => {
        let { x: toX, y: toY } = getUnscaledCenterCoords(element);
        const maxOffset = 3;
        toX += getRandomArbitrary(-maxOffset, maxOffset);
        toY += getRandomArbitrary(-maxOffset, maxOffset);

        // If the target coordinates are 0,0 (upper left of the screen) then the destination is invalid (probably due to element not having rendered).
        // Skip the animation rather than have the character fly to 0,0.
        if (toX === 0 && toY === 0) {
            return acc;
        }

        const x2 = freezeAxis === "x" ? x : toX;
        const y2 = freezeAxis === "y" ? y : toY;
        const xDiff = x2 - x + originOffsetX;
        const yDiff = y2 - y + originOffsetY;

        if (sidewinder) {
            const jitterX = getRandomArbitrary(50, 50);
            const jitterY = getRandomArbitrary(2, 3);
            const sidewinderX = x + jitterX;
            const sidewinderX2 = x2 + jitterX;
            const sidewinderY = y / jitterY;
            const sidewinderY2 = y2 / jitterY;

            acc.push({
                x: sidewinderX,
                x2: sidewinderX2,
                y: sidewinderY,
                y2: sidewinderY2,
                xDiff: sidewinderX2 - sidewinderX,
                yDiff: sidewinderY2 - sidewinderY,
            });
        }

        acc.push({ x, x2, y, y2, xDiff, yDiff });

        return acc;
    }, [] as TravelCoordinates[]);

    const totalTravelDistance = getTotalTravelDistance({
        travelCoordinates,
        returnToOrigin,
    });

    let rotation = initialRotation;

    if (rotateToFaceTarget) {
        rotation += getRotationToFaceTarget({
            x,
            y,
            x2: travelCoordinates[0]?.x2,
            y2: travelCoordinates[0]?.y2,
        });
    }

    const frame = {
        transform: `translateX(${originOffsetX}px) translateY(${originOffsetY}px) rotate(${rotation}deg)`,
        offset: 0,
    };

    if (fadeIn === "fast") {
        (frame as any).opacity = 1;
    }

    animationFrames.push(frame);

    if (windup > 0 && travelCoordinates[0]) {
        const { x2, y2 } = travelCoordinates[0];

        const dx = x2 - x;
        const dy = y2 - y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
            const windupX = (-dx / distance) * windup;
            const windupY = (-dy / distance) * windup;

            animationFrames.push({
                transform: `
                    translateX(${originOffsetX + windupX}px)
                    translateY(${originOffsetY + windupY}px)
                    rotate(${rotation}deg)
                `,
                opacity: 1,
                offset: 0.15,
            });

            animationFrames.push({
                transform: `
                    translateX(${originOffsetX}px)
                    translateY(${originOffsetY}px)
                    rotate(${rotation}deg)
                `,
                opacity: 1,
                offset: 0.2,
            });
        }
    }

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
            .reduce(
                (acc, { xDiff, yDiff }) => acc + Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2)),
                0,
            );

        animationFrames.push({
            transform: `translateX(${xDiff}px) translateY(${yDiff}px) rotate(${rotation}deg)`,
            opacity: 1,
            offset: travelDist / totalTravelDistance || undefined,
        });
    });

    if (returnToOrigin) {
        animationFrames.push({
            transform: `unset`,
        });
    }

    animationFrames[0].easing = startEase;
    animationFrames[animationFrames.length - 1].easing = endEase;

    // Guard against the Web Animations API throwing when offsets are not
    // monotonically non-decreasing. Don't know why this is happening all of a sudden though...
    let previousOffset = 0;

    const safeAnimationFrames = animationFrames.map((frame) => {
        if (frame.offset == null || !Number.isFinite(frame.offset)) {
            return frame;
        }

        const offset = Math.max(previousOffset, Math.min(1, frame.offset));
        previousOffset = offset;

        return {
            ...frame,
            offset,
        };
    });

    return elementsToAnimate.map((el, i) => {
        return el.animate(safeAnimationFrames, {
            duration: playbackTime,
            delay: delay || i * 50,
            fill,
        });
    });
};

export const ARROW_IMPACT_DURATION = 650;

export const playArrowAnimation = ({
    object,
    from,
    to,
    playbackTime,
    rotate: initialRotation = 0,
    rotateToFaceTarget = false,
    delay,
    tailWiggle = 4,
    impactDuration = ARROW_IMPACT_DURATION,
    tipX = 0.05,
    tipY = 0.93,
}: {
    object?: HTMLElement | HTMLElement[] | null; // Object to move. If not supplied, `from` is used instead.
    from: HTMLElement | null | undefined;
    to: HTMLElement | HTMLElement[] | null | undefined;
    playbackTime: number;
    rotate?: number;
    rotateToFaceTarget?: boolean;
    delay?: number;
    tailWiggle?: number;
    impactDuration?: number;
    tipX?: number;
    tipY?: number;
}) => {
    if (!from || !to || (Array.isArray(to) && !to.length)) {
        return;
    }

    const elementsToAnimate = !Array.isArray(object) ? [object || from] : object;
    if (!elementsToAnimate[0]) {
        return;
    }

    const animationFrames: {
        transform?: string;
        easing?: string;
        offset?: number;
        opacity?: number;
        transformOrigin?: string;
    }[] = [
        {
            transform: `unset`,
            opacity: 1,
        },
    ];

    const targetElements: HTMLElement[] = Array.isArray(to) ? to : [to];
    const { x, y } = getUnscaledCenterCoords(from);
    const objectCoords = getUnscaledCenterCoords(elementsToAnimate[0]);

    // If `object` and `from` are both supplied, make sure the object starts at the `from` position
    const originOffsetX = x - objectCoords.x;
    const originOffsetY = y - objectCoords.y;

    const boxWidth = elementsToAnimate[0].offsetWidth;
    const boxHeight = elementsToAnimate[0].offsetHeight;
    const tipOffsetX = (tipX - 0.5) * boxWidth;
    const tipOffsetY = (tipY - 0.5) * boxHeight;

    const tipOrigin = `${tipX * 100}% ${tipY * 100}%`;

    const travelCoordinates = targetElements.reduce((acc, element: HTMLElement) => {
        let { x: toX, y: toY } = getUnscaledCenterCoords(element);
        const maxOffset = 3;
        toX += getRandomArbitrary(-maxOffset, maxOffset);
        toY += getRandomArbitrary(-maxOffset, maxOffset);

        // If the target coordinates are 0,0 (upper left of the screen) then the destination is invalid
        // (probably due to element not having rendered). Skip the animation rather than have the arrow fly to 0,0.
        if (toX === 0 && toY === 0) {
            return acc;
        }

        acc.push({ x, x2: toX, y, y2: toY, xDiff: toX - x + originOffsetX, yDiff: toY - y + originOffsetY });

        return acc;
    }, [] as TravelCoordinates[]);

    if (!travelCoordinates.length) {
        return;
    }

    const totalTravelDistance = getTotalTravelDistance({
        travelCoordinates,
        returnToOrigin: false,
    });

    let rotation = initialRotation;
    if (rotateToFaceTarget) {
        rotation += getRotationToFaceTarget({
            x,
            y,
            x2: travelCoordinates[0]?.x2,
            y2: travelCoordinates[0]?.y2,
        });
    }

    const duration = playbackTime + impactDuration;
    const arrivalOffset = playbackTime / duration;
    const impactOffset = 1 - arrivalOffset;

    animationFrames.push({
        transform: `translateX(${originOffsetX - tipOffsetX}px) translateY(${originOffsetY - tipOffsetY}px) rotate(${rotation}deg)`,
        transformOrigin: tipOrigin,
        opacity: 1,
        offset: 0,
    });

    let lastTarget: TravelCoordinates | undefined;

    travelCoordinates.forEach(({ x, y, x2, y2, xDiff, yDiff }, i: number) => {
        let rotation = initialRotation;

        if (rotateToFaceTarget) {
            rotation += getRotationToFaceTarget({ x, y, x2, y2 });
        }

        const travelDist = travelCoordinates
            .slice(0, i + 1)
            .reduce(
                (acc, { xDiff, yDiff }) => acc + Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2)),
                0,
            );

        animationFrames.push({
            transform: `translateX(${xDiff - tipOffsetX}px) translateY(${yDiff - tipOffsetY}px) rotate(${rotation}deg)`,
            transformOrigin: tipOrigin,
            opacity: 1,
            offset: Math.min(arrivalOffset, (travelDist / totalTravelDistance) * arrivalOffset || 0),
        });

        lastTarget = { x, y, x2, y2, xDiff, yDiff };
    });

    if (lastTarget) {
        const { xDiff, yDiff, x2, y2 } = lastTarget;

        const finalRotation = rotateToFaceTarget
            ? initialRotation + getRotationToFaceTarget({ x, y, x2, y2 })
            : initialRotation;

        const impactFrame = (rotationDeg: number, offset: number, opacity = 1, easing?: string) => ({
            transform: `translateX(${xDiff - tipOffsetX}px) translateY(${yDiff - tipOffsetY}px) rotate(${rotationDeg}deg)`,
            transformOrigin: tipOrigin,
            opacity,
            offset,
            easing,
        });

        if (tailWiggle) {
            animationFrames.push(impactFrame(finalRotation + tailWiggle, arrivalOffset + impactOffset * 0.05, 1, "ease-out"));
            animationFrames.push(impactFrame(finalRotation - tailWiggle, arrivalOffset + impactOffset * 0.09, 1, "ease-in-out"));
            animationFrames.push(impactFrame(finalRotation + tailWiggle * 0.5, arrivalOffset + impactOffset * 0.13, 1, "ease-in-out"));
            animationFrames.push(impactFrame(finalRotation - tailWiggle * 0.5, arrivalOffset + impactOffset * 0.17, 1, "ease-in-out"));
        }

        animationFrames.push(impactFrame(finalRotation, arrivalOffset + impactOffset * 0.24, 1, "ease-out"));
        animationFrames.push(impactFrame(finalRotation, arrivalOffset + impactOffset * 0.36, 1));
        animationFrames.push(impactFrame(finalRotation, 1, 0, "ease-in"));
    }

    animationFrames[0].easing = "ease-out";
    animationFrames[animationFrames.length - 1].easing = "ease-in";

    // Guard against the Web Animations API throwing when offsets are not
    // monotonically non-decreasing. Don't know why this is happening all of a sudden though...
    let previousOffset = 0;

    const safeAnimationFrames = animationFrames.map((frame) => {
        if (frame.offset == null || !Number.isFinite(frame.offset)) {
            return frame;
        }

        const offset = Math.max(previousOffset, Math.min(1, frame.offset));
        previousOffset = offset;

        return {
            ...frame,
            offset,
        };
    });

    return elementsToAnimate.map((el, i) => {
        return el.animate(safeAnimationFrames, {
            duration,
            delay: delay || i * 50,
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
    maxScale = 7,
    translateX = 0,
    delay = 50,
}: {
    object?: HTMLElement | HTMLElement[]; // Object to move. If not supplied, `from` is used instead.
    from?: HTMLElement;
    playbackTime: number;
    maxScale?: number;
    translateX?: number;
    delay?: number;
}) => {
    const elementsToAnimate = !Array.isArray(object) ? [object || from] : object;

    const animationFrames = [
        {
            transform: `translateX(${translateX}%) scale(1)`,
            filter: "brightness(1.5) drop-shadow(0 0 5px #fffee8) drop-shadow(0 0 1px #fffee8)",
            easing: "ease-out",
            offset: 0.2,
            opacity: 0.8,
        },
        {
            transform: `translateX(${translateX}%) scale(${maxScale})`,
            opacity: 0,
            filter: "brightness(3) drop-shadow(0 0 5px #fffee8) drop-shadow(0 0 1px #fffee8)",
            easing: "ease-in",
        },
    ];

    return elementsToAnimate.map((el, i) => {
        if (el) {
            return el.animate(animationFrames, {
                duration: playbackTime,
                delay: i * delay,
            });
        }
    });
};

/**
 * Throw an `object` up and down at a location. Usually used for consumables.
 */
export const playTossUpAnimation = ({
    from,
    object,
    playbackTime = 750,
    delay,
    flash = true,
    spin,
    flipY: flipY = false,
}: {
    object?: HTMLElement | HTMLElement[]; // Object to move. If not supplied, `from` is used instead.
    from: HTMLElement;
    playbackTime?: number;
    delay?: number;
    flash?: boolean;
    spin?: number | number;
    flipY?: boolean;
}) => {
    const elementsToAnimate = !Array.isArray(object) ? [object || from] : object;
    let spinAmount;
    if (typeof spin === "number") {
        spinAmount = spin;
    } else if (spin) {
        spinAmount = 720;
    }

    const animationFrames: {
        transform: string;
        filter?: string;
        opacity: number;
        easing: string;
    }[] = [
        {
            transform: `translateY(0)${flipY ? " rotateY(0deg)" : ""}`,
            filter: "brightness(1)",
            opacity: 1,
            easing: "ease-out",
        },
        {
            transform: [
                spinAmount ? `translateY(-300%) rotate(${spinAmount / 2}deg)` : "translateY(-300%)",
                flipY ? "rotateY(180deg)" : "",
            ]
                .filter(Boolean)
                .join(" "),
            opacity: 1,
            filter: "brightness(1.5)",
            easing: "ease-in-out",
        },
        {
            transform: [
                spinAmount ? `translateY(0) rotate(${spinAmount}deg)` : "translateY(0)",
                flipY ? "rotateY(360deg)" : "",
            ]
                .filter(Boolean)
                .join(" "),
            opacity: 0,
            filter: "brightness(1.5)",
            easing: "ease-in",
        },
    ];

    if (!flash) {
        animationFrames.forEach((frame) => {
            delete frame.filter;
        });
    }

    return elementsToAnimate.map((el, i) => {
        return el.animate(animationFrames, {
            duration: playbackTime,
            delay: delay || i * 50,
        });
    });
};

/**
 * Quickly shake `object` along a direction vector.
 * @param direction - normalized direction vector; {x:0, y:1} shakes purely vertically
 * @param amplitude - the maximum translate percentage of the shake
 */
export const playShakeAnimation = ({
    object,
    delay,
    playbackTime,
    direction = { x: 0, y: 1 },
    amplitude = 0.5,
}: {
    object: HTMLElement;
    delay?: number;
    playbackTime: number;
    direction?: { x: number; y: number };
    amplitude?: number;
}) => {
    const animationFrames = [
        {
            transform: "translateX(0%) translateY(0%)",
            easing: "ease-out",
        },
        {
            transform: `translateX(${direction.x * amplitude}%) translateY(${direction.y * amplitude}%)`,
            easing: "ease-in-out",
        },
        {
            transform: `translateX(${-direction.x * amplitude}%) translateY(${-direction.y * amplitude}%)`,
            easing: "ease-in-out",
        },
        {
            transform: "translateX(0%) translateY(0%)",
            easing: "ease-in",
        },
    ];

    return object.animate(animationFrames, {
        duration: playbackTime,
        delay,
    });
};

export const copyComputedStyles = (source: HTMLElement, target: HTMLElement) => {
    const sourceStyle = window.getComputedStyle(source);

    for (const property of sourceStyle) {
        target.style.setProperty(
            property,
            sourceStyle.getPropertyValue(property),
            sourceStyle.getPropertyPriority(property),
        );
    }

    const sourceChildren = Array.from(source.children);
    const targetChildren = Array.from(target.children);

    sourceChildren.forEach((sourceChild, i) => {
        const targetChild = targetChildren[i];

        if (sourceChild instanceof HTMLElement && targetChild instanceof HTMLElement) {
            copyComputedStyles(sourceChild, targetChild);
        }
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
    object: HTMLElement;
    playbackTime: number;
    to: HTMLElement;
    desaturate?: boolean;
    darken?: boolean;
}) => {
    const objectRect = object.getBoundingClientRect();
    const toRect = to.getBoundingClientRect();

    const x = objectRect.left + objectRect.width / 2;
    const y = objectRect.top + objectRect.height / 2;

    const x2 = toRect.left + toRect.width / 2;
    const y2 = toRect.top + toRect.height / 2;

    const xDiff = (x2 - x) * 3;
    const yDiff = (y2 - y) * 3;

    const rotation = getRotationToFaceTarget({
        x,
        y,
        x2,
        y2,
    });

    const clone = object.cloneNode(true) as HTMLElement;
    copyComputedStyles(object, clone);

    Object.assign(clone.style, {
        position: "fixed",
        left: `${objectRect.left}px`,
        top: `${objectRect.top}px`,
        width: `${objectRect.width}px`,
        height: `${objectRect.height}px`,
        margin: "0",
        zIndex: "9999",
        pointerEvents: "none",
    });

    document.body.appendChild(clone);

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

    const animation = clone.animate(animationFrames, {
        duration: playbackTime,
        fill: "forwards",
    });

    animation.finished
        .then(() => {
            clone.remove();
        })
        .catch(() => {
            clone.remove();
        });

    return animation;
};

/**
 * Animation for when the deck has cycled and discard cards move back into the deck. It's a bit faster/different than sendToPile.
 */
export const refreshToPile = ({
    object,
    to,
    playbackTime,
    delay,
}: {
    object: HTMLElement;
    playbackTime?: number;
    to: HTMLElement;
    delay?: number;
}) => {
    const scale = getZoomFactor();
    const { x, y } = getUnscaledCenterCoords(object);
    const { x: x2, y: y2 } = getUnscaledCenterCoords(to);
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
export const playStompAnimation = ({
    object,
    playbackTime = 1000,
}: {
    object: HTMLElement;
    playbackTime?: number;
}) => {
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

export const playDyingAnimation = ({
    object,
    playbackTime = 750,
}: {
    object: HTMLElement;
    playbackTime?: number;
}) => {
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
    });
};

export const playHitAnimation = ({
    object,
    playbackTime = 300,
    delta,
    delay = 0,
}: {
    object: HTMLElement;
    playbackTime?: number;
    delta: number;
    delay?: number;
}) => {
    const inverse = (num: number) => -num;

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

/**
 * Fade in a new entity that has just appeared, such as a combatant.
 */
export const playFadeInAnimation = ({
    object,
    playbackTime = 250,
    shift,
    delay,
    fill,
}: {
    object: HTMLElement;
    playbackTime?: number;
    /**
     * How far (in px) the object starts displaced vertically before sliding into place.
     * Positive starts it below its resting spot (it rises up), negative starts it above (it descends).
     */
    shift?: number;
    delay?: number;
    fill?: "forwards" | "both";
}) => {
    const animationFrames: any[] = [
        {
            opacity: 0,
            easing: "ease-out",
        },
        {
            opacity: 1,
        },
    ];

    if (shift) {
        animationFrames[0].transform = `translateY(${shift}px)`;
        animationFrames[1].transform = "translateY(0px)";
    }

    return object.animate(animationFrames, {
        duration: playbackTime,
        delay,
        fill,
    });
};

/**
 * Fade out an entity that is disappearing, such as when a panel closes.
 */
export const playFadeOutAnimation = ({
    object,
    playbackTime = 250,
    shiftDown,
    delay,
    fill,
}: {
    object: HTMLElement;
    playbackTime?: number;
    shiftDown?: boolean;
    delay?: number;
    fill?: "forwards" | "both";
}) => {
    const animationFrames: any[] = [
        {
            opacity: 1,
            easing: "ease-in",
        },
        {
            opacity: 0,
        },
    ];

    if (shiftDown) {
        animationFrames[0].transform = "translateY(0px)";
        animationFrames[1].transform = "translateY(50px)";
    }

    return object.animate(animationFrames, {
        duration: playbackTime,
        delay,
        fill,
    });
};

export const playExpandContractAnimation = ({
    object,
    playbackTime = 300,
    max = 2,
}: {
    object: HTMLElement;
    playbackTime?: number;
    max?: number;
}) => {
    const animationFrames: any[] = [
        {
            scale: 1,
            easing: "ease-out",
        },
        {
            scale: max,
        },
        {
            scale: 1,
            easing: "ease-in",
        },
    ];

    return object.animate(animationFrames, {
        duration: playbackTime,
    });
};
export const playHomingAnimation = ({
    object,
    playbackTime = 300,
    to,
}: {
    object: HTMLElement;
    to: HTMLElement;
    playbackTime?: number;
}) => {
    let { x: toX, y: toY } = getCenterCoords(to);

    // Offset by half the object's dimensions so its center
    // lands precisely at the target's center.
    const { width, height } = object.getBoundingClientRect();
    toX -= width / 2;
    toY -= height / 2;

    const dist = 150;
    const jitter = 50;
    const fromX =
        toX + getRandomArbitrary(dist + jitter, dist - jitter) * (Math.random() < 0.5 ? -1 : 1);
    const fromY =
        toY + getRandomArbitrary(dist + jitter, dist - jitter) * (Math.random() < 0.5 ? -1 : 1);

    object.style.position = "fixed";
    object.style.left = "0px";
    object.style.top = "0px";

    const animationFrames = [
        {
            transform: `translate(${fromX}px, ${fromY}px)`,
            opacity: 0,
            offset: 0,
        },
        {
            transform: `translate(${toX}px, ${toY}px)`,
            opacity: 1,
            offset: 0.8,
        },
        {
            transform: `translate(${toX}px, ${toY}px)`,
            opacity: 0.75,
            offset: 0.85,
        },
        {
            transform: `translate(${toX}px, ${toY}px)`,
            opacity: 1,
            offset: 0.9,
        },
        {
            transform: `translate(${toX}px, ${toY}px)`,
            opacity: 0.75,
            offset: 0.95,
        },
        {
            transform: `translate(${toX}px, ${toY}px)`,
            opacity: 1,
            offset: 1,
        },
    ];

    return object.animate(animationFrames, {
        duration: playbackTime,
        easing: "ease-out",
        fill: "forwards",
    });
};

export const playTargetMarkerAnimation = ({
    object,
    playbackTime = 500,
    to,
}: {
    object: HTMLElement;
    to: HTMLElement;
    playbackTime?: number;
}) => {
    let { x: toX, y: toY } = getCenterCoords(to);

    const { width, height } = object.getBoundingClientRect();
    toX -= width / 2;
    toY -= height / 2;

    object.style.position = "fixed";
    object.style.left = "0px";
    object.style.top = "0px";

    const animationFrames = [
        {
            transform: `translate(${toX}px, ${toY}px) scale(0.5)`,
            opacity: 0,
            offset: 0,
        },
        {
            transform: `translate(${toX}px, ${toY}px) scale(1.2)`,
            opacity: 1,
            offset: 0.35,
        },
        {
            transform: `translate(${toX}px, ${toY}px) scale(1)`,
            opacity: 0.75,
            offset: 0.7,
        },
        {
            transform: `translate(${toX}px, ${toY}px) scale(1)`,
            opacity: 1,
            offset: 1,
        },
    ];

    return object.animate(animationFrames, {
        duration: playbackTime,
        easing: "ease-out",
        fill: "forwards",
    });
};

export const playProjectileRainAnimation = ({
    object,
    to,
    playbackTime = 500,
    delay,
    rotate = 0,
    spread = 75,
    distance = 300,
}: {
    object: HTMLElement;
    to: HTMLElement;
    playbackTime?: number;
    delay?: number;
    rotate?: number; // Degrees; the projectile's sprite orientation while it falls
    spread?: number; // Horizontal variance (in px) of where each projectile starts
    distance?: number; // How far above the target each projectile starts (in px)
}) => {
    const { width, height } = object.getBoundingClientRect();
    const { left, width: targetWidth, bottom } = to.getBoundingClientRect();

    const targetX = left + targetWidth / 2 - width / 2;
    const targetY = bottom - height;

    const fromX = targetX + getRandomArbitrary(-spread, spread);
    const fromY = targetY - getRandomArbitrary(distance - 100, distance);

    object.style.position = "fixed";
    object.style.left = "0px";
    object.style.top = "0px";

    const animationFrames = [
        {
            transform: `translate(${fromX}px, ${fromY}px) rotate(${rotate}deg)`,
            opacity: 0,
            offset: 0,
        },
        {
            transform: `translate(${fromX}px, ${targetY}px) rotate(${rotate}deg)`,
            opacity: 1,
            offset: 0.6,
        },
        {
            transform: `translate(${fromX}px, ${targetY}px) rotate(${rotate}deg)`,
            opacity: 0,
            offset: 1,
        },
    ];

    return object.animate(animationFrames, {
        duration: playbackTime,
        delay,
        fill: "forwards",
    });
};
