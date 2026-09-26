import { useEffect, useState } from "react";
import { CONFIRM_KEYS, CANCEL_KEYS, isConfirmKey, isCancelKey } from "../constants/keybinds";

export const CARD_SELECTION_KEYBINDS = {
    confirm: { key: CONFIRM_KEYS[0], hint: "⏎" },
    cancel: { key: CANCEL_KEYS[0], hint: "ESC" },
} as const;

export interface UseCardSelectionOptions<T> {
    /** The cards to choose from. */
    items: T[];
    /** The maximum number of cards that can be selected (1 = single select). */
    maxAmount: number;
    /** Called when the selection is confirmed (Enter key or handleConfirm). */
    onConfirm?: () => void;
    /**
     * Determines whether confirming is currently disallowed. Enter does nothing
     * when disabled. Defaults to disallowing confirm while nothing is selected.
     */
    isConfirmDisabled?: (selectedIds: string[]) => boolean;
    /** Called when Escape is pressed while `cancelable` is true. */
    onCancel?: () => void;
    /** Whether Escape should invoke `onCancel`. */
    cancelable?: boolean;
    /** When false, all keyboard input is ignored (eg. while the overlay is hidden). */
    enabled?: boolean;
    /** Extract a stable id per item. Defaults to the item's index. */
    getId?: (item: T, index: number) => string;
    /** Preselect a lone option on mount so it can be confirmed with a single press. */
    preselectLoneOption?: boolean;
}

export interface UseCardSelectionResult<T> {
    /** The ids of the currently selected items. */
    selectedIds: string[];
    /** The currently selected items, in choice order. */
    selectedItems: T[];
    /** The index currently focused by the arrow keys. */
    currentIndex: number;
    /** How the current focus was moved last: by the mouse or by the keyboard. Lets
     *  the UI show a persistent focus marker (eg. a reticle) only for keyboard use. */
    focusSource: "keyboard" | "mouse";
    /** Whether confirming is currently disallowed (see the isConfirmDisabled option). */
    isConfirmDisabled: boolean;
    /** Whether the item at the given index is currently selected. */
    isSelected: (item: T, index: number) => boolean;
    /** Select/deselect the given item. Shared by the click and keyboard handling. */
    handleCardClick: (item: T, index: number) => void;
    /** Confirm the current selection, unless disabled. */
    handleConfirm: () => void;
}

export function useCardSelection<T>({
    items,
    maxAmount,
    onConfirm,
    isConfirmDisabled = (selectedIds) => selectedIds.length === 0,
    onCancel,
    cancelable = false,
    enabled = true,
    getId = (_item, index) => String(index),
    preselectLoneOption = false,
}: UseCardSelectionOptions<T>): UseCardSelectionResult<T> {
    const [selectedIds, setSelectedIds] = useState<string[]>(() =>
        preselectLoneOption && items.length === 1 ? [getId(items[0], 0)] : [],
    );

    useEffect(() => {
        if (preselectLoneOption && items.length === 1 && selectedIds.length === 0) {
            setSelectedIds([getId(items[0], 0)]);
        }
    }, [preselectLoneOption, items, getId, selectedIds]);
    // The card currently focused by the arrow keys.
    const [currentIndex, setCurrentIndex] = useState(0);
    // Whether the current focus comes from keyboard navigation or a mouse click.
    // Starts as "mouse" so a focus marker only appears after keyboard use.
    const [focusSource, setFocusSource] = useState<"keyboard" | "mouse">("mouse");

    const selectedItems = items.filter((item, index) => selectedIds.includes(getId(item, index)));

    const isConfirmDisabledValue = isConfirmDisabled(selectedIds);

    const isSelected = (item: T, index: number) => selectedIds.includes(getId(item, index));

    const toggleSelection = (item: T, index: number) => {
        const id = getId(item, index);
        if (maxAmount === 1) {
            setSelectedIds([id]);
            return;
        }
        if (selectedIds.includes(id)) {
            // Deselect if selected
            setSelectedIds((prev) => prev.filter((selected) => selected !== id));
            return;
        }
        if (selectedIds.length < maxAmount) {
            setSelectedIds((prev) => [...prev, id]);
        }
    };

    const handleCardClick = (item: T, index: number) => {
        setCurrentIndex(index);
        setFocusSource("mouse");
        toggleSelection(item, index);
    };

    const handleConfirm = () => {
        if (!isConfirmDisabledValue) {
            onConfirm?.();
        }
    };

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.repeat) {
                return;
            }
            if (!enabled) {
                return;
            }
            if (isCancelKey(event.key)) {
                if (cancelable) {
                    event.preventDefault();
                    onCancel?.();
                }
                return;
            }
            const singleSelect = maxAmount === 1;
            const isConfirmOrCancelKey = isConfirmKey(event.key) || isCancelKey(event.key);

            if (!items.length && !isConfirmOrCancelKey) {
                return;
            }

            if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
                event.preventDefault();
                setFocusSource("keyboard");
                const delta = event.key === "ArrowLeft" ? items.length - 1 : 1;
                const nextIndex = (currentIndex + delta) % items.length;
                setCurrentIndex(nextIndex);
                if (singleSelect) {
                    // Single select can skip the intermediate highlight stage.
                    setSelectedIds([getId(items[nextIndex], nextIndex)]);
                }
            } else if (event.key === "ArrowUp") {
                if (singleSelect) {
                    return;
                }
                event.preventDefault();
                setFocusSource("keyboard");
                const itemIndex = currentIndex % items.length;
                const item = items[itemIndex];
                if (item !== undefined) {
                    const id = getId(item, itemIndex);
                    setSelectedIds((prev) =>
                        prev.includes(id) || prev.length >= maxAmount ? prev : [...prev, id],
                    );
                }
            } else if (event.key === "ArrowDown") {
                if (singleSelect) {
                    return;
                }
                event.preventDefault();
                setFocusSource("keyboard");
                const itemIndex = currentIndex % items.length;
                const item = items[itemIndex];
                if (item !== undefined) {
                    const id = getId(item, itemIndex);
                    setSelectedIds((prev) => prev.filter((selected) => selected !== id));
                }
            } else if (/^[0-9]$/.test(event.key)) {
                event.preventDefault();
                setFocusSource("keyboard");
                const index = event.key === "0" ? 9 : Number(event.key) - 1;
                const item = items[index];
                if (item === undefined) {
                    return;
                }
                const id = getId(item, index);
                setCurrentIndex(index);
                if (maxAmount === 1) {
                    setSelectedIds([id]);
                } else if (selectedIds.includes(id)) {
                    setSelectedIds((prev) => prev.filter((selected) => selected !== id));
                } else if (selectedIds.length < maxAmount) {
                    setSelectedIds((prev) => [...prev, id]);
                }
            } else if (isConfirmKey(event.key)) {
                if (!isConfirmDisabledValue) {
                    event.preventDefault();
                    onConfirm?.();
                }
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [
        items,
        maxAmount,
        onConfirm,
        isConfirmDisabled,
        onCancel,
        cancelable,
        enabled,
        getId,
        currentIndex,
        selectedIds,
    ]);

    return {
        selectedIds,
        selectedItems,
        currentIndex,
        focusSource,
        isConfirmDisabled: isConfirmDisabledValue,
        isSelected,
        handleCardClick,
        handleConfirm,
    };
}
