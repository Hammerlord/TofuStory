import Icon from "../../icon/Icon";
import { Blood, Dizzy, Fire, Snowflake } from "../../images";
import { EFFECT_TYPES } from "../types";

const Debuffs = ({ ability }) => {
    const allEffects = ability.actions.reduce((acc, { effects = [] }) => {
        acc.push(...effects);
        return acc;
    }, []);
    const { bleedDuration, stun, chill, burn } = allEffects.reduce((acc, effect) => {
        switch (effect.type) {
            case EFFECT_TYPES.BLEED:
                return {
                    ...acc,
                    bleedDuration: (acc.bleedDuration || 0) + effect.duration || 0,
                };
            case EFFECT_TYPES.STUN:
                return {
                    ...acc,
                    stun: true,
                };
            case EFFECT_TYPES.CHILL:
                return {
                    ...acc,
                    chill: true,
                };
            case EFFECT_TYPES.BURN:
                return {
                    ...acc,
                    burn: true,
                };
        }

        return acc;
    }, {});

    const hasDebuff = bleedDuration > 0 || stun || burn || chill;
    if (!hasDebuff) {
        return null;
    }

    return (
        <div>
            Inflict {bleedDuration > 0 && <Icon icon={<Blood />} text={bleedDuration} />} {stun && <Icon icon={<Dizzy />} />}{" "}
            {burn && <Icon icon={<Fire />} />} {chill && <Icon icon={<Snowflake />} />}
        </div>
    );
};

export default Debuffs;
