import { Tooltip } from "@material-ui/core";
import classNames from "classnames";
import { createUseStyles } from "react-jss";
import Icon from "../../icon/Icon";
import { Blood, Dizzy, Fire, Fireworks, Snowflake } from "../../images";
import { Ability } from "../types";
import AbilityView from "./AbilityView";
import { getDebuffDurations } from "./Debuffs";

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
        "& > .card-container:not(:last-child)": {
            marginRight: 8,
        },
    },
});

const AbilityTooltip = ({ ability, children }: { ability: Ability; children: JSX.Element }) => {
    const cardsToAddMap = (ability.actions.find((action) => action.addCards?.length)?.addCards || []).reduce((acc, card) => {
        acc[card.name] = card;
        return acc;
    }, {});
    const { bleedDuration, stunDuration, chillDuration, burnDuration } = getDebuffDurations(ability);
    const aura = ability.minion?.aura;
    const classes = useTooltipStyles();

    const tooltips = [];
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

    if (bleedDuration > 0) {
        tooltips.push(
            <AbilityTooltipSection
                icon={<Blood />}
                title={"Bleed"}
                description={"Afflicted targets take 1 damage at the end of their turn."}
                key={"bleed"}
            />
        );
    }

    if (stunDuration > 0) {
        tooltips.push(
            <AbilityTooltipSection
                icon={<Dizzy />}
                title={"Stun"}
                description={"Afflicted targets are unable to act during their turn."}
                key={"stun"}
            />
        );
    }

    if (chillDuration > 0) {
        tooltips.push(
            <AbilityTooltipSection
                icon={<Snowflake />}
                title={"Chill"}
                description={"Reduces afflicted targets' attack power by 1."}
                key={"chill"}
            />
        );
    }

    if (burnDuration > 0) {
        tooltips.push(
            <AbilityTooltipSection
                icon={<Fire />}
                title={"Burn"}
                description={"Afflicted targets take 1 damage at the end of their turn."}
                key={"burn"}
            />
        );
    }

    if (Object.keys(cardsToAddMap).length > 0) {
        const cards = Object.values(cardsToAddMap).map((ability: Ability, i) => (
            <div className={"card-container"} key={i}>
                <AbilityView ability={ability} />
            </div>
        ));
        const isEphemeral = Object.values(cardsToAddMap).some((ability: Ability) => ability.removeAfterTurn);
        if (isEphemeral) {
            tooltips.push(
                <AbilityTooltipSection description={"Ephemeral abilities disappear at the end of your turn."} key={"ephemeral"} />
            );
        }
        tooltips.push(
            <div className={classes.cards} key={"cards"}>
                {cards}
            </div>
        );
    }

    return (
        <Tooltip title={tooltips} placement={"right-end"} classes={{ tooltip: classes.tooltip }} enterDelay={1000}>
            {children}
        </Tooltip>
    );
};

export default AbilityTooltip;
