import uuid from "uuid";
import { Ability, EFFECT_EVENT_KEYS } from "../../ability/types";
import { playerStateSlice } from "../../character/playerReducer";
import { Combatant } from "../../character/types";
import { createCombatant } from "../../enemy/createEnemy";
import { Item } from "../../item/types";
import { shuffle } from "../../utils";
import { BOSS_MUSIC } from "../constants";
import { battleStateSlice } from "../reducer";
import { BATTLE_TYPES, Wave } from "../types";
import { aggregateItemEffects } from "./../../Menu/utils";
import { BATTLE_STATES } from "./../reducer";
import { checkEventTrigger } from "./actions";

const { updateBattle, updateBattleState } = battleStateSlice.actions;
const { updatePlayer } = playerStateSlice.actions;

export const onBattleEnd = () => {
    return (dispatch, getState) => {
        dispatch(updateBattleState(BATTLE_STATES.VICTORY));

        const { playerSide, mesosAccumulated, isTutorial } = getState().battle;
        const player = playerSide.find((c: Combatant | null) => c?.isPlayer);
        const mesosGainedMultiplier = player.effects.reduce((acc, { mesosGained = 0 }) => {
            return acc + mesosGained;
        }, 1);

        if (isTutorial) {
            return;
        }
        dispatch(
            updatePlayer({
                armor: 0,
                HP: player.HP,
                turnHistory: [],
                abilityHistory: [],
                mesos: player.mesos + Math.floor(mesosAccumulated * mesosGainedMultiplier),
            })
        );
    };
};

export const onWaveClear = () => {
    return (dispatch, getState) => {
        const { waves, currentWaveIndex, deck, playerSide, hand, discard } = getState().battle;
        const { presetDeck, enemies } = waves[currentWaveIndex + 1] || {};

        playerSide.forEach((combatant: Combatant | null) => {
            dispatch(checkEventTrigger({ combatantId: combatant?.id, effectEventKey: EFFECT_EVENT_KEYS.onWaveClear }));
        });

        if (!enemies) {
            dispatch(onBattleEnd());
            return;
        }

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
}) => {
    return (dispatch, getState) => {
        const { character } = getState();
        const player = {
            ...character.player,
            effects: aggregateItemEffects(character.player.items),
        };
        deck = deck || character?.deck;
        const { presetDeck, enemies } = waves[0];

        dispatch(
            updateBattle({
                enemySide: enemies.map(createCombatant),
                playerSide: [null, null, player, null, null],
                deck: shuffle([...(presetDeck || deck).slice(), ...addAbilities])
                    .sort((a, b) => {
                        const aSort = a.preemptive ? 1 : 0;
                        const bSort = b.preemptive ? 1 : 0;
                        return bSort - aSort;
                    })
                    .map((card) => ({
                        ...card,
                        instanceId: uuid.v4(),
                    })),
                discard: [],
                hand: [],
                isPlayerTurn: true,
                eventQueue: [],
                playerActionQueue: [],
                playerSummonsInPlay: {},
                currentWaveIndex: 0,
                waves,
                round: 0,
                selectCards: null,
                mesosAccumulated: 0,
                isTutorial,
                state: BATTLE_STATES.WAVE_START,
                backgroundImage,
                backgroundMusic: backgroundMusic || (type === BATTLE_TYPES.BOSS ? BOSS_MUSIC : undefined),
                type,
                itemRewards,
                cardRewards,
                disableCardRewards,
            })
        );
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
