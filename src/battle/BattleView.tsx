import React, { useEffect, useMemo, useRef, useState } from "react";
import { createUseStyles } from "react-jss";
import uuid from "uuid";
import { HandAbility, SELECT_CARD_TYPES } from "../ability/types";
import { getAbilityColor } from "../ability/utils";
import CombatantView from "../character/CombatantView";
import { Combatant } from "../character/types";
import { useAppDispatch, useAppSelector } from "../hooks";
import { LithRegionBGImage, MapleLeavesImage } from "../images";
import Header from "../Menu/Header";
import { Fury } from "../resource/ResourcesView";
import { onWaveClear, onWaveStart, useItem } from "./actions/actions";
import { endEnemyTurn, startEnemyTurn } from "./actions/enemyTurn";
import { onSummonAttack, onUsePlayerAbility, playerEndTurn, startPlayerTurn } from "./actions/playerTurn";
import AnimationCanvas from "./AnimationCanvas";
import ClearOverlay from "./ClearOverlay";
import Deck from "./Deck";
import EndTurnButton from "./EndTurnButton";
import Hand from "./Hand";
import AbilityNotification from "./Notification/AbilityNotification";
import Notification from "./Notification/Notification";
import TurnAnnouncement from "./Notification/TurnNotification";
import { BattleState, battleStateSlice, PlayerSelectCardsPrompt } from "./reducer";
import SelectCardOverlay from "./SelectCardOverlay";
import TargetLineCanvas from "./TargetLineCanvas";
import { BATTLEFIELD_SIDES, BattleNotification, Event } from "./types";
import { canUseAbility, getEnabledEffects, isStealthed, isValidTarget, isWithinAbilityArea } from "./utils";
import WaveInfo from "./WaveInfo";

const useStyles = createUseStyles({
    root: {
        width: "100%",
        height: "100%",
        backgroundImage: `url(${LithRegionBGImage})`,
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
        height: "69%",
        display: "flex",
        flexDirection: "column",
        justifyItems: "center",
        marginTop: "9vh",
    },
    battlefield: {
        textAlign: "center",
        margin: "auto",
        width: "95%",
        maxWidth: "87rem",
        height: "100%",
        position: "relative",
        background: "#f5ebcb",
        paddingTop: "10vh",
        borderRadius: "16px",
        border: "6px solid rgba(0, 0, 0, 0.25)",

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
        width: "90%",
        maxWidth: "60rem",
        margin: "auto",
    },
    combatants: {
        display: "flex",
        margin: "auto",
        justifyContent: "space-evenly",
        position: "absolute",
        bottom: 0,
        width: "100%",
        height: "100%",
    },
    divider: {
        paddingTop: "32px",
        borderBottom: "1px solid rgba(0, 0, 0, 0.15)",
        marginBottom: "32px",
    },
    abilityContainer: {
        position: "absolute",
        bottom: "16px",
        left: "50%",
        transform: "translateX(-50%)",
        textAlign: "center",
    },
    resource: {
        margin: "0 1px",
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
    },
    rightContainer: {
        position: "absolute",
        right: "32px",
        top: "0",
    },
    arrowContainer: {
        width: "100%",
        height: "100%",
        position: "absolute",
        left: 0,
        top: 0,
        pointerEvents: "none",
    },
});

const TURN_ANNOUNCEMENT_TIME = 1500; // MS
const BATTLEFIELD_SIZE = 5;
const MAX_HAND_SIZE = 10;

const { popEventQueue, updateFlagTurnEnd, updateBattle, promptPlayerSelectCards, closePlayerSelectCardsPrompt } = battleStateSlice.actions;

const BattlefieldContainer = () => {
    const dispatch = useAppDispatch();
    const {
        deck,
        discard,
        hand,
        isPlayerTurn,
        enemySide,
        playerSide,
        eventQueue: events,
        charactersAttackedThisTurn,
        currentWaveIndex,
        waves,
        round,
        flagTurnEnd,
        selectCardsPrompt,
        isEnded,
        isLost,
    }: BattleState = useAppSelector((state) => state.battle);
    const originalDeck = useAppSelector((state) => state.character?.deck || []);
    const player = playerSide.find((c: Combatant | null) => c?.isPlayer);
    const allyRefs: React.RefObject<HTMLElement>[] = useMemo(
        () => Array.from({ length: BATTLEFIELD_SIZE }).map(() => React.createRef()),
        []
    );
    const enemyRefs: React.RefObject<HTMLElement>[] = useMemo(
        () => Array.from({ length: BATTLEFIELD_SIZE }).map(() => React.createRef()),
        []
    );
    const abilityRefs = useMemo(() => Array.from({ length: MAX_HAND_SIZE }).map(() => React.createRef()), []);
    const [notification, setNotification] = useState(null) as [BattleNotification, Function];
    const [info, setInfo] = useState(null);
    const [showTurnAnnouncement, setShowTurnAnnouncement] = useState(false);
    const [showWaveClear, setShowWaveClear] = useState(false);
    const [selectedAbilityId, setSelectedAbilityId] = useState(null);
    const [hoveredCombatant, setHoveredCombatant] = useState(null);
    const [selectedAllyIndex, setSelectedAllyIndex] = useState(null);
    const classes = useStyles();

    const isWinConditionTriggered = (() => {
        const { winCondition = {} } = waves[currentWaveIndex] || {};
        if (winCondition.surviveRounds) {
            return round > winCondition.surviveRounds;
        }

        if (winCondition.defeatBoss) {
            return enemySide.every((enemy) => !enemy?.isBoss || enemy?.HP <= 0);
        }

        return enemySide.every((enemy) => !enemy || enemy.HP <= 0);
    })();
    const disableActions = showTurnAnnouncement || flagTurnEnd || !isPlayerTurn || showWaveClear || isWinConditionTriggered;
    const selectedMinion = playerSide[selectedAllyIndex];
    const selectedAbility = selectedMinion?.attack || hand.find(({ instanceId }) => instanceId === selectedAbilityId);
    const actor = selectedMinion || player;

    const isEligibleToAttack = (ally: Combatant): boolean => {
        if (!ally || ally.isPlayer || ally.HP === 0) {
            return false;
        }
        const damageFromEffects = getEnabledEffects(ally).reduce((acc: number, { attackPower = 0 }) => acc + attackPower, 0);
        const totalDamage = (ally.damage || 0) + damageFromEffects;
        return totalDamage > 0 && charactersAttackedThisTurn.every((id) => id !== ally.id);
    };
    const noMoreMoves =
        playerSide.every((ally) => !isEligibleToAttack(ally)) && (!hand.length || hand.every((ability) => !canUseAbility(player, ability)));

    const warn = (text: string) => {
        setNotification({
            severity: "warning",
            text,
            id: uuid.v4(),
        });
    };

    const handleAbilityClick = (e: React.ChangeEvent, id: string) => {
        setSelectedAllyIndex(null);
        const ability = hand.find((card: HandAbility) => card.instanceId === id);
        if (!canUseAbility(player, ability)) {
            warn(`Need more resources to use ${ability.name}.`);
            return;
        }

        if (isPlayerTurn) {
            if (selectedAbilityId === id) {
                setSelectedAbilityId(null);
            } else {
                setSelectedAbilityId(id);
                e.stopPropagation(); // Prevent the click from going to the battlefield, which deselects abilities/allies
            }
        }
    };

    const handleAbilityUse = async ({ selectedIndex, side }: { selectedIndex: number; side: BATTLEFIELD_SIDES }) => {
        setSelectedAbilityId(null);
        dispatch(onUsePlayerAbility({ selectedTargetIndex: selectedIndex, selectedAbilityId, selectedTargetSide: side }) as any);
    };

    const handleSelectCardFromPrompt = ({ updatedHand }: { updatedHand: HandAbility[] }) => {
        dispatch(
            updateBattle({
                hand: updatedHand,
            })
        );
        handleCancelSelectCard();
        if (selectCardsPrompt.abilityQueued) {
            dispatch(onUsePlayerAbility(selectCardsPrompt.abilityQueued));
        }
    };

    const handleCancelSelectCard = () => {
        dispatch(closePlayerSelectCardsPrompt());
    };

    const handleAllyAttack = ({ index }) => {
        const { id } = playerSide[selectedAllyIndex];
        dispatch(onSummonAttack({ selectedIndex: index, actorId: id }));
        setSelectedAllyIndex(null);
    };

    const handleSelectCardsPrerequisite = ({ selectedIndex, side }: { selectedIndex: number; side: BATTLEFIELD_SIDES }) => {
        if (selectedAbility.selectCards.type === SELECT_CARD_TYPES.DEPLETE_FROM_HAND) {
            if (hand.length <= 1) {
                warn("That ability requires at least one other card in your hand to deplete");
                return;
            }
        }

        dispatch(
            promptPlayerSelectCards({
                selectCards: selectedAbility.selectCards,
                abilityQueued: { selectedAbilityId, selectedTargetSide: side, selectedTargetIndex: selectedIndex },
            } as PlayerSelectCardsPrompt)
        );
    };

    const handleAllyClick = (e: React.ChangeEvent, index) => {
        if (disableActions) {
            return;
        }
        if (selectedAbility) {
            if (shouldShowReticle(BATTLEFIELD_SIDES.PLAYER_SIDE, index)) {
                handleAbilityUse({ selectedIndex: index, side: BATTLEFIELD_SIDES.PLAYER_SIDE });
            } else {
                setSelectedAbilityId(null);
            }
            return;
        }

        if (typeof selectedAllyIndex === "number") {
            setSelectedAllyIndex(null);
        } else if (isEligibleToAttack(playerSide[index])) {
            setSelectedAllyIndex(index);
            e.stopPropagation(); // Prevent the click from going to the battlefield, which deselects abilities/allies
        }
    };

    const handleEnemyClick = (e: React.ChangeEvent, index: number) => {
        if (selectedAbility) {
            if (shouldShowReticle(BATTLEFIELD_SIDES.ENEMY_SIDE, index)) {
                if (selectedAbility.selectCards) {
                    handleSelectCardsPrerequisite({ side: BATTLEFIELD_SIDES.ENEMY_SIDE, selectedIndex: index });
                    return;
                }

                handleAbilityUse({ selectedIndex: index, side: BATTLEFIELD_SIDES.ENEMY_SIDE });
            } else if (isStealthed(enemySide[index])) {
                warn("That character is stealthed and cannot be targeted directly.");
            } else {
                setSelectedAbilityId(null);
            }
            return;
        }

        if (shouldShowReticle(BATTLEFIELD_SIDES.ENEMY_SIDE, index)) {
            handleAllyAttack({ index });
        } else {
            setSelectedAllyIndex(null);
        }
    };

    const handleBattlefieldClick = () => {
        setSelectedAllyIndex(null);
        setSelectedAbilityId(null);
    };

    const showWaveDescription = ({ description, i = 0, delay }: { description?: string | string[]; i?: number; delay: number }) => {
        setTimeout(() => {
            setNotification({
                text: Array.isArray(description) ? description[i] : description,
                id: uuid.v4(),
            });
            if (Array.isArray(description) && description[i + 1]) {
                showWaveDescription({ description, i: i + 1, delay: 7500 });
            }
        }, delay);
    };

    const eventQueueRef = useRef([]);

    useEffect(() => {
        if (isEnded) {
            return;
        }
        if (!events.length) {
            eventQueueRef.current = events;

            if (isWinConditionTriggered) {
                setShowWaveClear(true);
                setTimeout(() => {
                    if (flagTurnEnd) {
                        dispatch(updateFlagTurnEnd(false));
                    }
                    setShowWaveClear(false);
                    dispatch(onWaveClear());
                    if (!waves[currentWaveIndex + 1]) {
                        return;
                    }
                    setShowTurnAnnouncement(true);
                    setTimeout(() => {
                        setShowTurnAnnouncement(false);
                        dispatch(onWaveStart());
                        dispatch(startPlayerTurn());
                    }, TURN_ANNOUNCEMENT_TIME);
                }, TURN_ANNOUNCEMENT_TIME);
                return;
            }

            if (flagTurnEnd) {
                dispatch(updateFlagTurnEnd(false));
                if (isPlayerTurn) {
                    dispatch(playerEndTurn());
                } else {
                    dispatch(endEnemyTurn());
                }
            }
            return;
        }

        const { playbackTime } = events[0];

        const prevEvents = eventQueueRef?.current as Event[];
        // Disregard pushes to the queue unless going from 0 to n events; this is to smoothen playback
        const shouldTriggerPop = (prevEvents?.length === 0 && events.length > 0) || events.length < prevEvents.length;
        if (shouldTriggerPop) {
            // Play the next move slightly slower than the actual animation so that the animation has a bit of time to complete.
            const delay = 100;
            setTimeout(() => {
                dispatch(popEventQueue());
            }, playbackTime + delay);
        }
        eventQueueRef.current = events;
    }, [events, flagTurnEnd]);

    useEffect(() => {
        if (isEnded || isLost) {
            return;
        }
        setShowTurnAnnouncement(true);
        setTimeout(() => {
            setShowTurnAnnouncement(false);
            if (isPlayerTurn) {
                dispatch(startPlayerTurn());
            } else {
                setTimeout(() => {
                    dispatch(startEnemyTurn());
                }, 500);
            }
        }, TURN_ANNOUNCEMENT_TIME);
    }, [isPlayerTurn]);

    const isTargeted = (side: BATTLEFIELD_SIDES, i: number | null): boolean => {
        const isValidIndex = (index: any) => typeof index === "number";
        const noHover = !isValidIndex(hoveredCombatant?.index);
        const mismatchingSide = side !== hoveredCombatant?.side;
        if (disableActions || noHover || mismatchingSide) {
            return false;
        }

        const hoveredIndex = hoveredCombatant?.index;

        return (
            selectedAbility &&
            isValidTarget({ ability: selectedAbility, side, index: hoveredIndex, enemySide, playerSide, actor }) &&
            isWithinAbilityArea({ ability: selectedAbility, actor, selectedIndex: hoveredIndex, targetIndex: i })
        );
    };

    const shouldShowReticle = (combatantSide: BATTLEFIELD_SIDES, combatantIndex: number): boolean => {
        if (!selectedAbility) {
            return false;
        }

        if (
            isValidTarget({
                ability: selectedAbility,
                side: combatantSide,
                index: combatantIndex,
                playerSide,
                enemySide,
                actor,
            })
        ) {
            if (
                !hoveredCombatant ||
                !isValidTarget({
                    ability: selectedAbility,
                    side: hoveredCombatant.side,
                    index: hoveredCombatant.index,
                    playerSide,
                    enemySide,
                    actor,
                })
            ) {
                return true;
            }

            return isWithinAbilityArea({
                ability: selectedAbility,
                actor,
                selectedIndex: hoveredCombatant?.index,
                targetIndex: combatantIndex,
            });
        }

        return false;
    };

    const abilityIndex = hand.findIndex(({ instanceId }) => selectedAbilityId === instanceId);

    const origination = useMemo(() => {
        if (disableActions) {
            return null;
        }
        return allyRefs[selectedAllyIndex]?.current || abilityRefs[abilityIndex]?.current;
    }, [disableActions, selectedAllyIndex, selectedAbilityId]);

    const targetLineColor = getAbilityColor(hand[abilityIndex]);

    let handleUseItem;
    if (isPlayerTurn && player?.HP > 0) {
        handleUseItem = (itemIndex: number) => {
            dispatch(useItem({ itemIndex, actorId: player.id }));
        };
    }

    const { targetSide, selectedIndex } = (events[0] as Event) || {};
    const targets = targetSide === BATTLEFIELD_SIDES.PLAYER_SIDE ? allyRefs : enemyRefs;

    const combatantEvent = {
        ...events[0],
        // targetRef is used for weapon positioning
        targetRef: targets[selectedIndex]?.current,
    };

    return (
        <TargetLineCanvas originationRef={origination} color={targetLineColor}>
            <div className={classes.root} onClick={handleBattlefieldClick}>
                {info && (
                    <Notification onClick={() => setInfo(null)} id={info.id}>
                        {info.text}
                    </Notification>
                )}
                {notification && (
                    <Notification severity={notification.severity} onClick={() => setNotification(null)} id={notification.id}>
                        {notification.text}
                    </Notification>
                )}
                {events[0]?.actionParent && <AbilityNotification ability={events[0].actionParent} />}
                <div className={classes.battlefieldContainer}>
                    <div className={classes.battlefield}>
                        <div className={classes.waves}>
                            <WaveInfo waves={waves} currentWaveIndex={currentWaveIndex} cleared={false} />
                        </div>
                        <div className={classes.combatantContainer}>
                            <div className={classes.combatants}>
                                {(events[0]?.enemySide || enemySide).map((enemy, i: number) => (
                                    <CombatantView
                                        combatant={enemy}
                                        onClick={(e) => handleEnemyClick(e, i)}
                                        isSelected={false}
                                        onMouseEnter={() => setHoveredCombatant({ side: BATTLEFIELD_SIDES.ENEMY_SIDE, index: i })}
                                        onMouseLeave={() => setHoveredCombatant(null)}
                                        isTargeted={isTargeted(BATTLEFIELD_SIDES.ENEMY_SIDE, i)}
                                        key={i}
                                        event={enemy?.id === events[0]?.actorId ? combatantEvent : undefined}
                                        isHighlighted={false}
                                        showReticle={shouldShowReticle(BATTLEFIELD_SIDES.ENEMY_SIDE, i)}
                                        ref={enemyRefs[i]}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className={classes.divider} />
                        <div className={classes.playerContainer}>
                            <div className={classes.leftContainer}>
                                <Deck deck={deck} discard={discard} />
                            </div>
                            <div className={classes.combatantContainer}>
                                <div className={classes.combatants}>
                                    {(events[0]?.playerSide || playerSide).map((ally, i) => {
                                        return (
                                            <CombatantView
                                                combatant={ally}
                                                onClick={(e) => handleAllyClick(e, i)}
                                                isSelected={selectedAllyIndex === i}
                                                onMouseEnter={() => setHoveredCombatant({ side: BATTLEFIELD_SIDES.PLAYER_SIDE, index: i })}
                                                onMouseLeave={() => setHoveredCombatant(null)}
                                                isTargeted={isTargeted(BATTLEFIELD_SIDES.PLAYER_SIDE, i)}
                                                key={i}
                                                event={ally?.id === events[0]?.actorId ? combatantEvent : undefined}
                                                isHighlighted={isPlayerTurn && selectedAllyIndex === null && isEligibleToAttack(ally)}
                                                showReticle={shouldShowReticle(BATTLEFIELD_SIDES.PLAYER_SIDE, i)}
                                                ref={allyRefs[i]}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                            <div className={classes.rightContainer}>
                                <EndTurnButton
                                    disabled={disableActions}
                                    highlight={noMoreMoves}
                                    onClick={() => {
                                        dispatch(updateFlagTurnEnd(true));
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                    <AnimationCanvas
                        event={events[0]}
                        allyRefs={allyRefs}
                        enemyRefs={enemyRefs}
                        initialBattlefield={{ playerSide, enemySide }}
                    />
                    <div className={classes.abilityContainer}>
                        {Array.from({ length: player.resources }).map((_, i) => (
                            <Fury key={i} className={classes.resource} />
                        ))}
                        <Hand
                            className={classes.abilities}
                            hand={hand}
                            refs={abilityRefs}
                            selectedAbilityId={selectedAbilityId}
                            onAbilityClick={handleAbilityClick}
                            player={player}
                        />
                    </div>
                </div>
                <Header player={player} deck={originalDeck} onUseItem={handleUseItem} />
                {showWaveClear && (
                    <ClearOverlay labelText={waves[currentWaveIndex + 2] ? `Next: Wave ${currentWaveIndex + 2}` : undefined} />
                )}
                {showTurnAnnouncement && <TurnAnnouncement isPlayerTurn={isPlayerTurn} />}
                {selectCardsPrompt && (
                    <SelectCardOverlay
                        player={player}
                        selectCardsPrompt={selectCardsPrompt}
                        hand={hand}
                        onSelect={handleSelectCardFromPrompt}
                        onCancel={handleCancelSelectCard}
                    />
                )}
            </div>
        </TargetLineCanvas>
    );
};

export default BattlefieldContainer;
