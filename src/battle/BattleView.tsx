import { compose } from "ramda";
import React, { useEffect, useMemo, useState } from "react";
import { createUseStyles } from "react-jss";
import uuid from "uuid";
import { Ability, EFFECT_TYPES, HandAbility } from "../ability/types";
import { getAbilityColor } from "../ability/utils";
import CombatantView from "../character/CombatantView";
import { Combatant } from "../character/types";
import createCombatant from "../enemy/createEnemy";
import enemyTurn from "../enemy/enemyTurn";
import { mapleleaves, victoria } from "../images";
import { Wave } from "../Menu/tutorial";
import { Fury } from "../resource/ResourcesView";
import { shuffle } from "../utils";
import BattleEndOverlay from "./BattleEndOverlay";
import ClearOverlay from "./ClearOverlay";
import Deck from "./Deck";
import EndTurnButton from "./EndTurnButton";
import Hand from "./Hand";
import Notification from "./Notification";
import { applyPerTurnEffects, calculateActionArea, Event, useAllyAbility, useAttack } from "./parseAbilityActions";
import TargetLineCanvas from "./TargetLineCanvas";
import TurnAnnouncement from "./TurnNotification";
import {
    canUseAbility,
    clearTurnHistory,
    halveArmor,
    isValidTarget,
    refreshPlayerResources,
    removeEndedEffects,
    tickDownBuffs,
    tickDownDebuffs,
    updateCharacters,
    updatePlayer,
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
});

interface BattleNotification {
    id: string; // For rerendering the same message if applicable
    text: string;
    severity: "warning" | "info" | "error";
}

const TURN_ANNOUNCEMENT_TIME = 1500; // MS
const BATTLEFIELD_SIZE = 5;
const MAX_HAND_SIZE = 10;

const BattlefieldContainer = ({ waves, onBattleEnd, initialDeck, initialAllies, updatePlayerHP, onUpdateDeck, rewards }) => {
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
    const [actionQueue, setActionQueue] = useState([]);
    const [notification, setNotification] = useState(null) as [BattleNotification, Function];
    const [info, setInfo] = useState(null);
    const [showTurnAnnouncement, setShowTurnAnnouncement] = useState(false);
    const [showWaveClear, setShowWaveClear] = useState(false);
    const [battleEndResult, setBattleEndResult] = useState(undefined);
    const [flagTurnEnd, setFlagTurnEnd] = useState(false);

    const player = allies.find((ally: Combatant | null) => ally && ally.isPlayer);

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

    const handleAbilityUse = async ({ index, selectedAbilityIndex, side }) => {
        const newHand = hand.slice();
        const [card] = newHand.splice(selectedAbilityIndex, 1);
        const { resourceCost = 0, removeAfterTurn, reusable, effects } = card as HandAbility;
        const totalResourceCost = Math.max(0, resourceCost + (effects.resourceCost || 0));

        setSelectedAbilityIndex(null);
        if (reusable) {
            newHand.push({
                ...card,
                effects: {},
            });
        } else if (!removeAfterTurn) {
            setDiscard((prev) => [...prepareForDiscard([card]), ...prev]);
        }

        setHand(newHand);
        handleNewEvents(
            useAllyAbility({
                ability: card,
                selectedIndex: index,
                enemies,
                allies: updatePlayer(
                    (player) => ({
                        resources: player.resources - totalResourceCost,
                    }),
                    allies
                ),
                side,
                actorId: player.id,
            })
        );
    };

    const handleNewEvents = (events: Event[]) => {
        const lastEvent = events[events.length - 1];
        if (!lastEvent) {
            return;
        }

        const getUpdated = (characters) => {
            return characters.map((character) => {
                if (!character) {
                    return character;
                }

                const newActions = [];
                events.forEach(({ action, actorId }) => {
                    if (action && actorId === character.id) {
                        newActions.push(action);
                    }
                });
                return { ...character, turnHistory: character.turnHistory.concat(newActions) };
            });
        };

        setActionQueue((prev) => [...prev, ...events]);
        setAllies(getUpdated(lastEvent.updatedAllies));
        setEnemies(getUpdated(lastEvent.updatedEnemies));
    };

    useEffect(() => {
        if (events.length > 0 || actionQueue.length === 0) {
            return;
        }
        setEvents(actionQueue);
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

    const handleEnemyClick = (e: React.ChangeEvent, index: number) => {
        e.stopPropagation(); // Prevent the click from going to the battlefield, which deselects abilities/allies

        const selectedAbility = hand[selectedAbilityIndex];

        if (selectedAbility) {
            if (showReticle("enemies", index)) {
                handleAbilityUse({ index, selectedAbilityIndex, side: "enemies" });
            } else if (enemies[index] && enemies[index].effects.some(({ type }) => type === EFFECT_TYPES.STEALTH)) {
                warn("That character is stealthed and cannot be targeted directly.");
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

        const { actorId, targetSide, selectedIndex } = (events[0] as Event) || {};

        // Returns the ability if the character is using it.
        if (actorId === character?.id) {
            action = events[0].action;
        }

        if (typeof selectedIndex === "number" && targetSide) {
            target = (targetSide === "allies" ? allyRefs : enemyRefs)[selectedIndex]?.current;
        }

        return {
            action,
            target,
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
                effects,
            })),
        ]);
        setDiscard(newDiscard);
    };

    const handlePlayerTurnStart = () => {
        drawCards(CARDS_PER_DRAW - hand.length);
        setAlliesAttackedThisTurn([]);
        const updatedAllies = updateCharacters(allies, compose(tickDownBuffs, clearTurnHistory, refreshPlayerResources, halveArmor));
        setAllies(updatedAllies);
        handleNewEvents(
            applyPerTurnEffects(updatedAllies, enemies).map(({ actors, targets, ...other }) => ({
                updatedAllies: actors,
                updatedEnemies: targets,
                ...other,
            }))
        );
    };

    useEffect(() => {
        if (!events.length) {
            return;
        }

        const updatedEvents = events.slice();
        const event = updatedEvents.shift() as Event;
        const { updatedEnemies, updatedAllies, action, actorId } = event;
        let timeout;
        if (action) {
            if (actorId === player.id) {
                // Mutually exclusive properties ee
                const { addCards = [], drawCards: cardsToDraw } = action;
                if (addCards.length) {
                    setHand([...hand, ...addCards]);
                } else if (cardsToDraw?.amount) {
                    drawCards(cardsToDraw.amount, cardsToDraw.effects);
                }
            }
        }

        const playerHP = updatedAllies.find((ally) => ally?.isPlayer).HP;
        updatePlayerHP(playerHP);

        if (playerHP <= 0) {
            setTimeout(() => {
                setEvents([]);
                setBattleEndResult("Defeat");
            }, 1000);
            return;
        }

        const enemiesAllDead = updatedEnemies.every((enemy) => !enemy || enemy.HP <= 0);
        if (enemiesAllDead) {
            setTimeout(() => {
                setEvents([]);
                nextWave();
            }, 1000);
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
            setBattleEndResult("Victory");
            return;
        }

        const setup = () => {
            setCurrentRound(0);
            const { presetDeck, description, enemies } = waves[nextWaveIndex] as Wave;
            setEnemies(enemies.map(createCombatant));
            if (presetDeck) {
                setDeck(shuffle(presetDeck.slice()));
                setHand([]);
                setDiscard([]);
                setAllies(allies.map((ally) => (!ally || ally.isPlayer ? ally : null))); // Clean up minions
            }

            if (isPlayerTurn) {
                setIsPlayerTurn(null); // Hack: trigger useEffect if it is already our turn
            }
            setIsPlayerTurn(true);

            if (description) {
                showWaveDescription({ description, i: 0, delay: 2000 });
            }
        };

        if (nextWaveIndex > 0) {
            setTimeout(() => {
                setShowWaveClear(true);
                setTimeout(() => {
                    setShowWaveClear(false);
                    setup();
                }, 2500);
            }, 500);
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
        nextWave();
    }, []);

    useEffect(() => {
        if (events.length || !flagTurnEnd) {
            return;
        }

        setFlagTurnEnd(false);
        const playerDead = allies.find((ally) => ally?.isPlayer).HP <= 0;
        const enemiesAllDead = enemies.every((enemy) => !enemy || enemy.HP <= 0);
        if (playerDead || enemiesAllDead) {
            return;
        }

        if (isPlayerTurn) {
            setIsPlayerTurn(!isPlayerTurn);
            // end the player turn
            const updatedAllies = updateCharacters(allies, compose(tickDownDebuffs, removeEndedEffects));
            setAllies(updatedAllies);
            setHand([]);
            const newDiscard = [...prepareForDiscard(hand), ...discard];
            setDiscard(newDiscard);
        } else {
            // end the opponent turn
            setCurrentRound(currentRound + 1);
            const { winCondition } = waves[currentWave] || {};
            if (currentRound + 1 >= winCondition?.surviveRounds) {
                nextWave();
            } else {
                setIsPlayerTurn(!isPlayerTurn);
            }
        }
    }, [flagTurnEnd, events]);

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
                const enemyActions = enemyTurn({ enemies, allies });
                handleNewEvents(enemyActions);
                setFlagTurnEnd(true);
            }
        }, TURN_ANNOUNCEMENT_TIME);
    }, [isPlayerTurn]);

    const disableActions =
        battleEndResult || showTurnAnnouncement || !isPlayerTurn || showWaveClear || enemies.every((enemy) => !enemy || enemy.HP <= 0);

    const isTargeted = (i: number | null, side: "allies" | "enemies"): boolean => {
        const isValidIndex = (index: any) => typeof index === "number";
        const noHover = !isValidIndex(hoveredAllyIndex) && !isValidIndex(hoveredEnemyIndex);
        const mismatchingSide =
            (isValidIndex(hoveredAllyIndex) && side === "enemies") || (isValidIndex(hoveredEnemyIndex) && side === "allies");
        if (disableActions || noHover || mismatchingSide) {
            return false;
        }

        if (allies[selectedAllyIndex]) {
            return side === "enemies" && hoveredEnemyIndex === i;
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

        const actor = player;
        if (typeof hoveredEnemyIndex === "number") {
            if (isValidTarget({ ability, side: "enemies", index: hoveredEnemyIndex, allies, enemies, actor })) {
                return isTargeted(index, side);
            }
        }

        if (typeof hoveredAllyIndex === "number") {
            if (isValidTarget({ ability, side: "allies", index: hoveredAllyIndex, allies, enemies, actor })) {
                return isTargeted(index, side);
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
            {battleEndResult && (
                <BattleEndOverlay
                    result={battleEndResult}
                    onClickContinue={onBattleEnd}
                    onUpdateDeck={onUpdateDeck}
                    deck={initialDeck}
                    rewards={rewards}
                />
            )}
            {showWaveClear && <ClearOverlay labelText={`Next: Wave ${currentWave + 1}`} />}
            {showTurnAnnouncement && <TurnAnnouncement isPlayerTurn={isPlayerTurn} />}
        </div>
    );
};

export default BattlefieldContainer;
