import { PLAYER_CLASSES } from "../../Menu/types";
import { ACTION_TYPES, Ability, HandAbility } from "../types";
import { ResourceIcon } from "./ResourceIcon";

const DrawCards = ({ ability, playerClass }: { ability: Ability | HandAbility; playerClass: PLAYER_CLASSES }) => {
    const drawCards = ability.actions.find((action) => action.drawCards)?.drawCards;
    if (!drawCards) {
        return null;
    }
    const { amount = 0, effects = {}, filters = [] } = drawCards;
    const { resourceCost = 0, damage = 0 } = effects;
    if (!amount) {
        return null;
    }

    const attackCards = filters.some((filter) => filter === ACTION_TYPES.ATTACK || filter === ACTION_TYPES.RANGE_ATTACK); // Attack and range attack are currently not differentiated

    return (
        <span>
            Draw {amount} {attackCards && "offense"} card{amount > 1 ? "s" : ""}.{" "}
            {resourceCost < 0 && (
                <>
                    Each costs <ResourceIcon text={Math.abs(resourceCost)} size={"sm"} playerClass={playerClass} /> less until it is used or
                    discarded.
                </>
            )}
        </span>
    );
};

export default DrawCards;
