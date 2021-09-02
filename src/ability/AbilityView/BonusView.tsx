import Icon from "../../icon/Icon";
import { ArrowDown, Blood, CrossedSwords, Dizzy, Fire, Heart, Shield, Snowflake } from "../../images";
import { EFFECT_TYPES } from "../types";

const getIconForEffectType = (effectType: EFFECT_TYPES, key: number): JSX.Element => {
    const map = {
        [EFFECT_TYPES.BLEED]: <Icon icon={Blood} key={key} />,
        [EFFECT_TYPES.STUN]: <Icon icon={Dizzy} key={key} />,
        [EFFECT_TYPES.CHILL]: <Icon icon={Snowflake} key={key} />,
        [EFFECT_TYPES.DEBUFF]: <Icon icon={ArrowDown} key={key} />,
        [EFFECT_TYPES.BURN]: <Icon icon={Fire} key={key} />,
    };
    return map[effectType];
};

// This is incomplete
const BonusView = ({ ability }) => {
    const bonuses = ability?.actions.map(({ bonus }) => bonus).filter((val) => val);
    if (!bonuses?.length) {
        return null;
    }

    return (
        <>
            {bonuses.map(({ damage = 0, healing = 0, armor = 0, conditions = [] }, i) => {
                const conditionText = conditions?.map(({ hasEffectType = [] }) => {
                    if (hasEffectType.length) {
                        return <span key={i}>on targets with {hasEffectType.map(getIconForEffectType)}{i < conditions.length - 1 ? ' or ' : ''}</span>;
                    }
                });
                return (
                    <div key={i}>
                        {damage > 0 && <Icon icon={CrossedSwords} text={`+${damage}`} />}{" "}
                        {healing > 0 && <Icon icon={Heart} text={`+${healing}`} />} {armor > 0 && <Icon icon={Shield} text={`+${armor}`} />}
                        {conditionText}
                    </div>
                );
            })}
        </>
    );
};

export default BonusView;
