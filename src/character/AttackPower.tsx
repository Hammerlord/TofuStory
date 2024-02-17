import classNames from "classnames";
import { createUseStyles } from "react-jss";
import { ACTION_TYPES, Action, Effect, TARGET_TYPES } from "../ability/types";
import { calculateAttackPowerDamage, getEnabledEffects, isTurnActionPrevented } from "../battle/utils";
import Icon from "../icon/Icon";
import { CrossedSwordsIcon } from "../images/icons";
import Tooltip from "../view/Tooltip";
import { Combatant } from "./types";
import { ATTACK_POWER_COEFF } from "../battle/constants";
import { CombatantInfo } from "../battle/types";
import { getUseAbilityIndex } from "../battle/actions/enemyTurn";

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

    const { abilities = [], HP, effects = [], casting } = combatant || {};

    if (!HP) {
        return null;
    }

    const overrideDamage = effects.find(({ override }) => override?.damage)?.override?.damage;
    const abilityToUse = casting?.ability || abilities[getUseAbilityIndex(combatantInfo)];

    const { damage, timesToAttack } = abilityToUse?.actions.reduce(
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
        { damage: 0, timesToAttack: 0 }
    ) || { damage: 0, timesToAttack: 0 };

    const attackPowerEffects: Effect[] = getEnabledEffects({ combatantInfo }).filter(({ attackPower = 0, excludeEffectOwner }) => {
        return !excludeEffectOwner && attackPower !== 0;
    });
    const totalAttackPower: number = attackPowerEffects.reduce((acc: number, { attackPower }) => {
        return acc + attackPower;
    }, 0);

    const totalDamage = (() => {
        const total = calculateAttackPowerDamage({ totalAttackPower, damage: overrideDamage || damage });
        if (total < 0) {
            return 0;
        }
        return total;
    })();

    const hasYetToCastAbility = !casting && abilityToUse?.castTime;
    const isMinionNotAttacking = !combatant.isPlayer && !timesToAttack;
    if (!totalDamage || hasYetToCastAbility || isTurnActionPrevented(combatant) || isMinionNotAttacking) {
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
                        [classes.negative]: totalAttackPower < 0 || (!isNaN(overrideDamage) && overrideDamage < damage),
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
