/**
 * These signal the phase of a battle and what events to subsequently trigger after playback.
 */
export enum BATTLE_STATES {
    BATTLE_START = "battle-start",
    WAVE_START = "wave-start",
    TURN_START = "turn-start",
    TURN_STARTING = "turn-starting",
    TURN_IN_PROGRESS = "turn-in-progress",
    TURN_END = "turn-end",
    TURN_ENDING = "turn-ending",
    WAVE_END = "wave-end",
    VICTORY = "victory",
    DEFEAT = "defeat",
}
