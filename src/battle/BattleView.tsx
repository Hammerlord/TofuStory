import React, { useEffect, useMemo, useState } from "react";
import { createUseStyles } from "react-jss";
import uuid from "uuid";
import AbilityView from "../ability/AbilityView";
import { Ability, Action } from "../ability/types";
import CombatantView from "../character/CombatantView";
import { Combatant } from "../character/types";
import enemyTurn from "../enemy/enemyTurn";
import { clear } from "../images";
import { Fury } from "../resource/ResourcesView";
import { shuffle } from "../utils";
import BattleEndOverlay from "./BattleEndOverlay";
import ClearOverlay from "./ClearOverlay";
import Deck from "./Deck";
import EndTurnButton from "./EndTurnButton";
import Notification from "./Notification";
import Overlay from "./Overlay";
import { applyAuraPerTurnEffects, Event, useAllyAbility, useAttack } from "./parseAbilityActions";
import TargetLineCanvas from "./TargetLineCanvas";
import TurnAnnouncement from "./TurnNotification";
import { canUseAbility, isValidTarget, updateEffects } from "./utils";
import WaveInfo from "./WaveInfo";

const CARDS_PER_DRAW = 5;

const useStyles = createUseStyles({
    root: {
        width: "100%",
        height: "100%",
        position: "relative",
        background: "#968e72",
        overflow: "hidden",
    },
    battlefieldContainer: {
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyItems: "center",
    },
    battlefield: {
        textAlign: "center",
        margin: "auto",
        width: "95%",
        height: "100%",
        position: "relative",
        background: "#f5ebcb",
        paddingTop: "15vh",
    },
    waves: {
        position: "absolute",
        top: 0,
        left: 0,
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
    },
    resource: {
        margin: "0 1px",
    },
    abilities: {
        display: "flex",
        margin: "auto",
        justifyContent: "space-evenly",
        marginTop: "16px",
        minHeight: "250px",
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

const TURN_ANNOUNCEMENT_TIME = 2000; // MS

const BattlefieldContainer = ({ waves, onBattleEnd, initialDeck, initialAllies }) => {
    const [deck, setDeck] = useState(shuffle(initialDeck));
    const [discard, setDiscard] = useState([]);
    const [hand, setHand] = useState([]);
    const [isPlayerTurn, setIsPlayerTurn] = useState(true);
    const [currentWave, setCurrentWave] = useState(-1);
    const [currentRound, setCurrentRound] = useState(0);
    const [enemies, setEnemies] = useState(waves[0].createEnemies());
    const [allies, setAllies] = useState(initialAllies.slice());
    const [allyRefs] = useState(Array.from({ length: allies.length }).map(() => React.createRef()));
    const [enemyRefs] = useState(
        Array.from({ length: enemies.length }).map(() => React.createRef())
    );
    const [recentActions, setRecentActions] = useState([]);
    const [isPlayingAbilityAnimations, setIsPlayingAnimations] = useState(false);
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
    const classes = useStyles();

    const isEligibleToAttack = (ally: Combatant): boolean => {
        if (!ally) {
            return false;
        }
        const damageFromEffects = ally.effects?.reduce(
            (acc: number, { damage = 0 }) => acc + damage,
            0
        );
        const totalDamage = (ally.damage || 0) + damageFromEffects;
        return totalDamage > 0 && alliesAttackedThisTurn.every((id) => id !== ally.id);
    };
    const noMoreMoves =
        !hand.length ||
        (hand.every((ability) => !canUseAbility(player, ability)) &&
            allies.every((ally) => !isEligibleToAttack(ally)));

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

    const handleAbilityUse = ({ index, selectedAbilityIndex, side }) => {
        const newHand = hand.slice();
        const [card] = newHand.splice(selectedAbilityIndex, 1);
        const { resourceCost = 0 } = card as Ability;

        let recentAllies = allies;
        if (resourceCost) {
            recentAllies = updatePlayer((player) => ({
                resources: player.resources - resourceCost,
            }));
        }

        setRecentActions(
            useAllyAbility({
                ability: card,
                targetIndex: index,
                enemies,
                allies: recentAllies,
                side,
                casterId: player.id,
            })
        );
        setSelectedAbilityIndex(null);
        setDiscard([card, ...discard]);
        setHand(newHand);
    };

    const handleAllyAttack = ({ index }) => {
        const { id } = allies[selectedAllyIndex];
        setRecentActions(
            useAttack({
                allies,
                enemies,
                index,
                casterId: id,
            })
        );
        setAlliesAttackedThisTurn([...alliesAttackedThisTurn, id]);
        setSelectedAllyIndex(null);
    };

    const handleAllyClick = (e: React.ChangeEvent, index) => {
        e.stopPropagation(); // Prevent the click from going to the battlefield, which deselects abilities/allies

        if (disableActions) {
            return;
        }
        const selectedAbility = hand[selectedAbilityIndex];
        if (selectedAbility) {
            if (isValidTarget({ ability: selectedAbility, side: "allies", allies, index })) {
                handleAbilityUse({ index, selectedAbilityIndex, side: "allies" });
            } else {
                setNotification({
                    severity: "warning",
                    text: `Please select a valid target for ${selectedAbility.name}.`,
                    id: uuid.v4(),
                });
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
            if (isValidTarget({ ability: selectedAbility, side: "enemies", allies, index })) {
                handleAbilityUse({ index, selectedAbilityIndex, side: "enemies" });
            } else {
                setNotification({
                    severity: "warning",
                    text: `Please select a valid target for ${selectedAbility.name}.`,
                    id: uuid.v4(),
                });
            }
            return;
        }

        if (isEligibleToAttack(allies[selectedAllyIndex])) {
            handleAllyAttack({ index });
        }
    };

    const handleBattlefieldClick = () => {
        setSelectedAllyIndex(null);
        setSelectedAbilityIndex(null);
    };

    const getAction = (character): Action => {
        // Returns the ability if the character is using it.
        if (recentActions[0]?.casterId === character?.id) {
            return recentActions[0]?.action;
        }
    };

    const drawCards = ({ deck, discard, hand }) => {
        let i = 0;
        let newDeck = deck.slice();
        let newDiscard = discard.slice();
        let newHand = hand.slice();
        setIsPlayingAnimations(true);
        const drawCard = () => {
            setTimeout(() => {
                if (!newDeck.length) {
                    newDeck = shuffle(newDiscard);
                    newDiscard = [];
                }

                const card = newDeck.shift();
                newHand = [...newHand, card];
                setDeck(newDeck);
                setHand(newHand);
                setDiscard(newDiscard);
                ++i;
                if (i < CARDS_PER_DRAW && (newDeck.length || newDiscard.length)) {
                    drawCard();
                } else {
                    setIsPlayingAnimations(false);
                }
            }, 200);
        };

        drawCard();
    };

    const updatePlayer = (statChanges: Function | object): (Combatant | null)[] => {
        const updatedAllies = allies.map((ally) => {
            if (!ally || !ally.isPlayer) {
                return ally;
            }

            if (typeof statChanges === "function") {
                statChanges = statChanges(ally);
            }

            return {
                ...ally,
                ...statChanges,
            };
        });
        setAllies(updatedAllies);
        return updatedAllies;
    };

    const handlePlayerTurnStart = () => {
        setIsPlayerTurn(true);
        setShowTurnAnnouncement(true);
        setTimeout(() => {
            setShowTurnAnnouncement(false);
            const updatedAllies = updatePlayer((player) => ({
                resources: Math.min(
                    player.maxResources,
                    player.resources + player.resourcesPerTurn
                ),
            }));
            setEnemies(enemies.map(updateEffects));
            drawCards({ discard, hand, deck });
            setAlliesAttackedThisTurn([]);
            const aurasApplied = applyAuraPerTurnEffects(updatedAllies);
            if (aurasApplied.length) {
                setRecentActions(
                    aurasApplied.map(({ characters, action, casterId }) => ({
                        updatedAllies: characters,
                        updatedEnemies: enemies,
                        action,
                        casterId,
                    }))
                );
            }
        }, TURN_ANNOUNCEMENT_TIME);
    };

    useEffect(() => {
        // Spaghetti play animations
        if (recentActions.length) {
            if (!isPlayingAbilityAnimations) {
                setIsPlayingAnimations(true);
            }

            setTimeout(() => {
                const updatedRecentActions = recentActions.slice();
                const { updatedEnemies, updatedAllies } = updatedRecentActions.shift() as Event;
                setEnemies(updatedEnemies);
                setAllies(updatedAllies);

                setTimeout(() => {
                    if (checkContinueWave({ enemies: updatedEnemies, allies: updatedAllies })) {
                        setRecentActions(updatedRecentActions);
                    }
                }, 700);
            }, 400);
            return;
        }

        if (!isPlayerTurn) {
            setTimeout(() => {
                const { winCondition } = waves[currentWave] || {};
                if (winCondition) {
                    if (currentRound + 1 > winCondition.surviveRounds) {
                        setCurrentRound(0);
                        nextWave();
                        return;
                    }
                }

                setCurrentRound(currentRound + 1);
                handlePlayerTurnStart();
            }, TURN_ANNOUNCEMENT_TIME);
        }
        setIsPlayingAnimations(false);
    }, [recentActions]);

    const checkContinueWave = ({ enemies, allies }) => {
        const enemiesAllDead = enemies.every((enemy) => !enemy || enemy.HP <= 0);
        const playerDead = allies.find((ally) => ally?.isPlayer).HP <= 0;

        if (playerDead) {
            setBattleEndResult("Defeat");
            return false;
        } else if (enemiesAllDead) {
            nextWave();
            return false;
        }

        return true;
    };

    const nextWave = () => {
        const nextWaveIndex = currentWave + 1;
        setCurrentWave(nextWaveIndex);
        if (!waves[nextWaveIndex]) {
            setBattleEndResult("Victory");
            return;
        }

        const setup = () => {
            setIsPlayerTurn(true);
            setAlliesAttackedThisTurn([]);

            const { presetDeck, description, createEnemies, reset } = waves[nextWaveIndex];

            const updatedAllies = updatePlayer((player) => ({
                resources: Math.min(
                    player.maxResources,
                    player.resources + player.resourcesPerTurn
                ),
            }));

            const newEnemies = createEnemies();
            setEnemies(newEnemies);
            const aurasApplied = applyAuraPerTurnEffects(updatedAllies);
            if (aurasApplied.length) {
                setRecentActions(
                    aurasApplied.map(({ characters, action, casterId }) => ({
                        updatedAllies: characters,
                        updatedEnemies: newEnemies,
                        action,
                        casterId,
                    }))
                );
            }

            if (presetDeck) {
                drawCards({ deck: presetDeck.slice(), hand: [], discard: [] });
            } else {
                drawCards({ deck, hand, discard });
            }
            if (reset) {
                setAllies(initialAllies.slice());
            }

            if (description) {
                showDescription({ description, i: 0, delay: 1000 });
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
            setTimeout(() => {
                setup();
            }, 500);
        }
    };

    const showDescription = ({
        description,
        i = 0,
        delay,
    }: {
        description?: string | string[];
        i?: number;
        delay: number;
    }) => {
        setTimeout(() => {
            setNotification({
                text: Array.isArray(description) ? description[i] : description,
                id: uuid.v4(),
            });
            if (Array.isArray(description) && description[i + 1]) {
                showDescription({ description, i: i + 1, delay: 7500 });
            }
        }, delay);
    };

    useEffect(() => {
        nextWave();
    }, []);

    const handleEndTurn = () => {
        setIsPlayerTurn(false);
        const updatedAllies = allies.map(updateEffects);
        setAllies(updatedAllies);
        setShowTurnAnnouncement(true);
        setTimeout(() => {
            setShowTurnAnnouncement(false);
            setHand([]);
            setDiscard([...hand, ...discard]);
            setRecentActions(enemyTurn({ enemies, allies: updatedAllies }));
        }, 1000);
    };

    const disableActions =
        isPlayingAbilityAnimations || battleEndResult || showTurnAnnouncement || !isPlayerTurn;

    const isTargeted = (i: number | null, side: "allies" | "enemies"): boolean => {
        if (disableActions) {
            return false;
        }

        const ally = allies[selectedAllyIndex];
        if (ally) {
            return side === "enemies" && hoveredEnemyIndex === i;
        }
        const index = side === "allies" ? hoveredAllyIndex : hoveredEnemyIndex;
        const ability = hand[selectedAbilityIndex];
        if (!ability || index === null) {
            return false;
        }

        const { actions = [] } = ability;
        const { area = 0 } = actions[0] || {};
        return i >= index - area && i <= index + area;
    };

    const showReticle = (side, index) => {
        if (isEligibleToAttack(allies[selectedAllyIndex])) {
            if (typeof hoveredEnemyIndex === "number") {
                return side === "enemies" && index === hoveredEnemyIndex;
            }
            return side === "enemies";
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

        return isValidTarget({ ability, side, index, allies });
    };

    const origination = useMemo(() => {
        return !disableActions && allyRefs[selectedAllyIndex]?.current;
    }, [disableActions, allyRefs[selectedAllyIndex]]);

    return (
        <div className={classes.root}>
            {info && (
                <Notification onClick={() => setInfo(null)} id={info.id}>
                    {info.text}
                </Notification>
            )}
            {notification && (
                <Notification
                    severity={notification.severity}
                    onClick={() => setNotification(null)}
                    id={notification.id}
                >
                    {notification.text}
                </Notification>
            )}
            <TargetLineCanvas originationRef={origination}>
                <div className={classes.battlefieldContainer}>
                    <div className={classes.battlefield} onClick={handleBattlefieldClick}>
                        <div className={classes.waves}>
                            <WaveInfo waves={waves} currentIndex={currentWave} cleared={false} />
                        </div>
                        <div className={classes.combatantContainer}>
                            <div className={classes.combatants}>
                                {enemies.map((enemy, i: number) => (
                                    <CombatantView
                                        combatant={enemy}
                                        isAlly={false}
                                        onClick={(e) => handleEnemyClick(e, i)}
                                        isSelected={false}
                                        onMouseEnter={() => setHoveredEnemyIndex(i)}
                                        onMouseLeave={() => setHoveredEnemyIndex(null)}
                                        isTargeted={isTargeted(i, "enemies")}
                                        key={i}
                                        action={getAction(enemy)}
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
                                    {allies.map((ally, i) => {
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
                                                action={getAction(ally)}
                                                isHighlighted={
                                                    isPlayerTurn &&
                                                    selectedAllyIndex === null &&
                                                    isEligibleToAttack(ally)
                                                }
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
                                    onClick={handleEndTurn}
                                />
                            </div>
                        </div>
                        <div className={classes.abilityContainer}>
                            {Array.from({ length: player.resources }).map((_, i) => (
                                <Fury key={i} className={classes.resource} />
                            ))}
                            <div className={classes.abilities}>
                                {hand.map((ability: Ability, i: number) => (
                                    <AbilityView
                                        onClick={(e) => handleAbilityClick(e, i)}
                                        isSelected={isPlayerTurn && selectedAbilityIndex === i}
                                        key={i}
                                        ability={ability}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </TargetLineCanvas>
            {battleEndResult && (
                <BattleEndOverlay result={battleEndResult} onClickContinue={onBattleEnd} />
            )}
            {showWaveClear && (
                <ClearOverlay labelText={`Next: Wave ${currentWave + 1}`} />
            )}
            {showTurnAnnouncement && <TurnAnnouncement isPlayerTurn={isPlayerTurn} />}
        </div>
    );
};

export default BattlefieldContainer;
