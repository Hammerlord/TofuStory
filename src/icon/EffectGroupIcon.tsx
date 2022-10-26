import classNames from "classnames";
import { createUseStyles } from "react-jss";
import { Effect, TRIGGER_TARGET_TYPES } from "../ability/types";
import { passesConditions } from "../battle/passesConditions";
import { Combatant } from "../character/types";
import { CrossedSwordsIcon, HeartIcon, HourglassIcon, ShieldIcon, SpeechBubbleIcon } from "../images/icons";

import { Fury } from "../resource/ResourcesView";
import Tooltip from "../view/Tooltip";
import Icon from "./Icon";

const useStyles = createUseStyles({
    root: {
        position: "relative",
        display: "inline-block",
        margin: "0 1px",
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
        left: 2,
        fontSize: "14px",
    },
    duration: {
        position: "absolute",
        top: -2,
        right: -4,
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
});

const EffectGroupIcon = ({ effects, isSilenced, owner }: { effects: Effect[]; isSilenced?: boolean; owner: Combatant }) => {
    if (!effects?.length) {
        return null;
    }

    const classes = useStyles();

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
    } = effects[0];

    if (!icon) {
        return null;
    }

    const { armor, healing } = onTurnStart || {};
    const { healing: healthPerResourcesSpent } = onResourcesSpent || {};
    const { damage: thorns } = onReceiveAttack || {};

    const passedConditions = passesConditions({
        getCalculationTarget: (calculationTarget: TRIGGER_TARGET_TYPES) =>
            calculationTarget === TRIGGER_TARGET_TYPES.EFFECT_OWNER ? owner : undefined,
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

    const silenced = isSilenced && canBeSilenced;
    const disabled = silenced || !passedConditions;

    const tooltipContent = (
        <div className={classes.tooltipContents}>
            <div className={classNames(classes.iconContainer)}>
                <Icon icon={icon} size={"lg"} />
            </div>
            <div className={classes.container}>
                <div className={classes.tooltipTitle}>
                    {name}
                    {effects.length > 1 ? ` x${effects.length}` : ""}{" "}
                    {
                        <span className={classes.silenced}>
                            {silenced && "(Silenced)"}
                            {!silenced && disabled && "(Inactive)"}
                        </span>
                    }
                </div>
                <div>{description}</div>
                <div className={classNames({ [classes.disabled]: disabled })}>
                    {attackPower !== 0 && (
                        <div>
                            <Icon icon={<CrossedSwordsIcon />} text={attackPower} /> attack power
                        </div>
                    )}
                    {attackDamageReceived !== 0 && (
                        <div>
                            Receiving{" "}
                            <Icon
                                icon={<CrossedSwordsIcon />}
                                text={attackDamageReceived < 0 ? `-${attackDamageReceived}` : `+${attackDamageReceived}`}
                            />
                            damage from attacks
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
                            <Icon icon={<HeartIcon />} text={healthPerResourcesSpent} /> per <Fury /> spent
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
                            {drawCardsPerTurn} card{drawCardsPerTurn > 1 ? "s" : ""} draw on turn start
                        </div>
                    )}
                    {skillBonus.map(({ skill, damage = 0 }) => (
                        <div key={skill}>
                            {skill} {damage > 0 && <Icon icon={<CrossedSwordsIcon />} text={`+${damage}`} />}
                        </div>
                    ))}
                </div>
                {canBeSilenced && <div>◆ Can be silenced</div>}
                {allSameDuration && duration !== Infinity && (
                    <span>
                        <Icon icon={<HourglassIcon />} text={duration} /> turn{duration !== 1 ? "s" : ""} remaining
                    </span>
                )}
                {!allSameDuration && (
                    <span>
                        {effects.map((e, i) => (
                            <Icon key={i} icon={<HourglassIcon />} text={e.duration === Infinity ? "∞" : e.duration} />
                        ))}{" "}
                        turn{duration !== 1 ? "s" : ""} remaining
                    </span>
                )}
            </div>
        </div>
    );
    return (
        <Tooltip title={tooltipContent}>
            <span className={classes.root}>
                <Icon
                    icon={icon}
                    className={classNames({
                        [classes.disabled]: disabled,
                    })}
                >
                    <>
                        {durationDisplay && (
                            <span className={classes.duration}>
                                <Icon icon={<HourglassIcon />} size="sm" text={durationDisplay} />
                            </span>
                        )}
                        {effects.length > 1 && <span className={classNames(classes.iconText, classes.stacks)}>{effects.length}</span>}
                    </>
                </Icon>
                {isSilenced && canBeSilenced && <Icon icon={<SpeechBubbleIcon />} className={classes.silenceIcon} />}
            </span>
        </Tooltip>
    );
};

export default EffectGroupIcon;
