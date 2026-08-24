import Handlebars from "handlebars";
import { cloneDeep } from "lodash";
import { getMultiplier } from "../battle/getMultiplier";
import { CombatantInfo } from "../battle/types";
import { Combatant, Player } from "../character/types";
import {
    BloodEmojiImage,
    CrossedSwordsImage,
    FireEmojiImage,
    FuryImage,
    HeartImage,
    HourglassImage,
    LeafImage,
    ManaImage,
    NimbleJewelCImage,
    SealImage,
    ShieldImage,
    SnowflakeEmojiImage,
    StunImage,
} from "../images";

import armorDownSvg from "../images/icons/ArmorDown.svg?raw";
import armorUpSvg from "../images/icons/ArmorUp.svg?raw";
import attDownSvg from "../images/icons/AttDown.svg?raw";
import attUpSvg from "../images/icons/AttUp.svg?raw";
import cactusSvg from "../images/icons/Cactus.svg?raw";
import defDownSvg from "../images/icons/DefDown.svg?raw";
import defUpSvg from "../images/icons/DefUp.svg?raw";

import { PLAYER_CLASSES } from "../Menu/types";
import { BLUE, GREEN, RED } from "./AbilityView/constants";
import { Ability, CombatAbility } from "./types";

const iconStyles = {
    width: 16,
    height: 16,
    "vertical-align": "bottom",
};

const styleObjectToString = (object) => {
    return Object.entries(object).reduce((acc, entry) => {
        return acc + entry.join(":") + ";";
    }, "");
};

const cardTypeString = (color) => {
    const properties = {
        width: 7,
        height: 7,
        display: "inline-block",
        margin: "2px",
        transform: "rotate(45deg)",
        background: color,
    };

    const styleStr = styleObjectToString(properties);
    return `<span style="${styleStr}"></span>`;
};

const iconStyleStr = styleObjectToString(iconStyles);

const styleStrWithShadow = styleObjectToString({
    ...iconStyles,
    filter: "drop-shadow(0 0 1px black)",
});
const inlineSvg = (svg: string) =>
    svg.replace("<svg ", `<svg width="15" height="15" style="vertical-align: middle; ${styleStrWithShadow}" `);

const ICON_INTERPOLATIONS = {
    _offense_: cardTypeString(RED),
    _support_: cardTypeString(BLUE),
    _summon_: cardTypeString(GREEN),
    _damage_: `<img src="${CrossedSwordsImage}" alt="Damage" style="${styleStrWithShadow}"/>`,
    _healing_: `<img src="${HeartImage}" alt="HP" style="${iconStyleStr}"/>`,
    _armor_: `<img src="${ShieldImage}" alt="Armor" style="${styleStrWithShadow}"/>`,
    _duration_: `<img src="${HourglassImage}" alt="Turns" style="${styleStrWithShadow}"/>`,
    _burn_: `<img src="${FireEmojiImage}" alt="Burn" style="${styleStrWithShadow}"/>`,
    _chill_: `<img src="${SnowflakeEmojiImage}" alt="Chill" style="${styleStrWithShadow}"/>`,
    _bleed_: `<img src="${BloodEmojiImage}" alt="Bleed" style="${styleStrWithShadow}"/>`,
    _stun_: `<img src="${StunImage}" alt="Stun" style="${styleStrWithShadow}"/>`,
    _silence_: `<img src="${SealImage}" alt="Silence" style="${styleStrWithShadow}"/>`,
    _freeze_: `<img src="${NimbleJewelCImage}" alt="Freeze" style="${styleStrWithShadow}"/>`,
    _thorns_: inlineSvg(cactusSvg),
    _attDown_: inlineSvg(attDownSvg),
    _attUp_: inlineSvg(attUpSvg),
    _armorDown_: inlineSvg(armorDownSvg),
    _armorUp_: inlineSvg(armorUpSvg),
    _defDown_: inlineSvg(defDownSvg),
    _defUp_: inlineSvg(defUpSvg),
};

export const getIconInterpolationMap = ({ multiplier, combatant }: { multiplier?: number; combatant?: Combatant }) => {
    const manaStyleStr = styleObjectToString({ ...iconStyles, width: 12 });

    const playerClass = (combatant as Player)?.class;
    const resource =
        {
            [PLAYER_CLASSES.WARRIOR]: FuryImage,
            [PLAYER_CLASSES.MAGICIAN]: ManaImage,
            [PLAYER_CLASSES.BOWMAN]: LeafImage,
        }[playerClass] || FuryImage;

    const resourceStyle =
        {
            [PLAYER_CLASSES.MAGICIAN]: manaStyleStr,
        }[playerClass] || styleStrWithShadow;

    return {
        ...ICON_INTERPOLATIONS,
        _resource_: `<img src="${resource}" alt="Resource" style="${resourceStyle}"/>`,
        _multiplier_: multiplier,
    };
};

export const interpolateAbilityDescription = ({
    ability,
    playerInfo,
    deck,
    hand,
    discard,
}: {
    ability: CombatAbility;
    playerInfo: CombatantInfo;
    deck;
    hand;
    discard;
}) => {
    ability = cloneDeep(ability);
    // Some abilities apply an effect, where the "main" point of the ability is a proc from that effect, eg. Dust Devils.
    // Do a lookup to find the statistics that allow us to interpolate the description, in those cases.
    const traverseForNestedAbility = (obj: any): Ability | undefined => {
        if (Array.isArray(obj)) {
            for (const val of obj) {
                const result = traverseForNestedAbility(val);
                if (result) {
                    return result;
                }
            }
        }

        if (!obj || typeof obj !== "object") {
            return;
        }

        if (obj.ability) {
            return obj.ability;
        }

        for (const val of Object.values(obj)) {
            if (typeof val === "object") {
                const ability = traverseForNestedAbility(val);
                if (ability) {
                    return ability;
                }
            }
        }
    };

    // If displaying a percentage, show "25%" instead of "0.25x" for values 0 < n < 1.
    // !!! This action is destructive! Must clone deep beforehand !!!
    const traverseForNestedPercentages = (obj) => {
        if (!obj) {
            return;
        }

        for (const [key, val] of Object.entries(obj)) {
            if (typeof val === "object") {
                traverseForNestedPercentages(val);
            } else if (typeof val === "number") {
                if ((val > 0 && val < 1) || (val > -1 && val < 0)) {
                    obj[key] = Math.floor(val * 100) + "%";
                }
            } else if (Array.isArray(obj)) {
                for (const val of obj) {
                    traverseForNestedPercentages(val);
                }
            }
        }

        return obj;
    };

    const multiplierAction = ability.actions?.find((action) => action.multiplier);
    const multiplier = multiplierAction
        ? getMultiplier({ actor: playerInfo, multiplier: multiplierAction.multiplier, deck, hand, discard })
        : 0;

    const elementMapping = getIconInterpolationMap({ multiplier, combatant: playerInfo?.combatant });
    const nestedAbility = cloneDeep(traverseForNestedAbility(ability));

    return Handlebars.compile(ability.description || "")({
        ...traverseForNestedPercentages(cloneDeep(ability)),
        ...elementMapping,
        nestedAbility: traverseForNestedPercentages(nestedAbility),
    });
};
