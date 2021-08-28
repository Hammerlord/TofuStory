import { createCombatant } from "./../enemy/createEnemy";
import uuid from "uuid";
import { Aura, Effect } from "./../ability/types";
import { Action, TARGET_TYPES } from "../ability/types";
import { Combatant, CombatPlayer } from "../character/types";
import { cloneDeep } from "lodash";

/**
 * The results of an action being applied.
 */
export interface Event {
    action?: Action;
    updatedAllies: Combatant[];
    updatedEnemies: Combatant[];
    casterId?: string;
    targetIndex?: number;
    targetSide?: 'allies' | 'enemies';
}

export const applyActionToTarget = ({
    target,
    action,
}: {
    target: Combatant;
    action: Action;
}): Combatant => {
    const { damage = 0, healing = 0, armor = 0, effects = [], resources = 0 } = action;

    const updatedArmor = Math.max(0, target.armor - damage + armor);
    const healthDamage = Math.max(0, damage - target.armor);
    let HP = Math.max(0, target.HP - healthDamage);
    HP = HP > 0 ? Math.min(target.maxHP, HP + healing) : 0;
    const updatedEffects: Effect[] =
        HP === 0 ? [] : [...target.effects, ...(effects.map(cloneDeep) as Effect[])];
    return {
        ...target,
        HP,
        armor: updatedArmor,
        effects: updatedEffects,
        resources: (target.resources || 0) + resources,
    };
};

const calculateThornsDamage = (action: Action, hitTargets: Combatant[]): number => {
    if (!action.damage) {
        return 0;
    }

    return hitTargets.reduce((acc, { effects }) => {
        return acc + effects.reduce((acc, { thorns = 0 }) => acc + thorns, 0);
    }, 0);
};

export const parseAction = ({ enemies, allies, action, targetIndex, casterId, side }): Event => {
    const { area = 0, target: targetType, movement } = action;

    const { friendly, hostile, caster, casterSide } = getFriendlyOrHostile({
        enemies,
        allies,
        casterId,
    });
    const isInArea = (character, i) => {
        return character && i >= targetIndex - area && i <= targetIndex + area;
    };
    let targets = [];
    if (targetType === TARGET_TYPES.SELF) {
        targets = [caster];
    } else if (targetType === TARGET_TYPES.FRIENDLY) {
        targets = friendly.filter(isInArea);
    } else if (targetType === TARGET_TYPES.HOSTILE) {
        targets = hostile.filter(isInArea);
    }

    const updatedTargetsMap = targets
        .map((target) => applyActionToTarget({ target, action }))
        .reduce((acc, current) => {
            acc[current.id] = current;
            return acc;
        }, {});

    const thornsDamage = calculateThornsDamage(action, targets);
    if (thornsDamage > 0) {
        updatedTargetsMap[casterId] = applyActionToTarget({
            target: updatedTargetsMap[casterId] || caster,
            action: {
                damage: thornsDamage,
            },
        });
    }

    const getUpdatedCharacter = (character) => {
        return updatedTargetsMap[character?.id] || cloneDeep(character);
    };

    if (movement) {
        const index = friendly.findIndex((combatant) => combatant?.id === casterId);
        [friendly[index], friendly[targetIndex]] = [friendly[targetIndex], friendly[index]];
    }

    const [updatedAllies, updatedEnemies] =
        casterSide === "allies" ? [friendly, hostile] : [hostile, friendly];

    return {
        action,
        updatedAllies: renewPersistentAuras(updatedAllies.map(getUpdatedCharacter)),
        updatedEnemies: renewPersistentAuras(updatedEnemies.map(getUpdatedCharacter)),
        casterId,
        targetIndex,
        targetSide: side,
    };
};

const getFriendlyOrHostile = ({ casterId, enemies, allies }) => {
    const casterSide = allies.find((ally) => ally?.id === casterId) ? "allies" : "enemies";
    const [friendly, hostile] = casterSide === "allies" ? [allies, enemies] : [enemies, allies];
    return {
        friendly: friendly.slice(),
        hostile: hostile.slice(),
        caster: friendly.find((character) => character?.id === casterId),
        casterSide,
    };
};

export const applyAuraPerTurnEffects = (characters) => {
    const results: { characters: (Combatant | null)[]; action: Action; casterId }[] = [];

    for (let i = 0; i < characters.length; ++i) {
        const recentCharacters = results[results.length - 1]?.characters || characters;
        const { aura, id, HP = 0 } = recentCharacters[i] || {};
        if (!aura || HP <= 0) {
            continue;
        }

        const { armorPerTurn = 0, healingPerTurn = 0, area = 0 } = aura as Aura;
        if (armorPerTurn === 0 && healingPerTurn === 0) {
            continue;
        }

        const action = {
            armor: armorPerTurn,
            healing: healingPerTurn,
        };
        results.push({
            characters: recentCharacters.map((character, j) => {
                // Aura effects do not apply to the owner of the aura
                const isAffectedByAura = character?.HP > 0 && j >= i - area && j <= i + area && j !== i;
                if (isAffectedByAura) {
                    return applyActionToTarget({ target: character, action });
                }
                return cloneDeep(character);
            }),
            action,
            casterId: id,
        });
    }

    return results;
};

const renewPersistentAuras = (characters: (Combatant | null)[]) => {
    const updated = characters.map((character) => {
        if (!character) {
            return character;
        }

        return {
            ...cloneDeep(character),
            effects: character.effects.filter((effect) => !effect.isAuraEffect),
        };
    });

    updated.forEach((character: Combatant | null, i) => {
        const { aura, HP = 0 } = character || {};
        if (aura && HP > 0) {
            // Only a subset of aura properties are "persistent" effects -- apply or fade based on proximity to the
            // owner of the aura at any given moment
            const { area = 0, damage = 0, thorns = 0 } = aura;
            for (let j = i - area; j <= i + area; ++j) {
                // Aura effects do not apply to the owner of the aura
                if (i !== j && updated[j] && updated[j].HP > 0) {
                    updated[j].effects.push({
                        thorns,
                        damage,
                        isAuraEffect: true,
                    });
                }
            }
        }
    });
    return updated;
};

export const useAllyAbility = ({
    enemies,
    targetIndex,
    side,
    ability,
    allies,
    casterId,
}): Event[] => {
    const { minion, actions, resourceCost } = ability;
    const results = [];

    if (minion) {
        results.push({
            updatedEnemies: enemies.map(cloneDeep),
            updatedAllies: renewPersistentAuras(
                allies.map((ally: Combatant | null, i: number) => {
                    return i === targetIndex ? createCombatant(minion) : cloneDeep(ally);
                })
            ),
            casterId,
        });
    }

    // All actions should be based on the most recent version of enemies/allies
    const mostRecentEnemies = () => results[results.length - 1]?.updatedEnemies || enemies;
    const mostRecentAllies = () => results[results.length - 1]?.updatedAllies || allies;

    actions.forEach((action: Action) => {
        results.push(
            parseAction({
                enemies: mostRecentEnemies(),
                allies: mostRecentAllies(),
                targetIndex,
                action,
                casterId,
                side,
            })
        );
    });

    const caster = mostRecentAllies().find((ally) => ally?.id === casterId);

    const healthPerResourcesSpent = caster.effects.reduce(
        (acc, { healthPerResourcesSpent = 0 }) => {
            return acc + healthPerResourcesSpent;
        },
        0
    );

    if (healthPerResourcesSpent > 0) {
        const healing = healthPerResourcesSpent * resourceCost;
        if (healing > 0) {
            const newHP = Math.min(caster.maxHP || Infinity, caster.HP + healing);
            const updatedAllies = mostRecentAllies().map((character) => {
                if (character?.id === caster.id) {
                    return {
                        ...cloneDeep(caster),
                        HP: newHP,
                    };
                }

                return character;
            });
            results.push({
                updatedAllies,
                updatedEnemies: mostRecentEnemies().map(cloneDeep),
                casterId: null,
            });
        }
    }
    return results;
};

export const useAttack = ({ enemies, allies, index, casterId }): Event[] => {
    const caster = allies.find((ally) => ally?.id === casterId) || {};
    const { effects, damage = 0, id } = caster;
    const totalDamage = effects.reduce((acc: number, { damage = 0 }) => acc + damage, 0) + damage;
    return useAllyAbility({
        enemies,
        targetIndex: index,
        side: "enemies",
        ability: {
            actions: [
                {
                    damage: totalDamage,
                    target: TARGET_TYPES.HOSTILE,
                },
            ],
        },
        allies,
        casterId: id,
    });
};
