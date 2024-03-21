export const saveGame = (characterObject) => {
    localStorage.setItem("saveFile", JSON.stringify({ ...characterObject }));
};

export const getGameFile = () => {
    const saveFileString = localStorage.getItem("saveFile");
    if (saveFileString) {
        return JSON.parse(saveFileString);
    }
};
