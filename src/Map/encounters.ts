import { getRandomItem } from "./../utils";
import { Wave } from "./../Menu/tutorial";
import { bigBeefy, realtofu, theraretofu } from "./../enemy/tofu";
import { smalltofu, thefaketofu, theRegalTofu } from "../enemy/tofu";

const testEncounters = {
    low: [
        [null, smalltofu, thefaketofu, smalltofu, null],
        [smalltofu, smalltofu, null, smalltofu, smalltofu],
        [null, thefaketofu, null, thefaketofu, null],
        [null, null, realtofu, null, null],
        [null, smalltofu, smalltofu, smalltofu, null],
        [thefaketofu, null, null, null, thefaketofu],
    ],
    medium: [
        [null, smalltofu, realtofu, smalltofu, null],
        [null, realtofu, null, realtofu, null],
        [smalltofu, thefaketofu, smalltofu, thefaketofu, smalltofu],
        [null, thefaketofu, theRegalTofu, thefaketofu, null],
        [theRegalTofu, null, null, null, theRegalTofu],
    ],
    high: [
        [smalltofu, smalltofu, theraretofu, smalltofu, smalltofu],
        [null, theRegalTofu, null, theraretofu, null],
        [null, null, bigBeefy, null, null],
    ],
};

export const generateWaves = ({ difficulty }): Wave[] => {
    let possibleNumWaves = [];
    if (difficulty === "low") {
        possibleNumWaves = [2, 3];
    } else if (difficulty === "medium") {
        possibleNumWaves = [1, 2, 2];
    } else {
        possibleNumWaves = [1];
    }

    const numWaves = getRandomItem(possibleNumWaves);
    return Array.from({ length: numWaves }).map(() => ({ enemies: getRandomItem(testEncounters[difficulty]) }));
};
