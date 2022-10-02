import { kingSlimeEnemy, slimeGlobule } from "./kingSlime";

// Look up an enemy object based on its name. Assumes that enemy names are equivalent to an ID.
// Currently used to address circular references.
export const enemyNameMap = {
    [kingSlimeEnemy.name]: kingSlimeEnemy,
    [slimeGlobule.name]: slimeGlobule,
};
