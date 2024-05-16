import { cloneDeep } from "lodash";
import React, { MutableRefObject, useEffect, useMemo, useRef, useState } from "react";
import { createUseStyles } from "react-jss";
import uuid from "uuid";
import { getDamageStatistics } from "../ability/AbilityView/DamageIcon";
import { ResourceIcon } from "../ability/AbilityView/ResourceIcon";
import { resourceClassNameMap } from "../ability/AbilityView/constants";
import { getAbilityColor, getAbilityUpgradedFromEffects } from "../ability/AbilityView/utils";
import {
    ACTION_TYPES,
    Ability,
    CombatAbility,
    CombatEffect,
    EFFECT_EVENT_KEYS,
    EFFECT_TYPES,
    Effect,
    SELECT_CARD_TYPES,
    TARGET_TYPES,
} from "../ability/types";
import { PreviewStatUpdate } from "../character/AbilityPreview";
import CombatantView from "../character/CombatantView";
import { getNextTelegraphedAbility } from "../character/Telegraph";
import getAbilityPreviews from "../character/getAbilityPreviews";
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
import ParticleCanvas from "./ParticleCanvas";
import SelectCardOverlay from "./SelectCardOverlay";
import TargetLineCanvas from "./TargetLineCanvas";
import WaveInfo from "./WaveInfo";
import { checkEventTrigger, findCombatantData, useAbility } from "./actions/actions";
import { applyAbilityEventEffects } from "./actions/cardActions";
import { endEnemyTurn, enemyMoves, startEnemyTurn } from "./actions/enemyTurn";
import { nextWave, onBattleEnd, onBattleStart, onWaveClear, onWaveStart } from "./actions/phases";
import { initiatePlayerTurnInProgress, onSummonAttack, playerEndTurn, startPlayerTurn, useHandAbility } from "./actions/playerTurn";
import { TURN_ANNOUNCEMENT_TIME, battleWarnings } from "./constants";
import { BATTLE_STATES, BattleState, PlayerSelectCardsPrompt, battleStateSlice } from "./reducer";
import { BATTLEFIELD_SIDES, CombatantInfo, Event } from "./types";
import {
    canTargetIfStealthed,
    canUseAbility,
    getCardByInstanceId,
    hasEffectType,
    isTurnActionPrevented,
    isUntargetable,
    isValidTarget,
    isWithinAbilityArea,
} from "./utils";

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
        minHeight: "700px",
        display: "flex",
        flexDirection: "column",
        justifyItems: "center",
        marginTop: "100px",
    },
    battlefield: {
        textAlign: "center",
        margin: "auto",
        width: "96%",
        minWidth: 1350,
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
        minHeight: "30%",
        margin: "auto",
        maxHeight: 225,
    },
    combatants: {
        display: "flex",
        margin: "auto",
        justifyContent: "space-evenly",
        gap: 24,
        maxWidth: "70rem",
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
        left: "50%",
        transform: "translateX(-50%)",
        textAlign: "center",
        bottom: "0",
    },
    [`@media (min-height: 950px)`]: {
        abilityContainer: {
            bottom: "3.5vh",
        },
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
    cardsPlayedCounter: {
        background: "rgba(0, 0, 0, 0.7)",
        padding: "4px 8px",
        borderRadius: "4px",
        color: "white",
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

    const allyRefs: React.RefObject<HTMLElement>[] = Array.from({ length: BATTLEFIELD_SIZE }).map(() => useRef());
    const enemyRefs: React.RefObject<HTMLElement>[] = Array.from({ length: BATTLEFIELD_SIZE }).map(() => useRef());
    const handRef = useRef({});
    const battlefieldRef: React.RefObject<HTMLDivElement> = useRef();
    const deckRef: React.RefObject<HTMLDivElement> = useRef();
    const discardRef: React.RefObject<HTMLDivElement> = useRef();
    const depleteRef: React.RefObject<HTMLDivElement> = useRef();

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

    const selectedAbilityFromHand = getCardByInstanceId(hand, selectedAbilityId);
    const abilityToUse = selectedAbilityFromHand || selectedMinion?.abilities?.[0];

    const actorId: string | undefined = (selectedMinion || player)?.id;

    const isEligibleToAttack = (ally: Combatant): boolean => {
        if (!ally || ally.isPlayer || ally.HP === 0 || ally.uncontrollable || !ally.abilities?.length) {
            return false;
        }

        const totalDamage =
            getDamageStatistics({ ability: ally.abilities[0], actorInfo: findCombatantData(() => state, ally.id) })?.baseDamage || 0;
        return totalDamage > 0 && charactersAttackedThisTurn.every((id) => id !== ally.id);
    };

    const noMoreMoves =
        playerSide.every((ally) => !isEligibleToAttack(ally)) &&
        (!hand.length || hand.every((ability: CombatAbility) => !canUseAbility(player, getCardByInstanceId(hand, ability.instanceId))));

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
        const ability = getCardByInstanceId(hand, id);

        if (!allowMoveCardFromHandToDeck) {
            if (ability.unplayable || ability.effects?.some((e) => e.isLocked)) {
                warn(battleWarnings.unplayable);
                return;
            }

            if (!canUseAbility(player, ability)) {
                warnNeedMoreResources(ability);
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
        dispatch(useHandAbility({ selectedTargetIndex: selectedIndex, selectedAbilityId, selectedTargetSide: side }) as any);
    };

    const handleSelectCardFromPrompt = () => {
        handleCancelSelectCard();
        if (selectCardsPrompt.abilityQueued) {
            dispatch(useHandAbility(selectCardsPrompt.abilityQueued));
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

    const handleAllyClick = (e: React.MouseEvent, index: number) => {
        if (e.button === 2) {
            // Right click will deselect the ability
            return;
        }

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
                if (selectedAbilityFromHand.unplayable || selectedAbilityFromHand.effects?.some((e) => e.isLocked)) {
                    warn(battleWarnings.unplayable);
                } else if (!canUseAbility(player, selectedAbilityFromHand)) {
                    warnNeedMoreResources(selectedAbilityFromHand);
                } else if (isUntargetable(playerSide[index])) {
                    warn(battleWarnings.untargetable);
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

    const tauntEnemies = enemySide
        .filter((combatant) => combatant?.HP)
        .map((combatant) => findCombatantData(() => state, combatant.id))
        .filter((combatantInfo: CombatantInfo) => hasEffectType(combatantInfo, EFFECT_TYPES.TAUNT));

    const mustTargetTauntError = (index: number): boolean => {
        if (tauntEnemies.length === 0) {
            return false;
        }
        const target = enemySide[index];
        return tauntEnemies.every((enemy) => enemy.combatant.id !== target?.id);
    };

    const warnTaunt = () => {
        warn(battleWarnings.targetTaunt);
    };

    const handleEnemyClick = (e: React.MouseEvent, index: number) => {
        if (e.button === 2) {
            // Right click will deselect the ability
            return;
        }

        if (selectedMinion) {
            if (shouldShowReticle(BATTLEFIELD_SIDES.ENEMY_SIDE, index)) {
                handleAllyAttack({ index });
            } else if (!canTargetIfStealthed(selectedMinion, enemySide[index])) {
                warnStealth();
            } else if (mustTargetTauntError(index)) {
                warnTaunt();
                e.stopPropagation(); // Don't deselect the ability if you get a taunt warning
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
            } else if (mustTargetTauntError(index)) {
                warnTaunt();
                e.stopPropagation(); // Don't deselect the ability if you get a taunt warning
            } else {
                if (!canUseAbility(player, selectedAbilityFromHand)) {
                    warnNeedMoreResources(selectedAbilityFromHand);
                }
                setSelectedAbilityId(null);
            }
            return;
        }
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

    const battleStateRef: MutableRefObject<BATTLE_STATES | undefined> = useRef();

    useEffect(() => {
        // Preload character sprites, projectiles, etc. or they may be invisible
        // TODO this does not include minion/effect string references
        // Also next wave?
        const imagesMap = [...playerSide, ...enemySide, ...hand, ...deck, ...discard].reduce((acc, object) => {
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

            traverseObjForImages(object);
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
                dispatch(updateBattleState(BATTLE_STATES.TURN_STARTING));
            }, 250);
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
            }, 250);
            return;
        }

        if (battleState === BATTLE_STATES.WAVE_START) {
            setTimeout(() => {
                dispatch(onWaveStart());
                setShowTurnAnnouncement(true);
                setTimeout(() => {
                    setShowTurnAnnouncement(false);
                    dispatch(updateBattleState(BATTLE_STATES.TURN_START));
                }, TURN_ANNOUNCEMENT_TIME);
            }, 250);
            return;
        }

        if (battleState === BATTLE_STATES.TURN_STARTING) {
            setShowTurnAnnouncement(true);
            setTimeout(() => {
                setShowTurnAnnouncement(false);
                dispatch(updateBattleState(BATTLE_STATES.TURN_START));
            }, TURN_ANNOUNCEMENT_TIME);

            return;
        }

        if (battleState === BATTLE_STATES.TURN_START) {
            if (isPlayerTurn) {
                dispatch(startPlayerTurn(prevBattleState === BATTLE_STATES.WAVE_START));
            } else {
                dispatch(startEnemyTurn());
            }
            dispatch(updateBattleState(BATTLE_STATES.TURN_IN_PROGRESS));
        }

        if (battleState === BATTLE_STATES.TURN_IN_PROGRESS) {
            if (!isPlayerTurn) {
                dispatch(enemyMoves());
            } else {
                dispatch(initiatePlayerTurnInProgress());
            }

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
        if (!events.length) {
            return;
        }

        const betweenActionDelay = 100;
        setTimeout(() => {
            dispatch(popEventQueue());
        }, events[0].playbackTime + betweenActionDelay);
    }, [events[0]?.id]);

    useEffect(() => {
        if ([BATTLE_STATES.VICTORY].includes(battleState)) {
            return;
        }

        if (!events.length) {
            handleBattlePhase();
            return;
        }
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

    const origination = useMemo(() => {
        if (disableActions) {
            return null;
        }
        return allyRefs[selectedAllyIndex]?.current || handRef.current?.[selectedAbilityId];
    }, [disableActions, selectedAllyIndex, selectedAbilityId]);

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
        if (!hoveredCombatant || !selectedAbility || !shouldShowReticle(hoveredCombatant.side, hoveredCombatant.index)) {
            return {};
        }

        return getAbilityPreviews({
            ability: selectedAbility,
            actor: selectedMinion || player,
            target: hoveredCombatant,
            battle: state.battle,
        });
    })();

    const targetedByEnemyAbilities = (() => {
        const targetMap = {};

        enemySide.forEach((enemy) => {
            const { targeting, id, HP } = enemy || {};

            if (!targeting || HP === 0 || isTurnActionPrevented(findCombatantData(() => state, id))) {
                return;
            }

            const ability = getNextTelegraphedAbility(findCombatantData(() => state, id));

            const { index, side } = enemy.targeting;
            const targetId = state.battle[side]?.[index]?.id;

            const abilityPreviews = getAbilityPreviews({
                ability,
                actor: enemy,
                target: { index, side, id: targetId },
                battle: state.battle,
            });

            Object.entries(abilityPreviews).forEach(([combatantId, previews]) => {
                const traverseAndAggregate = (obj: any, otherObj: any) => {
                    if (!obj || !otherObj) {
                        return;
                    }

                    Object.entries(obj).forEach(([key, val]) => {
                        if (typeof otherObj[key] === "undefined") {
                            otherObj[key] = val;
                            return;
                        }

                        if (typeof val === "number") {
                            otherObj[key] = (otherObj[key] || 0) + val;
                            return;
                        }

                        if (Array.isArray(val)) {
                            val.forEach((v, i) => {
                                if (!otherObj[key][i]) {
                                    otherObj[key][i] = v;
                                } else {
                                    traverseAndAggregate(v, otherObj[key][i]);
                                }
                            });
                            return;
                        }

                        if (typeof val === "object") {
                            traverseAndAggregate(val, otherObj[key]);
                            return;
                        }

                        otherObj[key] = val;
                    });

                    return otherObj;
                };

                const aggregated = previews.reduce((acc, preview: PreviewStatUpdate) => {
                    if (!acc) {
                        return cloneDeep(preview);
                    }

                    return traverseAndAggregate(cloneDeep(preview), acc);
                }, targetMap[combatantId]);

                targetMap[combatantId] = aggregated;
            });
        });

        return targetMap;
    })();

    const animationCanvas = useMemo(
        () => (
            <AnimationCanvas
                event={events[0]}
                battlefieldRef={battlefieldRef}
                allyRefs={allyRefs}
                enemyRefs={enemyRefs}
                deckRef={deckRef}
                discardRef={discardRef}
                depleteRef={depleteRef}
            />
        ),
        [events[0]?.id]
    );

    return (
        <TargetLineCanvas originationRef={origination} color={targetLineColor}>
            <div className={classes.root}>
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

                <div
                    className={classes.battlefieldContainer}
                    onContextMenu={(e) => {
                        setSelectedAbilityId(null);
                        setSelectedAllyIndex(null);
                        e.preventDefault();
                    }}
                    onMouseDown={() => {
                        setSelectedAbilityId(null);
                        setSelectedAllyIndex(null);
                    }}
                >
                    <ParticleCanvas event={events[0]} allyRefs={allyRefs} enemyRefs={enemyRefs} />

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
                                        onMouseDown={(e) => handleEnemyClick(e, i)}
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
                                        previewTargetedBy={targetedByEnemyAbilities[enemy?.id]}
                                        selectedAbility={abilityToUse}
                                        ref={enemyRefs[i]}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className={classes.divider} />
                        <div className={classes.playerContainer}>
                            <div className={classes.leftContainer}>
                                <div className={classes.cardsPlayedCounter}>
                                    Cards played: {player.abilityHistory.filter((ability) => (ability as CombatAbility).instanceId).length}
                                </div>
                                <div className={classes.deckContainer}>
                                    <Deck
                                        viewDeckInOrder={player?.effects.some((effect: Effect) => effect.viewDeckInOrder)}
                                        onMouseDown={handleClickDeck}
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
                                                onMouseDown={(e) => handleAllyClick(e, i)}
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
                                                previewStatUpdate={abilityUsePreviews[ally?.id]}
                                                previewTargetedBy={targetedByEnemyAbilities[ally?.id]}
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
                </div>
                {animationCanvas}
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
                        cardRefs={handRef}
                        selectedAbilityId={selectedAbilityId}
                        onAbilityClick={handleAbilityClick}
                    />
                </div>
                {showWaveClear && (
                    <ClearOverlay labelText={waves[currentWaveIndex + 1] ? `Next: Wave ${currentWaveIndex + 2}` : undefined} />
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
