import { getMultiplier } from "../../battle/utils";
import Icon from "../../icon/Icon";
import { Blood, CrossedSwords, Dizzy, Fire, Heart, Shield, Snowflake } from "../../images";
import { Condition, EFFECT_CLASSES, EFFECT_TYPES } from "../types";

const getIconForEffectType = (effectType: EFFECT_TYPES, key: number): JSX.Element => {
    const map = {
        [EFFECT_TYPES.BLEED]: <Icon icon={Blood} key={key} />,
        [EFFECT_TYPES.STUN]: <Icon icon={Dizzy} key={key} />,
        [EFFECT_TYPES.CHILL]: <Icon icon={Snowflake} key={key} />,
        [EFFECT_TYPES.BURN]: <Icon icon={Fire} key={key} />,
    };
    return map[effectType];
};

// This is incomplete
const BonusView = ({ ability, player }) => {
    const bonuses = ability?.actions.map(({ bonus }) => bonus).filter((val) => val);
    if (!bonuses?.length) {
        return null;
    }

    const comparatorMap = {
        eq: "at",
        gt: "with more than",
        lt: "with less than",
    };
    return (
        <>
            {bonuses.map(({ damage = 0, healing = 0, armor = 0, conditions = [], multiplier }, i) => {
                const conditionText = conditions?.map(
                    ({ hasEffectType = [], hasEffectClass, healthPercentage, armor, comparator }: Condition) => {
                        if (hasEffectType.length) {
                            return (
                                <span key={i}>
                                    to targets afflicted by {hasEffectType.map(getIconForEffectType)}
                                    {i < conditions.length - 1 ? " or " : ""}
                                </span>
                            );
                        }
                        if (hasEffectClass) {
                            return (
                                <span key={i}>
                                    to targets {hasEffectClass === EFFECT_CLASSES.DEBUFF ? "afflicted by a debuff" : "affected by a buff"}
                                </span>
                            );
                        }
                        if (healthPercentage !== undefined) {
                            return (
                                <span key={i}>
                                    to targets {comparatorMap[comparator]} {healthPercentage * 100}% HP
                                </span>
                            );
                        }
                        if (armor !== undefined) {
                            return (
                                <span key={i}>
                                    to <Icon icon={<Shield />} /> targets
                                </span>
                            );
                        }
                    }
                );
                const bonusMultiplier = getMultiplier({ actor: player, multiplier });
                const totalDamage = damage * bonusMultiplier;
                const totalHealing = healing * bonusMultiplier;
                const totalArmor = armor * bonusMultiplier;
                return (
                    <div key={i}>
                        {totalDamage > 0 && (
                            <>
                                Deal <Icon icon={CrossedSwords} text={`+${totalDamage}`} />
                            </>
                        )}{" "}
                        {totalHealing > 0 && <Icon icon={Heart} text={`+${totalHealing}`} />}{" "}
                        {totalArmor > 0 && <Icon icon={Shield} text={`+${totalArmor}`} />}
                        {conditionText}
                    </div>
                );
            })}
        </>
    );
};

export default BonusView;
