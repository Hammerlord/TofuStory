import classNames from "classnames";
import { createRef, forwardRef, useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
import { ACTION_TYPES, ANIMATION_TYPES, EFFECT_TYPES } from "../ability/types";
import { Event } from "../battle/types";
import { getCharacterStatChanges } from "../battle/utils";
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
import PlayerResources from "./PlayerResources";
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
        top: 16,
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
    "@keyframes stompingAnimation": {
        "0%": {
            transform: "translateY(0)",
        },
        "60%": {
            transform: "translateY(-100px)",
        },
        "75%": {
            transform: "translateY(5)",
        },
        "75.5%": {
            transform: "translateY(0) scaleX(1.05) scaleY(0.85)",
        },
        "80%": {
            transform: "scaleX(1.05) scaleY(0.85)",
        },
        "100%": {
            transform: "scaleX(1) scaleY(1)",
        },
    },
    stomping: {
        animationDuration: "1s",
        transitionTimingFunction: "ease-in-out",
        animationName: "$stompingAnimation",
        transformOrigin: "center bottom",
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
        top: 0,
        transform: "translateX(-50%)",
        transformOrigin: "50% 50%",
        animationIterationCount: 1,
        animationDuration: "0.5s",
    },
    "@keyframes explodeAnimation": {
        from: {
            transform: "translateX(-50%) scale(1)",
            WebkitFilter: "brightness(1.5) drop-shadow(0 0 5px #fffee8) drop-shadow(0 0 1px #fffee8)",
            filter: "brightness(1.5) drop-shadow(0 0 5px #fffee8) drop-shadow(0 0 1px #fffee8)",
            opacity: 0.8,
        },
        to: {
            transform: "translateX(-50%) scale(7)",
            opacity: 0,
            WebkitFilter: "brightness(3) drop-shadow(0 0 5px #fffee8) drop-shadow(0 0 1px #fffee8)",
            filter: "brightness(3) drop-shadow(0 0 5px #fffee8) drop-shadow(0 0 1px #fffee8)",
        },
    },
    exploding: {
        animation: "$explodeAnimation",
        transitionTimingFunction: "ease-in-out",
        position: "absolute",
        left: "50%",
        transform: "translateX(-50%)",
        transformOrigin: "50% 50%",
        animationIterationCount: 1,
        animationDuration: "0.75s",
        zIndex: -1,
    },
});

const CombatantView = forwardRef(
    (
        {
            combatant,
            onClick,
            isTargeted,
            event,
            events,
            isSelected,
            isHighlighted,
            showReticle,
            ...other
        }: {
            combatant?: Combatant;
            onClick: (event: any) => void;
            isTargeted: boolean;
            event: any; // extension of Event
            events: Event[]; // Current event queue
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
            const isCombatantChanged = oldState?.id !== combatant?.id;
            if (combatant?.HP > 0 || isCombatantChanged) {
                setPlayDeathAnimation(false);
            }

            const statChanges = getCharacterStatChanges({
                oldCharacter: oldState,
                newCharacter: combatant,
            });

            const callback = () => {
                setStatChanges(statChanges);
                setOldState(combatant);
                const willPerformOnDeathActions = events.some(({ actorId }) => actorId === combatant?.id);
                const isKillingBlow = oldState?.HP > 0 && combatant?.HP <= 0 && !isCombatantChanged;
                if (isKillingBlow && !willPerformOnDeathActions) {
                    setPlayDeathAnimation(true);
                }
            };

            const { vacuum } = event?.action || {};
            if (isCombatantChanged && !vacuum) {
                // Morphs/summons should play immediately (except in conjunction with vacuum; vacuum requires a delay to have the correct animation)
                callback();
                return;
            }

            setTimeout(() => {
                callback();
            }, 500);
        }, [combatant]);

        const hasStatusEffect = (type: EFFECT_TYPES): boolean => {
            return oldState?.effects?.some((effect) => effect.type === type);
        };

        const { action, actionParent, targetRef } = (event?.actorId === combatant?.id && event) || {};
        const { animation, type: actionType } = action || {};
        const isSilenced = hasStatusEffect(EFFECT_TYPES.SILENCE);
        const showResourceBar = combatant?.abilities?.some(({ resourceCost }) => resourceCost > 0);
        const isApplyingEffect =
            ![ANIMATION_TYPES.SHOUT, ANIMATION_TYPES.EXPLODE, ANIMATION_TYPES.STOMP].includes(animation) &&
            (actionType === ACTION_TYPES.EFFECT || animation === ANIMATION_TYPES.CAST);

        const imageProps = {
            key: typeof oldState?.image === "string" ? oldState.image : undefined,
            className: classNames(classes.portraitImage, {
                [classes.poisoned]: hasStatusEffect(EFFECT_TYPES.POISON),
                [classes.dying]: !action && playDeathAnimation,
                [classes.dead]: !action && oldState?.HP <= 0,
                [classes.applyingEffect]: isApplyingEffect,
                [classes.casting]: oldState?.casting,
                [classes.stomping]: animation === ANIMATION_TYPES.STOMP,
            }),
            style: {
                animationDuration: `${(event?.playbackTime || 1000) / 1000}s`,
            },
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
                                    {animation === ANIMATION_TYPES.EXPLODE && getImageNode({ className: classes.exploding })}

                                    <Tooltip open={Boolean(actionParent?.dialog)} title={actionParent?.dialog || ""} placement="top">
                                        <div>{imageNode}</div>
                                    </Tooltip>

                                    {animation === ANIMATION_TYPES.SHOUT &&
                                        Array.from({ length: 3 }).map((_, i) =>
                                            getImageNode({ key: i, className: classes.shouting, style: { animationDelay: `${0.1 * i}s` } })
                                        )}
                                    <div className={classes.weaponContainer}>
                                        <Weapon
                                            image={oldState.weapon}
                                            action={action}
                                            target={targetRef}
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
                                    <Health combatant={oldState} />
                                </div>

                                <div className={classes.rightContainer}>
                                    <AttackPower combatant={oldState} />
                                    {combatant?.isPlayer && <PlayerResources player={combatant} />}
                                </div>
                                {animation === ANIMATION_TYPES.SNOOZE && (
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
