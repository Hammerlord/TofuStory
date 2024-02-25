import Tooltip from "@material-ui/core/Tooltip";
import classNames from "classnames";
import { createUseStyles } from "react-jss";
import Icon from "../../icon/Icon";
import { Ability, Effect, EFFECT_TYPES } from "../types";
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

const AbilityTooltip = ({ ability, children }: { ability: Ability; children: JSX.Element }) => {
    const cardsToAddMap = {};
    const findCardsToAdd = (ability: Ability) => {
        ability.actions.forEach(({ addCards = [], addCardsToDiscard = [], addCardsToDeck = [], selectCards = {} }) => {
            [...addCards, ...addCardsToDiscard, ...addCardsToDeck, ...(selectCards.cards || [])].forEach((card) => {
                const key = card.name + JSON.stringify(card.image);
                if (!cardsToAddMap[key]) {
                    cardsToAddMap[key] = card; // We only want to display it once
                    findCardsToAdd(card);
                }
            });
        });
    };

    findCardsToAdd(ability);
    const classes = useTooltipStyles();

    const getUniqueEffects = (ability: Ability): Effect[] => {
        const effects = ability.actions
            ?.reduce((acc, { effects = [] }) => {
                return [...acc, ...effects];
            }, [])
            .concat(ability.minion?.effects || []);
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
        return <AbilityTooltipSection icon={effect.icon} title={effect.name} description={effect.description} key={effect.name} />;
    });

    const cardsToAdd = Object.values(cardsToAddMap);
    const isEphemeral = cardsToAdd.some((ability: Ability) => ability.removeAfterTurn) || ability.removeAfterTurn;
    const isDeplete = cardsToAdd.some((ability: Ability) => ability.depletedOnUse) || ability.depletedOnUse;
    const isReusable = cardsToAdd.some((ability: Ability) => ability.reusable) || ability.reusable;
    const hasRadiate = ability.actions.some((action) => action.radiate);

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

    if (ability.preemptive) {
        tooltips.push(
            <AbilityTooltipSection title="Pre-Emptive" description={"Start battle with this ability in hand."} key={"preemptive"} />
        );
    }

    if (isEphemeral) {
        tooltips.push(
            <AbilityTooltipSection
                title="Ephemeral"
                description={"Ephemeral abilities disappear at the end of your turn."}
                key={"ephemeral"}
            />
        );
    }

    if (isDeplete) {
        tooltips.push(
            <AbilityTooltipSection title="Deplete" description={"'Deplete' abilities can only be used once per battle."} key={"deplete"} />
        );
    }

    if (isReusable) {
        tooltips.push(<AbilityTooltipSection title="Boomerang" description={"Ability returns to your hand after use."} key={"reusable"} />);
    }

    if (hasRadiate) {
        tooltips.push(
            <AbilityTooltipSection
                title="Radiate"
                description={
                    "Radiate causes you to emit an effect from your position. Damage dealt by Radiate is unaffected by ATT modifiers and damage reductions."
                }
                key={"radiate"}
            />
        );
    }

    return (
        <Tooltip title={tooltips} placement={"right-end"} classes={{ tooltip: classes.tooltip }} enterDelay={500}>
            {children}
        </Tooltip>
    );
};

export default AbilityTooltip;
