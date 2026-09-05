import * as uuid from "uuid";
import { aggregateAbilityEffects, aggregateItemEffects } from "../../../Menu/utils";
import { elite, eruptive, raging, thorns, warding } from "../../../ability/Effects";
import { Ability, EFFECT_EVENT_KEYS, EFFECT_TYPES, Minion } from "../../../ability/types";
import { playerStateSlice } from "../../../character/playerReducer";
import { Combatant, Player } from "../../../character/types";
import { createCombatant } from "../../../enemy/createEnemy";
import { poisonous, sneaky } from "../../../enemy/effect";
import { Item } from "../../../item/types";
import { getRandomItem, shuffle } from "../../../utils";
import { BASE_MAX_RESOURCES, BOSS_MUSIC } from "../../constants";
import { BATTLE_STATES, BattleState, battleStateSlice } from "../../reducer";
import { BATTLE_TYPES, BATTLEFIELD_SIDES, TRIGGER_SOURCE_TYPES, Wave } from "../../types";
import { calculateMesoMultiplier } from "../../utils";
import { checkCardActions } from "../cardActions/cardActions";
import { findCombatantData, updateCombatant } from "../combatantData";
import { playbackCollector } from "../playbackCollector";
import { tickDownStatusEffects } from "../statusEffect/effectLifecycle";
import { checkEventTrigger } from "../statusEffect/triggerEffectEvent";
import { checkValidEnemyTargeting } from "../targeting/enemyTargeting";
import { getEnemyMoveOrder, getUseAbilityIndex } from "./enemyTurn";
import { getNextTelegraphedAbility } from "../../../character/Telegraph";

const { updateBattle, updateBattleState, pushEventQueue } = battleStateSlice.actions;
const { updatePlayer, pushBattleHistory } = playerStateSlice.actions;

export const onBattleEnd = () => {
    return (dispatch, getState) => {
        const battle: BattleState = getState().battle;
        if (!battle) {
            return;
        }
        const { playerSide, enemySide, isTutorial, statistics, waves } = battle;
        dispatch(updateBattleState(BATTLE_STATES.VICTORY));

        dispatch(
            pushBattleHistory({
                statistics,
                waves,
            })
        );

        if (isTutorial) {
            return;
        }

        const lifeLinkedEnemies = enemySide.filter((c: Combatant | null) => c?.effects.some((e) => e.type === EFFECT_TYPES.LIFE_LINK));
        const lifeLinkMesos = lifeLinkedEnemies.reduce((acc: number, combatant: Combatant) => {
            return acc + combatant.mesos || 0;
        }, 0);

        const player: Player = playerSide.find((c: Combatant | null) => c?.isPlayer) as Player;

        dispatch(
            updatePlayer({
                HP: player.HP,
                mesos: player.mesos + calculateMesoMultiplier({ player, mesos: lifeLinkMesos }),
            })
        );
    };
};

export const onWaveClear = () => {
    return (dispatch, getState) => {
        const { playerSide } = getState().battle || {};
        if (!playerSide) {
            return;
        }

        playerSide.forEach((combatant: Combatant | null) => {
            dispatch(checkEventTrigger({ combatantId: combatant?.id, effectEventKey: EFFECT_EVENT_KEYS.onWaveClear }));
        });
    };
};

export const nextWave = () => {
    return (dispatch, getState) => {
        const { waves, currentWaveIndex, deck, hand, discard } = getState().battle;
        const { presetDeck, enemies = [] } = waves[currentWaveIndex + 1] || {};

        dispatch(
            updateBattle({
                isPlayerTurn: true,
                currentWaveIndex: currentWaveIndex + 1,
                round: 0,
                enemySide: enemies.map(createCombatant),
                deck: presetDeck ? presetDeck.map((card: Ability) => ({ ...card, instanceId: uuid.v4() })) : deck,
                hand: presetDeck ? [] : hand,
                discard: presetDeck ? [] : discard,
            })
        );
    };
};

export const startBattle = ({
    waves,
    addAbilities = [], // This adds abilities to the player's deck on battle start
    deck,
    isTutorial,
    backgroundImage,
    backgroundMusic,
    type = BATTLE_TYPES.ENCOUNTER,
    itemRewards,
    overrideItemChoices,
    cardRewards,
    disableCardRewards,
    disableItemRewards,
}: {
    waves: Wave[];
    deck?: Ability[];
    addAbilities?: Ability[];
    isTutorial?: boolean;
    backgroundImage?: string;
    backgroundMusic?: string;
    type?: BATTLE_TYPES;
    itemRewards?: Item[];
    overrideItemChoices?: Item[];
    cardRewards?: Ability[];
    disableCardRewards?: boolean;
    disableItemRewards?: boolean;
}) => {
    return (dispatch, getState) => {
        const { character } = getState();
        deck = deck || character?.deck;
        const player = {
            ...character.player,
            effects: aggregateItemEffects(character.player.items).concat(aggregateAbilityEffects(deck)),
        };
        const { presetDeck, enemies, generateEliteAffixes } = waves[0];

        const battleObj: BattleState = {
            enemySide: enemies.map((enemy: Minion) => {
                if (generateEliteAffixes && enemy?.isElite) {
                    const affixes = [thorns, raging, warding, eruptive, sneaky, poisonous];
                    return createCombatant({
                        ...enemy,
                        effects: [elite, getRandomItem(affixes)],
                    });
                }
                return createCombatant(enemy);
            }),
            playerSide: [null, null, player, null, null],
            deck: shuffle([...(presetDeck || deck).slice()])
                .sort((a, b) => {
                    const aSort = a.preemptive ? 1 : 0;
                    const bSort = b.preemptive ? 1 : 0;
                    return bSort - aSort;
                })
                .map((card) => {
                    const { instanceId, name } = card;
                    if (!instanceId) {
                        console.warn(name, "did not have an instance id. Generating one.");
                        return {
                            ...card,
                            instanceId: uuid.v4(),
                        };
                    }

                    return card;
                }),
            discard: [],
            hand: [],
            depleted: [],
            isPlayerTurn: true,
            eventQueue: [],
            playerActionQueue: [],
            currentWaveIndex: 0,
            waves,
            round: 0,
            selectCardsPrompt: null,
            isTutorial,
            state: BATTLE_STATES.BATTLE_START,
            backgroundImage,
            backgroundMusic: backgroundMusic || (type === BATTLE_TYPES.BOSS ? BOSS_MUSIC : undefined),
            type,
            itemRewards,
            overrideItemChoices,
            cardRewards,
            disableCardRewards,
            disableItemRewards,
            statistics: {
                totalDamage: 0,
                totalKills: 0,
                damageByEnemyName: {},
            },
            charactersAttackedThisTurn: [],
            addAbilities: addAbilities.map((card) => ({ ...card, instanceId: uuid.v4() })),
        };

        dispatch(updateBattle(battleObj));
    };
};

export const onBattleStart = () => {
    return (dispatch, getState) => {
        const { playerSide, enemySide, addAbilities = [] } = getState().battle;
        const playbackCollectorInstance = playbackCollector();

        if (addAbilities.length) {
            dispatch(
                checkCardActions({
                    action: {
                        addCardsToDeck: addAbilities.map((card) => ({
                            ...card,
                            instanceId: uuid.v4(),
                        })),
                    },
                    context: {
                        playbackCollector: playbackCollectorInstance,
                        name: "Battle Start - Add Cards",
                        sourceChain: [
                            {
                                type: TRIGGER_SOURCE_TYPES.NONE,
                                targetId: playerSide.find((c) => c?.isPlayer)?.id,
                            },
                        ],
                    },
                })
            );
        }

        const context = { name: "Battle Start", sourceChain: [], playbackCollector: playbackCollectorInstance };
        // Enemies go first so that eg. enemy mutates don't negate player's on battle status effects
        enemySide.concat(playerSide).forEach((combatant: Combatant | null) => {
            dispatch(checkEventTrigger({ combatantId: combatant?.id, effectEventKey: EFFECT_EVENT_KEYS.onBattleStart, context }));
        });

        dispatch(pushEventQueue(playbackCollectorInstance.get()));
    };
};

export const onWaveStart = () => {
    return (dispatch, getState) => {
        const playbackCollectorInstance = playbackCollector();
        const context = { name: "Wave Start", sourceChain: [], playbackCollector: playbackCollectorInstance };
        const { playerSide, enemySide } = getState().battle;

        // Enemies go first so that eg. enemy mutates don't negate player's on wave status effects
        enemySide.concat(playerSide).forEach((combatant: Combatant | null) => {
            dispatch(checkEventTrigger({ combatantId: combatant?.id, effectEventKey: EFFECT_EVENT_KEYS.onWaveStart, context }));
        });
        dispatch(pushEventQueue(playbackCollectorInstance.get()));

        const battle: BattleState = getState().battle;
        const nextMoveOrderIds = getEnemyMoveOrder({ enemies: getState().battle.enemySide, round: battle.round });

        nextMoveOrderIds.forEach((combatantId) => {
            const combatant = getState().battle.enemySide.find((enemy) => enemy?.id === combatantId);
            if (!combatant?.HP || !combatant.abilities?.length) {
                return;
            }

            const actorInfo = findCombatantData(battle, combatantId);
            const useAbilityIndex = getUseAbilityIndex(actorInfo);

            dispatch(
                updateCombatant({
                    combatantId,
                    newProperties: {
                        targeting: {
                            actionTargets: [], // This is updated by checkValidEnemyTargeting()
                            ability: combatant.abilities[useAbilityIndex],
                        },
                    },
                })
            );
        });

        dispatch(checkValidEnemyTargeting());
    };
};

export const onEndTurnTriggers = (side: BATTLEFIELD_SIDES) => {
    return (dispatch, getState) => {
        const playbackCollectorInstance = playbackCollector();
        const context = { name: "End Turn", sourceChain: [], playbackCollector: playbackCollectorInstance };

        getState().battle[side].forEach((combatant: Combatant | null) => {
            if (combatant) {
                dispatch(
                    checkEventTrigger({
                        combatantId: combatant.id,
                        effectEventKey: EFFECT_EVENT_KEYS.onTurnEnd,
                        context,
                    })
                );
            }
        });

        getState().battle[side].forEach((combatant: Combatant | null) => {
            if (combatant) {
                dispatch(tickDownStatusEffects(combatant.id, context));
            }
        });

        // Particularly, the player could have overcapped resources during the turn, but the cap must apply afterward.
        getState().battle[side].forEach((combatant) => {
            if (combatant) {
                dispatch(
                    updateCombatant({
                        combatantId: combatant.id,
                        newProperties: {
                            resources: Math.min(combatant.maxResources || BASE_MAX_RESOURCES, combatant.resources || 0),
                        },
                    })
                );
            }
        });

        dispatch(pushEventQueue(playbackCollectorInstance.get()));
    };
};
export const requeueRecentlyUsedAbility =
    ({ combatantId }: { combatantId: string }) =>
    (dispatch, getState) => {
        const battle = getState().battle;
        const actorInfo = findCombatantData(battle, combatantId);
        if (!actorInfo?.combatant?.HP || !actorInfo?.combatant?.abilities?.length) {
            return;
        }

        const actor: Combatant = actorInfo.combatant;

        const postUpdateActorInfo = {
            ...actorInfo,
        };

        if (!actorInfo.combatant.casting?.channelDuration) {
            const validAbilityIds = actor.abilities.map((a) => a.instanceId);
            // Exclude procs from being considered for requeuing
            const history = actor.abilityHistory.filter((a) => validAbilityIds.includes(a.instanceId));
            const abilityUsed = history[history.length - 1];
            let abilityIndex = -1;
            if (abilityUsed) {
                abilityIndex = actor.abilities.findIndex((ability) => ability.instanceId === abilityUsed?.instanceId);
            } else {
                abilityIndex = getUseAbilityIndex(actorInfo);
            }

            if (abilityIndex > -1) {
                const updatedAbilities = [...actor.abilities];
                const [used] = updatedAbilities.splice(abilityIndex, 1);
                updatedAbilities.push(used);

                dispatch(
                    updateCombatant({
                        combatantId,
                        newProperties: {
                            abilities: updatedAbilities,
                        },
                    })
                );

                postUpdateActorInfo.combatant = {
                    ...actorInfo.combatant,
                    abilities: updatedAbilities,
                };
            }
        }

        const ability = getNextTelegraphedAbility(postUpdateActorInfo);
        if (!ability?.actions) {
            dispatch(
                updateCombatant({
                    combatantId,
                    newProperties: {
                        targeting: null,
                    },
                })
            );
        }

        dispatch(
            updateCombatant({
                combatantId,
                newProperties: {
                    targeting: {
                        actionTargets: [], // This is updated by checkValidEnemyTargeting() in the function that calls this
                        ability,
                    },
                },
            })
        );
    };
