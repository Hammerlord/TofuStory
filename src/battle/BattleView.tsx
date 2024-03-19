import React, { MutableRefObject, useEffect, useMemo, useRef, useState } from "react";
import { createUseStyles } from "react-jss";
import uuid from "uuid";
import { ResourceIcon } from "../ability/AbilityView/ResourceIcon";
import { resourceClassNameMap } from "../ability/AbilityView/constants";
import { getAbilityColor, getAbilityUpgradedFromEffects } from "../ability/AbilityView/utils";
import {
    ACTION_TYPES,
    Ability,
    Action,
    CombatAbility,
    CombatEffect,
    EFFECT_EVENT_KEYS,
    Effect,
    SELECT_CARD_TYPES,
    TARGET_TYPES,
    TRIGGER_TARGET_TYPES,
} from "../ability/types";
import { PreviewStatUpdate } from "../character/AbilityPreview";
import CombatantView from "../character/CombatantView";
import { Combatant, Player } from "../character/types";
import { useAppDispatch, useAppSelector } from "../hooks";
import EffectGroupIcon from "../icon/EffectGroupIcon";
import Icon from "../icon/Icon";
import { ClearImage, ClickIndicatorImage, HasteImage, LithRegionBGImage, MapleLeavesImage } from "../images";
import Tooltip from "../view/Tooltip";
import AnimationCanvas from "./AnimationCanvas";
import ClearOverlay from "./ClearOverlay";
import Deck from "./Deck";
import Discard from "./Discard";
import EndTurnButton from "./EndTurnButton";
import Hand from "./Hand";
import AbilityNotification from "./Notification/AbilityNotification";
import Notification from "./Notification/Notification";
import TurnAnnouncement from "./Notification/TurnNotification";
import SelectCardOverlay from "./SelectCardOverlay";
import TargetLineCanvas from "./TargetLineCanvas";
import WaveInfo from "./WaveInfo";
import { calculateTargetIndices, checkEventTrigger, findCombatantData, stageStatChanges, useAbility } from "./actions/actions";
import { applyAbilityEventEffects } from "./actions/cardActions";
import { endEnemyTurn, startEnemyTurn } from "./actions/enemyTurn";
import { getUpdatedStats } from "./actions/getUpdatedStats";
import { nextWave, onBattleEnd, onBattleStart, onWaveClear, onWaveStart } from "./actions/phases";
import { onSummonAttack, onUsePlayerAbility, playerEndTurn, startPlayerTurn } from "./actions/playerTurn";
import { MAX_HAND_SIZE, TURN_ANNOUNCEMENT_TIME, battleWarnings } from "./constants";
import { passesConditions } from "./passesConditions";
import { BATTLE_STATES, BattleState, PlayerSelectCardsPrompt, battleStateSlice } from "./reducer";
import { BATTLEFIELD_SIDES, CombatantInfo, Event, TRIGGER_SOURCE_TYPES, TriggerSource } from "./types";
import { canTargetIfStealthed, canUseAbility, getEnabledEffects, isValidTarget, isWithinAbilityArea } from "./utils";

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
        height: "70%",
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
        filter: "drop-shadow(2px 2px 5px rgba(0, 0, 0, 0.3))",
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
        maxHeight: "90",
        height: "8vh",
        borderBottom: "2px solid rgba(0, 0, 0, 0.1)",
        width: "95%",
        margin: "auto",
        marginBottom: "32px",
    },
    abilityContainer: {
        position: "absolute",
        bottom: "3.5vh",
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
        height: "100%",
    },
    rightContainer: {
        position: "absolute",
        right: "32px",
        top: "0",
        height: "100%",
    },
    deckContainer: {
        position: "absolute",
        bottom: 90,
    },
    discardContainer: {
        position: "absolute",
        bottom: 90,
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
        top: "42%",
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
    clickIndicator: {
        top: -50,
        transform: "translateX(-50%)",
        left: "50%",
        position: "absolute",
    },
    placeCardIntoDeckContainer: {
        position: "absolute",
        bottom: -75,
        left: "50%",
        transform: "translateX(-50%)",
    },
});

const BATTLEFIELD_SIZE = 5;

const { popEventQueue, updateBattleState, updateBattle, promptPlayerSelectCards, closePlayerSelectCardsPrompt, setNotification } =
    battleStateSlice.actions;

const movementAbility: Ability = {
    name: "Move",
    image: HasteImage,
    resourceCost: 0,
    actions: [
        {
            target: TARGET_TYPES.MOVE,
            type: ACTION_TYPES.MOVEMENT,
            movement: 2,
        },
    ],
};

const BattlefieldContainer = () => {
    const dispatch = useAppDispatch();
    const state = useAppSelector((state) => state);
    const {
        deck,
        discard,
        depleted,
        hand: baseHand,
        isPlayerTurn,
        enemySide,
        playerSide,
        eventQueue: events,
        charactersAttackedThisTurn,
        currentWaveIndex,
        waves,
        selectCardsPrompt,
        state: battleState,
        notification,
        backgroundImage,
        round,
        isTutorial,
    }: BattleState = state.battle;
    const player: Player = playerSide.find((c: Combatant | Player | null) => c?.isPlayer) as Player;

    const getCharacterRefs = () => Array.from({ length: BATTLEFIELD_SIZE }).map(() => React.createRef()) as React.RefObject<HTMLElement>[];

    const allyRefs: React.RefObject<HTMLElement>[] = useMemo(getCharacterRefs, []);
    const enemyRefs: React.RefObject<HTMLElement>[] = useMemo(getCharacterRefs, []);
    const abilityRefs = useMemo(() => Array.from({ length: MAX_HAND_SIZE }).map(() => React.createRef()), []);
    const battlefieldRef: React.RefObject<HTMLDivElement> = React.createRef();
    const deckRef: React.RefObject<HTMLDivElement> = React.createRef();
    const discardRef: React.RefObject<HTMLDivElement> = React.createRef();
    const depleteRef: React.RefObject<HTMLDivElement> = React.createRef();

    const [showTurnAnnouncement, setShowTurnAnnouncement] = useState(false);
    const [showWaveClear, setShowWaveClear] = useState(false);
    const [selectedAbilityId, setSelectedAbilityId] = useState(null); // From the hand only
    const [hoveredCombatant, setHoveredCombatant]: [{ side: BATTLEFIELD_SIDES; index: number; id: string }, Function] = useState(null);
    const [selectedAllyIndex, setSelectedAllyIndex] = useState(null);
    const classes = useStyles({ backgroundImage } as any);
    const { winCondition = {}, description: waveDescription } = waves[currentWaveIndex] || {};

    const hand = useMemo(() => baseHand.map((ability) => getAbilityUpgradedFromEffects({ ability, combatant: player })), [baseHand]);

    // Look up special effects that allow the player to do extra actions on the battlefield
    const { moveCardFromHandToDeckEffects, allowFriendlyMovement } = useMemo(() => {
        return player?.effects.reduce(
            (acc, effect: CombatEffect) => {
                const moveCardFromHandToDeckEffects = [...acc.moveCardFromHandToDeckEffects];
                if (effect.allowMoveCardFromHandToDeck) {
                    moveCardFromHandToDeckEffects.push(effect);
                }
                return {
                    ...acc,
                    moveCardFromHandToDeckEffects,
                    allowFriendlyMovement: effect.allowFriendlyMovement || acc.allowFriendlyMovement,
                };
            },
            { moveCardFromHandToDeckEffects: [], allowFriendlyMovement: false }
        );
    }, [player]);

    const allowMoveCardFromHandToDeck = moveCardFromHandToDeckEffects.length > 0;

    const isWinConditionTriggered = (() => {
        if (winCondition.defeatBoss) {
            return enemySide.every((enemy) => !enemy?.isBoss || enemy?.HP <= 0);
        }

        // +1 to account for 0 based start
        if (winCondition.surviveRounds && round === winCondition.surviveRounds + 1) {
            return true;
        }

        return enemySide.every((enemy) => !enemy || enemy.HP <= 0);
    })();

    const disableActions = !isPlayerTurn || battleState !== BATTLE_STATES.TURN_IN_PROGRESS || isWinConditionTriggered || selectCardsPrompt;
    const selectedMinion = playerSide[selectedAllyIndex];
    const selectedAbilityFromHand = hand.find(({ instanceId }) => instanceId === selectedAbilityId);
    const abilityToUse = selectedAbilityFromHand || selectedMinion?.abilities?.[0];

    const actorId: string | undefined = (selectedMinion || player)?.id;

    const isEligibleToAttack = (ally: Combatant): boolean => {
        if (!ally || ally.isPlayer || ally.HP === 0) {
            return false;
        }
        const damageFromEffects = getEnabledEffects({ combatantInfo: findCombatantData(() => state, ally.id) }).reduce(
            (acc: number, { attackPower = 0 }) => acc + attackPower,
            0
        );

        const allyAttackDamage = ally.abilities.reduce((acc, ability) => {
            ability?.actions?.forEach((action) => {
                acc += action.damage || 0;
            });

            return acc;
        }, 0);

        const totalDamage = allyAttackDamage + damageFromEffects;
        return totalDamage > 0 && charactersAttackedThisTurn.every((id) => id !== ally.id);
    };

    const noMoreMoves =
        playerSide.every((ally) => !isEligibleToAttack(ally)) && (!hand.length || hand.every((ability) => !canUseAbility(player, ability)));

    const warn = (text: string | JSX.Element) => {
        dispatch(
            setNotification({
                severity: "warning",
                text,
                id: uuid.v4(),
            })
        );
    };

    const warnNeedMoreResources = (card: CombatAbility) => {
        warn(
            <div>
                Need more <ResourceIcon playerClass={player.class} /> {resourceClassNameMap[player.class]} to use {card.name}.
            </div>
        );
    };

    const handleAbilityClick = (e: React.ChangeEvent, id: string) => {
        if (selectCardsPrompt) {
            warn(battleWarnings.promptFinishSelecting);
            return;
        }

        if (disableActions) {
            return;
        }

        setSelectedAllyIndex(null);
        const ability = hand.find((card: CombatAbility) => card.instanceId === id);
        if (!allowMoveCardFromHandToDeck) {
            if (!canUseAbility(player, ability)) {
                warnNeedMoreResources(ability);
                return;
            }

            if (ability.unplayable) {
                warn(battleWarnings.unplayable);
                return;
            }
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

    const handleSelectCardFromPrompt = () => {
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
        if (selectedAbilityFromHand.selectCards.type === SELECT_CARD_TYPES.DEPLETE_FROM_HAND) {
            if (hand.length <= 1) {
                warn(battleWarnings.depleteMinCardInHand);
                return;
            }
        } else if (selectedAbilityFromHand.selectCards.type === SELECT_CARD_TYPES.HAND_TO_TOP_DECK) {
            if (hand.length <= 1) {
                warn(battleWarnings.moveToDeckMinCardInHand);
                return;
            }
        }

        dispatch(
            promptPlayerSelectCards({
                selectCards: selectedAbilityFromHand.selectCards,
                abilityQueued: { selectedAbilityId, selectedTargetSide: side, selectedTargetIndex: selectedIndex },
            } as PlayerSelectCardsPrompt)
        );
    };

    const handleAllyClick = (e: React.ChangeEvent, index: number) => {
        if (selectCardsPrompt) {
            warn(battleWarnings.promptFinishSelecting);
            return;
        }

        if (disableActions) {
            return;
        }

        if (selectedAbilityFromHand) {
            if (shouldShowReticle(BATTLEFIELD_SIDES.PLAYER_SIDE, index)) {
                if (selectedAbilityFromHand.selectCards) {
                    handleSelectCardsPrerequisite({ side: BATTLEFIELD_SIDES.ENEMY_SIDE, selectedIndex: index });
                    return;
                }

                if (selectedAbilityFromHand.actions.some((action) => action.retrieveDepletedCards)) {
                    if (depleted.length === 0) {
                        warn(battleWarnings.minDepleted);
                        return;
                    }
                }

                handleAbilityUse({ selectedIndex: index, side: BATTLEFIELD_SIDES.PLAYER_SIDE });
            } else {
                if (!canUseAbility(player, selectedAbilityFromHand)) {
                    warnNeedMoreResources(selectedAbilityFromHand);
                }
                setSelectedAbilityId(null);
            }
            return;
        }

        if (selectedMinion) {
            if (playerSide[index] !== selectedMinion && allowFriendlyMovement) {
                dispatch(
                    useAbility({
                        ability: movementAbility,
                        selectedIndex: index,
                        side: BATTLEFIELD_SIDES.PLAYER_SIDE,
                        actorId: selectedMinion?.id || player.id,
                    })
                );
            } else {
                setSelectedAllyIndex(null);
            }
            return;
        }

        if (isEligibleToAttack(playerSide[index]) || (allowFriendlyMovement && playerSide[index])) {
            setSelectedAllyIndex(index);
            e.stopPropagation(); // Prevent the click from going to the battlefield, which deselects abilities/allies
        }
    };

    const warnStealth = () => {
        warn(battleWarnings.targetStealth);
    };

    const handleEnemyClick = (e: React.ChangeEvent, index: number) => {
        if (selectedMinion) {
            if (shouldShowReticle(BATTLEFIELD_SIDES.ENEMY_SIDE, index)) {
                handleAllyAttack({ index });
            } else if (!canTargetIfStealthed(selectedMinion, enemySide[index])) {
                warnStealth();
            } else {
                setSelectedAllyIndex(null);
            }
            return;
        }

        if (selectedAbilityFromHand) {
            if (shouldShowReticle(BATTLEFIELD_SIDES.ENEMY_SIDE, index)) {
                if (selectedAbilityFromHand.selectCards) {
                    handleSelectCardsPrerequisite({ side: BATTLEFIELD_SIDES.ENEMY_SIDE, selectedIndex: index });
                    return;
                }

                handleAbilityUse({ selectedIndex: index, side: BATTLEFIELD_SIDES.ENEMY_SIDE });
            } else if (!canTargetIfStealthed(player, enemySide[index])) {
                warnStealth();
            } else {
                if (!canUseAbility(player, selectedAbilityFromHand)) {
                    warnNeedMoreResources(selectedAbilityFromHand);
                }
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
            dispatch(
                setNotification({
                    text: Array.isArray(description) ? description[i] : description,
                    id: uuid.v4(),
                })
            );
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
        imageUrls.push(ClearImage);

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
            dispatch(updateBattleState(BATTLE_STATES.WAVE_END));
        } else if (battleState === BATTLE_STATES.TURN_ENDING) {
            setTimeout(() => {
                dispatch(updateBattle({ isPlayerTurn: !isPlayerTurn }));
                dispatch(updateBattleState(BATTLE_STATES.TURN_START));
            }, 500);
        }

        // Prevent duplicate battle states from triggering consecutively
        if (battleStateRef?.current === battleState) {
            return;
        }

        const prevBattleState = battleStateRef.current;
        battleStateRef.current = battleState;
        if (battleState === BATTLE_STATES.BATTLE_START) {
            setTimeout(() => {
                dispatch(onBattleStart());
                dispatch(updateBattleState(BATTLE_STATES.WAVE_START));
            }, 500);
            return;
        }

        if (battleState === BATTLE_STATES.WAVE_START) {
            setTimeout(() => {
                dispatch(onWaveStart());
                dispatch(updateBattleState(BATTLE_STATES.TURN_START));
            }, 500);
            return;
        }

        if (battleState === BATTLE_STATES.TURN_START) {
            setShowTurnAnnouncement(true);
            setTimeout(() => {
                setShowTurnAnnouncement(false);
                // Brittle: "Turn in progress" state can interfere with ending enemy turns that are too short, causing their turn to get stuck.
                // So move it up here before turn happens. The "turn in progress" event itself happens in the startPlayer/EnemyTurn function anyway.
                dispatch(updateBattleState(BATTLE_STATES.TURN_IN_PROGRESS));

                if (isPlayerTurn) {
                    dispatch(startPlayerTurn(prevBattleState === BATTLE_STATES.WAVE_START));
                } else {
                    dispatch(startEnemyTurn());
                }
            }, TURN_ANNOUNCEMENT_TIME);
            return;
        }

        if (battleState === BATTLE_STATES.TURN_END) {
            if (isPlayerTurn) {
                dispatch(playerEndTurn());
            } else {
                dispatch(endEnemyTurn());
            }

            dispatch(updateBattleState(BATTLE_STATES.TURN_ENDING));
        }

        if (battleState === BATTLE_STATES.WAVE_END) {
            setTimeout(() => {
                setShowWaveClear(true);

                setTimeout(() => {
                    setShowWaveClear(false);
                    dispatch(onWaveClear());
                    if (waves[currentWaveIndex + 1]) {
                        dispatch(nextWave());
                        dispatch(updateBattleState(BATTLE_STATES.WAVE_START));
                    } else {
                        dispatch(onBattleEnd());
                    }
                }, TURN_ANNOUNCEMENT_TIME);
            }, 1000);
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

        if (events.length > 0) {
            const timeout = setTimeout(() => {
                dispatch(popEventQueue());
            }, events[0].playbackTime);

            return () => clearTimeout(timeout);
        }
        eventQueueRef.current = events;
    }, [events, battleState, isWinConditionTriggered]);

    const isTargeted = (side: BATTLEFIELD_SIDES, i: number | null): boolean => {
        const isValidIndex = (index: any) => typeof index === "number";
        const noHover = !isValidIndex(hoveredCombatant?.index);
        const mismatchingSide = side !== hoveredCombatant?.side;
        if (disableActions || noHover || mismatchingSide) {
            return false;
        }

        const hoveredIndex = hoveredCombatant?.index;

        return (
            isValidTarget({ ability: abilityToUse, side, index: hoveredIndex, getState: () => state, actorId }) &&
            isWithinAbilityArea({ ability: abilityToUse, actor: actorId, selectedIndex: hoveredIndex, targetIndex: i })
        );
    };

    /**
     * When selecting an ability, if a reticle should appear on a combatant, it means that combatant is a valid target.
     */
    const shouldShowReticle = (combatantSide: BATTLEFIELD_SIDES, combatantIndex: number): boolean => {
        if (selectedAbilityFromHand && !canUseAbility(player, selectedAbilityFromHand)) {
            return false;
        }

        const moveAbility = allowFriendlyMovement && selectedMinion ? movementAbility : undefined;

        if (!abilityToUse && !moveAbility) {
            return false;
        }

        const checkValidTargetForAbility = (ability) => {
            if (
                isValidTarget({
                    ability,
                    side: combatantSide,
                    index: combatantIndex,
                    getState: () => state,
                    actorId,
                })
            ) {
                if (
                    !hoveredCombatant ||
                    !isValidTarget({
                        ability,
                        side: hoveredCombatant.side,
                        index: hoveredCombatant.index,
                        getState: () => state,
                        actorId,
                    })
                ) {
                    return true;
                }

                return isWithinAbilityArea({
                    ability,
                    actor: actorId,
                    selectedIndex: hoveredCombatant?.index,
                    targetIndex: combatantIndex,
                });
            }
        };

        return checkValidTargetForAbility(abilityToUse) || checkValidTargetForAbility(moveAbility);
    };

    const abilityIndex = hand.findIndex(({ instanceId }) => selectedAbilityId === instanceId);

    const origination = useMemo(() => {
        if (disableActions) {
            return null;
        }
        return allyRefs[selectedAllyIndex]?.current || abilityRefs[abilityIndex]?.current;
    }, [disableActions, selectedAllyIndex, selectedAbilityId, allyRefs[selectedAllyIndex]?.current || abilityRefs[abilityIndex]?.current]);

    const showMovementAbility =
        allowFriendlyMovement &&
        selectedMinion &&
        (hoveredCombatant?.side === BATTLEFIELD_SIDES.PLAYER_SIDE || !selectedMinion?.abilities?.length);
    const targetLineColor = getAbilityColor(selectedAbilityFromHand || (showMovementAbility && movementAbility));

    const { targetSide, selectedIndex } = (events[0] as Event) || {};
    const targets = targetSide === BATTLEFIELD_SIDES.PLAYER_SIDE ? allyRefs : enemyRefs;

    const combatantEvent = {
        ...events[0],
        // targetRef is used for weapon positioning
        targetRef: targets[selectedIndex]?.current,
    };

    const handleClickDeck = () => {
        if (!selectedAbilityId || !allowMoveCardFromHandToDeck) {
            return;
        }

        setSelectedAbilityId(null);

        const newHand = baseHand.slice();
        const newDeck = deck.slice();
        const cardIndex = newHand.findIndex(({ instanceId }) => instanceId === selectedAbilityId);
        const [card] = newHand.splice(cardIndex, 1);
        if (card) {
            newDeck.unshift(applyAbilityEventEffects({ event: card.onLeaveHand, ability: card }));
        }

        dispatch(
            updateBattle({
                hand: newHand,
                deck: newDeck,
            })
        );

        dispatch(
            checkEventTrigger({
                combatantId: player.id,
                effectEventKey: EFFECT_EVENT_KEYS.onMoveCardFromHandToDeck,
            })
        );
    };

    const abilityUsePreviews = ((): { [combatantId: string]: PreviewStatUpdate[] } => {
        const selectedAbility = selectedMinion?.abilities[0] || selectedAbilityFromHand;
        if (hoveredCombatant?.side !== BATTLEFIELD_SIDES.ENEMY_SIDE || !selectedAbility) {
            return {};
        }
        const result = {};

        const previousCombatantStates = {
            battle: {
                playerSide: [...playerSide],
                enemySide: [...enemySide],
            },
        };

        selectedAbility.actions.forEach((action: Action) => {
            if (![TARGET_TYPES.HOSTILE, TARGET_TYPES.RANDOM_HOSTILE].includes(action.target)) {
                return;
            }

            const actorData = findCombatantData(() => previousCombatantStates, actorId);
            const targetData = findCombatantData(() => previousCombatantStates, hoveredCombatant.id);

            const getCalculationTarget = (calculationTarget: TRIGGER_TARGET_TYPES): CombatantInfo => {
                if (calculationTarget === TRIGGER_TARGET_TYPES.ACTOR) {
                    return actorData;
                }

                if (calculationTarget === TRIGGER_TARGET_TYPES.TARGET) {
                    return targetData;
                }
            };

            const actionParent = {
                ...selectedAbility,
                resourceCost: selectedAbility.resourceCost === "x" ? player.resources : selectedAbility.resourceCost,
            };
            const source: TriggerSource = { source: actionParent, type: TRIGGER_SOURCE_TYPES.ABILITY, triggerHistory: [] };

            if (
                !passesConditions({
                    getCalculationTarget,
                    proc: action,
                    source,
                })
            ) {
                return;
            }

            const targetIndices = calculateTargetIndices({
                action,
                selectedIndex: hoveredCombatant.index,
                side: hoveredCombatant.side,
                actorData,
                targetData,
                battle: state.battle,
                disableRollExtraTargets: true,
            });

            const targetIds = targetIndices.map((i: number) => enemySide[i]?.id);

            const updatedStatsProperties = {
                actorId,
                targetIds,
                selectedIndex: hoveredCombatant.index,
                action,
                getCombatantById: (id: string) => findCombatantData(() => previousCombatantStates, id),
                actionParent,
                source,
                hand,
                deck,
                discard,
            };

            getUpdatedStats(updatedStatsProperties).forEach(([statUpdate, action]) => {
                const combatantId = statUpdate.combatantId;
                if (!result[combatantId]) {
                    result[combatantId] = [];
                }

                const combatantInfo = findCombatantData(() => previousCombatantStates, combatantId);
                if (!combatantInfo?.combatant) {
                    return;
                }

                const { index, combatant, friendlySide } = combatantInfo;
                const hasRandomSecondaryTargets = action.numTargets && hoveredCombatant.index !== index;

                const staging = stageStatChanges(statUpdate, combatant);
                // If it's a multi-hit attack being previewed, we want to update the previous combatant state so we can get a more accurate preview of the proceeding hits
                previousCombatantStates.battle[friendlySide][index] = staging;
                const targetsRandomly =
                    action.target === TARGET_TYPES.RANDOM_HOSTILE || actorData?.combatant?.effects.some((e) => e.hitRandomTarget);

                result[combatantId].push({
                    statUpdate,
                    nondeterministic: hasRandomSecondaryTargets || targetsRandomly,
                    action,
                });
            });

            // For abilities like Combo Fury which gain damage when you attack
            const recentActor = findCombatantData(() => previousCombatantStates, actorId);
            if (recentActor) {
                const friendly = previousCombatantStates.battle[recentActor.friendlySide];
                if (friendly?.[recentActor.index]) {
                    friendly[recentActor.index] = {
                        ...recentActor.combatant,
                        turnHistory: [...(recentActor.combatant.turnHistory || []), action],
                    };
                }
            }
        });

        return result;
    })();

    return (
        <TargetLineCanvas originationRef={origination} color={targetLineColor}>
            <div className={classes.root} onClick={handleBattlefieldClick}>
                {notification && (
                    <div className={classes.notificationContainer}>
                        <Notification severity={notification.severity} onClick={() => dispatch(setNotification(null))} id={notification.id}>
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
                    <div className={classes.battlefield} ref={battlefieldRef}>
                        <div className={classes.waves}>
                            <WaveInfo waves={waves} currentWaveIndex={currentWaveIndex} round={round} />
                        </div>
                        <div className={classes.combatantContainer}>
                            <div className={classes.combatants}>
                                {(events[0]?.enemySide || enemySide).map((enemy, i: number) => (
                                    <CombatantView
                                        combatant={enemy}
                                        isEnemy={true}
                                        onClick={(e) => handleEnemyClick(e, i)}
                                        isSelected={false}
                                        onMouseEnter={() =>
                                            setHoveredCombatant({ side: BATTLEFIELD_SIDES.ENEMY_SIDE, index: i, id: enemy?.id })
                                        }
                                        onMouseLeave={() => setHoveredCombatant(null)}
                                        isTargeted={isTargeted(BATTLEFIELD_SIDES.ENEMY_SIDE, i)}
                                        key={enemy?.id || i}
                                        event={combatantEvent}
                                        events={events}
                                        isHighlighted={false}
                                        showReticle={shouldShowReticle(BATTLEFIELD_SIDES.ENEMY_SIDE, i)}
                                        previewStatUpdate={abilityUsePreviews[enemy?.id]}
                                        selectedAbility={abilityToUse}
                                        ref={enemyRefs[i]}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className={classes.divider} />
                        <div className={classes.playerContainer}>
                            <div className={classes.leftContainer}>
                                <div className={classes.deckContainer}>
                                    <Deck
                                        deck={deck}
                                        viewDeckInOrder={player?.effects.some((effect: Effect) => effect.viewDeckInOrder)}
                                        onClickDeck={handleClickDeck}
                                        highlightDeck={Boolean(selectedAbilityId && allowMoveCardFromHandToDeck)}
                                        deckRef={deckRef}
                                    />
                                    {allowMoveCardFromHandToDeck && (
                                        <Tooltip title="Select a card in your hand to place it onto your deck.">
                                            <span className={classes.placeCardIntoDeckContainer}>
                                                <EffectGroupIcon
                                                    effects={moveCardFromHandToDeckEffects}
                                                    owner={player}
                                                    disableTooltip={true}
                                                />
                                            </span>
                                        </Tooltip>
                                    )}
                                </div>
                            </div>
                            <div className={classes.combatantContainer}>
                                <div className={classes.combatants}>
                                    {(events[0]?.playerSide || playerSide).map((ally, i) => {
                                        return (
                                            <CombatantView
                                                combatant={ally}
                                                isEnemy={false}
                                                onClick={(e) => handleAllyClick(e, i)}
                                                isSelected={selectedAllyIndex === i}
                                                onMouseEnter={() =>
                                                    setHoveredCombatant({ side: BATTLEFIELD_SIDES.PLAYER_SIDE, index: i, id: ally?.id })
                                                }
                                                onMouseLeave={() => setHoveredCombatant(null)}
                                                isTargeted={isTargeted(BATTLEFIELD_SIDES.PLAYER_SIDE, i)}
                                                key={ally?.id || i}
                                                event={combatantEvent}
                                                events={events}
                                                isHighlighted={isPlayerTurn && selectedAllyIndex === null && isEligibleToAttack(ally)}
                                                showReticle={shouldShowReticle(BATTLEFIELD_SIDES.PLAYER_SIDE, i)}
                                                selectedAbility={abilityToUse}
                                                ref={allyRefs[i]}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                            <div className={classes.rightContainer}>
                                {isTutorial && noMoreMoves && !disableActions && (
                                    <div className={classes.clickIndicator}>
                                        <Icon icon={ClickIndicatorImage} />
                                    </div>
                                )}
                                <EndTurnButton
                                    disabled={disableActions}
                                    highlight={noMoreMoves}
                                    onClick={() => {
                                        dispatch(updateBattleState(BATTLE_STATES.TURN_END));
                                    }}
                                />
                                <div className={classes.discardContainer}>
                                    <Discard discard={discard} depleted={depleted} discardRef={discardRef} depleteRef={depleteRef} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <AnimationCanvas
                        event={events[0]}
                        battlefieldRef={battlefieldRef}
                        allyRefs={allyRefs}
                        enemyRefs={enemyRefs}
                        deckRef={deckRef}
                        discardRef={discardRef}
                        depleteRef={depleteRef}
                        initialBattlefield={{ playerSide, enemySide }}
                    />
                    <div className={classes.abilityContainer}>
                        {!selectedAbilityFromHand && !disableActions && isTutorial && !noMoreMoves && (
                            <div className={classes.clickIndicator}>
                                Click <br />
                                <Icon icon={ClickIndicatorImage} />
                            </div>
                        )}
                        <Hand
                            className={classes.abilities}
                            hand={hand}
                            refs={abilityRefs}
                            selectedAbilityId={selectedAbilityId}
                            onAbilityClick={handleAbilityClick}
                        />
                    </div>
                </div>
                {showWaveClear && (
                    <ClearOverlay labelText={waves[currentWaveIndex + 2] ? `Next: Wave ${currentWaveIndex + 2}` : undefined} />
                )}
                {showTurnAnnouncement && <TurnAnnouncement isPlayerTurn={isPlayerTurn} duration={TURN_ANNOUNCEMENT_TIME} />}
                {selectCardsPrompt && !events.length && !isWinConditionTriggered && (
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
