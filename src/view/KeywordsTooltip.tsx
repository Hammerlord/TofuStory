import classNames from "classnames";
import { ReactElement, useMemo } from "react";
import { createUseStyles } from "react-jss";
import {
    armorUp,
    attackDown,
    attackPower,
    avenger,
    bleed,
    burn,
    chill,
    freeze,
    immunity,
    bideEffect,
    poison,
    preventArmorDecay,
    silence,
    stealth,
    stun,
    taunt,
    thorns,
    ward,
    defDown,
    defUp,
} from "../ability/Effects";
import { armorDown, doom, incorporeal } from "../enemy/effect";
import Icon from "../icon/Icon";
import { AshesImage, CriticalShotImage, NamelessSwordImage, TargetLockImage } from "../images";
import Handlebars from "handlebars";
import { getIconInterpolationMap } from "../ability/descriptionInterpolation";
import { useAppSelector } from "../hooks";

const keywords: { name: string; icon?: any; description?: string; keys?: string[] }[] = [
    bideEffect,
    {
        ...ward,
        keys: ['"Ward"'], // Bandaid for Ward Booster showing Ward in its tooltip
    },
    {
        name: "Pre-emptive",
        description:
            "Start the battle with this card in hand. Drawing a Pre-emptive card does not count toward your total card draw amount for the turn.",
        keys: ["preemptive"],
    },
    {
        name: "Ephemeral",
        description: "Ability disappears after use or discard.",
        keys: ["removeAfterTurn", "Ephemeral"],
    },
    {
        name: "Radiate",
        description: "Character emits an effect from its position. Radiated damage is unaffected by attack modifiers.",
    },
    {
        name: "Deplete",
        icon: AshesImage,
        description: "After use, ability will be removed for the rest of the battle.",
    },
    {
        name: "Retain",
        description: "Ability does not get discarded at the end of your turn.",
    },
    {
        name: "Tribute",
        description: "Replacing an existing summon with another one grants the new summon +1 HP and ATT.",
        keys: ["Tribute"],
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
        keys: ["+ATT", "ATT Up", "+1 ATT", "attUp"],
    },
    {
        ...attackDown,
        description: Handlebars.compile(attackDown.description || "")(attackDown),
        keys: ["ATT Down", "attDown"],
    },
    preventArmorDecay,
    {
        ...armorUp,
        keys: ["armorUp", "Armor Up"],
    },
    {
        ...armorDown,
        keys: ["armorDown", "Armor Down"],
    },
    {
        ...defUp,
    },
    {
        ...defDown,
    },
    taunt,
    {
        name: "Counter",
        icon: NamelessSwordImage,
        description: "When attacked, retaliate.",
    },
    thorns,
    incorporeal,
    {
        ...stun,
        keys: ['"Stun"'], // Bandaid for Crow showing Stun in its tooltip
    },
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
    {
        ...stealth,
        keys: ['"Stealth"'],
    },
    {
        ...freeze,
        keys: ['"Freeze"'],
    },
    {
        ...immunity,
        keys: ['"Immunity"'],
    },
    {
        ...silence,
        keys: ["Disables certain buffs."],
    },
    {
        ...avenger,
        keys: ['"Avenger"'],
    },
    {
        name: "Critical",
        icon: CriticalShotImage,
        description: "When drawn, the card has a chance to activate a bonus, based on your Critical chance.",
        keys: ["Critical"],
    },
    {
        name: "Aim",
        icon: TargetLockImage,
        description: "When you first gain Aim, Aimed Shot is added to the bottom of your deck. Aim stacks empower your Aimed Shot damage.",
        keys: ["Aimed Shot"],
    },
    {
        name: "Pierce",
        description: "Bypasses Stealth and Immune.",
    },
    {
        ...doom,
        description: "After 2 turns, activates at the start of the afflicted target's turn, dealing 30 damage.",
        keys: ['"Doom"'],
    },
    {
        name: "Search",
        description: "Choose 1 of 3 options randomly presented from your deck/discard.",
        keys: ["search-deck"],
    },
    {
        name: "Echo",
        description: "Adds an Ephemeral copy of the card to your hand.",
        keys: ["Echo"],
    },
    {
        name: "Inert",
        description: "Character does NOT automatically attack at the end of your turn.",
        keys: ["Inert"],
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
    title?: string | ReactElement;
    description?: string | ReactElement | ReactElement[];
}) => {
    const playerClass = useAppSelector((state) => state.character?.player?.class);
    const classes = useSectionStyles();
    const elementMapping = getIconInterpolationMap({ playerClass });
    const interpolatedDescription = Handlebars.compile(description || "")(elementMapping);

    return (
        <div className={classes.section}>
            {icon && (
                <div className={classNames(classes.iconContainer)}>
                    <Icon icon={icon} size={"lg"} />
                </div>
            )}
            <div>
                <div className={classes.tooltipTitle}>{title}</div>
                <div dangerouslySetInnerHTML={{ __html: interpolatedDescription }} />
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
            {tooltipConfigs.map((config, i) => (
                <TooltipSection icon={config.icon} title={config.name} description={config.description} key={`${config.name}-${i}`} />
            ))}
        </div>
    );
};
