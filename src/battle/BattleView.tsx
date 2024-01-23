import React, { MutableRefObject, useEffect, useMemo, useRef, useState } from "react";
import { createUseStyles } from "react-jss";
import uuid from "uuid";
import { getAbilityColor } from "../ability/AbilityView/utils";
import { HandAbility, SELECT_CARD_TYPES } from "../ability/types";
import CombatantView from "../character/CombatantView";
import { Combatant } from "../character/types";
import { useAppDispatch, useAppSelector } from "../hooks";
import { LithRegionBGImage, MapleLeavesImage } from "../images";
import Header from "../Menu/Header";
import { updateCombatant, useItem } from "./actions/actions";
import { endEnemyTurn, startEnemyTurn } from "./actions/enemyTurn";
import { onWaveClear, onWaveStart } from "./actions/phases";
import { onSummonAttack, onUsePlayerAbility, playerEndTurn, startPlayerTurn } from "./actions/playerTurn";
import AnimationCanvas from "./AnimationCanvas";
import ClearOverlay from "./ClearOverlay";
import { MAX_HAND_SIZE } from "./constants";
import Deck from "./Deck";
import EndTurnButton from "./EndTurnButton";
import Hand from "./Hand";
import AbilityNotification from "./Notification/AbilityNotification";
import Notification from "./Notification/Notification";
import TurnAnnouncement from "./Notification/TurnNotification";
import { BattleState, battleStateSlice, BATTLE_STATES, PlayerSelectCardsPrompt } from "./reducer";
import SelectCardOverlay from "./SelectCardOverlay";
import TargetLineCanvas from "./TargetLineCanvas";
import { BATTLEFIELD_SIDES, BattleNotification, Event } from "./types";
import { canTargetIfStealthed, canUseAbility, getEnabledEffects, isStealthed, isValidTarget, isWithinAbilityArea } from "./utils";
import WaveInfo from "./WaveInfo";
import { playerStateSlice } from "../character/playerReducer";

const useStyles = createUseStyles({
    root: {
        width: "100%",
        height: "100%",
        backgroundImage: (props: { backgroundImage: string }) => `url(${props.backgroundImage || LithRegionBGImage})`,
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
        maxHeight: 225,
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
        maxHeight: "80",
        height: "8vh",
        borderBottom: "2px solid rgba(0, 0, 0, 0.1)",
        width: "95%",
        margin: "auto",
        marginBottom: "32px",
    },
    abilityContainer: {
        position: "absolute",
        bottom: "16px",
        left: "50%",
        transform: "translateX(-50%)",
        textAlign: "center",
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
    notificationContainer: {
        position: "fixed",
        left: "50%",
        top: "42.5%",
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
});

const TURN_ANNOUNCEMENT_TIME = 2000; // MS
const BATTLEFIELD_SIZE = 5;

const { popEventQueue, updateBattleState, updateBattle, promptPlayerSelectCards, closePlayerSelectCardsPrompt } = battleStateSlice.actions;
const { updatePlayer } = playerStateSlice.actions;

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
        selectCardsPrompt,
        state: battleState,
        backgroundImage,
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
    const [showTurnAnnouncement, setShowTurnAnnouncement] = useState(false);
    const [showWaveClear, setShowWaveClear] = useState(false);
    const [selectedAbilityId, setSelectedAbilityId] = useState(null);
    const [hoveredCombatant, setHoveredCombatant] = useState(null);
    const [selectedAllyIndex, setSelectedAllyIndex] = useState(null);
    const classes = useStyles({ backgroundImage } as any);
    const { winCondition = {}, description: waveDescription } = waves[currentWaveIndex] || {};

    const isWinConditionTriggered = (() => {
        if (winCondition.defeatBoss) {
            return enemySide.every((enemy) => !enemy?.isBoss || enemy?.HP <= 0);
        }

        return enemySide.every((enemy) => !enemy || enemy.HP <= 0);
    })();

    const disableActions = !isPlayerTurn || battleState !== BATTLE_STATES.TURN_IN_PROGRESS || isWinConditionTriggered;
    const selectedMinion = playerSide[selectedAllyIndex];
    const selectedAbility = selectedMinion?.attack || hand.find(({ instanceId }) => instanceId === selectedAbilityId);
    const actor = selectedMinion || player;
    const actorIndex = playerSide.findIndex((combatant) => combatant?.id === actor?.id);

    const isEligibleToAttack = (ally: Combatant): boolean => {
        if (!ally || ally.isPlayer || ally.HP === 0) {
            return false;
        }
        const damageFromEffects = getEnabledEffects({ combatant: ally }).reduce((acc: number, { attackPower = 0 }) => acc + attackPower, 0);
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
                if (selectedAbility.selectCards) {
                    handleSelectCardsPrerequisite({ side: BATTLEFIELD_SIDES.ENEMY_SIDE, selectedIndex: index });
                    return;
                }

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
        if (selectedMinion) {
            if (shouldShowReticle(BATTLEFIELD_SIDES.ENEMY_SIDE, index)) {
                handleAllyAttack({ index });
            } else {
                setSelectedAllyIndex(null);
            }
            return;
        }

        if (selectedAbility) {
            if (shouldShowReticle(BATTLEFIELD_SIDES.ENEMY_SIDE, index)) {
                if (selectedAbility.selectCards) {
                    handleSelectCardsPrerequisite({ side: BATTLEFIELD_SIDES.ENEMY_SIDE, selectedIndex: index });
                    return;
                }

                handleAbilityUse({ selectedIndex: index, side: BATTLEFIELD_SIDES.ENEMY_SIDE });
            } else if (!canTargetIfStealthed(player, enemySide[index])) {
                warn("That character is stealthed and cannot be targeted directly.");
            } else {
                setSelectedAbilityId(null);
            }
            return;
        }
    };

    const handleBattlefieldClick = () => {
        setSelectedAllyIndex(null);
        setSelectedAbilityId(null);
    };

    const showWaveDescription = ({
        description,
        i = 0,
        delay = 2500,
    }: {
        description?: string | string[] | JSX.Element | JSX.Element[];
        i?: number;
        delay?: number;
    }) => {
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
    const battleStateRef: MutableRefObject<BATTLE_STATES | undefined> = useRef();

    useEffect(() => {
        // Preload character sprites, projectiles, etc. or they may be invisible
        // TODO this does not include minion/effect string references
        // Also next wave?
        const imagesMap = playerSide.concat(enemySide).reduce((acc, combatant) => {
            const traverseObjForImages = (obj) => {
                if (!obj) {
                    return;
                }
                Object.entries(obj).forEach(([key, value]) => {
                    // Image properties are typically named either icon or image.
                    if (["image", "icon"].includes(key) && typeof value === "string") {
                        acc[value] = true;
                    } else if (typeof value === "object") {
                        traverseObjForImages(value);
                    }
                });
            };

            traverseObjForImages(combatant);
            return acc;
        }, {});

        const imageUrls = Object.keys(imagesMap);

        imageUrls.forEach((image) => {
            const newImage = new Image();
            newImage.src = image;
            window[image] = newImage;
        });

        () => {
            imageUrls.forEach((image) => {
                delete window[image];
            });
        };
    }, []);

    useEffect(() => {
        showWaveDescription({ description: waveDescription });
    }, [currentWaveIndex]);

    const handleBattlePhase = () => {
        if (isWinConditionTriggered) {
            setShowWaveClear(true);
            setTimeout(() => {
                setShowWaveClear(false);
                dispatch(onWaveClear());
                if (waves[currentWaveIndex + 1]) {
                    dispatch(updateBattle({ isPlayerTurn: true }));
                    dispatch(updateBattleState(BATTLE_STATES.WAVE_START));
                } else {
                    dispatch(updateBattleState(BATTLE_STATES.VICTORY));
                }
            }, TURN_ANNOUNCEMENT_TIME);
        }

        // Prevent duplicate battle states from triggering consecutively
        if (battleStateRef?.current === battleState) {
            return;
        }

        battleStateRef.current = battleState;

        if (battleState === BATTLE_STATES.WAVE_START) {
            setTimeout(() => {
                dispatch(onWaveStart());
                dispatch(updateBattleState(BATTLE_STATES.TURN_START));
            }, 1000);

            return;
        }

        if (battleState === BATTLE_STATES.TURN_START) {
            setShowTurnAnnouncement(true);
            setTimeout(() => {
                setShowTurnAnnouncement(false);
                setTimeout(() => {
                    if (isPlayerTurn) {
                        dispatch(startPlayerTurn());
                    } else {
                        dispatch(startEnemyTurn());
                    }
                    dispatch(updateBattleState(BATTLE_STATES.TURN_IN_PROGRESS));
                }, 250);
            }, TURN_ANNOUNCEMENT_TIME);
            return;
        }
        if (battleState === BATTLE_STATES.TURN_END) {
            if (isPlayerTurn) {
                dispatch(playerEndTurn());
            } else {
                dispatch(endEnemyTurn());
            }

            setTimeout(() => {
                dispatch(updateBattle({ isPlayerTurn: !isPlayerTurn }));
                dispatch(updateBattleState(BATTLE_STATES.TURN_START));
            }, 1000);

            return;
        }
    };

    useEffect(() => {
        if ([BATTLE_STATES.VICTORY].includes(battleState)) {
            return;
        }

        if (!events.length) {
            eventQueueRef.current = events;
            handleBattlePhase();
            return;
        }

        const { playbackTime } = events[0];

        const prevEvents = eventQueueRef?.current as Event[];
        // Disregard pushes to the queue unless going from 0 to n events; this is to smoothen playback
        const shouldTriggerPop = (prevEvents?.length === 0 && events.length > 0) || events.length < prevEvents.length;
        if (shouldTriggerPop) {
            setTimeout(() => {
                dispatch(popEventQueue());
                // Play the next move slightly slower than the actual animation so that the animation has a bit of time to complete.
            }, playbackTime + 200);
        }
        eventQueueRef.current = events;
    }, [events, battleState]);

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
            isValidTarget({ ability: selectedAbility, side, index: hoveredIndex, enemySide, playerSide, actor, actorIndex }) &&
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
                actorIndex,
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
                    actorIndex,
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
            dispatch(updatePlayer({ items: player.items.filter((item, i) => i !== itemIndex) }));
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
                {notification && (
                    <div className={classes.notificationContainer}>
                        <Notification severity={notification.severity} onClick={() => setNotification(null)} id={notification.id}>
                            {notification.text}
                        </Notification>
                    </div>
                )}
                {events[0]?.actionParent && (
                    <div className={classes.abilityNotificationContainer}>
                        <AbilityNotification ability={events[0].actionParent} />
                    </div>
                )}
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
                                        key={enemy?.id || i}
                                        event={combatantEvent}
                                        events={events}
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
                                                key={ally?.id || i}
                                                event={combatantEvent}
                                                events={events}
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
                                        dispatch(updateBattleState(BATTLE_STATES.TURN_END));
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
                        <Hand
                            className={classes.abilities}
                            hand={hand}
                            refs={abilityRefs}
                            selectedAbilityId={selectedAbilityId}
                            onAbilityClick={handleAbilityClick}
                            player={player}
                            deck={deck}
                            discard={discard}
                        />
                    </div>
                </div>
                <Header
                    player={player}
                    deck={originalDeck}
                    onUseItem={handleUseItem}
                    onSelectWeaponSkin={(weaponSkin: string) => {
                        dispatch(
                            updateCombatant({
                                combatantId: player.id,
                                newProperties: {
                                    weapon: weaponSkin,
                                },
                            })
                        );

                        dispatch(
                            updatePlayer({
                                weapon: weaponSkin,
                            })
                        );
                    }}
                />
                {showWaveClear && (
                    <ClearOverlay labelText={waves[currentWaveIndex + 2] ? `Next: Wave ${currentWaveIndex + 2}` : undefined} />
                )}
                {showTurnAnnouncement && <TurnAnnouncement isPlayerTurn={isPlayerTurn} duration={TURN_ANNOUNCEMENT_TIME} />}
                {selectCardsPrompt && (
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
