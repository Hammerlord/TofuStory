export const SCENE_STYLES = {
    root: {
        position: "relative",
        width: "100%",
        height: "100%",
    },
    backdrop: {
        width: "100%",
        height: "100%",
    },
    character: {
        position: "absolute",
        filter: "drop-shadow(0 0 3px #fffee8) drop-shadow(0 0 3px #fffee8)",
    },
    player: {
        height: "65px",
    },
};

import { CONFIRM_KEYS } from "../constants/keybinds";

export const SCENE_DIALOG_KEYBINDS = {
    advanceKeys: CONFIRM_KEYS,
    navigateUp: "ArrowUp",
    navigateDown: "ArrowDown",
} as const;
