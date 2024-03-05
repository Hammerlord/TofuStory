import { balsaDummy, mapleDummy } from "../scene/Perion/perionDummies";
import { boarStanceAbility } from "./dancesWithBalrog";
import { ironHog, snailFriend } from "./enemy";
import { kingSlimeEnemy, slimeGlobule } from "./kingSlime";
import { mutantRibbonPig } from "./strangePig";

// Look up an enemy object based on its name. Assumes that enemy names are equivalent to an ID.
// Currently used to address circular references.
export const enemyNameMap = {
    [kingSlimeEnemy.name]: kingSlimeEnemy,
    [slimeGlobule.name]: slimeGlobule,
    [mutantRibbonPig.name]: mutantRibbonPig,
    [snailFriend.name]: snailFriend,
    [balsaDummy.name]: balsaDummy,
    [mapleDummy.name]: mapleDummy,
    [ironHog.name]: ironHog,
};

export const abilityNameMap = {
    [boarStanceAbility.name]: boarStanceAbility,
};
