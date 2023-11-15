import { useState } from "react";
import { createUseStyles } from "react-jss";
import { JOB_CARD_MAP } from "../ability";
import { Ability } from "../ability/types";
import Button from "../view/Button";
import CardGrid from "./CardGrid";

const useStyles = createUseStyles({
    root: {
        width: "100%",
        height: "100%",
        background: "rgba(25, 25, 25, 0.9)",
        color: "white",
    },
    inner: {
        textAlign: "center",
        margin: "auto",
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        fontSize: "1.2rem",
    },
    abilitySection: {
        width: "80vw",
        height: "70vh",
        overflow: "auto",
    },
});

const CardRemovalGrid = ({
    cards,
    onRemoveAbility,
    onCancel,
}: {
    cards: Ability[];
    onRemoveAbility: (updatedDeck: Ability[]) => void;
    onCancel: () => void;
}) => {
    const classes = useStyles();
    const [selectedAbilityIndexToRemove, setSelectedAbilityIndexToRemove] = useState(null);

    const handleRemoveAbility = () => {
        if (selectedAbilityIndexToRemove === null) {
            return;
        }

        const updatedDeck = cards.slice();
        updatedDeck.splice(selectedAbilityIndexToRemove, 1);
        onRemoveAbility(updatedDeck);
    };

    return (
        <div className={classes.root}>
            <div className={classes.inner}>
                <h3>Select an ability to remove</h3>
                <div>Keep your skills focused by removing an ability from your deck. This action is permanent.</div>
                <div className={classes.abilitySection}>
                    <CardGrid
                        cards={cards}
                        selectedAbilityIndex={selectedAbilityIndexToRemove}
                        highlightColour={"#45ff61"}
                        onClickAbility={(_, i: number) => setSelectedAbilityIndexToRemove(i)}
                    />
                </div>
                <Button variant={"contained"} color={"secondary"} onClick={handleRemoveAbility}>
                    Remove Selection
                </Button>{" "}
                <Button variant={"contained"} onClick={onCancel}>
                    Cancel
                </Button>
            </div>
        </div>
    );
};

export default CardRemovalGrid;
