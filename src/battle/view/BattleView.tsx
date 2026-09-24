import React, { RefObject, useMemo, useRef } from "react";
import { createUseStyles } from "react-jss";
import { getAbilityColor } from "../../ability/AbilityView/utils";
import { CombatAbility, Effect } from "../../ability/types";
import CombatantView from "../../character/CombatantView";
import { getEmptyTileKey } from "../../character/getAbilityPreviews";
import { Combatant } from "../../character/types";
import { useAppDispatch, useAppSelector } from "../../hooks";
import EffectGroupIcon from "../../icon/EffectGroupIcon";
import Icon from "../../icon/Icon";
import { ClearImage, ClickIndicatorImage, LithRegionBGImage, MapleLeavesImage } from "../../images";
import Tooltip from "../../view/Tooltip";
import { checkCardActions } from "../actions/cardActions/cardActions";
import { canUsePlayerAbility, getCardByInstanceId, useHandAbility } from "../actions/playerAbility";
import { TURN_ANNOUNCEMENT_TIME } from "../constants";
import { battleStateSlice } from "../reducer";
import { BATTLE_STATES } from "../states";
import { BATTLEFIELD_SIDES, BattleState, EventGroup } from "../types";
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
import { isTargetedForAbility } from "./targetHelpers";
import { useBattleControls } from "../hooks/useBattleControls";
import { useKeyboardNav } from "../hooks/useKeyboardNav";
import { useMouseControls } from "../hooks/useMouseControls";
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

const { updateBattleState, closePlayerSelectCardsPrompt, setNotification, selectHandAbility } =
    battleStateSlice.actions;

const BattlefieldContainer = ({ onWin }: { onWin?: (battle: BattleState) => void }) => {
    const dispatch = useAppDispatch();
    // This component only renders if there is a battle state.
    const battle: BattleState = useAppSelector((state) => state.battle)!;

    const {
        deck,
        discard,
        depleted,
        isPlayerTurn,
        enemySide,
        playerSide,
        eventQueue: eventGroups,
        currentWaveIndex,
        waves,
        selectCardsPrompt,
        notification,
        backgroundImage,
        round,
        isTutorial,
        selectedAllyId,
        selectedHandAbilityId,
        showTurnAnnouncement,
    } = battle;
    const currentEventGroup: EventGroup = eventGroups[0];

    const controls = useBattleControls({ battle, onWin });
    const {
        player,
        hand,
        moveCardFromHandToDeckEffects,
        allowMoveCardFromHandToDeck,
        allowFriendlyMovement,
        movementAbility,
        disableActions,
        isWinConditionTriggered,
        showWaveClear,
        selectedMinion,
        selectedAbilityFromHand,
        abilityToUse,
        actor,
        actorId,
        isEligibleToAttack,
    } = controls;

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

    const classes = useStyles({ backgroundImage });

    const noMoreMoves =
        playerSide.every((ally) => !isEligibleToAttack(ally)) &&
        (!hand.length ||
            hand.every(
                (ability: CombatAbility) =>
                    !canUsePlayerAbility(player, getCardByInstanceId(hand, ability.instanceId)),
            ));

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

    // Arrow-key navigation of the hand and its targets plus the E end-turn keybind.
    const keyboard = useKeyboardNav(controls);
    const { keyboardNav, setKeyboardNav, keyboardPreviewTarget } = keyboard;

    const {
        hoveredCombatant,
        shouldShowReticle,
        handleAbilityClick,
        handleAllyClick,
        handleEnemyClick,
        handleClickDeck,
        handleEnemyMouseEnter,
        handleAllyMouseEnter,
        handleCombatantMouseLeave,
    } = useMouseControls({ controls, keyboard });

    usePreloadImages(ClearImage, playerSide, enemySide, hand, deck, discard);

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

    const origination = useMemo(() => {
        if (disableActions || keyboardNav?.mode === "card") {
            return null;
        }

        const index = playerSide.findIndex(
            (combatant: Combatant | null) => combatant && combatant.id === selectedAllyId,
        );
        return allyRefs[index]?.current || handRef.current?.[selectedHandAbilityId];
    }, [disableActions, keyboardNav, selectedAllyId, selectedHandAbilityId]);

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

    const showMovementAbility =
        allowFriendlyMovement &&
        selectedMinion &&
        (hoveredCombatant?.side === BATTLEFIELD_SIDES.PLAYER_SIDE ||
            !selectedMinion?.abilities?.length);
    const targetLineColor = getAbilityColor(
        selectedAbilityFromHand || (showMovementAbility && movementAbility),
    );

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
