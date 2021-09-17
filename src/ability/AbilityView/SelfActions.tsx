import Icon from "../../icon/Icon";
import { CrossedSwords, Heart, Shield } from "../../images";
import { Fury } from "../../resource/ResourcesView";
import { Ability, Action, TARGET_TYPES } from "../types";

const SelfActions = ({ ability }: { ability: Ability }) => {
    const { healing, armor, damage, resourceGain } = ability.actions
        .filter(({ target }) => target === TARGET_TYPES.SELF || target === TARGET_TYPES.FRIENDLY)
        .reduce((acc: any, current: Action) => {
            const { healing = 0, damage = 0, armor = 0, resources = 0 } = current;
            return {
                healing: (acc.healing || 0) + healing,
                armor: (acc.armor || 0) + armor,
                damage: (acc.damage || 0) + damage,
                resourceGain: (acc.resourceGain || 0) + resources,
            };
        }, {}) as any;

    return (
        <>
            {healing > 0 && (
                <div>
                    Heal for <Icon icon={<Heart />} text={healing} />
                </div>
            )}
            {(armor > 0 || resourceGain > 0) && (
                <div>
                    Gain {armor > 0 && <Icon icon={<Shield />} text={armor} />}
                    {resourceGain > 0 && <Fury text={resourceGain} />}
                </div>
            )}
            {damage > 0 && (
                <div>
                    Self-inflict <Icon icon={<CrossedSwords />} text={damage} />
                </div>
            )}
            {ability.reusable && <div>Returns to your hand after use</div>}
        </>
    );
};

export default SelfActions;
