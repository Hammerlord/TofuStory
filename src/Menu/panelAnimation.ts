import { useCallback, useEffect, useRef, useState } from "react";
import { playFadeInAnimation, playFadeOutAnimation } from "../character/animations";

export const OPEN_PANEL_ANIMATION_MS = 250;
export const CLOSE_PANEL_ANIMATION_MS = 250;
const DIST = 48;
export const CONFIRM_BUTTON_DROP_PX = 18;
export const CONFIRM_BUTTON_ANIMATION_MS = 250;
export const REMOVING_CLASS = "removing";

export const panelKeyframes = {
    "@keyframes slideDownFadeIn": {
        "0%": {
            opacity: 0,
            translate: `0 -${DIST}px`,
        },
        "90%": {
            opacity: 1,
        },
        "100%": {
            translate: "0 0",
        },
    },
    "@keyframes slideUpFadeOut": {
        "0%": {
            opacity: 1,
            translate: "0 0",
        },
        "90%": {
            opacity: 0,
        },
        "100%": {
            translate: `0 -${DIST}px`,
        },
    },
    "@keyframes confirmButtonDrop": {
        "0%": {
            opacity: 0,
            translate: `0 -${CONFIRM_BUTTON_DROP_PX}px`,
        },
        "90%": {
            opacity: 1,
        },
        "100%": {
            translate: "0 0",
        },
    },
};

export const slideFadeInStyle = {
    animationName: "$slideDownFadeIn",
    animationDuration: `${OPEN_PANEL_ANIMATION_MS}ms`,
    animationTimingFunction: "ease-out",
    animationFillMode: "forwards",
};

export const slideFadeOutStyle = {
    animationName: "$slideUpFadeOut",
    animationDuration: `${CLOSE_PANEL_ANIMATION_MS}ms`,
    animationTimingFunction: "ease-out",
    animationFillMode: "forwards",
};

export const confirmButtonDropStyle = {
    animationName: "$confirmButtonDrop",
    animationDuration: `${CONFIRM_BUTTON_ANIMATION_MS}ms`,
    animationTimingFunction: "ease-out",
    animationFillMode: "forwards",
};

export const CARD_ANIMATION_MS = 150;
const CLOSE_CARD_ANIMATION_MS = 100;
export const CARD_ANIMATION_DELAY_MS = 10;
const CLOSE_ANIMATION_BUDGET_MS = 250;

export const useCardStaggerAnimation = (): {
    setCardRef: (index: number) => (element: HTMLDivElement | null) => void;
    animateCardsOut: () => number;
} => {
    const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
    const entranceAnimationsRef = useRef<Animation[]>([]);
    const exitAnimationsRef = useRef<Animation[]>([]);

    useEffect(() => {
        const animations = cardRefs.current
            .map((ref, index) => {
                if (!ref) {
                    return null;
                }
                return playFadeInAnimation({
                    object: ref,
                    delay: (index + 1) * CARD_ANIMATION_DELAY_MS,
                    playbackTime: CARD_ANIMATION_MS,
                    fill: "both",
                });
            })
            .filter((animation): animation is Animation => animation !== null);
        entranceAnimationsRef.current = animations;

        return () => {
            animations.forEach((animation) => animation.cancel());
            exitAnimationsRef.current.forEach((animation) => animation.cancel());
        };
    }, []);

    const animateCardsOut = useCallback(() => {
        if (exitAnimationsRef.current.length > 0) {
            return 0;
        }
        entranceAnimationsRef.current.forEach((animation) => animation.cancel());
        entranceAnimationsRef.current = [];
        const cards = cardRefs.current.filter(
            (ref): ref is HTMLDivElement => !!ref && !ref.classList.contains(REMOVING_CLASS),
        );
        const cardCount = cards.length;
        const delayBudget = Math.max(0, CLOSE_ANIMATION_BUDGET_MS - CLOSE_CARD_ANIMATION_MS);
        const slot = cardCount > 0 ? Math.min(CARD_ANIMATION_DELAY_MS, delayBudget / cardCount) : 0;
        const animations = cards
            .map((ref, index) =>
                playFadeOutAnimation({
                    object: ref,
                    delay: Math.max(0, cardCount - index) * slot,
                    playbackTime: CLOSE_CARD_ANIMATION_MS,
                    fill: "both",
                }),
            )
            .filter((animation): animation is Animation => animation !== null);
        exitAnimationsRef.current = animations;
        return CLOSE_CARD_ANIMATION_MS + cardCount * slot;
    }, []);

    const setCardRef = useCallback(
        (index: number) => (element: HTMLDivElement | null) => {
            cardRefs.current[index] = element;
        },
        [],
    );

    return { setCardRef, animateCardsOut };
};

export const usePanelTransition = (): {
    isClosing: boolean;
    closeDuration: number;
    close: (onFinished?: () => void, duration?: number) => void;
} => {
    const [isClosing, setIsClosing] = useState(false);
    const [closeDuration, setCloseDuration] = useState(CLOSE_PANEL_ANIMATION_MS);
    const isClosingRef = useRef(false);
    const timeoutRef = useRef<number | null>(null);

    useEffect(() => {
        return () => {
            if (timeoutRef.current !== null) {
                window.clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const close = useCallback(
        (onFinished?: () => void, duration: number = CLOSE_PANEL_ANIMATION_MS) => {
            if (isClosingRef.current) {
                return;
            }
            isClosingRef.current = true;
            setCloseDuration(duration);
            setIsClosing(true);
            timeoutRef.current = window.setTimeout(() => {
                timeoutRef.current = null;
                onFinished?.();
            }, duration);
        },
        [],
    );

    return { isClosing, closeDuration, close };
};
