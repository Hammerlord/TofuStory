import { Button } from "@material-ui/core";
import classNames from "classnames";
import { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
import { JOB_CARD_MAP } from "../ability";
import AbilityView from "../ability/AbilityView/AbilityView";
import { Ability, Action, SELECT_CARD_TYPES } from "../ability/types";
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
    cancel: {
        marginTop: "2rem",
    },
});

const SelectCardOverlay = ({ selectCards, hand, onSelect, player, onCancel }) => {
    const [abilityChoices, setAbilityChoices] = useState([]);
    const [selectedAbilityIndex, setSelectedAbilityIndex] = useState(null);
    const classes = useStyles();
    const { effects, type, filters } = selectCards;
    const { removeAfterTurn, ...other } = effects;

    const applyEffects = (ability: Ability) => {
        return {
            ...ability,
            removeAfterTurn,
            effects: other,
        };
    };
    useEffect(() => {
        // Set selectable cards per selectCards type

        const applyFilters = (cards) => {
            if (filters?.length) {
                return cards.filter(({ actions }) => actions.some((action: Action) => filters.includes(action.type)));
            }
            return cards;
        };
        if (type === SELECT_CARD_TYPES.COPY_FROM_HAND) {
            setAbilityChoices(applyFilters(hand).map(applyEffects));
            return;
        }

        if (type === SELECT_CARD_TYPES.DISCOVER_FROM_CLASS) {
            const firstJobCards = JOB_CARD_MAP[player.class].all;
            const secondJobCards = JOB_CARD_MAP[player.secondaryClass]?.all || [];
            const potentialAbilities = applyFilters([...firstJobCards, ...secondJobCards]);
            const shuffled = shuffle(potentialAbilities);
            setAbilityChoices(shuffled.slice(0, 3).map(applyEffects));
            return;
        }
    }, []);

    const handleSelectClick = () => {
        onSelect(applyEffects(abilityChoices[selectedAbilityIndex]));
    };

    return (
        <Overlay>
            <div className={classes.inner}>
                <div className={classes.titleContainer}>
                    <h1>
                        {type === SELECT_CARD_TYPES.COPY_FROM_HAND && "Pick an ability from your hand to copy"}
                        {type === SELECT_CARD_TYPES.DISCOVER_FROM_CLASS && "Discover an ability"}
                    </h1>
                </div>
                <div className={classes.abilityContainer}>
                    {abilityChoices.map((ability, i) => (
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
                <Button variant={"contained"} color="primary" disabled={!abilityChoices[selectedAbilityIndex]} onClick={handleSelectClick}>
                    Select!
                </Button>
                <div className={classes.cancel}>
                    <Button variant={"contained"} onClick={onCancel}>
                        Cancel
                    </Button>
                </div>
            </div>
        </Overlay>
    );
};

export default SelectCardOverlay;
