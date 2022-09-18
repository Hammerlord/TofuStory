import { getRandomArbitrary } from "./../utils";
export const getTargetPoints = ({ from, to }) => {
    const getTargetPoint = (rect) => {
        const { x, y, height, width } = rect;
        return {
            x: x + width / 2,
            y: y + height / 2,
        };
    };

    const { x, y } = getTargetPoint(from.getBoundingClientRect());
    const { x: x2, y: y2 } = getTargetPoint(to.getBoundingClientRect());

    return { x, y, x2, y2 };
};

export const getRotationToFaceTarget = ({ x, y, x2, y2 }): number => {
    const yDist = y - y2;
    const xDist = x - x2;
    return Math.atan(xDist / yDist) * (180 / Math.PI) * -1;
};

export const travel = ({
    to,
    from,
    spin = false,
    rotateToFaceTarget = false,
    returnToOrigin = false,
    playbackTime,
    sidewinder = false,
}) => {
    if (!to || !from) {
        return;
    }

    const { x, y, x2, y2 } = getTargetPoints({ from, to });
    let rotation = 0;
    if (spin) {
        rotation = 360;
    } else if (rotateToFaceTarget) {
        rotation = getRotationToFaceTarget({ x, y, x2, y2 });
    }

    const animationFrames = [
        {
            transform: `unset`,
        },
    ];

    if (sidewinder) {
        const xDiff = x2 - x;
        const transformX = getRandomArbitrary(xDiff - 50, xDiff + 50);
        const yDiff = y2 - y;
        const jitterY = getRandomArbitrary(2, 3);
        animationFrames.push({
            transform: `translateX(${transformX}px) translateY(${yDiff / jitterY}px) rotate(${rotation}deg)`,
        });
    }

    animationFrames.push({
        transform: `translateX(${x2 - x}px) translateY(${y2 - y}px) rotate(${rotation}deg)`,
    });

    if (returnToOrigin) {
        animationFrames.push({
            transform: `unset`,
        });
        playbackTime /= 1.5;
    }

    from.animate(animationFrames, {
        duration: playbackTime,
    });
};
