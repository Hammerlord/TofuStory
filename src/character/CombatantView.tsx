import classNames from "classnames";
import { createRef, forwardRef, useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
import { ACTION_TYPES, EFFECT_TYPES } from "../ability/types";
import { getActionType, isAttack } from "../ability/utils";
import { getCharacterStatChanges } from "../battle/utils";
import Armor from "../icon/Armor";
import Bleed from "../icon/Bleed";
import CastingIndicator from "../icon/CastingIndicator";
import EffectIcon from "../icon/EffectIcon";
import HealIcon from "../icon/HealIcon";
import HitIcon from "../icon/HitIcon";
import Icon from "../icon/Icon";
import { ClickIndicator, CrossedSwords, Dizzy, Heart, Zzz } from "../images";
import Reticle from "./Reticle";

const useStyles = createUseStyles({
    root: {
        minWidth: "20%",
        margin: "0 1vw",
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
    reticle: {
        width: "100%",
        height: "100%",
        position: "absolute",
        left: "0",
        top: "0",
    },
    header: {
        textAlign: "center",
        left: "50%",
        bottom: "100%",
        transform: "translateX(-50%)",
        position: "absolute",
    },
    inner: {
        height: "100%",
        width: "100%",
    },
    portrait: {
        maxHeight: "100%",
        width: "100%",
        margin: "0 auto",
        alignSelf: "flex-end",

        "& > img": {
            minWidth: "50%",
            minHeight: "40%",
            objectFit: "contain",
        },
    },
    combatantContainer: {
        display: "flex",
        position: "absolute",
        bottom: "24px",
        left: "50%",
        transform: "translateX(-50%)",
        minWidth: "100px",
        height: " 80%",
        width: "80%",
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
    "@keyframes casting": {
        "0%": {
            WebkitFilter: "brightness(1) drop-shadow(0 0 1px #fffee8) drop-shadow(0 0 1px #fffee8)",
            filter: "brightness(1) drop-shadow(0 0 1px #fffee8) drop-shadow(0 0 1px #fffee8)",
        },
        "75%": {
            WebkitFilter: "brightness(1.25) drop-shadow(0 0 10px #fffee8) drop-shadow(0 0 5px #fffee8)",
            filter: "brightness(1.25) drop-shadow(0 0 10px #fffee8) drop-shadow(0 0 5px #fffee8)",
        },
        "100%": {
            WebkitFilter: "brightness(1) drop-shadow(0 0 1px #fffee8) drop-shadow(0 0 1px #fffee8)",
            filter: "brightness(1) drop-shadow(0 0 1px #fffee8) drop-shadow(0 0 1px #fffee8)",
        },
    },
    casting: {
        animationDuration: "1s",
        animationName: "$casting",
        transition: "1s filter linear, 1s -webkit-filter linear",
        animationIterationCount: "infinite",
    },
    "@keyframes applyEffect": {
        "0%": {
            WebkitFilter: "brightness(1) drop-shadow(0 0 1px #fffee8) drop-shadow(0 0 1px #fffee8)",
            filter: "brightness(1) drop-shadow(0 0 1px #fffee8) drop-shadow(0 0 1px #fffee8)",
            transform: "translateY(0)",
        },

        "75%": {
            WebkitFilter: "brightness(1.5) drop-shadow(0 0 10px #fffee8) drop-shadow(0 0 5px #fffee8)",
            filter: "brightness(1.5) drop-shadow(0 0 10px #fffee8) drop-shadow(0 0 5px #fffee8)",
            transform: "translateY(-24px)",
        },

        "100%": {
            WebkitFilter: "brightness(1) drop-shadow(0 0 5px #fffee8) drop-shadow(0 0 1px #fffee8)",
            filter: "brightness(1) drop-shadow(0 0 5px #fffee8) drop-shadow(0 0 1px #fffee8)",
        },
    },
    applyingEffect: {
        animationDuration: "1s",
        animationName: "$applyEffect",
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
    effectsContainer: {
        position: "absolute",
        bottom: "-24px",
        left: "50%",
        transform: "translateX(-50%)",
    },
});

const CombatantView = forwardRef(
    ({ combatant, onClick, isTargeted, event, isAlly, isSelected, isHighlighted, showReticle, ...other }: any, ref) => {
        const [statChanges, setStatChanges]: [any, Function] = useState({});
        const [oldState, setOldState] = useState(combatant);
        const [portraitRef] = useState(createRef() as React.RefObject<any>);
        const classes = useStyles();
        useEffect(() => {
            if (!combatant || !oldState || oldState.id !== combatant.id) {
                setOldState(combatant);
                return;
            }

            const statChanges = getCharacterStatChanges({
                oldCharacter: oldState,
                newCharacter: combatant,
            });

            setTimeout(() => {
                setStatChanges(statChanges);
                setOldState(combatant);
            }, 300);
        }, [combatant]);

        useEffect(() => {
            if (isAttack(event.action) && event.target) {
                const getTargetPoint = (rect) => {
                    const { x, y, height, width } = rect;
                    return {
                        x: x + width / 2,
                        y: y + height / 2,
                    };
                };
                const { x, y } = getTargetPoint(portraitRef.current.getBoundingClientRect());
                const { x: x2, y: y2 } = getTargetPoint(event.target.getBoundingClientRect());
                const increments = 50;
                const moveIncrementX = (x2 - x) / increments;
                const moveIncrementY = (y2 - y) / increments;
                let i = 1;
                let direction = 1;
                const move = () => {
                    const xPos = i * moveIncrementX;
                    const yPos = i * moveIncrementY;
                    portraitRef.current.style.transform = `translateX(${xPos}px) translateY(${yPos}px)`;

                    if (direction === 1) {
                        ++i;

                        if (i > increments) {
                            direction = -1;
                        }

                        setTimeout(() => {
                            move();
                        });
                    } else {
                        --i;

                        if (i > 0) {
                            setTimeout(() => {
                                move();
                            });
                        } else {
                            portraitRef.current.style.transform = "unset";
                        }
                    }
                };
                move();
            }
        }, [event.action]);

        const hasAilment = (type: EFFECT_TYPES) => {
            return oldState?.effects?.some((effect) => effect.type === type);
        };

        const isStunned = hasAilment(EFFECT_TYPES.STUN);
        const bleeds = oldState?.effects?.filter((effect) => effect.type === EFFECT_TYPES.BLEED) || [];
        const damageFromEffects = oldState?.effects?.reduce((acc: number, { damage = 0 }) => acc + damage, 0);
        const totalDamage = (oldState?.damage || 0) + damageFromEffects;

        return (
            <div
                className={classNames(classes.root, {
                    "-selected": isSelected,
                    "-highlighted": isHighlighted,
                })}
                onClick={onClick}
                {...other}
                ref={ref}
            >
                <div className={classes.inner}>
                    {isTargeted && (
                        <span className={classes.targetAffectedIndicatorContainer}>
                            <Icon icon={ClickIndicator} />
                        </span>
                    )}
                    {oldState && (
                        <>
                            {oldState.HP > 0 && (
                                <div className={classes.header}>
                                    {oldState.casting && <CastingIndicator casting={oldState.casting} combatant={oldState} />}
                                    <span>{oldState.name}</span>
                                </div>
                            )}
                            <div className={classes.combatantContainer}>
                                <span
                                    ref={portraitRef}
                                    className={classNames(classes.portrait, {
                                        [classes.applyingEffect]: getActionType(event.action) === ACTION_TYPES.EFFECT,
                                        [classes.casting]: oldState.casting,
                                    })}
                                >
                                    {oldState.HP > 0 && <img src={oldState.image} />}

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
                                </span>
                                {oldState.HP > 0 && (
                                    <>
                                        <Icon className={classes.HP} icon={<Heart />} size={"lg"} text={oldState.HP} />
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
                                            {oldState.armor > 0 && <Armor amount={oldState.armor} />}
                                        </div>

                                        {isStunned && <Icon icon={<Dizzy />} size="xl" className={classes.stun} />}
                                        <div className={classes.bleed}>
                                            {bleeds.map((bleed, i: number) => (
                                                <Bleed key={i} amount={bleed.duration} />
                                            ))}
                                        </div>
                                        {getActionType(event.action) === ACTION_TYPES.NONE && (
                                            <Icon icon={<Zzz />} size="xl" className={classes.actionIcon} />
                                        )}
                                    </>
                                )}
                            </div>
                            <div className={classes.effectsContainer}>
                                {oldState.effects?.map((effect, i) => (
                                    <EffectIcon effect={effect} key={i} />
                                ))}
                                {oldState.aura && <EffectIcon effect={oldState.aura} isAura={true} />}
                            </div>
                        </>
                    )}
                </div>
                {showReticle && <Reticle className={classes.reticle} />}
            </div>
        );
    }
);

export default CombatantView;
