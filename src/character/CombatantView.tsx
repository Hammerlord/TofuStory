import classNames from "classnames";
import { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
import { ACTION_TYPES, EFFECT_TYPES } from "../ability/types";
import { Zzz, Dizzy, ClickIndicator, Heart, CrossedSwords } from "../images";
import HitIcon from "../icon/HitIcon";
import { getCharacterStatChanges } from "../battle/utils";
import { getActionType, isAttack } from "../ability/utils";
import Icon from "../icon/Icon";
import Bleed from "../icon/Bleed";
import Armor from "../icon/Armor";
import HealIcon from "../icon/HealIcon";

const useStyles = createUseStyles({
    root: {
        minWidth: "20%",
        cursor: "pointer",
        position: "relative",

        "&.-highlighted img": {
            WebkitFilter: "drop-shadow(0 0 3px #45ff61) drop-shadow(0 0 3px #45ff61)",
            filter: "drop-shadow(0 0 3px #45ff61) drop-shadow(0 0 3px #45ff61)",
        },

        "&.-selected img": {
            WebkitFilter: "drop-shadow(0 0 2px #ff3f38) drop-shadow(0 0 2px #ff3f38)",
            filter: "drop-shadow(0 0 2px #ff3f38) drop-shadow(0 0 2px #ff3f38)",
        },
    },
    header: {
        textAlign: "center",
        left: "50%",
        top: "-16px",
        transform: "translateX(-50%)",
        position: "absolute",
    },
    inner: {
        padding: "16px 32px",
    },
    portrait: {
        maxWidth: "100%",
        maxHeight: "100%",
        minWidth: "50px",
        margin: "auto",
        alignSelf: "flex-end",
    },
    portraitContainer: {
        position: "relative",
        height: "125px",
        display: "flex",
    },
    HP: {
        position: "absolute",
        left: "-8px",
        bottom: "-8px",
    },
    rightContainer: {
        position: "absolute",
        right: "-8px",
        bottom: "-8px",
        display: "flex",
        flexDirection: "column",
    },
    center: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translateX(-50%) translateY(-50%)",
        height: "100%",
        width: "100%",
    },
    "@keyframes upAndDown": {
        from: {
            transform: "translateY(0)",
        },
        to: {
            transform: "translateY(8px)",
        },
    },
    targetAffectedIndicatorContainer: {
        position: "absolute",
        top: "-48px",
        left: "50%",
        transform: "translateX(-50%)",
    },
    "@keyframes actionIcon": {
        from: {
            transform: "translateY(0)",
            opacity: 3,
        },
        to: {
            transform: "translateY(-24px)",
            opacity: 0,
        },
    },
    actionIcon: {
        width: "48px",
        height: "48px",
        position: "absolute",
        right: "8px",
        top: "24px",
        animation: "$actionIcon 1s forwards",
    },
    "@keyframes enemyActing": {
        from: {
            transform: "translateY(0)",
        },
        to: {
            transform: "translateY(24px)",
        },
    },
    enemyActing: {
        animationName: "$enemyActing",
        animationDuration: "0.5s",
    },
    "@keyframes allyActing": {
        from: {
            transform: "translateY(0)",
        },
        to: {
            transform: "translateY(-24px)",
        },
    },
    allyActing: {
        animationName: "$allyActing",
        animationDuration: "0.5s",
    },
    "@keyframes casting": {
        '0%': {
            WebkitFilter: "brightness(1) drop-shadow(0 0 1px #fffee8) drop-shadow(0 0 1px #fffee8)",
            filter: "brightness(1) drop-shadow(0 0 1px #fffee8) drop-shadow(0 0 1px #fffee8)",
            transform: "translateY(0)",
        },

        '75%': {
            WebkitFilter:
                "brightness(1.5) drop-shadow(0 0 10px #fffee8) drop-shadow(0 0 5px #fffee8)",
            filter: "brightness(1.5) drop-shadow(0 0 10px #fffee8) drop-shadow(0 0 5px #fffee8)",
            transform: "translateY(-24px)",
        },

        '100%': {
            WebkitFilter: "brightness(1) drop-shadow(0 0 5px #fffee8) drop-shadow(0 0 1px #fffee8)",
            filter: "brightness(1) drop-shadow(0 0 5px #fffee8) drop-shadow(0 0 1px #fffee8)",
        }
    },
    casting: {
        animationDuration: "1s",
        animationName: "$casting",
        transition: "1s filter linear, 1s -webkit-filter linear",
    },
    stun: {
        width: "48px",
        height: "48px",
        position: "absolute",
        left: "40%",
        top: "16px",
        animationName: "$upAndDown",
        animationDuration: "1s",
        animationIterationCount: "infinite",
        animationDirection: "alternate-reverse",
    },
    bleed: {
        display: "flex",
        position: "absolute",
        top: "-8px",
        left: "50%",
        transform: "translateX(-50%)",
    },
    highlightText: {
        "& .text": {
            color: "#42f57b",
        },
    },
});

const CombatantView = ({
    combatant,
    onClick,
    isTargeted,
    action,
    isAlly,
    isSelected,
    isHighlighted,
    ...other
}) => {
    const [statChanges, setStatChanges]: [any, Function] = useState({});
    const [oldCombatantState, setOldEnemyState] = useState(combatant);
    const classes = useStyles({ isAlly } as any); // Not using theme, just passing a prop in

    useEffect(() => {
        if (
            combatant === null ||
            oldCombatantState === null ||
            oldCombatantState.id !== combatant.id
        ) {
            setOldEnemyState(combatant);
            return;
        }

        const statChanges = getCharacterStatChanges({
            oldCharacter: oldCombatantState,
            newCharacter: combatant,
        });

        setStatChanges(statChanges);
        setOldEnemyState(combatant);
    }, [combatant]);

    const hasAilment = (type: EFFECT_TYPES) => {
        return combatant?.effects?.some((effect) => effect.type === type);
    };

    const isStunned = hasAilment(EFFECT_TYPES.STUN);
    const bleeds = combatant?.effects?.filter((effect) => effect.type === EFFECT_TYPES.BLEED) || [];
    const damageFromEffects = combatant?.effects?.reduce(
        (acc: number, { damage = 0 }) => acc + damage,
        0
    );
    const totalDamage = (combatant?.damage || 0) + damageFromEffects;

    return (
        <div
            className={classNames(classes.root, {
                "-selected": isSelected,
                "-highlighted": isHighlighted,
            })}
            onClick={onClick}
            {...other}
        >
            <div className={classes.inner}>
                {isTargeted && (
                    <span className={classes.targetAffectedIndicatorContainer}>
                        <Icon icon={ClickIndicator} />
                    </span>
                )}
                {combatant && (
                    <>
                        {combatant.HP > 0 && (
                            <div className={classes.header}>
                                <span>{combatant.name}</span>
                            </div>
                        )}
                        <div className={classes.portraitContainer}>
                            {combatant.HP > 0 && (
                                <>
                                    <img
                                        className={classNames(classes.portrait, {
                                            [classes.enemyActing]: isAttack(action) && !isAlly,
                                            [classes.allyActing]: isAttack(action) && isAlly,
                                            [classes.casting]: getActionType(action) === ACTION_TYPES.CASTING,
                                        })}
                                        src={combatant.image}
                                    />
                                    <Icon
                                        className={classes.HP}
                                        icon={<Heart />}
                                        size={"lg"}
                                        text={combatant.HP}
                                    />
                                    <div className={classes.rightContainer}>
                                        {totalDamage > 0 && (
                                            <Icon
                                                icon={<CrossedSwords />}
                                                size={"lg"}
                                                text={totalDamage}
                                                className={classNames({
                                                    [classes.highlightText]: damageFromEffects > 0,
                                                })}
                                            />
                                        )}
                                        {combatant.armor > 0 && <Armor amount={combatant.armor} />}
                                    </div>

                                    {isStunned && (
                                        <Icon icon={<Dizzy />} size="xl" className={classes.stun} />
                                    )}
                                    <div className={classes.bleed}>
                                        {bleeds.map((bleed, i: number) => (
                                            <Bleed key={i} amount={bleed.duration} />
                                        ))}
                                    </div>
                                    {getActionType(action) === ACTION_TYPES.NONE && (
                                        <Icon
                                            icon={<Zzz />}
                                            size="xl"
                                            className={classes.actionIcon}
                                        />
                                    )}
                                </>
                            )}
                            {
                                <span className={classes.center}>
                                    <HitIcon statChanges={statChanges} />
                                </span>
                            }
                            {
                                <span className={classes.center}>
                                    <HealIcon statChanges={statChanges} />
                                </span>
                            }
                        </div>
                        <div>
                            {combatant.effects?.map((effect, i) =>
                                effect.icon ? <Icon icon={effect.icon} key={i} /> : null
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default CombatantView;
