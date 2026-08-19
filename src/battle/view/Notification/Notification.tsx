import classNames from "classnames";
import { MouseEventHandler, ReactElement, useEffect, useState } from "react";
import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
    root: {
        padding: "8px 100px",
        zIndex: 4,
        cursor: "pointer",
        fontSize: "1.2rem",
        whiteSpace: "nowrap",
        lineHeight: "1.5rem",
        "&.warning": {
            background:
                "linear-gradient(90deg, rgba(255,212,0,0) 0%, rgba(255,212,0,0.9) 15%, rgba(255,212,0.9) 50%, rgba(255,212,0,0.9) 85%, rgba(255,212,0,0) 100%)",
            color: "black",
        },
        "&.error": {
            background: "#ff2b2b",
            color: "white",
        },
        "&.info": {
            color: "white",
            background:
                "linear-gradient(90deg, rgba(0,212,255,0) 0%, rgba(0,0,0,0.9) 15%, rgba(0,0,0,0.9) 50%, rgba(0,0,0,0.9) 85%, rgba(0,212,255,0) 100%)",
        },
    },
});

const Notification = ({
    children,
    severity = "info",
    id,
    onClick,
    duration = 7000,
}: {
    children: ReactElement | string;
    severity?: "warning" | "info" | "error";
    id?: string;
    onClick?: MouseEventHandler<HTMLDivElement>;
    duration?: number;
}) => {
    const [opacity, setOpacity] = useState(0);
    const [fadeOut, setFadeOut] = useState(false);
    const classes = useStyles();

    useEffect(() => {
        setOpacity(1);
        setFadeOut(false);
        const timeOut = setTimeout(() => {
            setFadeOut(true);
        }, duration);

        return () => clearTimeout(timeOut);
    }, [children, id]);

    useEffect(() => {
        if (!fadeOut) {
            return;
        }

        const interval = setInterval(() => {
            if (opacity > 0) {
                setOpacity(opacity - 0.02);
            } else {
                clearInterval(interval);
            }
        }, 1);

        return () => clearInterval(interval);
    }, [opacity, fadeOut]);

    if (!children || opacity <= 0) {
        return null;
    }
    return (
        <div style={{ opacity: opacity }} className={classNames(classes.root, severity)} onClick={onClick}>
            {children}
        </div>
    );
};

export default Notification;
