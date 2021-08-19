import { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
import AbilityView from "../ability/AbilityView";
import { Ability, Action, TARGET_TYPES } from "../ability/types";
import { Combatant } from "../character/types";
import enemyTurn from "../enemy/enemyTurn";
import CombatantView from "../character/CombatantView";
import { shuffle } from "../utils";
import BattleEndOverlay from "./BattleEndOverlay";
import Deck from "./Deck";
import EndTurnButton from "./EndTurnButton";
import Notification from "./Notification";
import { Event, useAllyAbility } from "./parseAbilityActions";
import TurnAnnouncement from "./TurnNotification";
import { canUseAbility, getBattleEndResult, isValidTarget, updateEffects } from "./utils";
import { Fury } from "../resource/ResourcesView";
import uuid from "uuid";

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
        width: "80rem",
        maxWidth: "100%",
        height: "100%",
        position: "relative",
        background: "#f5ebcb",
    },
    combatantContainer: {
        position: "relative",
        height: "200px",
        width: "calc(100% - 300px)",
        margin: "auto",
        marginTop: "48px",
    },
    combatants: {
        display: "flex",
        margin: "auto",
        justifyContent: "space-evenly",
        position: "absolute",
        bottom: 0,
        width: "100%",
    },
    divider: {
        paddingTop: "24px",
        borderBottom: "1px solid rgba(0, 0, 0, 0.15)",
        marginBottom: "24px",
    },
    abilityContainer: {
        position: "absolute",
        bottom: "32px",
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
        marginTop: "32px",
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
});

interface BattleNotification {
    id: string; // For rerendering the same message if applicable
    text: string;
    severity: "warning" | "info" | "error";
}

const BattlefieldContainer = ({
    challenge,
    onBattleEnd,
    initialDeck,
    initialAllies,
    tutorialMode,
}) => {
    const [deck, setDeck] = useState(shuffle(initialDeck));
    const [discard, setDiscard] = useState([]);
    const [hand, setHand] = useState([]);
    const [isPlayerTurn, setIsPlayerTurn] = useState(true);
    const [enemies, setEnemies] = useState(challenge.createEnemies());
    const [allies, setAllies] = useState(initialAllies);
    const [recentActions, setRecentActions] = useState([]);
    const [isPlayingAbilityAnimations, setIsPlayingAnimations] = useState(false);
    const [notification, setNotification] = useState(null) as [BattleNotification, Function];
    const [showTurnAnnouncement, setShowTurnAnnouncement] = useState(false);
    const [battleEndResult, setBattleEndResult] = useState(undefined);

    const player = allies.find((ally: Combatant | null) => ally && ally.isPlayer);

    const [selectedAbilityIndex, setSelectedAbilityIndex] = useState(null);
    const [hoveredAllyIndex, setHoveredAllyIndex] = useState(null);
    const [hoveredEnemyIndex, setHoveredEnemyIndex] = useState(null);
    const [alliesAttackedThisTurn, setAlliesAttackedThisTurn] = useState([]);
    const [selectedAllyIndex, setSelectedAllyIndex] = useState(null);
    const classes = useStyles();

    const isEligibleToAttack = (ally: Combatant): boolean => {
        return ally && ally.damage && alliesAttackedThisTurn.every((id) => id !== ally.id);
    };
    const noMoreMoves =
        !hand.length ||
        (hand.every((ability) => !canUseAbility(player, ability)) &&
            allies.every((ally) => !isEligibleToAttack(ally)));

    const handleAbilityClick = (i: number) => {
        setSelectedAllyIndex(null);
        if (!canUseAbility(player, hand[i])) {
            setNotification({
                severity: "warning",
                text: `Need more resources to use ${hand[i].name}.`,
                id: uuid.v4()
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
        const { damage = 0, id } = allies[selectedAllyIndex];
        setRecentActions(
            useAllyAbility({
                enemies,
                targetIndex: index,
                side: "enemies",
                ability: {
                    actions: [
                        {
                            damage,
                            target: TARGET_TYPES.HOSTILE,
                        },
                    ],
                },
                allies,
                casterId: id,
            })
        );
        setAlliesAttackedThisTurn([...alliesAttackedThisTurn, id]);
        setSelectedAllyIndex(null);
    };

    const handleTargetClick = ({ side, index }) => {
        if (disableActions) {
            return;
        }

        const selectedAbility = hand[selectedAbilityIndex];
        if (!selectedAbility) {
            if (side === "allies") {
                if (index === selectedAllyIndex) {
                    setSelectedAllyIndex(null);
                } else if (isEligibleToAttack(allies[index])) {
                    setSelectedAllyIndex(index);
                } else if (alliesAttackedThisTurn.some((id) => id === allies[index]?.id)) {
                    setNotification({
                        severity: "warning",
                        text: "That character has already attacked this turn.",
                        id: uuid.v4(),
                    });
                }
                return;
            }

            if (side === "enemies" && isEligibleToAttack(allies[selectedAllyIndex])) {
                handleAllyAttack({ index });
            }
            return;
        }

        if (!canUseAbility(player, selectedAbility)) {
            return;
        }

        if (isValidTarget({ ability: selectedAbility, side, allies, index })) {
            handleAbilityUse({ index, selectedAbilityIndex, side });
        } else {
            setNotification({
                severity: "warning",
                text: `Please select a valid target for ${selectedAbility.name}.`,
                id: uuid.v4(),
            });
        }
    };

    const getAction = (character): Action => {
        // Returns the ability if the character is using it.
        if (recentActions[0]?.casterId === character?.id) {
            return recentActions[0]?.action;
        }
    };

    const drawCards = () => {
        let i = 0;
        let newDeck = deck.slice();
        let newDiscard = discard.slice();
        let newHand = [];
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
                if (i < CARDS_PER_DRAW) {
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

    useEffect(() => {
        const TURN_NOTIFICATION_WAIT_TIME = 1000;
        setShowTurnAnnouncement(true);

        setTimeout(() => {
            setShowTurnAnnouncement(false);

            if (isPlayerTurn) {
                updatePlayer((player) => ({
                    resources: Math.min(
                        player.maxResources,
                        player.resources + player.resourcesPerTurn
                    ),
                }));
                drawCards();
            } else {
                setHand([]);
                setDiscard([...hand, ...discard]);
                setRecentActions(enemyTurn({ enemies, allies }));
            }
        }, TURN_NOTIFICATION_WAIT_TIME);
    }, [isPlayerTurn]);

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
                    const battleEnd = getBattleEndResult({
                        enemies: updatedEnemies,
                        allies: updatedAllies,
                    });
                    if (battleEnd) {
                        setBattleEndResult(battleEnd);
                    } else {
                        setRecentActions(updatedRecentActions);
                    }
                }, 900);
            }, 400);
            return;
        }

        if (!isPlayerTurn) {
            setIsPlayerTurn(true);
            setAlliesAttackedThisTurn([]);
            setEnemies(enemies.map(updateEffects));
        }
        setIsPlayingAnimations(false);
    }, [recentActions]);

    const handleEndTurn = () => {
        setAllies(allies.map(updateEffects));
        setIsPlayerTurn(false);
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

    return (
        <div className={classes.root}>
            {notification && (
                <Notification
                    severity={notification.severity}
                    onClick={() => setNotification(null)}
                    id={notification.id}
                >
                    {notification.text}
                </Notification>
            )}
            {showTurnAnnouncement && <TurnAnnouncement isPlayerTurn={isPlayerTurn} />}
            <div className={classes.battlefieldContainer}>
                <div className={classes.battlefield}>
                    <div className={classes.combatantContainer}>
                        <div className={classes.combatants}>
                            {enemies.map((enemy, i: number) => (
                                <CombatantView
                                    combatant={enemy}
                                    isAlly={false}
                                    onClick={() =>
                                        handleTargetClick({
                                            index: i,
                                            side: "enemies",
                                        })
                                    }
                                    isSelected={false}
                                    onMouseEnter={() => setHoveredEnemyIndex(i)}
                                    onMouseLeave={() => setHoveredEnemyIndex(null)}
                                    isTargeted={isTargeted(i, "enemies")}
                                    key={i}
                                    action={getAction(enemy)}
                                    isHighlighted={false}
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
                                            onClick={() =>
                                                handleTargetClick({
                                                    index: i,
                                                    side: "allies",
                                                })
                                            }
                                            isSelected={selectedAllyIndex === i}
                                            onMouseEnter={() => setHoveredAllyIndex(i)}
                                            onMouseLeave={() => setHoveredAllyIndex(null)}
                                            isTargeted={isTargeted(i, "allies")}
                                            key={i}
                                            action={getAction(ally)}
                                            isHighlighted={
                                                selectedAllyIndex === null &&
                                                isEligibleToAttack(ally)
                                            }
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
                                    onClick={() => handleAbilityClick(i)}
                                    isSelected={isPlayerTurn && selectedAbilityIndex === i}
                                    key={i}
                                    ability={ability}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            {battleEndResult && (
                <BattleEndOverlay result={battleEndResult} onClickContinue={onBattleEnd} />
            )}
        </div>
    );
};

export default BattlefieldContainer;
