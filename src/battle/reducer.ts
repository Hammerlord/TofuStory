import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { CombatAbility } from "../ability/types";
import { Combatant } from "../character/types";
import { Item } from "../item/types";
import { BattleState, EventGroup, Notification, PlayerSelectCardsPrompt } from "./types";
import { getMaxHP } from "./utils";
import { battleWarnings, MAX_HAND_SIZE } from "./constants";
import * as uuid from "uuid";
import { prepareForDiscard } from "./actions/cardActions/utils";
import { createCombatAbility } from "../ability/createCombatAbility";
import { BATTLE_STATES } from "./states";

// Partially to address a weird bug where abilities were duplicated in the hand for some reason
function dedupeByInstanceId(pile: CombatAbility[]) {
    const seen = new Set<string>();

    return pile.filter((ability) => {
        if (!ability.instanceId) {
            return true;
        }

        if (seen.has(ability.instanceId)) {
            return false;
        }

        seen.add(ability.instanceId);
        return true;
    });
}

const initialState: BattleState | null = null as BattleState | null;

export const battleStateSlice = createSlice({
    name: "battle",
    initialState: initialState as BattleState | null,
    reducers: {
        promptPlayerSelectCards: (state, action: PayloadAction<PlayerSelectCardsPrompt>) => {
            return {
                ...state,
                selectCardsPrompt: action.payload,
            };
        },
        closePlayerSelectCardsPrompt: (state) => {
            return {
                ...state,
                selectCardsPrompt: null,
            };
        },
        updateBattle: (state, action: PayloadAction<Partial<BattleState>>) => {
            return {
                ...state,
                ...action.payload,
            };
        },
        pushEventQueue: (state, action: PayloadAction<EventGroup | EventGroup[]>) => {
            let payload = action.payload;
            if (!Array.isArray(payload)) {
                payload = [payload];
            }
            state.eventQueue.push(...payload);
        },
        popEventQueue: (state) => {
            if (state?.eventQueue) {
                state.eventQueue.shift();
            }
        },
        closeBattle: () => {
            return null;
        },
        updateBattleState: (state, action: PayloadAction<BATTLE_STATES>) => {
            // If the fight is over, don't overwrite the state
            if ([BATTLE_STATES.VICTORY, BATTLE_STATES.DEFEAT].includes(state.state)) {
                return state;
            }

            // If the wave is over due to end of turn effects like DoTs or Charged Bolt, don't proceed to the enemy's turn
            if (state.state === BATTLE_STATES.WAVE_END && action.payload === BATTLE_STATES.TURN_ENDING) {
                return state;
            }
            return {
                ...state,
                state: action.payload,
            };
        },
        useConsumable: (state, action: PayloadAction<Item>) => {
            const { name, healing = 0, resources = 0, stacks = 0 } = action.payload || {};

            return {
                ...state,
                playerSide: state.playerSide.map((combatant: Combatant | null) => {
                    if (!combatant?.isPlayer) {
                        return combatant;
                    }

                    let updatedItems = [...combatant.items];
                    if (!stacks || stacks === 1) {
                        updatedItems = updatedItems.filter((item) => item.name !== name);
                    } else {
                        updatedItems = updatedItems.map((item) => {
                            if (item.name === name) {
                                return {
                                    ...item,
                                    stacks: (item.stacks ?? 1) - 1,
                                };
                            }

                            return item;
                        });
                    }

                    const maxResources = combatant.maxResources ?? 0;
                    return {
                        ...combatant,
                        HP: Math.min(getMaxHP(combatant), combatant.HP + healing),
                        resources: Math.min(maxResources, (combatant.resources ?? 0) + resources),
                        items: updatedItems,
                    };
                }),
            };
        },
        setNotification: (state, action: PayloadAction<Notification>) => {
            return {
                ...state,
                notification: action.payload,
            };
        },
        selectHandAbility: (state, action: PayloadAction<string | null>) => {
            return {
                ...state,
                selectedAllyId: null,
                selectedHandAbilityId: action.payload,
            };
        },
        selectAlly: (state, action: PayloadAction<string | null>) => {
            return {
                ...state,
                selectedAllyId: action.payload,
                selectedHandAbilityId: null,
            };
        },
        addCardsToHand: (state, action: PayloadAction<CombatAbility[]>) => {
            const newCards = action.payload.slice().map(createCombatAbility);
            let newHand: CombatAbility[] = dedupeByInstanceId([...newCards, ...state.hand]);
            const newDiscard = state.discard.slice();

            if (newHand.length >= MAX_HAND_SIZE) {
                const toDiscard = newHand.slice(MAX_HAND_SIZE);
                newHand = newHand.slice(0, MAX_HAND_SIZE);
                newDiscard.unshift(...prepareForDiscard({ cards: toDiscard }));

                return {
                    ...state,
                    hand: newHand,
                    notification: { text: battleWarnings.handFull, severity: "warning", id: uuid.v4() },
                    discard: dedupeByInstanceId(newDiscard),
                };
            }

            return {
                ...state,
                hand: newHand,
            };
        },
    },
});
