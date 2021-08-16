import classNames from "classnames";
import { createUseStyles } from "react-jss";
import Icon from "../icon/Icon";
import { Shield, Blood, CrossedSwords, Dizzy, Heart } from "../images";
import { Fury } from "../resource/ResourcesView";
import { Ability, Action, EFFECT_TYPES, TARGET_TYPES } from "./types";

const useAreaStyles = createUseStyles({
    area: {
        width: "12px",
        height: "12px",
        backgroundColor: "rgba(0, 0, 0, 0.25)",
        display: "inline-block",
        "&:not(:last-child)": {
            marginRight: "4px",
        },
    },
    mainTarget: {
        width: "12px",
        height: "12px",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "inline-block",
        marginRight: "4px",
    },
});

const Area = ({ area }) => {
    const classes = useAreaStyles();
    const areaIndicator = Array.from({ length: area }).map((_, i) => (
        <span className={classes.area} key={i} />
    ));
    return (
        <span>
            {areaIndicator}
            <span className={classes.mainTarget} />
            {areaIndicator}
        </span>
    );
};

const useStyles = createUseStyles({
    root: {
        border: "1px solid rgba(0, 0, 0, 0.5)",
        width: "150px",
        minHeight: "125px",
        padding: "12px",
        cursor: "pointer",
        background: "#d9ca96",
        transition: "transform 0.25s",
        borderRadius: "2px",
        textAlign: "center",
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
    },
    name: {
        fontWeight: 600,
        fontSize: "1.1rem",
    },
    selectedAbility: {
        border: "1px solid rgba(0, 0, 0, 0.5)",
        background: "#ffc83e",
        transform: "translateY(-16px)",
    },
    offensive: {
        borderTop: "3px solid rgb(221, 46, 68)",
    },
    support: {
        borderTop: "3px solid rgb(23, 111, 189)",
    },
    minion: {
        borderTop: "3px solid rgb(50, 168, 82)",
    },
    body: {
        minHeight: "40px",
        marginTop: "16px",
        "& ul": {
            listStyle: "none",
            padding: 0,
            margin: 0,
        },
        "& li": {
            marginBottom: "4px",
        },
    },
    iconPlaceholder: {
        width: "24px",
    },
});

interface AbilityViewProps {
    onClick?: (event: any) => void;
    isSelected?: boolean;
    ability: Ability;
}

const AbilityView = ({ onClick, isSelected, ability }: AbilityViewProps) => {
    const classes = useStyles();
    const { actions = [], resourceCost, name } = ability;
    const { area } = actions[0] || {};
    const { selfHealing, selfArmor, selfDamage, resourceGain } = actions
        .filter(({ target }) => target === TARGET_TYPES.SELF)
        .reduce((acc: any, current: Action) => {
            const { healing = 0, damage = 0, armor = 0, resources = 0 } = current;
            return {
                selfHealing: (acc.selfHealing || 0) + healing,
                selfArmor: (acc.selfArmor || 0) + armor,
                selfDamage: (acc.selfDamage || 0) + damage,
                resourceGain: (acc.resourceGain || 0) + resources,
            };
        }, {}) as any;
    const damage = actions
        .filter(({ target }) => target === TARGET_TYPES.HOSTILE)
        .reduce((acc, { damage = 0 }) => acc + damage, 0);

    const allEffects = actions.reduce((acc, { effects = [] }) => {
        acc.push(...effects);
        return acc;
    }, []);

    const bleedDuration =
        allEffects.find(({ type }) => type === EFFECT_TYPES.BLEED)?.duration || 0;
    const stun = allEffects.find(({ type }) => type === EFFECT_TYPES.STUN);
    const { healthPerResourcesSpent = 0, duration: healthPerResourcesSpentDuration = 0 } =
        allEffects.find(
            ({ healthPerResourcesSpent = 0 }) => healthPerResourcesSpent > 0
        ) || {};

    const { target: targetType, minion } = actions[0] || {};

    return (
        <div
            onClick={onClick}
            className={classNames(classes.root, {
                [classes.selectedAbility]: isSelected,
                [classes.offensive]: targetType === TARGET_TYPES.HOSTILE,
                [classes.support]:
                    targetType === TARGET_TYPES.FRIENDLY ||
                    targetType === TARGET_TYPES.SELF,
                [classes.minion]: minion,
            })}
        >
            <span className={classes.header}>
                {damage ? (
                    <Icon icon={<CrossedSwords />} text={damage} />
                ) : (
                    <div className={classes.iconPlaceholder} />
                )}{" "}
                <span className={classes.name}>{name}</span> <Fury text={resourceCost} />
            </span>
            <div>
                Area: <Area area={area} />
            </div>
            <div className={classes.body}>
                <ul>
                    {bleedDuration > 0 && (
                        <li>
                            Inflict <Icon icon={<Blood />} text={bleedDuration} />
                        </li>
                    )}
                    {stun && (
                        <li>
                            Inflict <Icon icon={<Dizzy />} />
                        </li>
                    )}
                    {resourceGain > 0 && (
                        <li>
                            Gain <Fury text={resourceGain} />
                        </li>
                    )}
                    {selfDamage > 0 && (
                        <li>
                            Self-inflict{" "}
                            <Icon icon={<CrossedSwords />} text={selfDamage} />
                        </li>
                    )}
                    {selfArmor > 0 && (
                        <li>
                            Gain <Icon icon={<Shield />} text={selfArmor} />
                        </li>
                    )}
                    {selfHealing > 0 && (
                        <li>
                            Heal for <Icon icon={<Heart />} text={selfHealing} />
                        </li>
                    )}
                    {healthPerResourcesSpent > 0 && (
                        <li>
                            Gain <Icon icon={<Heart />} text={healthPerResourcesSpent} />{" "}
                            per <Fury /> spent{" "}
                            {healthPerResourcesSpentDuration === 0 && "this turn"}
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default AbilityView;
