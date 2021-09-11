import { Fury } from "../../resource/ResourcesView";
import { Ability, HandAbility } from "../types";

const DrawCards = ({ ability }: { ability: Ability | HandAbility }) => {
    const drawCards = ability.actions.find((action) => action.drawCards)?.drawCards;
    if (!drawCards) {
        return null;
    }
    const { amount = 0, effects = {} } = drawCards;
    const { resourceCost = 0, damage = 0 } = effects;
    if (!amount) {
        return null;
    }

    return (
        <span>
            Draw {amount} card{amount > 1 ? "s" : ""}.{" "}
            {resourceCost < 0 && (
                <>
                    It costs <Fury text={Math.abs(resourceCost)} /> less until it is used or discarded.
                </>
            )}
        </span>
    );
};

export default DrawCards;
