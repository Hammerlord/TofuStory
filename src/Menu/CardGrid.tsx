import { createUseStyles } from "react-jss";
import AbilityView from "../ability/AbilityView/AbilityView";
import { Ability, CombatAbility } from "../ability/types";
import classNames from "classnames";

const useStyles = createUseStyles({
    abilityContainer: {
        margin: "16px",
        marginTop: "32px",
        display: "inline-block",
        verticalAlign: "top",
    },
    selected: {
        filter: "drop-shadow(0 0 4px #45ff61) drop-shadow(0 0 4px #45ff61)",
    },
});

const CardGrid = ({
    cards,
    selectedAbilityIndex,
    highlightColour = "#45ff61",
    onClickAbility = () => {},
}: {
    cards: CombatAbility[];
    selectedAbilityIndex?: number;
    highlightColour?: string;
    onClickAbility?: (card: CombatAbility, index: number) => void;
}) => {
    const classes = useStyles();
    return (
        <div>
            {cards.map((card, i) => (
                <div
                    className={classNames(classes.abilityContainer, {
                        [classes.selected]: selectedAbilityIndex === i,
                    })}
                    key={card.instanceId}
                    onClick={() => onClickAbility(card, i)}
                >
                    <AbilityView ability={card} />
                </div>
            ))}
        </div>
    );
};

export default CardGrid;
