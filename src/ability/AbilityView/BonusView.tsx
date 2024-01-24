import { getMultiplier } from "../../battle/utils";
import Icon from "../../icon/Icon";
import { AlchemistStoneImage, NimbleJewelCImage } from "../../images";
import { BloodIcon, CrossedSwordsIcon, DizzyIcon, FireIcon, HeartIcon, HourglassIcon, ShieldIcon, SnowflakeIcon } from "../../images/icons";
import { polymorph } from "../magician/magicianAbilities";
import { Action, Bonus, Condition, EFFECT_CLASSES, EFFECT_TYPES, Effect } from "../types";

const getIconForEffectType = (effectType: EFFECT_TYPES, key: number): JSX.Element => {
    const map = {
        [EFFECT_TYPES.BLEED]: <Icon icon={BloodIcon} key={key} size={"sm"} />,
        [EFFECT_TYPES.STUN]: <Icon icon={DizzyIcon} key={key} size={"sm"} />,
        [EFFECT_TYPES.CHILL]: <Icon icon={SnowflakeIcon} key={key} size={"sm"} />,
        [EFFECT_TYPES.BURN]: <Icon icon={FireIcon} key={key} size={"sm"} />,
        [EFFECT_TYPES.FREEZE]: <Icon icon={NimbleJewelCImage} key={key} size={"sm"} />,
    };
    return map[effectType];
};

// This is incomplete
const BonusView = ({ ability, player, deck, hand, discard }) => {
    const bonuses = ability?.actions?.reduce((acc: Bonus[], action: Action) => {
        const bonus = action.bonus;
        if (!bonus) {
            return acc;
        }
        if (Array.isArray(bonus)) {
            return [...acc, ...bonus];
        }

        return [...acc, bonus];
    }, []);

    if (!bonuses?.length) {
        return null;
    }

    const comparatorMap = {
        eq: "at",
        gt: "with more than",
        lt: "with less than",
    };

    const bonusDescriptions = [];

    bonuses.forEach(({ damage = 0, healing = 0, armor = 0, conditions = [], multiplier, area = 0, effects = [] }, i) => {
        const conditionText = conditions?.map(
            ({ hasEffectType = [], hasEffect, hasEffectClass, healthPercentage, armor, comparator }: Condition) => {
                if (hasEffectType.length) {
                    if (multiplier) {
                        return (
                            <span key={i}>
                                for each {hasEffectType.map(getIconForEffectType)} on the {multiplier.calculationTarget}
                            </span>
                        );
                    }

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
                            to <Icon icon={<ShieldIcon />} size={"sm"} /> targets
                        </span>
                    );
                }

                if (effects.length) {
                    return (
                        <span key={i}>
                            Apply{" "}
                            {effects.map((e: Effect, i) => (
                                <span key={e.name}>
                                    <Icon icon={e.icon} size={"sm"} /> <Icon icon={<HourglassIcon />} text={e.duration} size={"sm"} />{" "}
                                </span>
                            ))}{" "}
                        </span>
                    );
                }
            }
        );
        const hasEffect = conditions?.find(({ hasEffect }) => hasEffect)?.hasEffect;
        const bonusMultiplier = getMultiplier({ actor: { combatant: player, index: undefined }, multiplier, deck, hand, discard });
        const totalDamage = damage * bonusMultiplier;
        const totalHealing = healing * bonusMultiplier;
        const totalArmor = armor * bonusMultiplier;
        const bonusLabel = {
            hasEffect,
            totalDamage,
            totalHealing,
            totalArmor,
            conditionText,
            area,
        };

        if (bonusDescriptions.every((desc) => JSON.stringify(desc) !== JSON.stringify(bonusLabel))) {
            bonusDescriptions.push(bonusLabel);
        }
    });

    return (
        <>
            {bonusDescriptions.map(({ hasEffect, totalDamage, totalHealing, totalArmor, conditionText, area }, i) => {
                return (
                    <div key={i}>
                        {hasEffect === "Charged" && (
                            <>
                                <Icon icon={AlchemistStoneImage} size={"sm"} />:{" "}
                            </>
                        )}
                        {totalDamage > 0 && (
                            <>
                                Deal <Icon icon={CrossedSwordsIcon} text={`+${totalDamage}`} size={"sm"} />
                            </>
                        )}{" "}
                        {area > 0 && `+${area} area`}
                        {totalHealing > 0 && <Icon icon={HeartIcon} text={`+${totalHealing}`} size={"sm"} />}{" "}
                        {totalArmor > 0 && <Icon icon={ShieldIcon} text={`+${totalArmor}`} size={"sm"} />}
                        {conditionText}
                    </div>
                );
            })}
        </>
    );
};

export default BonusView;
