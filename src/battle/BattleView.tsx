import classNames from "classnames";
import { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
import uuid from "uuid";
import AbilityView from "../ability/AbilityView";
import { Ability, Action, TARGET_TYPES } from "../ability/types";
import PlayerView from "../character/PlayerView";
import { Combatant } from "../character/types";
import { createEnemies } from "../enemy/createEnemy";
import enemyTurn from "../enemy/enemyTurn";
import EnemyView from "../enemy/EnemyView";
import { shuffle } from "../utils";
import Deck from "./Deck";
import Notification from "./Notification";
import { Event, parsePlayerAbilityActions } from "./parseAbilityActions";
import { updateEffects } from "./utils";
import { cloneDeep } from "lodash";

const useStyles = createUseStyles({
    battlefieldContainer: {
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyItems: "center",
    },
    battlefield: {
        textAlign: "center",
        margin: "auto",
        width: "70rem",
        maxWidth: "100%",
        height: "100%",
        position: "relative",
        background: "#f5ebcb",
    },
    enemiesContainer: {
        position: "relative",
        height: "45%",
        width: "width: calc(100% - 32px)",
        marginTop: "36px",
    },
    enemies: {
        display: "flex",
        margin: "auto",
        justifyContent: "space-evenly",
        borderBottom: "1px solid rgba(0, 0, 0, 0.15)",
        paddingBottom: "24px",
        marginBottom: "24px",
        position: "absolute",
        bottom: 0,
        width: "100%",
    },
    abilities: {
        position: "absolute",
        bottom: "32px",
        left: "50%",
        transform: "translateX(-50%)",
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
    endTurn: {
        padding: "8px 16px",
        background: "#ffd736",
        fontSize: "16px",
        fontWeight: "bold",
        borderRadius: "4px",
        border: "2px solid rgba(0, 0, 0, 0.3)",
        boxShadow: "1px 1px 3px rgba(0, 0, 0, 0.5)",
        "&.no-more-moves": {
            background: "#25b814",
            color: "white",
        },

        "&.disabled": {
            background: "#cccccc",
        },
    },
});

const Battlefield = ({
    enemies,
    hand,
    deck,
    discard,
    isPlayerTurn,
    allies,
    onTargetClick,
    disableActions,
    onClickEndTurn,
    showNotification,
    currentAction,
}) => {
    const player = allies.find(
        (ally: Combatant | null) => ally && ally.isPlayer
    );
    const canUseAbility = (ability): boolean => {
        if (!ability) {
            return false;
        }

        const { resourceCost = 0 } = ability;
        return resourceCost <= player.resources;
    };

    const [selectedAbilityIndex, setSelectedAbilityIndex] = useState(null);
    const [hoveredEnemyIndex, setHoveredEnemyIndex] = useState(null);
    const classes = useStyles();

    const noMoreMoves =
        !hand.length || hand.every((ability) => !canUseAbility(ability));

    const handleAbilityClick = (i: number) => {
        if (!canUseAbility(hand[i])) {
            showNotification({
                severity: "warning",
                text: `Need more resources to use ${hand[i].name}.`,
            });
            return;
        }

        if (isPlayerTurn) {
            setSelectedAbilityIndex(i);
        }
    };

    const isValidTarget = ({ ability, side, index }): boolean => {
        // Get the first action target to determine whether a valid target has been clicked.
        const { actions = [] } = ability;
        if (!actions[0]) {
            return true;
        }

        const { target } = actions[0];

        if (side === "allies") {
            return (
                target === TARGET_TYPES.FRIENDLY || target === TARGET_TYPES.SELF
            );
        }

        return target === TARGET_TYPES.HOSTILE;
    };

    const handleTargetClick = ({ target, side, index }) => {
        const selectedAbility = hand[selectedAbilityIndex];
        if (
            !selectedAbility ||
            disableActions ||
            !canUseAbility(selectedAbility)
        ) {
            return;
        }
        if (isValidTarget({ ability: selectedAbility, side, index })) {
            onTargetClick({ target, index, selectedAbilityIndex });
            setSelectedAbilityIndex(null);
        } else {
            showNotification({
                severity: "warning",
                text: `Please select a valid target for ${selectedAbility.name}.`,
            });
        }
    };

    const isAffectedByArea = (i: number | null): boolean => {
        const ability = hand[selectedAbilityIndex];
        if (!ability || hoveredEnemyIndex === null) {
            return false;
        }

        const { actions = [] } = ability;
        const { area = 0 } = actions[0] || {};
        return i >= hoveredEnemyIndex - area && i <= hoveredEnemyIndex + area;
    };

    const getAction = (character): Action => {
        // Returns the ability if the character is using it.
        if (currentAction?.casterId === character?.id) {
            return currentAction?.action;
        }
    };

    return (
        <div className={classes.battlefieldContainer}>
            <div className={classes.battlefield}>
                <div className={classes.enemiesContainer}>
                    <div className={classes.enemies}>
                        {enemies.map((enemy, i: number) => (
                            <EnemyView
                                enemy={enemy}
                                onClick={() =>
                                    handleTargetClick({
                                        target: enemy,
                                        index: i,
                                        side: "enemies",
                                    })
                                }
                                onMouseEnter={() => setHoveredEnemyIndex(i)}
                                onMouseLeave={() => setHoveredEnemyIndex(null)}
                                isAffectedByArea={
                                    !disableActions && isAffectedByArea(i)
                                }
                                key={i}
                                action={getAction(enemy)}
                            />
                        ))}
                    </div>
                </div>
                <div className={classes.playerContainer}>
                    <div className={classes.leftContainer}>
                        <Deck deck={deck} discard={discard} />
                    </div>
                    <div>
                        <div />
                        <PlayerView
                            onClick={() =>
                                handleTargetClick({
                                    target: player,
                                    index: null,
                                    side: "allies", // Ha
                                })
                            }
                            isAffectedByArea={
                                !disableActions && hand[selectedAbilityIndex]
                            }
                            player={player}
                            action={getAction(player)}
                        />
                    </div>
                    <div className={classes.rightContainer}>
                        <button
                            className={classNames(classes.endTurn, {
                                "no-more-moves": noMoreMoves,
                                disabled: !isPlayerTurn || disableActions,
                            })}
                            disabled={!isPlayerTurn || disableActions}
                            onClick={onClickEndTurn}
                        >
                            End Turn
                        </button>
                    </div>
                    <div className={classes.abilities}>
                        {hand.map((ability: Ability, i: number) => (
                            <AbilityView
                                onClick={() => handleAbilityClick(i)}
                                isSelected={
                                    isPlayerTurn && selectedAbilityIndex === i
                                }
                                key={i}
                                ability={ability}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const CARDS_PER_DRAW = 5;

const useBattlefieldContainerStyles = createUseStyles({
    root: {
        width: "100%",
        height: "100%",
        position: "relative",
        background: "#968e72",
    },
    turnNotification: {
        fontSize: "24px",
        fontWeight: "bold",
        background: "rgba(0, 0, 0, 0.75)",
        color: "white",
        textAlign: "center",
        position: "absolute",
        padding: "32px 48px",
        left: "50%",
        top: "50%",
        transform: "translateX(-50%) translateY(-50%)",
        zIndex: 5,
    },
});

interface BattleNotification {
    id: string; // For rerendering the same message if applicable
    text: string;
    severity: "warning" | "info" | "error";
}

const BattlefieldContainer = ({ player }) => {
    const [deck, setDeck] = useState(shuffle(player.deck));
    const [discard, setDiscard] = useState([]);
    const [hand, setHand] = useState([]);
    const [isPlayerTurn, setIsPlayerTurn] = useState(true);
    const [enemies, setEnemies] = useState(createEnemies());
    const [allies, setAllies] = useState([
        null,
        null,
        { ...cloneDeep(player), isPlayer: true },
        null,
        null,
    ]);
    const [recentActions, setRecentActions] = useState([]);
    const [isPlayingAbilityAnimations, setIsPlayingAbilityAnimations] =
        useState(false);
    const [notification, setNotification] = useState(null) as [
        BattleNotification,
        Function
    ];
    const [showTurnNotification, setShowTurnNotification] = useState(false);

    const classes = useBattlefieldContainerStyles();
    const discardHand = () => {
        setHand([]);
        setDiscard([...hand, ...discard]);
    };

    const enemiesAllDead = enemies.every((enemy) => !enemy || enemy.HP === 0);

    const drawCards = () => {
        let newDeck = deck.slice();
        let newDiscard = [...hand, ...discard];
        let newHand = newDeck.splice(0, CARDS_PER_DRAW);
        if (!newDeck.length) {
            newDeck = shuffle(newDiscard);
            newDiscard = [];
            newHand = [
                ...newHand,
                ...newDeck.splice(0, CARDS_PER_DRAW - newHand.length),
            ];
        }

        setDeck(newDeck);
        setHand(newHand);
        setDiscard(newDiscard);
    };

    const updatePlayer = (
        statChanges: Function | object
    ): (Combatant | null)[] => {
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

    const onPlayerTurnStart = () => {
        updatePlayer((player) => ({
            resources: Math.min(
                player.maxResources,
                player.resources + player.resourcesPerTurn
            ),
        }));
        drawCards();
    };

    useEffect(() => {
        if (isPlayingAbilityAnimations) {
            return;
        }

        if (enemiesAllDead) {
            setTimeout(() => {
                setEnemies(createEnemies());
            }, 1000);
        }
    }, [enemies, isPlayingAbilityAnimations]);

    useEffect(() => {
        const TURN_NOTIFICATION_WAIT_TIME = 1000;
        setShowTurnNotification(true);

        if (isPlayerTurn) {
            onPlayerTurnStart();
        }

        setTimeout(() => {
            setShowTurnNotification(false);

            if (!isPlayerTurn) {
                discardHand();
                setRecentActions(enemyTurn({ enemies, allies }));
            }
        }, TURN_NOTIFICATION_WAIT_TIME);
    }, [isPlayerTurn]);

    useEffect(() => {
        // Spaghetti play animations
        if (showTurnNotification) {
            return;
        }

        if (recentActions.length) {
            if (!isPlayingAbilityAnimations) {
                setIsPlayingAbilityAnimations(true);
            }

            setTimeout(() => {
                const updatedRecentActions = recentActions.slice();
                const recentAction = updatedRecentActions.shift() as Event;
                const { updatedEnemies, updatedAllies } = recentAction;
                setEnemies(updatedEnemies);
                setAllies(updatedAllies);
                setTimeout(() => {
                    setRecentActions(updatedRecentActions);
                }, 900);
            }, 400);
        } else {
            if (!isPlayerTurn) {
                setIsPlayerTurn(true);
                setShowTurnNotification(true);
                setEnemies(enemies.map(updateEffects));
            }
            setIsPlayingAbilityAnimations(false);
        }
    }, [recentActions]);

    const handleAbilityUse = ({
        target,
        index,
        selectedAbilityIndex,
        side,
    }) => {
        const newHand = hand.slice();
        const [card] = newHand.splice(selectedAbilityIndex, 1);
        const { resourceCost = 0, actions } = card as Ability;

        let recentAllies = allies;
        if (resourceCost) {
            recentAllies = updatePlayer((player) => ({
                resources: player.resources - resourceCost,
            }));
        }

        setRecentActions(
            parsePlayerAbilityActions({
                actions,
                targetIndex: index,
                enemies,
                allies: recentAllies,
                side,
                resourceCost,
                casterId: player.id,
            })
        );
        setDiscard([card, ...discard]);
        setHand(newHand);
    };

    const handleEndTurn = () => {
        setAllies(allies.map(updateEffects));
        setIsPlayerTurn(false);
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
            {showTurnNotification && (
                <div className={classes.turnNotification}>
                    {isPlayerTurn ? "Player Turn" : "Enemy Turn"}
                </div>
            )}
            <Battlefield
                allies={allies}
                enemies={enemies}
                deck={deck}
                discard={discard}
                hand={hand}
                isPlayerTurn={isPlayerTurn}
                onTargetClick={handleAbilityUse}
                disableActions={
                    isPlayingAbilityAnimations ||
                    enemiesAllDead ||
                    showTurnNotification
                }
                onClickEndTurn={handleEndTurn}
                showNotification={(notification) =>
                    setNotification({
                        ...notification,
                        id: uuid.v4(),
                    })
                }
                currentAction={recentActions[0]}
            />
        </div>
    );
};

export default BattlefieldContainer;
