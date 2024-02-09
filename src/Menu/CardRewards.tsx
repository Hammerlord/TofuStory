import classNames from "classnames";
import { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
import uuid from "uuid";
import { JOB_CARD_MAP } from "../ability";
import AbilityView from "../ability/AbilityView/AbilityView";
import { Ability, HandAbility } from "../ability/types";
import { Item } from "../item/types";
import { shuffle } from "../utils";
import Button from "../view/Button";
import Overlay from "../view/Overlay";

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
    abilityContainer: {
        margin: "64px 0",
        verticalAlign: "top",
    },
    ability: {
        display: "inline-block",
        margin: "0 24px",
        verticalAlign: "bottom",
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

const level2StarterExceptions = []; // Too strong to offer as an upgraded version in the wild

const CardRewards = ({ deck, player, updateDeck, onClose, cardRewardOptions = [] }) => {
    const [rolledAbilities, setRolledAbiliies] = useState([]);
    const [selectedAbilityIndex, setSelectedAbilityIndex] = useState(null);
    const classes = useStyles();
    useEffect(() => {
        // For starter abilities, only their level 2 versions are to be part of the prize pool
        const { starters, all } = JOB_CARD_MAP[player.class];
        const level2Starters = starters.reduce((acc, card) => {
            if (
                card.upgrades?.length &&
                acc.every(({ name }) => name !== card.name) &&
                level2StarterExceptions.every(({ name }) => name !== card.name)
            ) {
                acc.push(...card.upgrades);
            }

            return acc;
        }, []);

        const potentialAbilities = [
            ...level2Starters,
            ...level2StarterExceptions,
            ...all.filter((card) => starters.every(({ name }) => name !== card.name)),
            ...(JOB_CARD_MAP[player.secondaryClass]?.all || []),
        ];
        const shuffled = [...cardRewardOptions, ...shuffle(potentialAbilities)];
        const numChoices = BASE_NUM_CHOICES + player.items.reduce((acc, item: Item) => item.abilityChoices || 0 + acc, 0);
        // Use deck to determine which abilities have a higher chance to roll
        const abilities: HandAbility[] = shuffled.slice(0, numChoices).map((ability: Ability) => ({ ...ability, instanceId: uuid.v4() }));
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
                <div className={classes.abilityContainer}>
                    {rolledAbilities.map((ability: HandAbility, i) => (
                        <div
                            className={classNames(classes.ability, {
                                selected: i === selectedAbilityIndex,
                            })}
                            onClick={() => setSelectedAbilityIndex(i)}
                            key={ability.instanceId}
                        >
                            <AbilityView ability={ability} player={player} deck={deck} hand={[]} discard={[]} disableGlow={true} />
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
