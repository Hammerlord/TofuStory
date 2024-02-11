import classNames from "classnames";
import { useMemo, useState } from "react";
import { createUseStyles } from "react-jss";
import uuid from "uuid";
import { JOB_CARD_MAP } from "../ability";
import AbilityView from "../ability/AbilityView/AbilityView";
import { Ability, HandAbility } from "../ability/types";
import { BATTLE_TYPES } from "../battle/types";
import {
    BOSS_RARE_RATE,
    COLOR_RARITY_COMMON,
    COLOR_RARITY_RARE,
    COLOR_RARITY_UNCOMMON,
    ELITE_RARE_RATE,
    ELITE_UNCOMMON_RATE,
} from "../constants";
import { Item, RARITIES } from "../item/types";
import { rollRarity } from "../item/utils";
import { shuffle } from "../utils";
import Button from "../view/Button";
import Overlay from "../view/Overlay";
import AbilityRarityTag from "../ability/AbilityView/RarityTag";

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
    const rolledAbilities = useMemo(() => {
        const { starters, all } = JOB_CARD_MAP[player.class];

        const potentialAbilities = [
            ...all.filter((card) => starters.every(({ name }) => name !== card.name)),
            ...(JOB_CARD_MAP[player.secondaryClass]?.all || []),
        ];

        const choices = [...cardRewardOptions];
        const numChoices = BASE_NUM_CHOICES + player.items.reduce((acc, item: Item) => item.abilityChoices || 0 + acc, 0);

        let bonus = { rare: 0, uncommon: 0 };
        if (rewardType === BATTLE_TYPES.BOSS) {
            bonus = { rare: BOSS_RARE_RATE, uncommon: ELITE_UNCOMMON_RATE };
        } else if (rewardType === BATTLE_TYPES.ELITE_ENCOUNTER) {
            bonus = { rare: ELITE_RARE_RATE, uncommon: ELITE_UNCOMMON_RATE };
        }

        Array.from({ length: numChoices - cardRewardOptions.length }).forEach(() => {
            const selectedRarity = rollRarity(player, bonus);
            const [filteredByRarity] = shuffle(potentialAbilities).filter((ability: Ability) => {
                const noDuplicate = choices.every((choice) => choice.name !== ability.name);
                return (ability.rarity || RARITIES.COMMON) === selectedRarity && noDuplicate;
            });
            choices.push(filteredByRarity);
        });

        return choices.map((ability: Ability) => ({ ...ability, instanceId: uuid.v4() }));
    }, []);
    const [selectedAbilityIndex, setSelectedAbilityIndex] = useState(null);
    const classes = useStyles();

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
                        <div className={classes.abilityContainer} key={ability.instanceId}>
                            <AbilityRarityTag ability={ability} />
                            <div
                                className={classNames(classes.ability, {
                                    selected: i === selectedAbilityIndex,
                                })}
                                onClick={() => setSelectedAbilityIndex(i)}
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
