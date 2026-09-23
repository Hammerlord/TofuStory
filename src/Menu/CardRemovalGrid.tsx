import classNames from "classnames";
import { useState } from "react";
import { createUseStyles } from "react-jss";
import AbilityView from "../ability/AbilityView/AbilityView";
import { Ability, CombatAbility } from "../ability/types";
import { XIcon } from "../images/icons";
import Button from "../view/Button";
import { Checkbox } from "@mui/material";
import CardSortControls, { useCardSort } from "./CardSortControls";
import { scrollableCardSection } from "./cardGridStyles";

const HEADER_BAR = 72;

const useStyles = createUseStyles({
    root: {
        width: "100%",
        height: "100%",
        paddingTop: HEADER_BAR,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        background: "rgba(25, 25, 25, 0.9)",
        color: "white",
    },
    inner: {
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        textAlign: "center",
        fontSize: "1.2rem",
    },
    abilitySection: {
        ...scrollableCardSection,
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
        width: "125px",
        zIndex: 10,
        filter: "drop-shadow(1px 1px 2px rgba(0, 0, 0, 1)) drop-shadow(1px 1px 2px rgba(0, 0, 0, 1))",
        opacity: 0.75,
    },
    tileContainer: {
        display: "inline-block",
        verticalAlign: "top",
    },
    confirmContainer: {
        minHeight: "38px",
        marginBottom: "16px",
    },
    divider: {
        borderBottom: "1px solid rgba(255, 255, 255, 0.6)",
        marginTop: "16px",
        maxWidth: "600px",
    },
    toolbar: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "24px",
        margin: "16px 0 8px",
    },
    cardSection: {
        position: "relative",
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
    },
    cancelContainer: {
        position: "absolute",
        top: 0,
        right: "1rem",
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
    const { sortedCards, sortBy, setSortBy, sortDirection, toggleSortDirection } = useCardSort(
        cardsList as CombatAbility[],
    );
    const handleRemoveAbility = () => {
        if (selectedAbilityId) {
            onRemoveAbility(
                cards.filter((card: CombatAbility) => card.instanceId !== selectedAbilityId),
            );
        }
    };

    return (
        <div className={classes.root}>
            <div className={classes.inner}>
                <h3>Remove An Ability</h3>
                <div>
                    Keep your skills focused by removing an ability from your deck. This action is
                    permanent.
                </div>
                <hr className={classes.divider} />
                <div className={classes.cardSection}>
                    <div className={classes.toolbar}>
                        <CardSortControls
                            sortBy={sortBy}
                            onSortByChange={setSortBy}
                            sortDirection={sortDirection}
                            onSortDirectionChange={toggleSortDirection}
                        />
                        <label>
                            <Checkbox
                                checked={isHideDuplicates}
                                onChange={() => setIsHideDuplicates((prev) => !prev)}
                            />{" "}
                            Hide duplicates
                        </label>
                    </div>
                    <div className={classes.abilitySection}>
                        {sortedCards.map((card: CombatAbility) => (
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
                                        <Button
                                            variant={"contained"}
                                            color={"warning"}
                                            onClick={handleRemoveAbility}
                                        >
                                            Remove Selection
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className={classes.cancelContainer}>
                        {onCancel && (
                            <Button variant={"contained"} onClick={onCancel}>
                                Cancel
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CardRemovalGrid;
