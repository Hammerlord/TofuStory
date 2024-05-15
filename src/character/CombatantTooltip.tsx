import { createUseStyles } from "react-jss";
import Icon from "../icon/Icon";
import { JapaneseOgreIcon, MilitaryMedalIcon } from "../images/icons";
import { getEffectGroups } from "./effects/EffectIcons";
import { TooltipSection } from "../view/KeywordsTooltip";
import { Tooltip } from "@material-ui/core";
import Handlebars from "handlebars";

const useStyles = createUseStyles({
    tooltip: {
        "&&": {
            maxWidth: "325px",
            background: "none",
            minHeight: "200px",
        },
    },
    tooltipIcon: {
        verticalAlign: "bottom",
        marginRight: "4px",
    },
    tooltipAnchor: {
        position: "absolute",
        top: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        height: "100%",
    },
    boss: {
        color: "rgba(255, 175, 150, 1)",
    },
    elite: {
        color: "rgba(255, 225, 150, 1)",
    },
    name: {
        fontSize: "1.1rem",
    },
});

const CombatantTooltip = ({ combatant, isEnemy }) => {
    const { isBoss, isElite, isPlayer, name, effects = [] } = combatant || {};
    const classes = useStyles();

    if (!combatant || isPlayer) {
        return null;
    }

    const getDifficultyLabel = () => {
        if (!isEnemy) {
            return null;
        }

        if (isBoss) {
            return (
                <span className={classes.boss}>
                    <Icon icon={JapaneseOgreIcon} className={classes.tooltipIcon} size="sm" /> Boss
                </span>
            );
        }

        if (isElite) {
            return (
                <span className={classes.elite}>
                    <Icon icon={MilitaryMedalIcon} className={classes.tooltipIcon} size="sm" /> Elite
                </span>
            );
        }

        return "◆ Common";
    };

    const getEffectSectionProps = (effects, i) => {
        return {
            title: effects[0]?.name,
            icon: effects[0]?.icon,
            description: Handlebars.compile(effects[0]?.description || "")(effects[0]),
            key: effects[0]?.name || i,
        };
    };

    const combatantTooltip = (
        <div>
            <TooltipSection title={name} description={getDifficultyLabel()} />
            {getEffectGroups(effects).map((effects, i) => (
                <TooltipSection {...getEffectSectionProps(effects, i)} />
            ))}
        </div>
    );

    return (
        <Tooltip title={combatantTooltip} classes={{ tooltip: classes.tooltip }}>
            <div className={classes.tooltipAnchor} />
        </Tooltip>
    );
};

export default CombatantTooltip;
