import React, {
    ReactElement,
    RefObject,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { createUseStyles } from "react-jss";
import * as uuid from "uuid";
import { getDamageStatistics } from "../../ability/AbilityView/DamageIcon";
import { ResourceIcon } from "../../ability/AbilityView/ResourceIcon";
import { resourceClassNameMap } from "../../ability/AbilityView/constants";
import { getAbilityColor, getAbilityUpgradedFromEffects } from "../../ability/AbilityView/utils";
import {
    ACTION_TYPES,
    Ability,
    CombatAbility,
    CombatEffect,
    EFFECT_EVENT_KEYS,
    EFFECT_TYPES,
    Effect,
    SELECT_CARD_TYPES,
    TARGET_TYPES,
} from "../../ability/types";
import CombatantView from "../../character/CombatantView";
import { getEmptyTileKey } from "../../character/getAbilityPreviews";
import { Combatant, Player } from "../../character/types";
import { useAppDispatch, useAppSelector } from "../../hooks";
import EffectGroupIcon from "../../icon/EffectGroupIcon";
import Icon from "../../icon/Icon";
import {
    ClearImage,
    ClickIndicatorImage,
    HasteImage,
    LithRegionBGImage,
    MapleLeavesImage,
} from "../../images";
import Tooltip from "../../view/Tooltip";
import { checkCardActions } from "../actions/cardActions/cardActions";
import { applyAbilityEventEffects } from "../actions/cardActions/utils";
import { findCombatantData, hasEffectType } from "../actions/combatantData";
import { onSummonAttack } from "../actions/phases/playerTurn";
import { canUsePlayerAbility, getCardByInstanceId, useHandAbility } from "../actions/playerAbility";
import { checkEventTrigger } from "../actions/statusEffect/triggerEffectEvent";
import { useAbility } from "../actions/useAbility";
import { TURN_ANNOUNCEMENT_TIME, battleWarnings } from "../constants";
import { useBattlePhase } from "../hooks/useBattlePhase";
import { battleStateSlice } from "../reducer";
import { BATTLE_STATES } from "../states";
import {
    BATTLEFIELD_SIDES,
    BattleState,
    CombatantInfo,
    EventGroup,
    PlayerSelectCardsPrompt,
} from "../types";
import { isUntargetable } from "../utils";
import AnimationCanvas from "./animation/AnimationCanvas";
import ClearOverlay from "./ClearOverlay";
import Deck from "./Deck";
import Discard from "./Discard";
import EndTurnButton from "./EndTurnButton";
import Hand from "./Hand";
import AbilityNotification from "./Notification/AbilityNotification";
import Notification from "./Notification/Notification";
import TurnAnnouncement from "./Notification/TurnNotification";
import ParticleCanvas from "./ParticleCanvas";
import SelectCardOverlay from "./SelectCardOverlay";
import TargetLineCanvas from "./TargetLineCanvas";
import WaveInfo from "./WaveInfo";
import { getAbilityUsePreviews, getTargetedByEnemyAbilities } from "./previewHelpers";
import { isTargetedForAbility, shouldShowReticleForTarget } from "./targetHelpers";
import ActionHistory from "./ActionHistory";
import { usePreloadImages } from "../../hooks/usePreloadImage";

const useStyles = createUseStyles({
    root: {
        width: "100%",
        height: "100%",
        backgroundImage: (props: { backgroundImage?: string }) =>
            `url(${props.backgroundImage || LithRegionBGImage})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        overflow: "hidden",
        color: "black",
        position: "fixed",
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    battlefieldContainer: {
        height: "70%",
        minHeight: "700px",
        display: "flex",
        flexDirection: "column",
        justifyItems: "center",
        marginTop: "100px",
        position: "relative",
    },
    actionHistoryContainer: {
        position: "absolute",
        top: 0,
        left: "-75px",
    },
    battlefield: {
        textAlign: "center",
        margin: "auto",
        width: "96%",
        minWidth: 1350,
        maxWidth: "87rem",
        height: "100%",
        position: "relative",
        background: "#f5ebcb",
        paddingTop: "10vh",
        borderRadius: "16px",
        border: "6px solid rgba(0, 0, 0, 0.25)",
        filter: "drop-shadow(2px 2px 5px rgba(0, 0, 0, 0.3))",
        "&:before": {
            content: "' '",
            backgroundImage: `url(${MapleLeavesImage})`,
            width: "100%",
            height: "100%",
            opacity: 0.04,
            display: "block",
            position: "absolute",
            left: 0,
            top: 0,
            backgroundPosition: "50% 0",
        },
    },
    waves: {
        position: "absolute",
        top: -6,
        left: -6,
    },
    combatantContainer: {
        position: "relative",
        height: "19vh",
        minHeight: "30%",
        margin: "auto",
        maxHeight: 225,
    },
    combatants: {
        display: "flex",
        margin: "auto",
        justifyContent: "space-evenly",
        gap: 24,
        maxWidth: "70rem",
        height: "100%",
    },
    divider: {
        maxHeight: "90",
        height: "8vh",
        borderBottom: "2px solid rgba(0, 0, 0, 0.1)",
        width: "95%",
        margin: "auto",
        marginBottom: "32px",
    },
    abilityContainer: {
        position: "absolute",
        left: "50%",
        transform: "translateX(-50%)",
        textAlign: "center",
        bottom: "0",
    },
    [`@media (min-height: 950px)`]: {
        abilityContainer: {
            bottom: "3.5vh",
        },
    },
    abilities: {
        display: "flex",
        margin: "auto",
        justifyContent: "space-evenly",
        marginTop: "16px",
        minHeight: "265px",
    },
    playerContainer: {
        position: "relative",
        height: "50%",
    },
    leftContainer: {
        position: "absolute",
        left: "32px",
        top: "0",
        height: "100%",
    },
    rightContainer: {
        position: "absolute",
        right: "32px",
        top: "0",
        height: "100%",
    },
    deckContainer: {
        position: "absolute",
        bottom: 90,
    },
    discardContainer: {
        position: "absolute",
        bottom: 90,
    },
    arrowContainer: {
        width: "100%",
        height: "100%",
        position: "absolute",
        left: 0,
        top: 0,
        pointerEvents: "none",
    },
    notificationContainer: {
        position: "fixed",
        left: "50%",
        top: "42%",
        transform: "translateX(-50%)",
        zIndex: 4,
    },
    abilityNotificationContainer: {
        position: "fixed",
        left: "50%",
        top: "12.5%",
        transform: "translateX(-50%)",
        zIndex: 4,
    },
    clickIndicator: {
        top: -50,
        transform: "translateX(-50%)",
        left: "50%",
        position: "absolute",
    },
    placeCardIntoDeckContainer: {
        position: "absolute",
        bottom: -75,
        left: "50%",
        transform: "translateX(-50%)",
    },
    cardsPlayedCounter: {
        background: "rgba(0, 0, 0, 0.7)",
        padding: "4px 8px",
        borderRadius: "4px",
        color: "white",
    },
});

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

const {
    updateBattleState,
    updateBattle,
    promptPlayerSelectCards,
    closePlayerSelectCardsPrompt,
    setNotification,
    selectHandAbility,
    selectAlly,
} = battleStateSlice.actions;

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
export const getPlayerSpecialMovementEffects = (player?: Player | null) => {
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

type KeyboardNav =
    | { mode: "card"; cardIndex: number }
    | {
          mode: "target";
          cardIndex: number;
          target: { side: BATTLEFIELD_SIDES; index: number };
      };

const BattlefieldContainer = ({ onWin }: { onWin?: (battle: BattleState) => void }) => {
    const dispatch = useAppDispatch();
    // This component only renders if there is a battle state.
    const battle: BattleState = useAppSelector((state) => state.battle)!;

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
        currentWaveIndex,
        waves,
        selectCardsPrompt,
        state: battleState,
        notification,
        backgroundImage,
        round,
        isTutorial,
        selectedAllyId,
        selectedHandAbilityId,
        showTurnAnnouncement,
    } = battle;
    const player: Player = playerSide.find((c: Combatant | Player | null) => c?.isPlayer) as Player;

    const allyRefs: RefObject<HTMLDivElement | null>[] = Array.from({
        length: BATTLEFIELD_SIZE,
    }).map(() => useRef(null));
    const enemyRefs: RefObject<HTMLDivElement | null>[] = Array.from({
        length: BATTLEFIELD_SIZE,
    }).map(() => useRef(null));
    const handRef = useRef({});
    const battlefieldRef: RefObject<HTMLDivElement | null> = useRef(null);
    const deckRef: RefObject<HTMLDivElement | null> = useRef(null);
    const discardRef: RefObject<HTMLDivElement | null> = useRef(null);
    const depleteRef: RefObject<HTMLDivElement | null> = useRef(null);

    const [hoveredCombatant, setHoveredCombatant] = useState<{
        side: BATTLEFIELD_SIDES;
        index: number;
        id: string | null;
    } | null>(null);
    // State for the arrow-key navigation of the hand and its targets. Reset whenever the player takes over with the mouse.
    const [keyboardNav, setKeyboardNav] = useState<KeyboardNav | null>(null);
    const classes = useStyles({ backgroundImage });

    const hand = useMemo(
        () =>
            baseHand.map((ability) =>
                getAbilityUpgradedFromEffects({ ability, combatant: player }),
            ),
        [baseHand],
    );

    const { moveCardFromHandToDeckEffects, allowFriendlyMovement } = useMemo(
        () => getPlayerSpecialMovementEffects(player),
        [player],
    );

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
    const actorId: string | undefined = actor?.id;
    const currentEventGroup: EventGroup = eventGroups[0];

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

    const noMoreMoves =
        playerSide.every((ally) => !isEligibleToAttack(ally)) &&
        (!hand.length ||
            hand.every(
                (ability: CombatAbility) =>
                    !canUsePlayerAbility(player, getCardByInstanceId(hand, ability.instanceId)),
            ));

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

    const handleAbilityClick = (e: React.MouseEvent, id: string) => {
        setKeyboardNav(null);

        if (selectCardsPrompt) {
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

    const handleSelectCardFromPrompt = () => {
        handleCancelSelectCard();
        if (selectCardsPrompt?.abilityQueued) {
            dispatch(useHandAbility(selectCardsPrompt.abilityQueued));
        }

        if (selectCardsPrompt?.selectCards?.then) {
            const sourceChain = selectCardsPrompt.source ? [selectCardsPrompt.source] : [];
            dispatch(
                checkCardActions({
                    action: selectCardsPrompt?.selectCards?.then,
                    context: { name: "Select Cards Prompt", sourceChain },
                    isAutoCast: selectCardsPrompt.isAutoCast,
                }),
            );
        }
    };

    const handleCancelSelectCard = () => {
        dispatch(closePlayerSelectCardsPrompt());
    };

    const handleAllyAttack = ({ index }: { index: number }) => {
        dispatch(onSummonAttack({ selectedIndex: index, actorId: selectedAllyId! }));
        dispatch(selectAlly(null));
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

    const handleAllyClick = (e: React.MouseEvent, index: number) => {
        setKeyboardNav(null);

        if (e.button === 2) {
            // Right click will deselect the ability
            return;
        }

        if (selectCardsPrompt) {
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

    usePreloadImages(ClearImage, playerSide, enemySide, hand, deck, discard);

    const keyboardPreviewTarget = useMemo(() => {
        if (keyboardNav?.mode !== "target") {
            return null;
        }
        const { target } = keyboardNav;
        const combatants = target.side === BATTLEFIELD_SIDES.PLAYER_SIDE ? playerSide : enemySide;
        const combatant = combatants[target.index];
        return { side: target.side, index: target.index, id: combatant?.id || null };
    }, [keyboardNav, playerSide, enemySide]);

    const isTargeted = (side: BATTLEFIELD_SIDES, i: number | null): boolean =>
        isTargetedForAbility({
            hoveredCombatant: keyboardPreviewTarget || hoveredCombatant,
            abilityToUse,
            disableActions,
            actor,
            battle,
            actorId,
            side,
            i,
        });

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

    const origination = useMemo(() => {
        if (disableActions || keyboardNav?.mode === "card") {
            return null;
        }

        const index = playerSide.findIndex(
            (combatant: Combatant | null) => combatant && combatant.id === selectedAllyId,
        );
        return allyRefs[index]?.current || handRef.current?.[selectedHandAbilityId];
    }, [disableActions, keyboardNav, selectedAllyId, selectedHandAbilityId]);

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
     * The slots a card can be played on via keyboard navigation. Applies the same validity rules as mouse selection:
     * resources, taunts, untargetable combatants, conditions, empty slots, etc.
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

    // Whether a given slot is the currently keyboard-selected target
    const isKeyboardTargetSelected = (side: BATTLEFIELD_SIDES, index: number): boolean =>
        Boolean(
            keyboardNav?.mode === "target" &&
            keyboardNav.target.side === side &&
            keyboardNav.target.index === index,
        );

    // Element that the target line should anchor to while keyboard-targeting a slot
    const keyboardTargetRef = useMemo(() => {
        if (keyboardNav?.mode !== "target") {
            return null;
        }
        const { target } = keyboardNav;
        const refs = target.side === BATTLEFIELD_SIDES.PLAYER_SIDE ? allyRefs : enemyRefs;
        return refs[target.index]?.current || null;
    }, [keyboardNav]);

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

    const showMovementAbility =
        allowFriendlyMovement &&
        selectedMinion &&
        (hoveredCombatant?.side === BATTLEFIELD_SIDES.PLAYER_SIDE ||
            !selectedMinion?.abilities?.length);
    const targetLineColor = getAbilityColor(
        selectedAbilityFromHand || (showMovementAbility && movementAbility),
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

    const selectedAbility = selectedMinion?.abilities[0] || selectedAbilityFromHand;

    const abilityPreviewData = useMemo(
        () =>
            getAbilityUsePreviews({
                selectedAbility,
                hoveredCombatant: keyboardPreviewTarget || hoveredCombatant,
                selectedMinion,
                player,
                playerSide,
                enemySide,
                battle,
                shouldShowReticle,
            }),
        [
            selectedAbility,
            keyboardPreviewTarget,
            hoveredCombatant,
            playerSide,
            enemySide,
            selectedMinion,
            player,
        ],
    );
    const { result: abilityUsePreviews, combatantStates: previewAbilityCombatants } =
        abilityPreviewData;

    const targetedByEnemyAbilities = useMemo(
        () =>
            getTargetedByEnemyAbilities({
                battle,
                enemySide,
                round,
                previewAbilityCombatants,
            }),
        [enemySide, round, previewAbilityCombatants, JSON.stringify(abilityUsePreviews)],
    );

    const animationCanvas = useMemo(
        () => (
            <AnimationCanvas
                eventGroup={eventGroups[0]}
                battlefieldRef={battlefieldRef}
                allyRefs={allyRefs}
                enemyRefs={enemyRefs}
                deckRef={deckRef}
                discardRef={discardRef}
                depleteRef={depleteRef}
            />
        ),
        [eventGroups[0]?.id],
    );

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

    // Reset keyboard navigation whenever the player can no longer act (turn ended, prompts open, etc.)
    useEffect(() => {
        if (disableActions) {
            setKeyboardNav(null);
        }
    }, [disableActions]);

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

    useEffect(() => {
        if (disableActions || eventGroups.length || selectCardsPrompt) {
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
        eventGroups.length,
        selectCardsPrompt,
        keyboardNav,
        hand,
        selectedHandAbilityId,
        selectedAllyId,
        getKeyboardValidTargets,
        handleKeyboardUseCard,
        selectHandCard,
        beginTargeting,
        canSelectCardForKeyboard,
        dispatch,
    ]);

    return (
        <TargetLineCanvas
            originationRef={origination}
            targetRef={keyboardTargetRef}
            color={targetLineColor}
        >
            <div className={classes.root}>
                {notification && (
                    <div className={classes.notificationContainer}>
                        <Notification
                            severity={notification.severity}
                            onClick={() => dispatch(setNotification(null))}
                            id={notification.id}
                        >
                            {notification.text}
                        </Notification>
                    </div>
                )}
                {currentEventGroup?.name && (
                    <div className={classes.abilityNotificationContainer}>
                        <AbilityNotification
                            id={currentEventGroup.id}
                            name={currentEventGroup.name}
                            image={currentEventGroup.image}
                        />
                    </div>
                )}

                <div
                    className={classes.battlefieldContainer}
                    onContextMenu={(e) => {
                        dispatch(selectHandAbility(null));
                        setKeyboardNav(null);
                        e.preventDefault();
                    }}
                    onMouseDown={() => {
                        dispatch(selectHandAbility(null));
                        setKeyboardNav(null);
                    }}
                >
                    <ParticleCanvas
                        eventGroup={eventGroups[0]}
                        allyRefs={allyRefs}
                        enemyRefs={enemyRefs}
                    />

                    <div className={classes.battlefield} ref={battlefieldRef}>
                        <div className={classes.actionHistoryContainer}>
                            <ActionHistory />
                        </div>
                        <div className={classes.waves}>
                            <WaveInfo
                                waves={waves}
                                currentWaveIndex={currentWaveIndex}
                                round={round}
                            />
                        </div>
                        <div className={classes.combatantContainer}>
                            <div className={classes.combatants}>
                                {(eventGroups[0]?.enemySide || enemySide).map(
                                    (enemy, i: number) => (
                                        <CombatantView
                                            combatant={enemy}
                                            isEnemy={true}
                                            onMouseDown={handleEnemyClick}
                                            isSelected={false}
                                            onMouseEnter={handleEnemyMouseEnter}
                                            onMouseLeave={handleCombatantMouseLeave}
                                            isTargeted={
                                                isTargeted(BATTLEFIELD_SIDES.ENEMY_SIDE, i) ||
                                                isKeyboardTargetSelected(
                                                    BATTLEFIELD_SIDES.ENEMY_SIDE,
                                                    i,
                                                )
                                            }
                                            key={`enemy-slot-${i}`}
                                            currentEventGroup={currentEventGroup}
                                            eventGroupQueue={eventGroups}
                                            isHighlighted={false}
                                            showReticle={shouldShowReticle(
                                                BATTLEFIELD_SIDES.ENEMY_SIDE,
                                                i,
                                            )}
                                            isHoveringCombatant={Boolean(hoveredCombatant)}
                                            previewStatUpdate={
                                                enemy?.id ? abilityUsePreviews[enemy.id] : undefined
                                            }
                                            previewTargetedBy={
                                                (enemy?.id && targetedByEnemyAbilities[enemy.id]) ||
                                                targetedByEnemyAbilities[
                                                    getEmptyTileKey(i, BATTLEFIELD_SIDES.ENEMY_SIDE)
                                                ]
                                            }
                                            enemySideRefs={enemyRefs}
                                            playerSideRefs={allyRefs}
                                            selectedAbility={abilityToUse}
                                            characterRef={enemyRefs[i]}
                                            index={i}
                                        />
                                    ),
                                )}
                            </div>
                        </div>
                        <div className={classes.divider} />
                        <div className={classes.playerContainer}>
                            <div className={classes.leftContainer}>
                                <div className={classes.cardsPlayedCounter}>
                                    Cards played:{" "}
                                    {
                                        player.abilityHistory.filter(
                                            (ability) => (ability as CombatAbility).instanceId,
                                        ).length
                                    }
                                </div>
                                <div className={classes.deckContainer}>
                                    <Deck
                                        viewDeckInOrder={player?.effects.some(
                                            (effect: Effect) => effect.viewDeckInOrder,
                                        )}
                                        onMouseDown={handleClickDeck}
                                        highlightDeck={Boolean(
                                            selectedHandAbilityId && allowMoveCardFromHandToDeck,
                                        )}
                                        deckRef={deckRef}
                                    />
                                    {allowMoveCardFromHandToDeck && (
                                        <Tooltip title="Select a card in your hand to place it onto your deck.">
                                            <span className={classes.placeCardIntoDeckContainer}>
                                                <EffectGroupIcon
                                                    effects={moveCardFromHandToDeckEffects}
                                                    owner={player}
                                                    disableTooltip={true}
                                                />
                                            </span>
                                        </Tooltip>
                                    )}
                                </div>
                            </div>
                            <div className={classes.combatantContainer}>
                                <div className={classes.combatants}>
                                    {(eventGroups[0]?.playerSide || playerSide).map((ally, i) => {
                                        return (
                                            <CombatantView
                                                combatant={ally}
                                                isEnemy={false}
                                                onMouseDown={handleAllyClick}
                                                isSelected={Boolean(
                                                    selectedAllyId && selectedAllyId === ally?.id,
                                                )}
                                                onMouseEnter={handleAllyMouseEnter}
                                                onMouseLeave={handleCombatantMouseLeave}
                                                isTargeted={
                                                    isTargeted(BATTLEFIELD_SIDES.PLAYER_SIDE, i) ||
                                                    isKeyboardTargetSelected(
                                                        BATTLEFIELD_SIDES.PLAYER_SIDE,
                                                        i,
                                                    )
                                                }
                                                isHoveringCombatant={Boolean(hoveredCombatant)}
                                                key={`ally-slot-${i}`}
                                                currentEventGroup={currentEventGroup}
                                                eventGroupQueue={eventGroups}
                                                isHighlighted={Boolean(
                                                    isPlayerTurn &&
                                                    selectedAllyId === null &&
                                                    isEligibleToAttack(ally),
                                                )}
                                                showReticle={shouldShowReticle(
                                                    BATTLEFIELD_SIDES.PLAYER_SIDE,
                                                    i,
                                                )}
                                                selectedAbility={abilityToUse}
                                                characterRef={allyRefs[i]}
                                                previewStatUpdate={
                                                    ally?.id
                                                        ? abilityUsePreviews[ally.id]
                                                        : undefined
                                                }
                                                enemySideRefs={enemyRefs}
                                                playerSideRefs={allyRefs}
                                                previewTargetedBy={
                                                    (ally?.id &&
                                                        targetedByEnemyAbilities[ally.id]) ||
                                                    targetedByEnemyAbilities[
                                                        getEmptyTileKey(
                                                            i,
                                                            BATTLEFIELD_SIDES.PLAYER_SIDE,
                                                        )
                                                    ]
                                                }
                                                index={i}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                            <div className={classes.rightContainer}>
                                {isTutorial && noMoreMoves && !disableActions && (
                                    <div className={classes.clickIndicator}>
                                        <Icon icon={ClickIndicatorImage} />
                                    </div>
                                )}
                                <EndTurnButton
                                    disabled={disableActions}
                                    highlight={noMoreMoves}
                                    onClick={() => {
                                        dispatch(updateBattleState(BATTLE_STATES.TURN_END));
                                    }}
                                />
                                <div className={classes.discardContainer}>
                                    <Discard
                                        discard={discard}
                                        depleted={depleted}
                                        discardRef={discardRef}
                                        depleteRef={depleteRef}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {animationCanvas}
                <div className={classes.abilityContainer}>
                    {!selectedAbilityFromHand && !disableActions && isTutorial && !noMoreMoves && (
                        <div className={classes.clickIndicator}>
                            Click <br />
                            <Icon icon={ClickIndicatorImage} />
                        </div>
                    )}
                    <Hand
                        className={classes.abilities}
                        hand={hand}
                        cardRefs={handRef}
                        selectedAbilityId={selectedHandAbilityId}
                        onAbilityClick={handleAbilityClick}
                        highlightIndex={keyboardNav?.cardIndex ?? null}
                    />
                </div>
                {showWaveClear && (
                    <ClearOverlay
                        labelText={
                            waves[currentWaveIndex + 1]
                                ? `Next: Wave ${currentWaveIndex + 2}`
                                : undefined
                        }
                    />
                )}
                {showTurnAnnouncement && (
                    <TurnAnnouncement
                        isPlayerTurn={isPlayerTurn}
                        duration={TURN_ANNOUNCEMENT_TIME}
                    />
                )}
                {selectCardsPrompt && !eventGroups.length && !isWinConditionTriggered && (
                    <SelectCardOverlay
                        player={player}
                        selectCardsPrompt={selectCardsPrompt}
                        hand={hand}
                        onSelect={handleSelectCardFromPrompt}
                        onCancel={handleCancelSelectCard}
                        deck={deck}
                        discard={discard}
                    />
                )}
            </div>
        </TargetLineCanvas>
    );
};

export default BattlefieldContainer;
