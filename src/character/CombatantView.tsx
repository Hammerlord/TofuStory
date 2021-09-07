import classNames from "classnames";
import { createRef, forwardRef, useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
import { ACTION_TYPES, EFFECT_TYPES } from "../ability/types";
import { passesConditions } from "../battle/passesConditions";
import { getCharacterStatChanges } from "../battle/utils";
import Armor from "../icon/Armor";
import Bleed from "../icon/Bleed";
import CastingIndicator from "../icon/CastingIndicator";
import EffectIcon from "../icon/EffectIcon";
import HealIcon from "../icon/HealIcon";
import HitIcon from "../icon/HitIcon";
import Icon from "../icon/Icon";
import { ClickIndicator, Cloud, CrossedSwords, Dizzy, Heart, Zzz } from "../images";
import ResourceBar from "./ResourceBar";
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
        width: "100%",
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
    },
    portraitImage: {
        minWidth: "50%",
        minHeight: "40%",
        objectFit: "contain",
        maxHeight: "17vh",
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
    leftContainer: {
        position: "absolute",
        left: "-8px",
        bottom: "-8px",
        display: "flex",
        flexDirection: "column",
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

    "@keyframes stealthCloud": {
        from: {
            opacity: 0.5,
            transform: "translateY(-8px)",
        },
        to: {
            opacity: 0.1,
            transform: "translateY(0px)",
        },
    },
    stealth: {
        animationName: "$stealthCloud",
        animationDuration: "1s",
        animationIterationCount: "infinite",
        animationDirection: "alternate-reverse",
        position: "absolute",
        width: "100%",
        height: "100%",
        top: "15%",
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
        bottom: "-8px",
        left: "50%",
        transform: "translateX(-50%)",
    },
    "@keyframes deadAnimation": {
        from: {
            transform: "translateY(0)",
            opacity: 1,
        },
        to: {
            transform: "translateY(-100px)",
            opacity: 0,
            WebkitFilter: "brightness(0.5)",
            filter: "brightness(0.5)",
        },
    },
    dead: {
        animation: "$deadAnimation 1s forwards",
        transitionTimignFunction: "ease-in-out",
    },
    projectile: {
        maxWidth: "40%",
        objectFit: "contain",
        marginTop: "40%",
        WebkitFilter: "brightness(1) drop-shadow(0 0 5px #fffee8) drop-shadow(0 0 1px #fffee8)",
        filter: "brightness(1) drop-shadow(0 0 5px #fffee8) drop-shadow(0 0 1px #fffee8)",
    },
});

const toAndBack = ({ to, from, spin = false }) => {
    if (!to || !from) {
        return;
    }
    const getTargetPoint = (rect) => {
        const { x, y, height, width } = rect;
        return {
            x: x + width / 2,
            y: y + height / 2,
        };
    };
    const { x, y } = getTargetPoint(from.getBoundingClientRect());
    const { x: x2, y: y2 } = getTargetPoint(to.getBoundingClientRect());
    const increments = 60;
    const moveIncrementX = (x2 - x) / increments;
    const moveIncrementY = (y2 - y) / increments;
    let i = 1;
    let direction = 1;
    const spinIncrement = 360 / increments;
    const move = () => {
        if (!from) {
            return;
        }
        const xPos = i * moveIncrementX;
        const yPos = i * moveIncrementY;
        from.style.transform = `translateX(${xPos}px) translateY(${yPos}px)${spin ? ` rotate(${spinIncrement * i}deg)` : ""}`;

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
                from.style.transform = "unset";
            }
        }
    };
    move();
};

const CombatantView = forwardRef(
    ({ combatant, onClick, isTargeted, event, isAlly, isSelected, isHighlighted, showReticle, showResourceBar, ...other }: any, ref) => {
        const [statChanges, setStatChanges]: [any, Function] = useState({});
        const [oldState, setOldState] = useState(combatant);
        const [portraitRef] = useState(createRef() as React.RefObject<any>);
        const [projectileRef] = useState(createRef() as React.RefObject<any>);
        const classes = useStyles();

        useEffect(() => {
            if (!combatant || !oldState || oldState.id !== combatant.id) {
                setStatChanges({});
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
            if (!event?.target) {
                return;
            }
            if (event.action?.type === ACTION_TYPES.ATTACK && portraitRef.current) {
                toAndBack({ to: event.target, from: portraitRef.current });
            } else if (event.action?.type === ACTION_TYPES.RANGE_ATTACK && projectileRef.current) {
                toAndBack({ to: event.target, from: projectileRef.current, spin: true }); // We don't want every projectile to return to the owner
            }

            let timeout;
            return () => {
                if (portraitRef?.current?.style) {
                    portraitRef.current.style.transform = "unset";
                }
                clearTimeout(timeout);
            };
        }, [event.action]);

        const hasStatusEffect = (type: EFFECT_TYPES): boolean => {
            return oldState?.effects?.some((effect) => effect.type === type);
        };

        const isStunned = hasStatusEffect(EFFECT_TYPES.STUN);
        const isStealthed = hasStatusEffect(EFFECT_TYPES.STEALTH);
        const bleeds = oldState?.effects?.filter((effect) => effect.type === EFFECT_TYPES.BLEED) || [];
        const damageFromEffects = oldState?.effects?.reduce((acc: number, { damage = 0, conditions = [] }) => {
            const getCalculationTarget = (calculationTarget: "effectOwner" | "externalParty") => {
                if (calculationTarget === "effectOwner") {
                    return oldState;
                }
            };
            if (passesConditions({ getCalculationTarget, conditions })) {
                return acc + damage;
            }

            return acc;
        }, 0);
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
                                    {showResourceBar && <ResourceBar resources={oldState.resources} maxResources={oldState.maxResources} />}
                                </div>
                            )}
                            <div className={classes.combatantContainer}>
                                <span ref={portraitRef} className={classNames(classes.portrait)}>
                                    {event?.action?.type === ACTION_TYPES.RANGE_ATTACK && event?.action?.icon && (
                                        <span className={classes.center}>
                                            <img src={event?.action?.icon} ref={projectileRef} className={classNames(classes.projectile)} />{" "}
                                        </span>
                                    )}
                                    <img
                                        src={oldState.image}
                                        className={classNames(classes.portraitImage, {
                                            [classes.dead]: oldState.HP === 0,
                                            [classes.applyingEffect]: event?.action?.type === ACTION_TYPES.EFFECT,
                                            [classes.casting]: oldState.casting,
                                        })}
                                    />
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
                                    {isStealthed && (
                                        <div className={classNames(classes.stealth)}>
                                            <Cloud />
                                        </div>
                                    )}
                                </span>
                                {oldState.HP > 0 && (
                                    <>
                                        <div className={classes.leftContainer}>
                                            {oldState.armor > 0 && <Armor amount={oldState.armor} />}
                                            <Icon icon={<Heart />} size={"lg"} text={oldState.HP} />
                                        </div>

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
                                        </div>

                                        {isStunned && <Icon icon={<Dizzy />} size="xl" className={classes.stun} />}
                                        <div className={classes.bleed}>
                                            {bleeds.map((bleed, i: number) => (
                                                <Bleed key={i} amount={bleed.duration} />
                                            ))}
                                        </div>
                                        {event?.action?.type === ACTION_TYPES.NONE && (
                                            <Icon icon={<Zzz />} size="xl" className={classes.actionIcon} />
                                        )}
                                    </>
                                )}
                            </div>
                            {oldState.HP > 0 && (
                                <div className={classes.effectsContainer}>
                                    {oldState.effects?.map((effect, i) => (
                                        <EffectIcon effect={effect} key={i} />
                                    ))}
                                    {oldState.aura && <EffectIcon effect={oldState.aura} isAura={true} />}
                                </div>
                            )}
                        </>
                    )}
                </div>
                {showReticle && <Reticle className={classes.reticle} />}
            </div>
        );
    }
);

export default CombatantView;
