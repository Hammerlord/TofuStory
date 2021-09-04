import Handlebars from "handlebars";
import { createUseStyles } from "react-jss";
import { Hourglass, Warning } from "../images";
import Tooltip from "../view/Tooltip";
import Icon from "./Icon";

const useStyles = createUseStyles({
    tooltipContents: {
        display: "flex",
    },
    tooltipTitle: {
        fontSize: "1.1rem",
        marginBottom: "4px",
    },
    container: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
    },
    iconContainer: {
        marginRight: "16px",
    },
});

const CastingIndicator = ({ casting, combatant }) => {
    const classes = useStyles();
    if (!casting) {
        return null;
    }

    const { name, channelDuration, castTime, description } = casting;
    const interpolatedDescription = Handlebars.compile(description)({ caster: combatant.name });
    return (
        <div>
            <Tooltip
                title={
                    <div className={classes.tooltipContents}>
                        <div className={classes.iconContainer}>
                            <Icon icon={<Warning />} size="lg" />
                        </div>
                        <div className={classes.container}>
                            <div className={classes.tooltipTitle}>{name}</div>
                            <div>{interpolatedDescription}</div>
                            {channelDuration > 0 && (
                                <div>
                                    Repeats for {channelDuration} turn{channelDuration > 1 && "s"}.
                                </div>
                            )}
                        </div>
                    </div>
                }
            >
                <span>
                    <Icon icon={<Warning />} text={channelDuration} />
                </span>
            </Tooltip>

            {castTime > 0 && (
                <Tooltip
                    title={
                        <div className={classes.tooltipContents}>
                            <div className={classes.iconContainer}>
                                <Icon icon={<Hourglass />} size="lg" />
                            </div>
                            <div className={classes.container}>
                                Special ability activates in {castTime} turn
                                {castTime > 1 && "s"}.
                            </div>
                        </div>
                    }
                >
                    <span>
                        <Icon icon={<Hourglass />} text={castTime} />
                    </span>
                </Tooltip>
            )}
        </div>
    );
};

export default CastingIndicator;
