import classNames from "classnames";
import { createRef, forwardRef, useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
import { ACTION_TYPES, ANIMATION_TYPES, EFFECT_TYPES } from "../ability/types";
import { getCharacterStatChanges, getMaxHP } from "../battle/utils";
import Armor from "../icon/Armor";
import CastingIndicator from "../icon/CastingIndicator";
import HitIcon from "../icon/HitIcon";
import Icon from "../icon/Icon";
import { ClickIndicatorImage } from "../images";
import { ZzzIcon } from "../images/icons";
import Tooltip from "../view/Tooltip";
import AttackPower from "./AttackPower";
import EffectIconsContainer from "./effects/EffectIcons";
import Effects from "./effects/Effects";
import Health from "./HealthView";
import ResourceBar from "./ResourceBar";
import Reticle from "./Reticle";
import { Combatant } from "./types";
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
        top: "100%",
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
    dying: {
        animation: "$deadAnimation 1s forwards",
        transitionTimingFunction: "ease-in-out",
    },
    dead: {
        opacity: 0,
    },
    weaponContainer: {
        position: "absolute",
        top: -70,
        left: -25,
    },
    poisoned: {
        filter: "sepia(0.9) hue-rotate(-300deg) saturate(2)",
    },
    "@keyframes shoutAnimation": {
        from: {
            transform: "translateX(-50%) scale(1)",
            opacity: 0.75,
        },
        to: {
            transform: "translateX(-50%) scale(3)",
            opacity: 0,
            WebkitFilter: "brightness(0.5)",
            filter: "brightness(0.5)",
        },
    },
    shouting: {
        animation: "$shoutAnimation",
        transitionTimingFunction: "ease-in-out",
        position: "absolute",
        left: "50%",
        transform: "translateX(-50%)",
        transformOrigin: "50% 50%",
        animationIterationCount: 1,
        animationDuration: "0.5s",
    },
});

const CombatantView = forwardRef(
    (
        {
            combatant,
            onClick,
            isTargeted,
            event,
            isSelected,
            isHighlighted,
            showReticle,
            ...other
        }: {
            combatant: Combatant;
            onClick: (event: any) => void;
            isTargeted: boolean;
            event: any; // AnimationEvent
            isSelected: boolean;
            isHighlighted: boolean;
            showReticle: boolean;
            onMouseEnter?: (event: any) => void;
            onMouseLeave?: (event: any) => void;
        },
        ref
    ) => {
        const [statChanges, setStatChanges]: [any, Function] = useState({});
        const [oldState, setOldState] = useState(combatant);
        const [weaponRef] = useState(createRef() as React.RefObject<any>);
        const [playDeathAnimation, setPlayDeathAnimation] = useState(false);
        const classes = useStyles();

        useEffect(() => {
            if (combatant?.HP > 0 || oldState?.id !== combatant?.id) {
                setPlayDeathAnimation(false);
            }

            const statChanges = getCharacterStatChanges({
                oldCharacter: oldState,
                newCharacter: combatant,
            });

            const timeout = setTimeout(() => {
                setStatChanges(statChanges);
                setOldState(combatant);
                const isKillingBlow = oldState?.HP > 0 && combatant?.HP === 0 && oldState?.id === combatant?.id;
                if (isKillingBlow) {
                    setPlayDeathAnimation(true);
                }
            }, 500);

            return () => {
                clearTimeout(timeout);
                setStatChanges(statChanges);
                setOldState(combatant);
            };
        }, [combatant]);

        const hasStatusEffect = (type: EFFECT_TYPES): boolean => {
            return oldState?.effects?.some((effect) => effect.type === type);
        };

        const isSilenced = hasStatusEffect(EFFECT_TYPES.SILENCE);
        const showResourceBar = combatant?.abilities?.some(({ resourceCost }) => resourceCost > 0);
        const isApplyingEffect =
            event?.action?.animation !== ANIMATION_TYPES.SHOUT &&
            (event?.action?.type === ACTION_TYPES.EFFECT || event?.action?.animation === ANIMATION_TYPES.CAST);

        const imageProps = {
            key: typeof oldState?.image === "string" ? oldState.image : undefined,
            className: classNames(classes.portraitImage, {
                [classes.poisoned]: hasStatusEffect(EFFECT_TYPES.POISON),
                [classes.dying]: !event?.action && playDeathAnimation,
                [classes.dead]: !event?.action && oldState?.HP === 0,
                [classes.applyingEffect]: isApplyingEffect,
                [classes.casting]: oldState?.casting,
            }),
            style:
                event?.action?.type === ACTION_TYPES.EFFECT
                    ? {
                          animationDuration: `${(event.playbackTime || 1000) / 1000}s`,
                      }
                    : undefined,
        };

        const getImageNode = (props) => {
            if (typeof oldState?.image === "string") {
                return <img src={oldState.image} {...props} draggable="false" />;
            } else if (typeof oldState?.image === "function") {
                const ImageNode = oldState.image as Function;
                return <ImageNode {...props} />;
            }
        };

        const imageNode = getImageNode(imageProps);

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
                            <Icon icon={ClickIndicatorImage} />
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
                        <div ref={ref as any} className={classNames(classes.portrait)}>
                            {oldState && (
                                <>
                                    <Tooltip
                                        open={Boolean(event?.actionParent?.dialog)}
                                        title={event?.actionParent?.dialog || ""}
                                        placement="top"
                                    >
                                        <span>{imageNode}</span>
                                    </Tooltip>

                                    {event?.action?.animation === ANIMATION_TYPES.SHOUT &&
                                        Array.from({ length: 3 }).map((_, i) =>
                                            getImageNode({ key: i, className: classes.shouting, style: { animationDelay: `${0.1 * i}s` } })
                                        )}
                                    <div className={classes.weaponContainer}>
                                        <Weapon
                                            image={oldState.weapon}
                                            action={event?.action}
                                            target={event?.targetRef}
                                            wielder={weaponRef?.current as any}
                                        />
                                    </div>
                                    {oldState.HP > 0 && <Effects combatant={oldState} healing={statChanges?.healing} />}
                                    <span className={classes.center}>
                                        <HitIcon statChanges={statChanges} />
                                    </span>
                                </>
                            )}
                        </div>
                        {oldState?.HP > 0 && (
                            <>
                                <div className={classes.leftContainer}>
                                    <Armor amount={oldState.armor} />
                                    <Health HP={oldState.HP} maxHP={getMaxHP(oldState)} />
                                </div>

                                <div className={classes.rightContainer}>
                                    <AttackPower combatant={oldState} />
                                </div>
                                {event?.action?.animation === ANIMATION_TYPES.SNOOZE && (
                                    <Icon icon={<ZzzIcon />} size="xl" className={classes.actionIcon} />
                                )}
                            </>
                        )}
                    </div>
                    {oldState?.HP > 0 && (
                        <div className={classes.effectsContainer}>
                            <EffectIconsContainer isSilenced={isSilenced} combatant={oldState} />
                        </div>
                    )}
                </div>
                {showReticle && <Reticle className={classes.reticle} />}
            </div>
        );
    }
);

export default CombatantView;
