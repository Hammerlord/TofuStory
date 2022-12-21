import classNames from "classnames";
import { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
import { JOB_CARD_MAP } from "../ability";
import AbilityView from "../ability/AbilityView/AbilityView";
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
            boxShadow: "0 0 8px 4px #45ff61",
        },
    },
    selectContainer: {
        marginBottom: 40,
    },
});

const BASE_NUM_CHOICES = 3;

const CardRewards = ({ deck, player, updateDeck, onClose, cardRewardOptions = [] }) => {
    const [rolledAbilities, setRolledAbiliies] = useState([]);
    const [selectedAbilityIndex, setSelectedAbilityIndex] = useState(null);
    const classes = useStyles();
    useEffect(() => {
        // For starter abilities, only their level 2 versions are to be part of the prize pool
        const { starters, all } = JOB_CARD_MAP[player.class];
        const level2Starters = starters.reduce((acc, card) => {
            if (card.upgrades?.length && acc.every(({ name }) => name !== card.name)) {
                acc.push(...card.upgrades);
            }

            return acc;
        }, []);

        const potentialAbilities = [
            ...level2Starters,
            ...all.filter((card) => starters.every(({ name }) => name !== card.name)),
            ...(JOB_CARD_MAP[player.secondaryClass]?.all || []),
        ];
        const shuffled = [...cardRewardOptions, ...shuffle(potentialAbilities)];
        const numChoices = BASE_NUM_CHOICES + player.items.reduce((acc, item: Item) => item.abilityChoices || 0 + acc, 0);
        // Use deck to determine which abilities have a higher chance to roll
        setRolledAbiliies(shuffled.slice(0, numChoices));
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
                    {rolledAbilities.map((ability, i) => (
                        <div
                            className={classNames(classes.ability, {
                                selected: i === selectedAbilityIndex,
                            })}
                            onClick={() => setSelectedAbilityIndex(i)}
                            key={i}
                        >
                            <AbilityView ability={ability} />
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
