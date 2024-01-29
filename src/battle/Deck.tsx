import { compose } from "ramda";
import { useMemo } from "react";
import { createUseStyles } from "react-jss";
import { Ability } from "../ability/types";
import Tooltip from "../view/Tooltip";

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
        height: "100px",
        zIndex: -1,
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
});

const Deck = ({ deck = [], discard = [], depleted = [] }) => {
    const classes = useStyles();

    const getCardColor = (i: number): string => {
        const isLast = i === deck.length + discard.length - 1;
        if (i < discard.length) {
            return isLast ? COOLDOWN_COLOR : COOLDOWN_SHADOW;
        }
        return isLast ? DECK_COLOR : DECK_SHADOW;
    };

    const getAbilityMap = (items: Ability[]): { [abilityName: string]: { count: number; ability: Ability } } => {
        return items
            .slice()
            .sort((a, b) => a.name.localeCompare(b.name))
            .reduce((acc, ability) => {
                const abilityLevel = ability.level || 1;
                const levelDisplay = Array.from({ length: ability.level })
                    .map(() => "⋆")
                    .join("");
                const name = abilityLevel === 1 ? ability.name : `${ability.name} ${levelDisplay}`;
                acc[name] = {
                    ability,
                    count: (acc[name]?.count || 0) + 1,
                };
                return acc;
            }, {});
    };

    const getTooltip = (abilityMap: { [abilityName: string]: { count: number; ability: Ability } }) => {
        return (
            <ul className={classes.abilityList}>
                {Object.entries(abilityMap).map(([abilityName, { ability, count }], i) => {
                    const image = ability.image;
                    let imageNode;
                    if (typeof image === "string") {
                        imageNode = <img src={image} className={classes.abilityIcon} />;
                    } else if (typeof image === "function") {
                        const ImageNode = image as Function;
                        imageNode = <ImageNode className={classes.abilityIcon} />;
                    }

                    return (
                        <li key={abilityName} className={classes.abilityItem}>
                            {imageNode} {abilityName} x{count}
                        </li>
                    );
                })}
            </ul>
        );
    };

    const deckCount = useMemo(() => compose(getTooltip, getAbilityMap)(deck), [deck]);
    const discardCount = useMemo(() => compose(getTooltip, getAbilityMap)(discard), [discard]);
    const depletedCount = useMemo(() => compose(getTooltip, getAbilityMap)(depleted), [depleted]);

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
            <Tooltip title={deckTooltip} placement={"right"}>
                <div className={classes.deckContainer}>
                    <svg viewBox="0 0 100 100" className={classes.svg}>
                        {Array.from({ length: deck.length + discard.length }).map((_, i) => {
                            return (
                                <svg key={i} y={i * -2 + 75} viewBox="0 0 100 100">
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

            {discard.length > 0 && (
                <Tooltip title={discardTooltip} placement={"right"}>
                    <div className={classes.onCooldown}>Discard: {discard.length}</div>
                </Tooltip>
            )}

            {depleted.length > 0 && (
                <Tooltip title={depleteTooltip} placement={"right"}>
                    <div className={classes.depleted}>Depleted: {depleted.length}</div>
                </Tooltip>
            )}
        </div>
    );
};

export default Deck;
