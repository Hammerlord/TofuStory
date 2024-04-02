import classNames from "classnames";
import { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
import AbilityView from "../ability/AbilityView/AbilityView";
import { CombatAbility } from "../ability/types";

const handPlaybackDuration = 300; // As much as I'd like it to be a bit slower, it causes cards to get stuck/some responsiveness problems
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
            width: "150px", // Card width, see AbilityView style root
            opacity: 1,
        },
        to: {
            transform: "translate(-75px, -50%)", // X is 1/2 card width
            width: "0px",
            opacity: 0,
        },
    },
    slideOut: {
        animation: "$slideOut",
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

        const { area = hand.length, effects } = card.aura;
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

            auraEffects[j].push(...effects);
        }
    });

    return auraEffects;
};

const Hand = ({
    hand,
    onAbilityClick,
    selectedAbilityId,
    className,
    refs,
}: {
    hand: CombatAbility[];
    onAbilityClick: Function;
    selectedAbilityId: string;
    className: string;
    refs;
}) => {
    const [oldHand, setOldHand] = useState([]);
    const classes = useStyles();

    useEffect(() => {
        const timeout = setTimeout(() => {
            setOldHand(hand);
            // Bit faster so that the animation doesn't reset before eg. the card leaves
        }, handPlaybackDuration - 10);

        return () => {
            clearTimeout(timeout);
            setOldHand(hand);
        };
    }, [hand]);

    const handleAbilityMouseDown = (event, id: string) => {
        if (hand.some((card: CombatAbility) => card.instanceId === id)) {
            setOldHand(hand);
            onAbilityClick(event, id);
        }
    };

    const isCardInHand = (card: CombatAbility, hand: CombatAbility[]): boolean => {
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
                    ref={refs[i]}
                    className={classNames({
                        [classes.slideIn]: !isCardInHand(ability, oldHand),
                        [classes.slideOut]: !isCardInHand(ability, hand),
                    })}
                />
            ))}
        </div>
    );
};

export default Hand;
