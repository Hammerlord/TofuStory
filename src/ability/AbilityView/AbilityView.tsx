import classNames from "classnames";
import Handlebars from "handlebars";
import { forwardRef } from "react";
import { createUseStyles } from "react-jss";
import { getMultiplier } from "../../battle/utils";
import Icon from "../../icon/Icon";
import { CrossedSwordsIcon, HeartIcon, ShieldIcon } from "../../images/icons";
import { Ability, Action, HandAbility, TARGET_TYPES } from "../types";
import AbilityTooltip from "./AbilityTooltip";
import AbilityTypeView from "./AbilityTypeView";
import Area from "./AreaView";
import ArmorIcon, { getArmorStatistics } from "./ArmorIcon";
import BonusView from "./BonusView";
import Buffs from "./Buffs";
import CardsToAdd from "./CardsToAdd";
import DamageIcon, { getDamageStatistics } from "./DamageIcon";
import Debuffs from "./Debuffs";
import DrawCards from "./DrawCards";
import RadiateView from "./RadiateView";
import AbilityResourceIcon, { ResourceIcon } from "./ResourceIcon";
import { getAbilityColor, getAllEffects } from "./utils";

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
        textShadow: Array.from({ length: 10 })
            .map(() => "0 0 2px white")
            .join(", "),
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
    glow: {
        boxShadow: "0px 0px 7px 5px rgba(240, 220, 0, 0.9)",
    },
});

interface AbilityViewProps {
    onClick?: (event: any) => void;
    isSelected?: boolean;
    ability: Ability | HandAbility;
    player?: any;
    deck?: Ability[];
    hand?: Ability[];
    discard?: Ability[];
    className?: string;
}

const AbilityView = forwardRef(
    ({ onClick, isSelected, ability, player, deck = [], hand = [], discard = [], className }: AbilityViewProps, ref) => {
        const classes = useStyles();
        if (className) {
            console.log(classNames(classes.root, className));
        }
        const { actions = [], name, minion, image, description, overrideBodyText, removeAfterTurn, depletedOnUse, preemptive } = ability;
        const { target: targetType, type, damage, secondaryDamage, destroyArmor = 0, ricochet, targetArea, numTargets } = actions[0] || {};
        const cardImage = minion?.image || image;
        let imageNode = null;

        if (typeof cardImage === "string") {
            imageNode = <img src={cardImage} className={classes.portrait} draggable="false" />;
        } else if (typeof image === "function") {
            const ImageNode = image as Function;
            imageNode = (
                <div>
                    <ImageNode className={classes.portrait} />
                </div>
            );
        }

        const { baseDamage, damageBonusFromConditions } = getDamageStatistics({ ability, player, deck, hand, discard });
        const { bonusFromConditions: armorBonusFromConditions } = getArmorStatistics({ ability, player });
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
                const multiplier = getMultiplier({ multiplier: action.multiplier, actor: { combatant: player }, deck, hand, discard });
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
                return <DamageIcon ability={ability} player={player} deck={deck} hand={hand} discard={discard} />;
            }

            if (armor > 0) {
                armorCornerIcon = true;
                return <ArmorIcon ability={ability} player={player} />;
            }

            if (healing > 0) {
                healingCornerIcon = true;
                return (
                    <Icon
                        icon={<HeartIcon />}
                        text={healing}
                        className={classNames({
                            [classes.highlightText]: hasMultiplier,
                        })}
                    />
                );
            }

            return <div className={classes.iconPlaceholder} />;
        })();

        const hasBonus = damageBonusFromConditions || armorBonusFromConditions;

        return (
            <AbilityTooltip ability={ability} deck={deck} hand={hand} discard={discard}>
                <div className={classNames(classes.root, className)}>
                    <div
                        onClick={onClick}
                        className={classNames(classes.inner, {
                            [classes.selectedAbility]: isSelected,
                            [classes.ephemeral]: removeAfterTurn,
                            [classes.glow]: hasBonus,
                        })}
                        style={{ borderTop: `3px solid ${getAbilityColor(ability)}` }}
                    >
                        <span className={classes.header}>
                            {cornerIcon}
                            <span className={classes.name}>
                                {name}{" "}
                                {ability.level > 1 &&
                                    Array.from({ length: ability.level })
                                        .map(() => "⋆")
                                        .join("")}
                            </span>{" "}
                            <AbilityResourceIcon ability={ability} playerClass={player?.class} />
                        </span>
                        <div className={classes.portraitContainer}>{imageNode}</div>
                        <div className={classes.body}>
                            {preemptive && <div className={classes.bold}>Pre-emptive</div>}
                            {removeAfterTurn && <div className={classes.bold}>Ephemeral</div>}
                            {depletedOnUse && <div className={classes.bold}>Deplete</div>}
                            {ability.reusable && <div className={classes.bold}>Reusable</div>}
                            <DrawCards ability={ability} playerClass={player?.class} />
                            {!overrideBodyText && <Debuffs effects={getAllEffects(ability)} />}
                            {ricochet && (
                                <div>
                                    Bounces to up to {numTargets} other targets{" "}
                                    {secondaryDamage && (
                                        <>
                                            for <Icon icon={<CrossedSwordsIcon />} text={secondaryDamage} size={"sm"} />{" "}
                                        </>
                                    )}
                                </div>
                            )}
                            {!healingCornerIcon && healing > 0 && (
                                <div>
                                    Heal for <Icon icon={<HeartIcon />} text={healing} size={"sm"} />
                                </div>
                            )}
                            {!armorCornerIcon && armor > 0 && (
                                <div>
                                    Gain <Icon icon={<ShieldIcon />} text={armor} size={"sm"} />
                                </div>
                            )}
                            {resourceGain > 0 && (
                                <div>
                                    Gain <ResourceIcon text={resourceGain} size={"sm"} playerClass={player?.class} />
                                </div>
                            )}
                            {selfDamage > 0 && (
                                <div>
                                    Self-inflict <Icon icon={<CrossedSwordsIcon />} text={selfDamage} size={"sm"} />
                                </div>
                            )}
                            {!overrideBodyText && <Buffs ability={ability} player={player} />}
                            <CardsToAdd ability={ability} />
                            {!overrideBodyText && <BonusView ability={ability} player={player} deck={deck} hand={hand} discard={discard} />}
                            <RadiateView ability={ability} player={player} deck={deck} hand={hand} discard={discard} />
                            {destroyArmor > 0 && <div>Destroy {destroyArmor * 100}% armor</div>}
                            {interpolatedDescription && <div>{interpolatedDescription}</div>}
                        </div>
                        <div className={classes.footer}>
                            {<Area ability={ability} player={player} deck={deck} hand={hand} discard={discard} />}
                            <AbilityTypeView targetType={targetType} type={type} minion={minion} />
                            {minion && (
                                <div className={classes.minionStats}>
                                    <Icon icon={<HeartIcon />} text={minion.maxHP} className={classes.minionHP} />
                                    <Icon icon={<CrossedSwordsIcon />} text={minion.damage} className={classes.minionDamage} />
                                </div>
                            )}
                        </div>
                    </div>
                    <div className={classes.refContainer} ref={ref as any} />
                </div>
            </AbilityTooltip>
        );
    }
);

export default AbilityView;
