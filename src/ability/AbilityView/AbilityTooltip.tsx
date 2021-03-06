import { Tooltip } from "@material-ui/core";
import classNames from "classnames";
import { createUseStyles } from "react-jss";
import Icon from "../../icon/Icon";
import { Fireworks } from "../../images";
import { Ability, EFFECT_TYPES } from "../types";
import AbilityView from "./AbilityView";
import { getAllEffects } from "./utils";

const useSectionStyles = createUseStyles({
    section: {
        display: "flex",
        fontSize: "1rem",
        fontFamily: "Barlow",
        fontWeight: "500",
        lineHeight: "24px",
        background: "rgba(50, 50, 50, 0.9)",
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
        background: "rgba(50, 50, 50, 0.9)",
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
    const cardsToAddMap = (ability.actions.find((action) => action.addCards?.length)?.addCards || []).reduce((acc, card) => {
        acc[card.name] = card;
        return acc;
    }, {});

    const aura = ability.minion?.aura;
    const classes = useTooltipStyles();

    const effectsToDisplay = getAllEffects(ability).filter(requiresExplanation);
    const tooltips = effectsToDisplay.map((effect) => {
        return <AbilityTooltipSection icon={effect.icon} title={effect.name} description={effect.description} key={effect.name} />;
    });

    if (aura) {
        tooltips.push(
            <AbilityTooltipSection
                icon={<Fireworks />}
                title={"Aura"}
                description={"Grants effects to allies who are directly adjacent to this minion's placement."}
                key={"aura"}
            />
        );
    }

    let isEphemeral = ability.removeAfterTurn;
    let isDeplete = ability.depletedOnUse;

    const cardsToAdd = Object.values(cardsToAddMap);
    if (cardsToAdd.length > 0) {
        if (cardsToAdd.some((ability: Ability) => ability.removeAfterTurn)) {
            isEphemeral = true;
        }

        if (cardsToAdd.some((ability: Ability) => ability.depletedOnUse)) {
            isDeplete = true;
        }

        tooltips.push(
            <div className={classes.cards} key={"cards"}>
                {cardsToAdd.map((ability: Ability, i) => (
                    <div className={"card-container"} key={i}>
                        <AbilityView ability={ability} />
                    </div>
                ))}
            </div>
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
            <AbilityTooltipSection
                title="Deplete"
                description={"When used, deplete abilities are removed for the rest of the battle."}
                key={"deplete"}
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
