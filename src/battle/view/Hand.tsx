import { AnimatePresence, motion } from "framer-motion";
import { createUseStyles } from "react-jss";
import AbilityView from "../../ability/AbilityView/AbilityView";
import { AbilityEffect, CombatAbility } from "../../ability/types";
import { cardPassesFilterCondition } from "../selectCardUtils";
import { RefObject, useMemo, useState } from "react";
import { CARD_WIDTH } from "../../ability/AbilityView/constants";

const useStyles = createUseStyles({
    // Key hint shown above each card, matching the number-key shortcuts (1-9 select cards 1-9, 0 selects the 10th)
    cardIndex: {
        position: "absolute",
        bottom: "100%",
        left: "50%",
        transform: "translateX(-50%)",
        marginBottom: 4,
        fontSize: "0.95rem",
        fontWeight: 700,
        lineHeight: "1.2",
        color: "rgba(255, 255, 255, 0.95)",
        textShadow: Array.from({ length: 10 })
            .map(() => "0 0 2px black")
            .join(", "),
        userSelect: "none",
        pointerEvents: "none",
        whiteSpace: "nowrap",
    },
});

export const getHandAuraEffects = (hand: CombatAbility[]): AbilityEffect[][] => {
    const auraEffects: AbilityEffect[][] = []; // Indexed effects. i = 0 : array of effects to apply to card in the 0th slot
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
    highlightIndex,
    hideCardIndexes,
}: {
    hand: CombatAbility[];
    onAbilityClick: (event: React.MouseEvent, id: string) => void;
    selectedAbilityId?: string | null;
    className: string;
    cardRefs: RefObject<{ [cardId: string]: HTMLElement }>;
    highlightIndex?: number | null;
    hideCardIndexes?: boolean;
}) => {
    const classes = useStyles();
    const [bonusCardIds, setBonusCardIds] = useState<{ [cardId: string]: boolean }>({});
    const handleAbilityMouseDown = (event: React.MouseEvent, id: string) => {
        if (hand.some((card: CombatAbility) => card.instanceId === id)) {
            onAbilityClick(event, id);
        }

        event.stopPropagation(); // Block the click event from going to the battlefield or it will deselect the card
    };

    hand = useMemo(() => {
        const auraEffects = getHandAuraEffects(hand);
        return hand.map((ability, i) => ({
            ...ability,
            effects: [...(ability.effects || []), ...(auraEffects[i] || [])],
        }));
    }, [hand]);

    return (
        <div className={className}>
            <AnimatePresence mode="popLayout">
                {hand.map((ability, i) => {
                    const spread = CARD_WIDTH * 0.65;

                    // How far this card is from the rightmost card
                    const distanceFromRight = hand.length - 1 - i;

                    return (
                        <motion.div
                            key={ability.instanceId}
                            layout
                            style={{
                                position: "relative",
                                zIndex: bonusCardIds[ability.instanceId] ? 1 : undefined,
                            }}
                            initial={{
                                x: -i * spread,
                                opacity: 0,
                            }}
                            animate={{
                                x: 0,
                                opacity: 1,
                            }}
                            exit={{
                                x: distanceFromRight * spread,
                                opacity: 0,
                                filter: "saturate(0)",
                            }}
                            transition={{
                                duration: 0.3,
                                ease: [0.22, 1, 0.36, 1],
                            }}
                        >
                            {!hideCardIndexes && (
                                <span className={classes.cardIndex}>{(i + 1) % 10}</span>
                            )}
                            <AbilityView
                                onMouseDown={(e) => handleAbilityMouseDown(e, ability.instanceId)}
                                onBonusChange={(hasBonus) =>
                                    setBonusCardIds((prev) =>
                                        prev[ability.instanceId] === hasBonus
                                            ? prev
                                            : { ...prev, [ability.instanceId]: hasBonus },
                                    )
                                }
                                isSelected={
                                    selectedAbilityId === ability.instanceId || highlightIndex === i
                                }
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
                    );
                })}
            </AnimatePresence>
        </div>
    );
};

export default Hand;
