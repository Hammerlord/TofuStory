import Icon from "../../icon/Icon";
import { BloodIcon, CrossedSwordsIcon, DizzyIcon, FireIcon, HourglassIcon, SnowflakeIcon, SpeechBubbleIcon } from "../../images/icons";
import { Effect, EFFECT_CLASSES, EFFECT_TYPES } from "../types";

export const getDebuffIcon = (type: EFFECT_TYPES): JSX.Element => {
    switch (type) {
        case EFFECT_TYPES.BLEED:
            return <BloodIcon />;
        case EFFECT_TYPES.STUN:
            return <DizzyIcon />;
        case EFFECT_TYPES.CHILL:
            return <SnowflakeIcon />;
        case EFFECT_TYPES.BURN:
            return <FireIcon />;
        case EFFECT_TYPES.SILENCE:
            return <SpeechBubbleIcon />;
    }
};

const Debuffs = ({ effects }: { effects: Effect[] }) => {
    const debuffs = effects.filter((effect) => effect.class === EFFECT_CLASSES.DEBUFF);
    if (debuffs.length === 0) {
        return null;
    }

    return (
        <div>
            Inflict{" "}
            {debuffs.map((effect: Effect, i) => {
                const { duration, attackPower, type } = effect;
                return (
                    <span key={i}>
                        <Icon icon={getDebuffIcon(type)} size={"sm"} />
                        {/** Chill's attack power decrease is explained in a tooltip */}
                        {attackPower && type !== EFFECT_TYPES.CHILL && (
                            <Icon icon={<CrossedSwordsIcon />} size={"sm"} text={`${attackPower > 0 ? "+" : ""}${attackPower}`} />
                        )}
                        <Icon icon={<HourglassIcon />} size={"sm"} text={duration === Infinity ? "∞" : duration} />
                    </span>
                );
            })}
        </div>
    );
};

export default Debuffs;
