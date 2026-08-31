/**
 * @file Generic utility helpers
 */

export const getRandomItem = (array: any[]): any => {
    const index = Math.floor(Math.random() * array.length);
    return array[index];
};

/**
 * Returns an array of n items randomly chosen from the given array.
 */
export const getRandomItems = (array: any[], numItems: number = 1): any[] => {
    const indexes = shuffle(Array.from({ length: array.length }).map((_, i) => i)).slice(0, numItems);
    return indexes.map((index) => array[index]).filter((item) => item);
};

export const getRandomArbitrary = (min: number, max: number): number => {
    return Math.random() * (max - min) + min;
};

export const getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const shuffle = (array: any[]): any[] => {
    array = array.slice();
    let currentIndex = array.length;
    let randomIndex: number;

    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }

    return array;
};

/**
 * Takes the first item of an array and moves it to the end of the queue.
 * Copies the array to do so.
 */
export const moveHeadToTail = (array: any[]): any[] => {
    if (!array?.length) {
        return array;
    }
    const newArray = array.slice();
    newArray.push(newArray.shift());
    return newArray;
};

export const moveTailToHead = (array: any[]): any[] => {
    if (!array?.length) {
        return array;
    }
    const newArray = array.slice();
    newArray.unshift(newArray.pop());
    return newArray;
};

export const passesChance = (chance: number | any): boolean => {
    if (typeof chance !== "number") {
        return true;
    }

    return Math.random() <= chance;
};

// If displaying a percentage, show "25%" instead of "0.25x" for values 0 < n < 1.
// !!! This action is destructive! Must clone deep beforehand !!!
export const traverseForNestedPercentages = (obj) => {
    if (!obj) {
        return;
    }

    for (const [key, val] of Object.entries(obj)) {
        if (typeof val === "object") {
            traverseForNestedPercentages(val);
        } else if (typeof val === "number") {
            if ((val > 0 && val < 1) || (val > -1 && val < 0)) {
                obj[key] = Math.floor(val * 100) + "%";
            }
        } else if (Array.isArray(obj)) {
            for (const val of obj) {
                traverseForNestedPercentages(val);
            }
        }
    }

    return obj;
};
