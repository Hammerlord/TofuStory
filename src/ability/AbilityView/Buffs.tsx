import React, { cloneElement } from "react";
import Icon from "../../icon/Icon";
import { Cactus, Cloudy, CrossedSwords, Heart, Hourglass, Shield, upmattImage } from "../../images";
import { Fury } from "../../resource/ResourcesView";
import { Effect, EFFECT_CLASSES, EFFECT_TYPES } from "../types";
import { getAllEffects } from "./utils";

const Buffs = ({ ability }) => {
    const buffs = getAllEffects(ability).filter((effect: Effect) => effect.class === EFFECT_CLASSES.BUFF);

    return (
        <>
            {buffs.map((effect, i) => {
                const {
                    healthPerResourcesSpent = 0,
                    thorns = 0,
                    armorReceived = 0,
                    resourcesPerTurn = 0,
                    healTargetPerTurn = 0,
                    damage = 0,
                    duration = Infinity,
                    onAttack = {},
                    preventArmorDecay,
                    leech = 0,
                    healingPerTurn = 0,
                    skillBonus = [],
                } = effect;
                const effectComponents = [];
                if (healthPerResourcesSpent > 0) {
                    effectComponents.push(
                        <span>
                            Gain <Icon icon={<Heart />} text={`+${healthPerResourcesSpent}`} /> per <Fury /> spent{" "}
                        </span>
                    );
                }

                if (thorns > 0) {
                    effectComponents.push(
                        <span>
                            Gain <Icon icon={<Cactus />} />
                        </span>
                    );
                }

                if (armorReceived > 0) {
                    effectComponents.push(
                        <span>
                            Gain <Icon icon={<Shield />} text={armorReceived < 0 ? `-${armorReceived}` : `+${armorReceived}`} /> from armor
                            sources{" "}
                        </span>
                    );
                }
                if (resourcesPerTurn > 0) {
                    effectComponents.push(
                        <span>
                            Gain <Fury text={`+${resourcesPerTurn}`} /> per turn
                        </span>
                    );
                }
                if (effect.type === EFFECT_TYPES.STEALTH) {
                    effectComponents.push(
                        <span>
                            <Icon icon={<Cloudy />} /> Stealth
                        </span>
                    );
                }
                if (effect.type === EFFECT_TYPES.IMMUNITY) {
                    effectComponents.push(
                        <span>
                            <Icon icon={upmattImage} /> Immunity
                        </span>
                    );
                }
                if (healTargetPerTurn > 0) {
                    effectComponents.push(
                        <span>
                            Heals an injured ally for <Icon icon={<Heart />} text={healTargetPerTurn} /> per turn
                        </span>
                    );
                }

                if (damage > 0) {
                    effectComponents.push(
                        <span>
                            Gain <Icon icon={<CrossedSwords />} text={`+${damage}`} />
                        </span>
                    );
                }

                if (preventArmorDecay) {
                    if (effectComponents.length > 0) {
                        effectComponents.push(<span>and prevents armor decay</span>);
                    } else {
                        effectComponents.push(<span>Prevents armor decay</span>);
                    }
                }

                if (leech > 0) {
                    if (effectComponents.length > 0) {
                        effectComponents.push(<span>and leech {leech * 100}% damage as HP</span>);
                    } else {
                        effectComponents.push(<span>Leech {leech * 100}% damage as HP</span>);
                    }
                }

                if (healingPerTurn > 0) {
                    effectComponents.push(
                        <span>
                            Heal for <Icon icon={<Heart />} text={healingPerTurn} /> per turn
                        </span>
                    );
                }

                if (effectComponents.length > 0) {
                    if (onAttack.removeEffect) {
                        effectComponents.push(<>for your next attack</>);
                    } else {
                        effectComponents.push(
                            duration === 0 ? <>this turn</> : <Icon icon={<Hourglass />} text={duration === Infinity ? "" : duration} />
                        );
                    }
                }

                if (skillBonus.length > 0) {
                    effectComponents.push(
                        <>
                            Increase{" "}
                            {...skillBonus.map(({ skill, damage = 0 }) => (
                                <span key={skill}>
                                    {skill} {damage > 0 && <Icon icon={<CrossedSwords />} text={`+${damage}`} />}
                                </span>
                            ))}
                        </>
                    );
                }

                return <span key={i}>{effectComponents.map((component, j) => cloneElement(component, { key: j }))}</span>;
            })}
        </>
    );
};

export default Buffs;
