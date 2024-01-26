import Button from "../view/Button";
import classNames from "classnames";
import { useState } from "react";
import { createUseStyles } from "react-jss";
import AbilityView from "../ability/AbilityView/AbilityView";
import { Ability } from "../ability/types";

const useStyles = createUseStyles({
    root: {
        display: "inline-flex",
        margin: "16px 32px",
    },
    abilityContainer: {
        display: "inline-block",
        verticalAlign: "top",
    },
    highlighted: {
        boxShadow: "0 0 8px 4px #45ff61",
    },
    divider: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        fontSize: "40px",
        margin: "auto 8px",
    },
});

const UpgradeTile = ({ card, onClick, isSelected }) => {
    const classes = useStyles();
    if (!card.upgrades?.length) {
        return null;
    }

    return (
        <div onClick={onClick} className={classes.root}>
            <div className={classNames(classes.abilityContainer)}>
                <AbilityView ability={card} />
            </div>
            <div className={classes.divider}>
                <span>›</span>
            </div>
            <div
                className={classNames(classes.abilityContainer, {
                    [classes.highlighted]: isSelected,
                })}
            >
                {card.upgrades.map((card, i) => (
                    <AbilityView ability={card} key={i} />
                ))}
            </div>
        </div>
    );
};

const useGridStyles = createUseStyles({
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

const CardUpgradeGrid = ({
    cards,
    onCancel,
    onConfirm,
}: {
    cards: Ability[];
    highlightColour?: string;
    onCancel?: () => void;
    onConfirm?: (updatedDeck: Ability[]) => void;
}) => {
    const [selectedAbilityIndex, setSelectedAbilityIndex] = useState(null);
    const classes = useGridStyles();

    return (
        <div className={classes.root}>
            <div className={classes.inner}>
                <h3>Select an ability to upgrade</h3>

                <div className={classes.abilitySection}>
                    {cards.map((card, i) => (
                        <UpgradeTile
                            card={card}
                            onClick={() => setSelectedAbilityIndex(i)}
                            key={i}
                            isSelected={i === selectedAbilityIndex}
                        />
                    ))}
                </div>
                <div>
                    {onConfirm && (
                        <>
                            <Button
                                variant={"contained"}
                                color={"primary"}
                                onClick={() => {
                                    if (!cards[selectedAbilityIndex]) {
                                        return;
                                    }

                                    const updatedCards = [
                                        ...cards.filter((_, i) => i !== selectedAbilityIndex),
                                        cards[selectedAbilityIndex].upgrades[0],
                                    ];
                                    onConfirm(updatedCards);
                                }}
                                disabled={!cards[selectedAbilityIndex]}
                            >
                                Select!
                            </Button>{" "}
                        </>
                    )}
                    {onCancel && (
                        <Button variant={"contained"} onClick={onCancel as any}>
                            Cancel
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CardUpgradeGrid;
