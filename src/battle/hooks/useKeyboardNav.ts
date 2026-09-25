import { useCallback, useEffect, useMemo, useState } from "react";
import { CombatAbility } from "../../ability/types";
import { Combatant } from "../../character/types";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { battleWarnings } from "../constants";
import { battleStateSlice } from "../reducer";
import { BATTLE_STATES } from "../states";
import { BATTLEFIELD_SIDES } from "../types";
import { canUsePlayerAbility } from "../actions/playerAbility";
import { shouldShowReticleForTarget } from "../view/targetHelpers";
import { BattleControls } from "./useBattleControls";

export type KeyboardNav =
    | { mode: "card"; cardIndex: number }
    | {
          mode: "target";
          cardIndex: number;
          target: { side: BATTLEFIELD_SIDES; index: number };
      }
    | { mode: "deck"; cardIndex: number };

const BATTLEFIELD_SIZE = 5;

export const MOVE_CARD_TO_DECK_KEY = "q";

const getCardIndexFromNumberKey = (key: string): number | null => {
    if (!/^[0-9]$/.test(key)) {
        return null;
    }
    return key === "0" ? 9 : Number(key) - 1;
};

// The centre slot is a natural starting point when keyboard-targeting. Return the valid
// target whose index is closest to the centre, preferring the earlier entry on ties
// (enemy side comes before the player side, and lower indices before higher ones).
const getInitialKeyboardTarget = (
    validTargets: { side: BATTLEFIELD_SIDES; index: number }[],
): { side: BATTLEFIELD_SIDES; index: number } => {
    const centreIndex = Math.floor(BATTLEFIELD_SIZE / 2);
    let closest = validTargets[0];
    for (const target of validTargets) {
        if (Math.abs(target.index - centreIndex) < Math.abs(closest.index - centreIndex)) {
            closest = target;
        }
    }
    return closest;
};

const { selectHandAbility, selectAlly, updateBattleState } = battleStateSlice.actions;

export interface KeyboardNavOutput {
    keyboardNav: KeyboardNav | null;
    setKeyboardNav: React.Dispatch<React.SetStateAction<KeyboardNav | null>>;
    isKeyboardTargetValid: (card: CombatAbility, side: BATTLEFIELD_SIDES, index: number) => boolean;
    keyboardPreviewTarget: {
        side: BATTLEFIELD_SIDES;
        index: number;
        id: string | null;
    } | null;
}

/**
 * Keyboard navigation of the hand and its targets.
 */
export const useKeyboardNav = (controls: BattleControls): KeyboardNavOutput => {
    const dispatch = useAppDispatch();
    const battle = useAppSelector((state) => state.battle)!;
    const {
        playerSide,
        enemySide,
        depleted,
        selectCardsPrompt,
        selectedHandAbilityId,
        selectedAllyId,
    } = battle;
    const hasSelectCardsPrompt = Boolean(selectCardsPrompt);

    const {
        player,
        hand,
        movementAbility,
        allowMoveCardFromHandToDeck,
        disableActions,
        warn,
        warnNeedMoreResources,
        handleAbilityUse,
        handleSelectCardsPrerequisite,
        handleMoveCardToDeck,
    } = controls;

    // State for the arrow-key navigation of the hand and its targets. Reset whenever the player takes over with the mouse.
    const [keyboardNav, setKeyboardNav] = useState<KeyboardNav | null>(null);

    const isKeyboardTargetValid = useCallback(
        (card: CombatAbility, side: BATTLEFIELD_SIDES, index: number): boolean => {
            if (!player) {
                return false;
            }

            return shouldShowReticleForTarget({
                selectedAbilityFromHand: card,
                player,
                selectedMinion: null,
                allowFriendlyMovement: false,
                movementAbility,
                hoveredCombatant: null,
                abilityToUse: card,
                battle,
                actorId: player.id,
                combatantSide: side,
                combatantIndex: index,
            });
        },
        [player, movementAbility, battle],
    );

    /**
     * The slots a card can be played on via keyboard navigation. Applies the same validity rules as mouse
     * selection: resources, taunts, untargetable combatants, conditions, empty slots, etc.
     */
    const getKeyboardValidTargets = useCallback(
        (card: CombatAbility): { side: BATTLEFIELD_SIDES; index: number }[] => {
            const targets: { side: BATTLEFIELD_SIDES; index: number }[] = [];
            const collect = (side: BATTLEFIELD_SIDES, slots: (Combatant | null)[]) => {
                slots.forEach((_, index) => {
                    if (isKeyboardTargetValid(card, side, index)) {
                        targets.push({ side, index });
                    }
                });
            };
            collect(BATTLEFIELD_SIDES.ENEMY_SIDE, enemySide);
            collect(BATTLEFIELD_SIDES.PLAYER_SIDE, playerSide);
            return targets;
        },
        [isKeyboardTargetValid, enemySide, playerSide],
    );

    const canSelectCardForKeyboard = useCallback(
        (card: CombatAbility | null | undefined): boolean => {
            if (!card) {
                return false;
            }
            if (allowMoveCardFromHandToDeck) {
                return true;
            }
            const isUnplayable = card.unplayable && !card.effects?.some((e) => e.bypassUnplayable);
            if (isUnplayable || card.effects?.some((e) => e.isLocked)) {
                return false;
            }
            return canUsePlayerAbility(player, card);
        },
        [player, allowMoveCardFromHandToDeck],
    );

    const selectHandCard = useCallback(
        (cardIndex: number) => {
            const card = hand[cardIndex];
            dispatch(
                selectHandAbility(card && canSelectCardForKeyboard(card) ? card.instanceId : null),
            );
        },
        [hand, canSelectCardForKeyboard, dispatch],
    );

    const beginTargeting = useCallback(
        (cardIndex: number) => {
            const card = hand[cardIndex];
            if (!card) {
                return;
            }
            if (!allowMoveCardFromHandToDeck) {
                const isUnplayable =
                    card.unplayable && !card.effects?.some((e) => e.bypassUnplayable);
                if (isUnplayable || card.effects?.some((e) => e.isLocked)) {
                    warn(battleWarnings.unplayable);
                    return;
                }
                if (!canUsePlayerAbility(player, card)) {
                    warnNeedMoreResources(card);
                    return;
                }
            }
            const validTargets = getKeyboardValidTargets(card);
            if (!validTargets.length) {
                if (allowMoveCardFromHandToDeck) {
                    dispatch(selectHandAbility(card.instanceId));
                    setKeyboardNav({ mode: "deck", cardIndex });
                }
                return;
            }
            dispatch(selectHandAbility(card.instanceId));
            setKeyboardNav({
                mode: "target",
                cardIndex,
                target: getInitialKeyboardTarget(validTargets),
            });
        },
        [
            hand,
            allowMoveCardFromHandToDeck,
            canUsePlayerAbility,
            player,
            getKeyboardValidTargets,
            warn,
            warnNeedMoreResources,
            dispatch,
        ],
    );

    const handleKeyboardUseCard = useCallback(
        (nav: { cardIndex: number; target: { side: BATTLEFIELD_SIDES; index: number } }) => {
            const selectedCard = hand[nav.cardIndex];
            if (!selectedCard) {
                return;
            }
            const { side, index: selectedIndex } = nav.target;
            setKeyboardNav(null);

            if (selectedCard.selectCards) {
                handleSelectCardsPrerequisite({
                    side,
                    selectedIndex,
                    selectedCard,
                });
                return;
            }

            if (
                side === BATTLEFIELD_SIDES.PLAYER_SIDE &&
                selectedCard.actions.some((action) => action.retrieveDepletedCards) &&
                depleted.length === 0
            ) {
                warn(battleWarnings.minDepleted);
                return;
            }

            handleAbilityUse({
                selectedIndex,
                side,
                selectedAbility: selectedCard,
            });
        },
        [hand, depleted, handleAbilityUse, handleSelectCardsPrerequisite, warn],
    );

    const keyboardPreviewTarget = useMemo(() => {
        if (keyboardNav?.mode !== "target") {
            return null;
        }
        const { target } = keyboardNav;
        const combatants = target.side === BATTLEFIELD_SIDES.PLAYER_SIDE ? playerSide : enemySide;
        const combatant = combatants[target.index];
        return { side: target.side, index: target.index, id: combatant?.id || null };
    }, [keyboardNav, playerSide, enemySide]);

    // Reset keyboard navigation whenever the player can no longer act (turn ended, prompts open, etc.)
    useEffect(() => {
        if (disableActions) {
            setKeyboardNav(null);
        }
    }, [disableActions]);

    useEffect(() => {
        if (disableActions || hasSelectCardsPrompt) {
            return;
        }

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.repeat) {
                return;
            }
            if (
                e.key !== "ArrowLeft" &&
                e.key !== "ArrowRight" &&
                e.key !== "ArrowUp" &&
                e.key !== "ArrowDown" &&
                e.key !== "e" &&
                e.key !== "E" &&
                e.key !== "Escape" &&
                e.key !== "Enter" &&
                e.key !== MOVE_CARD_TO_DECK_KEY &&
                e.key !== MOVE_CARD_TO_DECK_KEY.toUpperCase() &&
                getCardIndexFromNumberKey(e.key) === null
            ) {
                return;
            }

            if (e.key === "e" || e.key === "E") {
                dispatch(updateBattleState(BATTLE_STATES.TURN_END));
                return;
            }

            if (e.key === MOVE_CARD_TO_DECK_KEY || e.key === MOVE_CARD_TO_DECK_KEY.toUpperCase()) {
                const card = hand.find(
                    (candidate) => candidate.instanceId === selectedHandAbilityId,
                );
                if (allowMoveCardFromHandToDeck && card) {
                    e.preventDefault();
                    setKeyboardNav(null);
                    handleMoveCardToDeck(card.instanceId);
                }
                return;
            }

            const numberKeyCardIndex = getCardIndexFromNumberKey(e.key);
            if (numberKeyCardIndex !== null) {
                if (keyboardNav?.mode === "target") {
                    const selectedCard = hand[keyboardNav.cardIndex];
                    if (selectedCard) {
                        const validTargets = getKeyboardValidTargets(selectedCard);
                        const slotNumber = numberKeyCardIndex + 1;
                        const slot = validTargets.find((target) => target.index + 1 === slotNumber);
                        if (slot) {
                            handleKeyboardUseCard({
                                cardIndex: keyboardNav.cardIndex,
                                target: slot,
                            });
                        }
                    }
                    return;
                }
                if (numberKeyCardIndex >= hand.length) {
                    return;
                }
                dispatch(selectAlly(null));
                setKeyboardNav({ mode: "card", cardIndex: numberKeyCardIndex });
                selectHandCard(numberKeyCardIndex);
                beginTargeting(numberKeyCardIndex);
                return;
            }

            if (e.key === "Escape") {
                if (keyboardNav?.mode === "target" || keyboardNav?.mode === "deck") {
                    setKeyboardNav({ mode: "card", cardIndex: keyboardNav.cardIndex });
                } else {
                    setKeyboardNav(null);
                    dispatch(selectAlly(null));
                    dispatch(selectHandAbility(null));
                }
                return;
            }

            if (!keyboardNav) {
                if (e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === "ArrowDown") {
                    if (!hand.length) {
                        return;
                    }
                    let cardIndex = selectedHandAbilityId
                        ? hand.findIndex((card) => card.instanceId === selectedHandAbilityId)
                        : -1;
                    if (cardIndex < 0) {
                        cardIndex = e.key === "ArrowLeft" ? hand.length - 1 : 0;
                    }
                    if (selectedHandAbilityId || selectedAllyId) {
                        dispatch(selectAlly(null));
                        dispatch(selectHandAbility(null));
                    }
                    setKeyboardNav({ mode: "card", cardIndex });
                    selectHandCard(cardIndex);
                } else if (e.key === "ArrowUp") {
                    if (!selectedHandAbilityId) {
                        return;
                    }
                    const cardIndex = hand.findIndex(
                        (card) => card.instanceId === selectedHandAbilityId,
                    );
                    if (cardIndex < 0) {
                        return;
                    }
                    dispatch(selectAlly(null));
                    setKeyboardNav({ mode: "card", cardIndex });
                    selectHandCard(cardIndex);
                    beginTargeting(cardIndex);
                }
                return;
            }

            if (keyboardNav.mode === "card") {
                if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
                    if (!hand.length) {
                        return;
                    }
                    const delta = e.key === "ArrowLeft" ? hand.length - 1 : 1;
                    const cardIndex = (keyboardNav.cardIndex + delta) % hand.length;
                    setKeyboardNav({ mode: "card", cardIndex });
                    selectHandCard(cardIndex);
                } else if (e.key === "ArrowUp") {
                    beginTargeting(keyboardNav.cardIndex);
                }
                return;
            }

            if (keyboardNav.mode === "deck") {
                if (e.key === "ArrowUp" || e.key === "Enter") {
                    const card = hand[keyboardNav.cardIndex];
                    if (card) {
                        e.preventDefault();
                        setKeyboardNav(null);
                        handleMoveCardToDeck(card.instanceId);
                    }
                } else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
                    // The deck sits at the left end of the slot cycle: right steps onto the
                    // first target slot, left wraps around to the last one.
                    const card = hand[keyboardNav.cardIndex];
                    if (!card) {
                        setKeyboardNav(null);
                        return;
                    }
                    const validTargets = getKeyboardValidTargets(card);
                    if (!validTargets.length) {
                        return;
                    }
                    const targetIndex = e.key === "ArrowRight" ? 0 : validTargets.length - 1;
                    setKeyboardNav({
                        mode: "target",
                        cardIndex: keyboardNav.cardIndex,
                        target: validTargets[targetIndex],
                    });
                } else if (e.key === "ArrowDown") {
                    setKeyboardNav({ mode: "card", cardIndex: keyboardNav.cardIndex });
                }
                return;
            }

            const selectedCard = hand[keyboardNav.cardIndex];
            if (!selectedCard) {
                setKeyboardNav(null);
                return;
            }
            const validTargets = getKeyboardValidTargets(selectedCard);
            if (!validTargets.length) {
                setKeyboardNav(null);
                return;
            }

            if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
                const currentIndex = validTargets.findIndex(
                    (target) =>
                        target.side === keyboardNav.target.side &&
                        target.index === keyboardNav.target.index,
                );
                const delta = e.key === "ArrowLeft" ? validTargets.length - 1 : 1;
                const nextIndex =
                    currentIndex >= 0 ? (currentIndex + delta) % validTargets.length : 0;
                if (e.key === "ArrowLeft" && allowMoveCardFromHandToDeck && currentIndex === 0) {
                    setKeyboardNav({ mode: "deck", cardIndex: keyboardNav.cardIndex });
                    return;
                }
                setKeyboardNav({
                    mode: "target",
                    cardIndex: keyboardNav.cardIndex,
                    target: validTargets[nextIndex],
                });
            } else if (e.key === "Enter") {
                // Keep a focused button (eg. End Turn) from also activating on Enter
                e.preventDefault();
                handleKeyboardUseCard(keyboardNav);
            } else if (e.key === "ArrowUp") {
                handleKeyboardUseCard(keyboardNav);
            } else if (e.key === "ArrowDown") {
                setKeyboardNav({
                    mode: "card",
                    cardIndex: keyboardNav.cardIndex,
                });
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [
        disableActions,
        hasSelectCardsPrompt,
        allowMoveCardFromHandToDeck,
        handleMoveCardToDeck,
        keyboardNav,
        hand,
        selectedHandAbilityId,
        selectedAllyId,
        getKeyboardValidTargets,
        handleKeyboardUseCard,
        selectHandCard,
        beginTargeting,
    ]);

    return {
        keyboardNav,
        setKeyboardNav,
        isKeyboardTargetValid,
        keyboardPreviewTarget,
    };
};

export default useKeyboardNav;
