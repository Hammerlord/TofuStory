import { createUseStyles } from "react-jss";
import { ReactNode } from "react";
import { Tooltip as MuiTooltip, TooltipProps as MuiTooltipProps } from "@mui/material";

const useStyles = createUseStyles({
    tooltip: {
        "& .MuiTooltip-tooltip": {
            fontSize: "1rem",
            fontFamily: "Barlow",
            fontWeight: "500",
            lineHeight: "24px",
            background: "rgba(25, 25, 25, 0.95)",
            borderRadius: "8px",
            padding: "16px",
        },

        "& .MuiTooltip-arrow::before": {
            background: "rgba(25, 25, 25, 0.95)",
        },

        "& hr": {
            borderTop: 0,
            opacity: 0.6,
        },
    },
});

interface TooltipProps extends MuiTooltipProps {
    title: ReactNode;
}

const Tooltip = ({ children, title, classes = {}, ...other }: TooltipProps) => {
    const selectors = useStyles();
    return (
        <MuiTooltip arrow classes={{ popper: selectors.tooltip, ...classes }} title={title} {...other} disableInteractive={true}>
            {children}
        </MuiTooltip>
    );
};

export default Tooltip;
