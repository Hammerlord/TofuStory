import { useEffect, useState } from "react";
import AbilityView from "../ability/AbilityView/AbilityView";
import { Ability } from "../ability/types";

const Hand = ({ hand, onAbilityClick, isAbilitySelected, className, player, refs }) => {
    const [oldHand, setOldHand] = useState([]);
    const [isPlayingAnimation, setIsPlayingAnimation] = useState(false);

    useEffect(() => {
        if (hand.length > 0 && oldHand.length === 0) {
            // Just a rudimentary card draw "animation" for now

            let currentHand = [];
            const addCard = (newHand) => {
                currentHand = [...currentHand, newHand.shift()];
                setOldHand(currentHand);
                if (newHand.length) {
                    setTimeout(() => {
                        addCard(newHand);
                    }, 200);
                } else {
                    setIsPlayingAnimation(false);
                }
            };

            setIsPlayingAnimation(true);
            addCard(hand.slice());
        } else {
            setOldHand(hand);
        }
    }, [hand]);

    const handleAbilityClick = (event, i: number) => {
        if (!isPlayingAnimation) {
            onAbilityClick(event, i);
        }
    };

    return (
        <div className={className}>
            {oldHand.map((ability: Ability, i: number) => (
                <AbilityView
                    onClick={(e) => handleAbilityClick(e, i)}
                    isSelected={isAbilitySelected(i)}
                    key={i}
                    ability={ability}
                    player={player}
                    ref={refs[i]}
                />
            ))}
        </div>
    );
};

export default Hand;
