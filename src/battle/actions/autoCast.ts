import { getUpgradeCard } from "../../Menu/utils";
import { JOB_CARD_MAP } from "../../ability";
import { isOffensiveAbility } from "../../ability/AbilityView/utils";
import {
    Ability,
    AUTO_CAST_ABILITY_TYPES,
    AutoCastAbility,
    CombatAbility,
    EFFECT_EVENT_KEYS,
    SELECT_CARD_TYPES,
} from "../../ability/types";
import { Combatant, Player } from "../../character/types";
import { getRandomItem, shuffle } from "../../utils";
import { passesValueComparison } from "../passesConditions";
import { battleStateSlice } from "../reducer";
import { BattleState } from "../types";
import getCardSelection from "../selectCardUtils";
import { ActionContext } from "./../types";
import { depleteAbilities } from "./cardActions/depleteCards";
import { applyAbilityEffectsOnDraw } from "./cardActions/drawCards";
import { handleDiscardAfterUse } from "./cardActions/discardCards";
import { useAbility } from "./useAbility";
import { triggerAddCardsToHandEvent } from "./cardActions/cardActions";
import { checkEventTrigger } from "./statusEffect/triggerEffectEvent";
import { AppDispatch, RootState } from "../../store";
import _ from "lodash";

const { updateBattle, addCardsToHand } = battleStateSlice?.actions || {};

export const checkHandleAutoCast = ({
    autoCastAbilities,
    actor,
    parentAbility,
    multiplier = 1,
    context,
}: {
    autoCastAbilities?: AutoCastAbility | undefined;
    actor: Player; // Only the player auto casts (plays random abilities)
    parentAbility?: CombatAbility;
    multiplier?: number;
    context: ActionContext;
}) => {
    return (dispatch: AppDispatch, getState: () => RootState) => {
        if (!autoCastAbilities || !actor.class) {
            return;
        }

        const { type, amount, presetCards = [], filters, upgradeLevels = 0 } = autoCastAbilities;
        let cards: Ability[] = [];
        if (type === AUTO_CAST_ABILITY_TYPES.FROM_CLASS) {
            cards = JOB_CARD_MAP[actor.class]?.all || [];
        } else if (type === AUTO_CAST_ABILITY_TYPES.PRESET_CARDS) {
            cards = presetCards;
        } else if (type === AUTO_CAST_ABILITY_TYPES.OFFENSE_FROM_CLASS) {
            cards = (JOB_CARD_MAP[actor.class]?.all || []).filter(isOffensiveAbility);
        } else if (type === AUTO_CAST_ABILITY_TYPES.FROM_DECK) {
            cards = getState().battle!.deck.slice();
            if (!cards.length) {
                dispatch(cycleDeck(context));
                cards = getState().battle!.deck.slice();
            }
        }

        if (filters) {
            cards = cards.filter((card: Ability) => {
                return filters.every(({ property, comparator, value }) => {
                    const val = _.get(card, property);
                    return passesValueComparison({ val, otherVal: value, comparator });
                });
            });
        }

        if (!cards.length) {
            return;
        }

        Array.from({ length: amount * multiplier }).forEach(() => {
            let unmodifiedAbility: CombatAbility | Ability;

            if (type === AUTO_CAST_ABILITY_TYPES.FROM_DECK) {
                unmodifiedAbility = cards.shift()!;
            } else {
                unmodifiedAbility = getRandomItem(cards);
            }

            if (!unmodifiedAbility) {
                return;
            }

            let abilityToCast: CombatAbility | Ability = unmodifiedAbility;

            Array.from({ length: upgradeLevels }).forEach(() => {
                const upgrade = getUpgradeCard(abilityToCast, { ignoreMaxLevel: true });
                if (upgrade) {
                    abilityToCast = upgrade;
                }
            });
            const { resourceCost: abilityCost, selectCards } = abilityToCast;

            const drawAbilityEffects = abilityToCast.onDraw?.abilityEffects;
            if (type === AUTO_CAST_ABILITY_TYPES.FROM_DECK && drawAbilityEffects) {
                const battle = getState().battle!;
                const { playerSide } = battle;
                const player = playerSide.find((c) => c?.isPlayer) as Player;
                abilityToCast = applyAbilityEffectsOnDraw({
                    // Cards in the deck are always CombatAbility
                    drawnCard: abilityToCast as CombatAbility,
                    context,
                    playerSide,
                    effects: drawAbilityEffects,
                    battle,
                    player,
                });
            }

            // selectCards on ability is currently always deplete as a prerequisite to using the ability. So deplete an ability here.
            if (selectCards) {
                const { type } = selectCards;

                const { hand, deck, discard, playerSide } = getState().battle!;
                const player = playerSide.find((c: Combatant | null) => c?.isPlayer) as Player;

                const card = getRandomItem(
                    getCardSelection({
                        hand,
                        deck,
                        discard,
                        selectCards: selectCards,
                        selectedAbilityId: parentAbility?.instanceId,
                        player,
                    })
                );

                if (card) {
                    if (type === SELECT_CARD_TYPES.DEPLETE_FROM_HAND) {
                        dispatch(depleteAbilities({ actorId: actor.id, abilities: [card], context }));
                    } else {
                        dispatch(addCardsToHand([card]));
                        dispatch(triggerAddCardsToHandEvent(cards.length, context));
                    }
                }
            }

            // Order matters: if Vault draws another Vault, the upgrades could cause an infinite loop if the card is not
            // removed from the deck before using the ability
            if (type === AUTO_CAST_ABILITY_TYPES.FROM_DECK) {
                const battle: BattleState = getState().battle!;
                const combatAbility = unmodifiedAbility as CombatAbility; // Cards in the deck are always CombatAbility

                const newDeck = battle.deck.filter((card: CombatAbility) => card.instanceId !== combatAbility.instanceId);
                dispatch(
                    updateBattle({
                        deck: newDeck,
                    })
                );
                dispatch(handleDiscardAfterUse(combatAbility));
            }
            // Auto-casted ability costs 0 unless it is a variable cost ability
            const resourceCost = abilityCost !== "x" ? 0 : abilityCost;

            // instanceId: undefined -- only "cards" should have ids, not auto casted abilities.
            // Issue where Astral Rewind was grabbing abilities casted from Metronome.
            dispatch(
                useAbility({
                    ability: {
                        ...abilityToCast,
                        resourceCost,
                        instanceId: type === AUTO_CAST_ABILITY_TYPES.FROM_DECK ? (abilityToCast as CombatAbility).instanceId : undefined,
                    },
                    actorId: actor.id,
                    isAutoCast: true,
                    context,
                })
            );
        });
    };
};

const cycleDeck = (context: ActionContext) => {
    return (dispatch: AppDispatch, getState: () => RootState) => {
        const battle: BattleState = getState().battle!;
        const { playerSide, enemySide, discard } = battle;
        updateBattle({
            discard: [],
            deck: shuffle(discard.slice()),
        });

        playerSide.concat(enemySide).forEach((combatant) => {
            if (combatant) {
                dispatch(
                    checkEventTrigger({
                        combatantId: combatant.id,
                        effectEventKey: EFFECT_EVENT_KEYS.onDeckCycle,
                        context: context,
                    })
                );
            }
        });
    };
};
