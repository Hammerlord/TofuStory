import Icon from "../../icon/Icon";
import { Blood, CrossedSwords, Dizzy, Fire, Hourglass, Snowflake, SpeechBubble } from "../../images";
import { Effect, EFFECT_CLASSES, EFFECT_TYPES } from "../types";

export const getDebuffDurations = (
    effects: Effect[]
): {
    bleedDuration: number;
    stunDuration: number;
    chillDuration: number;
    burnDuration: number;
    damage: number;
    debuffDuration: number;
    silenceDuration: number;
} => {
    const debuffs = effects.filter((effect) => effect.class === EFFECT_CLASSES.DEBUFF);
    return debuffs.reduce((acc, effect: Effect) => {
        const { type, duration = 0, damage = 0 } = effect;
        switch (type) {
            case EFFECT_TYPES.BLEED:
                return {
                    ...acc,
                    bleedDuration: (acc.bleedDuration || 0) + duration,
                };
            case EFFECT_TYPES.STUN:
                return {
                    ...acc,
                    stunDuration: (acc.stunDuration || 0) + duration,
                };
            case EFFECT_TYPES.CHILL:
                return {
                    ...acc,
                    chillDuration: (acc.chillDuration || 0) + duration,
                };
            case EFFECT_TYPES.BURN:
                return {
                    ...acc,
                    burnDuration: (acc.burnDuration || 0) + duration,
                };
            case EFFECT_TYPES.SILENCE:
                return {
                    ...acc,
                    silenceDuration: (acc.silenceDuration || 0) + duration,
                };
            default:
                return {
                    ...acc,
                    damage: (acc.damage || 0) + damage,
                    debuffDuration: (acc.debuffDuration || 0) + duration,
                };
        }
    }, {} as any);
};

const Debuffs = ({ effects }: { effects: Effect[] }) => {
    const { bleedDuration, stunDuration, chillDuration, burnDuration, damage, debuffDuration, silenceDuration } =
        getDebuffDurations(effects);

    const hasDebuff =
        bleedDuration > 0 || stunDuration > 0 || burnDuration > 0 || chillDuration > 0 || debuffDuration > 0 || silenceDuration > 0;
    if (!hasDebuff) {
        return null;
    }

    return (
        <div>
            Inflict{" "}
            {bleedDuration > 0 && (
                <>
                    <Icon icon={<Blood />} size={"sm"} />
                    <Icon icon={<Hourglass />} size={"sm"} text={bleedDuration} />
                </>
            )}{" "}
            {stunDuration > 0 && (
                <>
                    <Icon icon={<Dizzy />} size={"sm"} />
                    <Icon icon={<Hourglass />} size={"sm"} text={stunDuration} />
                </>
            )}{" "}
            {burnDuration > 0 && (
                <>
                    <Icon icon={<Fire />} size={"sm"} /> <Icon icon={<Hourglass size={"sm"} />} text={burnDuration} />
                </>
            )}{" "}
            {chillDuration > 0 && (
                <>
                    <Icon icon={<Snowflake />} size={"sm"} /> <Icon icon={<Hourglass />} size={"sm"} text={chillDuration} />
                </>
            )}{" "}
            {damage && (
                <>
                    <Icon icon={<CrossedSwords />} size={"sm"} text={`${damage > 0 ? "+" : ""}${damage}`} />
                    <Icon icon={<Hourglass />} size={"sm"} text={debuffDuration} />
                </>
            )}
            {silenceDuration > 0 && (
                <>
                    <Icon icon={<SpeechBubble />} size={"sm"} />
                    <Icon icon={<Hourglass />} size={"sm"} text={silenceDuration} />
                </>
            )}
        </div>
    );
};

export default Debuffs;
