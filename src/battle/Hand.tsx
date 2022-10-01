import { useEffect, useState } from "react";
import AbilityView from "../ability/AbilityView/AbilityView";
import { HandAbility } from "../ability/types";

const Hand = ({ hand, onAbilityClick, selectedAbilityId, className, player, refs }) => {
    const [oldHand, setOldHand] = useState([]);
    const [isPlayingAnimation, setIsPlayingAnimation] = useState(false);

    useEffect(() => {
        let timeout;
        if (hand.length > 0 && oldHand.length === 0) {
            // Just a rudimentary card draw "animation" for now

            let currentHand = [];
            const addCard = (newHand) => {
                currentHand = [...currentHand, newHand.shift()];
                setOldHand(currentHand);
                if (newHand.length) {
                    timeout = setTimeout(() => {
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

        return () => {
            clearTimeout(timeout);
            setOldHand(hand);
        };
    }, [hand]);

    const handleAbilityClick = (event, id: string) => {
        if (!isPlayingAnimation) {
            onAbilityClick(event, id);
        }
    };

    return (
        <div className={className}>
            {oldHand.map((ability: HandAbility, i: number) => (
                <AbilityView
                    onClick={(e) => handleAbilityClick(e, ability.instanceId)}
                    isSelected={selectedAbilityId === ability.instanceId}
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
