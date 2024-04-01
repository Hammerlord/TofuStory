import Tooltip from "../view/Tooltip";
import Icon from "../icon/Icon";
import { createUseStyles } from "react-jss";
import classNames from "classnames";
import { CrossedSwordsIcon, HeartIcon } from "../images/icons";
import { getEnabledEffects, getMaxHP } from "../battle/utils";
import { Combatant } from "./types";
import { passesConditions } from "../battle/passesConditions";
import { Effect, TRIGGER_TARGET_TYPES } from "../ability/types";
import { CombatantInfo } from "../battle/types";

const useStyles = createUseStyles({
    icon: {
        "&.injured .text": {
            color: "#ff9b94",
        },
    },
});

const Health = ({ combatantInfo }: { combatantInfo: CombatantInfo }) => {
    const { combatant } = combatantInfo || {};
    if (!combatant) {
        return null;
    }

    const HP = combatant?.HP;
    const maxHP = getMaxHP(combatant);
    const classes = useStyles();
    const effects = getEnabledEffects({ combatantInfo });
    const damageModifiers: Effect[] = effects.filter((effect) => {
        return (
            effect.attackDamageReceived &&
            passesConditions({
                getCalculationTarget: (targetType) => (targetType === TRIGGER_TARGET_TYPES.EFFECT_OWNER ? combatantInfo : undefined),
                proc: effect,
            })
        );
    });
    const damageModifierTotal = damageModifiers.reduce((acc, effect) => {
        return (acc += effect.attackDamageReceived * (effect.stacks || 1));
    }, 0);
    const modifierMap = damageModifiers.reduce((acc, effect) => {
        const { name, attackDamageReceived, stacks = 1 } = effect;
        if (!acc[name]) {
            acc[name] = {
                count: 0,
                effect,
            };
        }

        acc[name].count += attackDamageReceived * stacks;

        return acc;
    }, {});

    const tooltipContents = (
        <div>
            {HP} / {maxHP} HP
            {damageModifierTotal !== 0 && (
                <>
                    <hr />
                    <div>
                        Receiving
                        <Icon
                            icon={CrossedSwordsIcon}
                            size="sm"
                            text={damageModifierTotal < 0 ? `-${damageModifierTotal}` : `+${damageModifierTotal}`}
                        />{" "}
                        from attacks. <br /> Modifiers:
                        {/** @ts-ignore */}
                        {Object.values(modifierMap).map(({ count, effect }) => (
                            <div key={[effect.name].join("-")}>
                                <Icon icon={effect.icon} size="sm" /> {effect.name} {count < 0 ? "-" : "+"}
                                {count}
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
    return (
        <Tooltip title={tooltipContents}>
            <span>
                <Icon
                    icon={<HeartIcon />}
                    size={"lg"}
                    text={HP}
                    className={classNames(classes.icon, {
                        injured: HP < maxHP,
                    })}
                />
            </span>
        </Tooltip>
    );
};

export default Health;
