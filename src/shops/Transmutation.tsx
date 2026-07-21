import classNames from "classnames";
import { useEffect, useRef, useState } from "react";
import { createUseStyles } from "react-jss";
import * as uuid from "uuid";
import DeckViewer from "../Menu/DeckViewer";
import { getCardChoicesFromItems, getCardPool, getUpgradeCard } from "../Menu/utils";
import { JOB_CARD_MAP } from "../ability";
import AbilityView from "../ability/AbilityView/AbilityView";
import RarityTag from "../ability/AbilityView/RarityTag";
import { NEUTRAL_ABILITIES } from "../ability/neutralAbilities";
import { Ability, CombatAbility } from "../ability/types";
import { playExplodeAnimation, playFadeInAnimation } from "../character/animations";
import { Player } from "../character/types";
import { CARD_CHOICE_UPGRADE_RATE, COMMON_STYLES, NUM_CARD_CHOICES, RARE_CARD_CHOICE_UPGRADE_RATE } from "../constants";
import { useAppDispatch, useAppSelector } from "../hooks";
import Icon from "../icon/Icon";
import { ElliniaWeaponStoreImage } from "../images";
import { QuestionMarkIcon } from "../images/icons";
import { Item, RARITIES } from "../item/types";
import { rollRarity } from "../item/utils";
import { shuffle } from "../utils";
import Button from "../view/Button";
import Overlay from "../view/Overlay";
import LeaveButton from "./LeaveButton";
import { TOWNS } from "../map/types";
import { playerStateSlice } from "../character/playerReducer";
import { NUM_TRANSMUTATIONS } from "./constants";
import { DEFAULT_CARD_MAX_LEVEL } from "../ability/AbilityView/constants";

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
        background: "rgba(40, 40, 40, 0.95)",
        textAlign: "center",
    },
    backdrop: ({ backdrop }: any) => ({
        height: "75%",
        bottom: 0,
        width: "100%",
        maxWidth: "80vw",
        background: `url(${backdrop || ElliniaWeaponStoreImage})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "contain",
        backgroundPosition: "center center",
        position: "fixed",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: -1,
        opacity: 0.25,
    }),
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
        marginTop: 48,
        marginBottom: 84,
    },
    transmuteContainer: {
        margin: "32px 0",
    },
    transmuteContainerInner: {
        display: "flex",
        alignItems: "end",
        justifyContent: "center",
        minHeight: "350px",
    },
    cardPlaceholder: {
        width: 168,
        height: 262,
        border: "none",
        borderRadius: 4,
        display: "inline-block",
        background: "#4f4f4f",
        padding: 24,
        color: "white",
        fontSize: 16,
        transition: "0.25s",
        margin: "0 16",
        boxShadow: "1px 1px 4px rgba(0, 0, 0, 0.3)",

        "&:not(:disabled)": {
            filter: "drop-shadow(0 0 3px #45ff61)",
        },
        "&:hover&:not(:disabled)": {
            filter: "drop-shadow(0 0 4px #45ff61) drop-shadow(0 0 4px #45ff61)",
        },

        "&:disabled": {
            color: "rgba(255, 255, 255, 0.5)",
        },
    },
    resultPlaceholder: {
        width: 168,
        height: 262,
        borderRadius: 4,
        padding: 24,
        border: "1px solid rgba(255, 255, 255, 0.25)",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
    },
    divider: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        fontSize: "56px",
        margin: "auto 8px",
        paddingTop: 72,
    },
    rarityPreview: {
        display: "inline-block",
        width: 168,
        margin: "0 16",
        position: "relative",
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
        marginTop: 32,
        color: "white",
        marginBottom: "24px",
        minWidth: 400,
    },
    option: {
        opacity: 0,
    },
    resultPlaceholderExtra: {
        border: "1px solid rgba(255, 255, 255, 0.25)",
        borderTopRightRadius: 4,
        borderBottomRightRadius: 4,
        position: "absolute",
        width: 168,
        height: 260,
        bottom: 0,
        right: -16,
        borderLeft: 0,
    },
    resultPlaceholderExtra2: {
        border: "1px solid rgba(255, 255, 255, 0.25)",
        borderTopRightRadius: 4,
        borderBottomRightRadius: 4,
        position: "absolute",
        width: 168,
        height: 260,
        bottom: 0,
        right: -32,
        borderLeft: 0,
    },
    topRarityTag: {
        marginBottom: 8,
    },
});

const { updateTownShop, updateDeck } = playerStateSlice.actions;

export const TransmutationView = ({
    deck,
    onTransmute,
    onCancelTransmute,
    player,
    onExit,
    numTransmutations,
    disableBackdrop,
    backdrop,
}: {
    deck: CombatAbility[];
    onTransmute: (options: { card: string; for: CombatAbility }) => void;
    onCancelTransmute: () => void;
    player: Player;
    onExit?;
    numTransmutations: number; // How many transmutations the player can perform for this session
    disableBackdrop?: boolean; // Disable background image
    backdrop?: string; // Custom background image
}) => {
    const [selectedCard, setSelectedCard] = useState(null);
    const selectedCardRarity = selectedCard ? selectedCard.rarity || RARITIES.COMMON : undefined;
    const [isPlayingAnimation, setIsPlayingAnimation] = useState(false);

    const [transmutationOptions, setTransmutationOptions] = useState(null);
    const [selectedOptionIndex, setSelectedOptionIndex] = useState(null);
    const [showDeck, setShowingDeck] = useState(false);

    const classes = useStyles({ backdrop } as any);
    const selectedCardRef = useRef(null);
    const optionsRefs = Array.from({ length: 10 }).map(() => useRef(null));

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
        const { starters } = JOB_CARD_MAP[player.class];
        const potentialAbilities = getCardPool(player, deck).filter((card) => starters.every(({ name }) => name !== card.name));

        const { numChoices: numChoicesFromItems, choices: choicesFromItems } = getCardChoicesFromItems({
            player,
            deck,
        });

        const choices = [...choicesFromItems];
        const numChoices = NUM_CARD_CHOICES + numChoicesFromItems;

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
                const notSameAsSelection = ability.name !== selectedCard.name;
                const noExclusive = choices.every((choice) => !choice.exclusive || choice.exclusive !== ability.exclusive);
                return (ability.rarity || RARITIES.COMMON) === rarity && noDuplicate && notSameAsSelection && noExclusive;
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

                const upgradeRate = rarity === RARITIES.RARE ? RARE_CARD_CHOICE_UPGRADE_RATE : CARD_CHOICE_UPGRADE_RATE;
                const isRandomlyUpgraded = cardToAdd.level < DEFAULT_CARD_MAX_LEVEL && Math.random() <= upgradeRate;
                if (isRandomlyUpgraded) {
                    choices.push(getUpgradeCard(cardToAdd) || cardToAdd);
                } else {
                    choices.push(cardToAdd);
                }
            }
        });

        setTransmutationOptions(choices);
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

    const handleCancelClick = () => {
        onCancelTransmute();
        setSelectedCard(null);
        setTransmutationOptions(null);
        setSelectedOptionIndex(null);
    };

    const handleClickSelectCardButton = () => {
        if (!isPlayingAnimation) {
            setShowingDeck(true);
        }
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
                {!disableBackdrop && <div className={classes.backdrop} />}
                <div className={classes.titleContainer}>
                    <h2>Transmute an Ability</h2>
                </div>
                {!transmutationOptions && (
                    <>
                        <p>Replace an ability in your deck with 1 of 3 card options.</p>

                        <div className={classes.doneContainer}>
                            <LeaveButton onClick={handleClickExit} text="Leave" />
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
                                        disabled={!numTransmutations}
                                    >
                                        <span className={classes.plus}>+</span>
                                        <br />
                                        <span>Select Card</span>
                                    </button>
                                )}
                                {selectedCard && (
                                    <div className={classes.abilityContainer}>
                                        <RarityTag rarity={selectedCardRarity} />
                                        <div ref={selectedCardRef}>
                                            <AbilityView ability={selectedCard} onClick={handleClickSelectCardButton} />
                                        </div>
                                    </div>
                                )}
                                <div className={classes.divider}>
                                    <span>›</span>
                                </div>
                                <div className={classes.rarityPreview}>
                                    {selectedCard && (
                                        <>
                                            {selectedCardRarity !== RARITIES.RARE && (
                                                <RarityTag rarity={rarityStepChart[selectedCardRarity]} className={classes.topRarityTag} />
                                            )}
                                            <RarityTag rarity={selectedCardRarity} />
                                        </>
                                    )}

                                    <div className={classes.resultPlaceholder}>{<Icon icon={QuestionMarkIcon} />}</div>
                                    <div className={classes.resultPlaceholderExtra} />
                                    <div className={classes.resultPlaceholderExtra2} />
                                </div>
                            </div>
                        )}

                        {transmutationOptions && (
                            <>
                                <p>
                                    Results of transmuting [<Icon icon={selectedCard.image} size="sm" /> {selectedCard.name}] - pick one:
                                </p>
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

                                <div>
                                    <Button onClick={handleCancelClick}>Keep Original</Button>
                                </div>
                            </>
                        )}
                    </div>

                    {!transmutationOptions && (
                        <>
                            <div className={classes.transmutesRemainingLabel}>Transmutations remaining: {numTransmutations}</div>

                            <span
                                className={classNames({
                                    [classes.highlightAnimation]: selectedCard && numTransmutations,
                                })}
                            >
                                <Button
                                    disabled={!selectedCard || !numTransmutations}
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

const Transmutation = ({ town, onExit, backdrop }: { town?: TOWNS; onExit?; backdrop?: string }) => {
    const { deck, player, townShops } = useAppSelector((state) => state.character);
    const dispatch = useAppDispatch();
    const townWorkshop = townShops[town]?.workshop;
    const numTownTransmutes = townWorkshop?.numTransmutesRemaining;
    const [numTransmutes, setNumTransmutes] = useState(NUM_TRANSMUTATIONS);

    const decrementNumTransmutes = () => {
        if (townWorkshop) {
            dispatch(updateTownShop({ town, shopKey: "workshop", shopState: { numTransmutesRemaining: numTownTransmutes - 1 } }));
        } else {
            setNumTransmutes((prev) => prev - 1);
        }
    };

    const handleTransmute = (options: { card: string; for: CombatAbility }) => {
        const { card: cardId, for: forCard } = options || {};
        const cardIndex = deck.findIndex((ability) => ability.instanceId === cardId);
        if (cardIndex > -1) {
            const newDeck = deck.slice();
            newDeck[cardIndex] = forCard;
            dispatch(updateDeck(newDeck));
            decrementNumTransmutes();
        }
    };

    return (
        <TransmutationView
            onExit={onExit}
            deck={deck}
            player={player}
            onTransmute={handleTransmute}
            onCancelTransmute={decrementNumTransmutes}
            numTransmutations={townWorkshop ? numTownTransmutes : numTransmutes}
            backdrop={backdrop}
        />
    );
};

export default Transmutation;
