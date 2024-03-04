import classNames from "classnames";
import { useState } from "react";
import { createUseStyles } from "react-jss";
import uuid from "uuid";
import AbilityView from "../ability/AbilityView/AbilityView";
import { Ability, AbilityUpgrade, CombatAbility } from "../ability/types";
import Button from "../view/Button";
import { cloneDeep } from "lodash";
import { getUpgradeCard } from "./utils";
import { Checkbox } from "@material-ui/core";

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
    },
    divider: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        fontSize: "40px",
        margin: "auto 8px",
    },
});

const UpgradeTile = ({ card, onClick, isSelected }: { card: CombatAbility; onClick; isSelected: boolean }) => {
    const classes = useStyles();

    const upgrade = getUpgradeCard(card);
    if (!upgrade) {
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
                <AbilityView ability={upgrade} />
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
    tileContainer: {
        display: "inline-block",
        verticalAlign: "top",
    },
});

const CardUpgradeGrid = ({
    cards = [],
    onCancel,
    onConfirm,
}: {
    cards: CombatAbility[];
    highlightColour?: string;
    onCancel?: () => void;
    onConfirm?: (updatedDeck: CombatAbility[]) => void;
}) => {
    const [selectedAbilityId, setSelectedAbilityId] = useState(null);
    const [isHideDuplicates, setIsHideDuplicates] = useState(true);
    const classes = useGridStyles();

    /** There is no need to show more than one of a kind for a card */
    const uniqueCardsMap = cards?.reduce((acc, card: CombatAbility) => {
        acc[`${card.name}-${card.level || 1}`] = card;
        return acc;
    }, {});

    const cardsList = isHideDuplicates ? Object.values(uniqueCardsMap) : cards;

    return (
        <div className={classes.root}>
            <div className={classes.inner}>
                <h3>Select an ability to upgrade</h3>
                <label>
                    <Checkbox checked={isHideDuplicates} onChange={() => setIsHideDuplicates((prev) => !prev)} /> Hide Duplicate Cards
                </label>
                <div className={classes.abilitySection}>
                    {cardsList.map((card: CombatAbility) => (
                        <div className={classes.tileContainer}>
                            <UpgradeTile
                                card={card}
                                onClick={() => setSelectedAbilityId(card.instanceId)}
                                key={card.instanceId}
                                isSelected={selectedAbilityId === card.instanceId}
                            />
                            {selectedAbilityId === card.instanceId && (
                                <div>
                                    <Button
                                        variant={"contained"}
                                        color={"primary"}
                                        onClick={() => {
                                            const cardToUpgrade = cards.find(({ instanceId }) => instanceId === selectedAbilityId);
                                            if (!cardToUpgrade) {
                                                return;
                                            }

                                            const upgrade = getUpgradeCard(cardToUpgrade);
                                            const updatedCards = [
                                                ...cards.filter((card) => card.instanceId !== selectedAbilityId),
                                                upgrade,
                                            ];
                                            onConfirm && onConfirm(updatedCards);
                                        }}
                                        disabled={!selectedAbilityId}
                                    >
                                        Confirm
                                    </Button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <div>
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
