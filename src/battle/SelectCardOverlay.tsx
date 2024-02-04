import classNames from "classnames";
import { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
import AbilityView from "../ability/AbilityView/AbilityView";
import { Ability, HandAbility, SELECT_CARD_TYPES } from "../ability/types";
import { useAppDispatch } from "../hooks";
import Button from "../view/Button";
import Overlay from "../view/Overlay";
import { drawCards } from "./actions/actions";
import { prepareForDiscard } from "./actions/playerTurn";
import { PlayerSelectCardsPrompt, battleStateSlice } from "./reducer";
import getCardSelection from "./selectCardUtils";
import { XIcon } from "../images/icons";

const useStyles = createUseStyles({
    inner: {
        position: "absolute",
        top: "45%",
        left: "50%",
        transform: "translateX(-50%) translateY(-50%)",
        textAlign: "center",
        width: "100%",
    },
    titleContainer: {
        display: "inline-block",
        background:
            "linear-gradient(90deg, rgba(0,212,255,0) 0%, rgba(0,0,0,0.75) 30%, rgba(0,0,0,0.75) 50%, rgba(0,0,0,0.75) 70%, rgba(0,212,255,0) 100%)",
        padding: "8px 200px",
        color: "white",
        marginBottom: "24px",
    },
    abilityContainer: {
        margin: "80px 0",
        verticalAlign: "top",
    },
    ability: {
        display: "inline-block",
        margin: "0 24px",
        verticalAlign: "bottom",
        position: "relative",
        "&.selected": {
            boxShadow: "0 0 8px 4px #45ff61",
        },
        "&.selectedForRemoval": {
            boxShadow: "0 0 8px 4px #ff3a3a",
        },
    },
    cancel: {
        marginTop: "2rem",
    },
    toggleOverlayButton: {
        position: "fixed",
        top: "13%",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1000,
    },
    x: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translateX(-50%) translateY(-50%)",
        width: 125,
        zIndex: 10,
        webkitFilter: "drop-shadow(1px 1px 2px rgba(0, 0, 0, 1)) drop-shadow(1px 1px 2px rgba(0, 0, 0, 1))",
        filter: "drop-shadow(1px 1px 2px rgba(0, 0, 0, 1)) drop-shadow(1px 1px 2px rgba(0, 0, 0, 1))",
        opacity: 0.75,
    },
});

const { updateBattle } = battleStateSlice?.actions || {};

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
    onSelect: () => void;
    player: any;
    onCancel: () => void;
    deck: Ability[];
    discard: Ability[];
}) => {
    const [abilityChoices, setAbilityChoices] = useState([]);
    const [selectedAbilityIds, setSelectedAbilityIds] = useState([]);
    const classes = useStyles();
    const { selectCards, abilityQueued } = selectCardsPrompt || {};
    const { type, maxAmount: configuredMax } = selectCards;
    const maxAmount = configuredMax || (type === SELECT_CARD_TYPES.DISCARD_TO_DRAW && hand?.length) || 1;
    const selectedAbilities = abilityChoices.filter(({ instanceId }) => selectedAbilityIds.includes(instanceId));
    const dispatch = useAppDispatch();
    const [hide, setHide] = useState(false);

    useEffect(() => {
        setAbilityChoices(
            getCardSelection({
                hand,
                selectCards,
                selectedAbilityId: abilityQueued?.selectedAbilityId,
                player,
            })
        );
    }, []);

    const handleSelectClick = () => {
        // Bug: No onDeplete event being triggered here
        if (type === SELECT_CARD_TYPES.DEPLETE_FROM_HAND) {
            dispatch(
                updateBattle({
                    hand: hand.filter((ability: HandAbility) => !selectedAbilityIds.includes(ability.instanceId)),
                })
            );
        } else if (type === SELECT_CARD_TYPES.HAND_TO_TOP_DECK) {
            const updatedHand = [];
            const updatedDeck = [...deck];
            hand.forEach((ability: HandAbility) => {
                if (selectedAbilityIds.includes(ability.instanceId)) {
                    updatedDeck.unshift(ability);
                } else {
                    updatedHand.push(ability);
                }
            });

            dispatch(
                updateBattle({
                    hand: updatedHand,
                    deck: updatedDeck,
                })
            );
        } else if (type === SELECT_CARD_TYPES.DISCARD_TO_DRAW) {
            const updatedHand = [];
            const updatedDiscard = [...discard];
            hand.forEach((ability: HandAbility) => {
                if (selectedAbilityIds.includes(ability.instanceId)) {
                    updatedDiscard.unshift(...prepareForDiscard([ability]));
                } else {
                    updatedHand.push(ability);
                }
            });
            dispatch(
                updateBattle({
                    hand: updatedHand,
                    discard: updatedDiscard,
                })
            );
            dispatch(drawCards({ amount: selectedAbilityIds.length }));
        } else {
            dispatch(
                updateBattle({
                    hand: [...hand, ...selectedAbilities],
                })
            );
        }

        onSelect();
    };

    const isSelectedForRemoval = (instanceId: string): boolean => {
        return (
            [SELECT_CARD_TYPES.DEPLETE_FROM_HAND, SELECT_CARD_TYPES.DISCARD_TO_DRAW, SELECT_CARD_TYPES.HAND_TO_TOP_DECK].includes(type) &&
            selectedAbilityIds.includes(instanceId)
        );
    };

    return (
        <>
            {!hide && (
                <Overlay>
                    <div className={classes.inner}>
                        <div className={classes.titleContainer}>
                            <h2>
                                {type === SELECT_CARD_TYPES.COPY_FROM_HAND && "Pick an ability from your hand to copy"}
                                {type === SELECT_CARD_TYPES.DISCOVER_FROM_CLASS && "Discover an ability"}
                                {type === SELECT_CARD_TYPES.PRESET_CARDS && "Create an ability"}
                                {type === SELECT_CARD_TYPES.DEPLETE_FROM_HAND && "Pick an ability from your hand to deplete"}
                                {type === SELECT_CARD_TYPES.HAND_TO_TOP_DECK &&
                                    `Select up to ${maxAmount} ${maxAmount === 1 ? "card" : "cards"} to move to the top of the deck`}
                                {type === SELECT_CARD_TYPES.DISCARD_TO_DRAW && "Keep or replace cards in your hand"}
                            </h2>
                        </div>
                        <div className={classes.abilityContainer}>
                            {abilityChoices.map((ability: HandAbility) => (
                                <div
                                    className={classNames(classes.ability, {
                                        selected: selectedAbilityIds.includes(ability.instanceId),
                                        selectedForRemoval: isSelectedForRemoval(ability.instanceId),
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
                                    {isSelectedForRemoval(ability.instanceId) && (
                                        <div className={classes.x}>
                                            <XIcon />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <Button
                            variant={"contained"}
                            color="primary"
                            disabled={type !== SELECT_CARD_TYPES.DISCARD_TO_DRAW && !selectedAbilities}
                            onClick={handleSelectClick}
                        >
                            Confirm
                        </Button>
                        {/** You can only safely back out of Deplete from hand. This is currently a trap for other select types as you lose the card otherwise. */}
                        {type === SELECT_CARD_TYPES.DEPLETE_FROM_HAND && (
                            <div className={classes.cancel}>
                                <Button variant={"contained"} onClick={onCancel}>
                                    Cancel
                                </Button>
                            </div>
                        )}
                    </div>
                </Overlay>
            )}
            <div className={classes.toggleOverlayButton}>
                <Button color="secondary" onClick={() => setHide((prev) => !prev)}>
                    {hide ? "Show" : "Hide"} Overlay
                </Button>
            </div>
        </>
    );
};

export default SelectCardOverlay;
