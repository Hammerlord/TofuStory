import { useState } from "react";
import Overlay from "../view/Overlay";
import Button from "../view/Button";
import { Item, RARITIES } from "../item/types";
import { createUseStyles } from "react-jss";
import { COMMON_STYLES, NUM_CARD_CHOICES } from "../constants";
import { rollRarity } from "../item/utils";
import { JOB_CARD_MAP } from "../ability";
import { NEUTRAL_ABILITIES } from "../ability/neutralAbilities";
import { shuffle } from "../utils";
import { Ability, CombatAbility } from "../ability/types";
import RarityTag from "../ability/AbilityView/RarityTag";
import uuid from "uuid";
import classNames from "classnames";
import AbilityView from "../ability/AbilityView/AbilityView";
import CardGrid from "../Menu/CardGrid";
import DeckViewer from "../Menu/DeckViewer";
import { Player } from "../character/types";

const HEADER_BAR = 72;

const useStyles = createUseStyles({
    ...COMMON_STYLES,
    transmutationRoot: {
        color: "white",
        position: "fixed",
        left: 0,
        right: 0,
        top: 0,
        paddingTop: HEADER_BAR,
        bottom: 0,
        maxHeight: `calc(100% - ${HEADER_BAR}px)`,
        background: "rgba(30, 30, 30, 0.99)",
        textAlign: "center",
    },
    transmutesRemainingLabel: {
        margin: "9px 16px",
        display: "inline-block",
        verticalAlign: "bottom",
    },
    abilitySectionContainer: {
        verticalAlign: "top",
    },
    abilityContainer: {
        display: "inline-block",
        margin: "0 24px",
        verticalAlign: "bottom",
    },
    ability: {
        "&.selected": {
            filter: "drop-shadow(0 0 4px #45ff61) drop-shadow(0 0 4px #45ff61)",
        },
    },
    selectContainer: {
        margin: "48px 0",
    },
    transmuteContainer: {
        margin: "24px 0",
    },
    transmuteContainerInner: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    cardPlaceholder: {
        width: 168,
        height: 262,
        border: "1px solid rgba(255, 255, 255, 0.5)",
        borderRadius: 4,
        display: "inline-block",
        background: "none",
        padding: 24,
        color: "white",
        fontSize: 16,
        transition: "0.25s",
        "&:hover&:not(:disabled)": {
            filter: "drop-shadow(0 0 4px #45ff61)",
        },
    },
    divider: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        fontSize: "40px",
        margin: "auto 8px",
    },
    rarityPreview: {
        display: "inline-block",
        width: 168,
    },
    deckSection: {
        marginTop: 48,
    },
    plus: {
        fontWeight: "bold",
        fontSize: 32,
    },
    doneContainer: {
        position: "absolute",
        right: "32px",
        paddingTop: "32px",
    },
    titleContainer: {
        display: "inline-block",
        background:
            "linear-gradient(90deg, rgba(0,212,255,0) 0%, rgba(0,0,0,0.75) 30%, rgba(0,0,0,0.75) 50%, rgba(0,0,0,0.75) 70%, rgba(0,212,255,0) 100%)",
        padding: "0 96px",
        margin: 8,
        color: "white",
        marginBottom: "24px",
        minWidth: 400,
    },
});

const Transmutation = ({ deck, onTransmute, player, onExit }: { deck: CombatAbility[]; onTransmute; player: Player; onExit? }) => {
    const [selectedCard, setSelectedCard] = useState(null);
    const selectedCardRarity = selectedCard ? selectedCard.rarity || RARITIES.COMMON : undefined;
    const [numTransmutesRemaining, setNumTransmutesRemaining] = useState(2);

    const [transmutationOptions, setTransmutationOptions] = useState(null);
    const [selectedOptionIndex, setSelectedOptionIndex] = useState(null);
    const [showDeck, setShowingDeck] = useState(false);

    const classes = useStyles();

    const handleTransmute = () => {
        const { starters, all } = JOB_CARD_MAP[player.class];
        const potentialAbilities = [...all.filter((card) => starters.every(({ name }) => name !== card.name))].concat(NEUTRAL_ABILITIES);

        const choices = [];
        const numChoices = NUM_CARD_CHOICES + player.items.reduce((acc, item: Item) => item.abilityChoices || 0 + acc, 0);

        Array.from({ length: numChoices }).forEach(() => {
            let rarity;
            if (selectedCardRarity === RARITIES.RARE) {
                rarity = RARITIES.RARE;
            } else if (selectedCardRarity === RARITIES.UNCOMMON) {
                rarity = rollRarity({ player, disableRarities: [RARITIES.COMMON] });
            } else {
                rarity = rollRarity({ player, disableRarities: [RARITIES.RARE] });
            }

            const [filteredByRarity] = shuffle(potentialAbilities).filter((ability: Ability) => {
                const noDuplicate = choices.every((choice) => choice.name !== ability.name);
                return (ability.rarity || RARITIES.COMMON) === rarity && noDuplicate;
            });
            if (filteredByRarity) {
                choices.push(filteredByRarity);
            }
        });

        setTransmutationOptions(choices.map((ability) => ({ ...ability, instanceId: uuid.v4() })));
        setNumTransmutesRemaining((prev) => prev - 1);
    };

    const rarityStepChart = {
        [RARITIES.COMMON]: RARITIES.UNCOMMON,
        [RARITIES.UNCOMMON]: RARITIES.RARE,
        [RARITIES.RARE]: RARITIES.RARE,
    };

    const handleCardClick = (cardIndex: number) => {
        setSelectedOptionIndex(cardIndex);
    };

    const handleSelectClick = () => {
        onTransmute({ card: selectedCard.instanceId, for: transmutationOptions[selectedOptionIndex] });
        setSelectedCard(null);
        setTransmutationOptions(null);
        setSelectedOptionIndex(null);
    };

    const handleClickSelectCardButton = () => {
        setShowingDeck(true);
    };

    const handleClickExit = () => {
        setSelectedCard(null);
        setTransmutationOptions(null);
        setSelectedOptionIndex(null);
        onExit && onExit();
    };

    return (
        <Overlay>
            <div className={classes.transmutationRoot}>
                <div className={classes.titleContainer}>
                    <h2>Transmute an Ability</h2>
                </div>
                {!transmutationOptions && (
                    <>
                        <p>Replace a card with 1 of 3 card options.</p>

                        <div className={classes.doneContainer}>
                            <Button color="secondary" variant="contained" onClick={handleClickExit}>
                                Leave Shop
                            </Button>
                        </div>
                    </>
                )}
                <div>
                    <div className={classes.transmuteContainer}>
                        {!transmutationOptions && (
                            <div className={classes.transmuteContainerInner}>
                                {!selectedCard && (
                                    <button
                                        className={classes.cardPlaceholder}
                                        onClick={handleClickSelectCardButton}
                                        disabled={!numTransmutesRemaining}
                                    >
                                        <span className={classes.plus}>+</span>
                                        <br />
                                        <span>Select Card</span>
                                    </button>
                                )}
                                {selectedCard && <AbilityView ability={selectedCard} onClick={handleClickSelectCardButton} />}
                                <div className={classes.divider}>
                                    <span>›</span>
                                </div>
                                <div className={classes.rarityPreview}>
                                    {selectedCard && (
                                        <>
                                            <div>
                                                <RarityTag rarity={selectedCardRarity} />
                                            </div>
                                            <div>
                                                {selectedCardRarity !== RARITIES.RARE && (
                                                    <RarityTag rarity={rarityStepChart[selectedCardRarity]} />
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {transmutationOptions && (
                            <>
                                <h4>Results (Pick One)</h4>
                                <div className={classes.transmuteContainerInner}>
                                    <div className={classes.abilitySectionContainer}>
                                        {transmutationOptions.map((ability: CombatAbility, i) => (
                                            <div className={classes.abilityContainer} key={ability.instanceId}>
                                                <RarityTag rarity={ability.rarity} />
                                                <div
                                                    className={classNames(classes.ability, {
                                                        selected: selectedOptionIndex === i,
                                                    })}
                                                    onClick={() => handleCardClick(i)}
                                                >
                                                    <AbilityView ability={ability} disableGlow={true} disableBattleBonuses={true} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className={classes.selectContainer}>
                                    <Button color="primary" disabled={selectedOptionIndex === null} onClick={handleSelectClick}>
                                        Confirm
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>

                    {!transmutationOptions && (
                        <>
                            <div className={classes.transmutesRemainingLabel}>Transmutations remaining: {numTransmutesRemaining}</div>

                            <span
                                className={classNames({
                                    [classes.highlightAnimation]: selectedCard && numTransmutesRemaining,
                                })}
                            >
                                <Button disabled={!selectedCard || !numTransmutesRemaining} onClick={handleTransmute} color="primary">
                                    Transmute
                                </Button>
                            </span>
                        </>
                    )}
                </div>
                {showDeck && (
                    <DeckViewer
                        deck={deck}
                        onClose={() => setShowingDeck(false)}
                        onClickAbility={(card) => {
                            setSelectedCard(card);
                            setShowingDeck(false);
                        }}
                    />
                )}
            </div>
        </Overlay>
    );
};

export default Transmutation;
