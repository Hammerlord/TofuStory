import { CombatAbility, EFFECT_EVENT_KEYS, EFFECT_TYPES } from "../../../ability/types";
import { Combatant, Player } from "../../../character/types";
import { checkWinCondition } from "../../checkWinCondition";
import { getMaxResources } from "../playerAbility";
import { battleStateSlice } from "../../reducer";
import { BATTLEFIELD_SIDES } from "../../types";
import { prepareForDiscard } from "../cardActions/discardCards";
import { drawCards } from "../cardActions/drawCards";
import { findCombatantData, updateCombatants } from "../combatantData";
import { playbackCollector } from "../playbackCollector";
import { getEnabledEffects } from "../statusEffect/getEnabledEffects";
import { checkEventTrigger } from "../statusEffect/triggerEffectEvent";
import { checkValidEnemyTargeting } from "../targeting/enemyTargeting";
import { useAbility } from "../useAbility";
import { checkHalveArmor } from "./checkHalveArmor";
import { checkTurnResourceGain } from "./checkTurnResourceGain";
import { handleDoTs } from "./damageOverTime";
import { onEndTurnTriggers } from "./phases";

const { updateBattle, pushEventQueue } = battleStateSlice.actions;

export const onSummonAttack = ({ selectedIndex, actorId }: { selectedIndex: number; actorId: string }) => {
    return (dispatch, getState) => {
        const ability = findCombatantData(getState().battle, actorId)?.combatant?.abilities[0];
        if (!ability) {
            return;
        }

        dispatch(
            useAbility({
                selectedIndex,
                side: BATTLEFIELD_SIDES.ENEMY_SIDE,
                ability,
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

const minionAutoAttack = () => {
    return (dispatch, getState) => {
        const { playerSide } = getState().battle;

        const playbackCollectorInstance = playbackCollector();
        playerSide.forEach((combatant: Combatant | null) => {
            if (!combatant?.HP || combatant.controllable || combatant.cantMove || combatant.isPlayer) {
                return;
            }

            const abilityToUse = combatant.abilities[0];
            if (!abilityToUse) {
                return;
            }

            dispatch(
                useAbility({
                    ability: abilityToUse,
                    actorId: combatant.id,
                    context: { name: "Minion Attack", playbackCollector: playbackCollectorInstance },
                })
            );
        });

        dispatch(pushEventQueue(playbackCollectorInstance.get()));
    };
};

export const playerEndTurn = () => {
    return (dispatch, getState) => {
        // Order matters: discard first, so that any lingering minion attacks that result in a card draw don't have that card immediately discarded
        // Then, tick down end turn triggers so that buffs don't fall off before minions can attack
        const { discard, hand } = getState().battle;
        const newHand = hand.filter((card: CombatAbility) => card.retain);
        const cardsToDiscard = hand.filter((card: CombatAbility) => !card.retain);

        dispatch(
            updateBattle({
                discard: [...prepareForDiscard(cardsToDiscard), ...discard],
                hand: newHand,
            })
        );

        dispatch(minionAutoAttack());
        dispatch(onEndTurnTriggers({ combatants: getState().battle.playerSide }));
    };
};

export const startPlayerTurn = (isNewWave: boolean) => {
    return (dispatch, getState) => {
        const { playerSide, round, hand } = getState().battle;
        dispatch(
            updateBattle({
                round: round + 1,
                charactersAttackedThisTurn: [],
                playerSide: updateCombatants(playerSide, clearTurnHistory),
            })
        );

        if (checkWinCondition({ battle: getState().battle })) {
            return;
        }

        const combatantIds = playerSide.map((combatant) => combatant?.id).filter((v) => v);

        const playbackCollectorInstance = playbackCollector();
        const context = { name: "Player Start Turn", playbackCollector: playbackCollectorInstance };
        dispatch(handleDoTs({ combatantIds, side: BATTLEFIELD_SIDES.PLAYER_SIDE, context }));

        const getPlayerSideInfo = () =>
            getState().battle.playerSide.map((combatant) => findCombatantData(getState().battle, combatant?.id));

        if (round > 0) {
            dispatch(checkHalveArmor(getPlayerSideInfo(), context));
        }

        dispatch(checkTurnResourceGain(getPlayerSideInfo(), context));

        playerSide.forEach((combatant: Combatant | null) => {
            if (combatant) {
                dispatch(checkEventTrigger({ combatantId: combatant.id, effectEventKey: EFFECT_EVENT_KEYS.onTurnStart, context }));
            }
        });

        // Drawing cards last so that eg. drawing Zap (stun) can benefit from Star Earrings (draw a card on CC).
        // Maybe I'll regret this ordering for some other reason later.
        const { battle } = getState();
        const player: Player = battle.playerSide.find((c: Combatant | null) => c?.isPlayer);
        const drawCardsPerTurn = getEnabledEffects({ combatantInfo: findCombatantData(getState().battle, player?.id) }).reduce(
            (acc, { drawCardsPerTurn = 0 }) => acc + drawCardsPerTurn,
            player.drawCardsPerTurn
        );

        // If it's a new wave, draw only to the drawCardsPerTurn maximum. We have kept the cards from the previous wave for this.
        const drawCardsAmount = isNewWave ? drawCardsPerTurn - hand.length : drawCardsPerTurn;
        dispatch(
            drawCards({
                amount: drawCardsAmount,
                context: context,
                isOnTurnDraw: true,
            })
        );

        playerSide.forEach((combatant: Combatant | null) => {
            if (combatant) {
                dispatch(checkEventTrigger({ combatantId: combatant.id, effectEventKey: EFFECT_EVENT_KEYS.onTurnDraw, context }));
            }
        });

        dispatch(pushEventQueue(playbackCollectorInstance.get()));
    };
};

export const initiatePlayerTurnInProgress = () => {
    return (dispatch, getState) => {
        const { playerSide } = getState().battle;

        playerSide.forEach((combatant: Combatant | null) => {
            if (combatant) {
                dispatch(checkEventTrigger({ combatantId: combatant.id, effectEventKey: EFFECT_EVENT_KEYS.onTurnInProgress }));
            }
        });

        // Update the enemy's targeting after all the turn start stuff has played out (in case targeting might change due to deaths etc.)
        dispatch(checkValidEnemyTargeting());
    };
};

const clearTurnHistory = (character: Combatant): Combatant => {
    return {
        ...character,
        turnHistory: [],
    };
};
