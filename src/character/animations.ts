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

// Bigger animation speed = slower
export const travel = ({ to, from, spin = false, rotateToFaceTarget = false, returnToOrigin = false, animationSpeed = 60 }) => {
    if (!to || !from) {
        return;
    }

    from.style.transform = "unset";
    const { x, y, x2, y2 } = getTargetPoints({ from, to });
    const increments = animationSpeed;
    const moveIncrementX = (x2 - x) / increments;
    const moveIncrementY = (y2 - y) / increments;
    let i = 1;
    let direction = 1;

    const move = () => {
        if (!from) {
            return;
        }

        let rotation = 0;
        if (spin) {
            const spinIncrement = 360 / increments;
            rotation = spinIncrement * i;
        } else if (rotateToFaceTarget) {
            rotation = getRotationToFaceTarget({ x, y, x2, y2 });
        }

        const xPos = i * moveIncrementX;
        const yPos = i * moveIncrementY;
        from.style.transform = `translateX(${xPos}px) translateY(${yPos}px) rotate(${rotation}deg)`;

        if (direction === 1) {
            ++i;

            if (i > increments) {
                if (returnToOrigin) {
                    direction = -1;
                } else {
                    return;
                }
            }

            setTimeout(() => {
                move();
            });
        } else {
            --i;

            if (i > 0) {
                setTimeout(() => {
                    move();
                });
            } else {
                from.style.transform = "unset";
            }
        }
    };
    move();
};
