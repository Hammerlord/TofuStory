import { Button } from "@material-ui/core";
import classNames from "classnames";
import { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
import {
    anger,
    bash,
    blizzardCharge,
    block,
    bloodthirst,
    brandish,
    bunchOBricks,
    chanceStrike,
    comboFury,
    evilEye,
    flameCharge,
    frostFire,
    hammerang,
    hyperBody,
    ironWill,
    lightningCharge,
    piercingDrive,
    puncture,
    rampage,
    shieldStrike,
    slam,
    slashBlast,
    spearSweep,
    spikedArmor,
    sweepingReach,
    warBanner,
    warLeap,
    yell,
} from "../ability/Abilities";
import AbilityView from "../ability/AbilityView/AbilityView";
import { shuffle } from "../utils";
import Overlay from "./Overlay";

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

const warriorAbilities = [
    bash,
    slashBlast,
    warLeap,
    slam,
    anger,
    rampage,
    shieldStrike,
    block,
    puncture,
    bloodthirst,
    warBanner,
    spikedArmor,
    chanceStrike,
    yell,
    bunchOBricks,
    hammerang,
    ironWill,
    hyperBody,
    blizzardCharge,
    flameCharge,
    lightningCharge,
    frostFire,
    evilEye,
    brandish,
    comboFury,
    sweepingReach,
    piercingDrive,
    spearSweep,
];

const Rewards = ({ deck, potentialAbilities = warriorAbilities, updateDeck, onClose }) => {
    const [rolledAbilities, setRolledAbiliies] = useState([]);
    const [selectedAbilityIndex, setSelectedAbilityIndex] = useState(null);
    const classes = useStyles();
    useEffect(() => {
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
                <Button variant={"contained"} disabled={!rolledAbilities[selectedAbilityIndex]} onClick={handleSelectClick}>
                    Select!
                </Button>
            </div>
        </Overlay>
    );
};

export default Rewards;
