import { cloneDeep, uniq } from "lodash";
import { partition } from "ramda";
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
} from "../../ability/types";
import { playerStateSlice } from "../../character/playerReducer";
import { Combatant } from "../../character/types";
import { createCombatant } from "../../enemy/createEnemy";
import { Wave } from "../../Menu/tutorial";
import { getRandomItem, shuffle } from "../../utils";
import { passesConditions } from "../passesConditions";
import { battleStateSlice } from "../reducer";
import { BATTLEFIELD_SIDES, Event, TRIGGER_SOURCE_TYPES } from "../types";
import {
    applyVacuum,
    calculateActionArea,
    calculateArmor,
    calculateBonus,
    calculateDamage,
    calculateMultiplier,
    getEnabledEffects,
    getInducedAttack,
    getPossibleSummonIndices,
    getValidTargetIndices,
    hasEffectType,
    isSilenced,
    orientate,
    updateHP,
} from "../utils";
import { TRIGGER_TARGET_TYPES } from "./../../ability/types";
import { aggregateItemEffects } from "./../../Menu/utils";
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

export const onWaveClear = () => {
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
    };
};

export const startBattle = ({ waves, deck }: { waves: Wave[]; deck?: Ability[] }) => {
    return (dispatch, getState) => {
        const { character } = getState();
        const player = {
            ...character.player,
            effects: aggregateItemEffects(character.player.items),
        };
        deck = deck || character?.deck;
        const { presetDeck, description, enemies } = waves[0];
        dispatch(
            updateBattle({
                enemySide: enemies.map(createCombatant),
                playerSide: [null, null, player, null, null],
                deck: shuffle((presetDeck || deck).slice()).sort((a, b) => {
                    const aSort = a.preemptive ? 1 : 0;
                    const bSort = b.preemptive ? 1 : 0;
                    return bSort - aSort;
                }),
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
                selectCards: null,
            })
        );

        dispatch(onWaveStart());
    };
};

export const onWaveStart = () => {
    return (dispatch, getState) => {
        const { playerSide, enemySide } = getState().battle;
        playerSide.concat(enemySide).forEach((combatant: Combatant | null) => {
            dispatch(checkEventTrigger({ combatantId: combatant?.id, effectEventKey: EFFECT_EVENT_KEYS.onWaveStart }));
        });
    };
};

const handleLifeOnKill = (triggerSource: TriggerSource) => {
    return (dispatch, getState) => {
        const { type, source, actorId } = triggerSource;
        let killedBy: Combatant | undefined;
        if (type === TRIGGER_SOURCE_TYPES.EFFECT) {
            killedBy = findCombatant(getState, (source as CombatEffect)?.applierId);
        } else if (type === TRIGGER_SOURCE_TYPES.ABILITY) {
            killedBy = findCombatant(getState, actorId);
        }

        if (!killedBy || killedBy.HP === 0) {
            return;
        }

        const lifeOnKill = getEnabledEffects(killedBy).reduce((acc, { lifeOnHit: lifeOnKill = 0 }) => acc + lifeOnKill, 0);
        if (lifeOnKill === 0) {
            return;
        }

        const { actorIndex } = orientate({ actorId: killedBy.id, ...getState().battle });

        const [updated, action] = getUpdatedTargets({
            actorId: killedBy.id,
            targetIds: [killedBy.id],
            targetIndices: [actorIndex],
            selectedIndex: actorIndex,
            action: {
                type: ACTION_TYPES.EFFECT,
                healing: lifeOnKill,
            },
            source: {
                ...triggerSource,
                isProc: true,
            },
            getCombatantById: (id) => findCombatant(getState, id),
        })[0];

        dispatch(
            updateCombatant({
                combatantId: killedBy.id,
                newProperties: updated,
                // This is technically a proc in concept, but it is allowed to proc procs
                source: { source: action, type: TRIGGER_SOURCE_TYPES.EFFECT, actorId: killedBy.id, targetId: killedBy.id },
            })
        );
    };
};

const checkLifeOnHit = ({
    affectedTargets,
    actorId,
    action,
    source,
}: {
    affectedTargets: string[];
    actorId: string;
    action: Action;
    source: TriggerSource;
}) => {
    return (dispatch, getState) => {
        if (source.isProc || ![ACTION_TYPES.ATTACK, ACTION_TYPES.RANGE_ATTACK].includes(action.type)) {
            return;
        }

        const actor = findCombatant(getState, actorId);
        if (!actor || actor?.HP === 0) {
            return;
        }

        const lifeOnHit = getEnabledEffects(actor).reduce((acc, { lifeOnHit = 0 }) => acc + lifeOnHit, 0);
        if (lifeOnHit === 0) {
            return;
        }

        const { actorIndex } = orientate({ actorId, ...getState().battle });

        const [updated, healAction] = getUpdatedTargets({
            actorId: actor.id,
            targetIds: [actor.id],
            targetIndices: [actorIndex],
            selectedIndex: actorIndex,
            action: {
                type: ACTION_TYPES.EFFECT,
                healing: lifeOnHit * affectedTargets.length,
            },
            source: {
                ...source,
                isProc: true,
            },
            getCombatantById: (id) => findCombatant(getState, id),
        })[0];

        dispatch(
            updateCombatant({
                combatantId: actorId,
                newProperties: updated,
                source: { source: healAction, type: TRIGGER_SOURCE_TYPES.EFFECT, actorId, targetId: actorId },
            })
        );
    };
};

const onCombatantDeath = ({ combatantId, triggerSource }: { combatantId: string; triggerSource: TriggerSource }) => {
    return (dispatch, getState) => {
        dispatch(checkEventTrigger({ combatantId, effectEventKey: EFFECT_EVENT_KEYS.onDeath, source: triggerSource }));

        const { friendly, hostile } = orientate({ actorId: combatantId, ...getState().battle });

        const dispatchEvent = (combatant: Combatant | null, effectEventKey: EFFECT_EVENT_KEYS) => {
            const { HP, id } = combatant || {};
            if (HP > 0 && id !== combatantId) {
                dispatch(checkEventTrigger({ combatantId: id, effectEventKey, source: triggerSource }));
            }
        };

        dispatch(handleLifeOnKill(triggerSource));

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
    };
};

const onReceiveAction = ({ action, source }: { action: Action; source?: TriggerSource }) => {
    return (dispatch) => {
        if (action.type === ACTION_TYPES.ATTACK || action.type === ACTION_TYPES.RANGE_ATTACK) {
            dispatch(
                checkEventTrigger({
                    combatantId: source?.targetId,
                    effectEventKey: EFFECT_EVENT_KEYS.onReceiveAttack,
                    source,
                })
            );
        }
    };
};

const onAction = ({ action, source }: { action: Action; source?: TriggerSource }) => {
    return (dispatch, getState) => {
        const actorId = source?.actorId;
        if (action.type === ACTION_TYPES.ATTACK || action.type === ACTION_TYPES.RANGE_ATTACK) {
            dispatch(
                checkEventTrigger({
                    combatantId: actorId,
                    effectEventKey: EFFECT_EVENT_KEYS.onAttack,
                    source,
                })
            );
        }

        const { turnHistory } = findCombatant(getState, actorId);

        dispatch(
            updateCombatant({
                combatantId: actorId,
                newProperties: {
                    turnHistory: [...turnHistory, action],
                },
                source,
            })
        );
    };
};

export const getUpdatedTargets = ({
    actorId,
    targetIds,
    targetIndices,
    selectedIndex,
    action: initialAction,
    parent: ability,
    source,
    getCombatantById,
}: {
    actorId?: string;
    targetIds: string[];
    targetIndices: number[];
    selectedIndex?: number; // Only applicable for abilities with manual selection?
    action: Action;
    parent?: Ability;
    source: TriggerSource;
    getCombatantById: (id: string) => Combatant;
}): [Combatant, Action][] => {
    const actor = getCombatantById(actorId);
    const targets = targetIds.map(getCombatantById);
    const sourceTargets = (source.allTargetIds || []).map(getCombatantById);

    return targets.map((target: Combatant, i: number) => {
        const targetIndex = targetIndices[i];
        let action = calculateMultiplier({
            action: initialAction,
            actor,
            target,
            allTargets: targets,
            sourceTargets,
            multiplier: initialAction.multiplier,
        });
        action = calculateBonus({
            action,
            target: target,
            actor,
            allTargets: targets,
            isTargetSelected: targetIndex === selectedIndex,
        });
        const { healing = 0, effects = [], resources = 0, destroyArmor = 0, resurrect } = action;
        const damage = calculateDamage({ actor, target, targetIndex, selectedIndex, action, ability });
        const baseArmor = Math.floor(target.armor * (1 - destroyArmor));
        const armor = calculateArmor({ target, action, actor: actorId });
        const updatedArmor = Math.max(0, baseArmor - damage + armor);
        const healthDamage = Math.max(0, damage - baseArmor);
        let HP = Math.max(0, target.HP - healthDamage);
        if (HP > 0 || resurrect) {
            HP = updateHP({ ...target, HP }, healing);
        }

        const targetIsImmune = hasEffectType(target, EFFECT_TYPES.IMMUNITY);
        const isImmuneTo = (effect: Effect): boolean => {
            if (targetIsImmune && effect.class === EFFECT_CLASSES.DEBUFF) {
                return false;
            }
            return getEnabledEffects(target).some((targetEffect: Effect) =>
                targetEffect.immunities?.some((type: EFFECT_TYPES) => type === effect.type)
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
                    applier: actorId,
                })),
        ];

        return [
            {
                ...target,
                HP,
                armor: updatedArmor,
                resources: (target.resources || 0) + resources,
                effects: newEffects,
            },
            action,
        ];
    });
};

const onEffectEventTrigger = ({
    effectEvent,
    effect,
    ownerId,
    source,
}: {
    effectEvent: EffectEventTrigger;
    effect: CombatEffect;
    ownerId: string;
    source?: TriggerSource;
}) => {
    return (dispatch, getState) => {
        const { canBeSilenced, area = 0, excludeEffectOwner } = effect;
        const { removeEffect, targetType, ability, conditions, randomOptions = {}, ...other } = effectEvent;

        const getCalculationTargetIds = (targetType: TRIGGER_TARGET_TYPES): string[] => {
            const targetIds =
                {
                    [TRIGGER_TARGET_TYPES.EFFECT_OWNER]: [ownerId],
                    [TRIGGER_TARGET_TYPES.EFFECT_APPLIER]: [effect?.applierId],
                    [TRIGGER_TARGET_TYPES.ACTOR]: [source?.actorId],
                    [TRIGGER_TARGET_TYPES.TARGET]: [source?.targetId],
                    [TRIGGER_TARGET_TYPES.ALL_TARGETS]: source?.allTargetIds || [],
                }[targetType] || [];
            return targetIds.filter((v) => v);
        };

        const conditionsPassed = passesConditions({
            getCalculationTarget: (targetType: TRIGGER_TARGET_TYPES) => {
                return getCalculationTargetIds(targetType).map((id) => findCombatant(getState, id));
            },
            proc: effectEvent,
        });

        const checkRemoveEffect = () => {
            if (removeEffect) {
                const newEffects = findCombatant(getState, ownerId).effects.filter(({ id }) => id !== effect.id);
                dispatch(updateCombatant({ combatantId: ownerId, newProperties: { effects: newEffects } }));
            }
        };
        if (canBeSilenced && isSilenced(findCombatant(getState, ownerId))) {
            if (conditionsPassed) {
                checkRemoveEffect();
            }
            return;
        }

        if (conditionsPassed) {
            checkRemoveEffect();
        }

        const procSource = { ...source, source: effect, type: TRIGGER_SOURCE_TYPES.EFFECT, isProc: true };

        $applyStatChanges: {
            const targetIds = getCalculationTargetIds(targetType);
            if (!targetIds.length) {
                break $applyStatChanges;
            }

            const { friendly: combatants, actorIndex: i } = orientate({ actorId: targetIds[0], ...getState().battle });

            const isAffected = (combatant: Combatant, j: number): boolean => {
                const isWithinArea = Math.abs(j - i) <= area || targetIds.includes(combatant?.id); // Should it be an area around EACH target?
                const isExcludingPrimaryTarget = excludeEffectOwner && targetType === TRIGGER_TARGET_TYPES.EFFECT_OWNER && j === i;
                return combatant?.HP > 0 && isWithinArea && !isExcludingPrimaryTarget;
            };

            const targetIndices = combatants.reduce((acc, character: Combatant | null, i: number) => {
                if (isAffected(character, i)) {
                    acc.push(i);
                }

                return acc;
            }, []);

            getUpdatedTargets({
                targetIds,
                targetIndices,
                actorId: ownerId,
                action: {
                    ...other,
                    type: ACTION_TYPES.EFFECT,
                },
                source: procSource,
                getCombatantById: (id: string) => findCombatant(getState, id),
            }).forEach((updated: [Combatant, Action]) => {
                const [combatant] = updated;
                dispatch(updateCombatant({ combatantId: combatant.id, newProperties: combatant, source }));
            });
        }

        ability?.actions.forEach((action) => {
            const { index, side } = autoSelectActionTarget({
                action,
                actorId: ownerId,
                getState,
            });

            const getCalculationTarget = () => {
                return getState().battle[side]?.[index] || null;
            };

            // Should this be part of autoSelectActionTarget to make it a bit smarter?
            if (passesConditions({ getCalculationTarget, proc: action })) {
                dispatch(
                    performAction({
                        action,
                        selectedIndex: index,
                        side,
                        actorId: ownerId,
                        parent: ability,
                        parentSource: {
                            ...procSource,
                            actorId: ownerId,
                        },
                    })
                );
            }
        });
    };
};

export const checkEventTrigger = ({
    combatantId,
    effectEventKey,
    source,
}: {
    combatantId: string;
    effectEventKey: EFFECT_EVENT_KEYS;
    source?: TriggerSource;
}) => {
    return (dispatch, getState) => {
        // At the moment, procs may not proc procs unless it is a kill event.
        const killEvents = [EFFECT_EVENT_KEYS.onDeath, EFFECT_EVENT_KEYS.onFriendlyDeath, EFFECT_EVENT_KEYS.onHostileDeath];
        if (!combatantId || (source?.isProc && !killEvents.includes(effectEventKey))) {
            return;
        }

        const combatant = findCombatant(getState, combatantId);
        // Dead characters generally cannot trigger effects except in case of killing blows
        if (!combatant || (effectEventKey !== EFFECT_EVENT_KEYS.onDeath && combatant.HP === 0)) {
            return;
        }

        combatant.effects.forEach((effect: CombatEffect) => {
            const { uptime, turnsTriggerFrequency, [effectEventKey]: effectEvent } = effect;
            if (effectEvent && (!turnsTriggerFrequency || uptime % turnsTriggerFrequency === 0)) {
                dispatch(
                    onEffectEventTrigger({
                        effectEvent,
                        effect,
                        ownerId: combatant.id,
                        source,
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
 * Updates a combatant given its ID, and uses state diffing to trigger events
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
            dispatch(checkEventTrigger({ combatantId: combatantId, effectEventKey, source }));
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

        const combatant = findCombatant(getState, combatantId);
        if (combatant.HP > 0) {
            effectsRemoved.forEach((e: CombatEffect) => {
                // TODO probably include effects in the event trigger payload?
                // Removal should only apply to dispels?
                dispatchEvent(EFFECT_EVENT_KEYS.onEffectRemoved);
                if (e.onEnd) {
                    dispatch(
                        onEffectEventTrigger({
                            effectEvent: e.onEnd,
                            effect: e,
                            ownerId: combatantId,
                        })
                    );
                }
            });
        }

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

const checkHandleSummon = ({ action, actorId, parentSource }: { action: Action; actorId: string; parentSource: TriggerSource }) => {
    return (dispatch, getState) => {
        if (!action.summon) {
            return;
        }

        for (const summon of action.summon) {
            const { friendly, actorSide } = orientate({ actorId, ...getState().battle });
            const { minion, positionIndex } = summon;
            const pos = typeof positionIndex === "number" ? positionIndex : getRandomItem(getPossibleSummonIndices(friendly));
            const minionToSummon = getRandomItem(minion);
            if (typeof pos !== "number") {
                break;
            }

            const summonedMinion = createCombatant(minionToSummon);

            dispatch(
                updateBattle({
                    [actorSide]: friendly.map((combatant: Combatant | null, i) => {
                        if (combatant?.HP > 0 || i !== pos) {
                            return combatant;
                        }

                        return summonedMinion;
                    }),
                })
            );

            if (summonedMinion.onSummon) {
                summonedMinion.onSummon.forEach((action) => {
                    const { index, side } = autoSelectActionTarget({ action, actorId: summonedMinion.id, getState });
                    dispatch(
                        performAction({
                            action,
                            selectedIndex: index,
                            side,
                            actorId: summonedMinion.id,
                            parentSource: { ...parentSource, isProc: true },
                        })
                    );
                });
            }
        }
    };
};

/**
 * Handle the induceCombatantAttack property of an action (tells minions to attack randomly)
 */
const checkInduceAttack = ({
    action,
    affectedTargetIds,
    selectedIndex,
    parentSource,
}: {
    action: Action;
    affectedTargetIds: string[];
    selectedIndex: number;
    parentSource: TriggerSource;
}) => {
    return (dispatch, getState) => {
        if (!action.induceCombatantAttack) {
            return;
        }
        shuffle(affectedTargetIds).forEach((id) => {
            const { hostileSide, actor } = orientate({ actorId: id, ...getState().battle }); // Make sure combatant's not stale
            if (!actor.HP) {
                return;
            }
            dispatch(
                performAction({
                    action: getInducedAttack(actor),
                    selectedIndex,
                    side: hostileSide,
                    actorId: id,
                    parentSource,
                })
            );
        });
    };
};

const checkHandleVacuum = ({
    vacuum,
    side,
    selectedIndex,
    area,
}: {
    vacuum: number;
    side: BATTLEFIELD_SIDES;
    selectedIndex: number;
    area: number;
}) => {
    return (dispatch, getState) => {
        if (!vacuum) {
            return;
        }
        dispatch(
            updateBattle({
                [side]: applyVacuum({
                    characters: getState().battle[side],
                    index: selectedIndex,
                    area,
                    distance: vacuum,
                }),
            })
        );
    };
};

const pushPlaybackQueue = ({
    action,
    actorId,
    selectedIndex,
    allTargetIndices,
    ability,
    side,
}: {
    action: Action;
    actorId: string;
    selectedIndex: number;
    allTargetIndices: number[];
    ability?: Ability;
    side: BATTLEFIELD_SIDES;
    //battlefield: { playerSide: (Combatant | null)[]; enemySide: (Combatant | null)[] };
}) => {
    return (dispatch, getState) => {
        const MULTI_ACTION_PLAYBACK_SPEED = 500;
        const NORMAL_ACTION_PLAYBACK_SPEED = 800;

        dispatch(
            pushEventQueue({
                ...getState().battle,
                action,
                actorId,
                id: uuid.v4(),
                selectedIndex,
                // HACK: ensure that the selected index and "extra target indices" are hit first in playback
                allTargetIndices,
                targetSide: side,
                ability,
                playbackTime:
                    action.playbackTime || (ability?.actions.length > 1 ? MULTI_ACTION_PLAYBACK_SPEED : NORMAL_ACTION_PLAYBACK_SPEED),
            } as Event)
        );
    };
};

const performAction = ({
    action,
    selectedIndex,
    side,
    actorId,
    parent,
    parentSource,
}: {
    action: Action;
    selectedIndex: number;
    side: BATTLEFIELD_SIDES;
    actorId: string;
    parent?: Ability;
    parentSource: TriggerSource;
}) => {
    return (dispatch, getState) => {
        const area = calculateActionArea({ action, actor: findCombatant(getState, actorId) });

        const { vacuum, numTargets: extraTargets = 0, excludePrimaryTarget } = action;
        dispatch(checkHandleVacuum({ vacuum, side, selectedIndex, area }));
        dispatch(checkHandleSummon({ action, actorId, parentSource }));

        const extraTargetIndices = shuffle(
            getValidTargetIndices(getState().battle[side], {
                excludeStealth: action.type === ACTION_TYPES.ATTACK || action.type === ACTION_TYPES.RANGE_ATTACK,
                excludeIndex: selectedIndex,
            })
        ).slice(0, extraTargets);

        const isAffected = (combatant: Combatant | null, i: number): boolean => {
            const inArea = combatant && [selectedIndex, ...extraTargetIndices].some((j) => Math.abs(j - i) <= area);
            if (excludePrimaryTarget) {
                return inArea && i !== selectedIndex;
            }

            return inArea;
        };

        const combatants = getState().battle[side];
        const targetIndices = combatants.reduce((acc, character: Combatant | null, i: number) => {
            if (isAffected(character, i)) {
                acc.push(i);
            }

            return acc;
        }, []);
        const targetIds = targetIndices.map((i: number) => combatants[i].id);

        const updated = getUpdatedTargets({
            targetIds,
            targetIndices,
            selectedIndex,
            action,
            actorId,
            parent,
            source: parentSource,
            getCombatantById: (id: string) => findCombatant(getState, id),
        });

        const source = { ...parentSource, actorId, targetId: combatants[selectedIndex]?.id, allTargetIds: targetIds };

        dispatch(checkLifeOnHit({ actorId, action, affectedTargets: targetIds, source: { ...source, source: action } }));
        // HACK: ensure that the selected index and "extra target indices" are hit first in playback
        const allTargetIndices = uniq([selectedIndex, ...extraTargetIndices, ...targetIndices]);
        dispatch(pushPlaybackQueue({ action, actorId, selectedIndex, allTargetIndices, ability: parent, side }));

        updated.forEach(([combatant, action]) => {
            dispatch(
                updateCombatant({
                    combatantId: combatant.id,
                    newProperties: combatant,
                    source: { ...source, source: action },
                })
            );
        });

        dispatch(checkInduceAttack({ action, affectedTargetIds: targetIds, selectedIndex, parentSource }));
        dispatch(checkCastRadiate({ source: parentSource, action, selectedIndex, side }));
        dispatch(checkCardActions(action, actorId));
        dispatch(
            onAction({
                action,
                source: { ...source, targetId: combatants[selectedIndex]?.id },
            })
        );

        updated.forEach(([combatant, action]) => {
            dispatch(
                onReceiveAction({
                    action,
                    source: { ...source, targetId: combatant.id },
                })
            );
        });
    };
};

/**
 * Sometimes, multi-action abilities have you select an enemy, but then have an additional action that eg. targets yourself.
 * This orients the target to the right place (if applicable) as actions are parsed.
 */
const autoSelectActionTarget = ({
    initialSelectedIndex,
    initialSelectedSide,
    action,
    actorId,
    getState,
}: {
    initialSelectedIndex?: number;
    initialSelectedSide?: BATTLEFIELD_SIDES;
    action: Action;
    actorId: string;
    getState: Function;
    numTargets?: number;
}) => {
    const { enemySide, playerSide } = getState().battle;
    const { friendly, hostile, actorSide, hostileSide } = orientate({ actorId, enemySide, playerSide });
    const { targetArea: area = 0, target } = action;
    const noValidSelection = typeof initialSelectedIndex !== "number" || !initialSelectedSide;

    if (target === TARGET_TYPES.RANDOM_HOSTILE || (target === TARGET_TYPES.HOSTILE && noValidSelection)) {
        const targetIndices = getValidTargetIndices(hostile, { excludeStealth: true }).filter((i) => {
            return Math.abs(i - initialSelectedIndex || 0) <= (area || Infinity);
        });

        return {
            index: getRandomItem(targetIndices),
            side: hostileSide,
        };
    } else if (target === TARGET_TYPES.RANDOM_FRIENDLY || (target === TARGET_TYPES.FRIENDLY && noValidSelection)) {
        const targetIndices = getValidTargetIndices(friendly).filter((i) => {
            return Math.abs(i - initialSelectedIndex || 0) <= (area || Infinity);
        });

        return {
            index: getRandomItem(targetIndices),
            side: actorSide,
        };
    } else if (target === TARGET_TYPES.SELF) {
        return {
            index: friendly.findIndex((ally) => ally?.id === actorId),
            side: actorSide,
        };
    }

    return { index: initialSelectedIndex, side: initialSelectedSide };
};

const checkCastRadiate = ({
    action,
    selectedIndex,
    side,
    source,
}: {
    action: Action;
    selectedIndex: number;
    side: BATTLEFIELD_SIDES;
    source: TriggerSource;
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
                parentSource: source,
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
        const { drawCards: cardsToDraw, addCards, currentHandEffects, selectCards } = action;
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

        if (selectCards) {
            dispatch(
                updateBattle({
                    selectCards,
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
            const summonedMinion: Combatant = createCombatant(minion);
            const newBattleProps: {
                playerSide?: (Combatant | null)[];
                enemySide?: (Combatant | null)[];
                playerSummonsInPlay?: { [id: string]: Ability };
            } = {
                [side]: getState().battle[side].map((combatant: Combatant | null, i: number) => {
                    return i === selectedIndex ? summonedMinion : combatant;
                }),
            };

            // If the actor is the player, then move the ability to the "active summons" bucket, so that it is later sent to discard if the minion is removed from play
            if (findCombatant(getState, actorId).isPlayer && !removeAfterTurn && !depletedOnUse) {
                newBattleProps.playerSummonsInPlay = { [summonedMinion.id]: ability };
            }

            dispatch(updateBattle(newBattleProps));
            if (summonedMinion.onSummon) {
                summonedMinion.onSummon.forEach((action) => {
                    const { index, side } = autoSelectActionTarget({ action, actorId: summonedMinion.id, getState });
                    dispatch(
                        performAction({
                            action,
                            selectedIndex: index,
                            side,
                            actorId: summonedMinion.id,
                            parentSource: { source: ability, actorId, type: TRIGGER_SOURCE_TYPES.ABILITY, isProc: true },
                        })
                    );
                });
            }

            // TODO on summon event triggers?
        }
    };
};

export const useAbility = ({
    ability,
    selectedIndex,
    side: initialSide,
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
        dispatch(
            updateCombatant({ combatantId: actorId, newProperties: { resources: Math.max(0, combatant.resources - totalResourceCost) } })
        );
        dispatch(checkSummonMinion({ ability, selectedIndex, side: initialSide, actorId }));

        const source = { type: TRIGGER_SOURCE_TYPES.ABILITY, source: ability, isProc: false };
        const handleAction = (action: Action) => {
            const { index, side } = autoSelectActionTarget({
                initialSelectedIndex: selectedIndex,
                initialSelectedSide: initialSide,
                action,
                actorId,
                getState,
            });

            const getCalculationTarget = () => {
                return getState().battle[side]?.[index] || null;
            };

            if (passesConditions({ getCalculationTarget, proc: action })) {
                dispatch(performAction({ action, selectedIndex, side, actorId, parent: ability, parentSource: source }));
            }
        };

        actions.forEach(handleAction);

        dispatch(
            updateCombatant({
                combatantId: actorId,
                newProperties: {
                    abilityHistory: [...findCombatant(getState, actorId).abilityHistory, ability],
                },
            })
        );

        dispatch(
            checkEventTrigger({
                combatantId: actorId,
                effectEventKey: EFFECT_EVENT_KEYS.onAbility,
                source: source,
            })
        );
    };
};
