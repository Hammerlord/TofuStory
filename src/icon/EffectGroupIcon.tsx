import classNames from "classnames";
import { createUseStyles } from "react-jss";
import { CombatEffect, EFFECT_CLASSES, TRIGGER_TARGET_TYPES } from "../ability/types";
import { passesConditions } from "../battle/passesConditions";
import { Combatant, Player } from "../character/types";
import { CrossedSwordsIcon, HeartIcon, HourglassIcon, ShieldIcon } from "../images/icons";

import Handlebars from "handlebars";
import _ from "lodash";
import { useEffect, useRef } from "react";
import { resourceClassNameMap } from "../ability/AbilityView/constants";
import { findCombatantData } from "../battle/actions/actions";
import { isTurnToTrigger } from "../battle/utils";
import { playExpandContractAnimation } from "../character/animations";
import { BUFF_COLOUR, DEBUFF_COLOUR } from "../character/effects/constants";
import { useAppSelector } from "../hooks";
import Tooltip from "../view/Tooltip";
import Icon from "./Icon";

const indicatorSize = 8;

const useStyles = createUseStyles({
    iconRoot: {
        position: "relative",
        display: "inline-block",
        margin: "4px 3px",
        border: `1px solid ${BUFF_COLOUR}`,
        borderRadius: "2px",
        background: "rgba(0, 0, 0, 0.75)",
        padding: "1px",
        verticalAlign: "bottom",
        "&.debuff": {
            borderColor: DEBUFF_COLOUR,
        },
        "&.disabled": {
            background: "rgba(0, 0, 0, 0.15)",
        },
    },
    iconInner: {
        display: "inline-block",
    },
    iconText: {
        position: "absolute",
        textShadow: Array.from({ length: 10 })
            .map(() => "0 0 2px black")
            .join(", "),
        fontWeight: "bold",
        zIndex: "3",
        color: "white",
    },
    primaryIcon: {
        filter: "drop-shadow(0px 0px 1px rgba(0, 0, 0, 1)) drop-shadow(0px 0px 1px rgba(0, 0, 0, 1))",
    },
    stacks: {
        bottom: -1,
        left: 1,
        fontSize: "14px",
    },
    duration: {
        position: "absolute",
        top: -5,
        right: -6,
        filter: "drop-shadow(0 0 1px rgba(0, 0, 0, 1)) drop-shadow(0 0 1px rgba(0, 0, 0, 0.75))",
    },
    extraText: {
        position: "absolute",
        top: 0,
        right: 3,
        color: "white",
        fontWeight: "bold",
        textShadow: Array.from({ length: 10 })
            .map(() => "0 0 3px black")
            .join(", "),
    },
    tooltipContents: {
        display: "flex",
    },
    tooltipTitle: {
        fontSize: "1.1rem",
        marginBottom: "4px",
    },
    container: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
    },
    iconContainer: {
        marginRight: "16px",
    },
    disabled: {
        opacity: 0.7,
        filter: "saturate(0%)",
    },
    "@keyframes fade": {
        "0%": {
            opacity: 0,
        },
        "100%": {
            opacity: 0.8,
        },
    },
    silenced: {
        marginTop: 8,
        color: "#ff9b94",
    },
    silenceIcon: {
        animationName: "$fade",
        animationDuration: "1.5s",
        animationIterationCount: "infinite",
        animationDirection: "alternate-reverse",
        position: "absolute",
        display: "inline-block",
        left: 0,
        top: 0,
    },
    "@keyframes glow": {
        "0%": {
            filter: "drop-shadow(0 0 1px #45ff61) drop-shadow(0 0 1px #45ff61)",
        },
        "100%": {
            filter: "drop-shadow(0 0 5px #45ff61) drop-shadow(0 0 5px #45ff61)",
        },
    },
    glow: {
        animationName: "$glow",
        animationDuration: "1s",
    },
    up: {
        borderLeft: `${indicatorSize}px solid transparent`,
        borderRight: `${indicatorSize}px solid transparent`,
        borderBottom: `${indicatorSize}px solid ${BUFF_COLOUR}`,
        display: "inline-block",
        marginRight: 8,
    },
    down: {
        borderLeft: `${indicatorSize}px solid transparent`,
        borderRight: `${indicatorSize}px solid transparent`,
        borderTop: `${indicatorSize}px solid ${DEBUFF_COLOUR}`,
        display: "inline-block",
        marginRight: 8,
    },
    upCorner: {
        borderLeft: `${indicatorSize / 1.25}px solid transparent`,
        borderRight: `${indicatorSize / 1.25}px solid transparent`,
        borderBottom: `${indicatorSize / 1.25}px solid ${BUFF_COLOUR}`,
        display: "inline-block",
        filter: "drop-shadow(1px 1px 1px rgba(0, 0, 0, 0.7))",
        position: "absolute",
        left: -1,
        top: -1,
    },
    downCorner: {
        borderLeft: `${indicatorSize / 1.25}px solid transparent`,
        borderRight: `${indicatorSize / 1.25}px solid transparent`,
        borderTop: `${indicatorSize / 1.25}px solid ${DEBUFF_COLOUR}`,
        display: "inline-block",
        filter: "drop-shadow(1px 1px 1px rgba(0, 0, 0, 0.7))",
        position: "absolute",
        left: -1,
        top: -1,
    },
});

const EffectGroupTooltipContent = ({
    effects,
    owner,
    isSilenced,
    allSameDuration,
    stackCount,
    disabled,
}: {
    effects: CombatEffect[];
    owner: Combatant | Player;
    isSilenced: boolean;
    allSameDuration: boolean;
    stackCount: number;
    disabled: boolean;
}) => {
    const {
        name,
        icon,
        attackPower = 0,
        attackDamageReceived = 0,
        skillBonus = [],
        description,
        duration = Infinity,
        canBeSilenced,
        lifeOnHit = 0,
        armorReceived = 0,
        drawCardsPerTurn = 0,
        resourcesPerTurn = 0,
        preventArmorDecay,
        class: effectClass,
    } = effects[0];

    const interpolatedDescription = Handlebars.compile(description || "")(effects[0]);
    const classes = useStyles();

    const tooltipContent = (
        <div className={classes.tooltipContents}>
            <div className={classNames(classes.iconContainer)}>
                <Icon icon={icon} size={"lg"} />
            </div>
            <div className={classes.container}>
                <div className={classes.tooltipTitle}>
                    {effectClass === EFFECT_CLASSES.BUFF && <span className={classes.up} />}
                    {effectClass === EFFECT_CLASSES.DEBUFF && <span className={classes.down} />}
                    {name}
                    {stackCount > 1 ? ` x${stackCount}` : ""}{" "}
                    {
                        <span className={classes.silenced}>
                            {isSilenced && "(Silenced)"}
                            {!isSilenced && disabled && "(Inactive)"}
                        </span>
                    }
                </div>
                <div>{interpolatedDescription}</div>
                <div className={classNames({ [classes.disabled]: disabled })}>
                    {attackPower !== 0 && (
                        <div>
                            <Icon icon={<CrossedSwordsIcon />} text={attackPower} /> attack power
                        </div>
                    )}
                    {lifeOnHit > 0 && (
                        <div>
                            Gaining <Icon icon={<HeartIcon />} text={lifeOnHit} size={"sm"} /> per hit
                        </div>
                    )}
                    {armorReceived !== 0 && (
                        <div>
                            Receiving <Icon icon={<ShieldIcon />} text={armorReceived < 0 ? `-${armorReceived}` : `+${armorReceived}`} />{" "}
                            from armor sources
                        </div>
                    )}
                    {drawCardsPerTurn !== 0 && (
                        <div>
                            {drawCardsPerTurn < 0 ? "-" : "+"}
                            {drawCardsPerTurn} card{drawCardsPerTurn > 1 ? "s" : ""} draw
                        </div>
                    )}
                    {resourcesPerTurn !== 0 && (
                        <div>
                            {resourcesPerTurn < 0 ? "-" : "+"}
                            {resourcesPerTurn}{" "}
                            {resourceClassNameMap[(owner as Player)?.class] || resourcesPerTurn === 1 ? "resource" : "resources"}{" "}
                            {"per turn"}
                        </div>
                    )}
                    {skillBonus.map(({ skill, damage = 0, comparator }) => (
                        <div key={skill}>
                            {comparator === "includes" ? `Cards with '${skill}' in their name gain` : skill}{" "}
                            {damage > 0 && <Icon icon={<CrossedSwordsIcon />} text={`+${damage}`} />}
                        </div>
                    ))}
                </div>
                {preventArmorDecay && <div>Prevents armor decay</div>}
                {canBeSilenced && <div>◆ Can be silenced</div>}
                {allSameDuration && duration !== Infinity && (
                    <span>
                        <Icon icon={<HourglassIcon />} text={duration} /> turn{duration !== 1 ? "s" : ""} remaining
                    </span>
                )}
                {!allSameDuration && (
                    <span>
                        {effects.map((e, i) => (
                            <Icon key={i} icon={<HourglassIcon />} text={isNaN(e.duration) || e.duration === Infinity ? "∞" : e.duration} />
                        ))}{" "}
                        turn{duration !== 1 ? "s" : ""} remaining
                    </span>
                )}
            </div>
        </div>
    );
    return tooltipContent;
};

const EffectGroupIcon = ({
    effects,
    isSilenced,
    owner,
    glow,
    disableTooltip,
}: {
    effects: CombatEffect[];
    isSilenced?: boolean;
    owner: Combatant | Player;
    glow?: boolean;
    disableTooltip?: boolean;
}) => {
    const extraOptionsIconRef = useRef(null);

    const classes = useStyles();
    const state = useAppSelector((state) => state);

    const {
        icon,
        onlyVisibleWhenProcced,
        duration = Infinity,
        canBeSilenced,
        turnsTriggerFrequency,
        uptime,
        class: effectClass,
        extraDisplayOptions,
    } = effects[0];

    const isConditionsPassed = passesConditions({
        getCalculationTarget: (calculationTarget: TRIGGER_TARGET_TYPES) =>
            calculationTarget === TRIGGER_TARGET_TYPES.EFFECT_OWNER ? findCombatantData(() => state, owner?.id) : undefined,
        proc: effects[0],
    });

    const extraOptionsIconText = (() => {
        const { property, modulo } = extraDisplayOptions || {};
        if (!property) {
            return;
        }

        const propertyVal = _.get(effects[0], property) || 0;
        const moduloVal = _.get(effects[0], modulo);
        if (moduloVal !== undefined) {
            return moduloVal - (propertyVal % moduloVal) || undefined;
        }

        return propertyVal || undefined;
    })();

    useEffect(() => {
        if (extraOptionsIconRef.current) {
            playExpandContractAnimation({ object: extraOptionsIconRef.current });
        }
    }, [extraOptionsIconText]);

    if (!isConditionsPassed && onlyVisibleWhenProcced) {
        return null;
    }

    const allSameDuration = effects.every(({ duration }) => duration === effects[0].duration);
    let durationDisplay: string | number = "";
    if (!allSameDuration) {
        durationDisplay = "*";
    } else if (duration !== Infinity) {
        durationDisplay = duration;
    }

    const silenced = isSilenced && canBeSilenced && effectClass === EFFECT_CLASSES.BUFF; // Only buffs can be silenced
    const disabled = silenced || !isConditionsPassed || !isTurnToTrigger({ turnsTriggerFrequency, uptime });

    const { stackCount, displayStacks } = effects.reduce(
        (acc, effect: CombatEffect) => {
            return {
                stackCount: acc.stackCount + (effect.stacks || 1),
                displayStacks: acc.displayStacks || effect.alwaysDisplayStacks,
            };
        },
        { stackCount: 0, displayStacks: false }
    );

    if (!icon) {
        return null;
    }

    const inner = (
        <span
            className={classNames(classes.iconRoot, {
                debuff: effectClass === EFFECT_CLASSES.DEBUFF,
                disabled,
            })}
        >
            <span
                className={classNames(classes.iconInner, {
                    [classes.disabled]: disabled,
                    [classes.glow]: glow,
                })}
            >
                <Icon icon={icon} className={classNames(classes.primaryIcon)} />
                <>
                    {duration !== Infinity && (
                        <span className={classes.duration}>
                            <Icon icon={<HourglassIcon />} size="sm" text={durationDisplay} />
                        </span>
                    )}
                    {extraOptionsIconText && !glow && (
                        <span className={classes.duration} ref={extraOptionsIconRef}>
                            <Icon icon={<HourglassIcon />} size="sm" text={extraOptionsIconText} />
                        </span>
                    )}
                    {(displayStacks || stackCount > 1) && (
                        <span className={classNames(classes.iconText, classes.stacks)}>{stackCount}</span>
                    )}
                    {effectClass === EFFECT_CLASSES.BUFF && <span className={classes.upCorner} />}
                    {effectClass === EFFECT_CLASSES.DEBUFF && <span className={classes.downCorner} />}
                </>
            </span>
        </span>
    );

    if (disableTooltip) {
        return inner;
    }

    return (
        <Tooltip
            title={
                <EffectGroupTooltipContent
                    effects={effects}
                    owner={owner}
                    isSilenced={silenced}
                    allSameDuration={allSameDuration}
                    stackCount={stackCount}
                    disabled={disabled}
                />
            }
        >
            {inner}
        </Tooltip>
    );
};

export default EffectGroupIcon;
