import { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
import { Boom } from "../images";
import Icon from "./Icon";

const useStyles = createUseStyles({
    root: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translateX(-50%) translateY(-50%)",
        height: "100%",
        width: "100%",
        "& .icon": {
            width: "350%",
            height: "350%",
            margin: "-105%",
            marginLeft: "-35px",
        },
        "& .text": {
            fontSize: "20px",
        },
    },
});

const HitIcon = ({ statChanges }) => {
    const classes = useStyles();
    const [opacity, setOpacity] = useState(0);

    useEffect(() => {
        if (opacity <= 0) {
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
    }, [opacity]);

    useEffect(() => {
        if (statChanges.damage > 0) {
            setOpacity(10); // 10 keeps it at 100% for longer
        }
    }, [statChanges]);

    if (!statChanges.damage) {
        return null;
    }
    return (
        <Icon
            icon={<Boom />}
            className={classes.root}
            text={statChanges.damage}
            style={{ opacity }}
        />
    );
};

export default HitIcon;
