import { createUseStyles } from "react-jss";
import Icon from "../icon/Icon";
import { JapaneseOgreIcon, MilitaryMedalIcon } from "../images/icons";
import Tooltip from "../view/Tooltip";

const useStyles = createUseStyles({
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

const CombatantTooltip = ({ combatant }) => {
    const { isBoss, isElite, isPlayer, name } = combatant || {};
    const classes = useStyles();

    if (!combatant || isPlayer) {
        return null;
    }

    const getDifficultyLabel = () => {
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
    const combatantTooltip = (
        <div>
            <span className={classes.name}>{name}</span> <br />
            {getDifficultyLabel()}
        </div>
    );

    return (
        <Tooltip title={combatantTooltip}>
            <div className={classes.tooltipAnchor} />
        </Tooltip>
    );
};

export default CombatantTooltip;
