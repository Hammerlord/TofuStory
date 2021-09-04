import { EFFECT_TYPES, ACTION_TYPES, Effect } from "./../ability/types";
import { Combatant } from "./../character/types";
import { applyActionToTarget } from "./parseAbilityActions";

const BLEED_DAMAGE = 1;
const BURN_DAMAGE = 2;

const triggerDebuffDamage = (characters) => {
    let totalBleedDamage = 0;
    let totalBurnDamage = 0;

    const bleedsTriggered = characters.map((character: Combatant, i: number): Combatant => {
        if (!character) {
            return character;
        }
        const bleedDamage: number = character.effects.reduce((acc: number, effect: Effect) => {
            if (effect.type === EFFECT_TYPES.BLEED) {
                acc += BLEED_DAMAGE;
            }
            return acc;
        }, 0);

        if (bleedDamage) {
            totalBleedDamage += bleedDamage;
            return applyActionToTarget({
                target: character,
                targetIndex: i,
                action: {
                    damage: bleedDamage,
                    type: ACTION_TYPES.BLEED,
                },
            });
        }
        return character;
    });

    const burnsTriggered = (bleedsTriggered || characters).map((character: Combatant, i: number): Combatant => {
        if (!character) {
            return character;
        }
        const burnDamage: number = character.effects.reduce((acc: number, effect: Effect) => {
            if (effect.type === EFFECT_TYPES.BURN) {
                acc += BURN_DAMAGE;
            }
            return acc;
        }, 0);

        if (burnDamage) {
            totalBurnDamage += burnDamage;
            return applyActionToTarget({
                target: character,
                targetIndex: i,
                action: {
                    damage: burnDamage,
                    type: ACTION_TYPES.BURN,
                },
            });
        }
        return character;
    });

    const ret = [];
    if (totalBleedDamage > 0) {
        ret.push(bleedsTriggered);
    }

    if (totalBurnDamage > 0) {
        ret.push(burnsTriggered);
    }

    return ret;
};

export default triggerDebuffDamage;
