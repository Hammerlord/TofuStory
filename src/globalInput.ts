// Global, app-wide input behaviour.
//
// This is a game: the browser's default interactions would fight the UI, so a
// few defaults are suppressed everywhere, not just inside React components.
// All of these live here rather than in index.html so they are typed, tested
// and easy to find.

export const suppressContextMenu = (e: MouseEvent) => e.preventDefault();

export const suppressImageDrag = (e: DragEvent) => {
    if (e.target instanceof HTMLImageElement) {
        e.preventDefault();
    }
};

export const installGlobalInputHandlers = () => {
    // Capture phase: runs before any other handler (e.g. stopPropagation), so
    // nothing can let the browser's native context menu through.
    document.addEventListener("contextmenu", suppressContextMenu, { capture: true });
    document.addEventListener("dragstart", suppressImageDrag);
};