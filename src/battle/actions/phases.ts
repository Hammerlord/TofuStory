import uuid from "uuid";
import { elite, eruptive, raging, shielding, thorns } from "../../ability/Effects";
import { Ability, EFFECT_EVENT_KEYS, Minion } from "../../ability/types";
import { playerStateSlice } from "../../character/playerReducer";
import { Combatant } from "../../character/types";
import { createCombatant } from "../../enemy/createEnemy";
import { poisonous, sneaky } from "../../enemy/effect";
import { Item } from "../../item/types";
import { getRandomItem, shuffle } from "../../utils";
import { BOSS_MUSIC } from "../constants";
import { BattleState, battleStateSlice } from "../reducer";
import { BATTLE_TYPES, TRIGGER_SOURCE_TYPES, Wave } from "../types";
import { calculateMesoGain } from "../utils";
import { aggregateAbilityEffects, aggregateItemEffects } from "./../../Menu/utils";
import { BATTLE_STATES } from "./../reducer";
import { checkEventTrigger } from "./actions";
import { checkCardActions } from "./cardActions";
import { prepareForDiscard } from "./playerTurn";

const { updateBattle, updateBattleState } = battleStateSlice.actions;
const { updatePlayer, pushBattleHistory, updateMesos } = playerStateSlice.actions;

export const onBattleEnd = () => {
    return (dispatch, getState) => {
        const { playerSide, mesosAccumulated, isTutorial, totalDamageDealt, totalKills } = getState().battle;
        playerSide.forEach((combatant: Combatant | null) => {
            dispatch(checkEventTrigger({ combatantId: combatant?.id, effectEventKey: EFFECT_EVENT_KEYS.onWaveClear }));
        });

        dispatch(updateBattleState(BATTLE_STATES.VICTORY));

        const player = playerSide.find((c: Combatant | null) => c?.isPlayer);

        dispatch(
            pushBattleHistory({
                totalDamageDealt,
                totalKills,
            })
        );

        if (isTutorial) {
            return;
        }

        dispatch(
            updatePlayer({
                armor: 0,
                HP: player.HP,
                turnHistory: [],
                abilityHistory: [],
                // Tricky: Player is the in-combat player who may have had its mesos value change over the course of battle
                mesos: calculateMesoGain({ player, mesos: mesosAccumulated }),
            })
        );
    };
};

export const onWaveClear = () => {
    return (dispatch, getState) => {
        const { playerSide, hand, discard } = getState().battle;

        playerSide.forEach((combatant: Combatant | null) => {
            dispatch(checkEventTrigger({ combatantId: combatant?.id, effectEventKey: EFFECT_EVENT_KEYS.onWaveClear }));
        });

        dispatch(
            updateBattle({
                discard: [...prepareForDiscard(hand), ...discard],
                hand: [],
            })
        );
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
                    const affixes = [thorns, raging, shielding, eruptive, sneaky, poisonous];
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
            playerSummonsInPlay: {},
            currentWaveIndex: 0,
            waves,
            round: 0,
            selectCardsPrompt: null,
            mesosAccumulated: 0,
            isTutorial,
            state: BATTLE_STATES.BATTLE_START,
            backgroundImage,
            backgroundMusic: backgroundMusic || (type === BATTLE_TYPES.BOSS ? BOSS_MUSIC : undefined),
            type,
            itemRewards,
            cardRewards,
            disableCardRewards,
            disableItemRewards,
            totalDamageDealt: 0,
            totalKills: 0,
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
                checkCardActions(
                    {
                        addCardsToDeck: addAbilities.map((card) => ({
                            ...card,
                            instanceId: uuid.v4(),
                        })),
                    },
                    {
                        type: TRIGGER_SOURCE_TYPES.NONE,
                        triggerHistory: [],
                        targetId: playerSide.find((c) => c?.isPlayer)?.id,
                    }
                )
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
    };
};
