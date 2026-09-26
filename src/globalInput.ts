// Global, app-wide input behaviour.
//
// This is a game: the browser's default interactions would fight the UI, so a
// few defaults are suppressed everywhere, not just inside React components.
import { isGameplayKeyPress } from "./constants/keybinds";
import { inputStateSlice } from "./input/inputReducer";
import type { AppDispatch, RootState } from "./store";

export type InputModeStore = {
    getState: () => RootState;
    dispatch: AppDispatch;
};

export const suppressContextMenu = (e: MouseEvent) => e.preventDefault();

export const suppressImageDrag = (e: DragEvent) => {
    if (e.target instanceof HTMLImageElement) {
        e.preventDefault();
    }
};

export const detectKeyboardMode =
    (store: InputModeStore) =>
    (e: KeyboardEvent): void => {
        if (!isGameplayKeyPress(e) || store.getState().input.isKeyboardMode) {
            return;
        }

        store.dispatch(inputStateSlice.actions.setKeyboardMode(true));
    };

export const detectMouseMode = (store: InputModeStore) => (): void => {
    if (!store.getState().input.isKeyboardMode) {
        return;
    }

    store.dispatch(inputStateSlice.actions.setKeyboardMode(false));
};

export const installGlobalInputHandlers = (store: InputModeStore) => {
    // Capture phase: runs before any other handler (e.g. stopPropagation), so
    // nothing can let the browser's native context menu through.
    document.addEventListener("contextmenu", suppressContextMenu, { capture: true });
    document.addEventListener("dragstart", suppressImageDrag);
    window.addEventListener("keydown", detectKeyboardMode(store), { capture: true });
    window.addEventListener("mousedown", detectMouseMode(store), { capture: true });
};
