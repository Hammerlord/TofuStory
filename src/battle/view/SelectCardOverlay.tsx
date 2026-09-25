import classNames from "classnames";
import { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
import AbilityView from "../../ability/AbilityView/AbilityView";
import { CombatAbility, SELECT_CARD_TYPES } from "../../ability/types";
import { Player } from "../../character/types";
import { useAppDispatch } from "../../hooks";
import { XIcon } from "../../images/icons";
import Button from "../../view/Button";
import Overlay from "../../view/Overlay";
import { PlayerSelectCardsPrompt } from "../types";
import getCardSelection from "../selectCardUtils";
import { AshesImage } from "../../images";
import { Box } from "@mui/material";
import { selectCardsAction } from "../actions/cardActions/selectCards";
import { CARD_SELECTION_KEYBINDS, useCardSelection } from "../../hooks/useCardSelection";

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
    },
    selected: {
        filter: "drop-shadow(0 0 4px #45ff61) drop-shadow(0 0 4px #45ff61)",
    },
    selectedForRemoval: {
        filter: "drop-shadow(0 0 4px #ff3a3a) drop-shadow(0 0 4px #ff3a3a)",
    },
    // Target-reticle frame shown around the card currently focused by the keyboard
    // arrows. Uses the battle targeting red so it reads as "aimed at", distinct from
    // the green selection glow or the red removal X.
    reticle: {
        position: "absolute",
        inset: "-8px",
        pointerEvents: "none",
        zIndex: 10,
        animation: "$reticlePulse 1.4s ease-in-out infinite",
    },
    reticleCorner: {
        position: "absolute",
        width: "26px",
        height: "26px",
        border: "3px solid #d3d3d3",
        filter: "drop-shadow(0 0 3px rgba(0, 0, 0, 0.9))",
    },
    reticleTopLeft: {
        top: 0,
        left: 0,
        borderRight: "none",
        borderBottom: "none",
        borderTopLeftRadius: 10,
    },
    reticleTopRight: {
        top: 0,
        right: 0,
        borderLeft: "none",
        borderBottom: "none",
        borderTopRightRadius: 10,
    },
    reticleBottomLeft: {
        bottom: 0,
        left: 0,
        borderRight: "none",
        borderTop: "none",
        borderBottomLeftRadius: 10,
    },
    reticleBottomRight: {
        bottom: 0,
        right: 0,
        borderLeft: "none",
        borderTop: "none",
        borderBottomRightRadius: 10,
    },
    "@keyframes reticlePulse": {
        "0%": {
            opacity: 1,
        },
        "50%": {
            opacity: 0.55,
        },
        "100%": {
            opacity: 1,
        },
    },
    cardIndex: {
        position: "absolute",
        bottom: "100%",
        left: "50%",
        transform: "translateX(-50%)",
        marginBottom: 4,
        fontSize: "0.95rem",
        fontWeight: 700,
        lineHeight: "1.2",
        color: "rgba(255, 255, 255, 0.95)",
        textShadow: Array.from({ length: 10 })
            .map(() => "0 0 2px black")
            .join(", "),
        userSelect: "none",
        pointerEvents: "none",
        whiteSpace: "nowrap",
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
        width: `125px`,
        zIndex: 10,
        filter: "drop-shadow(1px 1px 2px rgba(0, 0, 0, 1)) drop-shadow(1px 1px 2px rgba(0, 0, 0, 1))",
        opacity: 0.75,
    },
});

// Keybinds shared between the keydown handling and the on-screen button hints.
// The confirm/cancel bindings live in useCardSelection; only the overlay-specific
// toggle binding is defined here.
const OVERLAY_KEYBINDS = {
    toggle: { key: "q", hint: "Q" },
    confirm: CARD_SELECTION_KEYBINDS.confirm,
    cancel: CARD_SELECTION_KEYBINDS.cancel,
} as const;

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
    const classes = useStyles();
    const { selectCards, abilityQueued } = selectCardsPrompt || {};
    const { type, maxAmount: configuredMax, effects } = selectCards;
    const [abilityChoices] = useState(
        getCardSelection({
            hand,
            deck,
            discard,
            selectCards,
            selectedAbilityId: abilityQueued?.selectedAbilityId,
            player,
        }),
    );
    const maxAmount =
        configuredMax || (type === SELECT_CARD_TYPES.DISCARD_TO_DRAW && hand?.length) || 1;
    const dispatch = useAppDispatch();
    const [hide, setHide] = useState(false);

    const handleSelectClick = () => {
        dispatch(
            selectCardsAction({
                type,
                effects,
                selectedAbilities: selectedItems,
                player,
                abilityQueued: abilityQueued?.selectedAbility,
            }),
        );
        onSelect();
    };

    const preselectLoneOption = type !== SELECT_CARD_TYPES.DISCARD_TO_DRAW;

    const {
        selectedIds,
        selectedItems,
        currentIndex,
        focusSource,
        isConfirmDisabled,
        isSelected,
        handleCardClick,
        handleConfirm,
    } = useCardSelection({
        items: abilityChoices,
        maxAmount,
        onConfirm: handleSelectClick,
        isConfirmDisabled: (selectedIds) =>
            type !== SELECT_CARD_TYPES.DISCARD_TO_DRAW &&
            !selectedIds.length &&
            abilityChoices.length > 0,
        onCancel,
        // Only Deplete from hand can be safely backed out of mid-selection
        cancelable: type === SELECT_CARD_TYPES.DEPLETE_FROM_HAND,
        enabled: !hide,
        getId: (ability: CombatAbility) => ability.instanceId,
        preselectLoneOption,
    });

    const isSelectedForRemoval = (instanceId: string): boolean => {
        return (
            [
                SELECT_CARD_TYPES.DEPLETE_FROM_HAND,
                SELECT_CARD_TYPES.DISCARD_TO_DRAW,
                SELECT_CARD_TYPES.HAND_TO_TOP_DECK,
            ].includes(type) && selectedIds.includes(instanceId)
        );
    };

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.repeat) {
                return;
            }
            if (e.key.toLowerCase() === OVERLAY_KEYBINDS.toggle.key) {
                e.preventDefault();
                setHide((prev) => !prev);
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, []);

    return (
        <>
            {!hide && (
                <Overlay>
                    <div className={classes.inner}>
                        <div className={classes.titleContainer}>
                            <h2>
                                {type === SELECT_CARD_TYPES.COPY_FROM_HAND &&
                                    "Pick an ability from your hand to copy"}
                                {type === SELECT_CARD_TYPES.DISCOVER_FROM_CLASS &&
                                    "Discover an ability for your class"}
                                {type === SELECT_CARD_TYPES.SEARCH_DECK &&
                                    "Pick an ability from your deck"}
                                {type === SELECT_CARD_TYPES.PRESET_CARDS && "Create an ability"}
                                {type === SELECT_CARD_TYPES.DEPLETE_FROM_HAND &&
                                    "Pick an ability from your hand to deplete"}
                                {type === SELECT_CARD_TYPES.HAND_TO_TOP_DECK &&
                                    `Pick up to ${maxAmount} ${maxAmount === 1 ? "card" : "cards"} to remove from your hand`}
                                {type === SELECT_CARD_TYPES.DISCARD_TO_DRAW &&
                                    "Keep or replace cards in your hand"}
                            </h2>
                        </div>
                        <div className={classes.abilityContainer}>
                            {abilityChoices.map((ability: CombatAbility, i: number) => (
                                <div
                                    className={classes.ability}
                                    onClick={() => handleCardClick(ability, i)}
                                    key={ability.instanceId}
                                >
                                    <span className={classes.cardIndex}>{(i + 1) % 10}</span>
                                    <AbilityView
                                        ability={ability}
                                        className={classNames({
                                            [classes.selected]: isSelected(ability, i),
                                            [classes.selectedForRemoval]: isSelectedForRemoval(
                                                ability.instanceId,
                                            ),
                                        })}
                                    />
                                    {focusSource === "keyboard" && currentIndex === i && (
                                        <div className={classes.reticle}>
                                            <span
                                                className={classNames(
                                                    classes.reticleCorner,
                                                    classes.reticleTopLeft,
                                                )}
                                            />
                                            <span
                                                className={classNames(
                                                    classes.reticleCorner,
                                                    classes.reticleTopRight,
                                                )}
                                            />
                                            <span
                                                className={classNames(
                                                    classes.reticleCorner,
                                                    classes.reticleBottomLeft,
                                                )}
                                            />
                                            <span
                                                className={classNames(
                                                    classes.reticleCorner,
                                                    classes.reticleBottomRight,
                                                )}
                                            />
                                        </div>
                                    )}
                                    {isSelectedForRemoval(ability.instanceId) && (
                                        <div className={classes.x}>
                                            <XIcon />
                                        </div>
                                    )}
                                </div>
                            ))}
                            {!abilityChoices.length && (
                                <Box>
                                    <img src={AshesImage} />{" "}
                                    <Box sx={{ marginTop: "2rem", color: "white" }}>
                                        There were no cards...
                                    </Box>
                                </Box>
                            )}
                        </div>
                        <Button
                            variant={"contained"}
                            color="primary"
                            disabled={isConfirmDisabled}
                            onClick={handleConfirm}
                        >
                            Confirm [{OVERLAY_KEYBINDS.confirm.hint}]
                        </Button>
                        {/** You can only safely back out of Deplete from hand. This is currently a trap for other select types as you lose the card otherwise. */}
                        {type === SELECT_CARD_TYPES.DEPLETE_FROM_HAND && (
                            <div className={classes.cancel}>
                                <Button variant={"contained"} onClick={onCancel}>
                                    Cancel [{OVERLAY_KEYBINDS.cancel.hint}]
                                </Button>
                            </div>
                        )}
                    </div>
                </Overlay>
            )}
            <div className={classes.toggleOverlayButton}>
                <Button color="secondary" onClick={() => setHide((prev) => !prev)}>
                    {hide ? "Show" : "Hide"} Overlay [{OVERLAY_KEYBINDS.toggle.hint}]
                </Button>
            </div>
        </>
    );
};

export default SelectCardOverlay;
