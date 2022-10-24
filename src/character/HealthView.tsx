import Tooltip from "../view/Tooltip";
import Icon from "../icon/Icon";
import { createUseStyles } from "react-jss";
import classNames from "classnames";
import { CrossedSwordsIcon, HeartIcon } from "../images/icons";
import { getEnabledEffects, getMaxHP } from "../battle/utils";
import { Combatant } from "./types";
import { passesConditions } from "../battle/passesConditions";
import { TRIGGER_TARGET_TYPES } from "../ability/types";

const useStyles = createUseStyles({
    icon: {
        "&.injured .text": {
            color: "#ff9b94",
        },
    },
});

const Health = ({ combatant }: { combatant: Combatant }) => {
    const HP = combatant.HP;
    const maxHP = getMaxHP(combatant);
    const toOneDecimal = (num) => Math.round(num * 10) / 10;
    const classes = useStyles();
    const effects = getEnabledEffects(combatant);
    const damageModifiers = effects.filter((effect) => {
        return (
            effect.attackDamageReceived &&
            passesConditions({
                getCalculationTarget: (targetType) => (targetType === TRIGGER_TARGET_TYPES.EFFECT_OWNER ? combatant : undefined),
                proc: effect,
            })
        );
    });
    const damageModifierTotal = damageModifiers.reduce((acc, effect) => {
        return (acc += effect.attackDamageReceived);
    }, 0);

    const tooltipContents = (
        <div>
            {HP} / {maxHP} HP ({toOneDecimal(HP / maxHP) * 100}%)
            {damageModifierTotal !== 0 && (
                <>
                    <hr />
                    <div>
                        Receiving{" "}
                        <Icon
                            icon={CrossedSwordsIcon}
                            text={damageModifierTotal < 0 ? `-${damageModifierTotal}` : `+${damageModifierTotal}`}
                        />{" "}
                        from attacks. <br /> Modifiers:
                        {damageModifiers.map(({ name, attackDamageReceived, icon }, i) => (
                            <div key={i}>
                                <Icon icon={icon} /> {name} {attackDamageReceived < 0 ? "-" : "+"}
                                {attackDamageReceived}
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
