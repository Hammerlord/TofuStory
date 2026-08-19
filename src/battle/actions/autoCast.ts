import { getUpgradeCard } from "../../Menu/utils";
import { JOB_CARD_MAP } from "../../ability";
import { isOffensiveAbility } from "../../ability/AbilityView/utils";
import { AUTO_CAST_ABILITY_TYPES, AutoCastAbility, CombatAbility, SELECT_CARD_TYPES } from "../../ability/types";
import { Combatant, Player } from "../../character/types";
import { getRandomItem } from "../../utils";
import { passesValueComparison } from "../passesConditions";
import { battleStateSlice } from "../reducer";
import getCardSelection from "../selectCardUtils";
import { ActionContext } from "./../types";
import { depleteAbilities } from "./cardActions/depleteCards";
import { applyAbilityEffectsOnDraw } from "./cardActions/drawCards";
import { handleDiscardAfterUse } from "./cardActions/discardCards";
import { useAbility } from "./useAbility";

const { updateBattle } = battleStateSlice?.actions || {};

export const checkHandleAutoCast = ({
    autoCastAbilities,
    actor,
    parentAbility,
    multiplier = 1,
    context,
}: {
    autoCastAbilities: AutoCastAbility;
    actor: Player; // Only the player auto casts (plays random abilities)
    parentAbility?: CombatAbility;
    multiplier?: number;
    context: ActionContext;
}) => {
    return (dispatch, getState) => {
        if (!autoCastAbilities || !actor.class) {
            return;
        }

        const { type, amount, presetCards = [], filters, upgradeLevels = 0 } = autoCastAbilities;
        let cards = [];
        if (type === AUTO_CAST_ABILITY_TYPES.FROM_CLASS) {
            cards = JOB_CARD_MAP[actor.class]?.all || [];
        } else if (type === AUTO_CAST_ABILITY_TYPES.PRESET_CARDS) {
            cards = presetCards;
        } else if (type === AUTO_CAST_ABILITY_TYPES.OFFENSE_FROM_CLASS) {
            cards = (JOB_CARD_MAP[actor.class]?.all || []).filter(isOffensiveAbility);
        } else if (type === AUTO_CAST_ABILITY_TYPES.FROM_DECK) {
            cards = getState().battle.deck.slice();
        }

        if (filters) {
            cards = cards.filter((card) => {
                return filters.every(({ property, comparator, value }) =>
                    passesValueComparison({ val: card[property], otherVal: value, comparator })
                );
            });
        }

        if (!cards.length) {
            return;
        }

        Array.from({ length: amount * multiplier }).forEach(() => {
            let unmodifiedAbility: CombatAbility;

            if (type === AUTO_CAST_ABILITY_TYPES.FROM_DECK) {
                unmodifiedAbility = cards.shift();
            } else {
                unmodifiedAbility = getRandomItem(cards);
            }

            if (!unmodifiedAbility) {
                return;
            }

            let abilityToCast: CombatAbility = unmodifiedAbility;

            Array.from({ length: upgradeLevels }).forEach(() => {
                const upgrade = getUpgradeCard(abilityToCast, { ignoreMaxLevel: true });
                if (upgrade) {
                    abilityToCast = upgrade;
                }
            });
            const { resourceCost: abilityCost, selectCards } = abilityToCast;

            const drawAbilityEffects = abilityToCast.onDraw?.abilityEffects;
            if (type === AUTO_CAST_ABILITY_TYPES.FROM_DECK && drawAbilityEffects) {
                const playerSide = getState().battle.playerSide;
                abilityToCast = applyAbilityEffectsOnDraw({
                    drawnCard: abilityToCast,
                    source: context?.sourceChain?.at(-1),
                    playerSide,
                    effects: drawAbilityEffects,
                });
            }

            // selectCards on ability is currently always deplete as a prerequisite to using the ability. So deplete an ability here.
            if (selectCards) {
                const { type } = selectCards;

                const { hand, deck, discard, playerSide } = getState().battle;
                const player = playerSide.find((c: Combatant | null) => c?.isPlayer);

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
                        dispatch(depleteAbilities({ actorId: actor.id, abilities: [card] }));
                    } else {
                        dispatch(updateBattle({ hand: [card, ...hand] }));
                    }
                }
            }

            // Order matters: if Vault draws another Vault, the upgrades could cause an infinite loop if the card is not
            // removed from the deck before using the ability
            if (type === AUTO_CAST_ABILITY_TYPES.FROM_DECK) {
                const newDeck = getState().battle.deck.filter((card: CombatAbility) => card.instanceId !== unmodifiedAbility.instanceId);
                dispatch(
                    updateBattle({
                        deck: newDeck,
                    })
                );
                dispatch(handleDiscardAfterUse(unmodifiedAbility));
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
                        instanceId: type === AUTO_CAST_ABILITY_TYPES.FROM_DECK ? abilityToCast.instanceId : undefined,
                    },
                    actorId: actor.id,
                    isAutoCast: true,
                    playbackCollector: context?.playbackCollector,
                })
            );
        });
    };
};
