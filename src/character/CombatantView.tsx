import classNames from "classnames";
import { FC, RefObject, forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { createUseStyles } from "react-jss";
import { BLUE, GREEN, RED } from "../ability/AbilityView/constants";
import { ACTION_TYPES, ANIMATION_TYPES, Ability, CombatAbility, CombatEffect, EFFECT_CLASSES, EFFECT_TYPES } from "../ability/types";
import { findCombatantData } from "../battle/actions/actions";
import { SUMMON_DELAY } from "../battle/constants";
import { BATTLE_STATES } from "../battle/reducer";
import { BATTLEFIELD_SIDES, EventGroup } from "../battle/types";
import { useAppSelector } from "../hooks";
import Armor from "../icon/Armor";
import BlockIcon from "../icon/BlockIcon";
import EffectGroupIcon from "../icon/EffectGroupIcon";
import HitIcon from "../icon/HitIcon";
import Icon from "../icon/Icon";
import { ClickIndicatorImage } from "../images";
import { ZzzIcon } from "../images/icons";
import Tooltip from "../view/Tooltip";
import AbilityPreview, { PreviewStatUpdate } from "./AbilityPreview";
import AttackPower from "./AttackPower";
import Coin from "./Coin";
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
import { UpdatedCombatantStats } from "../battle/actions/getUpdatedStats";

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
        zIndex: 2,
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
    hidden: {
        display: "none",
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
        bottom: 20,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 5,
    },
    statChangeContainer: {
        zIndex: 2,
    },
    previewAttacked: {
        top: -15,
    },
});

const CombatantView = ({
    combatant,
    isEnemy,
    isTargeted,
    currentEventGroup,
    eventGroupQueue,
    isSelected,
    isHighlighted,
    showReticle,
    previewStatUpdate,
    previewTargetedBy,
    selectedAbility,
    index,
    enemySideRefs,
    playerSideRefs,
    isHoveringCombatant,
    onMouseEnter,
    onMouseDown,
    characterRef,
    ...other
}: {
    combatant?: Combatant | Player;
    isEnemy: boolean;
    isTargeted: boolean;
    currentEventGroup: EventGroup;
    eventGroupQueue: EventGroup[];
    isSelected: boolean;
    isHighlighted: boolean;
    showReticle: boolean;
    previewStatUpdate?: PreviewStatUpdate[];
    previewTargetedBy?: PreviewStatUpdate;
    selectedAbility?: Ability | CombatAbility;
    index: number;
    enemySideRefs: RefObject<HTMLElement>[];
    playerSideRefs: RefObject<HTMLElement>[];
    isHoveringCombatant?: boolean; // If any Combatant is being hovered, not just this one
    onMouseEnter?: (combatant: Combatant | null, index: number) => void;
    onMouseDown?: (event: React.MouseEvent, index: number) => void;
    onMouseLeave?: (event: any) => void;
    characterRef: RefObject<HTMLDivElement>;
}) => {
    const battle = useAppSelector((state) => state.battle);

    const willPerformActions =
        eventGroupQueue.length > 1 &&
        eventGroupQueue.some((eventGroup) => eventGroup.events.some(({ actorId }) => actorId === combatant?.id));
    const classes = useStyles(combatant);
    const isLifeLinked = combatant?.effects.some((effect: CombatEffect) => effect.type === EFFECT_TYPES.LIFE_LINK);

    // @ts-ignore
    const { fadeInOut: fadeInOutFromEffect } =
        combatant?.effects.reduce((acc, e: CombatEffect) => {
            return { ...acc, ...e.portraitAnimationOptions }; // The last effect applied wins for all animation options
        }, {}) || {};
    // Tricky: Overwrite combatant with the parameter one, as it is the event queue combatant whose health will appear to update as it gets hit.
    // The one from findCombatantData is the end result combatant, when all the events in the queue have finished playing out.
    const combatantInfo = {
        ...findCombatantData(battle, combatant?.id),
        combatant,
    };
    const weaponRef = useRef(null);
    const characterImageRef = useRef(null);

    const eventStatChanges = currentEventGroup?.statUpdates?.[combatant?.id];
    // We want the damage number etc. to appear only at the (approximate) time that character is hit by the attack
    const hitPlaybackDelay = currentEventGroup?.playbackTime ? currentEventGroup?.playbackTime / 2 : 500;

    useEffect(() => {
        const callback = () => {
            if (characterImageRef.current) {
                const isKillingBlow = eventStatChanges?.isDeathBlow && !isLifeLinked;
                if (isKillingBlow && !willPerformActions) {
                    playDyingAnimation({ object: characterImageRef.current });
                } else if (
                    eventStatChanges?.healthDamage > 0 ||
                    eventStatChanges?.effects?.some((e: CombatEffect) => e.class === EFFECT_CLASSES.DEBUFF)
                ) {
                    const baseDelta = Math.min(100, eventStatChanges?.healthDamage) || 1;
                    // Reverse direction: eg. if an ally was hit, the animation should push it in a downward direction first.
                    const delta = isEnemy ? baseDelta : -baseDelta;
                    playHitAnimation({ object: characterImageRef.current, delta });
                }

                if (currentEventGroup?.newCombatants?.some((c) => c.id === combatant?.id)) {
                    playFadeInAnimation({ object: characterImageRef.current, playbackTime: SUMMON_DELAY });
                }
            }
        };

        const timeout = setTimeout(callback, hitPlaybackDelay);
        return () => clearTimeout(timeout);
    }, [combatant, currentEventGroup?.id]);

    const hasStatusEffect = (type: EFFECT_TYPES): boolean => {
        return combatant?.effects?.some((effect) => effect.type === type);
    };

    const event = (currentEventGroup?.events || []).find((e) => e.actorId === combatant?.id);
    const { action, actionParent, selectedIndex, targetSide } = event || {};

    // This is for rotating the weapon to the correct target
    let targetRef;
    if (targetSide && typeof selectedIndex === "number") {
        if (targetSide === BATTLEFIELD_SIDES.PLAYER_SIDE) {
            targetRef = playerSideRefs[selectedIndex]?.current;
        } else {
            targetRef = enemySideRefs[selectedIndex]?.current;
        }
    }
    const { animation, type: actionType, animationOptions } = action || {};
    const isSilenced = hasStatusEffect(EFFECT_TYPES.SILENCE);
    const showResourceBar = combatant?.abilities?.some(({ resourceCost }) => resourceCost === "x" || resourceCost > 0);
    const isApplyingEffect =
        ![ANIMATION_TYPES.SHOUT, ANIMATION_TYPES.EXPLODE, ANIMATION_TYPES.STOMP].includes(animation) &&
        (actionType === ACTION_TYPES.EFFECT || animation === ANIMATION_TYPES.CAST);
    const { animation: portraitAnimation, fadeInOut } = combatant?.imageOptions || {};

    const imageProps = {
        className: classNames("portrait", classes.portraitImage, {
            [classes.invisible]: currentEventGroup?.newCombatants?.some((c) => c.id === combatant?.id),
            [classes.fadeInOut]: (fadeInOut || fadeInOutFromEffect) && combatant?.HP > 0,
            [classes.float]: portraitAnimation === "float",
            [classes.poisoned]: hasStatusEffect(EFFECT_TYPES.POISON),
            [classes.dead]: !action && combatant?.HP === 0 && !willPerformActions,
            [classes.applyingEffect]: isApplyingEffect,
            [classes.casting]: combatant?.casting && !(fadeInOut || fadeInOutFromEffect),
            [classes.stasis]: combatant?.HP <= 0 && isLifeLinked,
        }),
        style: {
            animationDuration: `${(currentEventGroup?.playbackTime || 1000) / 1000}s`,
        },
    };

    const getCharacterImageNode = (props) => {
        const portrait = combatant?.effects?.find(({ override }) => override?.portrait)?.override?.portrait || combatant?.image;
        const { filter } =
            combatant?.imageOptions ||
            combatant?.effects?.find(({ portraitAnimationOptions }) => portraitAnimationOptions?.filter)?.portraitAnimationOptions ||
            {};

        const customStyles = combatant?.imageOptions?.styles;

        if (typeof portrait === "string") {
            return (
                <img
                    src={portrait}
                    {...props}
                    style={{ ...customStyles, filter, ...props?.style }}
                    draggable="false"
                    ref={characterImageRef}
                    key={typeof combatant?.image === "string" ? combatant.image : undefined}
                />
            );
        } else if (typeof portrait === "function") {
            const ImageNode: FC<{ className?: string }> = portrait;
            return (
                <div
                    {...props}
                    style={{ ...customStyles, filter, ...props?.style }}
                    ref={characterImageRef}
                    key={typeof combatant?.image === "string" ? combatant.image : undefined}
                >
                    <ImageNode />
                </div>
            );
        }
    };

    const imageNode = getCharacterImageNode(imageProps);
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

    const overrideWeapon = combatant?.effects?.find(({ override }) => override?.weapon !== undefined)?.override?.weapon;
    const weapon = overrideWeapon !== undefined ? overrideWeapon : combatant?.weapon;

    const { isPlayerTurn, state: battleState } = battle || {};
    const showIncomingDamagePreview =
        previewTargetedBy && !isEnemy && isPlayerTurn && battleState === BATTLE_STATES.TURN_IN_PROGRESS && !eventGroupQueue?.length;

    const getPortraitEffectNode = () => {
        const image = animationOptions?.portraitEffectImage;
        if (typeof image === "string") {
            return <img src={image} className={classes.shouting} />;
        } else if (typeof image === "function") {
            const Icon: FC<{ className?: string }> = image;
            return <Icon className={classes.shouting} />;
        }
    };

    const handleMouseEnter = useCallback(() => {
        onMouseEnter && onMouseEnter(combatant, index);
    }, [onMouseEnter, combatant, index]);

    const handleMouseDown = useCallback(
        (e) => {
            onMouseDown && onMouseDown(e, index);
        },
        [onMouseDown, index]
    );

    return (
        <div
            className={classNames(classes.root, {
                "-selected": isSelected,
                "-highlighted": isHighlighted,
            })}
            onMouseDown={handleMouseDown}
            onMouseEnter={handleMouseEnter}
            {...other}
        >
            <div className={classes.inner}>
                {showReticle && !isTargeted && (
                    <span className={classes.targetAffectedIndicatorContainer}>
                        <Icon icon={ClickIndicatorImage} />
                    </span>
                )}

                {combatant?.HP > 0 && isEnemy && (
                    <div className={classes.header}>
                        <Telegraph combatantInfo={combatantInfo} />
                        {showResourceBar && <ResourceBar resources={combatant.resources} maxResources={combatant.maxResources} />}
                    </div>
                )}
                <div className={classes.combatantContainer} ref={weaponRef}>
                    <div
                        ref={characterRef}
                        className={classNames(classes.portrait, {
                            // Bandaid for issue where displaced combatants would flicker into their new location before being animated
                            [classes.invisible]: currentEventGroup?.displacements?.[combatant?.id],
                        })}
                    >
                        {combatant && (
                            <>
                                <Tooltip open={Boolean(dialog)} title={dialog} placement="top">
                                    {imageNode}
                                </Tooltip>

                                {animation === ANIMATION_TYPES.SHOUT &&
                                    Array.from({ length: 3 }).map((_, i) =>
                                        getCharacterImageNode({
                                            key: i,
                                            className: classes.shouting,
                                            style: { animationDelay: `${0.1 * i}s` },
                                        })
                                    )}
                                {combatant.HP > 0 && (
                                    <div
                                        className={classNames(classes.weaponContainer, {
                                            [classes.applyingEffect]: isApplyingEffect,
                                            [classes.hidden]: action?.animationOptions?.weapon?.hide,
                                        })}
                                    >
                                        <Weapon
                                            image={weapon}
                                            target={targetRef}
                                            wielderRef={weaponRef?.current as any}
                                            wielder={combatant}
                                            event={event}
                                        />
                                    </div>
                                )}
                                {(combatant.HP > 0 || isLifeLinked) && (
                                    <PortraitStatusEffects combatantInfo={combatantInfo} statChanges={eventStatChanges} />
                                )}
                                {animationOptions?.portraitEffectImage && getPortraitEffectNode()}
                                <span className={classNames(classes.center, classes.statChangeContainer)}>
                                    <BlockIcon statChanges={eventStatChanges} delay={hitPlaybackDelay} />
                                    <HitIcon statChanges={eventStatChanges} delay={hitPlaybackDelay} />
                                </span>
                                <Coin action={action} />
                            </>
                        )}
                    </div>
                    {combatant?.HP > 0 && (
                        <>
                            {!isTargeted && !selectedAbility && !currentEventGroup?.id && (
                                <CombatantTooltip combatant={combatant} isEnemy={isEnemy} index={index} />
                            )}
                            <div className={classes.leftContainer}>
                                {getExtraContainerIcons("left")}
                                <Armor amount={combatant.armor} combatantInfo={combatantInfo} />
                                <Health combatantInfo={combatantInfo} />
                            </div>

                            <div className={classes.rightContainer}>
                                {getExtraContainerIcons("right")}
                                <AttackPower combatantInfo={combatantInfo} isEnemy={isEnemy} />
                                {/** Update resources immediately as skills are used: UX issue where lagging resource feedback misleads people into thinking they have more/less resources */}
                                {combatant?.isPlayer && (
                                    <PlayerResources player={findCombatantData(battle, combatant?.id)?.combatant as Player} />
                                )}
                            </div>
                            {animation === ANIMATION_TYPES.SNOOZE && <Icon icon={<ZzzIcon />} size="xl" className={classes.actionIcon} />}
                        </>
                    )}
                </div>
                {(combatant?.HP > 0 || isLifeLinked) && (
                    <div className={classes.effectsContainer}>
                        <EffectIconsContainer isSilenced={isSilenced} combatant={combatant} event={event} />
                    </div>
                )}
            </div>
            {showIncomingDamagePreview && (
                <AbilityPreview
                    previewStatUpdate={[previewTargetedBy]}
                    combatant={combatant}
                    isEnemy={true}
                    className={classes.previewAttacked}
                />
            )}
            {combatant?.HP > 0 && (
                <AbilityPreview
                    previewStatUpdate={previewStatUpdate}
                    combatant={combatant}
                    isEnemy={isEnemy}
                    mode={isHoveringCombatant ? "default" : "discreet"}
                />
            )}
            {showReticle && <Reticle className={classes.reticle} color={reticleColor} />}
            {combatant?.HP > 0 && (
                <div className={classes.statusEffectAnnouncerContainer}>
                    <StatusEffectAnnouncer statChanges={eventStatChanges} combatant={combatant} />
                </div>
            )}
        </div>
    );
};
export default CombatantView;
