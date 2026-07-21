import classNames from "classnames";
import { forwardRef, ReactElement } from "react";
import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
    root: {
        position: "relative",
        display: "inline-block",
        borderRadius: "32px",
        verticalAlign: "bottom",
        "&.min": {
            width: "12px",
            height: "12px",
            minWidth: "12px",
            minHeight: "12px",
            "& .text": {
                fontSize: "8px",
            },
        },
        "&.xs": {
            width: "16px",
            height: "16px",
            minWidth: "16px",
            minHeight: "16px",
            "& .text": {
                fontSize: "11px",
            },
        },
        "&.sm": {
            width: "22px",
            height: "22px",
            minWidth: "22px",
            minHeight: "22px",
            "& .text": {
                fontSize: "14px",
            },
        },
        "&.md": {
            width: "30px",
            height: "30px",
            minWidth: "30px",
            minHeight: "30px",
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
            .map(() => "0 0 3px black")
            .join(", "),
        fontSize: "16px",
        fontWeight: "bold",
        zIndex: "3",
        color: "white",
        whiteSpace: "nowrap",
    },
    positive: {
        color: "#42f57b",
    },
    negative: {
        color: "#ff9b94",
    },
});

interface IconInterface {
    background?: string;
    text?: string | number;
    icon: any;
    size?: "min" | "xs" | "sm" | "md" | "lg" | "xl";
    className?: string;
    style?: any;
    children?: ReactElement;
    highlightText?: "positive" | "negative";
    [x: string]: any;
}

const Icon = forwardRef(
    ({ text, icon, background, size = "md", className, style, children, highlightText, ...other }: IconInterface, ref: any) => {
        const classes = useStyles();
        size = ["min", "xs", "sm", "md", "lg", "xl"].includes(size) ? size : undefined;
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
                    {children ? (
                        children
                    ) : (
                        <span
                            className={classNames("text", classes.text, {
                                [classes.positive]: highlightText === "positive",
                                [classes.negative]: highlightText === "negative",
                            })}
                        >
                            {text}
                        </span>
                    )}
                </span>
            </span>
        );
    }
);

export default Icon;
