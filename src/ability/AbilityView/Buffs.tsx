import Icon from "../../icon/Icon";
import { Cactus, Cloudy, Heart, Hourglass, Shield } from "../../images";
import { Fury } from "../../resource/ResourcesView";
import { EFFECT_TYPES } from "../types";
import { getAllEffects } from "./utils";

const Buffs = ({ ability }) => {
    const allEffects = getAllEffects(ability);
    const thornsDuration = allEffects.find(({ thorns = 0 }) => thorns > 0)?.duration || 0;
    const { healthPerResourcesSpent = 0, duration: healthPerResourcesSpentDuration = 0 } =
        allEffects.find(({ healthPerResourcesSpent = 0 }) => healthPerResourcesSpent > 0) || {};
    const { armorReceived, duration: armorReceivedDuration } = allEffects.find(({ armorReceived = 0 }) => armorReceived > 0) || {};
    const { resourcesPerTurn, duration: resourcesPerTurnDuration } =
        allEffects.find(({ resourcesPerTurn = 0 }) => resourcesPerTurn > 0) || {};
    const stealthDuration = allEffects.find(({ type }) => type === EFFECT_TYPES.STEALTH)?.duration || 0;
    const { healTargetPerTurn = 0 } = allEffects.find(({ healTargetPerTurn }) => healTargetPerTurn > 0) || {};

    return (
        <>
            {healthPerResourcesSpent > 0 && (
                <div>
                    Gain <Icon icon={<Heart />} text={healthPerResourcesSpent} /> per <Fury /> spent{" "}
                    {healthPerResourcesSpentDuration === 0 && "this turn"}
                </div>
            )}
            {thornsDuration > 0 && (
                <div>
                    Gain <Icon icon={<Cactus />} /> <Icon icon={<Hourglass />} text={thornsDuration} />
                </div>
            )}
            {armorReceived > 0 && (
                <div>
                    <Icon icon={<Shield />} text={armorReceived < 0 ? `-${armorReceived}` : `+${armorReceived}`} /> from armor sources{" "}
                    {armorReceivedDuration === 0 ? "this turn" : <Icon icon={<Hourglass />} text={armorReceivedDuration} />}
                </div>
            )}
            {resourcesPerTurn > 0 && (
                <div>
                    Gain <Fury text={`+${resourcesPerTurn}`} /> per turn <Icon icon={<Hourglass />} text={resourcesPerTurnDuration} />
                </div>
            )}
            {stealthDuration > 0 && (
                <div>
                    <Icon icon={<Cloudy />} /> Stealth
                </div>
            )}
            {healTargetPerTurn > 0 && (
                <div>
                    Heals an injured ally for <Icon icon={<Heart />} text={healTargetPerTurn} /> per turn
                </div>
            )}
        </>
    );
};

export default Buffs;
