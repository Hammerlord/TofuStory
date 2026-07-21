import classNames from "classnames";
import { FC, forwardRef, ReactElement, useMemo } from "react";
import { createUseStyles } from "react-jss";
import { findCombatantData } from "../../battle/actions/actions";
import { passesConditions } from "../../battle/passesConditions";
import { TRIGGER_SOURCE_TYPES } from "../../battle/types";
import { canUseAbility, getMultiplier } from "../../battle/utils";
import { Player } from "../../character/types";
import { useAppSelector } from "../../hooks";
import Icon from "../../icon/Icon";
import { MapleLeavesImage } from "../../images";
import { CrossedSwordsIcon, HeartIcon, LockIcon, ShieldIcon } from "../../images/icons";
import { RARITIES } from "../../item/types";
import { ACTION_TYPES, Action, CONDITION_TARGETS, CombatAbility, EFFECT_CLASSES, EFFECT_TYPES, TARGET_TYPES } from "../types";
import AbilityTooltip from "./AbilityTooltip";
import AbilityTypeView from "./AbilityTypeView";
import Area, { AreaIndicator } from "./AreaView";
import ArmorIcon, { getArmorStatistics } from "./ArmorIcon";
import BonusView from "./BonusView";
import Buffs from "./Buffs";
import CardsToAdd from "./CardsToAdd";
import DamageIcon, { getDamageStatistics } from "./DamageIcon";
import Debuffs from "./Debuffs";
import DrawCards from "./DrawCards";
import RadiateView from "./RadiateView";
import AbilityResourceIcon, { ResourceIcon } from "./ResourceIcon";
import SelectCards from "./SelectCards";
import { getAbilityColor, getAllEffects, getLastPlayedCards, interpolateAbilityDescription } from "./utils";

const useStyles = createUseStyles({
    root: {
        position: "relative",
        transition: "transform 0.15s",
        display: "inline-block",
        "&:hover": {
            transform: "scale(1.1)",
            zIndex: 5,
        },
        "&.-selected": {
            transform: "scale(1.1)",
            zIndex: 5,
        },
    },
    inner: {
        border: "1px solid rgba(0, 0, 0, 0.5)",
        width: "150px",
        minHeight: "250px",
        padding: "10px",
        paddingTop: "6px",
        paddingBottom: "2px",
        cursor: "pointer",
        background: "#c7b89d",
        transition: "transform 0.25s",
        borderRadius: "6px",
        textAlign: "center",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxShadow: "1px 1px 4px rgba(0, 0, 0, 0.3)",
        color: "rgba(0, 0, 0, 0.95)",
        fontFamily: "Barlow",
        lineHeight: "16px",
        backfaceVisibility: "hidden",
        "&.-flipped": {
            transform: "rotateY(180deg)",
        },
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        textShadow: Array.from({ length: 10 })
            .map(() => "0 0 2.5px white")
            .join(", "),
        lineHeight: "16px",
        zIndex: 1,
    },
    name: {
        fontWeight: 600,
        fontSize: "1.1rem",
        "&.rare": {
            color: "#796000",
        },
        "&.uncommon": {
            color: "#00437d",
        },
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
        bottom: 32,
        width: "100%",
    },
    minionHPContainer: {
        left: 0,
        position: "absolute",
    },
    minionArmor: {
        position: "absolute",
        right: -10,
        top: -10,
    },
    minionDamageContainer: {
        right: 0,
        position: "absolute",
    },
    minionAbilityEffect: {
        position: "absolute",
        left: -10,
        top: -10,
    },
    minionAbilityArea: {
        position: "absolute",
        left: "50%",
        transform: "translateX(-50%)",
        top: -10,
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
        lineHeight: "1rem",

        "& .icon-root": {
            verticalAlign: "bottom",
        },
    },
    iconPlaceholder: {
        width: "30px",
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
    cursed: {
        filter: "drop-shadow(0px 0px 1px #ff3a3a) drop-shadow(0px 0px 3px #ff3a3a)",
    },
    glow: {
        filter: "drop-shadow(0px 0px 4px rgb(240, 220, 0)) drop-shadow(0px 0px 4px rgb(240, 220, 0))",
    },
    abilityLevel: {
        color: "#25b814",
        textShadow: Array.from({ length: 10 })
            .map(() => "0 0 2.5px black")
            .join(", "),
    },
    cardBack: {
        background: "#176fbd",
        transformStyle: "preserve-3d",
        backfaceVisibility: "hidden",
        width: "100%",
        height: "100%",
        display: "inline-block",
        position: "absolute",
        top: 0,
        left: 0,
        borderRadius: "4px",
        transform: "rotateY(180deg)",
        transition: "transform 0.25s",
        border: "5px solid white",
        boxSizing: "content-box",
        "&:before": {
            content: "' '",
            backgroundImage: `url(${MapleLeavesImage})`,
            width: "100%",
            height: "100%",
            opacity: 0.1,
            display: "block",
            position: "absolute",
            left: 0,
            top: 0,
            backgroundPosition: "50% 0",
        },

        "&.-flipped": {
            transform: "unset",
        },
    },
    locked: {
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
        width: 75,
        zIndex: 10,
        filter: "drop-shadow(1px 1px 2px rgba(0, 0, 0, 1)) drop-shadow(0 0 4px #ff3a3a)",
        opacity: 0.75,
    },
    cardLocked: {
        filter: "saturate(0.25)",
    },
});

interface AbilityViewProps {
    onClick?: (event: any) => void;
    onMouseDown?: (event: any) => void;
    isSelected?: boolean;
    ability: CombatAbility;
    className?: string;
    // Eg. when viewing cards during card reward, the cards should not glow
    disableGlow?: boolean;
    // Eg. when viewing cards during card rewards, the cards should not have temporary in-battle bonuses applied to them
    disableBattleBonuses?: boolean;
    // If true, the backside of the card is shown
    flipped?: boolean;
    style?: any;
}

const AbilityView = forwardRef(
    (
        { onClick, onMouseDown, isSelected, ability, className, disableGlow, disableBattleBonuses, flipped, ...other }: AbilityViewProps,
        ref
    ) => {
        const classes = useStyles();
        const character = useAppSelector((state) => state.character);
        const battle = useAppSelector((state) => state.battle);
        const {
            actions = [],
            name,
            minion,
            minionOptions,
            image,
            overrideBodyText,
            removeAfterTurn,
            depletedOnUse,
            preemptive,
            unplayable,
            disableConditionGlow,
            effects = [],
        } = ability;
        const { target: targetType, type, secondaryDamage, destroyArmor = 0, numTargets, addLastPlayedCards } = actions[0] || {};
        const cardImage = minion?.image || image;
        let imageNode = null;

        if (typeof cardImage === "string") {
            imageNode = <img src={cardImage} className={classes.portrait} draggable="false" />;
        } else if (typeof image === "function") {
            const ImageNode = image as FC<{ className?: string }>;
            imageNode = (
                <div>
                    <ImageNode className={classes.portrait} />
                </div>
            );
        }

        let playerInfo = findCombatantData(() => ({ battle }), character.player?.id);
        let player: Player | undefined;
        if (disableBattleBonuses || !playerInfo?.combatant) {
            player = character.player;
            playerInfo = { combatant: player };
        } else {
            player = playerInfo?.combatant as Player;
        }

        // Depending on whether we want to show combat bonuses based on your current hand, deck, etc., grab those objects from either state
        const {
            hand = [],
            deck = [],
            discard = [],
        } = (() => {
            if (disableBattleBonuses || !battle) {
                return { deck: character.deck };
            }

            return battle;
        })();

        const damageStatistics = getDamageStatistics({
            ability,
            actorInfo: playerInfo,
            deck,
            hand,
            discard,
        });

        const { baseDamage, hasConditionFulfilled: hasDamageConditionFulfilled } = damageStatistics;

        const source = { type: TRIGGER_SOURCE_TYPES.ABILITY, source: ability, actorId: player?.id, triggerHistory: [] };

        const hasConditionFulfilled = useMemo(() => {
            return actions.some((action: Action) => {
                const conditionProcs = [];
                const { conditions, bonus, secondaryAction } = action;

                if (conditions) {
                    conditionProcs.push(action);
                }

                if (Array.isArray(bonus)) {
                    conditionProcs.push(...bonus.map((bonus) => bonus));
                } else if (bonus?.conditions) {
                    conditionProcs.push(action.bonus);
                }

                if (secondaryAction?.conditions) {
                    conditionProcs.push(secondaryAction);
                }

                if (Array.isArray(secondaryAction?.bonus)) {
                    conditionProcs.push(...secondaryAction?.bonus.map((bonus) => bonus));
                } else if (secondaryAction?.bonus?.conditions) {
                    conditionProcs.push(secondaryAction.bonus);
                }

                if (!conditionProcs.length) {
                    return;
                }

                if (action.target === TARGET_TYPES.HOSTILE || action.target === TARGET_TYPES.RANDOM_HOSTILE) {
                    return battle?.enemySide.some((combatant) => {
                        const getCalculationTarget = (calculationTarget: CONDITION_TARGETS) => {
                            if (calculationTarget === CONDITION_TARGETS.ACTOR) {
                                return playerInfo;
                            }

                            if (calculationTarget === CONDITION_TARGETS.TARGET) {
                                return findCombatantData(
                                    () => ({
                                        battle,
                                    }),
                                    combatant?.id
                                );
                            }
                        };

                        return combatant?.HP > 0 && conditionProcs.some((proc) => passesConditions({ getCalculationTarget, proc, source }));
                    });
                }

                return battle?.playerSide.some((combatant) => {
                    const getCalculationTarget = (calculationTarget: CONDITION_TARGETS) => {
                        if (calculationTarget === CONDITION_TARGETS.ACTOR) {
                            return playerInfo;
                        }

                        if (calculationTarget === CONDITION_TARGETS.TARGET) {
                            return findCombatantData(
                                () => ({
                                    battle,
                                }),
                                combatant?.id
                            );
                        }
                    };

                    return conditionProcs.some((proc) => passesConditions({ getCalculationTarget, proc, source }));
                });
            });
        }, [ability, battle?.enemySide, battle?.playerSide]);

        const armorStatistics = getArmorStatistics({ ability, playerInfo, deck, hand, discard });
        const { base: armorTotal, hasConditionFulfilled: hasArmorConditionFulfilled } = armorStatistics;
        const interpolatedDescription = interpolateAbilityDescription({ ability, playerInfo, deck, hand, discard });
        const showDescription = getLastPlayedCards({ player, amount: addLastPlayedCards?.amount }).length === 0;

        let hasMultiplier = false;
        let armorCornerIcon = false;
        let healingCornerIcon = false;

        const {
            healing,
            damage: selfDamage,
            resourceGain,
        } = actions
            .filter(({ target }) => target === TARGET_TYPES.SELF || target === TARGET_TYPES.FRIENDLY)
            .reduce((acc: any, action: Action) => {
                const { healing = 0, damage = 0, armor = 0, resources = 0 } = action;
                const multiplier = getMultiplier({
                    multiplier: action.multiplier,
                    actor: playerInfo,
                    deck,
                    hand,
                    discard,
                });
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
            if (baseDamage !== undefined) {
                return <DamageIcon damageStatistics={damageStatistics} />;
            }

            if (armorTotal > 0) {
                armorCornerIcon = true;
                return <ArmorIcon armorStatistics={armorStatistics} />;
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

        const hasBonus = hasDamageConditionFulfilled || hasArmorConditionFulfilled || hasConditionFulfilled;

        let minionAttackDamage = 0;
        let minionHostileAction = null;
        for (const ability of minion?.abilities || []) {
            for (const action of ability.actions) {
                if (action.target === TARGET_TYPES.RANDOM_HOSTILE || action.target === TARGET_TYPES.HOSTILE) {
                    minionHostileAction = action;
                    minionAttackDamage = action.damage || 0;
                    break;
                }
            }
        }

        const minionHostileEffect = (minionHostileAction?.effects || []).find((e) => e.class === EFFECT_CLASSES.DEBUFF);

        const taunt = minion?.effects?.some((e) => e.type === EFFECT_TYPES.TAUNT);

        const isAbilityUsable = canUseAbility(player, ability);
        const tributeSummon = minionOptions?.tributeSummon;
        const isLocked = ((ability as CombatAbility).effects || []).some((effect) => effect.isLocked);

        const getTextHighlight = (total: number, expected: number) => {
            if (total < expected) {
                return "negative";
            }

            if (total > expected) {
                return "positive";
            }
        };

        const shouldGlow =
            isAbilityUsable && !disableGlow && !disableConditionGlow && battle && (hasBonus || effects.some((e) => e.highlightCard));

        return (
            <AbilityTooltip ability={ability}>
                <div
                    className={classNames(classes.root, className, {
                        [classes.cursed]: type === ACTION_TYPES.HINDER,
                        "-selected": isSelected,
                        [classes.glow]: shouldGlow,
                    })}
                    {...other}
                >
                    <div
                        className={classNames({
                            [classes.cardLocked]: isLocked,
                        })}
                    >
                        <div
                            className={classNames(classes.cardBack, {
                                "-flipped": flipped,
                            })}
                        />
                        <div
                            onClick={onClick}
                            onMouseDown={onMouseDown}
                            className={classNames(classes.inner, {
                                [classes.selectedAbility]: isSelected,
                                [classes.ephemeral]: removeAfterTurn,
                                "-flipped": flipped,
                            })}
                            style={{ borderTop: `3px solid ${getAbilityColor(ability)}` }}
                        >
                            <span className={classes.header}>
                                {cornerIcon}
                                <span
                                    className={classNames(classes.name, {
                                        rare: ability.rarity === RARITIES.RARE,
                                        uncommon: ability.rarity === RARITIES.UNCOMMON,
                                    })}
                                >
                                    {name}{" "}
                                    {ability.level > 1 && (
                                        <span className={classes.abilityLevel}>
                                            {Array.from({ length: ability.level })
                                                .map(() => "⋆")
                                                .join("")}
                                        </span>
                                    )}
                                </span>{" "}
                                <AbilityResourceIcon
                                    ability={ability}
                                    player={player}
                                    disableBattleIndicators={disableBattleBonuses || !battle}
                                />
                            </span>
                            <div className={classes.portraitContainer}>{imageNode}</div>
                            <div className={classes.body}>
                                {(tributeSummon || taunt) && (
                                    <div>
                                        {tributeSummon && <span className={classes.bold}>Tribute.</span>}
                                        {taunt && <span className={classes.bold}> Taunt.</span>}
                                    </div>
                                )}
                                {preemptive && <div className={classes.bold}>Pre-emptive</div>}
                                {removeAfterTurn && <div className={classes.bold}>Ephemeral</div>}
                                {depletedOnUse && <div className={classes.bold}>Deplete</div>}
                                {ability.reusable && <div className={classes.bold}>Reusable</div>}
                                {unplayable && <div className={classes.bold}>Unplayable</div>}
                                <SelectCards ability={ability} />
                                {!overrideBodyText && <DrawCards ability={ability} playerClass={player?.class} />}
                                {!overrideBodyText && <Debuffs effects={getAllEffects(ability)} />}
                                {!overrideBodyText && numTargets > 0 && (
                                    <div>
                                        Hits up to +{numTargets} targets{" "}
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
                                {!armorCornerIcon && armorTotal > 0 && (
                                    <div>
                                        Gain{" "}
                                        <Icon
                                            icon={<ShieldIcon />}
                                            text={armorTotal}
                                            size={"sm"}
                                            highlightText={getTextHighlight(armorTotal, armorStatistics.base)}
                                        />
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
                                {!overrideBodyText && <CardsToAdd ability={ability} player={player} />}
                                {!overrideBodyText && (
                                    <BonusView ability={ability} player={player} deck={deck} hand={hand} discard={discard} />
                                )}
                                {!overrideBodyText && (
                                    <RadiateView ability={ability} playerInfo={playerInfo} deck={deck} hand={hand} discard={discard} />
                                )}
                                {!overrideBodyText && destroyArmor > 0 && <div>Destroy {destroyArmor * 100}% armor</div>}
                                {interpolatedDescription && showDescription && (
                                    <div dangerouslySetInnerHTML={{ __html: interpolatedDescription }} />
                                )}
                            </div>
                            <div className={classes.footer}>
                                {<Area ability={ability} playerInfo={playerInfo} deck={deck} hand={hand} discard={discard} />}
                                <AbilityTypeView targetType={targetType} type={type} minion={minion} />
                                {minion && (
                                    <div className={classes.minionStats}>
                                        <span className={classes.minionHPContainer}>
                                            <Icon icon={<HeartIcon />} text={minion.maxHP} />
                                            {minion.armor > 0 && (
                                                <Icon icon={ShieldIcon} size="sm" text={minion.armor} className={classes.minionArmor} />
                                            )}
                                        </span>
                                        <span className={classes.minionDamageContainer}>
                                            <Icon icon={<CrossedSwordsIcon />} text={minionAttackDamage} />
                                            {minionHostileEffect && (
                                                <Icon icon={minionHostileEffect.icon} size="sm" className={classes.minionAbilityEffect} />
                                            )}
                                            {minionHostileAction?.area > 0 && (
                                                <span className={classes.minionAbilityArea}>
                                                    <AreaIndicator {...minionHostileAction} size="sm" />
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    {isLocked && (
                        <div className={classes.locked}>
                            <LockIcon />
                        </div>
                    )}
                    <div className={classes.refContainer} ref={ref as any} />
                </div>
            </AbilityTooltip>
        );
    }
);

export default AbilityView;
