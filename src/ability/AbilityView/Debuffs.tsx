import Icon from "../../icon/Icon";
import { Blood, CrossedSwords, Dizzy, Fire, Hourglass, Snowflake } from "../../images";
import { Ability, Effect, EFFECT_TYPES } from "../types";
import { getAllEffects } from "./utils";

export const getDebuffDurations = (
    ability: Ability
): { bleedDuration: number; stunDuration: number; chillDuration: number; burnDuration: number; damage: number; debuffDuration: number } => {
    const allEffects = getAllEffects(ability);
    return allEffects.reduce((acc, effect: Effect) => {
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
            case EFFECT_TYPES.DEBUFF:
                return {
                    ...acc,
                    damage: (acc.damage || 0) + damage,
                    debuffDuration: (acc.debuffDuration || 0) + duration,
                };
            default:
                return acc;
        }
    }, {} as any);
};

const Debuffs = ({ ability }) => {
    const { bleedDuration, stunDuration, chillDuration, burnDuration, damage, debuffDuration } = getDebuffDurations(ability);

    const hasDebuff = bleedDuration > 0 || stunDuration > 0 || burnDuration > 0 || chillDuration > 0 || debuffDuration > 0;
    if (!hasDebuff) {
        return null;
    }

    return (
        <div>
            Inflict{" "}
            {bleedDuration > 0 && (
                <>
                    <Icon icon={<Blood />} />
                    <Icon icon={<Hourglass />} text={bleedDuration} />
                </>
            )}{" "}
            {stunDuration > 0 && (
                <>
                    <Icon icon={<Dizzy />} />
                    <Icon icon={<Hourglass />} text={stunDuration} />
                </>
            )}{" "}
            {burnDuration > 0 && (
                <>
                    <Icon icon={<Fire />} /> <Icon icon={<Hourglass />} text={burnDuration} />
                </>
            )}{" "}
            {chillDuration > 0 && (
                <>
                    <Icon icon={<Snowflake />} /> <Icon icon={<Hourglass />} text={chillDuration} />
                </>
            )}{" "}
            {damage && (
                <>
                    <Icon icon={<CrossedSwords />} text={`${damage > 0 ? "+" : ""}${damage}`} />
                    <Icon icon={<Hourglass />} text={debuffDuration} />
                </>
            )}
        </div>
    );
};

export default Debuffs;
