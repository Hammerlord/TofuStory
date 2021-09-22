import { compose } from "ramda";
import { useMemo } from "react";
import { createUseStyles } from "react-jss";
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
    },
    deckContainer: {
        height: "100px",
        zIndex: -1,
        top: "16px",
    },
    svg: {
        overflow: "visible",
    },
});

const Deck = ({ deck, discard }) => {
    const classes = useStyles();

    const getCardColor = (i: number): string => {
        const isLast = i === deck.length + discard.length - 1;
        if (i < discard.length) {
            return isLast ? COOLDOWN_COLOR : COOLDOWN_SHADOW;
        }
        return isLast ? DECK_COLOR : DECK_SHADOW;
    };

    const getCountMap = (items: { name: string }[]) => {
        return items
            .sort((a, b) => a.name.localeCompare(b.name))
            .reduce((acc, item) => {
                acc[item.name] = (acc[item.name] || 0) + 1;
                return acc;
            }, {});
    };

    const getTooltip = (count) => {
        return Object.entries(count).map(([abilityName, count], i) => (
            <div key={i}>
                {abilityName} x{count}
            </div>
        ));
    };

    const deckCount = useMemo(() => compose(getTooltip, getCountMap)(deck), [deck]);
    const discardCount = useMemo(() => compose(getTooltip, getCountMap)(discard), [discard]);

    return (
        <div className={classes.root}>
            <Tooltip title={deckCount} placement={"right"}>
                <div className={classes.deckContainer}>
                    <svg viewBox="0 0 100 100" className={classes.svg}>
                        {Array.from({ length: deck.length + discard.length }).map((_, i) => {
                            return (
                                <svg key={i} y={i * -5 + 75} viewBox="0 0 100 100">
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

            <Tooltip title={discardCount} placement={"right"}>
                <div className={classes.onCooldown}>Cooldown: {discard.length}</div>
            </Tooltip>
        </div>
    );
};

export default Deck;
