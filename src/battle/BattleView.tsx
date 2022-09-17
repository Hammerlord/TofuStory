import React, { useEffect, useMemo, useRef, useState } from "react";
import { createUseStyles } from "react-jss";
import uuid from "uuid";
import { Action, EFFECT_TYPES } from "../ability/types";
import { getAbilityColor } from "../ability/utils";
import CombatantView from "../character/CombatantView";
import { Combatant } from "../character/types";
import { useAppDispatch, useAppSelector } from "../hooks";
import { mapleleaves, victoria } from "../images";
import Header from "../Menu/Header";
import { Fury } from "../resource/ResourcesView";
import { playerEndTurn, onSummonAttack, onUsePlayerAbility, startPlayerTurn, onWaveClear, onWaveStart } from "./actions/actions";
import { endEnemyTurn, startEnemyTurn } from "./actions/enemyTurn";
import AnimationCanvas from "./AnimationCanvas";
import ClearOverlay from "./ClearOverlay";
import Deck from "./Deck";
import EndTurnButton from "./EndTurnButton";
import Hand from "./Hand";
import Notification from "./Notification";
import { battleStateSlice } from "./reducer";
import TargetLineCanvas from "./TargetLineCanvas";
import TurnAnnouncement from "./TurnNotification";
import { BATTLEFIELD_SIDES, BattleNotification, Event } from "./types";
import { calculateActionArea, canUseAbility, isValidTarget } from "./utils";
import WaveInfo from "./WaveInfo";

const useStyles = createUseStyles({
    root: {
        width: "100%",
        height: "100%",
        position: "relative",
        backgroundImage: `url(${victoria})`,
        backgroundSize: "100% 100%",
        overflow: "hidden",
        color: "black",
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
            backgroundImage: `url(${mapleleaves})`,
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
    notificationAbility: {
        width: "24px",
        maxHeight: "24px",
        verticalAlign: "bottom",
    },
});

const TURN_ANNOUNCEMENT_TIME = 1500; // MS
const BATTLEFIELD_SIZE = 5;
const MAX_HAND_SIZE = 10;

const { popEventQueue, updateFlagTurnEnd } = battleStateSlice.actions;

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
        currentWave,
        waves,
        isEnded,
        flagTurnEnd,
    } = useAppSelector((state) => state.battle);
    const player = playerSide.find((c: Combatant | null) => c?.isPlayer);
    const allyRefs = useMemo(() => Array.from({ length: BATTLEFIELD_SIZE }).map(() => React.createRef()), []);
    const enemyRefs = useMemo(() => Array.from({ length: BATTLEFIELD_SIZE }).map(() => React.createRef()), []);
    const abilityRefs = useMemo(() => Array.from({ length: MAX_HAND_SIZE }).map(() => React.createRef()), []);
    const [notification, setNotification] = useState(null) as [BattleNotification, Function];
    const [abilityNotification, setAbilityNotification] = useState(null);
    const [info, setInfo] = useState(null);
    const [showTurnAnnouncement, setShowTurnAnnouncement] = useState(false);
    const [showWaveClear, setShowWaveClear] = useState(false);
    const [selectedAbilityIndex, setSelectedAbilityIndex] = useState(null);
    const [hoveredAllyIndex, setHoveredAllyIndex] = useState(null);
    const [hoveredEnemyIndex, setHoveredEnemyIndex] = useState(null);
    const [selectedAllyIndex, setSelectedAllyIndex] = useState(null);
    const classes = useStyles();

    const isEligibleToAttack = (ally: Combatant): boolean => {
        if (!ally || ally.isPlayer) {
            return false;
        }
        const damageFromEffects = ally.effects?.reduce((acc: number, { damage = 0 }) => acc + damage, 0);
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

    const handleAbilityClick = (e: React.ChangeEvent, i: number) => {
        e.stopPropagation(); // Prevent the click from going to the battlefield, which deselects abilities/allies
        setSelectedAllyIndex(null);
        if (!canUseAbility(player, hand[i])) {
            warn(`Need more resources to use ${hand[i].name}.`);
            return;
        }

        if (isPlayerTurn) {
            if (selectedAbilityIndex === i) {
                setSelectedAbilityIndex(null);
            } else {
                setSelectedAbilityIndex(i);
            }
        }
    };

    const handleAbilityUse = async ({ selectedIndex, side }: { selectedIndex: number; side: BATTLEFIELD_SIDES }) => {
        dispatch(onUsePlayerAbility({ selectedIndex, selectedAbilityIndex, side }) as any);
        setSelectedAbilityIndex(null);
    };

    const handleAllyAttack = ({ index }) => {
        const { id } = playerSide[selectedAllyIndex];
        dispatch(onSummonAttack({ selectedIndex: index, actorId: id }));
        setSelectedAllyIndex(null);
    };

    const handleAllyClick = (e: React.ChangeEvent, index) => {
        e.stopPropagation(); // Prevent the click from going to the battlefield, which deselects abilities/allies

        if (disableActions) {
            return;
        }
        const selectedAbility = hand[selectedAbilityIndex];
        if (selectedAbility) {
            if (shouldShowReticle(BATTLEFIELD_SIDES.PLAYER_SIDE, index)) {
                handleAbilityUse({ selectedIndex: index, side: BATTLEFIELD_SIDES.PLAYER_SIDE });
            } else {
                setSelectedAbilityIndex(null);
            }
            return;
        }

        if (index === selectedAllyIndex) {
            setSelectedAllyIndex(null);
        } else if (isEligibleToAttack(playerSide[index])) {
            setSelectedAllyIndex(index);
        }
    };

    const handleEnemyClick = (e: React.ChangeEvent, index: number) => {
        e.stopPropagation(); // Prevent the click from going to the battlefield, which deselects abilities/allies

        const selectedAbility = hand[selectedAbilityIndex];

        if (selectedAbility) {
            if (shouldShowReticle(BATTLEFIELD_SIDES.ENEMY_SIDE, index)) {
                handleAbilityUse({ selectedIndex: index, side: BATTLEFIELD_SIDES.ENEMY_SIDE });
            } else if (enemySide[index] && enemySide[index].effects.some(({ type }) => type === EFFECT_TYPES.STEALTH)) {
                warn("That character is stealthed and cannot be targeted directly.");
            } else {
                setSelectedAbilityIndex(null);
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
        setSelectedAbilityIndex(null);
    };

    const getRefFromCharacterId = (characterId) => {
        if (!characterId) {
            return;
        }
        const allyIndex = playerSide.findIndex((ally) => characterId === ally?.id);
        if (allyIndex > -1) {
            return allyRefs[allyIndex];
        }

        const enemyIndex = enemySide.findIndex((enemy) => characterId === enemy?.id);
        if (enemyIndex > -1) {
            return enemyRefs[enemyIndex];
        }
    };

    /**
     * This is used in animations...
     * @param character
     */
    const animationEvent = ((): {
        action?: Action;
        target?: any;
        eventId?: string;
        allTargets: any[];
        actor?: any;
    } => {
        let target;
        if (!events.length) {
            return { action: undefined, target: undefined, allTargets: [], actor: undefined };
        }

        const { actorId, targetSide, selectedIndex, id, action } = (events[0] as Event) || {};
        const targets = targetSide === BATTLEFIELD_SIDES.PLAYER_SIDE ? allyRefs : enemyRefs;

        if (typeof selectedIndex === "number" && targetSide) {
            target = targets[selectedIndex]?.current;
        }

        const allTargets = [];
        const area = action?.area || 0;
        for (let i = selectedIndex - area; i <= selectedIndex + area; ++i) {
            targets[i]?.current && allTargets.push(targets[i].current);
        }

        return {
            action,
            actor: getRefFromCharacterId(actorId)?.current,
            target,
            allTargets,
            eventId: id,
        };
    })();

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
        if (!events.length) {
            eventQueueRef.current = events;

            if (enemySide.every((enemy) => !enemy || enemy.HP === 0)) {
                setShowWaveClear(true);
                setTimeout(() => {
                    if (flagTurnEnd) {
                        dispatch(updateFlagTurnEnd(false));
                    }
                    setShowWaveClear(false);
                    dispatch(onWaveClear());
                    if (!waves[currentWave]) {
                        return;
                    }
                    setShowTurnAnnouncement(true);
                    setTimeout(() => {
                        setShowTurnAnnouncement(false);
                        dispatch(onWaveStart());
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

        const { ability, playbackTime } = events[0];

        if (ability) {
            setAbilityNotification({
                text: (
                    <>
                        {ability.image && <img src={ability.image} className={classes.notificationAbility} />} {ability.name}
                    </>
                ),
                id: uuid.v4(),
            });
        }

        const prevEvents = eventQueueRef?.current as Event[];
        // Disregard pushes to the queue unless going from 0 to n events; this is to smoothen playback
        const shouldTriggerPop = (prevEvents?.length === 0 && events.length > 0) || events.length < prevEvents.length;
        if (shouldTriggerPop) {
            setTimeout(() => {
                dispatch(popEventQueue());
            }, playbackTime);
        }
        eventQueueRef.current = events;
    }, [events, flagTurnEnd]);

    useEffect(() => {
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

    const disableActions = showTurnAnnouncement || !isPlayerTurn || showWaveClear || enemySide.every((enemy) => !enemy || enemy.HP <= 0);

    const isTargeted = (side: BATTLEFIELD_SIDES, i: number | null): boolean => {
        const isValidIndex = (index: any) => typeof index === "number";
        const noHover = !isValidIndex(hoveredAllyIndex) && !isValidIndex(hoveredEnemyIndex);
        const mismatchingSide =
            (isValidIndex(hoveredAllyIndex) && side === BATTLEFIELD_SIDES.ENEMY_SIDE) ||
            (isValidIndex(hoveredEnemyIndex) && side === BATTLEFIELD_SIDES.PLAYER_SIDE);
        if (disableActions || noHover || mismatchingSide) {
            return false;
        }

        if (playerSide[selectedAllyIndex]) {
            return side === BATTLEFIELD_SIDES.ENEMY_SIDE && hoveredEnemyIndex === i;
        }

        const hoveredIndex = isValidIndex(hoveredAllyIndex) ? hoveredAllyIndex : hoveredEnemyIndex;
        const ability = hand[selectedAbilityIndex];

        if (!ability || !isValidTarget({ ability, side, index: hoveredIndex, enemySide, playerSide, actor: player })) {
            return false;
        }

        const { actions = [] } = ability;
        const area = calculateActionArea({ action: actions[0], actor: player }) || ability.area || 0;
        return i >= hoveredIndex - area && i <= hoveredIndex + area;
    };

    const shouldShowReticle = (combatantSide: BATTLEFIELD_SIDES, combatantIndex: number): boolean => {
        if (isEligibleToAttack(playerSide[selectedAllyIndex])) {
            if (combatantSide === BATTLEFIELD_SIDES.ENEMY_SIDE && enemySide[combatantIndex]) {
                return typeof hoveredEnemyIndex !== "number" || combatantIndex === hoveredEnemyIndex;
            }

            return false;
        }

        const ability = hand[selectedAbilityIndex];
        if (!ability) {
            return false;
        }

        if (ability.minion) {
            if (combatantSide === BATTLEFIELD_SIDES.PLAYER_SIDE && !playerSide[combatantIndex]) {
                return typeof hoveredAllyIndex !== "number" || combatantIndex === hoveredAllyIndex;
            }
        }

        let side = combatantSide;
        let index = combatantIndex;
        if (hoveredEnemyIndex === "number") {
            side = BATTLEFIELD_SIDES.ENEMY_SIDE;
            index = hoveredEnemyIndex;
        } else if (hoveredAllyIndex === "number") {
            side = BATTLEFIELD_SIDES.PLAYER_SIDE;
            index = hoveredAllyIndex;
        }

        return isValidTarget({ ability, side, index, playerSide, enemySide, actor: player });
    };

    const origination = useMemo(() => {
        if (disableActions) {
            return null;
        }
        return allyRefs[selectedAllyIndex]?.current || abilityRefs[selectedAbilityIndex]?.current;
    }, [disableActions, selectedAllyIndex, selectedAbilityIndex]);

    const targetLineColor = getAbilityColor(hand[selectedAbilityIndex]);
    const shouldShowResourceBar = (combatant) => {
        return combatant?.abilities.some(({ resourceCost }) => resourceCost > 0);
    };

    const canUseItem = isPlayerTurn && !events.length;
    let handleUseItem;
    if (canUseItem) {
        // TODO
    }

    return (
        <div className={classes.root}>
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
            {abilityNotification && (
                <Notification onClick={() => setNotification(null)} id={abilityNotification.id} duration={1250}>
                    {abilityNotification.text}
                </Notification>
            )}
            <TargetLineCanvas originationRef={origination} color={targetLineColor}>
                <div className={classes.battlefieldContainer}>
                    <div className={classes.battlefield} onClick={handleBattlefieldClick}>
                        <div className={classes.waves}>
                            <WaveInfo waves={waves} currentWave={currentWave} cleared={false} />
                        </div>
                        <div className={classes.combatantContainer}>
                            <div className={classes.combatants}>
                                {(events[0]?.enemySide || enemySide).map((enemy, i: number) => (
                                    <CombatantView
                                        combatant={enemy}
                                        isAlly={false}
                                        onClick={(e) => handleEnemyClick(e, i)}
                                        isSelected={false}
                                        onMouseEnter={() => setHoveredEnemyIndex(i)}
                                        onMouseLeave={() => setHoveredEnemyIndex(null)}
                                        isTargeted={isTargeted(BATTLEFIELD_SIDES.ENEMY_SIDE, i)}
                                        key={i}
                                        event={enemy?.id === events[0]?.actorId ? animationEvent : undefined}
                                        isHighlighted={false}
                                        showReticle={shouldShowReticle(BATTLEFIELD_SIDES.ENEMY_SIDE, i)}
                                        ref={enemyRefs[i]}
                                        showResourceBar={shouldShowResourceBar(enemy)}
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
                                                isAlly={true}
                                                onClick={(e) => handleAllyClick(e, i)}
                                                isSelected={selectedAllyIndex === i}
                                                onMouseEnter={() => setHoveredAllyIndex(i)}
                                                onMouseLeave={() => setHoveredAllyIndex(null)}
                                                isTargeted={isTargeted(BATTLEFIELD_SIDES.PLAYER_SIDE, i)}
                                                key={i}
                                                event={ally?.id === events[0]?.actorId ? animationEvent : undefined}
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
                    <AnimationCanvas {...animationEvent} />
                    <div className={classes.abilityContainer}>
                        {Array.from({ length: player.resources }).map((_, i) => (
                            <Fury key={i} className={classes.resource} />
                        ))}
                        <Hand
                            className={classes.abilities}
                            hand={hand}
                            refs={abilityRefs}
                            isAbilitySelected={(i: number) => isPlayerTurn && selectedAbilityIndex === i}
                            onAbilityClick={handleAbilityClick}
                            player={player}
                        />
                    </div>
                </div>
            </TargetLineCanvas>
            {/** TODO Restore static deck */}
            <Header player={player} deck={[]} onUseItem={handleUseItem} />
            {showWaveClear && <ClearOverlay labelText={waves[currentWave] ? `Next: Wave ${currentWave + 1}` : undefined} />}
            {showTurnAnnouncement && <TurnAnnouncement isPlayerTurn={isPlayerTurn} />}
        </div>
    );
};

export default BattlefieldContainer;
