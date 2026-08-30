import { RefObject, useEffect, useState } from "react";
import { EventGroup } from "../../battle/types";
import { playFadeInAnimation } from "../animations";

export const useEntranceAnimation = ({
    currentEventGroup,
    combatantId,
    characterRef,
}: {
    currentEventGroup?: EventGroup;
    combatantId?: string;
    characterRef: RefObject<HTMLDivElement>;
}) => {
    const [newCombatantIds, setNewCombatantIds] = useState<string[]>([]);

    useEffect(() => {
        const shouldPlayAnimation = combatantId && newCombatantIds.some((id) => id === combatantId);
        if (shouldPlayAnimation) {
            const object = characterRef.current;
            if (object) {
                const animation = playFadeInAnimation({
                    object,
                    shiftUp: true,
                });

                animation.onfinish = () => {
                    setNewCombatantIds([]);
                };
            }
        }
    }, [newCombatantIds, combatantId]);

    useEffect(() => {
        const newCombatants = currentEventGroup?.newCombatants || [];
        if (newCombatants.length) {
            setNewCombatantIds(newCombatants.map((c) => c.id));
        }
    }, [currentEventGroup?.id]);
};
