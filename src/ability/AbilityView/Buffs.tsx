import { cloneElement } from "react";
import Icon from "../../icon/Icon";
import { UpMATTImage } from "../../images";
import { CactusIcon, CloudyIcon, CrossedSwordsIcon, HeartIcon, HourglassIcon, ShieldIcon } from "../../images/icons";
import { Fury } from "../../resource/ResourcesView";
import { CONDITION_TARGETS, Effect, EffectEventTrigger, EFFECT_CLASSES, EFFECT_EVENT_KEYS, EFFECT_TYPES } from "../types";
import { effectEventKeyLabelMap, multiplierTypeKeyLabelMap } from "./constants";
import { getAllEffects } from "./utils";

const EffectEventDisplay = (effectEvents) => {
    const content = Object.entries(effectEvents).map(([key, value]) => {
        if (!effectEventKeyLabelMap[key]) {
            return null;
        }

        const {
            conditions,
            targetType,
            effects,
            armor,
            healing,
            drawCards,
            resurrect,
            resources,
            damage,
            multiplier,
            ability,
            removeEffect,
        } = value as EffectEventTrigger;

        if (effects || ability) {
            // Not handled
            return null;
        }

        const components = [<>{`${effectEventKeyLabelMap[key]}, `}</>];
        if (resurrect) {
            components.push(<>resurrect</>);
        }
        if (armor) {
            components.push(
                <>
                    gain <Icon icon={<ShieldIcon />} size={"sm"} text={`+${armor}`} />
                </>
            );
        }
        if (healing) {
            components.push(
                <>
                    heal for <Icon icon={<HeartIcon />} size={"sm"} text={healing} />
                </>
            );
        }
        if (resources) {
            components.push(
                <>
                    gain <Fury size={"sm"} text={resources} />
                </>
            );
        }
        if (damage) {
            components.push(
                <span>
                    deal <Icon icon={<CrossedSwordsIcon />} size={"sm"} text={`+${damage}`} />
                </span>
            );
        }

        if (multiplier) {
            const value = multiplier.value < 1 ? `${(multiplier.value as number) * 100}%` : multiplier.value;
            const calculationTarget = multiplier.calculationTarget === CONDITION_TARGETS.ACTOR ? "you" : "the target";
            components.push(<>{Handlebars.compile(multiplierTypeKeyLabelMap[multiplier.type] || "")({ value, calculationTarget })}</>);
        }

        if (removeEffect) {
            if (components.length > 1) {
                components.push(<>and this effect is removed</>);
            } else if (key === EFFECT_EVENT_KEYS.onAttack) {
                return <span key={key}>on your next attack</span>;
            }
        }

        return <span key={key}>{components.map((component, j) => cloneElement(component, { key: j }))}</span>;
    });

    return <>{content}</>;
};

const Buffs = ({ ability }) => {
    const buffs = getAllEffects(ability).filter((effect: Effect) => effect.class === EFFECT_CLASSES.BUFF);

    return (
        <>
            {buffs.map((effect: Effect, i) => {
                const {
                    armorReceived = 0,
                    attackPower = 0,
                    duration = Infinity,
                    preventArmorDecay,
                    skillBonus = [],
                    resourcesPerTurn,
                    lifeOnHit = 0,
                    lifeOnKill = 0,
                    thorns = 0,
                    healingReceived,
                    attackDamageReceived,
                    attackAreaIncrease,
                    ...other
                } = effect;
                const effectComponents = [];

                if (thorns > 0) {
                    effectComponents.push(
                        <span>
                            Gain <Icon icon={<CactusIcon />} size={"sm"} />{" "}
                        </span>
                    );
                }

                if (armorReceived > 0) {
                    effectComponents.push(
                        <span>
                            Gain{" "}
                            <Icon icon={<ShieldIcon />} size={"sm"} text={armorReceived < 0 ? `-${armorReceived}` : `+${armorReceived}`} />{" "}
                            from armor sources{" "}
                        </span>
                    );
                }

                if (effect.type === EFFECT_TYPES.STEALTH) {
                    effectComponents.push(
                        <span>
                            <Icon size={"sm"} icon={<CloudyIcon />} /> Stealth
                        </span>
                    );
                }
                if (effect.type === EFFECT_TYPES.IMMUNITY) {
                    effectComponents.push(
                        <span>
                            <Icon size={"sm"} icon={UpMATTImage} /> Immunity
                        </span>
                    );
                }

                if (attackPower > 0) {
                    effectComponents.push(
                        <span>
                            Gain <Icon icon={<CrossedSwordsIcon />} size={"sm"} text={`+${attackPower}`} />{" "}
                        </span>
                    );
                }

                if (preventArmorDecay) {
                    if (effectComponents.length > 0) {
                        effectComponents.push(<span>and prevent armor decay </span>);
                    } else {
                        effectComponents.push(<span>Prevent armor decay </span>);
                    }
                }

                if (lifeOnHit > 0) {
                    effectComponents.push(
                        <span>
                            {effectComponents.length > 0 ? "and gain" : "Gain"} <Icon icon={<HeartIcon />} text={lifeOnHit} size={"sm"} />{" "}
                            per hit
                        </span>
                    );
                }

                if (resourcesPerTurn > 0) {
                    effectComponents.push(
                        <>
                            {effectComponents.length > 0 ? "and gain" : "Gain"} <Fury size={"sm"} text={`+${resourcesPerTurn}`} /> per turn
                        </>
                    );
                }

                if (skillBonus.length > 0) {
                    effectComponents.push(
                        <>
                            {...skillBonus.map(({ skill, damage = 0 }) => (
                                <div key={skill}>
                                    {skill} {damage > 0 && <Icon icon={<CrossedSwordsIcon />} size={"sm"} text={`+${damage}`} />}
                                </div>
                            ))}
                        </>
                    );
                }

                if (attackAreaIncrease > 0) {
                    effectComponents.push(<>+{attackAreaIncrease} area </>);
                }

                if (effect.type !== EFFECT_TYPES.STEALTH) {
                    // Stealth need not be explained here
                    effectComponents.push(<EffectEventDisplay {...other} />);
                }

                if (duration === 0) {
                    effectComponents.push(<> this turn</>);
                } else if (duration !== Infinity) {
                    effectComponents.push(<Icon icon={<HourglassIcon />} size={"sm"} text={duration === Infinity ? "∞" : duration} />);
                }

                return <span key={i}>{effectComponents.map((component, j) => cloneElement(component, { key: j }))}</span>;
            })}
        </>
    );
};

export default Buffs;
