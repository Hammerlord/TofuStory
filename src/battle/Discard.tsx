import { compose } from "ramda";
import { useEffect, useMemo, useState } from "react";
import { createUseStyles } from "react-jss";
import { CombatAbility } from "../ability/types";
import Tooltip from "../view/Tooltip";
import classNames from "classnames";
import { getAbilityMap } from "./deckDisplayUtils";

const COOLDOWN_COLOR = "#aaaaaa";
const COOLDOWN_SHADOW = "#8a8a8a";

const useStyles = createUseStyles({
    root: {
        position: "relative",
        width: "100px",
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
        bottom: "-70px",
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
    hide: {
        visibility: "hidden",
    },
});

const DECK_SIZE_CHANGE_SPEED = 50; // ms

const Discard = ({ discard = [], depleted = [], discardRef, depleteRef }) => {
    const classes = useStyles();
    const [discardSize, setDiscardSize] = useState(discard.length); // This is purely for display animation purposes

    useEffect(() => {
        if (discardSize < discard.length) {
            setTimeout(() => {
                setDiscardSize((prev) => prev + 1);
            }, DECK_SIZE_CHANGE_SPEED);
        } else if (discardSize > discard.length) {
            setTimeout(() => {
                setDiscardSize((prev) => prev - 1);
            }, DECK_SIZE_CHANGE_SPEED);
        }
    }, [discard, discardSize]);

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

    const discardCount = useMemo(() => compose(getAbilityMapTooltip, getAbilityMap)(discard), [discard]);
    const depletedCount = useMemo(() => compose(getAbilityMapTooltip, getAbilityMap)(depleted), [depleted]);

    const getCardColor = (i: number): string => {
        const isLast = i === discardSize - 1;
        return isLast ? COOLDOWN_COLOR : COOLDOWN_SHADOW;
    };

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
                <Tooltip title={discardTooltip} placement={"right"}>
                    <div ref={discardRef} className={classes.deckContainerInner}>
                        <svg viewBox="0 0 100 100" className={classes.svg}>
                            {Array.from({ length: discardSize }).map((_, i) => {
                                return (
                                    <svg key={[getCardColor(i), i].join("-")} y={i * -2 + 75} viewBox="0 0 100 100">
                                        <path fill={getCardColor(i)} d="M 50 0 100 25 50 50 0 25 Z" />
                                        {i === discardSize - 1 && (
                                            <text fill="rgba(255, 255, 255, 0.8)" x="50" fontSize="26px" y="35" textAnchor="middle">
                                                {discardSize}
                                            </text>
                                        )}
                                    </svg>
                                );
                            })}
                        </svg>
                    </div>
                </Tooltip>
            </div>

            <Tooltip title={depleteTooltip} placement={"right"}>
                <div
                    className={classNames(classes.depleted, {
                        [classes.hide]: !depleted.length,
                    })}
                    ref={depleteRef}
                >
                    Depleted: {depleted.length}
                </div>
            </Tooltip>
        </div>
    );
};

export default Discard;
