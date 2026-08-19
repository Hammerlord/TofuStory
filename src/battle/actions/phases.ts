import * as uuid from "uuid";
import { elite, eruptive, raging, thorns, warding } from "../../ability/Effects";
import { Ability, EFFECT_EVENT_KEYS, EFFECT_TYPES, Minion } from "../../ability/types";
import { getNextTelegraphedAbility } from "../../character/Telegraph";
import getAbilityPreviews from "../../character/getAbilityPreviews";
import { playerStateSlice } from "../../character/playerReducer";
import { Combatant, Player } from "../../character/types";
import { createCombatant } from "../../enemy/createEnemy";
import { poisonous, sneaky } from "../../enemy/effect";
import { Item } from "../../item/types";
import { getRandomItem, shuffle } from "../../utils";
import { BOSS_MUSIC } from "../constants";
import { BattleState, battleStateSlice } from "../reducer";
import { BATTLE_TYPES, BATTLEFIELD_SIDES, TRIGGER_SOURCE_TYPES, Wave } from "../types";
import { aggregateAbilityEffects, aggregateItemEffects } from "./../../Menu/utils";
import { BATTLE_STATES } from "./../reducer";
import { checkCardActions } from "./cardActions/cardActions";
import { calculateMesoMultiplier } from "../utils";
import { findCombatantData } from "./combatantData";
import { checkEventTrigger } from "./triggerEffectEvent";
import { autoSelectActionTarget } from "./targeting";
import { playbackCollector } from "./playbackCollector";
import { tickDownStatusEffects } from "./effectLifecycle";
import { updateCombatant } from "./combatantData";

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
        playerSide.concat(enemySide).forEach((combatant: Combatant | null) => {
            dispatch(checkEventTrigger({ combatantId: combatant?.id, effectEventKey: EFFECT_EVENT_KEYS.onBattleStart }));
        });
    };
};

export const onWaveStart = () => {
    return (dispatch, getState) => {
        const { playerSide, enemySide } = getState().battle;
        playerSide.concat(enemySide).forEach((combatant: Combatant | null) => {
            dispatch(checkEventTrigger({ combatantId: combatant?.id, effectEventKey: EFFECT_EVENT_KEYS.onWaveStart }));
        });

        let battle = getState().battle;

        enemySide.forEach((combatant: Combatant | null) => {
            if (combatant?.id) {
                const actor = findCombatantData(getState().battle, combatant.id);
                if (!actor) {
                    return;
                }

                const ability = getNextTelegraphedAbility(actor);
                if (!ability?.actions) {
                    return;
                }

                let mutableUpdatedActionTargets = [];
                ability.actions.forEach((action, i) => {
                    const targeting = autoSelectActionTarget({ action, actorId: combatant.id, battle: getState().battle });
                    mutableUpdatedActionTargets = mutableUpdatedActionTargets.slice();
                    mutableUpdatedActionTargets[i] = targeting;

                    const previews = getAbilityPreviews({
                        ability,
                        actor: {
                            ...combatant,
                            targeting: {
                                ability,
                                actionTargets: mutableUpdatedActionTargets,
                            },
                        },
                        battle,
                    });

                    battle = {
                        ...battle,
                        ...previews.combatantStates,
                    };
                });

                dispatch(
                    updateCombatant({
                        combatantId: combatant.id,
                        newProperties: {
                            targeting: {
                                actionTargets: mutableUpdatedActionTargets,
                                ability,
                            },
                        },
                    })
                );
            }
        });
    };
};

export const onEndTurnTriggers = ({ combatants, side }: { combatants: (Combatant | null)[]; side: BATTLEFIELD_SIDES }) => {
    return (dispatch) => {
        const playbackCollectorInstance = playbackCollector();
        combatants.forEach((combatant: Combatant | null) => {
            if (combatant) {
                dispatch(
                    checkEventTrigger({
                        combatantId: combatant.id,
                        effectEventKey: EFFECT_EVENT_KEYS.onTurnEnd,
                        context: { sourceChain: [], playbackCollector: playbackCollectorInstance },
                    })
                );
            }
        });

        combatants.forEach((combatant: Combatant | null) => {
            if (combatant) {
                dispatch(tickDownStatusEffects(combatant.id));
            }
        });

        dispatch(pushEventQueue(playbackCollectorInstance.get()));
    };
};
