import { getRandomInt } from "../../utils";

const generateCombination = ({ length = 4, remove = 1 } = {}) => {
    const nums = Array.from({ length }).map(() => true);
    const indices = nums.map((_, i) => i);

    for (let i = 0; i < remove; ++i) {
        const index = getRandomInt(0, indices.length - 1);
        indices.splice(index, 1);
        nums[index] = null;
    }
    return nums;
};

export default generateCombination;
