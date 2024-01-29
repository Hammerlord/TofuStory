import { createUseStyles } from "react-jss";
import { BoomIcon } from "../images/icons";
import Icon from "./Icon";
import { useEffect, useState } from "react";

const useStyles = createUseStyles({
    "@keyframes fadeOut": {
        "0%": {
            opacity: 1,
        },
        "50%": {
            opacity: 1,
        },
        "100%": {
            opacity: 0,
        },
    },
    root: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translateX(-50%) translateY(-50%)",
        height: "100%",
        width: "100%",
        animationName: "$fadeOut",
        animationDuration: "2s",
        "& .icon": {
            width: "350%",
            height: "350%",
            margin: "-105%",
            marginLeft: "-35px",
        },
        "& .text": {
            fontSize: "22px",
            textShadow: Array.from({ length: 10 })
                .map(() => "0 0 3px black")
                .join(", "),
        },
    },
});

const HitIcon = ({ statChanges }) => {
    const [oldStatChanges, setOldStatChanges] = useState({});
    const classes = useStyles();

    useEffect(() => {
        const timeout = setTimeout(() => {
            setOldStatChanges(statChanges);
        }, 2000);

        return () => {
            clearTimeout(timeout);
        };
    }, [statChanges]);

    if (!statChanges.damage || oldStatChanges === statChanges) {
        return null;
    }
    return <Icon icon={<BoomIcon />} className={classes.root} text={statChanges.damage} />;
};

export default HitIcon;
