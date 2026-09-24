import { ReactElement, useCallback, useEffect, useMemo, useState } from "react";
import { Ability, CombatAbility } from "../../ability/types";
import { Combatant, Player } from "../../character/types";
import { useAppDispatch } from "../../hooks";
import { battleWarnings } from "../constants";
import { battleStateSlice } from "../reducer";
import { BATTLE_STATES } from "../states";
import { BATTLEFIELD_SIDES, BattleState } from "../types";
import { canUsePlayerAbility } from "../actions/playerAbility";
import { shouldShowReticleForTarget } from "./targetHelpers";

export type KeyboardNav =
    | { mode: "card"; cardIndex: number }
    | {
          mode: "target";
          cardIndex: number;
          target: { side: BATTLEFIELD_SIDES; index: number };
      };

const BATTLEFIELD_SIZE = 5;

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

export interface UseKeyboardNavArgs {
    hand: CombatAbility[];
    player: Player;
    playerSide: (Combatant | null)[];
    enemySide: (Combatant | null)[];
    battle: BattleState;
    depleted: CombatAbility[];
    movementAbility: Ability;
    allowMoveCardFromHandToDeck: boolean;
    disableActions: boolean;
    eventGroupsLength: number;
    hasSelectCardsPrompt: boolean;
    selectedHandAbilityId: string | null;
    selectedAllyId: string | null;
    warn: (text: string | ReactElement) => void;
    warnNeedMoreResources: (card: CombatAbility) => void;
    handleAbilityUse: (args: {
        selectedIndex: number;
        side: BATTLEFIELD_SIDES;
        selectedAbility?: CombatAbility;
    }) => void;
    handleSelectCardsPrerequisite: (args: {
        selectedIndex: number;
        side: BATTLEFIELD_SIDES;
        selectedCard?: CombatAbility;
    }) => void;
}

/**
 * Arrow-key navigation of the hand and its targets, plus the E end-turn keybind.
 */
export const useKeyboardNav = ({
    hand,
    player,
    playerSide,
    enemySide,
    battle,
    depleted,
    movementAbility,
    allowMoveCardFromHandToDeck,
    disableActions,
    eventGroupsLength,
    hasSelectCardsPrompt,
    selectedHandAbilityId,
    selectedAllyId,
    warn,
    warnNeedMoreResources,
    handleAbilityUse,
    handleSelectCardsPrerequisite,
}: UseKeyboardNavArgs) => {
    const dispatch = useAppDispatch();
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

    // Whether the keyboard-highlighted card could be selected by a mouse click (unplayable/locked/resource checks)
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
        if (disableActions || eventGroupsLength || hasSelectCardsPrompt) {
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
                e.key !== "E"
            ) {
                return;
            }

            // E ends the turn
            if (e.key === "e" || e.key === "E") {
                dispatch(updateBattleState(BATTLE_STATES.TURN_END));
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
                setKeyboardNav({
                    mode: "target",
                    cardIndex: keyboardNav.cardIndex,
                    target: validTargets[nextIndex],
                });
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
        eventGroupsLength,
        hasSelectCardsPrompt,
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
