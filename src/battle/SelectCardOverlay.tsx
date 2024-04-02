import classNames from "classnames";
import { useState } from "react";
import { createUseStyles } from "react-jss";
import AbilityView from "../ability/AbilityView/AbilityView";
import { CombatAbility, SELECT_CARD_TYPES } from "../ability/types";
import { Player } from "../character/types";
import { useAppDispatch } from "../hooks";
import { XIcon } from "../images/icons";
import Button from "../view/Button";
import Overlay from "../view/Overlay";
import { selectCardsAction } from "./actions/cardActions";
import { PlayerSelectCardsPrompt } from "./reducer";
import getCardSelection from "./selectCardUtils";

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
            filter: "drop-shadow(0 0 4px #45ff61) drop-shadow(0 0 4px #45ff61)",
        },
        "&.selectedForRemoval": {
            filter: "drop-shadow(0 0 4px #ff3a3a) drop-shadow(0 0 4px #ff3a3a)",
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
        filter: "drop-shadow(1px 1px 2px rgba(0, 0, 0, 1)) drop-shadow(1px 1px 2px rgba(0, 0, 0, 1))",
        opacity: 0.75,
    },
});

const SelectCardOverlay = ({
    selectCardsPrompt,
    hand,
    player,
    onSelect,
    onCancel,
    deck,
    discard,
}: {
    selectCardsPrompt: PlayerSelectCardsPrompt;
    hand: CombatAbility[];
    player: Player;
    onSelect: () => void;
    onCancel: () => void;
    deck: CombatAbility[];
    discard: CombatAbility[];
}) => {
    const [selectedAbilityIds, setSelectedAbilityIds] = useState([]);
    const classes = useStyles();
    const { selectCards, abilityQueued } = selectCardsPrompt || {};
    const { type, maxAmount: configuredMax, effects } = selectCards;
    const maxAmount = configuredMax || (type === SELECT_CARD_TYPES.DISCARD_TO_DRAW && hand?.length) || 1;
    const [abilityChoices] = useState(
        getCardSelection({
            hand,
            deck,
            discard,
            selectCards,
            selectedAbilityId: abilityQueued?.selectedAbilityId,
            player,
        })
    );

    const selectedAbilities = abilityChoices.filter(({ instanceId }) => selectedAbilityIds.includes(instanceId));
    const dispatch = useAppDispatch();
    const [hide, setHide] = useState(false);

    const handleSelectClick = () => {
        dispatch(selectCardsAction({ type, effects, selectedAbilities, player, abilityQueued }));
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
                                {type === SELECT_CARD_TYPES.DISCOVER_FROM_CLASS && "Discover an ability for your class"}
                                {type === SELECT_CARD_TYPES.SEARCH_DECK && "Pick an ability from your deck"}
                                {type === SELECT_CARD_TYPES.PRESET_CARDS && "Create an ability"}
                                {type === SELECT_CARD_TYPES.DEPLETE_FROM_HAND && "Pick an ability from your hand to deplete"}
                                {type === SELECT_CARD_TYPES.HAND_TO_TOP_DECK &&
                                    `Pick up to ${maxAmount} ${maxAmount === 1 ? "card" : "cards"} to remove from your hand`}
                                {type === SELECT_CARD_TYPES.DISCARD_TO_DRAW && "Keep or replace cards in your hand"}
                            </h2>
                        </div>
                        <div className={classes.abilityContainer}>
                            {abilityChoices.map((ability: CombatAbility) => (
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
                                    <AbilityView ability={ability} />
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
                            disabled={type !== SELECT_CARD_TYPES.DISCARD_TO_DRAW && !selectedAbilityIds.length && abilityChoices.length > 0}
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
