import classNames from "classnames";
import { forwardRef } from "react";
import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
    root: {
        position: "relative",
        display: "inline-block",
        borderRadius: "32px",
        verticalAlign: "bottom",
        "&.sm": {
            width: "20px",
            height: "20px",
            minWidth: "20px",
            minHeight: "20px",
            "& .text": {
                fontSize: "14px",
            },
        },
        "&.md": {
            width: "28px",
            height: "28px",
            minWidth: "28px",
            minHeight: "28px",
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
        objectFit: "contain",
    },
    text: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translateX(-50%) translateY(-50%)",
        textShadow: Array.from({ length: 10 })
            .map(() => "0 0 2px black")
            .join(", "),
        fontSize: "16px",
        fontWeight: "bold",
        zIndex: "3",
        color: "white",
        whiteSpace: "nowrap",
    },
});

interface IconInterface {
    background?: string;
    text?: string | number;
    icon: any;
    size?: "sm" | "md" | "lg" | "xl";
    className?: string;
    style?: any;
    children?: JSX.Element;
    [x: string]: any;
}

const Icon = forwardRef(({ text, icon, background, size = "md", className, style, children, ...other }: IconInterface, ref: any) => {
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
        <span className={classNames("icon-root", classes.root, className, size)} style={{ background, ...style }} {...other} ref={ref}>
            <span className={classNames(classes.inner)}>
                {iconNode}
                {children ? children : <span className={classNames("text", classes.text)}>{text}</span>}
            </span>
        </span>
    );
});

export default Icon;
