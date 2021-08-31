import classNames from "classnames";
import Handlebars from "handlebars";
import { forwardRef } from "react";
import { createUseStyles } from "react-jss";
import { calculateDamage } from "../battle/utils";
import { Combatant } from "../character/types";
import Icon from "../icon/Icon";
import { Blood, Cactus, CrossedSwords, Dizzy, Heart, Shield } from "../images";
import { Fury } from "../resource/ResourcesView";
import AbilityTypeView from "./AbilityTypeView";
import AuraView from "./AuraView";
import { Ability, Action, ACTION_TYPES, EFFECT_TYPES, TARGET_TYPES } from "./types";
import { getAbilityColor } from "./utils";

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
    const areaIndicator = Array.from({ length: area }).map((_, i) => <span className={classes.area} key={i} />);
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
        width: "140px",
        minHeight: "250px",
        padding: "12px",
        paddingTop: "6px",
        paddingBottom: "2px",
        cursor: "pointer",
        background: "#d9ca96",
        transition: "transform 0.25s",
        borderRadius: "2px",
        textAlign: "center",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "4px",
        zIndex: 1,
    },
    name: {
        fontWeight: 600,
        fontSize: "1.1rem",
    },
    portraitContainer: {
        height: "60px",
    },
    portrait: {
        height: "64px",
        objectFit: "contain",
        position: "absolute",
        left: "50%",
        transform: "translateX(-50%)",
        top: "35px",
    },
    selectedAbility: {
        border: "1px solid rgba(0, 0, 0, 0.5)",
        background: "#ead27c",
        transform: "translateY(-16px)",
    },
    body: {
        minHeight: "40px",
        marginTop: "8px",
        fontSize: "0.9rem",
        "& ul": {
            listStyle: "none",
            padding: 0,
            margin: 0,
        },
        "& li": {
            marginBottom: "4px",
        },

        "& .icon-root": {
            verticalAlign: "bottom",
        },
    },
    iconPlaceholder: {
        width: "24px",
    },
    highlightText: {
        "& .text": {
            color: "#42f57b",
        },
    },
});

interface AbilityViewProps {
    onClick?: (event: any) => void;
    isSelected?: boolean;
    ability: Ability;
    player?: Combatant;
}

const AbilityView = forwardRef(({ onClick, isSelected, ability, player }: AbilityViewProps, ref) => {
    const classes = useStyles();
    const { actions = [], resourceCost, name, minion, image, description, removeAfterTurn } = ability;
    const { area = ability.area } = actions[0] || {};
    const { selfHealing, selfArmor, selfDamage, resourceGain } = actions
        .filter(({ target }) => target === TARGET_TYPES.SELF || target === TARGET_TYPES.FRIENDLY)
        .reduce((acc: any, current: Action) => {
            const { healing = 0, damage = 0, armor = 0, resources = 0 } = current;
            return {
                selfHealing: (acc.selfHealing || 0) + healing,
                selfArmor: (acc.selfArmor || 0) + armor,
                selfDamage: (acc.selfDamage || 0) + damage,
                resourceGain: (acc.resourceGain || 0) + resources,
            };
        }, {}) as any;
    const totalDamage = actions.reduce((acc, action) => acc + calculateDamage({ actor: player, action }), 0);
    const numActionsWithDamage = actions.filter((action) => action.type === ACTION_TYPES.ATTACK && action.damage).length;
    const baseDamage = Math.floor(totalDamage / (numActionsWithDamage || 1));
    const damageFromEffects = player?.effects.reduce((acc, { damage = 0 }) => acc + damage, 0) || 0;

    const allEffects = actions.reduce((acc, { effects = [] }) => {
        acc.push(...effects);
        return acc;
    }, []);

    const bleedDuration = allEffects.find(({ type }) => type === EFFECT_TYPES.BLEED)?.duration || 0;
    const thornsDuration = allEffects.find(({ thorns = 0 }) => thorns > 0)?.duration || 0;
    const stun = allEffects.find(({ type }) => type === EFFECT_TYPES.STUN);
    const { healthPerResourcesSpent = 0, duration: healthPerResourcesSpentDuration = 0 } =
        allEffects.find(({ healthPerResourcesSpent = 0 }) => healthPerResourcesSpent > 0) || {};

    const { target: targetType } = actions[0] || {};

    const cardImage = minion?.image || image;
    const { aura } = minion || {};
    const cardsToAddCount = actions.reduce((acc, { addCards = [] }) => {
        addCards.forEach(({ name }) => {
            acc[name] = (acc[name] || 0) + 1;
        });
        return acc;
    }, {});
    const interpolatedDescription = Handlebars.compile(description || "")({ damage: baseDamage });

    return (
        <div
            onClick={onClick}
            className={classNames(classes.root, {
                [classes.selectedAbility]: isSelected,
            })}
            style={{ borderTop: `3px solid ${getAbilityColor(ability)}` }}
        >
            <span className={classes.header} ref={ref as any}>
                {totalDamage ? (
                    <Icon
                        icon={<CrossedSwords />}
                        text={`${baseDamage}${numActionsWithDamage > 1 ? "x" : ""}`}
                        className={classNames({
                            [classes.highlightText]: damageFromEffects > 0,
                        })}
                    />
                ) : (
                    <div className={classes.iconPlaceholder} />
                )}{" "}
                <span className={classes.name}>{name}</span> <Fury text={resourceCost} />
            </span>
            {cardImage && (
                <div className={classes.portraitContainer}>
                    <img src={cardImage} className={classes.portrait} />
                </div>
            )}
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
                            Self-inflict <Icon icon={<CrossedSwords />} text={selfDamage} />
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
                            Gain <Icon icon={<Heart />} text={healthPerResourcesSpent} /> per <Fury /> spent{" "}
                            {healthPerResourcesSpentDuration === 0 && "this turn"}
                        </li>
                    )}
                    {thornsDuration > 0 && (
                        <li>
                            Gain <Icon icon={<Cactus />} text={thornsDuration} />
                        </li>
                    )}
                    {Object.keys(cardsToAddCount).length > 0 && (
                        <li>
                            Gain{" "}
                            {Object.entries(cardsToAddCount).map(([name, count]) => (
                                <span key={name}>
                                    {name} x{count}{" "}
                                </span>
                            ))}{" "}
                            for use this turn only
                        </li>
                    )}
                    {removeAfterTurn && <li>Removed after your turn</li>}
                    {interpolatedDescription && <li>{interpolatedDescription}</li>}
                </ul>
                {minion && (
                    <div>
                        <Icon icon={<Heart />} text={minion.maxHP} />
                        <Icon icon={<CrossedSwords />} text={minion.damage} />
                    </div>
                )}
                {aura && <AuraView aura={aura} />}
                {actions.length > 0 && (
                    <div>
                        Area: <Area area={area} />
                    </div>
                )}
                <AbilityTypeView targetType={targetType} minion={minion} />
            </div>
        </div>
    );
});

export default AbilityView;
