import { createUseStyles } from "react-jss";
import { Tooltip as MuiTooltip } from "@material-ui/core";

const useStyles = createUseStyles({
    tooltip: {
        "& .MuiTooltip-tooltip": {
            fontSize: "1rem",
            fontFamily: "Barlow",
            fontWeight: "500",
            lineHeight: "24px",
            background: "rgba(50, 50, 50, 0.9)",
            borderRadius: "8px",
            padding: "16px",
        },

        "& .MuiTooltip-Arrow::before": {
            background: "rgba(50, 50, 50, 0.9)",
        },
    },
});

const Tooltip = ({ children, title, ...other }) => {
    const classes = useStyles();
    return (
        <MuiTooltip arrow classes={{ popper: classes.tooltip }} title={title} {...other}>
            {children}
        </MuiTooltip>
    );
};

export default Tooltip;
