import { getRandomArbitrary } from "./../utils";

const getCenterCoords = (element: HTMLElement): { x: number; y: number } => {
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

export const travel = ({
    from,
    to,
    playbackTime,
    spin = false,
    rotateToFaceTarget = false,
    returnToOrigin = false,
    sidewinder = false,
}: {
    from: HTMLElement;
    to: HTMLElement | HTMLElement[];
    playbackTime: number;
    spin?: boolean;
    rotateToFaceTarget?: boolean;
    returnToOrigin?: boolean;
    sidewinder?: boolean;
}) => {
    if (!from || !to || (Array.isArray(to) && !to.length)) {
        return;
    }

    const animationFrames: {
        transform?: string;
        easing?: "ease-in" | "ease-out";
    }[] = [
        {
            transform: `unset`,
        },
    ];

    const targetElements: HTMLElement[] = Array.isArray(to) ? to : [to];
    targetElements.forEach((element: HTMLElement, i: number) => {
        const { x, y } = getCenterCoords(from);
        const { x: x2, y: y2 } = getCenterCoords(element);
        let rotation = 0;
        if (spin) {
            const isEven = i % 2 === 0;
            rotation = 360 * (isEven ? 1 : -1);
        } else if (rotateToFaceTarget) {
            rotation = getRotationToFaceTarget({ x, y, x2, y2 });
        }
        const xDiff = x2 - x;
        const yDiff = y2 - y;

        if (sidewinder) {
            const transformX = getRandomArbitrary(xDiff - 50, xDiff + 50);
            const jitterY = getRandomArbitrary(2, 3);
            animationFrames.push({
                transform: `translateX(${transformX}px) translateY(${yDiff / jitterY}px) rotate(${rotation}deg)`,
            });
        }

        animationFrames.push({
            transform: `translateX(${xDiff}px) translateY(${yDiff}px) rotate(${rotation}deg)`,
        });
    });

    if (returnToOrigin) {
        animationFrames.push({
            transform: `unset`,
        });
    }

    animationFrames[0].easing = "ease-out";
    animationFrames[animationFrames.length - 1].easing = "ease-in";

    from.animate(animationFrames, {
        duration: playbackTime,
    });
};
