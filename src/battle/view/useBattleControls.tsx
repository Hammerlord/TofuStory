import { ReactElement, useMemo } from "react";
import * as uuid from "uuid";
import { getDamageStatistics } from "../../ability/AbilityView/DamageIcon";
import { ResourceIcon } from "../../ability/AbilityView/ResourceIcon";
import { resourceClassNameMap } from "../../ability/AbilityView/constants";
import { getAbilityUpgradedFromEffects } from "../../ability/AbilityView/utils";
import {
    ACTION_TYPES,
    Ability,
    CombatAbility,
    CombatEffect,
    SELECT_CARD_TYPES,
    TARGET_TYPES,
} from "../../ability/types";
import { Combatant, Player } from "../../character/types";
import { useAppDispatch } from "../../hooks";
import { HasteImage } from "../../images";
import { findCombatantData } from "../actions/combatantData";
import { getCardByInstanceId, useHandAbility } from "../actions/playerAbility";
import { battleWarnings } from "../constants";
import { useBattlePhase } from "../hooks/useBattlePhase";
import { battleStateSlice } from "../reducer";
import { BATTLE_STATES } from "../states";
import { BATTLEFIELD_SIDES, BattleState, PlayerSelectCardsPrompt } from "../types";

const movementAbility: Ability = {
    name: "Move",
    image: HasteImage,
    resourceCost: 0,
    actions: [
        {
            target: TARGET_TYPES.MOVE,
            type: ACTION_TYPES.MOVEMENT,
            movement: 2,
        },
    ],
};

// Look up special effects that allow the player to do extra actions on the battlefield
const getPlayerSpecialMovementEffects = (player?: Player | null) => {
    const moveCardFromHandToDeckEffects: CombatEffect[] = [];
    let allowFriendlyMovement = false;

    if (player?.effects) {
        for (const effect of player.effects as CombatEffect[]) {
            if (effect.allowMoveCardFromHandToDeck) {
                moveCardFromHandToDeckEffects.push(effect);
            }
            if (effect.allowFriendlyMovement) {
                allowFriendlyMovement = true;
            }
        }
    }

    return { moveCardFromHandToDeckEffects, allowFriendlyMovement };
};

const { setNotification, promptPlayerSelectCards } = battleStateSlice.actions;

/**
 * Derived battle data and player-command closures shared by the keyboard and mouse control
 * hooks (and BattleView's interaction rendering).
 */
export const useBattleControls = ({
    battle,
    onWin,
}: {
    battle: BattleState;
    onWin?: (battle: BattleState) => void;
}) => {
    const dispatch = useAppDispatch();

    const {
        deck,
        discard,
        depleted,
        hand: baseHand,
        isPlayerTurn,
        enemySide,
        playerSide,
        eventQueue: eventGroups,
        charactersAttackedThisTurn,
        selectCardsPrompt,
        state: battleState,
        selectedAllyId,
        selectedHandAbilityId,
    } = battle;

    const player: Player = playerSide.find((c: Combatant | Player | null) => c?.isPlayer) as Player;

    const hand = useMemo(
        () =>
            baseHand.map((ability) =>
                getAbilityUpgradedFromEffects({ ability, combatant: player }),
            ),
        [baseHand],
    );

    const { moveCardFromHandToDeckEffects, allowFriendlyMovement } =
        getPlayerSpecialMovementEffects(player);
    const allowMoveCardFromHandToDeck = moveCardFromHandToDeckEffects.length > 0;

    const { isWinConditionTriggered, showWaveClear } = useBattlePhase({ onWin });

    const disableActions: boolean = Boolean(
        !isPlayerTurn ||
        battleState !== BATTLE_STATES.TURN_IN_PROGRESS ||
        isWinConditionTriggered ||
        selectCardsPrompt,
    );
    const selectedMinion = playerSide.find(
        (combatant: Combatant | null) => selectedAllyId && combatant?.id === selectedAllyId,
    );

    const selectedAbilityFromHand = getCardByInstanceId(hand, selectedHandAbilityId);
    const abilityToUse = selectedAbilityFromHand || selectedMinion?.abilities?.[0];

    const actor = selectedMinion || player;
    const actorId = actor?.id;

    const isEligibleToAttack = (ally: Combatant | null): boolean => {
        if (
            !ally ||
            ally.isPlayer ||
            ally.HP === 0 ||
            !ally.controllable ||
            !ally.abilities?.length
        ) {
            return false;
        }

        const totalDamage =
            getDamageStatistics({
                ability: ally.abilities[0],
                actorInfo: findCombatantData(battle, ally.id)!,
                hand,
                deck,
                discard,
            })?.baseDamage || 0;
        return totalDamage > 0 && charactersAttackedThisTurn.every((id) => id !== ally.id);
    };

    const warn = (text: string | ReactElement) => {
        dispatch(
            setNotification({
                severity: "warning",
                text,
                id: uuid.v4(),
            }),
        );
    };

    const warnNeedMoreResources = (card: CombatAbility) => {
        warn(
            <div>
                Need more <ResourceIcon playerClass={player.class} />{" "}
                {resourceClassNameMap[player.class]} to use {card.name}.
            </div>,
        );
    };

    const handleAbilityUse = async ({
        selectedIndex,
        side,
        selectedAbility = selectedAbilityFromHand,
    }: {
        selectedIndex: number;
        side: BATTLEFIELD_SIDES;
        selectedAbility?: CombatAbility;
    }) => {
        if (!selectedAbility) {
            return;
        }

        dispatch(
            useHandAbility({
                selectedTargetIndex: selectedIndex,
                selectedAbility,
                selectedTargetSide: side,
            }),
        );
    };

    const handleSelectCardsPrerequisite = ({
        selectedIndex,
        side,
        selectedCard = selectedAbilityFromHand,
    }: {
        selectedIndex: number;
        side: BATTLEFIELD_SIDES;
        selectedCard?: CombatAbility;
    }) => {
        const { type } = selectedCard?.selectCards || {};

        if (hand.length <= 1) {
            if (type === SELECT_CARD_TYPES.DEPLETE_FROM_HAND) {
                warn(battleWarnings.depleteMinCardInHand);
                return;
            } else if (type === SELECT_CARD_TYPES.COPY_FROM_HAND) {
                warn(battleWarnings.minCardInHand);
                return;
            }
        }

        // Wayfind does not require a discard to benefit from the +1 extra card draw, so don't show an empty overlay in that case
        const skipOverlayTypes = [
            SELECT_CARD_TYPES.DISCARD_TO_DRAW,
            SELECT_CARD_TYPES.HAND_TO_TOP_DECK,
        ];
        if (type && skipOverlayTypes.includes(type) && hand.length === 1) {
            handleAbilityUse({ selectedIndex, side, selectedAbility: selectedCard });
            return;
        }

        dispatch(
            promptPlayerSelectCards({
                selectCards: selectedCard?.selectCards,
                abilityQueued: {
                    selectedAbilityId: selectedHandAbilityId || selectedCard?.instanceId,
                    selectedAbility: selectedCard,
                    selectedTargetSide: side,
                    selectedTargetIndex: selectedIndex,
                },
            } as PlayerSelectCardsPrompt),
        );
    };

    return {
        player,
        hand,
        movementAbility,
        allowFriendlyMovement,
        allowMoveCardFromHandToDeck,
        moveCardFromHandToDeckEffects,
        disableActions,
        isWinConditionTriggered,
        showWaveClear,
        selectedMinion,
        selectedAbilityFromHand,
        abilityToUse,
        actor,
        actorId,
        isEligibleToAttack,
        warn,
        warnNeedMoreResources,
        handleAbilityUse,
        handleSelectCardsPrerequisite,
    };
};

export type BattleControls = ReturnType<typeof useBattleControls>;
