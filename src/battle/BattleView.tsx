import React, { useEffect, useMemo, useState } from "react";
import { createUseStyles } from "react-jss";
import uuid from "uuid";
import { Ability } from "../ability/types";
import { getAbilityColor } from "../ability/utils";
import CombatantView from "../character/CombatantView";
import { Combatant } from "../character/types";
import enemyTurn from "../enemy/enemyTurn";
import { victoria } from "../images";
import { Fury } from "../resource/ResourcesView";
import { shuffle } from "../utils";
import BattleEndOverlay from "./BattleEndOverlay";
import ClearOverlay from "./ClearOverlay";
import Deck from "./Deck";
import EndTurnButton from "./EndTurnButton";
import Hand from "./Hand";
import Notification from "./Notification";
import { applyPerTurnEffects, Event, useAllyAbility, useAttack } from "./parseAbilityActions";
import TargetLineCanvas from "./TargetLineCanvas";
import TurnAnnouncement from "./TurnNotification";
import { canUseAbility, cleanUpDeadCharacters, isValidTarget, removeEndedEffects, updateEffects, updatePlayer } from "./utils";
import WaveInfo from "./WaveInfo";

const CARDS_PER_DRAW = 5;

const useStyles = createUseStyles({
    root: {
        width: "100%",
        height: "100%",
        position: "relative",
        backgroundImage: `url(${victoria})`,
        backgroundSize: "100% 100%",
        overflow: "hidden",
    },
    battlefieldContainer: {
        height: "77%",
        display: "flex",
        flexDirection: "column",
        justifyItems: "center",
        marginTop: "4vh",
    },
    battlefield: {
        textAlign: "center",
        margin: "auto",
        width: "95%",
        maxWidth: "87rem",
        height: "100%",
        position: "relative",
        background: "#f5ebcb",
        paddingTop: "13vh",
        borderRadius: "16px",
        border: "6px solid rgba(0, 0, 0, 0.25)",
    },
    waves: {
        position: "absolute",
        top: -6,
        left: -6,
    },
    combatantContainer: {
        position: "relative",
        height: "20vh",
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

interface BattleNotification {
    id: string; // For rerendering the same message if applicable
    text: string;
    severity: "warning" | "info" | "error";
}

const TURN_ANNOUNCEMENT_TIME = 1500; // MS
const BATTLEFIELD_SIZE = 5;
const MAX_HAND_SIZE = 10;

const BattlefieldContainer = ({ waves, onBattleEnd, initialDeck, initialAllies }) => {
    const [deck, setDeck] = useState(shuffle(initialDeck));
    const [discard, setDiscard] = useState([]);
    const [hand, setHand] = useState([]);
    const [isPlayerTurn, setIsPlayerTurn] = useState(null);
    const [currentWave, setCurrentWave] = useState(-1);
    const [currentRound, setCurrentRound] = useState(0);
    const [enemies, setEnemies] = useState([]);
    const [allies, setAllies] = useState(initialAllies.slice());
    const [allyRefs] = useState(Array.from({ length: BATTLEFIELD_SIZE }).map(() => React.createRef()));
    const [enemyRefs] = useState(Array.from({ length: BATTLEFIELD_SIZE }).map(() => React.createRef()));
    const [abilityRefs] = useState(Array.from({ length: MAX_HAND_SIZE }).map(() => React.createRef()));
    const [events, setEvents] = useState([]);
    const [notification, setNotification] = useState(null) as [BattleNotification, Function];
    const [info, setInfo] = useState(null);
    const [showTurnAnnouncement, setShowTurnAnnouncement] = useState(false);
    const [showWaveClear, setShowWaveClear] = useState(false);
    const [battleEndResult, setBattleEndResult] = useState(undefined);

    const player = allies.find((ally: Combatant | null) => ally && ally.isPlayer);

    const [selectedAbilityIndex, setSelectedAbilityIndex] = useState(null);
    const [hoveredAllyIndex, setHoveredAllyIndex] = useState(null);
    const [hoveredEnemyIndex, setHoveredEnemyIndex] = useState(null);
    const [alliesAttackedThisTurn, setAlliesAttackedThisTurn] = useState([]);
    const [selectedAllyIndex, setSelectedAllyIndex] = useState(null);
    const [minionCardsInPlay, setMinionCardsInPlay] = useState([]);
    const classes = useStyles();

    const isEligibleToAttack = (ally: Combatant): boolean => {
        if (!ally || ally.isPlayer) {
            return false;
        }
        const damageFromEffects = ally.effects?.reduce((acc: number, { damage = 0 }) => acc + damage, 0);
        const totalDamage = (ally.damage || 0) + damageFromEffects;
        return totalDamage > 0 && alliesAttackedThisTurn.every((id) => id !== ally.id);
    };
    const noMoreMoves =
        allies.every((ally) => !isEligibleToAttack(ally)) && (!hand.length || hand.every((ability) => !canUseAbility(player, ability)));

    const handleAbilityClick = (e: React.ChangeEvent, i: number) => {
        e.stopPropagation(); // Prevent the click from going to the battlefield, which deselects abilities/allies
        setSelectedAllyIndex(null);
        if (!canUseAbility(player, hand[i])) {
            setNotification({
                severity: "warning",
                text: `Need more resources to use ${hand[i].name}.`,
                id: uuid.v4(),
            });
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

    const handleAbilityUse = async ({ index, selectedAbilityIndex, side }) => {
        const newHand = hand.slice();
        const [card] = newHand.splice(selectedAbilityIndex, 1);
        const { resourceCost = 0, minion, removeAfterTurn, reusable } = card as Ability;

        setSelectedAbilityIndex(null);
        if (minion) {
            setMinionCardsInPlay((prev) => [card, ...prev]);
        } else if (reusable) {
            newHand.push(card);
        } else if (!removeAfterTurn) {
            setDiscard((prev) => [card, ...prev]);
        }

        setHand(newHand);
        handleNewEvents(
            useAllyAbility({
                ability: card,
                targetIndex: index,
                enemies,
                allies: updatePlayer(
                    (player) => ({
                        resources: player.resources - resourceCost,
                    }),
                    allies
                ),
                side,
                casterId: player.id,
            })
        );
    };

    const handleNewEvents = (events: Event[]) => {
        const lastEvent = events[events.length - 1];
        if (!lastEvent) {
            return;
        }

        const getUpdated = (characters) => {
            return cleanUpDeadCharacters(characters).map((character) => {
                if (!character) {
                    return character;
                }

                const newActions = [];
                events.forEach(({ action, casterId }) => {
                    if (action && casterId === character.id) {
                        newActions.push(action);
                    }
                });
                return { ...character, turnHistory: character.turnHistory.concat(newActions) };
            });
        };

        setAllies(getUpdated(lastEvent.updatedAllies));
        setEnemies(getUpdated(lastEvent.updatedEnemies));
        setEvents(events);
    };

    const handleAllyAttack = ({ index }) => {
        const { id } = allies[selectedAllyIndex];
        setSelectedAllyIndex(null);
        setAlliesAttackedThisTurn([...alliesAttackedThisTurn, id]);
        handleNewEvents(
            useAttack({
                allies,
                enemies,
                index,
                casterId: id,
            })
        );
    };

    const handleAllyClick = (e: React.ChangeEvent, index) => {
        e.stopPropagation(); // Prevent the click from going to the battlefield, which deselects abilities/allies

        if (disableActions) {
            return;
        }
        const selectedAbility = hand[selectedAbilityIndex];
        if (selectedAbility) {
            if (showReticle("allies", index)) {
                handleAbilityUse({ index, selectedAbilityIndex, side: "allies" });
            } else {
                setSelectedAbilityIndex(null);
            }
            return;
        }

        if (index === selectedAllyIndex) {
            setSelectedAllyIndex(null);
        } else if (isEligibleToAttack(allies[index])) {
            setSelectedAllyIndex(index);
        }
    };

    const handleEnemyClick = (e: React.ChangeEvent, index) => {
        e.stopPropagation(); // Prevent the click from going to the battlefield, which deselects abilities/allies

        const selectedAbility = hand[selectedAbilityIndex];

        if (selectedAbility) {
            if (showReticle("enemies", index)) {
                handleAbilityUse({ index, selectedAbilityIndex, side: "enemies" });
            } else {
                setSelectedAbilityIndex(null);
            }
            return;
        }

        if (showReticle("enemies", index)) {
            handleAllyAttack({ index });
        } else {
            setSelectedAllyIndex(null);
        }
    };

    const handleBattlefieldClick = () => {
        setSelectedAllyIndex(null);
        setSelectedAbilityIndex(null);
    };

    const getEvent = (character) => {
        let action;
        let target;
        if (!events.length) {
            return { action, target };
        }

        const { casterId, targetSide, targetIndex } = (events[0] as Event) || {};

        // Returns the ability if the character is using it.
        if (casterId === character?.id) {
            action = events[0].action;
        }

        if (typeof targetIndex === "number" && targetSide) {
            target = (targetSide === "allies" ? allyRefs : enemyRefs)[targetIndex]?.current;
        }

        return {
            action,
            target,
        };
    };

    const drawCards = () => {
        let newDeck = deck.slice();
        let newDiscard = discard.slice();
        let newHand = hand.slice();
        for (let i = 0; i < CARDS_PER_DRAW; ++i) {
            if (!newDeck.length && newDiscard.length) {
                newDeck = shuffle(newDiscard);
                newDiscard = [];
            }

            if (newDeck.length === 0) {
                break;
            }

            const card = newDeck.shift();
            newHand = [...newHand, card];
        }

        setDeck(newDeck);
        setHand(newHand);
        setDiscard(newDiscard);
    };

    const refreshPlayerResources = (allies) => {
        return updatePlayer(
            (player) => ({
                resources:
                    Math.min(player.maxResources, player.resourcesPerTurn) +
                    player.effects.reduce((acc, { resourcesPerTurn = 0 }) => acc + resourcesPerTurn, 0),
            }),
            allies
        );
    };

    const clearTurnHistory = (character) => {
        if (!character) {
            return character;
        }

        return { ...character, turnHistory: [] };
    };

    const handlePlayerTurnStart = () => {
        const updatedEnemies = enemies.map(updateEffects);
        setEnemies(updatedEnemies);
        drawCards();
        setAlliesAttackedThisTurn([]);
        const updatedAllies = refreshPlayerResources(allies.map(clearTurnHistory));
        setAllies(updatedAllies.map(updateEffects));
        handleNewEvents(
            applyPerTurnEffects(updatedAllies, updatedEnemies).map(({ actors, targets, ...other }) => ({
                updatedAllies: actors,
                updatedEnemies: targets,
                ...other,
            }))
        );
    };

    const updateMinionsInPlay = (updatedAllies) => {
        const deadAllies = updatedAllies.filter((ally) => ally?.HP <= 0);
        const updatedMinionsInPlay = minionCardsInPlay.slice();
        const recoveredCards = [];
        deadAllies.forEach((ally) => {
            const [card] = updatedMinionsInPlay.splice(
                updatedMinionsInPlay.findIndex(({ minion }) => ally.name === minion.name),
                1
            );
            if (card) {
                recoveredCards.push(card);
            }
        });

        if (recoveredCards.length) {
            setDiscard((prev) => [...recoveredCards, ...prev]);
            setMinionCardsInPlay(updatedMinionsInPlay);
        }
    };

    useEffect(() => {
        if (!events.length) {
            return;
        }

        const updatedEvents = events.slice();
        const event = updatedEvents.shift() as Event;
        const { updatedEnemies, updatedAllies, action, casterId } = event;
        setTimeout(() => {
            const enemiesAllDead = updatedEnemies.every((enemy) => !enemy || enemy.HP <= 0);
            const playerDead = updatedAllies.find((ally) => ally?.isPlayer).HP <= 0;
            if (action) {
                if (casterId === player.id) {
                    const { addCards = [] } = action;
                    setHand([...hand, ...addCards]);
                }
            }
            if (playerDead) {
                setTimeout(() => {
                    setEvents([]);
                    setBattleEndResult("Defeat");
                }, 1000);
                return;
            }
            if (enemiesAllDead) {
                setTimeout(() => {
                    setEvents([]);
                    updateMinionsInPlay(updatedAllies);
                    setTimeout(() => {
                        nextWave(updatedAllies);
                    }, 500);
                }, 500);
                return;
            }
            if (updatedEvents.length) {
                setTimeout(() => {
                    setEvents(updatedEvents);
                }, 500);
            } else {
                setTimeout(() => {
                    setEvents([]);
                    updateMinionsInPlay(updatedAllies);
                }, 500);
            }
        }, 500);
    }, [events]);

    const nextWave = (mostRecentAllies) => {
        const nextWaveIndex = currentWave + 1;
        setCurrentWave(nextWaveIndex);
        if (!waves[nextWaveIndex]) {
            setBattleEndResult("Victory");
            return;
        }

        const setup = () => {
            setCurrentRound(0);
            const { presetDeck, description, createEnemies } = waves[nextWaveIndex];
            setEnemies(createEnemies());
            if (presetDeck) {
                setDeck(shuffle(presetDeck.slice()));
                setHand([]);
                setDiscard([]);
                mostRecentAllies = mostRecentAllies.map((ally) => (!ally || ally.isPlayer ? ally : null)); // Clean up minions
                if (isPlayerTurn) {
                    setIsPlayerTurn(null); // Hack: trigger useEffect if it is already our turn
                }
            } else {
                setDeck(deck);
                setHand(hand);
                setDiscard(discard);
            }

            setAllies(mostRecentAllies);
            setIsPlayerTurn(true);

            if (description) {
                showWaveDescription({ description, i: 0, delay: 2000 });
            }
        };

        if (nextWaveIndex > 0) {
            setShowWaveClear(true);
            setTimeout(() => {
                setShowWaveClear(false);
                setTimeout(() => {
                    setup();
                }, 500);
            }, 2000);
        } else {
            setup();
        }
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

    useEffect(() => {
        nextWave(allies);
    }, []);

    const handleEndTurn = () => {
        const updatedAllies = allies.map(removeEndedEffects);
        setAllies(updatedAllies);
        setIsPlayerTurn(false);
        setHand([]);
        const newDiscard = [...hand.filter((ability) => !ability.removeAfterTurn), ...discard];
        setDiscard(newDiscard);
    };

    useEffect(() => {
        if (currentWave === -1 || isPlayerTurn === null) {
            return;
        }
        setShowTurnAnnouncement(true);

        setTimeout(() => {
            setShowTurnAnnouncement(false);

            if (!isPlayerTurn) {
                const enemyActions = enemyTurn({ enemies: enemies.map(clearTurnHistory), allies });

                const playEnemyActions = () => {
                    const event = enemyActions.shift();
                    if (event) {
                        handleNewEvents([event]);
                    }

                    if (enemyActions.length) {
                        setTimeout(() => {
                            playEnemyActions();
                        }, 1500); // This has no way of knowing that the events have finished playing
                    } else {
                        setTimeout(() => {
                            const { winCondition } = waves[currentWave] || {};
                            if (currentRound + 1 >= winCondition?.surviveRounds) {
                                nextWave(event?.updatedAllies || allies);
                                return;
                            }

                            if (!event || event?.updatedEnemies.some((enemy) => enemy?.HP > 0)) {
                                setIsPlayerTurn(true);
                                setCurrentRound(currentRound + 1);
                            }
                        }, 2000);
                    }
                };

                playEnemyActions();
            } else {
                handlePlayerTurnStart();
            }
        }, TURN_ANNOUNCEMENT_TIME);
    }, [isPlayerTurn]);

    const disableActions =
        battleEndResult || showTurnAnnouncement || !isPlayerTurn || showWaveClear || enemies.every((enemy) => !enemy || enemy.HP <= 0);

    const isTargeted = (i: number | null, side: "allies" | "enemies"): boolean => {
        if (disableActions) {
            return false;
        }

        const ally = allies[selectedAllyIndex];
        if (ally) {
            return side === "enemies" && hoveredEnemyIndex === i;
        }

        const ability = hand[selectedAbilityIndex];
        const index = side === "allies" ? hoveredAllyIndex : hoveredEnemyIndex;
        if (!ability || index === null || !isValidTarget({ ability, side, index: i, enemies, allies })) {
            return false;
        }

        const abilityArea = ability.area || 0;
        const { actions = [] } = ability;
        const { area = abilityArea } = actions[0] || {};
        return i >= index - area && i <= index + area;
    };

    const showReticle = (side, index) => {
        if (isEligibleToAttack(allies[selectedAllyIndex])) {
            if (typeof hoveredEnemyIndex === "number") {
                return side === "enemies" && enemies[index] && index === hoveredEnemyIndex;
            }
            return side === "enemies" && enemies[index];
        }

        const ability = hand[selectedAbilityIndex];
        if (!ability) {
            return false;
        }

        const { minion } = ability;
        if (minion) {
            if (side === "allies" && !allies[index]) {
                if (typeof hoveredAllyIndex === "number") {
                    return index === hoveredAllyIndex;
                }
                return true;
            }
        }

        if (!isValidTarget({ ability, side, index, allies, enemies })) {
            return false;
        }

        if (typeof hoveredEnemyIndex === "number") {
            if (isValidTarget({ ability, side: "enemies", index: hoveredEnemyIndex, allies, enemies })) {
                return isTargeted(index, side);
            }
        }

        if (typeof hoveredAllyIndex === "number") {
            if (isValidTarget({ ability, side: "allies", index: hoveredAllyIndex, allies, enemies })) {
                return isTargeted(index, side);
            }
        }

        return true;
    };

    const origination = useMemo(() => {
        if (disableActions) {
            return null;
        }
        return allyRefs[selectedAllyIndex]?.current || abilityRefs[selectedAbilityIndex]?.current;
    }, [disableActions, selectedAllyIndex, selectedAbilityIndex]);

    const targetLineColor = getAbilityColor(hand[selectedAbilityIndex]);

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
            <TargetLineCanvas originationRef={origination} color={targetLineColor}>
                <div className={classes.battlefieldContainer}>
                    <div className={classes.battlefield} onClick={handleBattlefieldClick}>
                        <div className={classes.waves}>
                            <WaveInfo waves={waves} currentIndex={currentWave} cleared={false} />
                        </div>
                        <div className={classes.combatantContainer}>
                            <div className={classes.combatants}>
                                {(events[0]?.updatedEnemies || enemies).map((enemy, i: number) => (
                                    <CombatantView
                                        combatant={enemy}
                                        isAlly={false}
                                        onClick={(e) => handleEnemyClick(e, i)}
                                        isSelected={false}
                                        onMouseEnter={() => setHoveredEnemyIndex(i)}
                                        onMouseLeave={() => setHoveredEnemyIndex(null)}
                                        isTargeted={isTargeted(i, "enemies")}
                                        key={i}
                                        event={getEvent(enemy)}
                                        isHighlighted={false}
                                        showReticle={showReticle("enemies", i)}
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
                                    {(events[0]?.updatedAllies || allies).map((ally, i) => {
                                        return (
                                            <CombatantView
                                                combatant={ally}
                                                isAlly={true}
                                                onClick={(e) => handleAllyClick(e, i)}
                                                isSelected={selectedAllyIndex === i}
                                                onMouseEnter={() => setHoveredAllyIndex(i)}
                                                onMouseLeave={() => setHoveredAllyIndex(null)}
                                                isTargeted={isTargeted(i, "allies")}
                                                key={i}
                                                event={getEvent(ally)}
                                                isHighlighted={isPlayerTurn && selectedAllyIndex === null && isEligibleToAttack(ally)}
                                                showReticle={showReticle("allies", i)}
                                                ref={allyRefs[i]}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                            <div className={classes.rightContainer}>
                                <EndTurnButton
                                    disabled={disableActions || events.length > 0}
                                    highlight={noMoreMoves}
                                    onClick={handleEndTurn}
                                />
                            </div>
                        </div>
                    </div>
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
            {battleEndResult && <BattleEndOverlay result={battleEndResult} onClickContinue={onBattleEnd} />}
            {showWaveClear && <ClearOverlay labelText={`Next: Wave ${currentWave + 1}`} />}
            {showTurnAnnouncement && <TurnAnnouncement isPlayerTurn={isPlayerTurn} />}
        </div>
    );
};

export default BattlefieldContainer;
