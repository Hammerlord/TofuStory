import classNames from "classnames";
import { forwardRef, useEffect, useRef, useState } from "react";
import { createUseStyles } from "react-jss";
import { BLUE, GREEN, RED } from "../ability/AbilityView/constants";
import { ACTION_TYPES, ANIMATION_TYPES, Ability, CombatAbility, CombatEffect, EFFECT_CLASSES, EFFECT_TYPES } from "../ability/types";
import { findCombatantData } from "../battle/actions/actions";
import { SUMMON_DELAY } from "../battle/constants";
import { Event } from "../battle/types";
import { StatChange, getCharacterStatChanges } from "../battle/utils";
import { useAppSelector } from "../hooks";
import Armor from "../icon/Armor";
import EffectGroupIcon from "../icon/EffectGroupIcon";
import HitIcon from "../icon/HitIcon";
import Icon from "../icon/Icon";
import { ClickIndicatorImage } from "../images";
import { ZzzIcon } from "../images/icons";
import Tooltip from "../view/Tooltip";
import AbilityPreview, { PreviewStatUpdate } from "./AbilityPreview";
import AttackPower from "./AttackPower";
import CombatantTooltip from "./CombatantTooltip";
import Health from "./HealthView";
import PlayerResources from "./PlayerResources";
import ResourceBar from "./ResourceBar";
import Reticle from "./Reticle";
import Telegraph from "./Telegraph";
import Weapon from "./Weapon";
import { playDyingAnimation, playFadeInAnimation, playHitAnimation } from "./animations";
import EffectIconsContainer from "./effects/EffectIcons";
import PortraitStatusEffects from "./effects/PortraitStatusEffects";
import StatusEffectAnnouncer from "./effects/StatusEffectAnnouncer";
import { Combatant, Player } from "./types";
import BlockIcon from "../icon/BlockIcon";

const useStyles = createUseStyles({
    "@keyframes highlightAnimation": {
        from: {
            filter: "brightness(1) drop-shadow(0 0 1px #45ff61) drop-shadow(0 0 1px #45ff61)",
        },
        to: {
            filter: "brightness(1.25) drop-shadow(0 0 5px #45ff61) drop-shadow(0 0 5px #45ff61)",
        },
    },
    root: {
        cursor: "pointer",
        position: "relative",
        flex: 1,

        "&.-highlighted .portrait": {
            animationName: "$highlightAnimation",
            animationDuration: "2s",
            animationIterationCount: "infinite",
            animationDirection: "alternate-reverse",
        },

        "&.-selected .portrait": {
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
        bottom: "80%",
        transform: "translateX(-50%)",
        position: "absolute",
        width: "100%",
        zIndex: 1,
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
        // Issue where your player character element could block clicks on the enemy when using subsequent abilities
        pointerEvents: "none",
    },
    portraitImage: {
        minWidth: "30%",
        minHeight: "30%",
        objectFit: "contain",
        maxHeight: "15vh",
        maxWidth: "100%",
    },
    invisible: {
        opacity: 0,
    },
    combatantContainer: {
        display: "flex",
        position: "absolute",
        bottom: "24px",
        left: "50%",
        transform: "translateX(-50%)",
        minWidth: "100px",
        height: "90%",
        width: "90%",
        zIndex: 1,
    },
    leftContainer: {
        position: "absolute",
        left: "0",
        bottom: "-8px",
        display: "flex",
        flexDirection: "column",
    },
    rightContainer: {
        position: "absolute",
        right: "0",
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
    "@keyframes fadeOut": {
        "0%": {
            opacity: 0.75,
        },
        "100%": {
            opacity: 0.25,
        },
    },
    fadeInOut: {
        animationName: "$fadeOut",
        animationDuration: "1s",
        animationTimingFunction: "ease-in-out",
        animationIterationCount: "infinite",
        animationDirection: "alternate",
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
            filter: "brightness(1) drop-shadow(0 0 1px #fffee8) drop-shadow(0 0 1px #fffee8)",
        },
        "75%": {
            filter: "brightness(1.25) drop-shadow(0 0 10px #fffee8) drop-shadow(0 0 5px #fffee8)",
        },
        "100%": {
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
            filter: "brightness(1) drop-shadow(0 0 1px #fffee8) drop-shadow(0 0 1px #fffee8)",
            transform: "translateY(0)",
        },

        "75%": {
            filter: "brightness(1.5) drop-shadow(0 0 10px #fffee8) drop-shadow(0 0 5px #fffee8)",
            transform: "translateY(-24px)",
        },

        "100%": {
            filter: "brightness(1) drop-shadow(0 0 5px #fffee8) drop-shadow(0 0 1px #fffee8)",
            transform: "unset",
        },
    },
    applyingEffect: {
        animationDuration: "1s",
        animationName: "$applyEffect",
        transition: "1s filter linear, 1s -webkit-filter linear",
        animationIterationCount: "unset", // Animation will loop and clip if the character is also casting
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
        width: "98%",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 0,
    },
    dead: {
        opacity: 0,
    },
    stasis: {
        filter: "brightness(0.25)",
        opacity: 1,
    },
    weaponContainer: (combatant: Combatant) => {
        const { left, top } = combatant?.weaponImageOptions || {};
        return {
            position: "absolute",
            top: top || -50,
            left: left || 25,
        };
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
        zIndex: -1,
        maxWidth: "100%",
        opacity: 0,
    },
    "@keyframes upAndDown": {
        from: {
            transform: "translateY(0)",
        },
        to: {
            transform: "translateY(-4px)",
        },
    },
    float: {
        animationName: "$upAndDown",
        animationDuration: "2s",
        animationIterationCount: "infinite",
        animationDirection: "alternate-reverse",
    },
    statusEffectAnnouncerContainer: {
        position: "absolute",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1,
    },
    statChangeContainer: {
        zIndex: 2,
    },
});

interface CurrentEvent extends Event {
    targetRef?: HTMLElement;
}

const CombatantView = forwardRef(
    (
        {
            combatant,
            isEnemy,
            onClick,
            onMouseDown,
            isTargeted,
            event,
            events,
            isSelected,
            isHighlighted,
            showReticle,
            previewStatUpdate,
            selectedAbility,
            ...other
        }: {
            combatant?: Combatant | Player;
            isEnemy: boolean;
            onClick?: (event: any) => void;
            onMouseDown?: (event: any) => void;
            isTargeted: boolean;
            event: CurrentEvent;
            events: Event[]; // Current event queue
            isSelected: boolean;
            isHighlighted: boolean;
            showReticle: boolean;
            previewStatUpdate?: PreviewStatUpdate[];
            selectedAbility?: Ability | CombatAbility;
            onMouseEnter?: (event: any) => void;
            onMouseLeave?: (event: any) => void;
        },
        ref
    ) => {
        const state = useAppSelector((state) => state);
        const [statChanges, setStatChanges]: [StatChange, Function] = useState({} as StatChange);
        const [oldState, setOldState] = useState(combatant);

        const willPerformActions = events.length > 1 && events.some(({ actorId }) => actorId === combatant?.id);
        const classes = useStyles(combatant);
        const isLifeLinked = combatant?.effects.some((effect: CombatEffect) => effect.type === EFFECT_TYPES.LIFE_LINK);

        // @ts-ignore
        const { fadeInOut: fadeInOutFromEffect } =
            combatant?.effects.reduce((acc, e: CombatEffect) => {
                return { ...acc, ...e.portraitAnimationOptions }; // The last effect applied wins for all animation options
            }, {}) || {};
        // Tricky: Overwrite combatant with the parameter one, as it is the event queue combatant whose health will appear to update as it gets hit.
        // The one from findCombatantData is the end result combatant, when all the events in the queue have finished playing out.
        const combatantInfo = { ...findCombatantData(() => state, oldState?.id), combatant };
        const weaponRef = useRef();
        const characterImageRef = useRef();

        useEffect(() => {
            const statChanges = getCharacterStatChanges({
                oldCharacter: oldState,
                newCharacter: combatant,
            });

            const callback = () => {
                const eventStatChanges = event?.statUpdates?.[combatant?.id];
                setStatChanges({ ...eventStatChanges, ...statChanges });
                setOldState(combatant);

                if (characterImageRef.current) {
                    const isKillingBlow = eventStatChanges?.isDeathBlow && !isLifeLinked;
                    if (isKillingBlow && !willPerformActions) {
                        playDyingAnimation({ object: characterImageRef.current });
                    } else if (
                        statChanges?.damage > 0 ||
                        statChanges?.effects?.some((e: CombatEffect) => e.class === EFFECT_CLASSES.DEBUFF)
                    ) {
                        const baseDelta = Math.min(100, statChanges.damage) || 1;
                        // Reverse direction: eg. if an ally was hit, the animation should push it in a downward direction first.
                        const delta = isEnemy ? baseDelta : -baseDelta;
                        playHitAnimation({ object: characterImageRef.current, delay: 0.5, delta });
                    }

                    if (event?.newCombatants?.some((c) => c.id === combatant?.id)) {
                        playFadeInAnimation({ object: characterImageRef.current, playbackTime: SUMMON_DELAY });
                    }
                }
            };

            const playbackTime = event?.playbackTime;

            const timeout = setTimeout(() => {
                callback();
            }, (playbackTime && playbackTime / 2) || 500);
            return () => clearTimeout(timeout);
        }, [combatant, event?.id]);

        const hasStatusEffect = (type: EFFECT_TYPES): boolean => {
            return oldState?.effects?.some((effect) => effect.type === type);
        };

        const { action, actionParent, targetRef } = (event?.actorId === oldState?.id && event) || {};
        const { animation, type: actionType } = action || {};
        const isSilenced = hasStatusEffect(EFFECT_TYPES.SILENCE);
        const showResourceBar = oldState?.abilities?.some(({ resourceCost }) => resourceCost === "x" || resourceCost > 0);
        const isApplyingEffect =
            ![ANIMATION_TYPES.SHOUT, ANIMATION_TYPES.EXPLODE, ANIMATION_TYPES.STOMP].includes(animation) &&
            (actionType === ACTION_TYPES.EFFECT || animation === ANIMATION_TYPES.CAST);
        const { animation: portraitAnimation, fadeInOut } = oldState?.imageOptions || {};

        const imageProps = {
            key: typeof oldState?.image === "string" ? oldState.image : undefined,
            className: classNames("portrait", classes.portraitImage, {
                [classes.invisible]: event?.newCombatants?.some((c) => c.id === combatant?.id),
                [classes.fadeInOut]: (fadeInOut || fadeInOutFromEffect) && oldState?.HP > 0,
                [classes.float]: portraitAnimation === "float",
                [classes.poisoned]: hasStatusEffect(EFFECT_TYPES.POISON),
                [classes.dead]: !action && oldState?.HP === 0 && !willPerformActions,
                [classes.applyingEffect]: isApplyingEffect,
                [classes.casting]: oldState?.casting && !(fadeInOut || fadeInOutFromEffect),
                [classes.stasis]: oldState?.HP <= 0 && isLifeLinked,
            }),
            style: {
                animationDuration: `${(event?.playbackTime || 1000) / 1000}s`,
            },
        };

        const getImageNode = (props) => {
            const portrait = oldState?.effects?.find(({ override }) => override?.portrait)?.override?.portrait || oldState?.image;
            const { filter } = oldState?.imageOptions || {};

            if (typeof portrait === "string") {
                return <img src={portrait} {...props} style={{ filter, ...props?.style }} draggable="false" ref={characterImageRef} />;
            } else if (typeof portrait === "function") {
                const ImageNode = portrait as Function;
                return (
                    <div {...props} style={{ filter, ...props?.style }} ref={characterImageRef}>
                        <ImageNode />
                    </div>
                );
            }
        };

        const imageNode = getImageNode(imageProps);
        const dialog = (actionParent as unknown as Ability)?.dialog || "";
        let reticleColor;
        if (isTargeted) {
            if (isEnemy) {
                reticleColor = RED;
            } else if (selectedAbility?.minion) {
                reticleColor = GREEN;
            } else {
                reticleColor = BLUE;
            }
        }

        const getExtraContainerIcons = (side: "left" | "right") => {
            const extraEffects = combatant?.effects.filter((e) => e.extraDisplayOptions?.container === side) || [];
            return extraEffects.map((effect: CombatEffect) => {
                const shouldGlow = effect.id === (event?.source?.source as CombatEffect)?.id;
                return <EffectGroupIcon effects={[effect]} owner={combatant} key={effect.id} glow={shouldGlow} />;
            });
        };

        const overrideWeapon = oldState?.effects?.find(({ override }) => override?.weapon !== undefined)?.override?.weapon;
        const weapon = overrideWeapon !== undefined ? overrideWeapon : oldState?.weapon;

        return (
            <div
                className={classNames(classes.root, {
                    "-selected": isSelected,
                    "-highlighted": isHighlighted,
                })}
                onClick={onClick}
                onMouseDown={onMouseDown}
                {...other}
            >
                <div className={classes.inner}>
                    {showReticle && !isTargeted && (
                        <span className={classes.targetAffectedIndicatorContainer}>
                            <Icon icon={ClickIndicatorImage} />
                        </span>
                    )}

                    {oldState?.HP > 0 && isEnemy && (
                        <div className={classes.header}>
                            <Telegraph combatantInfo={combatantInfo} />
                            {showResourceBar && <ResourceBar resources={oldState.resources} maxResources={oldState.maxResources} />}
                        </div>
                    )}
                    <div className={classes.combatantContainer} ref={weaponRef}>
                        <div
                            ref={ref as any}
                            className={classNames(classes.portrait, {
                                // Bandaid for issue where displaced combatants would flicker into their new location before being animated
                                [classes.invisible]: event.displacements?.[combatant?.id],
                            })}
                        >
                            {oldState && (
                                <>
                                    <Tooltip open={Boolean(dialog)} title={dialog} placement="top">
                                        <div>{imageNode}</div>
                                    </Tooltip>

                                    {animation === ANIMATION_TYPES.SHOUT &&
                                        Array.from({ length: 3 }).map((_, i) =>
                                            getImageNode({ key: i, className: classes.shouting, style: { animationDelay: `${0.1 * i}s` } })
                                        )}
                                    {oldState.HP > 0 && (
                                        <div
                                            className={classNames(classes.weaponContainer, {
                                                [classes.applyingEffect]: isApplyingEffect,
                                            })}
                                        >
                                            <Weapon
                                                image={weapon}
                                                options={oldState.weaponImageOptions}
                                                target={targetRef}
                                                wielderRef={weaponRef?.current as any}
                                                wielder={oldState}
                                                event={event}
                                            />
                                        </div>
                                    )}
                                    {(oldState.HP > 0 || isLifeLinked) && (
                                        <PortraitStatusEffects combatantInfo={combatantInfo} statChanges={statChanges} />
                                    )}
                                    <div className={classes.statusEffectAnnouncerContainer}>
                                        <StatusEffectAnnouncer statChanges={statChanges} combatant={combatant} />
                                    </div>
                                    <span className={classNames(classes.center, classes.statChangeContainer)}>
                                        <BlockIcon statChanges={statChanges} />
                                        <HitIcon statChanges={statChanges} />
                                    </span>
                                </>
                            )}
                        </div>
                        {oldState?.HP > 0 && (
                            <>
                                {!isTargeted && !event?.id && <CombatantTooltip combatant={combatant} isEnemy={isEnemy} />}
                                <div className={classes.leftContainer}>
                                    {getExtraContainerIcons("left")}
                                    <Armor amount={oldState.armor} combatantInfo={combatantInfo} />
                                    <Health combatantInfo={combatantInfo} />
                                </div>

                                <div className={classes.rightContainer}>
                                    {getExtraContainerIcons("right")}
                                    <AttackPower combatantInfo={combatantInfo} />
                                    {combatant?.isPlayer && <PlayerResources player={combatant as Player} />}
                                </div>
                                {animation === ANIMATION_TYPES.SNOOZE && (
                                    <Icon icon={<ZzzIcon />} size="xl" className={classes.actionIcon} />
                                )}
                            </>
                        )}
                    </div>
                    {(oldState?.HP > 0 || isLifeLinked) && (
                        <div className={classes.effectsContainer}>
                            <EffectIconsContainer isSilenced={isSilenced} combatant={combatant} event={event} />
                        </div>
                    )}
                </div>

                {oldState?.HP > 0 && <AbilityPreview previewStatUpdate={previewStatUpdate} combatant={oldState} isEnemy={isEnemy} />}
                {showReticle && <Reticle className={classes.reticle} color={reticleColor} />}
            </div>
        );
    }
);

export default CombatantView;
