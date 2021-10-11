import classNames from "classnames";
import Handlebars from "handlebars";
import { forwardRef } from "react";
import { createUseStyles } from "react-jss";
import { getMultiplier } from "../../battle/utils";
import { Combatant } from "../../character/types";
import Icon from "../../icon/Icon";
import { CrossedSwords, Heart, Shield } from "../../images";
import { Fury } from "../../resource/ResourcesView";
import { Ability, Action, HandAbility, TARGET_TYPES } from "../types";
import { getAbilityColor } from "../utils";
import AbilityTooltip from "./AbilityTooltip";
import AbilityTypeView from "./AbilityTypeView";
import Area from "./AreaView";
import AuraView from "./AuraView";
import BonusView from "./BonusView";
import Buffs from "./Buffs";
import CardsToAdd from "./CardsToAdd";
import DamageIcon, { getDamageStatistics } from "./DamageIcon";
import Debuffs from "./Debuffs";
import DrawCards from "./DrawCards";
import RadiateView from "./RadiateView";
import ResourceIcon from "./ResourceIcon";
import { getAllEffects } from "./utils";

const useStyles = createUseStyles({
    root: {
        position: "relative",
    },
    inner: {
        border: "1px solid rgba(0, 0, 0, 0.5)",
        width: "150px",
        minHeight: "250px",
        padding: "8px",
        paddingTop: "6px",
        paddingBottom: "2px",
        cursor: "pointer",
        background: "#c7b89d",
        transition: "transform 0.25s",
        borderRadius: "4px",
        textAlign: "center",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxShadow: "1px 1px 4px rgba(0, 0, 0, 0.3)",
        color: "rgba(0, 0, 0, 0.95)",
        fontFamily: "Barlow",
        lineHeight: "16px",
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        textShadow: "0 0 2px white, 0 0 2px white, 0 0 2px white, 0 0 2px white",
        lineHeight: "16px",
        zIndex: 1,
    },
    name: {
        fontWeight: 600,
        fontSize: "1.1rem",
    },
    portraitContainer: {
        position: "absolute",
        top: "30px",
        left: "50%",
        transform: "translateX(-50%)",
        height: "90px",
        width: "calc(100% - 16px)",
    },
    portrait: {
        height: "100%",
        width: "100%",
        objectFit: "contain",
    },
    footer: {
        position: "relative",
    },
    minionStats: {
        position: "absolute",
        bottom: 24,
        width: "100%",
    },
    minionHP: {
        left: 0,
        position: "absolute",
    },
    minionDamage: {
        right: 0,
        position: "absolute",
    },
    selectedAbility: {
        border: "1px solid rgba(0, 0, 0, 0.5)",
        background: "#ead27c",
        transform: "translateY(-16px)",
    },
    body: {
        minHeight: "80px",
        marginTop: "80px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-around",
        fontSize: "0.9rem",

        "& .icon-root": {
            verticalAlign: "bottom",
        },
    },
    iconPlaceholder: {
        width: "24px",
    },
    bold: {
        fontWeight: "bold",
    },
    "@keyframes fade": {
        "0%": {
            opacity: 0.95,
        },
        "60%": {
            opacity: 0.95,
        },
        "100%": {
            opacity: 0.8,
        },
    },
    ephemeral: {
        animationName: "$fade",
        animationDuration: `2s`,
        animationIterationCount: "infinite",
        animationDirection: "alternate-reverse",
    },
    refContainer: {
        pointerEvents: "none",
        position: "absolute",
        top: "4px",
        left: "50%",
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
    ability: Ability | HandAbility;
    player?: Combatant;
}

const AbilityView = forwardRef(({ onClick, isSelected, ability, player }: AbilityViewProps, ref) => {
    const classes = useStyles();
    const { actions = [], name, minion, image, description, removeAfterTurn, depletedOnUse } = ability;
    const { area = ability.area, target: targetType, damage, secondaryDamage, destroyArmor = 0 } = actions[0] || {};
    const cardImage = minion?.image || image;
    const { aura } = minion || {};
    const { baseDamage } = getDamageStatistics({ ability, player });
    const interpolatedDescription = Handlebars.compile(description || "")({ damage: baseDamage });

    let hasMultiplier = false;
    let armorCornerIcon = false;
    let healingCornerIcon = false;

    const {
        healing,
        armor,
        damage: selfDamage,
        resourceGain,
    } = ability.actions
        .filter(({ target }) => target === TARGET_TYPES.SELF || target === TARGET_TYPES.FRIENDLY)
        .reduce((acc: any, action: Action) => {
            const { healing = 0, damage = 0, armor = 0, resources = 0 } = action;
            const multiplier = getMultiplier({ multiplier: action.multiplier, actor: player });
            if (multiplier > 1) {
                hasMultiplier = true;
            }
            return {
                healing: (acc.healing || 0) + healing * multiplier,
                armor: (acc.armor || 0) + armor * multiplier,
                damage: (acc.damage || 0) + damage * multiplier,
                resourceGain: (acc.resourceGain || 0) + resources * multiplier,
            };
        }, {}) as any;

    const cornerIcon = (() => {
        if (baseDamage > 0) {
            return <DamageIcon ability={ability} player={player} />;
        }

        if (armor > 0) {
            armorCornerIcon = true;
            return (
                <Icon
                    icon={<Shield />}
                    text={armor}
                    className={classNames({
                        [classes.highlightText]: hasMultiplier,
                    })}
                />
            );
        }

        if (healing > 0) {
            healingCornerIcon = true;
            return (
                <Icon
                    icon={<Heart />}
                    text={healing}
                    className={classNames({
                        [classes.highlightText]: hasMultiplier,
                    })}
                />
            );
        }

        return <div className={classes.iconPlaceholder} />;
    })();

    return (
        <AbilityTooltip ability={ability}>
            <div className={classes.root}>
                <div
                    onClick={onClick}
                    className={classNames(classes.inner, {
                        [classes.selectedAbility]: isSelected,
                        [classes.ephemeral]: removeAfterTurn,
                    })}
                    style={{ borderTop: `3px solid ${getAbilityColor(ability)}` }}
                >
                    <span className={classes.header}>
                        {cornerIcon}
                        <span className={classes.name}>{name}</span> <ResourceIcon ability={ability} />
                    </span>
                    <div className={classes.portraitContainer}>{cardImage && <img src={cardImage} className={classes.portrait} />}</div>
                    <div className={classes.body}>
                        {removeAfterTurn && <div className={classes.bold}>Ephemeral</div>}
                        {depletedOnUse && <div className={classes.bold}>Deplete</div>}
                        <Debuffs effects={getAllEffects(ability)} />
                        <>
                            {!healingCornerIcon && healing > 0 && (
                                <div>
                                    Heal for <Icon icon={<Heart />} text={healing} />
                                </div>
                            )}
                            {!armorCornerIcon && armor > 0 && (
                                <div>
                                    Gain <Icon icon={<Shield />} text={armor} />
                                </div>
                            )}
                            {resourceGain > 0 && <div>{resourceGain > 0 && <Fury text={resourceGain} />}</div>}
                            {selfDamage > 0 && (
                                <div>
                                    Self-inflict <Icon icon={<CrossedSwords />} text={selfDamage} />
                                </div>
                            )}
                            {ability.reusable && <div>Returns to your hand after use</div>}
                        </>
                        <Buffs ability={ability} />
                        <CardsToAdd ability={ability} />
                        <BonusView ability={ability} player={player} />
                        <DrawCards ability={ability} />
                        <RadiateView ability={ability} />
                        {destroyArmor > 0 && <div>Destroy {destroyArmor * 100}% armor</div>}
                        {interpolatedDescription && <div>{interpolatedDescription}</div>}
                        {aura && <AuraView aura={aura} />}
                    </div>
                    <div className={classes.footer}>
                        {actions.length > 0 && area > 0 && <Area area={area} damage={damage} secondaryDamage={secondaryDamage} />}
                        <AbilityTypeView targetType={targetType} minion={minion} />
                        {minion && (
                            <div className={classes.minionStats}>
                                <Icon icon={<Heart />} text={minion.maxHP} className={classes.minionHP} />
                                <Icon icon={<CrossedSwords />} text={minion.damage} className={classes.minionDamage} />
                            </div>
                        )}
                    </div>
                </div>
                <div className={classes.refContainer} ref={ref as any} />
            </div>
        </AbilityTooltip>
    );
});

export default AbilityView;
