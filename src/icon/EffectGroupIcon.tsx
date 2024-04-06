import classNames from "classnames";
import { createUseStyles } from "react-jss";
import { CombatEffect, EFFECT_CLASSES, TRIGGER_TARGET_TYPES } from "../ability/types";
import { passesConditions } from "../battle/passesConditions";
import { Combatant, Player } from "../character/types";
import { CrossedSwordsIcon, HeartIcon, HourglassIcon, ShieldIcon } from "../images/icons";

import Handlebars from "handlebars";
import { ResourceIcon } from "../ability/AbilityView/ResourceIcon";
import { resourceClassNameMap } from "../ability/AbilityView/constants";
import { findCombatantData } from "../battle/actions/actions";
import { isTurnToTrigger } from "../battle/utils";
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
        background: "rgba(0, 0, 0, 0.65)",
        padding: "1px",
        "&.debuff": {
            borderColor: DEBUFF_COLOUR,
        },
        "&.disabled": {
            background: "rgba(0, 0, 0, 0.15)",
        },
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
    if (!effects?.length) {
        return null;
    }

    const classes = useStyles();
    const state = useAppSelector((state) => state);

    const {
        name,
        icon,
        attackPower = 0,
        attackDamageReceived = 0,
        skillBonus = [],
        onlyVisibleWhenProcced,
        onTurnStart,
        onResourcesSpent,
        onReceiveAttack,
        description,
        duration = Infinity,
        canBeSilenced,
        lifeOnHit = 0,
        armorReceived = 0,
        drawCardsPerTurn = 0,
        resourcesPerTurn = 0,
        preventArmorDecay,
        turnsTriggerFrequency,
        uptime,
        class: effectClass,
    } = effects.reduce((acc, cur, i) => {
        if (i === 0) {
            return acc;
        }
        const updated = {
            ...acc,
        };

        for (const property in cur) {
            // Duration should just be a singular effect's duration so we can display '*' (if some are not the same) or the time (if all are the same)
            if (typeof cur[property] === "number" && property !== "duration") {
                updated[property] += cur[property];
            }
        }

        return updated;
    }, effects[0]);

    if (!icon) {
        return null;
    }

    const { armor, healing } = onTurnStart || {};
    const { healing: healthPerResourcesSpent } = onResourcesSpent || {};
    const { damage: thorns } = onReceiveAttack || {};

    const passedConditions = passesConditions({
        getCalculationTarget: (calculationTarget: TRIGGER_TARGET_TYPES) =>
            calculationTarget === TRIGGER_TARGET_TYPES.EFFECT_OWNER ? findCombatantData(() => state, owner?.id) : undefined,
        proc: effects[0],
    });

    if (!passedConditions && onlyVisibleWhenProcced) {
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
    const disabled = silenced || !passedConditions || !isTurnToTrigger({ turnsTriggerFrequency, uptime });

    const { stackCount, displayStacks } = effects.reduce(
        (acc, effect: CombatEffect) => {
            return {
                stackCount: acc.stackCount + (effect.stacks || 1),
                displayStacks: acc.displayStacks || effect.alwaysDisplayStacks,
            };
        },
        { stackCount: 0, displayStacks: false }
    );

    const inner = (
        <span
            className={classNames(classes.iconRoot, {
                debuff: effectClass === EFFECT_CLASSES.DEBUFF,
                disabled,
            })}
        >
            <Icon
                icon={icon}
                className={classNames({
                    [classes.disabled]: disabled,
                    [classes.glow]: glow,
                })}
            >
                <>
                    {duration !== Infinity && (
                        <span className={classes.duration}>
                            <Icon icon={<HourglassIcon />} size="sm" text={durationDisplay} />
                        </span>
                    )}
                    {(displayStacks || stackCount > 1) && (
                        <span className={classNames(classes.iconText, classes.stacks)}>{stackCount}</span>
                    )}
                    {effectClass === EFFECT_CLASSES.BUFF && <span className={classes.upCorner} />}
                    {effectClass === EFFECT_CLASSES.DEBUFF && <span className={classes.downCorner} />}
                </>
            </Icon>
        </span>
    );

    if (disableTooltip) {
        return inner;
    }

    const interpolatedDescription = Handlebars.compile(description || "")(effects[0]);

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
                            {silenced && "(Silenced)"}
                            {!silenced && disabled && "(Inactive)"}
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
                    {attackDamageReceived !== 0 && (
                        <div>
                            ◆ {attackDamageReceived < 0 ? `-${attackDamageReceived}` : `+${attackDamageReceived}`} damage taken from attacks
                        </div>
                    )}
                    {armor > 0 && (
                        <div>
                            <Icon icon={<ShieldIcon />} text={armor} /> per turn
                        </div>
                    )}
                    {healing > 0 && (
                        <div>
                            <Icon icon={<HeartIcon />} text={healing} /> per turn
                        </div>
                    )}
                    {healthPerResourcesSpent > 0 && (
                        <div>
                            <Icon icon={<HeartIcon />} text={healthPerResourcesSpent} /> per{" "}
                            <ResourceIcon playerClass={(owner as any)?.class} /> spent
                        </div>
                    )}
                    {lifeOnHit > 0 && (
                        <div>
                            Gaining <Icon icon={<HeartIcon />} text={lifeOnHit} size={"sm"} /> per hit
                        </div>
                    )}
                    {thorns > 0 && <div>Reflects {thorns} damage to attackers</div>}
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
    return <Tooltip title={tooltipContent}>{inner}</Tooltip>;
};

export default EffectGroupIcon;
