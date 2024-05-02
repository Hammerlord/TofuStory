import classNames from "classnames";
import { useMemo } from "react";
import { createUseStyles } from "react-jss";
import {
    armorUp,
    attackDown,
    attackPower,
    bleed,
    burn,
    chill,
    freeze,
    immunity,
    infuriateEffect,
    poison,
    preventArmorDecay,
    silence,
    stealth,
    stun,
    taunt,
    thorns,
    ward,
} from "../ability/Effects";
import { armorDown, incorporeal } from "../enemy/effect";
import Icon from "../icon/Icon";
import { NamelessSwordImage } from "../images";
import { chargingStone } from "../item/starterItems";
import Handlebars from "handlebars";

const keywords: { name: string; icon?: any; description?: string; keys?: string[] }[] = [
    infuriateEffect,
    {
        ...ward,
        keys: ['"Ward"'], // Bandaid for Ward Booster showing Ward in its tooltip
    },
    {
        name: "Pre-emptive",
        description: "Start battle with this ability in hand.",
        keys: ["preemptive"],
    },
    {
        name: "Ephemeral",
        description: "Ability disappears at the end of your turn.",
        keys: ["removeAfterTurn", "Ephemeral"],
    },
    {
        name: "Radiate",
        description: "Character emits an effect from its position. Radiated damage is unaffected by attack modifiers.",
    },
    {
        name: "Deplete",
        description: "Ability can only be used once per battle.",
    },
    {
        name: "Tribute",
        description: "Replacing an existing summon with another one grants the new summon +1 HP and ATT.",
        keys: ["Tribute"],
    },
    {
        name: "Auto",
        description: "Summon can't be controlled to attack directly. Its ability is triggered another way.",
    },
    {
        name: "Reusable",
        description: "Ability stays in your hand when used.",
    },
    {
        name: "Discover",
        description: "Pick 1 of 3 card options.",
    },
    {
        ...attackPower,
        keys: ["+ATT", "ATT Up", "+1 ATT"],
    },
    {
        ...attackDown,
        description: Handlebars.compile(attackDown.description || "")(attackDown),
        keys: ["ATT Down"],
    },
    preventArmorDecay,
    armorUp,
    armorDown,
    taunt,
    {
        name: "Counter",
        icon: NamelessSwordImage,
        description: "When attacked, retaliate.",
    },
    thorns,
    incorporeal,
    stun,
    {
        ...chill,
        description: Handlebars.compile(chill.description || "")(chill),
    },
    {
        ...burn,
        keys: ['"Burn"'], // Bandaid for Soul Blade showing Burn in its tooltip
    },
    bleed,
    poison,
    stealth,
    freeze,
    {
        ...immunity,
        keys: ["Immunity"],
    },
    {
        ...silence,
        keys: ["Disables certain buffs."],
    },
];

const useSectionStyles = createUseStyles({
    section: {
        display: "flex",
        fontSize: "1rem",
        fontFamily: "Barlow",
        fontWeight: "500",
        lineHeight: "24px",
        background: "rgba(25, 25, 25, 0.9)",
        marginBottom: 8,
        borderRadius: "8px",
        padding: "16px",
    },
    tooltipTitle: {
        fontSize: "1.1rem",
        marginBottom: "4px",
    },
    iconContainer: {
        marginRight: "16px",
    },
});

export const TooltipSection = ({
    icon,
    title,
    description,
}: {
    icon?: any;
    title?: string | JSX.Element;
    description?: string | JSX.Element | JSX.Element[];
}) => {
    const classes = useSectionStyles();
    return (
        <div className={classes.section}>
            {icon && (
                <div className={classNames(classes.iconContainer)}>
                    <Icon icon={icon} size={"lg"} />
                </div>
            )}
            <div>
                <div className={classes.tooltipTitle}>{title}</div>
                {description}
            </div>
        </div>
    );
};

export const KeywordsTooltips = ({ object }) => {
    const tooltipConfigs = useMemo(() => {
        const stringified = JSON.stringify(object);
        return keywords.filter(({ name = "", keys }) => {
            if (keys) {
                return keys.some((key) => stringified.includes(key));
            }
            return stringified.toLowerCase().includes(name.toLowerCase());
        });
    }, [object]);

    return (
        <div>
            {tooltipConfigs.map((config) => (
                <TooltipSection icon={config.icon} title={config.name} description={config.description} key={config.name} />
            ))}
        </div>
    );
};
