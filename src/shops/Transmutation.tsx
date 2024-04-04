import classNames from "classnames";
import { useEffect, useRef, useState } from "react";
import { createUseStyles } from "react-jss";
import uuid from "uuid";
import DeckViewer from "../Menu/DeckViewer";
import { JOB_CARD_MAP } from "../ability";
import AbilityView from "../ability/AbilityView/AbilityView";
import RarityTag from "../ability/AbilityView/RarityTag";
import { NEUTRAL_ABILITIES } from "../ability/neutralAbilities";
import { Ability, CombatAbility } from "../ability/types";
import { playExplodeAnimation, playFadeInAnimation } from "../character/animations";
import { Player } from "../character/types";
import { COMMON_STYLES, NUM_CARD_CHOICES } from "../constants";
import { QuestionMarkIcon } from "../images/icons";
import { Item, RARITIES } from "../item/types";
import { rollRarity } from "../item/utils";
import { shuffle } from "../utils";
import Button from "../view/Button";
import Overlay from "../view/Overlay";
import Icon from "../icon/Icon";
import { ElliniaWeaponStoreImage } from "../images";
import { getUpgradeCard } from "../Menu/utils";

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
    backdrop: {
        height: "75%",
        bottom: 0,
        width: "100%",
        maxWidth: "80vw",
        background: `url(${ElliniaWeaponStoreImage})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "contain",
        backgroundPosition: "center center",
        position: "fixed",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: -1,
        opacity: 0.2,
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
        margin: "32px 0",
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
    option: {
        opacity: 0,
    },
});

const Transmutation = ({
    deck,
    onTransmute,
    player,
    onExit,
    numTransmutations = 2,
}: {
    deck: CombatAbility[];
    onTransmute: (options: { card: string; for: CombatAbility }) => void;
    player: Player;
    onExit?;
    numTransmutations?: number;
}) => {
    const [selectedCard, setSelectedCard] = useState(null);
    const selectedCardRarity = selectedCard ? selectedCard.rarity || RARITIES.COMMON : undefined;
    const [numTransmutesRemaining, setNumTransmutesRemaining] = useState(numTransmutations);
    const [isPlayingAnimation, setIsPlayingAnimation] = useState(false);

    const [transmutationOptions, setTransmutationOptions] = useState(null);
    const [selectedOptionIndex, setSelectedOptionIndex] = useState(null);
    const [showDeck, setShowingDeck] = useState(false);

    const classes = useStyles();
    const selectedCardRef = useRef();
    const optionsRefs = Array.from({ length: 10 }).map(() => useRef());

    useEffect(() => {
        if (!isPlayingAnimation) {
            return;
        }

        const animations = playExplodeAnimation({ from: selectedCardRef.current, maxScale: 1.5, playbackTime: 500 });
        animations[animations.length - 1].onfinish = () => {
            setIsPlayingAnimation(false);
            transmute();
        };
    }, [isPlayingAnimation]);

    useEffect(() => {
        if (!transmutationOptions) {
            return;
        }
        transmutationOptions.forEach((_, i) => {
            playFadeInAnimation({ object: optionsRefs[i].current, shiftUp: true, delay: i * 100, fill: "forwards" });
        });
    }, [transmutationOptions]);

    const transmute = () => {
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
                let cardToAdd = { ...filteredByRarity, level: 1, instanceId: uuid.v4() };
                while (cardToAdd.level < selectedCard.level) {
                    const card = getUpgradeCard(cardToAdd);
                    if (card) {
                        cardToAdd = card;
                    } else {
                        break;
                    }
                }
                choices.push(cardToAdd);
            }
        });

        setTransmutationOptions(choices);
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

    const handleConfirmClick = () => {
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
                <div className={classes.backdrop} />
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
                                {selectedCard && (
                                    <div className={classes.abilityContainer} ref={selectedCardRef}>
                                        <AbilityView ability={selectedCard} onClick={handleClickSelectCardButton} />
                                    </div>
                                )}
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
                                    {!selectedCard && <Icon icon={QuestionMarkIcon} />}
                                </div>
                            </div>
                        )}

                        {transmutationOptions && (
                            <>
                                <h4>Results - Pick One</h4>
                                <div className={classes.transmuteContainerInner}>
                                    <div className={classes.abilitySectionContainer}>
                                        {transmutationOptions.map((ability: CombatAbility, i: number) => (
                                            <div
                                                className={classNames(classes.abilityContainer, classes.option)}
                                                key={ability.instanceId}
                                                ref={optionsRefs[i]}
                                            >
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
                                    <Button color="primary" disabled={selectedOptionIndex === null} onClick={handleConfirmClick}>
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
                                <Button
                                    disabled={!selectedCard || !numTransmutesRemaining}
                                    onClick={() => setIsPlayingAnimation(true)}
                                    color="primary"
                                >
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
