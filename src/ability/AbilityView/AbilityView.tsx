import { Box } from "@mui/material";
import classNames from "classnames";
import { FC, Ref, useEffect, useMemo, useRef } from "react";
import { createUseStyles } from "react-jss";
import { findCombatantData } from "../../battle/actions/combatantData";
import { canUsePlayerAbility } from "../../battle/actions/playerAbility";
import { getMultiplier } from "../../battle/getMultiplier";
import { passesConditions } from "../../battle/passesConditions";
import { BATTLE_STATES } from "../../battle/states";
import {
    ActionContext,
    CombatantInfo,
    NonCombatPlayerInfo,
    TRIGGER_SOURCE_TYPES,
    TriggerSource,
} from "../../battle/types";
import { Combatant, Player } from "../../character/types";
import { useAppSelector } from "../../hooks";
import Icon from "../../icon/Icon";
import { AlchemistStoneImage, CriticalShotImage, MapleLeavesImage } from "../../images";
import { CrossedSwordsIcon, HeartIcon, LockIcon, ShieldIcon } from "../../images/icons";
import { PLAYER_CLASSES } from "../../Menu/types";
import { RARITIES } from "../../item/types";
import { interpolateAbilityDescription } from "../descriptionInterpolation";
import {
    ACTION_TYPES,
    Ability,
    AbilityEffect,
    Action,
    ActionOptionalProperties,
    Bonus,
    CONDITION_TARGETS,
    CombatAbility,
    Condition,
    EFFECT_CLASSES,
    EFFECT_TYPES,
    Effect,
    TARGET_TYPES,
} from "../types";
import AbilityTooltip from "./AbilityTooltip";
import AbilityTypeView from "./AbilityTypeView";
import Area, { AreaIndicator } from "./AreaView";
import ArmorIcon, { getArmorStatistics } from "./ArmorIcon";
import CardsToAdd from "./CardsToAdd";
import { CHARGED, CARD_WIDTH, CRITICAL_KEYWORD } from "./constants";
import DamageIcon, { getDamageStatistics } from "./DamageIcon";
import AbilityResourceIcon, { ResourceIcon } from "./ResourceIcon";
import { abilityHasConditionTag, getAbilityColor, getLastPlayedCards } from "./utils";
import { lookupEffect } from "../../character/effects/createCombatEffect";

const useStyles = createUseStyles({
    root: {
        position: "relative",
        // Create a stacking context so the negative-z-index border ring paints
        // reliably behind the card's content for every state (not just when
        // transformed/selected), and never disappears behind ancestor backgrounds.
        isolation: "isolate",
        transition: "transform 0.15s",
        display: "inline-block",
        "&:hover": {
            transform: "scale(1.1)",
            zIndex: 5,
        },
        "&:after": {
            content: "''",
            position: "absolute",
            inset: "-3px",
            borderRadius: "9px",
            zIndex: -1,
            pointerEvents: "none",
            backgroundSize: "300% 300%",
            animationName: "$borderFlow",
            animationDuration: "2.5s",
            animationIterationCount: "infinite",
            animationTimingFunction: "linear",
            opacity: 0,
            transition: "opacity 0.15s",
        },
        // Second ring that expands outward and fades out ("ping"), used to make the
        // bonus borders shine. Hidden by default; enabled alongside the glow states.
        "&:before": {
            content: "''",
            position: "absolute",
            inset: "-3px",
            borderRadius: "9px",
            zIndex: -1,
            pointerEvents: "none",
            backgroundSize: "300% 300%",
            transformOrigin: "50% 50%",
            opacity: 0,
            animationName: "$borderPulse",
            animationDuration: "1.6s",
            animationIterationCount: "infinite",
            animationTimingFunction: "ease-out",
        },
        "&.-selected": {
            transform: "translateY(-16px) scale(1.1)",
            zIndex: 5,
        },
        "&.-selected:after": {
            background: "linear-gradient(45deg, #7fd4ff, #1e90ff, #00e5ff, #3f7bff, #7fd4ff)",
            boxShadow: "0 0 12px rgba(30, 144, 255, 0.45)",
            opacity: 1,
        },
        // A card with a bonus/highlight that is also selected gets a green border
        "&.-selected.glow:after, &.-selected.glowOrange:after": {
            background: "linear-gradient(45deg, #8dff9e, #19d94c, #00e676, #1e9e43, #8dff9e)",
            boxShadow: "0 0 12px rgba(46, 200, 80, 0.45)",
            opacity: 1,
        },
        "&.-selected.glow:before, &.-selected.glowOrange:before": {
            background: "linear-gradient(45deg, #8dff9e, #19d94c, #00e676, #1e9e43, #8dff9e)",
            opacity: 1,
        },
    },
    inner: {
        border: "1px solid rgba(0, 0, 0, 0.5)",
        width: `${CARD_WIDTH}px`,
        maxWidth: `${CARD_WIDTH}px`,
        boxSizing: "border-box",
        height: "255px",
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
        position: "absolute",
        width: `${CARD_WIDTH}px`,
        boxSizing: "border-box",
        maxWidth: `${CARD_WIDTH}px`,
        left: 0,
        padding: "0 10px",
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
    minionBuff: {
        position: "absolute",
        right: -10,
        top: -10,
        display: "flex",
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
    body: {
        minHeight: "80px",
        marginTop: "124px",
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
    "@keyframes borderFlow": {
        "0%": {
            backgroundPosition: "0% 50%",
        },
        "50%": {
            backgroundPosition: "100% 50%",
        },
        "100%": {
            backgroundPosition: "0% 50%",
        },
    },
    "@keyframes borderPulse": {
        "0%": {
            transform: "scale(1)",
            opacity: 0.55,
        },
        "70%": {
            transform: "scale(1.18)",
            opacity: 0,
        },
        "100%": {
            transform: "scale(1.18)",
            opacity: 0,
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
        "&:after": {
            background: "linear-gradient(45deg, #ffed7a, #ffc400, #ffdf4d, #ffb300, #ffed7a)",
            boxShadow: "0 0 12px rgba(255, 200, 0, 0.45)",
            opacity: 1,
        },
        "&:before": {
            background: "linear-gradient(45deg, #ffed7a, #ffc400, #ffdf4d, #ffb300, #ffed7a)",
            opacity: 1,
        },
    },
    glowOrange: {
        "&:after": {
            background: "linear-gradient(45deg, #ffc46b, #ff9100, #ffab3d, #ff6d00, #ffc46b)",
            boxShadow: "0 0 12px rgba(255, 140, 0, 0.45)",
            opacity: 1,
        },
        "&:before": {
            background: "linear-gradient(45deg, #ffc46b, #ff9100, #ffab3d, #ff6d00, #ffc46b)",
            opacity: 1,
        },
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
    unplayable: {
        filter: "saturate(0.25)",
    },
});

interface AbilityViewProps {
    onClick?: (event: any) => void;
    onMouseDown?: (event: any) => void;
    isSelected?: boolean;
    onBonusChange?: (hasBonus: boolean) => void;
    ability: CombatAbility | Ability;
    className?: string;
    // Eg. when viewing cards during card reward, the cards should not glow
    disableGlow?: boolean;
    // Eg. when viewing cards during card rewards, the cards should not have temporary in-battle bonuses applied to them
    disableBattleBonuses?: boolean;
    // If true, the backside of the card is shown
    flipped?: boolean;
    style?: any;
    highlightResource?: boolean;
    highlightDamage?: boolean;
    highlightArmor?: boolean;
    ref?: Ref<HTMLDivElement>;
}

const LevelView = ({ level }: { level: number }) => {
    level = level || 1;
    const classes = useStyles();

    if (level === 1) {
        return null;
    }

    if (level > 10) {
        return <span className={classes.abilityLevel}>lvl {level}</span>;
    }
    return (
        <span className={classes.abilityLevel}>
            {Array.from({ length: level })
                .map(() => "⋆")
                .join("")}
        </span>
    );
};

const AbilityView = ({
    onClick,
    onMouseDown,
    isSelected,
    onBonusChange,
    ability,
    className,
    disableGlow,
    disableBattleBonuses,
    flipped,
    highlightResource,
    highlightDamage,
    highlightArmor,
    ref,
    ...other
}: AbilityViewProps) => {
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
        retain,
    } = ability;

    const {
        target: targetType,
        type,
        secondaryDamage,
        destroyArmor = 0,
        numExtraTargets: numTargets = 0,
        addLastPlayedCards,
    } = actions[0] || {};
    const cardImage = image || minion?.image;
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

    let playerInfo: NonCombatPlayerInfo | CombatantInfo | undefined;
    if (disableBattleBonuses || !battle) {
        if (character.player) {
            playerInfo = { combatant: character.player };
        }
    } else if (battle) {
        playerInfo = findCombatantData(battle, character.player?.id);
    }

    const player = playerInfo?.combatant as Player;

    // Depending on whether we want to show combat bonuses based on your current hand, deck, etc., grab those objects from either state
    const {
        hand = [],
        deck = [],
        discard = [],
    } = (() => {
        if (disableBattleBonuses || !battle) {
            return { deck: [], hand: [], discard: [] };
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

    const source: TriggerSource = {
        type: TRIGGER_SOURCE_TYPES.ABILITY,
        source: ability,
        actorId: player?.id,
    };

    const hasConditionFulfilled = useMemo(() => {
        return actions.some((action: Action) => {
            const conditionProcs: {
                conditions?: Condition[];
                conditionOperator?: "and" | "or";
            }[] = [];
            const { conditions, bonus, secondaryAction } = action;

            if (conditions) {
                conditionProcs.push(action);
            }

            if (Array.isArray(bonus)) {
                conditionProcs.push(...bonus);
            } else if (bonus?.conditions) {
                if (Array.isArray(action.bonus)) {
                    conditionProcs.push(...action.bonus);
                } else if (action.bonus) {
                    conditionProcs.push(action.bonus);
                }
            }

            if (secondaryAction?.conditions) {
                conditionProcs.push(secondaryAction);
            }

            if (Array.isArray(secondaryAction?.bonus)) {
                conditionProcs.push(...secondaryAction?.bonus);
            } else if (secondaryAction?.bonus?.conditions) {
                conditionProcs.push(secondaryAction.bonus);
            }

            if (!conditionProcs.length) {
                return;
            }

            const context: ActionContext = {
                name: "Ability View",
                sourceChain: [source],
            };

            if (
                action.target === TARGET_TYPES.HOSTILE ||
                action.target === TARGET_TYPES.RANDOM_HOSTILE
            ) {
                return battle?.enemySide.some((combatant: Combatant | null) => {
                    return (
                        combatant &&
                        combatant.HP > 0 &&
                        conditionProcs.some((proc) =>
                            passesConditions({
                                actor: playerInfo,
                                target: findCombatantData(battle, combatant?.id),
                                proc,
                                context,
                                battle,
                            }),
                        )
                    );
                });
            }

            return battle?.playerSide.some((combatant: Combatant | null) => {
                return conditionProcs.some((proc) =>
                    passesConditions({
                        actor: playerInfo,
                        target: findCombatantData(battle, combatant?.id),
                        proc,
                        context,
                        battle,
                    }),
                );
            });
        });
    }, [ability, battle?.enemySide, battle?.playerSide]);

    const armorStatistics = getArmorStatistics({
        ability,
        playerInfo,
        deck,
        hand,
        discard,
    });
    const { base: armorTotal, hasConditionFulfilled: hasArmorConditionFulfilled } = armorStatistics;
    const interpolatedDescription = interpolateAbilityDescription({
        ability,
        playerInfo,
        deck,
        hand,
        discard,
    });
    const showDescription =
        getLastPlayedCards({ player, amount: addLastPlayedCards?.amount }).length === 0;

    let hasMultiplier = false;
    let armorCornerIcon = false;
    let healingCornerIcon = false;

    const {
        healing,
        damage: selfDamage,
        resourceGain,
    } = actions
        .filter(
            (action: Action) =>
                action.target === TARGET_TYPES.SELF || action.target === TARGET_TYPES.FRIENDLY,
        )
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

    const showCritical = effects.some((e) => e.name === CRITICAL_KEYWORD);

    const showCharged =
        player?.class === PLAYER_CLASSES.MAGICIAN &&
        abilityHasConditionTag(ability, CHARGED) &&
        player.effects?.some((effect) => effect.name === "Charged");

    const cornerIcons = (() => {
        const icons = [];
        if (baseDamage !== undefined) {
            icons.push(
                <DamageIcon
                    damageStatistics={damageStatistics}
                    key="damage"
                    highlightText={highlightDamage}
                />,
            );
        }

        if (armorTotal > 0) {
            armorCornerIcon = true;
            icons.push(
                <ArmorIcon
                    armorStatistics={armorStatistics}
                    key="armor"
                    highlightText={highlightArmor}
                />,
            );
        }

        if (healing > 0) {
            healingCornerIcon = true;
            icons.push(
                <Icon
                    icon={<HeartIcon />}
                    text={healing}
                    className={classNames({
                        [classes.highlightText]: hasMultiplier,
                    })}
                    key="healing"
                />,
            );
        }

        if (showCritical) {
            const CriticalIcon = (
                <Icon icon={CriticalShotImage} highlightIcon size="sm" key="critical" />
            );
            icons.push(CriticalIcon);
        } else {
            icons.push(<div className={classes.iconPlaceholder} key="placeholder" />);
        }

        if (showCharged) {
            const ChargedIcon = (
                <Icon icon={AlchemistStoneImage} highlightIcon size="sm" key="charged" />
            );
            icons.push(ChargedIcon);
        }
        return icons;
    })();

    const hasBonus =
        hasDamageConditionFulfilled || hasArmorConditionFulfilled || hasConditionFulfilled;

    let minionAttackDamage = 0;
    let minionHostileAction: Action | null = null;
    const { effects: minionEffects = [], abilities: minionAbilities = [] } = minion || {};

    for (const ability of minionAbilities) {
        for (const action of ability.actions) {
            if (
                action.target === TARGET_TYPES.RANDOM_HOSTILE ||
                action.target === TARGET_TYPES.HOSTILE
            ) {
                minionHostileAction = action;
                minionAttackDamage = action.damage || 0;
                break;
            }
        }
    }

    const minionHostileEffect = (minionHostileAction?.effects || [])
        .map(lookupEffect)
        .find((e: Effect) => e.class === EFFECT_CLASSES.DEBUFF);
    const minionDefensiveEffect = minionEffects
        .map(lookupEffect)
        .find((e: Effect) => e.class === EFFECT_CLASSES.BUFF);
    const taunt = minionEffects
        .map(lookupEffect)
        .some((e: Effect) => e.type === EFFECT_TYPES.TAUNT);

    const isAbilityUsable = canUsePlayerAbility(player, ability);
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

    const inBattle = battle && battle.state !== BATTLE_STATES.VICTORY;
    const shouldGlow = isAbilityUsable && !disableGlow && !disableConditionGlow && inBattle;
    const glowStacks: number = [
        hasBonus,
        ...effects.map((e: AbilityEffect) => e.highlightCard),
    ].reduce((acc, cur: boolean | undefined) => {
        const stacks = cur ? 1 : 0;
        return acc + stacks;
    }, 0);

    // The same predicate that decides whether the bonus border actually paints
    // (classes.glow / classes.glowOrange), reported so parents can layer these cards.
    const isShowingBonus = Boolean(shouldGlow && glowStacks > 0);
    const onBonusChangeRef = useRef(onBonusChange);
    onBonusChangeRef.current = onBonusChange;

    useEffect(() => {
        onBonusChangeRef.current?.(isShowingBonus);
    }, [isShowingBonus]);
    const cannotBePlayed =
        inBattle &&
        (isLocked || (unplayable && !effects.some((e: AbilityEffect) => e.bypassUnplayable)));

    const keywords: string[] = [];
    if (preemptive) {
        keywords.push("Pre-emptive");
    }
    if (removeAfterTurn) {
        keywords.push("Ephemeral");
    }
    if (depletedOnUse) {
        keywords.push("Deplete");
    }
    if (ability.reusable) {
        keywords.push("Reusable");
    }
    if (unplayable) {
        keywords.push("Unplayable");
    }
    if (retain) {
        keywords.push("Retain");
    }
    const keywordHtml = keywords.map((keyword) => `<b>${keyword}.</b>`).join(" ");

    return (
        <AbilityTooltip ability={ability}>
            <div
                className={classNames(classes.root, className, {
                    [classes.cursed]: type === ACTION_TYPES.HINDER,
                    "-selected": isSelected,
                    [classes.glow]: shouldGlow && glowStacks === 1,
                    [classes.glowOrange]: shouldGlow && glowStacks > 1,
                })}
                {...other}
            >
                <div
                    className={classNames({
                        [classes.unplayable]: cannotBePlayed,
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
                            [classes.ephemeral]: removeAfterTurn,
                            "-flipped": flipped,
                        })}
                        style={{ borderTop: `3px solid ${getAbilityColor(ability)}` }}
                    >
                        <span className={classes.header}>
                            <Box sx={{ display: "flex", flexDirection: "column" }} component="span">
                                {cornerIcons}
                            </Box>
                            <span
                                className={classNames(classes.name, {
                                    rare: ability.rarity === RARITIES.RARE,
                                    uncommon: ability.rarity === RARITIES.UNCOMMON,
                                })}
                            >
                                {name} <LevelView level={ability.level || 1} />
                            </span>
                            <AbilityResourceIcon
                                ability={ability}
                                player={player}
                                disableBattleIndicators={disableBattleBonuses || !battle}
                                highlightResourceCount={highlightResource}
                            />
                        </span>
                        <div className={classes.portraitContainer}>{imageNode}</div>
                        <div className={classes.body}>
                            {(tributeSummon || taunt) && (
                                <div>
                                    {tributeSummon && <span className={classes.bold}>Tribute</span>}
                                    {taunt && <span className={classes.bold}> Taunt</span>}
                                </div>
                            )}
                            {!healingCornerIcon && healing > 0 && (
                                <div>
                                    Heal for{" "}
                                    <Icon icon={<HeartIcon />} text={healing} size={"sm"} />
                                </div>
                            )}
                            {!overrideBodyText && (
                                <>
                                    {numTargets > 0 && (
                                        <div>
                                            Hits up to +{numTargets} targets{" "}
                                            {secondaryDamage && (
                                                <>
                                                    for{" "}
                                                    <Icon
                                                        icon={<CrossedSwordsIcon />}
                                                        text={secondaryDamage}
                                                        size="sm"
                                                    />{" "}
                                                </>
                                            )}
                                        </div>
                                    )}

                                    {!armorCornerIcon && armorTotal > 0 && (
                                        <div>
                                            Gain{" "}
                                            <Icon
                                                icon={<ShieldIcon />}
                                                text={armorTotal}
                                                size="sm"
                                                highlightText={getTextHighlight(
                                                    armorTotal,
                                                    armorStatistics.base,
                                                )}
                                            />
                                        </div>
                                    )}

                                    {resourceGain > 0 && (
                                        <div>
                                            Gain{" "}
                                            <ResourceIcon
                                                text={resourceGain}
                                                size="sm"
                                                playerClass={player?.class}
                                            />
                                        </div>
                                    )}

                                    {selfDamage > 0 && (
                                        <div>
                                            Self-inflict{" "}
                                            <Icon
                                                icon={<CrossedSwordsIcon />}
                                                text={selfDamage}
                                                size="sm"
                                            />
                                        </div>
                                    )}

                                    <CardsToAdd ability={ability} player={player} />

                                    {destroyArmor > 0 && (
                                        <div>Destroy {destroyArmor * 100}% armor</div>
                                    )}
                                </>
                            )}
                            {interpolatedDescription && showDescription && (
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: `${keywordHtml ? `${keywordHtml} ` : ""}${interpolatedDescription}`,
                                    }}
                                />
                            )}
                            {keywords.length > 0 &&
                                !(interpolatedDescription && showDescription) &&
                                keywords.map((keyword) => (
                                    <div className={classes.bold} key={keyword}>
                                        {keyword}
                                    </div>
                                ))}
                        </div>
                        <div className={classes.footer}>
                            {
                                <Area
                                    ability={ability}
                                    playerInfo={playerInfo}
                                    deck={deck}
                                    hand={hand}
                                    discard={discard}
                                    battle={battle}
                                />
                            }
                            <AbilityTypeView targetType={targetType} type={type} minion={minion} />
                            {minion && (
                                <div className={classes.minionStats}>
                                    <span className={classes.minionHPContainer}>
                                        <Icon icon={<HeartIcon />} text={minion.maxHP} />
                                        <span className={classes.minionBuff}>
                                            {(minion.armor || 0) > 0 && (
                                                <Icon
                                                    icon={ShieldIcon}
                                                    size="sm"
                                                    text={minion.armor}
                                                />
                                            )}
                                            {minionDefensiveEffect && (
                                                <Icon icon={minionDefensiveEffect.icon} size="sm" />
                                            )}
                                        </span>
                                    </span>
                                    <span className={classes.minionDamageContainer}>
                                        <Icon
                                            icon={<CrossedSwordsIcon />}
                                            text={minionAttackDamage}
                                        />
                                        {minionHostileEffect && (
                                            <Icon
                                                icon={minionHostileEffect.icon}
                                                size="sm"
                                                className={classes.minionAbilityEffect}
                                            />
                                        )}
                                        {(minionHostileAction?.area || 0) > 0 && (
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
                <div className={classes.refContainer} ref={ref} />
            </div>
        </AbilityTooltip>
    );
};

export default AbilityView;
