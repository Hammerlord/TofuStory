import { createUseStyles } from "react-jss";
import AbilityView from "../ability/AbilityView/AbilityView";
import { Ability } from "../ability/types";

const useStyles = createUseStyles({
    abilityContainer: {
        margin: "16px",
        marginTop: "32px",
        display: "inline-block",
        verticalAlign: "top",
    },
});

const CardGrid = ({
    cards,
    selectedAbilityIndex,
    highlightColour = "#45ff61",
    onClickAbility,
}: {
    cards: Ability[];
    selectedAbilityIndex?: number;
    highlightColour?: string;
    onClickAbility?: any;
}) => {
    const classes = useStyles();
    return (
        <div>
            {cards.map((card, i) => (
                <div
                    className={classes.abilityContainer}
                    key={i}
                    onClick={() => onClickAbility(card, i)}
                    style={{
                        boxShadow: selectedAbilityIndex === i ? `0 0 8px 4px ${highlightColour}` : "",
                    }}
                >
                    <AbilityView ability={card} />
                </div>
            ))}
        </div>
    );
};

export default CardGrid;
