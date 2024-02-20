import classNames from "classnames";
import { useState } from "react";
import { createUseStyles } from "react-jss";
import AbilityView from "../ability/AbilityView/AbilityView";
import { Ability, HandAbility } from "../ability/types";
import { XIcon } from "../images/icons";
import Button from "../view/Button";

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
    ability: {
        margin: "16px",
        marginTop: "32px",
        display: "inline-block",
        verticalAlign: "top",
        position: "relative",
        "&.selectedForRemoval": {
            filter: "drop-shadow(0 0 4px #ff3a3a) drop-shadow(0 0 4px #ff3a3a)",
        },
    },
    x: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translateX(-50%) translateY(-50%)",
        width: 125,
        zIndex: 10,
        filter: "drop-shadow(1px 1px 2px rgba(0, 0, 0, 1)) drop-shadow(1px 1px 2px rgba(0, 0, 0, 1))",
        opacity: 0.75,
    },
});

const CardRemovalGrid = ({
    cards,
    onRemoveAbility,
    onCancel,
}: {
    cards: Ability[];
    onRemoveAbility: (updatedDeck: Ability[]) => void;
    onCancel?: () => void;
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
                    {cards.map((card: HandAbility, i: number) => (
                        <div
                            className={classNames(classes.ability, {
                                selectedForRemoval: i === selectedAbilityIndexToRemove,
                            })}
                            key={card.instanceId}
                            onClick={() => setSelectedAbilityIndexToRemove(i)}
                        >
                            <AbilityView ability={card} />
                            {i === selectedAbilityIndexToRemove && (
                                <div className={classes.x}>
                                    <XIcon />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <Button
                    variant={"contained"}
                    color={"warning"}
                    onClick={handleRemoveAbility}
                    disabled={!cards[selectedAbilityIndexToRemove]}
                >
                    Remove Selection
                </Button>{" "}
                {onCancel && (
                    <Button variant={"contained"} onClick={onCancel}>
                        Cancel
                    </Button>
                )}
            </div>
        </div>
    );
};

export default CardRemovalGrid;
