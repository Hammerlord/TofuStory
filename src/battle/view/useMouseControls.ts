import { ReactElement, useCallback, useState } from "react";
import { Ability, CombatAbility, EFFECT_EVENT_KEYS, EFFECT_TYPES } from "../../ability/types";
import { Combatant, Player } from "../../character/types";
import { useAppDispatch } from "../../hooks";
import { applyAbilityEventEffects } from "../actions/cardActions/utils";
import { findCombatantData, hasEffectType } from "../actions/combatantData";
import { canUsePlayerAbility, getCardByInstanceId } from "../actions/playerAbility";
import { onSummonAttack } from "../actions/phases/playerTurn";
import { checkEventTrigger } from "../actions/statusEffect/triggerEffectEvent";
import { useAbility } from "../actions/useAbility";
import { battleWarnings } from "../constants";
import { battleStateSlice } from "../reducer";
import { BATTLEFIELD_SIDES, BattleState, CombatantInfo } from "../types";
import { isUntargetable } from "../utils";
import { shouldShowReticleForTarget } from "./targetHelpers";
import { KeyboardNav } from "./useKeyboardNav";

const { selectAlly, selectHandAbility, updateBattle } = battleStateSlice.actions;

export interface UseMouseControlsArgs {
    battle: BattleState;
    player: Player;
    playerSide: (Combatant | null)[];
    enemySide: (Combatant | null)[];
    hand: CombatAbility[];
    baseHand: CombatAbility[];
    deck: CombatAbility[];
    depleted: CombatAbility[];
    selectedAbilityFromHand: CombatAbility | undefined;
    abilityToUse: CombatAbility | undefined;
    selectedMinion: Combatant | null | undefined;
    actorId: string;
    isPlayerTurn: boolean;
    disableActions: boolean;
    hasSelectCardsPrompt: boolean;
    allowMoveCardFromHandToDeck: boolean;
    allowFriendlyMovement: boolean;
    selectedHandAbilityId: string | null;
    selectedAllyId: string | null;
    movementAbility: Ability;
    isEligibleToAttack: (ally: Combatant | null) => boolean;
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
    keyboardNav: KeyboardNav | null;
    setKeyboardNav: React.Dispatch<React.SetStateAction<KeyboardNav | null>>;
    isKeyboardTargetValid: (
        card: CombatAbility,
        side: BATTLEFIELD_SIDES,
        index: number,
    ) => boolean;
    keyboardPreviewTarget: {
        side: BATTLEFIELD_SIDES;
        index: number;
        id: string | null;
    } | null;
}

/**
 * Mouse interaction with the battlefield: clicking cards, allies, enemies and the deck,
 * plus hovering combatants. Clicking always takes over from keyboard navigation.
 */
export const useMouseControls = ({
    battle,
    player,
    playerSide,
    enemySide,
    hand,
    baseHand,
    deck,
    depleted,
    selectedAbilityFromHand,
    abilityToUse,
    selectedMinion,
    actorId,
    isPlayerTurn,
    disableActions,
    hasSelectCardsPrompt,
    allowMoveCardFromHandToDeck,
    allowFriendlyMovement,
    selectedHandAbilityId,
    selectedAllyId,
    movementAbility,
    isEligibleToAttack,
    warn,
    warnNeedMoreResources,
    handleAbilityUse,
    handleSelectCardsPrerequisite,
    keyboardNav,
    setKeyboardNav,
    isKeyboardTargetValid,
    keyboardPreviewTarget,
}: UseMouseControlsArgs) => {
    const dispatch = useAppDispatch();

    const [hoveredCombatant, setHoveredCombatant] = useState<{
        side: BATTLEFIELD_SIDES;
        index: number;
        id: string | null;
    } | null>(null);

    const handleAbilityClick = (e: React.MouseEvent, id: string) => {
        setKeyboardNav(null);

        if (hasSelectCardsPrompt) {
            warn(battleWarnings.promptFinishSelecting);
            return;
        }

        if (disableActions) {
            return;
        }

        dispatch(selectAlly(null));
        const ability = getCardByInstanceId(hand, id);
        if (!ability) {
            return;
        }

        if (!allowMoveCardFromHandToDeck) {
            const isUnplayable =
                ability.unplayable && !ability.effects?.some((e) => e.bypassUnplayable);
            if (isUnplayable || ability.effects?.some((e) => e.isLocked)) {
                warn(battleWarnings.unplayable);
                return;
            }

            if (!canUsePlayerAbility(player, ability)) {
                warnNeedMoreResources(ability);
                return;
            }
        }

        if (isPlayerTurn) {
            if (selectedHandAbilityId === id) {
                dispatch(selectHandAbility(null));
            } else {
                dispatch(selectHandAbility(id));
                e.stopPropagation(); // Prevent the click from going to the battlefield, which deselects abilities/allies
            }
        }
    };

    const handleAllyAttack = ({ index }: { index: number }) => {
        dispatch(onSummonAttack({ selectedIndex: index, actorId: selectedAllyId! }));
        dispatch(selectAlly(null));
    };

    const handleAllyClick = (e: React.MouseEvent, index: number) => {
        setKeyboardNav(null);

        if (e.button === 2) {
            // Right click will deselect the ability
            return;
        }

        if (hasSelectCardsPrompt) {
            warn(battleWarnings.promptFinishSelecting);
            return;
        }

        if (disableActions) {
            return;
        }

        if (selectedAbilityFromHand) {
            if (shouldShowReticle(BATTLEFIELD_SIDES.PLAYER_SIDE, index)) {
                if (selectedAbilityFromHand.selectCards) {
                    handleSelectCardsPrerequisite({
                        side: BATTLEFIELD_SIDES.ENEMY_SIDE,
                        selectedIndex: index,
                    });
                    return;
                }

                if (
                    selectedAbilityFromHand.actions.some((action) => action.retrieveDepletedCards)
                ) {
                    if (depleted.length === 0) {
                        warn(battleWarnings.minDepleted);
                        return;
                    }
                }

                handleAbilityUse({
                    selectedIndex: index,
                    side: BATTLEFIELD_SIDES.PLAYER_SIDE,
                });
            } else {
                if (
                    selectedAbilityFromHand.unplayable ||
                    selectedAbilityFromHand.effects?.some((e) => e.isLocked)
                ) {
                    warn(battleWarnings.unplayable);
                } else if (!canUsePlayerAbility(player, selectedAbilityFromHand)) {
                    warnNeedMoreResources(selectedAbilityFromHand);
                } else if (isUntargetable(playerSide[index])) {
                    warn(battleWarnings.untargetable);
                }
                dispatch(selectHandAbility(null));
            }
            return;
        }

        if (selectedMinion) {
            if (playerSide[index] !== selectedMinion && allowFriendlyMovement) {
                dispatch(
                    useAbility({
                        ability: movementAbility,
                        selectedIndex: index,
                        side: BATTLEFIELD_SIDES.PLAYER_SIDE,
                        actorId: selectedMinion?.id || player.id,
                        context: { name: "Minion movement", sourceChain: [] },
                    }),
                );
            } else {
                dispatch(selectAlly(null));
            }
            return;
        }

        if (
            (playerSide[index] && isEligibleToAttack(playerSide[index])) ||
            (allowFriendlyMovement && playerSide[index])
        ) {
            dispatch(selectAlly(playerSide[index].id));
            e.stopPropagation(); // Prevent the click from going to the battlefield, which deselects abilities/allies
        }
    };

    const handleEnemyClick = (e: React.MouseEvent, index: number) => {
        setKeyboardNav(null);

        if (e.button === 2) {
            // Right click will deselect the ability
            e.preventDefault();
            return;
        }

        const warnTaunt = () => {
            warn(battleWarnings.targetTaunt);
        };

        const mustTargetTauntError = (index: number): boolean => {
            const tauntEnemies: CombatantInfo[] = enemySide
                .filter((combatant): combatant is Combatant => Boolean(combatant?.HP))
                .map((combatant) => findCombatantData(battle, combatant.id))
                .filter(
                    (combatantInfo: CombatantInfo | undefined): combatantInfo is CombatantInfo =>
                        hasEffectType(combatantInfo, EFFECT_TYPES.TAUNT),
                );

            if (tauntEnemies.length === 0) {
                return false;
            }
            const target = enemySide[index];
            return tauntEnemies.every((enemy) => enemy.combatant.id !== target?.id);
        };

        const target = enemySide[index];
        if (selectedMinion) {
            if (shouldShowReticle(BATTLEFIELD_SIDES.ENEMY_SIDE, index)) {
                handleAllyAttack({ index });
            } else if (mustTargetTauntError(index)) {
                warnTaunt();
                e.stopPropagation(); // Don't deselect the ability if you get a taunt warning
            } else {
                dispatch(selectAlly(null));
            }
            return;
        }

        if (selectedAbilityFromHand) {
            if (shouldShowReticle(BATTLEFIELD_SIDES.ENEMY_SIDE, index)) {
                if (selectedAbilityFromHand.selectCards) {
                    handleSelectCardsPrerequisite({
                        side: BATTLEFIELD_SIDES.ENEMY_SIDE,
                        selectedIndex: index,
                    });
                    return;
                }

                handleAbilityUse({
                    selectedIndex: index,
                    side: BATTLEFIELD_SIDES.ENEMY_SIDE,
                });
            } else if (mustTargetTauntError(index)) {
                warnTaunt();
                e.stopPropagation(); // Don't deselect the ability if you get a taunt warning
            } else {
                if (!canUsePlayerAbility(player, selectedAbilityFromHand)) {
                    warnNeedMoreResources(selectedAbilityFromHand);
                }
                dispatch(selectHandAbility(null));
            }
            return;
        }
    };

    /**
     * When selecting an ability, if a reticle should appear on a combatant, it means that combatant is a valid target.
     */
    const shouldShowReticle = useCallback(
        (combatantSide: BATTLEFIELD_SIDES, combatantIndex: number): boolean =>
            shouldShowReticleForTarget({
                selectedAbilityFromHand,
                player,
                selectedMinion,
                allowFriendlyMovement,
                movementAbility,
                hoveredCombatant: keyboardPreviewTarget || hoveredCombatant,
                abilityToUse,
                battle,
                actorId,
                combatantSide,
                combatantIndex,
            }),
        [
            selectedMinion,
            selectedAbilityFromHand,
            allowFriendlyMovement,
            movementAbility,
            keyboardPreviewTarget,
            hoveredCombatant,
            abilityToUse,
            battle,
            actorId,
            player,
        ],
    );

    const handleClickDeck = () => {
        if (!selectedHandAbilityId || !allowMoveCardFromHandToDeck) {
            return;
        }

        dispatch(selectHandAbility(null));

        const newHand = baseHand.slice();
        const newDeck = deck.slice();
        const cardIndex = newHand.findIndex(
            ({ instanceId }) => instanceId === selectedHandAbilityId,
        );
        const [card] = newHand.splice(cardIndex, 1);
        if (card) {
            newDeck.unshift(
                applyAbilityEventEffects({
                    event: card.onLeaveHand,
                    ability: card,
                    battle,
                    player,
                }),
            );
        }

        dispatch(
            updateBattle({
                hand: newHand,
                deck: newDeck,
            }),
        );

        dispatch(
            checkEventTrigger({
                combatantId: player.id,
                effectEventKey: EFFECT_EVENT_KEYS.onMoveCardFromHandToDeck,
                context: { name: "Move Card To Deck" },
            }),
        );
    };

    const handleCombatantMouseEnter = useCallback(
        (side: BATTLEFIELD_SIDES, combatant: Combatant | null | undefined, i: number) => {
            setHoveredCombatant({
                side,
                index: i,
                id: combatant?.id || null,
            });

            if (keyboardNav?.mode === "target") {
                const card = hand[keyboardNav.cardIndex];
                if (card && isKeyboardTargetValid(card, side, i)) {
                    setKeyboardNav(null);
                }
            }
        },
        [keyboardNav, hand, isKeyboardTargetValid],
    );

    const handleEnemyMouseEnter = useCallback(
        (combatant: Combatant | null | undefined, i: number) =>
            handleCombatantMouseEnter(BATTLEFIELD_SIDES.ENEMY_SIDE, combatant, i),
        [handleCombatantMouseEnter],
    );

    const handleAllyMouseEnter = useCallback(
        (combatant: Combatant | null | undefined, i: number) =>
            handleCombatantMouseEnter(BATTLEFIELD_SIDES.PLAYER_SIDE, combatant, i),
        [handleCombatantMouseEnter],
    );

    const handleCombatantMouseLeave = useCallback(() => {
        setHoveredCombatant(null);
    }, []);

    return {
        hoveredCombatant,
        shouldShowReticle,
        handleAbilityClick,
        handleAllyClick,
        handleEnemyClick,
        handleClickDeck,
        handleEnemyMouseEnter,
        handleAllyMouseEnter,
        handleCombatantMouseLeave,
    };
};

export default useMouseControls;