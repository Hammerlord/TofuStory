import classNames from "classnames";
import { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
    root: {
        padding: "8px 32px",
        position: "fixed",
        left: "50%",
        top: "10%",
        transform: "translateX(-50%)",
        zIndex: 4,
        cursor: "pointer",
        fontSize: "1.2rem",
        whiteSpace: "nowrap",
        "&.warning": {
            background: "#ffd342",
            color: "black",
        },
        "&.error": {
            background: "#ff2b2b",
            color: "white",
        },
        "&.info": {
            background: "#1a1409",
            color: "white",
        },
    },
});

const Notification = ({ children, severity = "info", id, onClick, duration = 7000 }) => {
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
