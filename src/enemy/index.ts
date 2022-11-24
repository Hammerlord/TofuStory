import { snailFriend } from "./enemy";
import { mutantRibbonPig } from "./strangePig";
import { kingSlimeEnemy, slimeGlobule } from "./kingSlime";
import { boarStanceAbility } from "./dancesWithBalrog";

// Look up an enemy object based on its name. Assumes that enemy names are equivalent to an ID.
// Currently used to address circular references.
export const enemyNameMap = {
    [kingSlimeEnemy.name]: kingSlimeEnemy,
    [slimeGlobule.name]: slimeGlobule,
    [mutantRibbonPig.name]: mutantRibbonPig,
    [snailFriend.name]: snailFriend,
};

export const abilityNameMap = {
    [boarStanceAbility.name]: boarStanceAbility,
};
