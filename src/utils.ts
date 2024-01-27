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
