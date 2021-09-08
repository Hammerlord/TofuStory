import classNames from "classnames";
import React from "react";
import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
    root: {
        position: "relative",
        display: "inline-block",
        borderRadius: "32px",
        "&.sm": {
            width: "12px",
            height: "12px",
            minWidth: "12px",
            minHeight: "12px",
        },
        "&.md": {
            width: "24px",
            height: "24px",
            minWidth: "24px",
            minHeight: "24px",
        },
        "&.lg": {
            width: "36px",
            height: "36px",
            minWidth: "36px",
            minHeight: "36px",
            "& .text": {
                fontSize: "18px",
            },
        },
        "&.xl": {
            width: "48px",
            height: "48px",
            minWidth: "48px",
            minHeight: "48px",
            "& .text": {
                fontSize: "18px",
            },
        },
    },
    inner: {
        verticalAlign: "bottom",
        display: "flex",
        justifyContent: "center",
        height: "100%",
    },
    icon: {
        width: "100%",
        height: "100%",
        margin: "auto",
    },
    text: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translateX(-50%) translateY(-50%)",
        textShadow: "0 0 3px black, 0 0 3px black, 0 0 3px black, 0 0 3px black, 0 0 3px black",
        fontSize: "16px",
        fontWeight: "bold",
        zIndex: "3",
        color: "white",
    },
});

interface IconInterface {
    background?: string;
    text?: string | number;
    icon: any;
    size?: "sm" | "md" | "lg" | "xl";
    className?: string;
    style?: any;
}

const Icon = ({ text, icon, background, size = "md", className, style, ...other }: IconInterface) => {
    const classes = useStyles();
    size = ["sm", "md", "lg", "xl"].includes(size) ? size : undefined;
    let iconNode;

    if (typeof icon === "string") {
        iconNode = <img src={icon} className={classNames(classes.icon, "icon")} />;
    } else if (typeof icon === "function") {
        const Icon = icon;
        iconNode = (
            <span className={classNames(classes.icon, "icon")}>
                <Icon />
            </span>
        );
    } else {
        iconNode = <span className={classNames(classes.icon, "icon")}>{icon}</span>;
    }

    return (
        <span className={classNames("icon-root", classes.root, className, size)} style={{ background, ...style }} {...other}>
            <span className={classNames(classes.inner)}>
                {iconNode}
                <span className={classNames("text", classes.text)}>{text}</span>
            </span>
        </span>
    );
};

export default Icon;
