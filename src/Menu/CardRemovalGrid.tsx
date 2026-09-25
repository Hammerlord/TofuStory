import { Checkbox } from "@mui/material";
import classNames from "classnames";
import { useEffect, useRef, useState } from "react";
import { createUseStyles } from "react-jss";
import AbilityView from "../ability/AbilityView/AbilityView";
import { CombatAbility } from "../ability/types";
import { HEADER_BAR } from "../constants";
import { XIcon } from "../images/icons";
import Button from "../view/Button";
import CardSortControls, { useCardSort } from "./CardSortControls";
import { scrollableCardSection } from "./cardGridStyles";
import {
    confirmButtonDropStyle,
    panelKeyframes,
    REMOVING_CLASS,
    slideFadeInStyle,
    slideFadeOutStyle,
    useCardStaggerAnimation,
    usePanelTransition,
} from "./panelAnimation";

const REMOVAL_ANIMATION_MS = 300;

const useStyles = createUseStyles({
    ...panelKeyframes,
    root: {
        width: "100%",
        height: "100%",
        paddingTop: HEADER_BAR,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        background: "rgba(25, 25, 25, 0.9)",
        color: "white",
        position: "absolute",
        top: 0,
        ...slideFadeInStyle,
        "&.panelClosing": {
            ...slideFadeOutStyle,
        },
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
        [`&.${REMOVING_CLASS}`]: {
            opacity: 0,
            transition: `opacity ${REMOVAL_ANIMATION_MS}ms ease`,
        },
    },
    nonInteractive: {
        pointerEvents: "none",
    },
    confirmContainer: {
        minHeight: "38px",
        marginBottom: "16px",
        ...confirmButtonDropStyle,
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
    const { isClosing, close, closeDuration, reset: resetPanel } = usePanelTransition();
    const { setCardRef, animateCardsOut, playEntrances, fadeOutCard } = useCardStaggerAnimation();
    const [selectedAbilityId, setSelectedAbilityId] = useState<string | null>(null);
    const [isHideDuplicates, setIsHideDuplicates] = useState(false);
    const [removalInProgress, setRemovalInProgress] = useState<string | null>(null);
    const removalTimeoutRef = useRef<number | null>(null);

    useEffect(() => {
        return () => {
            if (removalTimeoutRef.current !== null) {
                window.clearTimeout(removalTimeoutRef.current);
            }
        };
    }, []);

    const handleClose = (onFinished?: () => void) => {
        close(onFinished, animateCardsOut());
    };

    const uniqueCardsMap = cards?.reduce<{ [key: string]: CombatAbility }>(
        (acc, card: CombatAbility) => {
            acc[`${card.name}-${card.level || 1}`] = card;
            return acc;
        },
        {},
    );

    const cardsList = isHideDuplicates ? Object.values(uniqueCardsMap) : cards;
    const { sortedCards, sortBy, setSortBy, sortDirection, toggleSortDirection } = useCardSort(
        cardsList as CombatAbility[],
    );
    const handleRemoveAbility = () => {
        if (removalInProgress || !selectedAbilityId) {
            return;
        }
        const updatedDeck = cards.filter(
            (card: CombatAbility) => card.instanceId !== selectedAbilityId,
        );
        setRemovalInProgress(selectedAbilityId);
        const removedIndex = sortedCards.findIndex(
            (card: CombatAbility) => card.instanceId === selectedAbilityId,
        );
        fadeOutCard(removedIndex, REMOVAL_ANIMATION_MS);
        removalTimeoutRef.current = window.setTimeout(() => {
            removalTimeoutRef.current = null;
            handleClose(() => {
                onRemoveAbility(updatedDeck);
                setSelectedAbilityId(null);
                setRemovalInProgress(null);
                resetPanel();
                playEntrances();
            });
        }, REMOVAL_ANIMATION_MS);
    };

    const handleCancel = () => {
        handleClose(onCancel);
    };

    return (
        <div
            className={classNames(classes.root, { panelClosing: isClosing })}
            style={{ animationDuration: isClosing ? `${closeDuration}ms` : undefined }}
        >
            <div className={classes.inner}>
                <h3>Remove An Ability</h3>
                <div>
                    Keep your skills focused by removing an ability from your deck. This action is
                    permanent.
                </div>
                <hr className={classes.divider} />
                <div className={classes.cardSection}>
                    <div
                        className={classNames(classes.toolbar, {
                            [classes.nonInteractive]: !!removalInProgress,
                        })}
                    >
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
                    <div
                        className={classNames(classes.abilitySection, {
                            [classes.nonInteractive]: !!removalInProgress,
                        })}
                    >
                        {sortedCards.map((card: CombatAbility, index: number) => (
                            <div
                                className={classNames(classes.tileContainer, {
                                    [REMOVING_CLASS]: card.instanceId === removalInProgress,
                                })}
                                key={card.instanceId}
                                ref={setCardRef(index)}
                            >
                                <div
                                    className={classNames(classes.ability, {
                                        selectedForRemoval: card.instanceId === selectedAbilityId,
                                    })}
                                    onClick={() => {
                                        if (removalInProgress) {
                                            return;
                                        }
                                        setSelectedAbilityId(card.instanceId);
                                    }}
                                >
                                    <AbilityView ability={card} />
                                    {card.instanceId === selectedAbilityId && (
                                        <div className={classes.x}>
                                            <XIcon />
                                        </div>
                                    )}
                                </div>
                                <div
                                    className={classes.confirmContainer}
                                    key={card.instanceId === selectedAbilityId ? "show" : "hide"}
                                >
                                    {card.instanceId === selectedAbilityId && (
                                        <Button
                                            variant={"contained"}
                                            color={"warning"}
                                            disabled={!!removalInProgress}
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
                            <Button variant={"contained"} onClick={handleCancel}>
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
