import classNames from "classnames";
import { useMemo, useState } from "react";
import { createUseStyles } from "react-jss";
import uuid from "uuid";
import { JOB_CARD_MAP } from "../ability";
import AbilityView from "../ability/AbilityView/AbilityView";
import RarityTag from "../ability/AbilityView/RarityTag";
import { Ability, CombatAbility } from "../ability/types";
import { BATTLE_TYPES } from "../battle/types";
import { Player } from "../character/types";
import { BOSS_RARE_RATE, ELITE_RARE_RATE, ELITE_UNCOMMON_RATE } from "../constants";
import { Item, RARITIES } from "../item/types";
import { rollRarity } from "../item/utils";
import { shuffle } from "../utils";
import Button from "../view/Button";
import Overlay from "../view/Overlay";
import { getUpgradeCard } from "./utils";
import { NEUTRAL_ABILITIES } from "../ability/neutralAbilities";

const useStyles = createUseStyles({
    inner: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translateX(-50%) translateY(-50%)",
        textAlign: "center",
        width: "100%",
    },
    titleContainer: {
        display: "inline-block",
        background:
            "linear-gradient(90deg, rgba(0,212,255,0) 0%, rgba(0,0,0,0.75) 30%, rgba(0,0,0,0.75) 50%, rgba(0,0,0,0.75) 70%, rgba(0,212,255,0) 100%)",
        padding: "8px 96px",
        color: "white",
        marginBottom: "24px",
    },
    abilitySectionContainer: {
        margin: "64px 0",
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
        marginBottom: 72,
    },
    moreThanOne: {
        color: "#45ff61",
    },
    selectionsRemainingContainer: {
        marginBottom: 16,
        fontSize: 18,
    },
    selectionsRemainingCount: {
        fontWeight: "bold",
    },
});

const BASE_NUM_CHOICES = 3;

const CardRewards = ({
    deck,
    player,
    updateDeck,
    onClose,
    cardRewardOptions = [],
    rewardType,
    maxAmount = 1,
    disableRarities,
    disableIgnoreButton,
}: {
    deck: CombatAbility[];
    player: Player;
    updateDeck;
    onClose;
    cardRewardOptions?: Ability[];
    rewardType?: BATTLE_TYPES;
    maxAmount?: number;
    disableRarities?: RARITIES[];
    disableIgnoreButton?: boolean;
}) => {
    const rolledAbilities = useMemo(() => {
        const { starters, all } = JOB_CARD_MAP[player.class];

        const potentialAbilities = [
            ...all.map((card) => {
                if (starters.some(({ name }) => name === card.name)) {
                    return getUpgradeCard(card) || card;
                }
                return card;
            }),
        ].concat(NEUTRAL_ABILITIES);

        const choices = [...cardRewardOptions];
        const numChoices = BASE_NUM_CHOICES + player.items.reduce((acc, item: Item) => item.abilityChoices || 0 + acc, 0);

        let bonuses = { rare: 0, uncommon: 0 };
        if (rewardType === BATTLE_TYPES.BOSS) {
            bonuses = { rare: BOSS_RARE_RATE, uncommon: ELITE_UNCOMMON_RATE };
        } else if (rewardType === BATTLE_TYPES.ELITE_ENCOUNTER) {
            bonuses = { rare: ELITE_RARE_RATE, uncommon: ELITE_UNCOMMON_RATE };
        }

        Array.from({ length: numChoices - cardRewardOptions.length }).forEach(() => {
            const selectedRarity = rollRarity({ player, bonuses, disableRarities });
            const [filteredByRarity] = shuffle(potentialAbilities).filter((ability: Ability) => {
                const noDuplicate = choices.every((choice) => choice.name !== ability.name);
                return (ability.rarity || RARITIES.COMMON) === selectedRarity && noDuplicate;
            });
            if (filteredByRarity) {
                choices.push(filteredByRarity);
            }
        });

        return choices.map((ability: Ability) => ({ ...ability, instanceId: uuid.v4() }));
    }, []);

    const [selectedAbilityIndices, setSelectedAbilityIndices] = useState([]);
    const classes = useStyles();

    const handleSelectClick = () => {
        const cards = selectedAbilityIndices.map((index) => rolledAbilities[index]);
        updateDeck([...cards, ...deck]);
        onClose();
    };

    const handleCardClick = (index) => {
        if (maxAmount === 1) {
            setSelectedAbilityIndices([index]);
            return;
        }
        if (selectedAbilityIndices.includes(index)) {
            // Deselect if selected
            setSelectedAbilityIndices((prev) => prev.filter((i) => i !== index));
            return;
        }
        if (selectedAbilityIndices.length < maxAmount) {
            setSelectedAbilityIndices((prev) => [...prev, index]);
        }
    };

    return (
        <Overlay>
            <div className={classes.inner}>
                <div className={classes.titleContainer}>
                    <h2>
                        Pick{" "}
                        {maxAmount === 1 ? (
                            "an ability"
                        ) : (
                            <>
                                up to <span className={classes.moreThanOne}>{maxAmount} abilities</span>
                            </>
                        )}
                    </h2>
                </div>
                <div className={classes.abilitySectionContainer}>
                    {rolledAbilities.map((ability: CombatAbility, i) => (
                        <div className={classes.abilityContainer} key={ability.instanceId}>
                            <RarityTag rarity={ability.rarity} />
                            <div
                                className={classNames(classes.ability, {
                                    selected: selectedAbilityIndices.includes(i),
                                })}
                                onClick={() => handleCardClick(i)}
                            >
                                <AbilityView ability={ability} disableGlow={true} disableBattleBonuses={true} />
                            </div>
                        </div>
                    ))}
                </div>
                {maxAmount > 1 && (
                    <div className={classes.selectionsRemainingContainer}>
                        Selections remaining:{" "}
                        <span
                            className={classNames(classes.selectionsRemainingCount, {
                                [classes.moreThanOne]: selectedAbilityIndices.length < maxAmount,
                            })}
                        >
                            {maxAmount - selectedAbilityIndices.length}
                        </span>
                    </div>
                )}
                <div className={classes.selectContainer}>
                    <Button color="primary" disabled={!selectedAbilityIndices.length} onClick={handleSelectClick}>
                        Confirm
                    </Button>
                </div>
                {!disableIgnoreButton && (
                    <div>
                        <Button onClick={onClose}>Ignore and Exit</Button>
                    </div>
                )}
            </div>
        </Overlay>
    );
};

export default CardRewards;
