import classNames from "classnames";
import { createUseStyles } from "react-jss";
import { passesConditions } from "../battle/passesConditions";
import { CrossedSwords } from "../images";
import Icon from "../icon/Icon";
import { getEnabledEffects } from "../battle/utils";
import Tooltip from "../view/Tooltip";

const useStyles = createUseStyles({
    bonus: {
        "& .text": {
            color: "#42f57b",
        },
    },
    negative: {
        "& .text": {
            color: "#ff9b94",
        },
    },
});

const AttackPower = ({ combatant }) => {
    const classes = useStyles();
    if (!combatant?.HP || !combatant.damage) {
        return null;
    }

    const damageEffects = getEnabledEffects(combatant).filter(({ damage = 0, conditions = [] }) => {
        const getCalculationTarget = (calculationTarget: "effectOwner" | "externalParty") => {
            if (calculationTarget === "effectOwner") {
                return combatant;
            }
        };
        return damage !== 0 && passesConditions({ getCalculationTarget, conditions });
    });
    const damageFromEffects = damageEffects.reduce((acc: number, { damage }) => {
        return acc + damage;
    }, 0);

    const totalDamage = (() => {
        if (!combatant.damage) {
            return null;
        }
        const total = damageFromEffects + combatant.damage;
        if (total < 0) {
            return 0;
        }
        return total;
    })();

    const tooltip = (
        <div>
            The base attack power of this character.
            {damageEffects.length > 0 && (
                <>
                    <hr />
                    <div>Modifiers:</div>
                </>
            )}
            {damageEffects.map(({ icon, name: effectName, damage }, i) => (
                <div key={i}>
                    <Icon icon={icon} /> {effectName} {damage < 0 ? "-" : "+"}
                    {damage}
                </div>
            ))}
        </div>
    );

    return (
        <Tooltip title={tooltip}>
            <span>
                <Icon
                    icon={<CrossedSwords />}
                    size={"lg"}
                    text={totalDamage}
                    className={classNames({
                        [classes.bonus]: damageFromEffects > 0,
                        [classes.negative]: damageFromEffects < 0,
                    })}
                />
            </span>
        </Tooltip>
    );
};

export default AttackPower;
