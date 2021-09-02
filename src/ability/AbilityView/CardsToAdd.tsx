import { createUseStyles } from "react-jss";
import { Ability } from "../types";

const useStyles = createUseStyles({
    cardIcon: {
        maxWidth: "16px",
    },
});

const CardsToAdd = ({ ability }) => {
    const cardsToAddCount = ability.actions.reduce((acc, { addCards = [] }) => {
        addCards.forEach((card) => {
            acc[card.name] = {
                count: (acc[card.name]?.count || 0) + 1,
                card,
            };
        });
        return acc;
    }, {});
    const classes = useStyles();

    if (!Object.keys(cardsToAddCount).length) {
        return null;
    }

    return (
        <div>
            Add{" "}
            {Object.entries(cardsToAddCount).map(([name, val]) => {
                const { count, card } = val as { count: number; card: Ability };
                return (
                    <span key={name}>
                        <img className={classes.cardIcon} src={card.image} /> {name} {count > 1 && <>x{count}</>}
                        <br />
                    </span>
                );
            })}
            to your hand
        </div>
    );
};

export default CardsToAdd;
