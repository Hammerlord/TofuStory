import { PLAYER_CLASSES } from "../../Menu/types";
import { Ability, CombatAbility, SELECT_CARD_TYPES, SelectCards } from "../types";

const SelectCards = ({ ability }: { ability: Ability | CombatAbility }) => {
    const selectCards: SelectCards = ability.selectCards;
    if (!selectCards) {
        return null;
    }
    const { type } = selectCards || {};

    return <span>{type === SELECT_CARD_TYPES.DEPLETE_FROM_HAND && "Deplete a card."}</span>;
};

export default SelectCards;
