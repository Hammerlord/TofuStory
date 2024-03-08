import Icon from "../../icon/Icon";
import { NimbleJewelCImage } from "../../images";
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
        case EFFECT_TYPES.FREEZE:
            return NimbleJewelCImage;
    }
};

const Debuffs = ({ effects }: { effects: Effect[] }) => {
    const debuffs = effects.filter((effect) => effect.class === EFFECT_CLASSES.DEBUFF);
    if (debuffs.length === 0) {
        return null;
    }

    return (
        <div>
            Apply{" "}
            {debuffs.map((effect: Effect, i) => {
                const { duration, attackPower, type, attackDamageReceived } = effect;
                return (
                    <span key={i}>
                        {getDebuffIcon(type) && <Icon icon={getDebuffIcon(type)} size={"sm"} />}
                        {/** Chill's attack power decrease is explained in a tooltip */}
                        {attackPower && type !== EFFECT_TYPES.CHILL && (
                            <>
                                <Icon icon={<CrossedSwordsIcon />} size={"sm"} text={`${attackPower > 0 ? "+" : ""}${attackPower}`} />{" "}
                                attack power{" "}
                            </>
                        )}
                        {/** Bleed's attack damage received increase is explained in a tooltip */}
                        {attackDamageReceived && type !== EFFECT_TYPES.BLEED && (
                            <>
                                <Icon
                                    icon={<CrossedSwordsIcon />}
                                    size={"sm"}
                                    text={`${attackDamageReceived > 0 ? "+" : ""}${attackDamageReceived}`}
                                />{" "}
                                damage received from attacks
                            </>
                        )}
                        {duration && duration !== Infinity && <Icon icon={<HourglassIcon />} size={"sm"} text={duration} />}
                    </span>
                );
            })}
        </div>
    );
};

export default Debuffs;
