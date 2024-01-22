import classNames from "classnames";
import { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
import uuid from "uuid";
import { JOB_CARD_MAP } from "../ability";
import AbilityView from "../ability/AbilityView/AbilityView";
import { Ability, Action, HandAbility, SELECT_CARD_TYPES } from "../ability/types";
import { shuffle } from "../utils";
import Button from "../view/Button";
import Overlay from "../view/Overlay";
import { PlayerSelectCardsPrompt } from "./reducer";

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
    cancel: {
        marginTop: "2rem",
    },
});

const SelectCardOverlay = ({
    selectCardsPrompt,
    hand,
    onSelect,
    player,
    onCancel,
    deck,
    discard,
}: {
    selectCardsPrompt: PlayerSelectCardsPrompt;
    hand: HandAbility[];
    onSelect: ({ updatedHand }: { updatedHand: HandAbility[] }) => void;
    player: any;
    onCancel: () => void;
    deck: Ability[];
    discard: Ability[];
}) => {
    const [abilityChoices, setAbilityChoices] = useState([]);
    const [selectedAbilityId, setSelectedAbilityId] = useState(null);
    const classes = useStyles();
    const { effects = {}, type, filters } = selectCardsPrompt.selectCards;
    const { removeAfterTurn, ...other } = effects;
    const selectedAbility = abilityChoices.find(({ instanceId }) => instanceId === selectedAbilityId);

    const createNewOption = (ability: Ability | HandAbility): HandAbility => {
        return {
            ...ability,
            instanceId: uuid.v4(),
            removeAfterTurn,
            effects: other,
        };
    };

    useEffect(() => {
        // Set selectable cards per selectCards type

        const applyFilters = (cards: HandAbility[]) => {
            // If we are prompting card selection as a prerequisite to using an ability, don't include that ability as an option
            if (selectCardsPrompt.abilityQueued?.selectedAbilityId) {
                cards = cards.filter(({ instanceId }) => instanceId !== selectCardsPrompt.abilityQueued.selectedAbilityId);
            }
            if (filters?.length) {
                return cards.filter(({ actions }) => actions.some((action: Action) => filters.includes(action.type)));
            }
            return cards;
        };
        if (type === SELECT_CARD_TYPES.COPY_FROM_HAND) {
            setAbilityChoices(applyFilters(hand).map(createNewOption));
            return;
        }
        if (type === SELECT_CARD_TYPES.DEPLETE_FROM_HAND) {
            setAbilityChoices(applyFilters(hand));
            return;
        }

        if (type === SELECT_CARD_TYPES.DISCOVER_FROM_CLASS) {
            const firstJobCards = JOB_CARD_MAP[player.class].all;
            const secondJobCards = JOB_CARD_MAP[player.secondaryClass]?.all || [];
            const potentialAbilities = applyFilters([...firstJobCards, ...secondJobCards]);
            const shuffled = shuffle(potentialAbilities);
            setAbilityChoices(shuffled.slice(0, 3).map(createNewOption));
            return;
        }

        if (type === SELECT_CARD_TYPES.PRESET_CARDS) {
            setAbilityChoices(selectCardsPrompt?.selectCards?.cards?.map((card) => ({ ...card, instanceId: uuid.v4() })) || []);
        }
    }, []);

    const handleSelectClick = () => {
        if (type === SELECT_CARD_TYPES.DEPLETE_FROM_HAND) {
            onSelect({ updatedHand: hand.filter((ability: HandAbility) => ability.instanceId !== selectedAbilityId) });
        } else {
            onSelect({ updatedHand: [...hand, selectedAbility] });
        }
    };

    return (
        <Overlay>
            <div className={classes.inner}>
                <div className={classes.titleContainer}>
                    <h1>
                        {type === SELECT_CARD_TYPES.COPY_FROM_HAND && "Pick an ability from your hand to copy"}
                        {type === SELECT_CARD_TYPES.DISCOVER_FROM_CLASS && "Discover an ability"}
                        {type === SELECT_CARD_TYPES.PRESET_CARDS && "Create an ability"}
                        {type === SELECT_CARD_TYPES.DEPLETE_FROM_HAND && "Pick an ability from your hand to deplete"}
                    </h1>
                </div>
                <div className={classes.abilityContainer}>
                    {abilityChoices.map((ability: HandAbility) => (
                        <div
                            className={classNames(classes.ability, {
                                selected: ability.instanceId === selectedAbilityId,
                            })}
                            onClick={() => setSelectedAbilityId(ability.instanceId)}
                            key={ability.instanceId}
                        >
                            <AbilityView ability={ability} deck={deck} hand={hand} discard={discard} />
                        </div>
                    ))}
                </div>
                <Button variant={"contained"} color="primary" disabled={!selectedAbility} onClick={handleSelectClick}>
                    Select!
                </Button>
                {/**
                 * This is currently a trap as you lose the card when you use it
                 * type !== SELECT_CARD_TYPES.DISCOVER_FROM_CLASS && (
                    <div className={classes.cancel}>
                        <Button variant={"contained"} onClick={onCancel}>
                            Cancel
                        </Button>
                    </div>
                )
                **/}
            </div>
        </Overlay>
    );
};

export default SelectCardOverlay;
