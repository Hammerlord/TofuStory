import classNames from "classnames";
import { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
    root: {
        padding: "16px 32px",
        position: "fixed",
        left: "50%",
        top: "5%",
        transform: "translateX(-50%)",
        zIndex: 4,
        cursor: "pointer",
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

const Notification = ({ children, severity = "info", id, onClick }) => {
    const [opacity, setOpacity] = useState(0);
    const classes = useStyles();

    useEffect(() => {
        setOpacity(30); // 30 keeps it at 100% opacity for longer
    }, [children, id]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (opacity > 0) {
                setOpacity(opacity - 0.02);
            } else {
                clearInterval(interval);
            }
        }, 1);

        return () => clearInterval(interval);
    }, [opacity]);

    if (!children || opacity <= 0) {
        return null;
    }
    return (
        <div
            style={{ opacity: opacity }}
            className={classNames(classes.root, severity)}
            onClick={onClick}
        >
            {children}
        </div>
    );
};

export default Notification;
