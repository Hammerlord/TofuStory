import classNames from "classnames";
import { useMemo, useState } from "react";
import { createUseStyles } from "react-jss";
import * as uuid from "uuid";
import AbilityView from "../ability/AbilityView/AbilityView";
import RarityTag from "../ability/AbilityView/RarityTag";
import { Ability, CombatAbility } from "../ability/types";
import { BATTLE_TYPES } from "../battle/types";
import { Player } from "../character/types";
import {
    BOSS_RARE_RATE,
    CARD_CHOICE_UPGRADE_RATE,
    ELITE_RARE_RATE,
    ELITE_UNCOMMON_RATE,
    NUM_CARD_CHOICES,
    RARE_CARD_CHOICE_UPGRADE_RATE,
} from "../constants";
import { RARITIES } from "../item/types";
import { rollRarity } from "../item/utils";
import { shuffle } from "../utils";
import Button from "../view/Button";
import Overlay from "../view/Overlay";
import { getCardChoicesFromItems, getCardPool, getUpgradeCard } from "./utils";

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
        marginBottom: "72px",
    },
    moreThanOne: {
        color: "#45ff61",
    },
    selectionsRemainingContainer: {
        marginBottom: "16px",
        fontSize: "18px",
    },
    selectionsRemainingCount: {
        fontWeight: "bold",
    },
});

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
    disableUpgradesForRarities = [],
    rarityRollMode,
    rareCardBonusChance = 0,
}: {
    deck: CombatAbility[];
    player: Player;
    updateDeck;
    onClose: (rolledAbilities: Ability[]) => void;
    cardRewardOptions?: Ability[];
    rewardType?: BATTLE_TYPES;
    maxAmount?: number;
    disableRarities?: RARITIES[];
    disableUpgradesForRarities?: RARITIES[];
    disableIgnoreButton?: boolean;
    // Whether the rarity roll applies to all cards, or each card individually rolls its own rarity
    rarityRollMode?: "all" | "individual";
    rareCardBonusChance?: number;
}) => {
    const rolledAbilities = useMemo(() => {
        const potentialAbilities = getCardPool(player, deck);
        const { numChoices: numChoicesFromItems, choices: choicesFromItems } = getCardChoicesFromItems({
            player,
            deck,
            battleType: rewardType,
        });

        const choices = [...cardRewardOptions, ...choicesFromItems];

        const numChoices = NUM_CARD_CHOICES + numChoicesFromItems;
        disableRarities = (disableRarities || []).slice();
        let bonuses = { rare: rareCardBonusChance, uncommon: 0 };
        if (rewardType === BATTLE_TYPES.BOSS) {
            bonuses = { rare: rareCardBonusChance + BOSS_RARE_RATE, uncommon: ELITE_UNCOMMON_RATE };
            disableRarities.push(RARITIES.COMMON);
        } else if (rewardType === BATTLE_TYPES.ELITE_ENCOUNTER) {
            bonuses = { rare: rareCardBonusChance + ELITE_RARE_RATE, uncommon: ELITE_UNCOMMON_RATE };
        }

        const overallRarity = rollRarity({ player, bonuses, disableRarities });

        const getUpgradeRateForRarity = (rarity: RARITIES) => {
            if (disableUpgradesForRarities.includes(rarity)) {
                return 0;
            } else if (rarity === RARITIES.RARE) {
                return RARE_CARD_CHOICE_UPGRADE_RATE;
            } else if (rewardType === BATTLE_TYPES.ELITE_ENCOUNTER && rarity === RARITIES.COMMON) {
                return 1;
            } else {
                return CARD_CHOICE_UPGRADE_RATE;
            }
        };

        Array.from({ length: numChoices - choices.length }).forEach(() => {
            const selectedRarity = rarityRollMode === "individual" ? rollRarity({ player, bonuses, disableRarities }) : overallRarity;
            const upgradeRate = getUpgradeRateForRarity(selectedRarity);

            const [filteredByRarity] = shuffle(potentialAbilities).filter((ability: Ability) => {
                const noDuplicate = choices.every((choice) => choice.name !== ability.name);
                const noExclusive = choices.every((choice) => !choice.exclusive || choice.exclusive !== ability.exclusive);
                return (ability.rarity || RARITIES.COMMON) === selectedRarity && noDuplicate && noExclusive;
            });

            if (filteredByRarity) {
                const upgradeCard = Math.random() <= upgradeRate && getUpgradeCard(filteredByRarity);
                choices.push(upgradeCard || filteredByRarity);
            }
        });

        return choices.map((ability: Ability) => ({ ...ability, instanceId: uuid.v4() }));
    }, []);

    const [selectedAbilityIndices, setSelectedAbilityIndices] = useState([]);
    const classes = useStyles();

    const handleSelectClick = () => {
        const cards = selectedAbilityIndices.map((index) => rolledAbilities[index]);
        updateDeck([...cards, ...deck]);
        onClose(rolledAbilities);
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
