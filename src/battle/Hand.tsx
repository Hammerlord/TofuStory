import classNames from "classnames";
import { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
import AbilityView from "../ability/AbilityView/AbilityView";
import { HandAbility } from "../ability/types";
import { CombatantInfo } from "./types";

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
        animationDuration: 350,
        animationIterationCount: 1,
    },
    "@keyframes slideOut": {
        from: {
            transform: "translate(0, 0)",
            opacity: 1,
        },
        to: {
            transform: "translate(0, -50%)",
            opacity: 0,
        },
    },
    slideOut: {
        animation: "$slideOut",
        transitionTimingFunction: "ease-out",
        animationDuration: 350,
        animationIterationCount: 1,
    },
});

const Hand = ({
    hand,
    onAbilityClick,
    selectedAbilityId,
    className,
    refs,
}: {
    hand: HandAbility[];
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
        }, 340);

        return () => {
            clearTimeout(timeout);
            setOldHand(hand);
        };
    }, [hand]);

    const handleAbilityClick = (event, id: string) => {
        if (hand.some((card: HandAbility) => card.instanceId === id)) {
            onAbilityClick(event, id);
        }
    };

    const isCardInHand = (card: HandAbility, hand: HandAbility[]): boolean => {
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

    return (
        <div className={className}>
            {handToDisplay.map((ability: HandAbility, i: number) => (
                <AbilityView
                    onClick={(e) => handleAbilityClick(e, ability.instanceId)}
                    isSelected={selectedAbilityId === ability.instanceId}
                    key={ability.instanceId}
                    ability={ability}
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
