import React, { cloneElement } from "react";
import Icon from "../../icon/Icon";
import { Cactus, Cloudy, Heart, Hourglass, Shield } from "../../images";
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
                    duration = Infinity,
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
                if (healTargetPerTurn > 0) {
                    effectComponents.push(
                        <span>
                            Heals an injured ally for <Icon icon={<Heart />} text={healTargetPerTurn} /> per turn
                        </span>
                    );
                }

                if (effectComponents.length > 0) {
                    effectComponents.push(
                        duration === 0 ? <>this turn</> : <Icon icon={<Hourglass />} text={duration === Infinity ? "" : duration} />
                    );
                }

                return <span key={i}>{effectComponents.map((component, j) => cloneElement(component, { key: j }))}</span>;
            })}
        </>
    );
};

export default Buffs;
