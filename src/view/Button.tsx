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
            textShadow: "0 0 2px rgba(0, 0, 0, 0.9), 0 0 2px rgba(0, 0, 0, 0.9), 0 0 2px rgba(0, 0, 0, 0.9)",
            "&:active": {
                transform: "translateX(1px) translateY(1px)",
                transition: "transform 0.2s",
            },
            "&.primary": {
                background: "linear-gradient(360deg, rgba(119,153,0,1) 0%, rgba(153,187,34,1) 100%) !important",
            },
            "&.secondary": {
                background: "linear-gradient(360deg, rgb(181,121,0) 0%, rgb(241,161,0) 100%) !important;",
            },
            "&.base": {
                background: "rgba(120, 120, 120) !important",
                color: "rgba(255, 255, 255, 0.9) !important",
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
                disabled: disabled,
                base: !disabled && !["primary", "secondary"].includes(color),
            })}
            color={color}
            variant={variant || "contained"}
            disabled={disabled}
            disableRipple={true}
            {...other}
        />
    );
};

export default Button;
