/**
 * Shared keyboard keybinds used across the application.
 * Centralizes confirm/cancel keys so they're consistent everywhere.
 */

// Keys that confirm/accept an action (Enter + Spacebar)
export const CONFIRM_KEYS = ["Enter", " ", "Spacebar"] as const;

// Keys that cancel/close an action
export const CANCEL_KEYS = ["Escape"] as const;

/**
 * Check if a key is a confirm key.
 */
export const isConfirmKey = (key: string): boolean => CONFIRM_KEYS.includes(key as any);

/**
 * Check if a key is a cancel key.
 */
export const isCancelKey = (key: string): boolean => CANCEL_KEYS.includes(key as any);

/**
 * Check if a key is either a confirm or cancel key.
 */
export const isConfirmOrCancelKey = (key: string): boolean =>
    isConfirmKey(key) || isCancelKey(key);