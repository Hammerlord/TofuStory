import { Button as MuiButton } from "@material-ui/core";
import classNames from "classnames";
import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
    button: {
        "&&": {
            // Increase specificity to override MUI
            fontFamily: "Barlow, Arial",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "0.9rem",
            letterSpacing: "0.05rem",
            textShadow: "0 0 2px rgba(0, 0, 0, 1), 0 0 2px rgba(0, 0, 0, 1), 0 0 2px rgba(0, 0, 0, 1), 0 0 2px rgba(0, 0, 0, 1)",
            color: "rgba(255, 255, 255, 0.9) !important",

            "&:active": {
                transform: "translateX(1px) translateY(1px)",
                transition: "transform 0.2s",
            },
            "&.primary": {
                background: "linear-gradient(360deg, #587100 0%, #adcb08 100%) !important",
            },
            "&.secondary": {
                background: "linear-gradient(360deg, #0d7ed1 0%, #02c7f4 100%) !important;",
            },
            "&.warning": {
                background: "linear-gradient(360deg, #d1830d 0%, #f4b902 100%) !important;",
                color: "rgba(255, 255, 255, 1) !important",
            },
            "&.base": {
                background: "rgba(120, 120, 120) !important",
            },
            "&.disabled": {
                color: "rgba(255, 255, 255) !important",
                opacity: "0.7",
                filter: "saturate(0.5)",
            },
        },
    },
});

const Button = ({ color, variant, disabled, ...other }: any) => {
    const classes = useStyles();
    return (
        <MuiButton
            className={classNames(classes.button, {
                primary: color === "primary",
                secondary: color === "secondary",
                warning: color === "warning",
                disabled: disabled,
                base: !disabled && !["primary", "secondary", "warning"].includes(color),
            })}
            variant={variant || "contained"}
            disabled={disabled}
            disableRipple={true}
            {...other}
        />
    );
};

export default Button;
