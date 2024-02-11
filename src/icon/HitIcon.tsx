import { useEffect, useRef, useState } from "react";
import { createUseStyles } from "react-jss";
import { BoomIcon } from "../images/icons";
import Icon from "./Icon";

const useStyles = createUseStyles({
    root: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translateX(-50%) translateY(-50%)",
        height: "100%",
        width: "100%",
        display: "none",
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
    const [oldStatChanges, setOldStatChanges] = useState({ damage: 0 });
    const classes = useStyles();
    const ref = useRef();

    useEffect(() => {
        if (!statChanges.damage) {
            return;
        }

        if (ref.current) {
            //@ts-ignore
            ref.current?.animate(
                [
                    {
                        opacity: 1,
                        offset: 0.6,
                        display: "block",
                    },
                    { opacity: 0, display: "block" },
                ],
                2000
            );

            setOldStatChanges(statChanges);
        }
    }, [statChanges]);

    return <Icon icon={<BoomIcon />} className={classes.root} text={oldStatChanges.damage} ref={ref} />;
};

export default HitIcon;
