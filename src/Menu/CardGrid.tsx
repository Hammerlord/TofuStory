import { createUseStyles } from "react-jss";
import AbilityView from "../ability/AbilityView/AbilityView";

const useStyles = createUseStyles({
    abilityContainer: {
        margin: "16px",
        marginTop: "32px",
        display: "inline-block",
    },
});

const CardGrid = ({ deck, selectedAbilityIndex, highlightColour = "#45ff61", onClickAbility }) => {
    const classes = useStyles();
    return (
        <div>
            {deck.map((card, i) => (
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
