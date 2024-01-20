import { PLAYER_CLASSES } from "../../Menu/types";
import { Ability, HandAbility } from "../types";
import { ResourceIcon } from "./ResourceIcon";

const DrawCards = ({ ability, playerClass }: { ability: Ability | HandAbility; playerClass: PLAYER_CLASSES }) => {
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
                    It costs <ResourceIcon text={Math.abs(resourceCost)} size={"sm"} playerClass={playerClass} /> less until it is used or
                    discarded.
                </>
            )}
        </span>
    );
};

export default DrawCards;
