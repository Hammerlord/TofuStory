import { Button } from "@material-ui/core";
import classNames from "classnames";
import { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
import { JOB_CARD_MAP } from "../ability";
import AbilityView from "../ability/AbilityView/AbilityView";
import { shuffle } from "../utils";
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
            "linear-gradient(90deg, rgba(0,212,255,0) 0%, rgba(0,0,0,0.75) 70%, rgba(0,0,0,0.75) 50%, rgba(0,0,0,0.75) 70%, rgba(0,212,255,0) 100%)",
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
});

const Rewards = ({ deck, player, updateDeck, onClose }) => {
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
        const shuffled = shuffle(potentialAbilities);
        // Use deck to determine which abilities have a higher chance to roll
        setRolledAbiliies(shuffled.slice(0, 3));
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
                <Button variant={"contained"} color="primary" disabled={!rolledAbilities[selectedAbilityIndex]} onClick={handleSelectClick}>
                    Select!
                </Button>{" "}
                <Button variant={"contained"} onClick={onClose}>
                    Exit without taking anything
                </Button>
            </div>
        </Overlay>
    );
};

export default Rewards;
