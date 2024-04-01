import { cloneElement } from "react";
import Icon from "../../icon/Icon";
import { UpMATTImage } from "../../images";
import { CactusIcon, CloudyIcon, CrossedSwordsIcon, HeartIcon, HourglassIcon, ShieldIcon } from "../../images/icons";
import { CONDITION_TARGETS, Condition, EFFECT_CLASSES, EFFECT_EVENT_KEYS, EFFECT_TYPES, Effect, EffectEventTrigger } from "../types";
import CardsToAdd from "./CardsToAdd";
import { ResourceIcon } from "./ResourceIcon";
import { effectEventKeyLabelMap, multiplierTypeKeyLabelMap } from "./constants";
import { getAllEffects } from "./utils";

const EffectEventDisplay = ({ playerClass, ...effectEvents }) => {
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
            addCards,
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

        const components = [
            <>
                <br />
                {effectEventKeyLabelMap[key]}
            </>,
        ];

        if (conditions) {
            const comparatorMap = {
                gt: "at least",
                lt: "less than",
                eq: "",
            };
            conditions.forEach((condition: Condition) => {
                const { resourceCost, comparator } = condition || {};
                if (resourceCost !== undefined) {
                    const cost = comparator === "gt" ? resourceCost + 1 : resourceCost; // gt is displayed as "at least <amount>"
                    components.push(
                        <>
                            {" "}
                            that costs {comparatorMap[comparator] || ""} <ResourceIcon size={"sm"} text={cost} playerClass={playerClass} />
                        </>
                    );
                }
            });
        }

        components.push(<>, </>);

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
                    gain <ResourceIcon size={"sm"} text={resources} playerClass={playerClass} />
                </>
            );
        }
        if (damage) {
            components.push(
                <>
                    deal <Icon icon={<CrossedSwordsIcon />} size={"sm"} text={`+${damage}`} />
                </>
            );
        }
        if (addCards?.length > 0) {
            components.push(<CardsToAdd ability={{ actions: [{ addCards }] }} isInline={true} />);
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

const Buffs = ({ ability, player }) => {
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
                    turnsTriggerFrequency,
                    drawCardsPerTurn,
                    stacks,
                    ...other
                } = effect;
                const effectComponents = [];

                if (thorns > 0) {
                    effectComponents.push(
                        <span>
                            Gain <Icon icon={<CactusIcon />} size={"sm"} /> {stacks > 1 ? `x${stacks}` : undefined}
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
                            {effectComponents.length > 0 ? ", " : "Gain"} <Icon icon={<HeartIcon />} text={lifeOnHit} size={"sm"} /> per hit{" "}
                        </span>
                    );
                }

                if (resourcesPerTurn > 0) {
                    effectComponents.push(
                        <>
                            {effectComponents.length > 0 ? ", " : "Gain"}{" "}
                            <ResourceIcon size={"sm"} text={`+${resourcesPerTurn}`} playerClass={player?.class} />{" "}
                            {turnsTriggerFrequency ? `every ${turnsTriggerFrequency} turns` : "per turn"}
                        </>
                    );
                }

                if (skillBonus.length > 0) {
                    effectComponents.push(
                        <>
                            {...skillBonus.map(({ skill, damage = 0, comparator }) => (
                                <div key={skill}>
                                    {comparator === "includes" ? `Cards with '${skill}' in their name gain` : skill}{" "}
                                    {damage > 0 && <Icon icon={<CrossedSwordsIcon />} size={"sm"} text={`+${damage}`} />}
                                </div>
                            ))}
                        </>
                    );
                }

                if (drawCardsPerTurn) {
                    effectComponents.push(<>+{drawCardsPerTurn} extra card draw</>);
                }

                if (attackAreaIncrease > 0) {
                    effectComponents.push(<>+{attackAreaIncrease} area </>);
                }

                if (effect.type !== EFFECT_TYPES.STEALTH) {
                    // Stealth need not be explained here
                    effectComponents.push(<EffectEventDisplay {...other} playerClass={player?.class} />);
                }

                if (duration === 0) {
                    effectComponents.push(<> this turn</>);
                } else if (duration && duration !== Infinity) {
                    effectComponents.push(<Icon icon={<HourglassIcon />} size={"sm"} text={duration} />);
                }

                return <span key={i}>{effectComponents.map((component, j) => cloneElement(component, { key: j }))}</span>;
            })}
        </>
    );
};

export default Buffs;
