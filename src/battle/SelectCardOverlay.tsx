import classNames from "classnames";
import { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
import AbilityView from "../ability/AbilityView/AbilityView";
import { Ability, HandAbility, SELECT_CARD_TYPES } from "../ability/types";
import Button from "../view/Button";
import Overlay from "../view/Overlay";
import { PlayerSelectCardsPrompt } from "./reducer";
import getCardSelection from "./selectCardUtils";

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
    onSelect: ({ updatedHand, updatedDeck }: { updatedHand: HandAbility[]; updatedDeck?: (Ability | HandAbility)[] }) => void;
    player: any;
    onCancel: () => void;
    deck: Ability[];
    discard: Ability[];
}) => {
    const [abilityChoices, setAbilityChoices] = useState([]);
    const [selectedAbilityIds, setSelectedAbilityIds] = useState([]);
    const classes = useStyles();
    const { type, maxAmount = 1 } = selectCardsPrompt.selectCards;
    const selectedAbilities = abilityChoices.filter(({ instanceId }) => selectedAbilityIds.includes(instanceId));

    useEffect(() => {
        setAbilityChoices(
            getCardSelection({
                hand,
                selectCards: selectCardsPrompt.selectCards,
                selectedAbilityId: selectCardsPrompt?.abilityQueued?.selectedAbilityId,
                player,
            })
        );
    }, []);

    const handleSelectClick = () => {
        // Bug: No onDeplete event being triggered here
        if (type === SELECT_CARD_TYPES.DEPLETE_FROM_HAND) {
            onSelect({ updatedHand: hand.filter((ability: HandAbility) => !selectedAbilityIds.includes(ability.instanceId)) });
            return;
        }

        if (type === SELECT_CARD_TYPES.HAND_TO_TOP_DECK) {
            const updatedHand = [];
            const updatedDeck = [...deck];
            hand.forEach((ability: HandAbility) => {
                if (selectedAbilityIds.includes(ability.instanceId)) {
                    updatedDeck.unshift(ability);
                } else {
                    updatedHand.push(ability);
                }
            });
            onSelect({
                updatedHand,
                updatedDeck,
            });
            return;
        }

        onSelect({ updatedHand: [...hand, ...selectedAbilities] });
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
                        {type === SELECT_CARD_TYPES.HAND_TO_TOP_DECK &&
                            `Select up to ${maxAmount} ${maxAmount === 1 ? "card" : "cards"} to move to the top of the deck`}
                    </h1>
                </div>
                <div className={classes.abilityContainer}>
                    {abilityChoices.map((ability: HandAbility) => (
                        <div
                            className={classNames(classes.ability, {
                                selected: selectedAbilityIds.includes(ability.instanceId),
                            })}
                            onClick={() => {
                                if (maxAmount === 1) {
                                    setSelectedAbilityIds([ability.instanceId]);
                                    return;
                                }
                                if (selectedAbilityIds.includes(ability.instanceId)) {
                                    // Deselect if selected
                                    setSelectedAbilityIds((prev) => prev.filter((id) => id !== ability.instanceId));
                                    return;
                                }
                                if (selectedAbilityIds.length < maxAmount) {
                                    setSelectedAbilityIds((prev) => [...prev, ability.instanceId]);
                                }
                            }}
                            key={ability.instanceId}
                        >
                            <AbilityView ability={ability} deck={deck} hand={hand} discard={discard} />
                        </div>
                    ))}
                </div>
                <Button variant={"contained"} color="primary" disabled={!selectedAbilities} onClick={handleSelectClick}>
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
