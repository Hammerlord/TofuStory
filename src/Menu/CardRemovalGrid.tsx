import classNames from "classnames";
import { useState } from "react";
import { createUseStyles } from "react-jss";
import AbilityView from "../ability/AbilityView/AbilityView";
import { Ability, CombatAbility } from "../ability/types";
import { XIcon } from "../images/icons";
import Button from "../view/Button";
import { Checkbox } from "@material-ui/core";

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
    tileContainer: {
        display: "inline-block",
        verticalAlign: "top",
    },
    confirmContainer: {
        minHeight: 38,
        marginBottom: 16,
    },
    divider: {
        borderBottom: "1px solid rgba(255, 255, 255, 0.6)",
        marginTop: 16,
        maxWidth: 600,
    },
});

const CardRemovalGrid = ({
    cards,
    onRemoveAbility,
    onCancel,
}: {
    cards: CombatAbility[];
    onRemoveAbility: (updatedDeck: CombatAbility[]) => void;
    onCancel?: () => void;
}) => {
    const classes = useStyles();
    const [selectedAbilityId, setSelectedAbilityId] = useState(null);
    const [isHideDuplicates, setIsHideDuplicates] = useState(false);

    const uniqueCardsMap = cards?.reduce((acc, card: CombatAbility) => {
        acc[`${card.name}-${card.level || 1}`] = card;
        return acc;
    }, {});

    const cardsList = isHideDuplicates ? Object.values(uniqueCardsMap) : cards;
    const handleRemoveAbility = () => {
        if (selectedAbilityId) {
            onRemoveAbility(cards.filter((card: CombatAbility) => card.instanceId !== selectedAbilityId));
        }
    };

    return (
        <div className={classes.root}>
            <div className={classes.inner}>
                <h3>Remove An Ability</h3>
                <div>Keep your skills focused by removing an ability from your deck. This action is permanent.</div>
                <hr className={classes.divider} />
                <label>
                    <Checkbox checked={isHideDuplicates} onChange={() => setIsHideDuplicates((prev) => !prev)} /> Hide duplicates
                </label>
                <div className={classes.abilitySection}>
                    {cardsList.map((card: CombatAbility) => (
                        <div className={classes.tileContainer} key={card.instanceId}>
                            <div
                                className={classNames(classes.ability, {
                                    selectedForRemoval: card.instanceId === selectedAbilityId,
                                })}
                                onClick={() => setSelectedAbilityId(card.instanceId)}
                            >
                                <AbilityView ability={card} />
                                {card.instanceId === selectedAbilityId && (
                                    <div className={classes.x}>
                                        <XIcon />
                                    </div>
                                )}
                            </div>
                            <div className={classes.confirmContainer}>
                                {card.instanceId === selectedAbilityId && (
                                    <Button variant={"contained"} color={"warning"} onClick={handleRemoveAbility}>
                                        Remove Selection
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
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
