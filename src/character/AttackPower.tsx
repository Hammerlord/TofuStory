import classNames from "classnames";
import { createUseStyles } from "react-jss";
import { getEnabledEffects } from "../battle/utils";
import Icon from "../icon/Icon";
import { CrossedSwordsIcon } from "../images/icons";
import Tooltip from "../view/Tooltip";
import { Combatant } from "./types";
import { ACTION_TYPES, Action } from "../ability/types";

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
    isCasting: {
        "& .text": {
            color: "#00baff",
        },
    },
    timesToAttack: {
        fontWeight: "bold",
        position: "absolute",
        bottom: "-18px",
        right: "12px",
    },
    icon: {
        verticalAlign: "bottom",
    },
});

const AttackPower = ({ combatant }: { combatant: Combatant }) => {
    const classes = useStyles();
    const overrideDamage = combatant?.effects?.find(({ override }) => override?.damage)?.override?.damage;
    const combatantDamage = overrideDamage || combatant.damage || 0;
    const damageCount = combatant.casting?.ability?.actions.reduce(
        (acc, action: Action) => {
            const isAttack = [ACTION_TYPES.ATTACK, ACTION_TYPES.RANGE_ATTACK].includes(action.type);
            let timesToAttack = acc.timesToAttack;
            if (isAttack) {
                ++timesToAttack;
            }

            return {
                timesToAttack,
                // TODO just taking the last damage number in the actions array; but sometimes they will be different
                damage: (isAttack && action.damage) || acc.damage,
            };
        },
        { damage: combatantDamage, timesToAttack: 0 }
    ) || { damage: combatantDamage, timesToAttack: 1 };

    if (!combatant?.HP) {
        return null;
    }

    const damageEffects = getEnabledEffects({ combatant }).filter(({ attackPower: damage = 0 }) => {
        return damage !== 0;
    });
    const damageFromEffects = damageEffects.reduce((acc: number, { attackPower: damage }) => {
        return acc + damage;
    }, 0);

    const totalDamage = (() => {
        if (!damageCount.damage) {
            return null;
        }
        const total = damageFromEffects + damageCount.damage;
        if (total < 0) {
            return 0;
        }
        return total;
    })();

    if (!totalDamage && !damageFromEffects) {
        return null;
    }

    const tooltip = (
        <div>
            {!combatant.isPlayer && "Attack power. Estimates the damage dealt by this character's next attack, if it attacks."}
            {damageEffects.length > 0 && (
                <>
                    {!combatant.isPlayer && <hr />}
                    <div>Modifiers:</div>
                </>
            )}
            {Object.entries(
                damageEffects.reduce((acc, { icon, name, attackPower }) => {
                    if (!acc[name]) {
                        acc[name] = {
                            icon,
                            attackPower: 0,
                        };
                    }

                    acc[name] = {
                        ...acc[name],
                        attackPower: acc[name].attackPower + attackPower,
                    };

                    return acc;
                }, {})
            ).map(([name, value]) => {
                const { icon, attackPower: damage } = value as any;

                return (
                    <div key={name}>
                        <Icon icon={icon} className={classes.icon} /> {name} {damage < 0 ? "-" : "+"}
                        {damage}
                    </div>
                );
            })}
        </div>
    );

    return (
        <Tooltip title={tooltip}>
            <span>
                <Icon
                    icon={<CrossedSwordsIcon />}
                    size={"lg"}
                    text={totalDamage || Math.max(0, damageFromEffects)}
                    className={classNames({
                        [classes.bonus]: damageFromEffects > 0,
                        [classes.negative]: damageFromEffects < 0 || overrideDamage < combatant.damage,
                        [classes.isCasting]: combatant.casting?.ability?.actions.some((action) =>
                            [ACTION_TYPES.ATTACK, ACTION_TYPES.RANGE_ATTACK].includes(action.type)
                        ),
                    })}
                />
                {damageCount.timesToAttack > 1 && <span className={classes.timesToAttack}>{`x${damageCount.timesToAttack}`}</span>}
            </span>
        </Tooltip>
    );
};

export default AttackPower;
