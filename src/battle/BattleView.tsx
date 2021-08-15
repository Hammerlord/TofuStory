import { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
import AbilityView from "../ability/AbilityView";
import { Ability, Action } from "../ability/types";
import PlayerView from "../character/PlayerView";
import { Combatant } from "../character/types";
import enemyTurn from "../enemy/enemyTurn";
import EnemyView from "../enemy/EnemyView";
import { shuffle } from "../utils";
import BattleEndOverlay from "./BattleEndOverlay";
import Deck from "./Deck";
import EndTurnButton from "./EndTurnButton";
import Notification from "./Notification";
import { Event, parsePlayerAbilityActions } from "./parseAbilityActions";
import TurnAnnouncement from "./TurnNotification";
import { canUseAbility, getBattleEndResult, isValidTarget, updateEffects } from "./utils";

const CARDS_PER_DRAW = 5;

const useStyles = createUseStyles({
    root: {
        width: "100%",
        height: "100%",
        position: "relative",
        background: "#968e72",
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
        width: "70rem",
        maxWidth: "100%",
        height: "100%",
        position: "relative",
        background: "#f5ebcb",
    },
    enemiesContainer: {
        position: "relative",
        height: "45%",
        width: "calc(100% - 32px)",
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
    const [notification, setNotification] = useState(null) as [
        BattleNotification,
        Function
    ];
    const [showTurnAnnouncement, setShowTurnAnnouncement] = useState(false);
    const [battleEndResult, setBattleEndResult] = useState(undefined);

    const player = allies.find((ally: Combatant | null) => ally && ally.isPlayer);

    const [selectedAbilityIndex, setSelectedAbilityIndex] = useState(null);
    const [hoveredEnemyIndex, setHoveredEnemyIndex] = useState(null);
    const classes = useStyles();

    const noMoreMoves =
        !hand.length || hand.every((ability) => !canUseAbility(player, ability));

    const handleAbilityClick = (i: number) => {
        if (!canUseAbility(player, hand[i])) {
            setNotification({
                severity: "warning",
                text: `Need more resources to use ${hand[i].name}.`,
            });
            return;
        }

        if (isPlayerTurn) {
            setSelectedAbilityIndex(i);
        }
    };

    const handleAbilityUse = ({ index, selectedAbilityIndex, side }) => {
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

    const handleTargetClick = ({ side, index }) => {
        const selectedAbility = hand[selectedAbilityIndex];
        if (disableActions || !canUseAbility(player, selectedAbility)) {
            return;
        }
        if (isValidTarget({ ability: selectedAbility, side })) {
            handleAbilityUse({ index, selectedAbilityIndex, side });
            setSelectedAbilityIndex(null);
        } else {
            setNotification({
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
                const { updatedEnemies, updatedAllies } =
                    updatedRecentActions.shift() as Event;
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
            setEnemies(enemies.map(updateEffects));
        }
        setIsPlayingAnimations(false);
    }, [recentActions]);

    const handleEndTurn = () => {
        setAllies(allies.map(updateEffects));
        setIsPlayerTurn(false);
    };

    const disableActions =
        isPlayingAbilityAnimations ||
        battleEndResult ||
        showTurnAnnouncement ||
        !isPlayerTurn;

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
                    <div className={classes.enemiesContainer}>
                        <div className={classes.enemies}>
                            {enemies.map((enemy, i: number) => (
                                <EnemyView
                                    enemy={enemy}
                                    onClick={() =>
                                        handleTargetClick({
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
                        <PlayerView
                            onClick={() =>
                                handleTargetClick({
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
                        <div className={classes.rightContainer}>
                            <EndTurnButton
                                disabled={disableActions}
                                highlight={noMoreMoves}
                                onClick={handleEndTurn}
                            />
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
            {battleEndResult && (
                <BattleEndOverlay
                    result={battleEndResult}
                    onClickContinue={onBattleEnd}
                />
            )}
        </div>
    );
};

export default BattlefieldContainer;
