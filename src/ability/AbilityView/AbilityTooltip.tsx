import Tooltip from "@material-ui/core/Tooltip";
import classNames from "classnames";
import Handlebars from "handlebars";
import { createUseStyles } from "react-jss";
import Icon from "../../icon/Icon";
import { GreyShieldImage, NamelessSwordImage } from "../../images";
import { CactusIcon } from "../../images/icons";
import { chargingStone, rageStone } from "../../item/starterItems";
import { immunity } from "../Effects";
import { fireSpirit } from "../magician/magicianAbilities";
import { Ability, ActionSummon, EFFECT_TYPES, Effect } from "../types";
import { soulBlade } from "../warrior/warriorAbilities";
import AbilityView from "./AbilityView";

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

const AbilityTooltipSection = ({
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

const useTooltipStyles = createUseStyles({
    tooltip: {
        "&&": {
            maxWidth: "400px",
            background: "none",
            minHeight: "200px",
        },
    },
    container: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
    },
    cards: {
        display: "flex",
        background: "rgba(25, 25, 25, 0.9)",
        borderRadius: "8px",
        padding: "16px",
        marginBottom: 8,
        "& > .card-container:not(:last-child)": {
            marginRight: 8,
        },
    },
});

const requiresExplanation = ({ type }): boolean => {
    return [
        EFFECT_TYPES.BLEED,
        EFFECT_TYPES.BURN,
        EFFECT_TYPES.CHILL,
        EFFECT_TYPES.FREEZE,
        EFFECT_TYPES.STEALTH,
        EFFECT_TYPES.STUN,
        EFFECT_TYPES.SILENCE,
    ].includes(type);
};

// For filling in the minion card descriptions in the minion preview tooltip because
// usually this is part of the minion's parent card, not a part of the minion object itself.
const minionCardLookup = {
    [soulBlade.name]: soulBlade,
    [fireSpirit.name]: fireSpirit,
};

const AbilityTooltip = ({ ability, children }: { ability: Ability; children: JSX.Element }) => {
    const cardsToAddMap = {};
    const findCardsToAdd = (obj) => {
        if (Array.isArray(obj)) {
            obj.forEach(findCardsToAdd);
        } else if (typeof obj === "object") {
            const { addCards = [], addCardsToDiscard = [], addCardsToDeck = [], selectCards = {}, summon, ...other } = obj;
            const cardsToDisplay = [...addCards, ...addCardsToDiscard, ...addCardsToDeck, ...(selectCards.cards || [])];

            if (summon) {
                const summonCards = summon.reduce((acc, config: ActionSummon) => {
                    const { minion: baseMinions = [] } = config;
                    baseMinions.forEach((minion) => {
                        const card = minionCardLookup[typeof minion === "string" ? minion : minion.name];
                        if (card) {
                            acc.push(card);
                        } else if (typeof minion === "object") {
                            // Display a "common card" version of the minion which is likely not as comprehensive as the card lookup
                            // But it's something.
                            acc.push({ name: minion.name, description: minion.description, minion, actions: [], overrideBodyText: true });
                        }
                    });

                    return acc;
                }, []);
                cardsToDisplay.push(...summonCards);
            }
            cardsToDisplay.forEach((card) => {
                const key = card.name + JSON.stringify(card.image);
                if (!cardsToAddMap[key]) {
                    cardsToAddMap[key] = card; // We only want to display it once
                    findCardsToAdd(card);
                }
            });

            // minion: undefined, do NOT look up minion abilities and treat them as 'cards'.
            Object.values({ ...other, minion: undefined }).forEach((child) => {
                findCardsToAdd(child);
            });
        }
    };

    findCardsToAdd(ability);
    const classes = useTooltipStyles();

    const getUniqueEffects = (ability: Ability): Effect[] => {
        const effects = [];

        const findEffects = (obj) => {
            if (!obj) {
                return;
            }
            if (obj.effects) {
                effects.push(...obj.effects);
            }

            if (Array.isArray(obj)) {
                obj.forEach(findEffects);
                return;
            }

            if (typeof obj === "object") {
                Object.values(obj).forEach((child) => {
                    findEffects(child);
                });
            }
        };

        findEffects(ability);

        const map = effects.reduce((acc, effect: Effect) => {
            return {
                ...acc,
                [effect.type]: effect,
            };
        }, {});

        return Object.values(map);
    };

    const effectsToDisplay = getUniqueEffects(ability).filter(requiresExplanation);
    const tooltips = effectsToDisplay.map((effect) => {
        return (
            <AbilityTooltipSection
                icon={effect.icon}
                title={effect.name}
                description={Handlebars.compile(effect.description || "")(effect)}
                key={effect.name}
            />
        );
    });

    const cardsToAdd = Object.values(cardsToAddMap);
    const stringified = JSON.stringify(ability).toLowerCase();
    const isReusable = cardsToAdd.some((ability: Ability) => ability.reusable) || ability.reusable;
    const tributeSummon = ability.minionOptions?.tributeSummon;

    if (cardsToAdd.length > 0) {
        tooltips.push(
            <div className={classes.cards} key={"cards"}>
                {cardsToAdd.map((card: Ability, i) => (
                    <div className={"card-container"} key={[card.name, i].join("-")}>
                        <AbilityView ability={card} />
                    </div>
                ))}
            </div>
        );
    }

    const isShowCharged = stringified.includes("charged");
    if (isShowCharged) {
        tooltips.push(
            <AbilityTooltipSection
                title="Charged Ability"
                icon={chargingStone.image}
                description={<>Consumes Charged for a bonus.</>}
                key={"charged"}
            />
        );
    }

    const infuriate = stringified.includes("infuriate");
    if (infuriate) {
        tooltips.push(
            <AbilityTooltipSection
                title="Infuriate"
                icon={rageStone.image}
                description={<>Gain 1 resource next turn.</>}
                key={"infuriate"}
            />
        );
    }

    const ward = stringified.includes("ward");
    if (ward) {
        tooltips.push(
            <AbilityTooltipSection
                title="Ward"
                icon={immunity.icon}
                description={<>A shield that wards off the next attack.</>}
                key={"ward"}
            />
        );
    }

    if (ability.preemptive) {
        tooltips.push(
            <AbilityTooltipSection title="Pre-Emptive" description={"Start battle with this ability in hand."} key={"preemptive"} />
        );
    }

    const ephemeral =
        cardsToAdd.some((ability: Ability) => ability.removeAfterTurn) || ability.removeAfterTurn || stringified.includes("ephemeral");
    if (ephemeral) {
        tooltips.push(
            <AbilityTooltipSection
                title="Ephemeral"
                description={"Ephemeral abilities disappear at the end of your turn."}
                key={"ephemeral"}
            />
        );
    }

    const deplete =
        cardsToAdd.some((ability: Ability) => ability.depletedOnUse) || ability.depletedOnUse || stringified.includes("deplete");
    if (deplete) {
        tooltips.push(<AbilityTooltipSection title="Deplete" description={"Ability can only be used once per battle."} key={"deplete"} />);
    }

    if (isReusable) {
        tooltips.push(<AbilityTooltipSection title="Reusable" description={"Ability is not discarded when used."} key={"reusable"} />);
    }

    const hasRadiate = ability.actions.some((action) => action.radiate) || stringified.includes("radiate");
    if (hasRadiate) {
        tooltips.push(
            <AbilityTooltipSection
                title="Radiate"
                description={"Character emits an effect from its position. Radiated damage is unaffected by attack modifiers."}
                key={"radiate"}
            />
        );
    }

    if (tributeSummon) {
        tooltips.push(
            <AbilityTooltipSection
                title="Tribute"
                description={"If a character is destroyed by playing this minion on top of it, this minion's cost is refunded."}
                key={"tribute"}
            />
        );
    }

    if (stringified.includes("taunt")) {
        tooltips.push(
            <AbilityTooltipSection title="Taunt" icon={GreyShieldImage} description={"Enemies must attack this target."} key={"taunt"} />
        );
    }

    if (stringified.includes("counter")) {
        tooltips.push(
            <AbilityTooltipSection title="Counter" icon={NamelessSwordImage} description={"When attacked, attack back."} key={"counter"} />
        );
    }

    if (stringified.includes("thorns")) {
        tooltips.push(
            <AbilityTooltipSection title="Thorns" icon={CactusIcon} description={"Deals 1 damage to attackers per stack."} key={"thorns"} />
        );
    }

    const discover = stringified.includes("discover");
    if (discover) {
        tooltips.push(<AbilityTooltipSection title="Discover" description={"Pick 1 of 3 card options."} key={"discover"} />);
    }

    return (
        <Tooltip title={tooltips} placement={"right-end"} classes={{ tooltip: classes.tooltip }} enterDelay={500}>
            {children}
        </Tooltip>
    );
};

export default AbilityTooltip;
