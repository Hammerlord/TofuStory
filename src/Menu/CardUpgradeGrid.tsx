import classNames from "classnames";
import { useState } from "react";
import { createUseStyles } from "react-jss";
import * as uuid from "uuid";
import AbilityView from "../ability/AbilityView/AbilityView";
import { Ability, AbilityUpgrade, CombatAbility } from "../ability/types";
import Button from "../view/Button";
import { cloneDeep } from "lodash";
import { getUpgradeCard } from "./utils";
import { Checkbox } from "@material-ui/core";
import { useAppSelector } from "../hooks";
import { Item } from "../item/types";
import { DEFAULT_CARD_MAX_LEVEL, STARTER_CARD_MAX_LEVEL } from "../ability/AbilityView/constants";
import { JOB_CARD_MAP } from "../ability";
import { isOffensiveAbility } from "../ability/AbilityView/utils";

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

const UpgradeTile = ({
    card,
    upgrade,
    onClick,
    isSelected,
}: {
    card: CombatAbility;
    upgrade?: CombatAbility;
    onClick;
    isSelected: boolean;
}) => {
    const classes = useStyles();

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
    confirmContainer: {
        minHeight: 38,
        marginBottom: 16,
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
    const state = useAppSelector((state) => state);
    const { character } = state;
    const { player } = character || {};
    const classes = useGridStyles();

    const uniqueCardsMap = cards?.reduce((acc, card: CombatAbility) => {
        acc[`${card.name}-${card.level || 1}`] = card;
        return acc;
    }, {});

    const cardsList = isHideDuplicates ? Object.values(uniqueCardsMap) : cards;
    const upgrade = (card: CombatAbility) => {
        const isStarter = JOB_CARD_MAP[player?.class]?.starters.some(({ name }) => name === card.name);
        let maxUpgradeLevel;
        if (isStarter) {
            maxUpgradeLevel = STARTER_CARD_MAX_LEVEL;
        } else {
            const upgradeLevelBonus =
                player?.items?.reduce((acc, item: Item) => {
                    const { maxUpgradeLevel = 0, filters } = item.upgradeScreen || {};

                    if (maxUpgradeLevel && (!filters || filters.some((filter) => Boolean(filter.isOffense) === isOffensiveAbility(card)))) {
                        return acc + maxUpgradeLevel;
                    }
                    return acc;
                }, 0) || 0;
            maxUpgradeLevel = DEFAULT_CARD_MAX_LEVEL + upgradeLevelBonus;
        }
        return getUpgradeCard(card, { maxLevel: maxUpgradeLevel });
    };

    return (
        <div className={classes.root}>
            <div className={classes.inner}>
                <h3>Upgrade an Ability</h3>
                <label>
                    <Checkbox checked={isHideDuplicates} onChange={() => setIsHideDuplicates((prev) => !prev)} /> Hide duplicates
                </label>
                <div className={classes.abilitySection}>
                    {cardsList.map((card: CombatAbility) => (
                        <div className={classes.tileContainer} key={card.instanceId}>
                            <UpgradeTile
                                card={card}
                                upgrade={upgrade(card)}
                                onClick={() => setSelectedAbilityId(card.instanceId)}
                                isSelected={selectedAbilityId === card.instanceId}
                            />
                            <div className={classes.confirmContainer}>
                                {selectedAbilityId === card.instanceId && (
                                    <Button
                                        variant={"contained"}
                                        color={"primary"}
                                        onClick={() => {
                                            const cardToUpgrade = cards.find(({ instanceId }) => instanceId === selectedAbilityId);
                                            if (!cardToUpgrade) {
                                                return;
                                            }

                                            const updatedCards = [
                                                ...cards.filter((card) => card.instanceId !== selectedAbilityId),
                                                upgrade(cardToUpgrade),
                                            ];
                                            setSelectedAbilityId(null);
                                            onConfirm && onConfirm(updatedCards);
                                        }}
                                        disabled={!selectedAbilityId}
                                    >
                                        Confirm
                                    </Button>
                                )}
                            </div>
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
