// Bigger animation speed = slower
export const travel = ({ to, from, spin = false, rotateToFaceTarget = false, returnToOrigin = false, animationSpeed = 60 }) => {
    if (!to || !from) {
        return;
    }
    const getTargetPoint = (rect) => {
        const { x, y, height, width } = rect;
        return {
            x: x + width / 2,
            y: y + height / 2,
        };
    };
    from.style.transform = "unset";
    const { x, y } = getTargetPoint(from.getBoundingClientRect());
    const { x: x2, y: y2 } = getTargetPoint(to.getBoundingClientRect());

    const increments = animationSpeed;
    const moveIncrementX = (x2 - x) / increments;
    const moveIncrementY = (y2 - y) / increments;
    let i = 1;
    let direction = 1;
    let rotation = 0;
    if (spin) {
        const spinIncrement = 360 / increments;
        rotation = spinIncrement * 1;
    } else if (rotateToFaceTarget) {
        const yDist = y - y2;
        const xDist = x - x2;
        rotation = Math.atan(xDist / yDist) * (180 / Math.PI) * -1;
    }

    const move = () => {
        if (!from) {
            return;
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
