import { Checkbox } from "@mui/material";
import classNames from "classnames";
import { useState } from "react";
import { createUseStyles } from "react-jss";
import { JOB_CARD_MAP } from "../ability";
import AbilityView from "../ability/AbilityView/AbilityView";
import { DEFAULT_CARD_MAX_LEVEL, STARTER_CARD_MAX_LEVEL } from "../ability/AbilityView/constants";
import { isOffensiveAbility } from "../ability/AbilityView/utils";
import { CombatAbility } from "../ability/types";
import { findCombatantData } from "../battle/actions/combatantData";
import { CombatantInfo, NonCombatPlayerInfo } from "../battle/types";
import { HEADER_BAR } from "../constants";
import { useAppSelector } from "../hooks";
import { Item } from "../item/types";
import Button from "../view/Button";
import { PLAYER_CLASSES } from "./types";
import { getUpgradeCard } from "./utils";
import { getDamageStatistics } from "../ability/AbilityView/DamageIcon";
import { getArmorStatistics } from "../ability/AbilityView/ArmorIcon";
import CardSortControls, { useCardSort } from "./CardSortControls";
import { scrollableCardSection } from "./cardGridStyles";
import Overlay from "../view/Overlay";
import UpgradedCardsView from "../scene/UpgradedCards";
import {
    confirmButtonDropStyle,
    panelKeyframes,
    slideFadeInStyle,
    slideFadeOutStyle,
    useCardStaggerAnimation,
    usePanelTransition,
} from "./panelAnimation";
import FadeIn from "../view/FadeIn";
import Icon from "../icon/Icon";
import { GoldenHammerImage } from "../images";

const FADE_OUT_MS = 400;

// "x" means to expend the remainder of your resources; treat it as the maximum possible cost when comparing
const toResourceCost = (cost?: number | "x") =>
    typeof cost === "number" ? cost : Number.MAX_SAFE_INTEGER;

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
    onClick: () => void;
    isSelected: boolean;
}) => {
    const classes = useStyles();
    const character = useAppSelector((state) => state.character);
    const battle = useAppSelector((state) => state.battle);

    if (!upgrade) {
        return null;
    }

    let playerInfo: NonCombatPlayerInfo | CombatantInfo | undefined;
    if (!battle) {
        if (character.player) {
            playerInfo = { combatant: character.player };
        }
    } else {
        playerInfo = findCombatantData(battle, character.player?.id);
    }

    const baseDmgStats = playerInfo
        ? getDamageStatistics({ ability: card, actorInfo: playerInfo })
        : undefined;
    const upgradedDmgStats = playerInfo
        ? getDamageStatistics({ ability: upgrade, actorInfo: playerInfo })
        : undefined;

    const baseArmorStats = getArmorStatistics({ ability: card });
    const upgradedArmorStats = getArmorStatistics({ ability: upgrade });

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
                <AbilityView
                    ability={upgrade}
                    highlightDamage={
                        !!upgradedDmgStats &&
                        !!baseDmgStats &&
                        (upgradedDmgStats.baseDamage ?? 0) > (baseDmgStats.baseDamage ?? 0)
                    }
                    highlightArmor={upgradedArmorStats.base > baseArmorStats.base}
                    highlightResource={toResourceCost(upgrade.resourceCost) < toResourceCost(card.resourceCost)}
                />
            </div>
        </div>
    );
};

const useGridStyles = createUseStyles({
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
    tileContainer: {
        display: "inline-block",
        verticalAlign: "top",
    },
    confirmContainer: {
        minHeight: 38,
        marginBottom: 16,
        ...confirmButtonDropStyle,
    },
    cardSection: {
        position: "relative",
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
    },
    toolbar: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "24px",
        marginBottom: "8px",
    },
    cancelContainer: {
        position: "absolute",
        top: 0,
        right: "1rem",
    },
    upgradedView: {
        textAlign: "center",
        margin: "auto",
        position: "absolute",
        top: "45%",
        left: "50%",
        transform: "translate(-50%, -50%)",
    },
    fadeWrapper: {
        width: "100%",
        height: "100%",
        opacity: 1,
        transition: `opacity ${FADE_OUT_MS}ms ease-in`,
        "&.fadingOut": {
            opacity: 0,
        },
    },
});

const CardUpgradeGrid = ({
    cards = [],
    onCancel,
    onConfirm,
    playerClass,
    playerItems = [],
    disablePortal = false,
}: {
    cards: CombatAbility[];
    highlightColour?: string;
    onCancel?: () => void;
    onConfirm?: (updatedDeck: CombatAbility[]) => void;
    playerClass: PLAYER_CLASSES;
    playerItems?: Item[];
    disablePortal?: boolean;
}) => {
    const [selectedAbilityId, setSelectedAbilityId] = useState<string | null>(null);
    const [isHideDuplicates, setIsHideDuplicates] = useState(true);
    const [isFadingUpgradeView, setIsFadingUpgradeView] = useState(false);
    const [upgradedCard, setUpgradedCard] = useState<{
        original: CombatAbility;
        upgraded: CombatAbility;
        updatedDeck: CombatAbility[];
    } | null>(null);

    const classes = useGridStyles();
    const { isClosing, close, closeDuration } = usePanelTransition();
    const { setCardRef, animateCardsOut } = useCardStaggerAnimation();

    const handleClose = (onFinished?: () => void) => {
        close(onFinished, animateCardsOut());
    };

    const handleUpgradedCardsComplete = (updatedDeck: CombatAbility[]) => {
        setUpgradedCard(null);
        onConfirm?.(updatedDeck);
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
    const upgrade = (card: CombatAbility) => {
        const isStarter = JOB_CARD_MAP[playerClass]?.starters.some(
            ({ name }) => name === card.name,
        );
        let maxUpgradeLevel;
        if (isStarter) {
            maxUpgradeLevel = STARTER_CARD_MAX_LEVEL;
        } else {
            const upgradeLevelBonus =
                playerItems.reduce((acc, item: Item) => {
                    const { maxUpgradeLevel = 0, filters } = item.upgradeScreen || {};

                    if (
                        maxUpgradeLevel &&
                        (!filters ||
                            filters.some(
                                (filter) => Boolean(filter.isOffense) === isOffensiveAbility(card),
                            ))
                    ) {
                        return acc + maxUpgradeLevel;
                    }
                    return acc;
                }, 0) || 0;
            maxUpgradeLevel = DEFAULT_CARD_MAX_LEVEL + upgradeLevelBonus;
        }
        return getUpgradeCard(card, { maxLevel: maxUpgradeLevel });
    };

    const handleClickConfirmUpgrade = () => {
        const cardToUpgrade = cards.find(({ instanceId }) => instanceId === selectedAbilityId);
        if (!cardToUpgrade) {
            return;
        }

        const upgradedCard = upgrade(cardToUpgrade);
        if (!upgradedCard) {
            return;
        }

        const updatedCards = [
            ...cards.filter((card) => card.instanceId !== selectedAbilityId),
            upgradedCard,
        ];
        setSelectedAbilityId(null);
        setIsFadingUpgradeView(false);
        setUpgradedCard({
            original: cardToUpgrade,
            upgraded: upgradedCard,
            updatedDeck: updatedCards,
        });
    };

    return (
        <div
            className={classNames(classes.root, { panelClosing: isClosing })}
            style={{ animationDuration: isClosing ? `${closeDuration}ms` : undefined }}
        >
            <div className={disablePortal ? undefined : classes.inner}>
                <h3>Upgrade an Ability</h3>
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
                    <div className={disablePortal ? undefined : classes.abilitySection}>
                        {sortedCards.map((card: CombatAbility, index: number) => (
                            <div
                                className={classes.tileContainer}
                                key={card.instanceId}
                                ref={setCardRef(index)}
                            >
                                <UpgradeTile
                                    card={card}
                                    upgrade={upgrade(card)}
                                    onClick={() => setSelectedAbilityId(card.instanceId)}
                                    isSelected={selectedAbilityId === card.instanceId}
                                />
                                <div
                                    className={classes.confirmContainer}
                                    key={
                                        selectedAbilityId === card.instanceId
                                            ? "show"
                                            : "hide"
                                    }
                                >
                                    {selectedAbilityId === card.instanceId && (
                                        <Button
                                            variant={"contained"}
                                            color={"primary"}
                                            onClick={handleClickConfirmUpgrade}
                                            disabled={!selectedAbilityId}
                                        >
                                            <Icon
                                                size="sm"
                                                icon={GoldenHammerImage}
                                                sx={{ mr: 1 }}
                                            />{" "}
                                            Upgrade
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className={classes.cancelContainer}>
                        {onCancel && (
                            <Button
                                variant={"contained"}
                                onClick={() => {
                                    handleClose(onCancel);
                                }}
                            >
                                Cancel
                            </Button>
                        )}
                    </div>
                </div>
            </div>
            {upgradedCard && (
                <div
                    className={classNames(classes.fadeWrapper, {
                        fadingOut: isFadingUpgradeView,
                    })}
                >
                    <FadeIn>
                        <Overlay>
                            <div className={classes.upgradedView}>
                                <UpgradedCardsView
                                    original={[upgradedCard.original]}
                                    upgraded={[upgradedCard.upgraded]}
                                    onExit={() =>
                                        handleUpgradedCardsComplete(upgradedCard.updatedDeck)
                                    }
                                    onFadeOutStart={() => setIsFadingUpgradeView(true)}
                                    showContinueButton={false}
                                />
                            </div>
                        </Overlay>
                    </FadeIn>
                </div>
            )}
        </div>
    );
};

export default CardUpgradeGrid;
