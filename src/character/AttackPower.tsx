import classNames from "classnames";
import { createUseStyles } from "react-jss";
import { ACTION_TYPES, Action, Effect } from "../ability/types";
import { calculateAttackPowerDamage, getEnabledEffects } from "../battle/utils";
import Icon from "../icon/Icon";
import { CrossedSwordsIcon } from "../images/icons";
import Tooltip from "../view/Tooltip";
import { Combatant } from "./types";
import { ATTACK_POWER_COEFF } from "../battle/constants";
import { CombatantInfo } from "../battle/types";

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

const AttackPower = ({ combatantInfo }: { combatantInfo: CombatantInfo }) => {
    const classes = useStyles();
    const { combatant } = combatantInfo || {};

    if (!combatant?.HP) {
        return null;
    }

    const overrideDamage = combatant?.effects?.find(({ override }) => override?.damage)?.override?.damage;
    const combatantDamage = overrideDamage || combatant?.damage || 0;
    const { damage, timesToAttack } = combatant?.casting?.ability?.actions.reduce(
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

    const attackPowerEffects: Effect[] = getEnabledEffects({ combatantInfo }).filter(({ attackPower = 0, excludeEffectOwner }) => {
        return !excludeEffectOwner && attackPower !== 0;
    });
    const totalAttackPower: number = attackPowerEffects.reduce((acc: number, { attackPower }) => {
        return acc + attackPower;
    }, 0);

    const totalDamage = (() => {
        const total = calculateAttackPowerDamage({ totalAttackPower, damage });
        if (total < 0) {
            return 0;
        }
        return total;
    })();

    if (!totalDamage) {
        return null;
    }

    const tooltip = (
        <div>
            {!combatant.isPlayer && "Estimates the damage of this character's next attack."}
            {combatant.isPlayer && `Each attack power adds 1 damage, +1 for every ${ATTACK_POWER_COEFF} damage dealt by a skill.`}
            {attackPowerEffects.length > 0 && (
                <>
                    <hr />
                    <div>Modifiers:</div>
                </>
            )}
            {Object.entries(
                attackPowerEffects.reduce((acc, { icon, name, attackPower }) => {
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
                    text={totalDamage || Math.max(0, totalAttackPower)}
                    className={classNames({
                        [classes.bonus]: totalAttackPower > 0,
                        [classes.negative]: totalAttackPower < 0 || overrideDamage < combatant.damage,
                        [classes.isCasting]: combatant.casting?.ability?.actions.some((action) =>
                            [ACTION_TYPES.ATTACK, ACTION_TYPES.RANGE_ATTACK].includes(action.type)
                        ),
                    })}
                />
                {timesToAttack > 1 && <span className={classes.timesToAttack}>{`x${timesToAttack}`}</span>}
            </span>
        </Tooltip>
    );
};

export default AttackPower;
