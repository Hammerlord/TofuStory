import Icon from "../../icon/Icon";
import { Blood, CrossedSwords, Dizzy, Fire, Hourglass, Snowflake, SpeechBubble } from "../../images";
import { Effect, EFFECT_CLASSES, EFFECT_TYPES } from "../types";

export const getDebuffIcon = (type: EFFECT_TYPES): JSX.Element => {
    switch (type) {
        case EFFECT_TYPES.BLEED:
            return <Blood />;
        case EFFECT_TYPES.STUN:
            return <Dizzy />;
        case EFFECT_TYPES.CHILL:
            return <Snowflake />;
        case EFFECT_TYPES.BURN:
            return <Fire />;
        case EFFECT_TYPES.SILENCE:
            return <SpeechBubble />;
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
                            <Icon icon={<CrossedSwords />} size={"sm"} text={`${attackPower > 0 ? "+" : ""}${attackPower}`} />
                        )}
                        <Icon icon={<Hourglass />} size={"sm"} text={duration === Infinity ? "∞" : duration} />
                    </span>
                );
            })}
        </div>
    );
};

export default Debuffs;
