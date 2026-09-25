import { useCallback, useState } from "react";
import { EFFECT_TYPES } from "../../ability/types";
import { Combatant } from "../../character/types";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { findCombatantData, hasEffectType } from "../actions/combatantData";
import { canUsePlayerAbility, getCardByInstanceId } from "../actions/playerAbility";
import { onSummonAttack } from "../actions/phases/playerTurn";
import { useAbility } from "../actions/useAbility";
import { battleWarnings } from "../constants";
import { battleStateSlice } from "../reducer";
import { BATTLEFIELD_SIDES, CombatantInfo } from "../types";
import { isUntargetable } from "../utils";
import { shouldShowReticleForTarget } from "../view/targetHelpers";
import { BattleControls } from "./useBattleControls";
import { KeyboardNavOutput } from "./useKeyboardNav";

const { selectAlly, selectHandAbility } = battleStateSlice.actions;

export interface UseMouseControlsArgs {
    controls: BattleControls;
    keyboard: KeyboardNavOutput;
}

/**
 * Mouse interaction with the battlefield: clicking cards, allies, enemies and the deck,
 * plus hovering combatants. Clicking always takes over from keyboard navigation.
 */
export const useMouseControls = ({ controls, keyboard }: UseMouseControlsArgs) => {
    const dispatch = useAppDispatch();
    const battle = useAppSelector((state) => state.battle)!;
    const {
        playerSide,
        enemySide,
        depleted,
        isPlayerTurn,
        selectCardsPrompt,
        selectedHandAbilityId,
        selectedAllyId,
    } = battle;
    const hasSelectCardsPrompt = Boolean(selectCardsPrompt);

    const {
        player,
        hand,
        selectedAbilityFromHand,
        abilityToUse,
        selectedMinion,
        actorId,
        disableActions,
        allowMoveCardFromHandToDeck,
        allowFriendlyMovement,
        movementAbility,
        isEligibleToAttack,
        warn,
        warnNeedMoreResources,
        handleAbilityUse,
        handleSelectCardsPrerequisite,
        handleMoveCardToDeck,
    } = controls;
    const { keyboardNav, setKeyboardNav, isKeyboardTargetValid, keyboardPreviewTarget } = keyboard;

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
        handleMoveCardToDeck(selectedHandAbilityId);
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
