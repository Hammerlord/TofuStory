import classNames from "classnames";
import { createUseStyles } from "react-jss";
import { ACTION_TYPES, Action, Effect } from "../ability/types";
import { DAMAGE_COEFF } from "../battle/constants";
import { CombatantInfo } from "../battle/types";
import {
    calculateDamageModifierCoeff,
    getEnabledEffects,
    getMultiplier,
    getSkillBonusDamage,
    isTurnActionPrevented,
} from "../battle/utils";
import Icon from "../icon/Icon";
import { CrossedSwordsIcon } from "../images/icons";
import Tooltip from "../view/Tooltip";
import { getNextTelegraphedAbility } from "./Telegraph";
import { useAppSelector } from "../hooks";
import { BattleState } from "../battle/reducer";

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

const AttackPower = ({ combatantInfo, isEnemy }: { combatantInfo: CombatantInfo; isEnemy: boolean }) => {
    const classes = useStyles();
    const { combatant } = combatantInfo || {};

    const { HP, effects = [], casting, targeting, cantMove } = combatant || {};
    const selectedAlly: string | null = useAppSelector((state) => (state.battle as BattleState).selectedAllyId);
    const selectedAbility: string | null = useAppSelector((state) => (state.battle as BattleState).selectedHandAbilityId);

    if (!HP || cantMove) {
        return null;
    }

    const overrideDamage = effects.find(({ override }) => override?.damage)?.override?.damage;
    let abilityToUse;
    if (isEnemy) {
        abilityToUse = casting?.ability || targeting?.ability;
    } else if (!combatantInfo?.combatant.isPlayer) {
        // This is for friendly minions only. Player characters can technically have an auto attack ability but it seems confusing since the cards
        // in your hand do varying larger amounts of damage
        abilityToUse = combatant?.abilities?.[0];
    }

    const defaultActionStats = { damage: 0, timesToAttack: 0 };
    const { damage, timesToAttack } =
        abilityToUse?.actions.reduce((acc, action: Action) => {
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
        }, defaultActionStats) || defaultActionStats;

    const attackPowerEffects: Effect[] = getEnabledEffects({ combatantInfo }).filter(
        ({ attackPower = 0, excludeEffectOwner, skillBonus }) => {
            return !excludeEffectOwner && (attackPower !== 0 || skillBonus);
        }
    );
    const totalAttackPower: number = attackPowerEffects.reduce(
        (acc: number, { attackPower = 0, skillBonus, multiplier: multiplierConfig, stacks }) => {
            const skillBonusDamage = getSkillBonusDamage({ ability: abilityToUse, skillBonus }) || 0;
            // Hand, deck and discard are NOT implemented in the actual damage calculation. Fix that before changing the display.
            const multiplier = getMultiplier({ actor: combatantInfo, multiplier: multiplierConfig, hand: [], deck: [], discard: [] });
            // TODO Is there a reason skillBonusDamage isn't affected by multiplier?
            return acc + (attackPower * multiplier + skillBonusDamage) * (stacks || 1);
        },
        0
    );

    const totalDamage = (() => {
        const total = calculateDamageModifierCoeff({ totalDamageMod: totalAttackPower, damage: overrideDamage || damage });
        if (total < 0) {
            return 0;
        }
        return total;
    })();

    const hasYetToCastAbility = !casting && abilityToUse?.castTime;
    const isMinionNotAttacking = !combatant.isPlayer && !timesToAttack;
    if (!totalDamage || hasYetToCastAbility || isTurnActionPrevented(combatantInfo) || isMinionNotAttacking) {
        return null;
    }

    const inner = (
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
    );

    if (selectedAbility || selectedAlly) {
        return inner;
    }

    const tooltip = (
        <div>
            {!combatant.isPlayer && "Estimated attack damage."}
            {combatant.isPlayer && `Each +ATT increases attack damage by ${DAMAGE_COEFF}%.`}
            {attackPowerEffects.length > 0 && (
                <>
                    <hr />
                    <div>Modifiers:</div>
                </>
            )}
            {Object.entries(
                attackPowerEffects.reduce((acc, { icon, name, attackPower = 0, skillBonus }) => {
                    if (!acc[name]) {
                        acc[name] = {
                            icon,
                            attackPower: 0,
                        };
                    }

                    const skillBonusDamage = getSkillBonusDamage({ ability: abilityToUse, skillBonus }) || 0;

                    acc[name] = {
                        ...acc[name],
                        attackPower: acc[name].attackPower + attackPower + skillBonusDamage,
                    };

                    return acc;
                }, {})
            ).map(([name, value]) => {
                const { icon, attackPower: damage } = value as any;

                return (
                    <div key={name}>
                        <Icon icon={icon} className={classes.icon} size="sm" /> {name} {damage < 0 ? "-" : "+"}
                        {damage}
                    </div>
                );
            })}
        </div>
    );

    return <Tooltip title={tooltip}>{inner}</Tooltip>;
};

export default AttackPower;
