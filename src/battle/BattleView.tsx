import { compose } from "ramda";
import React, { useEffect, useMemo, useState } from "react";
import { createUseStyles } from "react-jss";
import uuid from "uuid";
import { Ability, Action, ACTION_TYPES, Effect, EFFECT_TYPES, HandAbility } from "../ability/types";
import { getAbilityColor } from "../ability/utils";
import CombatantView from "../character/CombatantView";
import { Combatant } from "../character/types";
import createCombatant from "../enemy/createEnemy";
import enemyTurn from "../enemy/enemyTurn";
import { mapleleaves, victoria } from "../images";
import { Item } from "../item/types";
import Header from "../Menu/Header";
import { Wave } from "../Menu/tutorial";
import { Fury } from "../resource/ResourcesView";
import { shuffle } from "../utils";
import ClearOverlay from "./ClearOverlay";
import Deck from "./Deck";
import triggerDoTDamage from "./dotDamage";
import EndTurnButton from "./EndTurnButton";
import Hand from "./Hand";
import Notification from "./Notification";
import { applyPerTurnEffects, calculateActionArea, parseAction, procKOEvents, useAllyAbility, useAttack } from "./parseAbilityActions";
import TargetLineCanvas from "./TargetLineCanvas";
import TurnAnnouncement from "./TurnNotification";
import { BATTLEFIELD_SIDES, BattleNotification, Event } from "./types";
import {
    canUseAbility,
    checkHalveArmor,
    clearTurnHistory,
    isValidTarget,
    refreshPlayerResources,
    removeEndedEffects,
    tickDownBuffs,
    tickDownDebuffs,
    triggerWaveClearEffects,
    updateCardEffects,
    updateCharacters,
} from "./utils";
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

const BattlefieldContainer = ({ waves, onBattleWon, initialDeck, player, updatePlayer, rewards }) => {
    const [deck, setDeck] = useState(shuffle(initialDeck));
    const [discard, setDiscard] = useState([]);
    const [hand, setHand] = useState([]);
    const [isPlayerTurn, setIsPlayerTurn] = useState(null);
    const [currentWave, setCurrentWave] = useState(-1);
    const [currentRound, setCurrentRound] = useState(0);
    const [enemies, setEnemies] = useState([]);
    const [allies, setAllies] = useState([null, null, player, null, null]);
    const [allyRefs] = useState(Array.from({ length: BATTLEFIELD_SIZE }).map(() => React.createRef()));
    const [enemyRefs] = useState(Array.from({ length: BATTLEFIELD_SIZE }).map(() => React.createRef()));
    const [abilityRefs] = useState(Array.from({ length: MAX_HAND_SIZE }).map(() => React.createRef()));
    const [events, setEvents] = useState([]);
    const [eventGroups, setEventGroups] = useState([]);
    const [actionQueue, setActionQueue] = useState([]);
    const [notification, setNotification] = useState(null) as [BattleNotification, Function];
    const [abilityNotification, setAbilityNotification] = useState(null);
    const [info, setInfo] = useState(null);
    const [showTurnAnnouncement, setShowTurnAnnouncement] = useState(false);
    const [showWaveClear, setShowWaveClear] = useState(false);
    const [flagTurnEnd, setFlagTurnEnd] = useState(false);
    const [selectedAbilityIndex, setSelectedAbilityIndex] = useState(null);
    const [hoveredAllyIndex, setHoveredAllyIndex] = useState(null);
    const [hoveredEnemyIndex, setHoveredEnemyIndex] = useState(null);
    const [alliesAttackedThisTurn, setAlliesAttackedThisTurn] = useState([]);
    const [selectedAllyIndex, setSelectedAllyIndex] = useState(null);
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
        const newHand = hand.slice();
        const [card] = newHand.splice(selectedAbilityIndex, 1);
        const { resourceCost = 0, removeAfterTurn, reusable, depletedOnUse, effects = {} } = card as HandAbility;
        const totalResourceCost = Math.max(0, resourceCost + (effects.resourceCost || 0));

        setSelectedAbilityIndex(null);
        if (reusable) {
            newHand.push({
                ...card,
                effects: {},
            });
        } else if (!removeAfterTurn && !depletedOnUse) {
            setDiscard((prev) => [...prepareForDiscard([card]), ...prev]);
        }

        setHand(
            newHand.map((card: HandAbility) => {
                if (card.onAbilityUse) {
                    return updateCardEffects(card, card.onAbilityUse);
                }
                return card;
            })
        );
        handleNewEvents(
            useAllyAbility({
                ability: card,
                selectedIndex,
                enemies,
                allies: updateCharacters(allies, (character: Combatant) => {
                    if (character.id === player.id) {
                        return {
                            ...character,
                            resources: character.resources - totalResourceCost,
                        };
                    }
                    return character;
                }),
                side,
                actorId: player.id,
            })
        );
    };

    const handleNewEvents = (events: Event[]) => {
        setActionQueue((prev) => [...prev, ...events]);
    };

    useEffect(() => {
        if (events.length > 0 || actionQueue.length === 0) {
            return;
        }
        const checkKO = procKOEvents({
            oldAllies: allies,
            newAllies: actionQueue[actionQueue.length - 1].updatedAllies,
            oldEnemies: enemies,
            newEnemies: actionQueue[actionQueue.length - 1].updatedEnemies,
        });
        const newEvents = [...actionQueue];
        if (checkKO) {
            newEvents.push(checkKO);
        }
        setEvents(newEvents);
        setAllies(newEvents[newEvents.length - 1].updatedAllies);
        setEnemies(newEvents[newEvents.length - 1].updatedEnemies);
        setActionQueue([]);
    }, [actionQueue, events]);

    const handleAllyAttack = ({ index }) => {
        const { id } = allies[selectedAllyIndex];
        setSelectedAllyIndex(null);
        setAlliesAttackedThisTurn([...alliesAttackedThisTurn, id]);
        handleNewEvents(
            useAttack({
                allies,
                enemies,
                index,
                actorId: id,
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
            if (showReticle(BATTLEFIELD_SIDES.ALLIES, index)) {
                handleAbilityUse({ selectedIndex: index, side: BATTLEFIELD_SIDES.ALLIES });
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

    const handleEnemyClick = (e: React.ChangeEvent, index: number) => {
        e.stopPropagation(); // Prevent the click from going to the battlefield, which deselects abilities/allies

        const selectedAbility = hand[selectedAbilityIndex];

        if (selectedAbility) {
            if (showReticle(BATTLEFIELD_SIDES.ENEMIES, index)) {
                handleAbilityUse({ selectedIndex: index, side: BATTLEFIELD_SIDES.ENEMIES });
            } else if (enemies[index] && enemies[index].effects.some(({ type }) => type === EFFECT_TYPES.STEALTH)) {
                warn("That character is stealthed and cannot be targeted directly.");
            } else {
                setSelectedAbilityIndex(null);
            }
            return;
        }

        if (showReticle(BATTLEFIELD_SIDES.ENEMIES, index)) {
            handleAllyAttack({ index });
        } else {
            setSelectedAllyIndex(null);
        }
    };

    const handleBattlefieldClick = () => {
        setSelectedAllyIndex(null);
        setSelectedAbilityIndex(null);
    };

    /**
     * Returns the action if the character is using it. This is used in animations...
     * @param character
     */
    const getEvent = (character: Combatant | null): { action?: Action; target: Combatant | null; id?: string } => {
        let action;
        let target;
        if (!events.length) {
            return { action, target };
        }

        const { actorId, targetSide, selectedIndex, id } = (events[0] as Event) || {};

        if (actorId === character?.id) {
            action = events[0].action;
        }

        if (typeof selectedIndex === "number" && targetSide) {
            target = (targetSide === BATTLEFIELD_SIDES.ALLIES ? allyRefs : enemyRefs)[selectedIndex]?.current;
        }

        return {
            action,
            target,
            id,
        };
    };

    const [minionCardsInPlay, discardSansMinionsInPlay] = (() => {
        // Treat minions in play as if they do not exist in the discard
        const countMinions = (events[0]?.updatedAllies || allies).reduce((acc, ally) => {
            if (!ally || ally.isPlayer || ally.HP === 0) {
                return acc;
            }
            return {
                ...acc,
                [ally.name]: (acc[ally.name] || 0) + 1,
            };
        }, {});

        const a = [];
        const b = [];
        discard.forEach((card) => {
            if (countMinions[card.name] > 0) {
                countMinions[card.name] -= 1;
                a.push(card);
            } else {
                b.push(card);
            }
        });

        return [a, b];
    })();

    const prepareForDiscard = (cards: HandAbility[]): Ability[] => {
        return cards
            .filter((ability) => !ability.removeAfterTurn)
            .map((hand) => {
                const copy = {
                    ...hand,
                };
                delete copy.effects;
                return copy;
            });
    };

    const drawCards = (amount: number, effects = {}) => {
        let newDeck = deck.slice();
        let newHand = hand.slice();
        let newDiscard = discardSansMinionsInPlay;
        const cardsToDraw = [];
        if (newDeck.length < amount) {
            cardsToDraw.push(...newDeck.slice());
            newDeck = shuffle(discardSansMinionsInPlay);
            newDiscard = minionCardsInPlay;
            cardsToDraw.push(...newDeck.splice(0, amount - cardsToDraw.length));
        } else {
            cardsToDraw.push(...newDeck.splice(0, amount));
        }

        setDeck(newDeck);
        setHand([
            ...newHand,
            ...cardsToDraw.map((card) => ({
                ...card,
                effects: { ...effects },
            })),
        ]);
        setDiscard(newDiscard);
    };

    const handlePlayerTurnStart = () => {
        let cardsToDraw = CARDS_PER_DRAW - hand.length;

        const updateFns = [refreshPlayerResources, checkHalveArmor];
        if (currentRound > 0) {
            updateFns.push(tickDownBuffs, clearTurnHistory);
        } else {
            updateFns.push(triggerWaveClearEffects);
            cardsToDraw += player.effects.reduce((acc, effect: Effect) => acc + effect.onWaveStart?.effectOwner?.drawCards || 0, 0);
        }

        drawCards(cardsToDraw);
        setAlliesAttackedThisTurn([]);
        const updatedAllies = updateCharacters(allies, compose(...updateFns));
        setAllies(updatedAllies);
        updatePlayer(updatedAllies.find((ally) => ally?.id === player.id));
        handleNewEvents(
            applyPerTurnEffects(updatedAllies, enemies).map(({ actors, targets, ...other }) => ({
                updatedAllies: actors,
                updatedEnemies: targets,
                id: uuid.v4(),
                ...other,
            }))
        );
    };

    useEffect(() => {
        if (!events.length) {
            const enemiesAllDead = enemies.every((enemy) => !enemy || enemy.HP <= 0);
            if (enemiesAllDead) {
                setTimeout(() => {
                    nextWave();
                }, 1000);
            }
            return;
        }

        const updatedEvents = events.slice();
        const event = updatedEvents.shift() as Event;
        const { updatedAllies, action, actorId } = event;
        let timeout;
        if (action) {
            if (actorId === player.id) {
                // Mutually exclusive properties ee
                const { addCards = [], addCardsToDiscard = [], drawCards: cardsToDraw, cards } = action;
                if (addCards.length) {
                    setHand([
                        ...hand,
                        ...addCards.map((card) => ({
                            ...card,
                            effects: {},
                        })),
                    ]);
                } else if (cardsToDraw?.amount) {
                    drawCards(cardsToDraw.amount, cardsToDraw.effects);
                } else if (cards?.effects) {
                    setHand(
                        hand.map((card) => ({
                            ...card,
                            effects: { ...card.effects, ...cards?.effects },
                        }))
                    );
                }

                if (addCardsToDiscard.length) {
                    setDiscard([
                        ...discard,
                        ...addCardsToDiscard.map((card) => ({
                            ...card,
                        })),
                    ]);
                }
            }
        }

        const newPlayer = updatedAllies.find((ally) => ally?.isPlayer);
        updatePlayer(newPlayer);

        if (newPlayer.HP <= 0) {
            setEvents([]);
            return;
        }

        timeout = setTimeout(() => {
            setEvents(updatedEvents);
        }, 1000);

        return () => {
            clearTimeout(timeout);
            setEvents(updatedEvents);
        };
    }, [events]);

    const nextWave = () => {
        const nextWaveIndex = currentWave + 1;
        setCurrentWave(nextWaveIndex);
        if (!waves[nextWaveIndex]) {
            updatePlayer(triggerWaveClearEffects(player));
            onBattleWon();
            return;
        }

        const isInitialSetup = nextWaveIndex === 0;

        const setup = () => {
            setCurrentRound(0);
            const { presetDeck, description, enemies } = waves[nextWaveIndex] as Wave;
            setEnemies(enemies.map(createCombatant));
            if (presetDeck) {
                setDeck(shuffle(presetDeck.slice()));
                setHand([]);
                setDiscard([]);
            }

            if (isPlayerTurn) {
                setIsPlayerTurn(null);
            }
            setIsPlayerTurn(true);

            if (description) {
                showWaveDescription({ description, i: 0, delay: 2000 });
            }
        };

        if (isInitialSetup) {
            // We just started the fight / no wave clear has occurred
            setTimeout(() => {
                setup();
            }, 1000);
        } else {
            setTimeout(() => {
                setShowWaveClear(true);
                setTimeout(() => {
                    setShowWaveClear(false);
                    setup();
                }, 2500);
            }, 500);
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
        // Setup
        nextWave();
    }, []);

    useEffect(() => {
        if (events.length || !flagTurnEnd) {
            return;
        }

        const playerDead = allies.find((ally) => ally?.isPlayer).HP <= 0;
        const enemiesAllDead = enemies.every((enemy) => !enemy || enemy.HP <= 0);
        if (playerDead || enemiesAllDead) {
            setFlagTurnEnd(false);
            return;
        }

        if (isPlayerTurn) {
            const triggeredDotDamage = triggerDoTDamage(allies);
            const updatedAllies = [];
            if (triggeredDotDamage) {
                updatedAllies.push(...triggeredDotDamage);
            }

            updatedAllies.push(
                updateCharacters(updatedAllies[updatedAllies.length - 1] || allies, compose(tickDownDebuffs, removeEndedEffects))
            );
            handleNewEvents(
                updatedAllies.map((updated) => ({
                    updatedEnemies: enemies,
                    updatedAllies: updated,
                    id: uuid.v4(),
                }))
            );

            // end the player turn
            setHand([]);
            const newDiscard = [...prepareForDiscard(hand), ...discard];
            setDiscard(newDiscard);
            setTimeout(() => {
                setFlagTurnEnd(false);
                setIsPlayerTurn(!isPlayerTurn);
            }, 1000 * updatedAllies.length);
        } else {
            // end the opponent turn
            setCurrentRound(currentRound + 1);
            const { winCondition } = waves[currentWave] || {};
            if (currentRound + 1 >= winCondition?.surviveRounds) {
                nextWave();
            } else {
                setIsPlayerTurn(!isPlayerTurn);
            }
            setFlagTurnEnd(false);
        }
    }, [flagTurnEnd, events]);

    useEffect(() => {
        // Handle event groups; this is currently only applicable to enemies
        if (events.length || isPlayerTurn || !eventGroups.length) {
            return;
        }

        const newEventGroups = eventGroups.slice();
        const group = newEventGroups.shift();
        const updateEvents = () => {
            setEvents(group.events);
            setEventGroups(newEventGroups);
            const last = group.events[group.events.length - 1];
            setEnemies(last.updatedEnemies);
            setAllies(last.updatedAllies);
            if (!newEventGroups.length && isPlayerTurn === false) {
                setFlagTurnEnd(true);
            }
        };
        if (group.ability) {
            // Add a delay between enemy abilities or they're too fast
            setTimeout(() => {
                setAbilityNotification({
                    text: (
                        <>
                            {group.ability.image && <img src={group.ability.image} className={classes.notificationAbility} />}{" "}
                            {group.ability.name}
                        </>
                    ),
                    id: uuid.v4(),
                });
            }, 1000);
            setTimeout(() => {
                updateEvents();
            }, 1200);
        } else {
            updateEvents();
        }
    }, [eventGroups, events]);

    useEffect(() => {
        if (currentWave === -1 || isPlayerTurn === null) {
            return;
        }

        setShowTurnAnnouncement(true);
        setTimeout(() => {
            setShowTurnAnnouncement(false);
            if (isPlayerTurn) {
                handlePlayerTurnStart();
            } else {
                const eventGroups = enemyTurn({ enemies, allies });
                setEventGroups(eventGroups);
            }
        }, TURN_ANNOUNCEMENT_TIME);
    }, [isPlayerTurn]);

    const disableActions =
        showTurnAnnouncement || !isPlayerTurn || showWaveClear || enemies.every((enemy) => !enemy || enemy.HP <= 0) || flagTurnEnd;

    const isTargeted = (side: BATTLEFIELD_SIDES, i: number | null): boolean => {
        const isValidIndex = (index: any) => typeof index === "number";
        const noHover = !isValidIndex(hoveredAllyIndex) && !isValidIndex(hoveredEnemyIndex);
        const mismatchingSide =
            (isValidIndex(hoveredAllyIndex) && side === BATTLEFIELD_SIDES.ENEMIES) ||
            (isValidIndex(hoveredEnemyIndex) && side === BATTLEFIELD_SIDES.ALLIES);
        if (disableActions || noHover || mismatchingSide) {
            return false;
        }

        if (allies[selectedAllyIndex]) {
            return side === BATTLEFIELD_SIDES.ENEMIES && hoveredEnemyIndex === i;
        }

        const hoveredIndex = isValidIndex(hoveredAllyIndex) ? hoveredAllyIndex : hoveredEnemyIndex;
        const ability = hand[selectedAbilityIndex];

        if (!ability || !isValidTarget({ ability, side, index: hoveredIndex, enemies, allies, actor: player })) {
            return false;
        }

        const { actions = [] } = ability;
        const area = calculateActionArea({ action: actions[0], actor: player }) || ability.area || 0;
        return i >= hoveredIndex - area && i <= hoveredIndex + area;
    };

    const showReticle = (side: BATTLEFIELD_SIDES, index: number): boolean => {
        if (isEligibleToAttack(allies[selectedAllyIndex])) {
            if (side === BATTLEFIELD_SIDES.ENEMIES && enemies[index]) {
                if (typeof hoveredEnemyIndex === "number") {
                    return index === hoveredEnemyIndex;
                }
                return true;
            }

            return false;
        }

        const ability = hand[selectedAbilityIndex];
        if (!ability) {
            return false;
        }

        const { minion } = ability;
        if (minion) {
            if (side === BATTLEFIELD_SIDES.ALLIES && !allies[index]) {
                if (typeof hoveredAllyIndex === "number") {
                    return index === hoveredAllyIndex;
                }
                return true;
            }
        }

        const actor = player;
        if (typeof hoveredEnemyIndex === "number") {
            if (isValidTarget({ ability, side: BATTLEFIELD_SIDES.ENEMIES, index: hoveredEnemyIndex, allies, enemies, actor })) {
                return isTargeted(side, index);
            }
        }

        if (typeof hoveredAllyIndex === "number") {
            if (isValidTarget({ ability, side: BATTLEFIELD_SIDES.ALLIES, index: hoveredAllyIndex, allies, enemies, actor })) {
                return isTargeted(side, index);
            }
        }

        return isValidTarget({ ability, side, index, allies, enemies, actor });
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
        handleUseItem = (index: number) => {
            const item: Item = player.items[index];
            handleNewEvents([
                parseAction({
                    enemies,
                    allies,
                    action: {
                        healing: item.healing || 0,
                        resources: item.resources || 0,
                        type: ACTION_TYPES.EFFECT,
                    },
                    selectedIndex: allies.findIndex((ally) => ally?.isPlayer),
                    actorId: player.id,
                    selectedSide: BATTLEFIELD_SIDES.ALLIES,
                }),
            ]);
        };
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
                                        isTargeted={isTargeted(BATTLEFIELD_SIDES.ENEMIES, i)}
                                        key={i}
                                        event={getEvent(enemy)}
                                        isHighlighted={false}
                                        showReticle={showReticle(BATTLEFIELD_SIDES.ENEMIES, i)}
                                        ref={enemyRefs[i]}
                                        showResourceBar={shouldShowResourceBar(enemy)}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className={classes.divider} />
                        <div className={classes.playerContainer}>
                            <div className={classes.leftContainer}>
                                <Deck deck={deck} discard={discardSansMinionsInPlay} />
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
                                                isTargeted={isTargeted(BATTLEFIELD_SIDES.ALLIES, i)}
                                                key={i}
                                                event={getEvent(ally)}
                                                isHighlighted={isPlayerTurn && selectedAllyIndex === null && isEligibleToAttack(ally)}
                                                showReticle={showReticle(BATTLEFIELD_SIDES.ALLIES, i)}
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
                                        setFlagTurnEnd(true);
                                    }}
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
            <Header player={player} deck={initialDeck} onUseItem={handleUseItem} />
            {showWaveClear && <ClearOverlay labelText={`Next: Wave ${currentWave + 1}`} />}
            {showTurnAnnouncement && <TurnAnnouncement isPlayerTurn={isPlayerTurn} />}
        </div>
    );
};

export default BattlefieldContainer;
