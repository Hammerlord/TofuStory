export const travel = ({ to, from, spin = false, returnToOrigin = false }) => {
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
    const { x, y } = getTargetPoint(from.getBoundingClientRect());
    const { x: x2, y: y2 } = getTargetPoint(to.getBoundingClientRect());
    const increments = 60;
    const moveIncrementX = (x2 - x) / increments;
    const moveIncrementY = (y2 - y) / increments;
    let i = 1;
    let direction = 1;
    const spinIncrement = 360 / increments;
    const move = () => {
        if (!from) {
            return;
        }
        const xPos = i * moveIncrementX;
        const yPos = i * moveIncrementY;
        from.style.transform = `translateX(${xPos}px) translateY(${yPos}px)${spin ? ` rotate(${spinIncrement * i}deg)` : ""}`;

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
