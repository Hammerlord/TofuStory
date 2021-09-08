import classNames from "classnames";
import { createUseStyles } from "react-jss";
import { passesConditions } from "../battle/passesConditions";
import { CrossedSwords } from "../images";
import Icon from "../icon/Icon";

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

    const damageFromEffects = combatant.effects?.reduce((acc: number, { damage = 0, conditions = [] }) => {
        const getCalculationTarget = (calculationTarget: "effectOwner" | "externalParty") => {
            if (calculationTarget === "effectOwner") {
                return combatant;
            }
        };
        if (passesConditions({ getCalculationTarget, conditions })) {
            return acc + damage;
        }

        return acc;
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

    return (
        <Icon
            icon={<CrossedSwords />}
            size={"lg"}
            text={totalDamage}
            className={classNames({
                [classes.bonus]: damageFromEffects > 0,
                [classes.negative]: damageFromEffects < 0,
            })}
        />
    );
};

export default AttackPower;
