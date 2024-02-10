import classNames from "classnames";
import { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
import uuid from "uuid";
import { JOB_CARD_MAP } from "../ability";
import AbilityView from "../ability/AbilityView/AbilityView";
import { Ability, HandAbility } from "../ability/types";
import { Item, RARITIES } from "../item/types";
import { shuffle } from "../utils";
import Button from "../view/Button";
import Overlay from "../view/Overlay";
import { rollRarity } from "../item/utils";
import {
    BOSS_RARE_RATE,
    COLOR_RARITY_COMMON,
    COLOR_RARITY_RARE,
    COLOR_RARITY_UNCOMMON,
    ELITE_RARE_RATE,
    ELITE_UNCOMMON_RATE,
} from "../constants";
import { BATTLE_TYPES } from "../battle/types";

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
            WebkitFilter: "drop-shadow(0 0 4px #45ff61) drop-shadow(0 0 4px #45ff61)",
        },
    },
    selectContainer: {
        marginBottom: 64,
    },
    diamond: {
        width: "10px",
        height: "10px",
        marginRight: "4px",
        transform: "rotate(45deg)",
        display: "inline-block",
    },
    uncommon: {
        background: COLOR_RARITY_UNCOMMON,
    },
    common: {
        background: COLOR_RARITY_COMMON,
    },
    rare: {
        background: COLOR_RARITY_RARE,
    },
    rarityContainer: {
        marginBottom: "16px",
        background: "rgba(10, 10, 10, 0.7)",
        borderRadius: "4px",
        padding: "6px 8px",
    },
    uncommonText: {
        color: COLOR_RARITY_UNCOMMON,
    },
    rareText: {
        color: COLOR_RARITY_RARE,
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
}: {
    deck: HandAbility[];
    player;
    updateDeck;
    onClose;
    cardRewardOptions?: Ability[];
    rewardType?: BATTLE_TYPES;
}) => {
    const [rolledAbilities, setRolledAbiliies] = useState([]);
    const [selectedAbilityIndex, setSelectedAbilityIndex] = useState(null);
    const classes = useStyles();
    useEffect(() => {
        const { starters, all } = JOB_CARD_MAP[player.class];

        const potentialAbilities = [
            ...all.filter((card) => starters.every(({ name }) => name !== card.name)),
            ...(JOB_CARD_MAP[player.secondaryClass]?.all || []),
        ];

        const choices = [...cardRewardOptions];
        const numChoices = BASE_NUM_CHOICES + player.items.reduce((acc, item: Item) => item.abilityChoices || 0 + acc, 0);

        Array.from({ length: numChoices - cardRewardOptions.length }).forEach(() => {
            const rareBonus = rewardType === BATTLE_TYPES.BOSS ? BOSS_RARE_RATE : ELITE_RARE_RATE;
            const selectedRarity = rollRarity(player, { rare: rareBonus, uncommon: ELITE_UNCOMMON_RATE });
            const [filteredByRarity] = shuffle(potentialAbilities).filter((ability: Ability) => {
                const noDuplicate = choices.every((choice) => choice.name !== ability.name);
                return (ability.rarity || RARITIES.COMMON) === selectedRarity && noDuplicate;
            });
            choices.push(filteredByRarity);
        });

        const abilities: HandAbility[] = choices.map((ability: Ability) => ({ ...ability, instanceId: uuid.v4() }));

        setRolledAbiliies(abilities);
    }, []);

    const handleSelectClick = () => {
        updateDeck([rolledAbilities[selectedAbilityIndex], ...deck]);
        onClose();
    };

    return (
        <Overlay>
            <div className={classes.inner}>
                <div className={classes.titleContainer}>
                    <h1>Pick an ability to acquire</h1>
                </div>
                <div className={classes.abilitySectionContainer}>
                    {rolledAbilities.map((ability: HandAbility, i) => (
                        <div className={classes.abilityContainer}>
                            <div className={classes.rarityContainer}>
                                <span
                                    className={classNames(classes.diamond, {
                                        [classes.common]: ability.rarity === RARITIES.COMMON || !ability.rarity,
                                        [classes.uncommon]: ability.rarity === RARITIES.UNCOMMON,
                                        [classes.rare]: ability.rarity === RARITIES.RARE,
                                    })}
                                />{" "}
                                <span
                                    className={classNames({
                                        [classes.uncommonText]: ability.rarity === RARITIES.UNCOMMON,
                                        [classes.rareText]: ability.rarity === RARITIES.RARE,
                                    })}
                                >
                                    {ability.rarity}
                                </span>
                            </div>
                            <div
                                className={classNames(classes.ability, {
                                    selected: i === selectedAbilityIndex,
                                })}
                                onClick={() => setSelectedAbilityIndex(i)}
                                key={ability.instanceId}
                            >
                                <AbilityView ability={ability} player={player} deck={deck} hand={[]} discard={[]} disableGlow={true} />
                            </div>
                        </div>
                    ))}
                </div>
                <div className={classes.selectContainer}>
                    <Button color="primary" disabled={!rolledAbilities[selectedAbilityIndex]} onClick={handleSelectClick}>
                        Select!
                    </Button>
                </div>
                <div>
                    <Button onClick={onClose}>Ignore and Exit</Button>
                </div>
            </div>
        </Overlay>
    );
};

export default CardRewards;
