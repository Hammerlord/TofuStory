import classNames from "classnames";
import { useState } from "react";
import { createUseStyles } from "react-jss";
import uuid from "uuid";
import AbilityView from "../ability/AbilityView/AbilityView";
import { Ability, AbilityUpgrade, HandAbility } from "../ability/types";
import Button from "../view/Button";
import { cloneDeep } from "lodash";

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
        filter: "drop-shadow(0 0 4px #45ff61) drop-shadow(0 0 4px #45ff61)",
        WebkitFilter: "drop-shadow(0 0 4px #45ff61) drop-shadow(0 0 4px #45ff61)",
    },
    divider: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        fontSize: "40px",
        margin: "auto 8px",
    },
});

const getCardFromUpgrade = (card: Ability) => {
    if (!card.upgrades) {
        return;
    }

    const newCard = {
        ...cloneDeep(card),
        level: (card.level || 1) + 1,
        instanceId: uuid.v4(),
        upgrades: [],
    };

    const traverseAndApplyUpgradeStats = (upgradeObj: any, equivalentObj: any) => {
        if (!upgradeObj || !equivalentObj) {
            return;
        }

        Object.entries(upgradeObj).forEach(([key, val]) => {
            if (typeof equivalentObj[key] === "undefined") {
                equivalentObj[key] = val;
                return;
            }

            if (typeof val === "number") {
                equivalentObj[key] = (equivalentObj[key] || 0) + val;
                return;
            }

            if (Array.isArray(val)) {
                val.forEach((v, i) => {
                    traverseAndApplyUpgradeStats(v, equivalentObj[key][i]);
                });
                return;
            }

            if (typeof val === "object") {
                traverseAndApplyUpgradeStats(val, equivalentObj[key]);
                return;
            }

            equivalentObj[key] = val;
        });
    };

    traverseAndApplyUpgradeStats(card.upgrades[0], newCard);

    return newCard;
};

const UpgradeTile = ({ card, onClick, isSelected }: { card: HandAbility; onClick; isSelected: boolean }) => {
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
                <AbilityView ability={getCardFromUpgrade(card)} />
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
    cards: HandAbility[];
    highlightColour?: string;
    onCancel?: () => void;
    onConfirm?: (updatedDeck: HandAbility[]) => void;
}) => {
    const [selectedAbilityIndex, setSelectedAbilityIndex] = useState(null);
    const classes = useGridStyles();

    return (
        <div className={classes.root}>
            <div className={classes.inner}>
                <h3>Select an ability to upgrade</h3>

                <div className={classes.abilitySection}>
                    {cards.map((card: HandAbility, i) => (
                        <UpgradeTile
                            card={card}
                            onClick={() => setSelectedAbilityIndex(i)}
                            key={card.instanceId}
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

                                    const upgrade = getCardFromUpgrade(cards[selectedAbilityIndex]);
                                    const updatedCards = [...cards.filter((_, i) => i !== selectedAbilityIndex), upgrade];
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
