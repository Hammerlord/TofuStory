import { ReactElement, useEffect, useRef, useState } from "react";
import * as uuid from "uuid";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { endEnemyTurn, enemyMoves, startEnemyTurn } from "../actions/phases/enemyTurn";
import { nextWave, onBattleEnd, onBattleStart, onWaveClear, onWaveStart } from "../actions/phases/phases";
import { initiatePlayerTurnInProgress, playerEndTurn, startPlayerTurn } from "../actions/phases/playerTurn";
import { checkWinCondition } from "../checkWinCondition";
import { TURN_ANNOUNCEMENT_TIME } from "../constants";
import { battleStateSlice } from "../reducer";
import { BATTLE_STATES } from "../states";
import { BattleState } from "../types";

const { popEventQueue, updateBattleState, updateBattle, setNotification, pushActionHistory } = battleStateSlice.actions;

/**
 * Drives the battle state machine and its accompanying notifications/animation timing.
 */
export const useBattlePhase = ({ onWin }: { onWin?: (battle: BattleState) => void }) => {
    const dispatch = useAppDispatch();
    const battle: BattleState = useAppSelector((state) => state.battle)!;
    const { state: battleState, isPlayerTurn, eventQueue: eventGroups, currentWaveIndex, waves, round } = battle;

    const [showWaveClear, setShowWaveClear] = useState(false);
    const battleStateRef = useRef<BATTLE_STATES | null>(null);
    const playbackStartedAt = useRef<number | null>(null);

    const isWinConditionTriggered = checkWinCondition({ battle });
    const currentEventGroup = eventGroups[0];
    const { description: waveDescription } = waves[currentWaveIndex] || {};

    useEffect(() => {
        const showWaveDescription = ({
            description,
            i = 0,
            delay = 2500,
        }: {
            description?: string | string[] | ReactElement | ReactElement[];
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

        showWaveDescription({ description: waveDescription });
    }, [currentWaveIndex]);

    useEffect(() => {
        const notification = waves[currentWaveIndex]?.notifications?.find((n) => n.round === round);
        if (notification) {
            dispatch(
                setNotification({
                    text: notification.text,
                    id: uuid.v4(),
                })
            );
        }
    }, [currentWaveIndex, round]);

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
                dispatch(updateBattle({ showTurnAnnouncement: true }));
                setTimeout(() => {
                    dispatch(updateBattle({ showTurnAnnouncement: false }));
                    dispatch(updateBattleState(BATTLE_STATES.TURN_START));
                }, TURN_ANNOUNCEMENT_TIME);
            }, 250);
            return;
        }

        if (battleState === BATTLE_STATES.TURN_STARTING) {
            dispatch(updateBattle({ showTurnAnnouncement: true }));
            setTimeout(() => {
                dispatch(updateBattle({ showTurnAnnouncement: false }));
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
                        onWin && onWin(battle);
                    }
                }, TURN_ANNOUNCEMENT_TIME);
            }, 1000);
        }
    };

    useEffect(() => {
        if (!currentEventGroup) {
            playbackStartedAt.current = null;
            return;
        }

        const now = performance.now();

        if (playbackStartedAt.current === null) {
            playbackStartedAt.current = now;
        }

        const deadline = playbackStartedAt.current + currentEventGroup.playbackTime;

        const delay = Math.max(0, deadline - now);
        const event = battle.eventQueue[0];
        if (event) {
            dispatch(pushActionHistory(event));
        }

        const timeout = setTimeout(() => {
            playbackStartedAt.current = deadline;
            dispatch(popEventQueue());
        }, delay);

        return () => clearTimeout(timeout);
    }, [currentEventGroup?.id]);

    useEffect(() => {
        if ([BATTLE_STATES.VICTORY].includes(battleState)) {
            return;
        }

        if (!eventGroups.length) {
            handleBattlePhase();
            return;
        }
    }, [eventGroups, battleState, isWinConditionTriggered]);

    return { isWinConditionTriggered, showWaveClear };
};
