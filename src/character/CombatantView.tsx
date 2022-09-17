import classNames from "classnames";
import { createRef, forwardRef, useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
import { ACTION_TYPES, EFFECT_TYPES } from "../ability/types";
import { getCharacterStatChanges, getMaxHP } from "../battle/utils";
import Armor from "../icon/Armor";
import CastingIndicator from "../icon/CastingIndicator";
import EffectIcon from "../icon/EffectIcon";
import HitIcon from "../icon/HitIcon";
import Icon from "../icon/Icon";
import { ClickIndicator, Zzz } from "../images";
import AttackPower from "./AttackPower";
import Effects from "./effects/Effects";
import Health from "./HealthView";
import ResourceBar from "./ResourceBar";
import Reticle from "./Reticle";
import Weapon from "./Weapon";

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
        position: "relative",
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
            transform: "unset",
        },
    },
    applyingEffect: {
        animationDuration: "1s",
        animationName: "$applyEffect",
        transition: "1s filter linear, 1s -webkit-filter linear",
    },
    highlightText: {
        "& .text": {
            color: "#42f57b",
        },
    },
    negativeText: {
        "& .text": {
            color: "#ff9b94",
        },
    },
    effectsContainer: {
        position: "absolute",
        bottom: "-12px",
        width: "90%",
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
        transitionTimingFunction: "ease-in-out",
    },
    weaponContainer: {
        position: "absolute",
        top: -70,
        left: -25,
    },
});

const CombatantView = forwardRef(
    ({ combatant, onClick, isTargeted, event, isAlly, isSelected, isHighlighted, showReticle, showResourceBar, ...other }: any, ref) => {
        const [statChanges, setStatChanges]: [any, Function] = useState({});
        const [oldState, setOldState] = useState(combatant);
        const [weaponRef] = useState(createRef() as React.RefObject<any>);
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

            const timeout = setTimeout(() => {
                setStatChanges(statChanges);
                setOldState(combatant);
            }, 300);

            return () => {
                setStatChanges(statChanges);
                setOldState(combatant);
                clearTimeout(timeout);
            };
        }, [combatant]);

        const hasStatusEffect = (type: EFFECT_TYPES): boolean => {
            return oldState?.effects?.some((effect) => effect.type === type);
        };

        const isSilenced = hasStatusEffect(EFFECT_TYPES.SILENCE);

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
                    {isTargeted && showReticle && (
                        <span className={classes.targetAffectedIndicatorContainer}>
                            <Icon icon={ClickIndicator} />
                        </span>
                    )}

                    {oldState?.HP > 0 && (
                        <div className={classes.header}>
                            {oldState.casting && <CastingIndicator casting={oldState.casting} combatant={oldState} />}
                            <span>{oldState.name}</span>
                            {showResourceBar && <ResourceBar resources={oldState.resources} maxResources={oldState.maxResources} />}
                        </div>
                    )}
                    <div className={classes.combatantContainer} ref={weaponRef}>
                        <span ref={ref as any} className={classNames(classes.portrait)}>
                            {oldState && (
                                <>
                                    <img
                                        src={oldState.image}
                                        className={classNames(classes.portraitImage, {
                                            [classes.dead]: oldState.HP === 0,
                                            [classes.applyingEffect]: event?.action?.type === ACTION_TYPES.EFFECT,
                                            [classes.casting]: oldState.casting,
                                        })}
                                        style={
                                            event?.action?.type === ACTION_TYPES.EFFECT
                                                ? {
                                                      animationDuration: `${(event.playbackTime || 1000) / 1000}s`,
                                                  }
                                                : undefined
                                        }
                                    />
                                    <div className={classes.weaponContainer}>
                                        <Weapon
                                            image={oldState.weapon}
                                            action={event?.action}
                                            target={event?.target}
                                            wielder={weaponRef?.current as any}
                                        />
                                    </div>
                                    {oldState.HP > 0 && <Effects combatant={oldState} healing={statChanges?.healing} />}
                                    <span className={classes.center}>
                                        <HitIcon statChanges={statChanges} />
                                    </span>
                                </>
                            )}
                        </span>
                        {oldState?.HP > 0 && (
                            <>
                                <div className={classes.leftContainer}>
                                    <Armor amount={oldState.armor} />
                                    <Health HP={oldState.HP} maxHP={getMaxHP(oldState)} />
                                </div>

                                <div className={classes.rightContainer}>
                                    <AttackPower combatant={oldState} />
                                </div>
                                {event?.action?.type === ACTION_TYPES.NONE && (
                                    <Icon icon={<Zzz />} size="xl" className={classes.actionIcon} />
                                )}
                            </>
                        )}
                    </div>
                    {oldState?.HP > 0 && (
                        <div className={classes.effectsContainer}>
                            {oldState.effects?.map((effect, i) => (
                                <EffectIcon effect={effect} key={i} silence={isSilenced} owner={oldState} />
                            ))}
                            {oldState.aura && <EffectIcon effect={oldState.aura} isAura={true} silence={isSilenced} owner={oldState} />}
                        </div>
                    )}
                </div>
                {showReticle && <Reticle className={classes.reticle} />}
            </div>
        );
    }
);

export default CombatantView;
