import classNames from "classnames";
import { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
import AbilityView from "../ability/AbilityView/AbilityView";
import { CombatAbility } from "../ability/types";
import { cardPassesFilterCondition } from "./selectCardUtils";

const handPlaybackDuration = 300; // As much as I'd like it to be a bit slower, it causes cards to get stuck/some responsiveness problems
const CARD_WIDTH = 168; // From AbilityView
const useStyles = createUseStyles({
    "@keyframes slideIn": {
        from: {
            transform: "translate(-25%, 0)",
            opacity: 0,
        },
        to: {
            transform: "translate(0, 0)",
            opacity: 1,
        },
    },
    slideIn: {
        animation: "$slideIn",
        transitionTimingFunction: "ease-in",
        animationDuration: handPlaybackDuration,
        animationIterationCount: 1,
    },
    "@keyframes slideOut": {
        from: {
            transform: "translate(0, 0)",
            width: CARD_WIDTH,
            opacity: 1,
            filter: "saturate(0.5)",
        },
        to: {
            transform: `translate(-${CARD_WIDTH / 2}px, -50%)`,
            width: "0px",
            opacity: 0,
            filter: "saturate(0)",
        },
    },
    slideOut: {
        animation: "$slideOut",
        transitionTimingFunction: "ease-out",
        animationDuration: handPlaybackDuration,
        animationIterationCount: 1,
        opacity: 0, // Prevent an issue where the cards would appear to flicker back into their original place when the animation is done
    },
    "@keyframes slideOutSingle": {
        from: {
            transform: "translate(0, 0)",
            opacity: 1,
            filter: "saturate(0.5)",
        },
        to: {
            transform: "translate(0, -50%)",
            opacity: 0,
            filter: "saturate(0)",
        },
    },
    slideOutSingle: {
        animation: "$slideOutSingle",
        transitionTimingFunction: "ease-out",
        animationDuration: handPlaybackDuration,
        animationIterationCount: 1,
        opacity: 0, // Prevent an issue where the cards would appear to flicker back into their original place when the animation is done
    },
});

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
    const [oldHand, setOldHand] = useState([]);
    const classes = useStyles();

    useEffect(() => {
        setTimeout(() => {
            setOldHand(hand);
            // Bit faster so that the animation doesn't reset before eg. the card leaves
        }, handPlaybackDuration - 25);
    }, [JSON.stringify(hand)]);

    const handleAbilityMouseDown = (event, id: string) => {
        if (hand.some((card: CombatAbility) => card.instanceId === id)) {
            setOldHand(hand);
            onAbilityClick(event, id);
        }

        event.stopPropagation(); // Block the click event from going to the battlefield or it will deselect the card
    };

    const isCardInHand = (card: CombatAbility, hand: CombatAbility[], position?: number): boolean => {
        if (typeof position === "number") {
            if (hand[position]?.instanceId !== card?.instanceId) {
                return false;
            }
        }

        return hand.some((c) => c.instanceId === card.instanceId);
    };

    const getMergedHand = () => {
        const uniqueHand = [...oldHand];
        hand.forEach((card) => {
            if (!isCardInHand(card, uniqueHand)) {
                uniqueHand.push(card);
            }
        });
        return uniqueHand;
    };

    const handToDisplay = hand !== oldHand ? getMergedHand() : hand;
    const auraEffects = getHandAuraEffects(handToDisplay);

    const getAbility = (ability, i) => {
        return {
            ...ability,
            effects: [...(ability.effects || []), ...(auraEffects[i] || [])],
        };
    };
    return (
        <div className={className}>
            {handToDisplay.map((ability: CombatAbility, i: number) => (
                <AbilityView
                    onMouseDown={(e) => handleAbilityMouseDown(e, ability.instanceId)}
                    isSelected={selectedAbilityId === ability.instanceId}
                    key={ability.instanceId}
                    ability={getAbility(ability, i)}
                    ref={(element) => {
                        if (element) {
                            cardRefs.current[ability.instanceId] = element;
                        } else {
                            delete cardRefs.current[ability.instanceId];
                        }
                    }}
                    className={classNames({
                        [classes.slideIn]: !isCardInHand(ability, oldHand, i),
                        [classes.slideOut]: !isCardInHand(ability, hand, i) && handToDisplay.length > 1,
                        [classes.slideOutSingle]: !isCardInHand(ability, hand, i) && handToDisplay.length === 1,
                    })}
                    style={{ animationDelay: i * 50 }}
                />
            ))}
        </div>
    );
};

export default Hand;
