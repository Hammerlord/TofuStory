import { cloneDeep } from "lodash";
import { compose, partition } from "ramda";
import uuid from "uuid";
import {
    Ability,
    Action,
    ACTION_TYPES,
    CombatEffect,
    Effect,
    EffectEventTrigger,
    EFFECT_CLASSES,
    EFFECT_EVENT_KEYS,
    EFFECT_TYPES,
    HandAbility,
    TARGET_TYPES,
    TriggerEffect,
} from "../../ability/types";
import { playerStateSlice } from "../../character/playerReducer";
import { Combatant } from "../../character/types";
import { createCombatant } from "../../enemy/createEnemy";
import { Wave } from "../../Menu/tutorial";
import { getRandomItem, shuffle } from "../../utils";
import { passesConditions } from "../passesConditions";
import { battleStateSlice } from "../reducer";
import { BATTLEFIELD_SIDES } from "../types";
import {
    applyVacuum,
    calculateActionArea,
    calculateArmor,
    calculateDamage,
    checkHalveArmor,
    clearTurnHistory,
    getBasicAttack,
    getValidTargetIndices,
    isCharacterImmune,
    isSilenced,
    orientate,
    refreshResources,
    updateCardEffects,
    updateCharacters,
    updateHP,
} from "../utils";
import { TriggerSource } from "./../types";

const { drawCards, updateBattle, pushEventQueue } = battleStateSlice.actions;
const { updatePlayer } = playerStateSlice.actions;

export const findCombatant = (getState, combatantId: string): Combatant | undefined => {
    const battle = getState().battle;
    return [...battle.enemySide, ...battle.playerSide].find((c) => c?.id === combatantId);
};

const onBattleEnd = () => {
    return (dispatch, getState) => {
        // No more enemies
        dispatch(
            updateBattle({
                isEnded: true,
            })
        );

        const player = getState().battle.playerSide.find((c: Combatant | null) => c?.isPlayer);

        dispatch(
            updatePlayer({
                HP: player.HP,
            })
        );
    };
};

const onWaveClear = () => {
    return (dispatch, getState) => {
        const { waves, currentWave, deck, playerSide, hand, ...other } = getState().battle;
        const { presetDeck, description, enemies } = waves[currentWave] || {}; // 1 indexed currentWave so we don't need to + 1

        playerSide.forEach((combatant: Combatant | null) => {
            dispatch(checkEventTrigger({ combatantId: combatant?.id, effectEventKey: EFFECT_EVENT_KEYS.onWaveClear }));
        });

        if (!enemies) {
            dispatch(onBattleEnd());
            return;
        }

        dispatch(
            updateBattle({
                currentWave: currentWave + 1,
                enemySide: enemies.map(createCombatant),
                deck: presetDeck ? shuffle(presetDeck.slice()) : deck,
            })
        );

        dispatch(onWaveStart());
    };
};

export const startBattle = ({ waves, player, deck }: { waves: Wave[]; player?: Combatant; deck?: Ability[] }) => {
    return (dispatch, getState) => {
        const { character } = getState();
        player = player || character?.player;
        deck = deck || character?.deck;
        const { presetDeck, description, enemies } = waves[0];
        dispatch(
            updateBattle({
                enemySide: enemies.map(createCombatant),
                playerSide: [null, null, player, null, null],
                deck: shuffle((presetDeck || deck).slice()), // TODO sort "pre-emptive" abilities to the top
                discard: [],
                hand: [],
                isPlayerTurn: true,
                eventQueue: [],
                playerActionQueue: [],
                playerSummonsInPlay: {},
                currentWave: 1,
                waves,
                isEnded: false,
                round: 0,
            })
        );

        dispatch(onWaveStart());
    };
};

const onWaveStart = () => {
    return (dispatch, getState) => {
        const { playerSide, enemySide } = getState().battle;
        playerSide.concat(enemySide).forEach((combatant: Combatant | null) => {
            dispatch(checkEventTrigger({ combatantId: combatant?.id, effectEventKey: EFFECT_EVENT_KEYS.onWaveStart }));
        });
        dispatch(startPlayerTurn());
    };
};

const onCombatantDeath = ({ combatantId, triggerSource }) => {
    return (dispatch, getState) => {
        dispatch(checkEventTrigger({ combatantId, effectEventKey: EFFECT_EVENT_KEYS.onDeath, triggerSource }));

        const { friendly, hostile } = orientate({ actorId: combatantId, ...getState().battle });
        const dispatchEvent = (combatant: Combatant | null, effectEventKey: EFFECT_EVENT_KEYS) => {
            const { HP, id } = combatant || {};
            if (HP > 0 && id !== combatantId) {
                dispatch(checkEventTrigger({ combatantId: id, effectEventKey, triggerSource }));
            }
        };
        friendly.forEach((combatant: Combatant | null) => {
            dispatchEvent(combatant, EFFECT_EVENT_KEYS.onFriendlyDeath);
        });

        hostile.forEach((combatant: Combatant | null) => {
            dispatchEvent(combatant, EFFECT_EVENT_KEYS.onHostileDeath);
        });

        const { playerSide, enemySide, waves, currentWave, playerSummonsInPlay, discard } = getState().battle;
        if (playerSide.find((c: Combatant | null) => c?.isPlayer).HP === 0) {
            // Game over

            return;
        }

        if (playerSummonsInPlay[combatantId]) {
            dispatch(
                updateBattle({
                    playerSummonsInPlay: { ...playerSummonsInPlay, [combatantId]: undefined },
                    discard: [...discard, playerSummonsInPlay[combatantId]],
                })
            );
        }

        if (enemySide.every((enemy) => !enemy || enemy.HP === 0)) {
            dispatch(onWaveClear());
        }
    };
};

const onReceiveAction = ({
    action,
    targetId,
    actorId,
    actionParentType,
}: {
    action: Action;
    targetId: string;
    actorId?: string;
    actionParentType?: "effect" | "ability";
}) => {
    return (dispatch) => {
        const triggerSource = actionParentType ? { source: action, type: actionParentType, actorId, targetId } : undefined;
        if (action.type === ACTION_TYPES.ATTACK || action.type === ACTION_TYPES.RANGE_ATTACK) {
            dispatch(checkEventTrigger({ combatantId: targetId, effectEventKey: EFFECT_EVENT_KEYS.onReceiveAttack, triggerSource }));
            dispatch(checkEventTrigger({ combatantId: actorId, effectEventKey: EFFECT_EVENT_KEYS.onAttack, triggerSource }));
        }
    };
};

export const applyActionToTarget = ({
    actor,
    target,
    targetIndex,
    selectedIndex,
    action,
    actionSource,
}: {
    actor?: Combatant;
    target: Combatant;
    targetIndex: number;
    selectedIndex?: number; // Only applicable for abilities with manual selection?
    action: Action;
    actionSource: { source: Ability | Effect; type: "ability" | "effect" };
}) => {
    const { healing = 0, effects = [], resources = 0, destroyArmor = 0 } = action;
    const ability = actionSource?.type === "ability" ? (actionSource.source as Ability) : undefined;
    const damage = calculateDamage({ actor, target, targetIndex, selectedIndex, action, ability });
    const baseArmor = Math.floor(target.armor * (1 - destroyArmor));
    const armor = calculateArmor({ target, action, actor });
    const updatedArmor = Math.max(0, baseArmor - damage + armor);
    const healthDamage = Math.max(0, damage - baseArmor);
    let HP = Math.max(0, target.HP - healthDamage);
    HP = HP > 0 ? updateHP({ maxHP: target.maxHP, HP, effects: target.effects }, healing) : 0;

    const targetIsImmune = isCharacterImmune(target);
    const isImmuneTo = (effect: Effect) => {
        return target.effects.some(
            (targetEffect: Effect) =>
                targetEffect.immunities?.some((type: EFFECT_TYPES) => type === effect.type) ||
                (targetIsImmune && effect.class === EFFECT_CLASSES.DEBUFF)
        );
    };

    const newEffects = [
        ...target.effects,
        ...effects
            .filter((effect) => !isImmuneTo(effect))
            .map((effect) => ({
                ...cloneDeep(effect),
                uptime: 0,
                id: uuid.v4(),
                applier: actor?.id,
            })),
    ];

    return {
        ...target,
        HP,
        armor: updatedArmor,
        resources: (target.resources || 0) + resources,
        effects: newEffects,
    };
};

const onEffectEventTrigger = ({
    effectEvent,
    effect,
    ownerId,
    externalPartyId,
    triggerSource,
}: {
    effectEvent: EffectEventTrigger;
    effect: CombatEffect;
    ownerId: string;
    externalPartyId?: string;
    triggerSource?: TriggerSource;
}) => {
    return (dispatch, getState) => {
        const { area = 0, canBeSilenced, excludeEffectOwner } = effect;
        const { removeEffect, effectOwner, externalParty } = effectEvent;

        // Bandaid: effects should never be able to proc themselves
        const source = triggerSource?.type === "effect" ? (triggerSource.source as Effect) : undefined;
        if (source?.name === effect.name) {
            return;
        }

        const checkRemoveEffect = () => {
            if (removeEffect) {
                const newEffects = findCombatant(getState, ownerId).effects.filter(({ id }) => id !== effect.id);
                dispatch(updateCombatant({ combatantId: ownerId, newProperties: { effects: newEffects } }));
            }
        };
        if (canBeSilenced && isSilenced(findCombatant(getState, ownerId))) {
            checkRemoveEffect();
            return;
        }

        const getCalculationTarget = (calculationTarget: "effectOwner" | "externalParty") => {
            return findCombatant(getState, calculationTarget === "effectOwner" ? ownerId : externalPartyId);
        };

        if (!passesConditions({ getCalculationTarget, conditions: effectEvent.conditions })) {
            return;
        }

        const applyProc = ({
            combatantId,
            triggerEffect,
            excludePrimaryTarget,
        }: {
            combatantId?: string;
            triggerEffect: TriggerEffect;
            excludePrimaryTarget?: boolean;
        }) => {
            if (!combatantId) {
                return;
            }
            const { friendly, actorIndex: i } = orientate({ actorId: combatantId, ...getState().battle });
            const isAffected = (combatant: Combatant | null, j: number) => {
                const isWithinArea = j >= i - area && j <= i + area;
                const isExcludingPrimaryTarget = excludePrimaryTarget && j === i;
                return combatant?.HP > 0 && isWithinArea && !isExcludingPrimaryTarget;
            };
            friendly
                .map((combatant: Combatant | null, j: number) => {
                    if (!isAffected(combatant, j)) {
                        return;
                    }

                    return applyActionToTarget({
                        target: combatant,
                        targetIndex: j,
                        action: {
                            ...triggerEffect,
                            type: ACTION_TYPES.EFFECT,
                        },
                        actionSource: { source: effect, type: "effect" },
                    });
                })
                // Apply all the updates before triggering any related events
                .forEach((updated: Combatant | null, j: number) => {
                    if (!isAffected(updated, j)) {
                        return;
                    }
                    dispatch(
                        updateCombatant({
                            combatantId: updated.id,
                            newProperties: updated,
                        })
                    );
                });
        };

        if (effectOwner) {
            applyProc({ combatantId: ownerId, triggerEffect: effectOwner, excludePrimaryTarget: excludeEffectOwner });
        }

        if (externalParty) {
            applyProc({ combatantId: externalPartyId, triggerEffect: externalParty });
        }

        checkRemoveEffect();
    };
};

export const checkEventTrigger = ({
    combatantId,
    effectEventKey,
    triggerSource,
}: {
    combatantId: string;
    effectEventKey: string;
    triggerSource?: TriggerSource;
}) => {
    return (dispatch, getState) => {
        if (!combatantId) {
            return;
        }

        const combatant = findCombatant(getState, combatantId);
        if (!combatant || combatant.HP === 0) {
            return;
        }

        combatant.effects.forEach((effect: CombatEffect) => {
            if (effect[effectEventKey]) {
                dispatch(
                    onEffectEventTrigger({
                        effectEvent: effect[effectEventKey],
                        effect,
                        ownerId: combatant.id,
                        externalPartyId: triggerSource?.actorId,
                        triggerSource,
                    })
                );
            }
        });
    };
};

const getDiff = (
    oldCombatant: Combatant,
    newCombatant: Combatant
): {
    isDeathBlow: boolean;
    resourcesSpent: number;
    healing: number;
    armor: number;
    totalDamageTaken: number;
    effectsGained: Effect[];
    effectsRemoved: Effect[];
} => {
    const newEffectsIds = newCombatant.effects.reduce((acc, effect) => ({ ...acc, [effect.id]: effect }), {});
    const oldEffectsIds = oldCombatant.effects.reduce((acc, effect) => ({ ...acc, [effect.id]: effect }), {});

    return {
        isDeathBlow: oldCombatant.HP > 0 && newCombatant.HP === 0,
        resourcesSpent: oldCombatant.resources - newCombatant.resources,
        healing: newCombatant.HP - oldCombatant.HP,
        armor: newCombatant.armor - oldCombatant.armor,
        totalDamageTaken: oldCombatant.armor + oldCombatant.HP - (newCombatant.armor + newCombatant.HP),
        effectsGained: newCombatant.effects.filter((e) => !oldEffectsIds[e.id]),
        effectsRemoved: oldCombatant.effects.filter((e) => !newEffectsIds[e.id]),
    };
};

/**
 * Also uses diffing to trigger events:
 * - on resource gain
 * - on armor gain
 * - on healed
 * - on receive damage
 * - on death
 */
export const updateCombatant = ({
    combatantId,
    newProperties,
    source,
}: {
    combatantId: string;
    newProperties: any;
    source?: TriggerSource;
}) => {
    return (dispatch, getState) => {
        const { enemySide, playerSide } = getState().battle;
        const { friendly, actorSide } = orientate({ actorId: combatantId, enemySide, playerSide });
        const oldCombatant = findCombatant(getState, combatantId);
        const newCombatant = { ...oldCombatant, ...newProperties };
        const diff = getDiff(oldCombatant, newCombatant);

        dispatch(
            updateBattle({
                [actorSide]: friendly.map((combatant: Combatant | null) => (combatant?.id !== combatantId ? combatant : newCombatant)),
            })
        );

        const { isDeathBlow, resourcesSpent, healing, armor, totalDamageTaken, effectsGained, effectsRemoved } = diff;
        const dispatchEvent = (effectEventKey: EFFECT_EVENT_KEYS) => {
            dispatch(checkEventTrigger({ combatantId: combatantId, effectEventKey, triggerSource: source }));
        };
        if (resourcesSpent > 0) {
            dispatchEvent(EFFECT_EVENT_KEYS.onResourcesSpent);
        }

        if (healing > 0) {
            dispatchEvent(EFFECT_EVENT_KEYS.onReceiveHealing);
        }

        if (armor > 0) {
            dispatchEvent(EFFECT_EVENT_KEYS.onReceiveArmor);
        }

        if (totalDamageTaken > 0) {
            dispatchEvent(EFFECT_EVENT_KEYS.onReceiveDamage);
        }

        effectsGained.forEach((e) => {
            // TODO probably include effects in the event trigger payload?
            dispatchEvent(EFFECT_EVENT_KEYS.onReceiveEffect);
        });

        effectsRemoved.forEach((e) => {
            // TODO probably include effects in the event trigger payload?
            // Removal should only apply to dispels?
            dispatchEvent(EFFECT_EVENT_KEYS.onEffectRemoved);
            dispatchEvent(EFFECT_EVENT_KEYS.onEnd);
        });

        if (isDeathBlow) {
            dispatch(onCombatantDeath({ combatantId, triggerSource: source }));
        }
    };
};

/**
 * Reduces the duration of effects by 1 and removes them if they have run out of time
 */
export const tickDownStatusEffects = (combatantId: string, effectClass?: EFFECT_CLASSES) => {
    return (dispatch, getState) => {
        const combatant = findCombatant(getState, combatantId);
        const tickedDown = combatant.effects.map((effect) => {
            if (!effectClass || effect.class === effectClass) {
                return {
                    ...effect,
                    uptime: effect.uptime + 1,
                    duration: (isNaN(effect.duration) ? Infinity : effect.duration) - 1,
                };
            }

            return effect;
        });

        const [activeEffects, effectsEnded] = partition(({ duration = Infinity }) => duration > 0, tickedDown);
        dispatch(
            updateCombatant({
                combatantId: combatant.id,
                newProperties: {
                    effects: activeEffects,
                },
            })
        );

        effectsEnded.forEach((effect: CombatEffect) => {
            onEffectEventTrigger({ ownerId: combatantId, effectEvent: effect.onEnd, effect });
        });
    };
};

export const onEndTurnTriggers = (side: (Combatant | null)[]) => {
    return (dispatch) => {
        side.forEach((combatant: Combatant | null) => {
            if (!combatant) {
                return;
            }

            dispatch(checkEventTrigger({ combatantId: combatant.id, effectEventKey: EFFECT_EVENT_KEYS.onTurnEnd }));
            dispatch(tickDownStatusEffects(combatant.id, EFFECT_CLASSES.DEBUFF));
        });
    };
};

export const playerEndTurn = () => {
    return (dispatch, getState) => {
        const { playerSide, discard, hand } = getState().battle;
        dispatch(onEndTurnTriggers(playerSide));

        dispatch(
            updateBattle({
                isPlayerTurn: false,
                discard: [...discard, ...prepareForDiscard(hand)],
                hand: [],
            })
        );
    };
};

export const startPlayerTurn = () => {
    return (dispatch, getState) => {
        const { playerSide, round } = getState().battle;
        const updateFns = [refreshResources, clearTurnHistory];
        if (round > 0) {
            updateFns.push(checkHalveArmor);
        }

        const updatedPlayerSide = updateCharacters(playerSide, compose(...updateFns));
        dispatch(
            updateBattle({
                round: round + 1,
                charactersAttackedThisTurn: [],
                playerSide: updatedPlayerSide,
            })
        );

        updatedPlayerSide.forEach((combatant: Combatant | null) => {
            if (!combatant) {
                return;
            }

            dispatch(checkEventTrigger({ combatantId: combatant.id, effectEventKey: EFFECT_EVENT_KEYS.onTurnStart }));
            dispatch(tickDownStatusEffects(combatant.id, EFFECT_CLASSES.BUFF));
        });

        const { battle } = getState();
        const player = battle.playerSide.find((c: Combatant | null) => c?.isPlayer);
        dispatch(
            drawCards({
                amount: player.drawCardsPerTurn - battle.hand.length, // TODO card draw effects
            })
        );
    };
};

/**
 * Perform an action from an ability. TODO include effect?
 */
const performAction = ({
    action,
    ability,
    selectedIndex,
    side,
    actorId,
}: {
    action: Action;
    ability: Ability;
    selectedIndex: number;
    side: BATTLEFIELD_SIDES;
    actorId: string;
}) => {
    return (dispatch, getState) => {
        const getArea = () => calculateActionArea({ action, actor: findCombatant(getState, actorId) });

        if (action.vacuum) {
            dispatch(
                updateBattle({
                    [side]: applyVacuum({
                        characters: getState().battle[side],
                        index: selectedIndex,
                        area: getArea(),
                        distance: action.vacuum,
                    }),
                })
            );
        }

        const isAffected = (combatant: Combatant | null, i: number): boolean => {
            const area = getArea();
            const inArea = combatant && i >= selectedIndex - area && i <= selectedIndex + area;
            if (action.excludePrimaryTarget) {
                return inArea && i !== selectedIndex;
            }

            return inArea;
        };

        const actor = findCombatant(getState, actorId);
        const combatants = getState().battle[side];
        combatants
            .map((character: Combatant | null, i: number) => {
                if (!isAffected(character, i)) {
                    return;
                }
                return applyActionToTarget({
                    target: character,
                    selectedIndex,
                    targetIndex: i,
                    action,
                    actor,
                    actionSource: { source: ability, type: "ability" },
                });
            })
            .forEach((updated: Combatant | null, i) => {
                if (!isAffected(updated, i)) {
                    return;
                }
                dispatch(
                    updateCombatant({
                        combatantId: updated.id,
                        newProperties: updated,
                    })
                );

                dispatch(
                    onReceiveAction({ action, targetId: updated.id, actorId: actor?.id, actionParentType: ability ? "ability" : "effect" })
                );
            });
    };
};

/**
 * Sometimes, multi-action abilities have you select an enemy, but then have an additional action that eg. targets yourself.
 * This orients the target to the right place (if applicable) as actions are parsed.
 */
const getAbilityTarget = ({
    initialSelectedIndex,
    initialSelectedSide,
    ability,
    action,
    actorId,
    getState,
}: {
    initialSelectedIndex: number;
    initialSelectedSide: BATTLEFIELD_SIDES;
    ability: Ability;
    action: Action;
    actorId: string;
    getState: Function;
}) => {
    let index = initialSelectedIndex;
    let side = initialSelectedSide;
    const { enemySide, playerSide } = getState().battle;
    const { friendly, hostile, actorSide } = orientate({ actorId, enemySide, playerSide });

    if (action.target === TARGET_TYPES.RANDOM_HOSTILE) {
        const targetIndices = getValidTargetIndices(hostile, { excludeStealth: true }).filter((i) => {
            if (ability.area) {
                return Math.abs(i - initialSelectedIndex) <= ability.area;
            }
            return true;
        });
        index = getRandomItem(targetIndices);
    } else if (action.target === TARGET_TYPES.SELF) {
        index = friendly.findIndex((ally) => ally?.id === actorId);
        side = actorSide;
    }

    return { index, side };
};

const checkCastRadiate = ({
    ability,
    action,
    selectedIndex,
    side,
}: {
    ability: Ability;
    action: Action;
    selectedIndex: number;
    side: BATTLEFIELD_SIDES;
}) => {
    return (dispatch, getState) => {
        if (!action.radiate) {
            return;
        }
        dispatch(
            performAction({
                action: {
                    type: ACTION_TYPES.EFFECT,
                    ...action.radiate,
                },
                selectedIndex,
                side: side === BATTLEFIELD_SIDES.PLAYER_SIDE ? BATTLEFIELD_SIDES.ENEMY_SIDE : BATTLEFIELD_SIDES.PLAYER_SIDE, // Radiate is always to the side opposite of the combatant casting it
                actorId: getState().battle[side][selectedIndex]?.id,
                ability,
            })
        );
    };
};

const checkCardActions = (action: Action, actorId: string) => {
    return (dispatch, getState) => {
        // "Card" mechanics are only applicable to the player
        if (!findCombatant(getState, actorId)?.isPlayer) {
            return;
        }
        const { drawCards: cardsToDraw, addCards, currentHandEffects } = action;
        if (cardsToDraw) {
            dispatch(drawCards(cardsToDraw));
        }

        if (addCards) {
            dispatch(
                updateBattle({
                    hand: [...getState().battle.hand, ...addCards.map(cloneDeep)],
                })
            );
        }

        // If we apply card effects, assume we always want to do it AFTER drawCards/addCards. Otherwise, configure the actions to be separate and in the desired order!
        if (currentHandEffects) {
            dispatch(
                updateBattle({
                    hand: getState().battle.hand.map((card: Ability) => ({ ...card, effects: { ...currentHandEffects } })),
                })
            );
        }
    };
};

const checkSummonMinion = ({
    ability,
    selectedIndex,
    side,
    actorId,
}: {
    side: BATTLEFIELD_SIDES;
    selectedIndex: number;
    ability: HandAbility;
    actorId: string;
}) => {
    return (dispatch, getState) => {
        const { minion, removeAfterTurn, depletedOnUse } = ability;
        if (minion) {
            const minionCombatant: Combatant = createCombatant(minion);
            const newBattleProps: {
                playerSide?: (Combatant | null)[];
                enemySide?: (Combatant | null)[];
                playerSummonsInPlay?: { [id: string]: Ability };
            } = {
                [side]: getState().battle[side].map((combatant: Combatant | null, i: number) => {
                    return i === selectedIndex ? minionCombatant : combatant;
                }),
            };

            // If the actor is the player, then move the ability to the "active summons" bucket, so that it is later sent to discard if the minion is removed from play
            if (findCombatant(getState, actorId).isPlayer && !removeAfterTurn && !depletedOnUse) {
                newBattleProps.playerSummonsInPlay = { [minionCombatant.id]: ability };
            }

            dispatch(updateBattle(newBattleProps));

            // TODO on summon event triggers?
        }
    };
};

export const useAbility = ({
    ability,
    selectedIndex,
    side,
    actorId,
}: {
    side: BATTLEFIELD_SIDES;
    selectedIndex: number;
    ability: HandAbility;
    actorId: string;
}) => {
    return (dispatch, getState) => {
        const { resourceCost = 0, actions = [], effects = {} } = ability;
        const totalResourceCost = Math.max(0, resourceCost + (effects.resourceCost || 0));
        const combatant = findCombatant(getState, actorId);
        dispatch(updateCombatant({ combatantId: actorId, newProperties: { resources: combatant.resources - totalResourceCost } }));
        dispatch(checkSummonMinion({ ability, selectedIndex, side, actorId }));

        // TODO when playback the event should be the whole AoE

        const getCalculationTarget = (targetType: "actor" | "target") => {
            if (targetType === "actor") {
                return findCombatant(getState, actorId);
            }

            const { playerSide, enemySide } = getState().battle;
            return side === BATTLEFIELD_SIDES.PLAYER_SIDE ? playerSide[selectedIndex] : enemySide[selectedIndex];
        };

        const handleAction = (action: Action) => {
            const { index, side: finalSide } = getAbilityTarget({
                initialSelectedIndex: selectedIndex,
                initialSelectedSide: side,
                ability,
                action,
                actorId,
                getState,
            });

            if (typeof index !== "number") {
                return;
            }

            dispatch(performAction({ ability, action, selectedIndex: index, side: finalSide, actorId }));
            dispatch(checkCastRadiate({ ability, action, selectedIndex, side: finalSide }));
            dispatch(checkCardActions(action, actorId));
        };

        actions.filter((action: Action) => passesConditions({ getCalculationTarget, conditions: action.conditions })).forEach(handleAction);

        dispatch(
            checkEventTrigger({
                combatantId: actorId,
                effectEventKey: EFFECT_EVENT_KEYS.onAbility,
                triggerSource: { source: ability, type: "ability" },
            })
        );
    };
};

const prepareForDiscard = (cards: HandAbility[]): HandAbility[] => {
    return cards
        .filter((ability) => !ability.removeAfterTurn)
        .map((hand) => ({
            ...hand,
            effects: undefined,
        }));
};

export const onUsePlayerAbility = ({
    selectedIndex,
    side,
    selectedAbilityIndex,
}: {
    selectedIndex: number;
    side: BATTLEFIELD_SIDES;
    selectedAbilityIndex: number;
}) => {
    return (dispatch, getState) => {
        const { playerSide, hand: originalHand } = getState().battle;
        const handWithAbilityUsed = originalHand.slice();
        const [ability] = handWithAbilityUsed.splice(selectedAbilityIndex, 1);
        const { removeAfterTurn, reusable, depletedOnUse, minion } = ability as HandAbility;

        dispatch(
            updateBattle({
                hand: handWithAbilityUsed,
            })
        );

        dispatch(useAbility({ ability, selectedIndex, side, actorId: playerSide.find((c: Combatant | null) => c?.isPlayer).id }));

        // Order matters; we don't want to allow card draws to be able to draw itself from the discard pile
        // This is only a bandaid though since there's nothing stopping you from taking multiple card draw abilities (eg. Dash) that can draw each other
        const { hand, discard } = getState().battle;
        const newDiscard = discard.slice();
        const newHand = hand.slice();
        if (reusable) {
            newHand.push({
                ...ability,
                effects: undefined,
            });
        } else if (!minion && !removeAfterTurn && !depletedOnUse) {
            // Minions go into a special bucket rather than immediately to discard; see useAbility
            newDiscard.push(...prepareForDiscard([ability]));
        }

        dispatch(
            updateBattle({
                hand: newHand.map((card: HandAbility) => {
                    if (card.onAbilityUse) {
                        return updateCardEffects(card, card.onAbilityUse);
                    }
                    return card;
                }),
                discard: newDiscard,
            })
        );
    };
};

export const onSummonAttack = ({ selectedIndex, actorId }: { selectedIndex: number; actorId: string }) => {
    return (dispatch, getState) => {
        dispatch(
            useAbility({
                selectedIndex,
                side: BATTLEFIELD_SIDES.ENEMY_SIDE,
                ability: getBasicAttack(findCombatant(getState, actorId)),
                actorId,
            })
        );

        dispatch(
            updateBattle({
                charactersAttackedThisTurn: [...getState().battle.charactersAttackedThisTurn, actorId],
            })
        );
    };
};
