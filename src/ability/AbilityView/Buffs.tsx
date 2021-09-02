import Icon from "../../icon/Icon";
import { Cactus, Heart, Hourglass, Shield } from "../../images";
import { Fury } from "../../resource/ResourcesView";

const Buffs = ({ ability }) => {
    const allEffects = ability.actions.reduce((acc, { effects = [] }) => {
        acc.push(...effects);
        return acc;
    }, []);
    const thornsDuration = allEffects.find(({ thorns = 0 }) => thorns > 0)?.duration || 0;
    const { healthPerResourcesSpent = 0, duration: healthPerResourcesSpentDuration = 0 } =
        allEffects.find(({ healthPerResourcesSpent = 0 }) => healthPerResourcesSpent > 0) || {};
    const { armorReceived, duration: armorReceivedDuration } = allEffects.find(({ armorReceived = 0 }) => armorReceived > 0) || {};
    const { resourcesPerTurn, duration: resourcesPerTurnDuration } =
        allEffects.find(({ resourcesPerTurn = 0 }) => resourcesPerTurn > 0) || {};

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
                    Gain <Icon icon={<Cactus />} /> for <Icon icon={<Hourglass />} text={thornsDuration} />
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
                    Gain <Fury text={`+${resourcesPerTurn}`} /> per turn for <Icon icon={<Hourglass />} text={resourcesPerTurnDuration} />
                </div>
            )}
        </>
    );
};

export default Buffs;
