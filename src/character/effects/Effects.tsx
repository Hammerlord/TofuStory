import { createUseStyles } from "react-jss";
import { Effect, EFFECT_TYPES } from "../../ability/types";
import Burn from "./Burn";
import Chill from "./Chill";
import Healing from "./Healing";
import Icon from "../../icon/Icon";
import { Dizzy, SpeechBubble } from "../../images";
import Bleed from "./Bleed";
import Stealth from "./Stealth";

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
        width: "48px",
        height: "48px",
        position: "absolute",
        left: "35%",
        top: "16px",
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
        width: "48px",
        height: "48px",
        position: "absolute",
        right: "25%",
        top: -8,
        animationName: "$silenceAnimation",
        animationDuration: "2s",
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
    "@keyframes immuneAnimation": {
        from: {
            width: "80%",
            height: "80%",
            opacity: "0.3",
        },
        to: {
            opacity: "1",
            width: "100%",
            height: "100%",
        },
    },
    immune: {
        position: "absolute",
        borderRadius: "100px",
        border: "2px solid rgba(255, 255, 240, 0.9)",
        boxShadow: "0 0 20px 4px rgb(255, 255, 220), 0 0 15px 4px rgb(255, 255, 220)",
        top: "60%",
        left: "50%",
        transform: "translateX(-50%) translateY(-50%)",
        animationName: "$immuneAnimation",
        animationDuration: "2s",
        animationIterationCount: "infinite",
        animationDirection: "alternate-reverse",
    },
});

const Effects = ({ combatant, healing }) => {
    const classes = useStyles();

    if (!combatant) {
        return null;
    }
    const hasStatusEffect = (type: EFFECT_TYPES): boolean => {
        return combatant.effects.some((effect) => effect.type === type);
    };

    const isStunned = hasStatusEffect(EFFECT_TYPES.STUN);
    const isStealthed = hasStatusEffect(EFFECT_TYPES.STEALTH);
    const isSilenced = hasStatusEffect(EFFECT_TYPES.SILENCE);
    const isImmune = hasStatusEffect(EFFECT_TYPES.IMMUNITY) || hasStatusEffect(EFFECT_TYPES.ATTACK_IMMUNITY);
    const bleeds = combatant.effects.filter((effect) => effect.type === EFFECT_TYPES.BLEED) || [];
    const burn = combatant.effects.reduce((acc: number, effect: Effect) => {
        if (effect.type === EFFECT_TYPES.BURN) {
            return acc + effect.duration;
        }
        return acc;
    }, 0);
    const chill = combatant.effects.reduce((acc: number, effect: Effect) => {
        if (effect.type === EFFECT_TYPES.CHILL) {
            return acc + effect.duration;
        }
        return acc;
    }, 0);
    return (
        <div className={classes.root}>
            {
                <span className={classes.center}>
                    <Healing amount={healing} />
                    <Burn amount={burn} />
                    <Chill amount={chill} />
                    <Stealth isStealthed={isStealthed} />
                </span>
            }
            {isSilenced && <Icon icon={<SpeechBubble />} size="xl" className={classes.silence} />}
            {isStunned && <Icon icon={<Dizzy />} size="xl" className={classes.stun} />}
            {isImmune && <div className={classes.immune} />}
            {bleeds.length > 0 && (
                <div className={classes.bleed}>
                    <Bleed />
                </div>
            )}
        </div>
    );
};

export default Effects;
