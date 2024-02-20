import { createUseStyles } from "react-jss";
import { Effect, EFFECT_TYPES } from "../../ability/types";
import Burn from "./Burn";
import Chill from "./Chill";
import Healing from "./Healing";
import Icon from "../../icon/Icon";
import Bleed from "./Bleed";
import Stealth from "./Stealth";
import { getEnabledEffects } from "../../battle/utils";
import { DizzyIcon, SpeechBubbleIcon } from "../../images/icons";
import { NimbleJewelCImage } from "../../images";

const useStyles = createUseStyles({
    root: {
        height: "100%",
        width: "100%",
        position: "absolute",
        top: 0,
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
    stun: {
        top: -60,
        width: "48px",
        height: "48px",
        position: "absolute",
        left: "35%",
        animationName: "$upAndDown",
        animationDuration: "1s",
        animationIterationCount: "infinite",
        animationDirection: "alternate-reverse",
    },
    "@keyframes silenceAnimation": {
        from: {
            transform: "translateY(-4px)",
            opacity: "0.3",
        },
        to: {
            transform: "translateY(2px)",
            opacity: "1",
        },
    },
    silence: {
        top: -60,
        width: "48px",
        height: "48px",
        position: "absolute",
        right: "25%",
        animationName: "$silenceAnimation",
        animationDuration: "2s",
        animationIterationCount: "infinite",
        animationDirection: "alternate-reverse",
    },
    bleed: {
        top: -60,
        display: "flex",
        position: "absolute",
        left: "50%",
        transform: "translateX(-50%)",
    },
    "@keyframes immuneAnimation": {
        from: {
            minHeight: "140px",
            width: "80%",
            height: "100%",
            opacity: "0.3",
        },
        to: {
            minHeight: "160px",
            opacity: "1",
            width: "100%",
            height: "120%",
        },
    },
    immune: {
        position: "absolute",
        borderRadius: "100px",
        border: "2px solid rgba(255, 255, 240, 0.9)",
        boxShadow: Array.from({ length: 5 })
            .map((_, i) => `0 0 20px 4px rgb(235, 230, ${200 - i * 3})`)
            .join(", "),
        background: "rgb(255, 255, 240, 0.2)",
        top: "60%",
        left: "50%",
        transform: "translateX(-50%) translateY(-50%)",
        animationName: "$immuneAnimation",
        animationDuration: "2s",
        animationIterationCount: "infinite",
        animationDirection: "alternate-reverse",
        minHeight: "140px",
    },
    "@keyframes custom": {
        "0%": {
            transform: "scale(1.25, 1.25) translateX(-50%)",
            opacity: "0.05",
        },
        "50%": {
            transform: "scale(1.25, 1.25) translateX(-50%)",
            opacity: "0.1",
        },
        "100%": {
            transform: "scale(1.5, 1.5) translateX(-50%)",
            opacity: "0.4",
        },
    },
    customEffect: {
        animationName: "$custom",
        animationDuration: "3s",
        animationIterationCount: "infinite",
        animationDirection: "alternate-reverse",
        left: "50%",
        width: "100%",
        height: "100%",
        position: "absolute",
        transform: "translateX(-50%)",
        transformOrigin: "bottom left",
        maxWidth: "50px",
    },
    freeze: {
        bottom: "-105px",
        left: "50%",
        width: "100%",
        position: "absolute",
        transform: "translateX(-50%) translateY(-50%)",
        opacity: 0.3,
    },
});

/**
 * Shows the stun, bleed, etc. icons for status effects on the combatant's portrait
 */
const Effects = ({ combatantInfo, statChanges }) => {
    const classes = useStyles();

    if (!combatantInfo?.combatant) {
        return null;
    }

    const effects = getEnabledEffects({ combatantInfo });
    const hasStatusEffect = (type: EFFECT_TYPES): boolean => {
        return effects.some((effect) => effect.type === type);
    };

    const isStunned = hasStatusEffect(EFFECT_TYPES.STUN);
    const isStealthed = hasStatusEffect(EFFECT_TYPES.STEALTH);
    const isSilenced = hasStatusEffect(EFFECT_TYPES.SILENCE);
    const isImmune = hasStatusEffect(EFFECT_TYPES.IMMUNITY) || hasStatusEffect(EFFECT_TYPES.ATTACK_IMMUNITY);
    const isFrozen = hasStatusEffect(EFFECT_TYPES.FREEZE);
    const bleeds = effects.filter((effect) => effect.type === EFFECT_TYPES.BLEED) || [];
    const burn = effects.reduce((acc: number, effect: Effect) => {
        if (effect.type === EFFECT_TYPES.BURN) {
            return acc + effect.duration;
        }
        return acc;
    }, 0);
    const chill = combatantInfo?.combatant?.effects.reduce((acc: number, effect: Effect) => {
        if (effect.type === EFFECT_TYPES.CHILL) {
            return acc + effect.duration;
        }
        return acc;
    }, 0);

    const getEffectImage = (image: string | JSX.Element) => {
        if (typeof image === "string") {
            return <img src={image} draggable="false" />;
        } else if (typeof image === "function") {
            const ImageNode = image as Function;
            return <ImageNode />;
        }
    };

    return (
        <div className={classes.root}>
            {
                <span className={classes.center}>
                    <Healing statChanges={statChanges} />
                    <Burn amount={burn} />
                    <Chill amount={chill} />
                    <Stealth isStealthed={isStealthed} />
                </span>
            }
            {isSilenced && <Icon icon={<SpeechBubbleIcon />} size="xl" className={classes.silence} />}
            {isStunned && <Icon icon={<DizzyIcon />} size="xl" className={classes.stun} />}
            {isFrozen && <img src={NimbleJewelCImage} alt="Frozen" className={classes.freeze} />}

            {isImmune && <div className={classes.immune} />}
            {bleeds.length > 0 && (
                <div className={classes.bleed}>
                    <Bleed />
                </div>
            )}
            {effects.map(
                (effect, i) =>
                    effect.image && (
                        <span className={classes.center} key={effect.id || [effect.name, i].join("-")}>
                            <span className={classes.customEffect}>{getEffectImage(effect.image)}</span>
                        </span>
                    )
            )}
        </div>
    );
};

export default Effects;
