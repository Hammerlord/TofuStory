import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import AbilityView from "../ability/AbilityView/AbilityView";
import { CombatAbility } from "../ability/types";
import { cardPassesFilterCondition } from "./selectCardUtils";

const handPlaybackDuration = 300; // As much as I'd like it to be a bit slower, it causes cards to get stuck/some responsiveness problems
const CARD_WIDTH = 168; // From AbilityView

export const getHandAuraEffects = (hand: CombatAbility[]) => {
    const auraEffects = []; // Indexed effects. i = 0 : array of effects to apply to card in the 0th slot
    hand.forEach((card: CombatAbility, i) => {
        if (!card.aura) {
            return;
        }

        const { area = hand.length, effects, filters } = card.aura;
        const start = Math.max(0, i - area);
        const end = Math.min(hand.length - 1, i + area);
        for (let j = start; j <= end; ++j) {
            if (i === j) {
                // Does not affect itself
                continue;
            }

            if (!auraEffects[j]) {
                auraEffects[j] = [];
            }

            const cardToAffect = hand[j];
            if (cardPassesFilterCondition(cardToAffect, filters)) {
                auraEffects[j].push(...effects);
            }
        }
    });

    return auraEffects;
};

const Hand = ({
    hand,
    onAbilityClick,
    selectedAbilityId,
    className,
    cardRefs,
}: {
    hand: CombatAbility[];
    onAbilityClick: Function;
    selectedAbilityId: string;
    className: string;
    cardRefs;
}) => {
    const handleAbilityMouseDown = (event, id: string) => {
        if (hand.some((card: CombatAbility) => card.instanceId === id)) {
            onAbilityClick(event, id);
        }

        event.stopPropagation(); // Block the click event from going to the battlefield or it will deselect the card
    };

    return (
        <div className={className}>
            <AnimatePresence mode="popLayout">
                {hand.map((ability, i) => (
                    <motion.div
                        key={ability.instanceId}
                        layout
                        initial={{
                            x: -CARD_WIDTH / 2,
                            opacity: 0,
                        }}
                        animate={{
                            x: 0,
                            opacity: 1,
                        }}
                        exit={{
                            x: -CARD_WIDTH / 2,
                            y: "-50%",
                            opacity: 0,
                            filter: "saturate(0)",
                        }}
                        transition={{
                            duration: 0.2,
                            ease: "easeOut",
                        }}
                    >
                        <AbilityView
                            onMouseDown={(e) => handleAbilityMouseDown(e, ability.instanceId)}
                            isSelected={selectedAbilityId === ability.instanceId}
                            key={ability.instanceId}
                            ability={ability}
                            ref={(element) => {
                                if (element) {
                                    cardRefs.current[ability.instanceId] = element;
                                } else {
                                    delete cardRefs.current[ability.instanceId];
                                }
                            }}
                        />
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default Hand;
