import { compose } from "ramda";
import { FC, useEffect, useMemo, useRef, useState } from "react";
import { createUseStyles } from "react-jss";
import { CombatAbility } from "../ability/types";
import Tooltip from "../view/Tooltip";
import classNames from "classnames";
import { DownArrowImage } from "../images";
import { getAbilityLevel, getAbilityMap } from "./deckDisplayUtils";
import { useAppSelector } from "../hooks";

const DECK_COLOR = "#176fbd";
const DECK_SHADOW = "#125896";

const useStyles = createUseStyles({
    root: {
        position: "relative",
        width: "100px",
        "& svg": {
            left: 0,
            position: "absolute",
        },
    },
    deckContainer: {
        position: "relative",
    },
    deckContainerInner: {
        height: "100px",
        top: "16px",
    },
    svg: {
        overflow: "visible",
    },
    abilityList: {
        margin: 0,
        padding: 0,
        listStyle: "none",
    },
    abilityItem: {
        marginBottom: "2px",
    },
    abilityIcon: {
        width: "24px",
        maxHeight: "24px",
        verticalAlign: "bottom",
    },
    tooltipTitle: {
        textAlign: "center",
        fontWeight: "bold",
        marginBottom: "4px",
    },
    "@keyframes indicatorAnimation": {
        "0%": {
            transform: "translateX(-50%) translateY(50%)",
        },
        "100%": {
            transform: "translateX(-50%) translateY(0)",
        },
    },
    indicator: {
        animationName: "$indicatorAnimation",
        animationDuration: "1.5s",
        animationIterationCount: "infinite",
        animationDirection: "alternate-reverse",
        position: "absolute",
        left: "50%",
        transform: "translateX(-50%)",
        top: "-20%",
    },
    "@keyframes highlightAnimation": {
        from: {
            filter: "drop-shadow(0 0 1px #45ff61) drop-shadow(0 0 1px #45ff61)",
        },
        to: {
            filter: "drop-shadow(0 0 5px #45ff61) drop-shadow(0 0 5px #45ff61)",
        },
    },
    highlight: {
        animationName: "$highlightAnimation",
        animationDuration: "2s",
        animationIterationCount: "infinite",
        animationDirection: "alternate-reverse",
    },
});

const DECK_SIZE_CHANGE_SPEED = 50; // ms

const Deck = ({
    viewDeckInOrder,
    onMouseDown,
    highlightDeck,
    deckRef,
}: {
    viewDeckInOrder: boolean;
    onMouseDown?: (event: any) => void;
    highlightDeck: boolean;
    deckRef;
}) => {
    const classes = useStyles();
    const { battle } = useAppSelector((state) => state);
    const { deck, deckCycled }: { deck: CombatAbility[]; deckCycled: boolean } = battle;
    const [deckSize, setDeckSize] = useState(deck.length); // This is purely for display animation purposes

    useEffect(() => {
        // animationCanvas.ts is playing the deck recycle animation. Don't update the deck until it's done.
        if (deckCycled) {
            setDeckSize(0);
            return;
        }

        if (deckSize < deck.length) {
            setTimeout(() => {
                setDeckSize((prev) => prev + 1);
            }, DECK_SIZE_CHANGE_SPEED);
        } else if (deckSize > deck.length) {
            setTimeout(() => {
                setDeckSize((prev) => prev - 1);
            }, DECK_SIZE_CHANGE_SPEED);
        }
    }, [deck, deckCycled, deckSize]);

    const getCardColor = (i: number): string => {
        const isLast = i === deckSize - 1;
        return isLast ? DECK_COLOR : DECK_SHADOW;
    };

    const getImage = (ability: CombatAbility) => {
        const image = ability.image;
        let imageNode;
        if (typeof image === "string") {
            imageNode = <img src={image} className={classes.abilityIcon} />;
        } else if (typeof image === "function") {
            const ImageNode: FC<{ className?: string }> = image;
            imageNode = <ImageNode className={classes.abilityIcon} />;
        }

        return imageNode;
    };

    const getAbilityMapTooltip = (abilityMap: { [abilityName: string]: { count: number; ability: CombatAbility } }) => {
        return (
            <ul className={classes.abilityList}>
                {Object.entries(abilityMap).map(([abilityName, { ability, count }]) => {
                    const imageNode = getImage(ability);

                    return (
                        <li key={abilityName} className={classes.abilityItem}>
                            {imageNode} {abilityName} {count > 1 && `x${count}`}
                        </li>
                    );
                })}
            </ul>
        );
    };

    const getInOrderTooltip = (abilities: CombatAbility[]) => {
        return (
            <ul className={classes.abilityList}>
                {abilities.map((ability, i) => {
                    const imageNode = getImage(ability);
                    return (
                        <li key={ability.instanceId || i} className={classes.abilityItem}>
                            {imageNode} {ability.name} {getAbilityLevel(ability)}
                        </li>
                    );
                })}
            </ul>
        );
    };

    const deckCount = useMemo(() => {
        if (viewDeckInOrder) {
            return getInOrderTooltip(deck);
        }

        return compose(getAbilityMapTooltip, getAbilityMap)(deck);
    }, [deck, viewDeckInOrder]);

    const deckTooltip = (
        <div>
            <div className={classes.tooltipTitle}>Deck</div>
            {deckCount}
        </div>
    );

    return (
        <div className={classes.root}>
            <div className={classes.deckContainer}>
                <Tooltip title={deckTooltip} placement={"right"}>
                    <div
                        className={classNames(classes.deckContainerInner, {
                            [classes.highlight]: highlightDeck,
                        })}
                        onMouseDown={onMouseDown}
                        ref={deckRef}
                    >
                        <svg viewBox="0 0 100 100" className={classes.svg}>
                            {Array.from({ length: deckSize }).map((_, i) => {
                                return (
                                    <svg key={[getCardColor(i), i].join("-")} y={i * -2 + 75} viewBox="0 0 100 100">
                                        <path fill={getCardColor(i)} d="M 50 0 100 25 50 50 0 25 Z" />
                                        {i === deckSize - 1 && (
                                            <text fill="rgba(255, 255, 255, 0.8)" x="50" fontSize="26px" y="35" textAnchor="middle">
                                                {deckSize}
                                            </text>
                                        )}
                                    </svg>
                                );
                            })}
                            {deckSize === 0 && (
                                <svg y={75} viewBox="0 0 100 100">
                                    <path fill={DECK_SHADOW} d="M 50 0 100 25 50 50 0 25 Z" opacity={0.5} />
                                    <text fill="rgba(255, 255, 255, 0.8)" x="50" fontSize="26px" y="35" textAnchor="middle">
                                        {deckSize}
                                    </text>
                                </svg>
                            )}
                        </svg>
                    </div>
                </Tooltip>
                {highlightDeck && <img src={DownArrowImage} className={classes.indicator} />}
            </div>
        </div>
    );
};

export default Deck;
