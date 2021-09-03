import { Ability, Effect } from './../types';

export const getAllEffects = (ability: Ability): Effect[] => {
    return ability.actions
        ?.reduce((acc, { effects = [] }) => {
            acc.push(...effects);
            return acc;
        }, [])
        .concat(ability.minion?.effects || []);
};
