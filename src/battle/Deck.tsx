import { compose } from "ramda";
import { useMemo } from "react";
import { createUseStyles } from "react-jss";
import { CombatAbility } from "../ability/types";
import Tooltip from "../view/Tooltip";
import classNames from "classnames";
import { ArrowDownIcon } from "../images/icons";
import { DownArrowImage } from "../images";

const DECK_COLOR = "#176fbd";
const DECK_SHADOW = "#125896";
const COOLDOWN_COLOR = "#aaaaaa";
const COOLDOWN_SHADOW = "#8a8a8a";

const useStyles = createUseStyles({
    root: {
        position: "relative",
        width: "100px",
        minHeight: "125px",
        "& svg": {
            left: 0,
            position: "absolute",
        },
    },
    onCooldown: {
        position: "absolute",
        bottom: "-36px",
        zIndex: 3,
        textAlign: "center",
        width: "100%",
        background: "#999999",
        color: "white",
        padding: "4px 0",
        borderRadius: "4px",
    },
    depleted: {
        position: "absolute",
        bottom: "-72px",
        zIndex: 3,
        textAlign: "center",
        width: "100%",
        background: "rgba(0, 0, 0, 0.7)",
        color: "rgba(255, 255, 255, 0.8)",
        padding: "4px 0",
        borderRadius: "4px",
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

const Deck = ({
    deck = [],
    discard = [],
    depleted = [],
    viewDeckInOrder,
    onClickDeck,
    highlightDeck,
    deckRef,
    discardRef,
    depleteRef,
}: {
    deck: CombatAbility[];
    discard: CombatAbility[];
    depleted: CombatAbility[];
    viewDeckInOrder: boolean;
    onClickDeck: (event: any) => void;
    highlightDeck: boolean;
    deckRef;
    discardRef;
    depleteRef;
}) => {
    const classes = useStyles();

    const getCardColor = (i: number): string => {
        const isLast = i === deck.length + discard.length - 1;
        if (i < discard.length) {
            return isLast ? COOLDOWN_COLOR : COOLDOWN_SHADOW;
        }
        return isLast ? DECK_COLOR : DECK_SHADOW;
    };

    const getAbilityLevel = (ability) => {
        const numStars = ability.level > 1 ? ability.level : 0;
        return Array.from({ length: numStars })
            .map(() => "⋆")
            .join("");
    };

    const getAbilityMap = (items: CombatAbility[]): { [abilityName: string]: { count: number; ability: CombatAbility } } => {
        return items
            .slice()
            .sort((a, b) => a.name.localeCompare(b.name))
            .reduce((acc, ability) => {
                const abilityLevel = ability.level || 1;
                const levelDisplay = getAbilityLevel(ability);
                const name = abilityLevel === 1 ? ability.name : `${ability.name} ${levelDisplay}`;
                acc[name] = {
                    ability,
                    count: (acc[name]?.count || 0) + 1,
                };
                return acc;
            }, {});
    };

    const getImage = (ability: CombatAbility) => {
        const image = ability.image;
        let imageNode;
        if (typeof image === "string") {
            imageNode = <img src={image} className={classes.abilityIcon} />;
        } else if (typeof image === "function") {
            const ImageNode = image as Function;
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
    const discardCount = useMemo(() => compose(getAbilityMapTooltip, getAbilityMap)(discard), [discard]);
    const depletedCount = useMemo(() => compose(getAbilityMapTooltip, getAbilityMap)(depleted), [depleted]);

    const deckTooltip = (
        <div>
            <div className={classes.tooltipTitle}>Deck</div>
            {deckCount}
        </div>
    );

    const discardTooltip = (
        <div>
            <div className={classes.tooltipTitle}>Discard</div>
            {discardCount}
        </div>
    );

    const depleteTooltip = (
        <div>
            <div className={classes.tooltipTitle}>Depleted</div>
            {depletedCount}
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
                        onClick={onClickDeck}
                        ref={deckRef}
                    >
                        <svg viewBox="0 0 100 100" className={classes.svg}>
                            {Array.from({ length: deck.length + discard.length }).map((_, i) => {
                                return (
                                    <svg key={[getCardColor(i), i].join("-")} y={i * -2 + 75} viewBox="0 0 100 100">
                                        <path fill={getCardColor(i)} d="M 50 0 100 25 50 50 0 25 Z" />
                                        {i === deck.length + discard.length - 1 && (
                                            <text fill="rgba(255, 255, 255, 0.8)" x="50" fontSize="26px" y="35" textAnchor="middle">
                                                {deck.length}
                                            </text>
                                        )}
                                    </svg>
                                );
                            })}
                        </svg>
                    </div>
                </Tooltip>
                {highlightDeck && <img src={DownArrowImage} className={classes.indicator} />}
            </div>

            <Tooltip title={discardTooltip} placement={"right"}>
                <div className={classes.onCooldown} ref={discardRef}>
                    Discard: {discard.length}
                </div>
            </Tooltip>

            <Tooltip title={depleteTooltip} placement={"right"}>
                <div className={classes.depleted} ref={depleteRef}>
                    Depleted: {depleted.length}
                </div>
            </Tooltip>
        </div>
    );
};

export default Deck;
