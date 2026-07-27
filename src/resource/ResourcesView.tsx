import classNames from "classnames";
import { forwardRef } from "react";
import { createUseStyles } from "react-jss";
import Icon from "../icon/Icon";
import { LeafImage, ManaImage } from "../images";
import { FireIcon } from "../images/icons";

const useFuryStyles = createUseStyles({
    root: {
        "& .icon": {
            width: "80%",
            height: "80%",
        },
    },
});

interface ResourceInterface {
    text?: string | number;
    className?: string;
    size?: "xl" | "lg" | "md" | "sm";
}

export const Fury = forwardRef(({ text, className, size }: ResourceInterface, ref) => {
    const classes = useFuryStyles();
    return (
        <Icon
            className={classNames(classes.root, className)}
            icon={<FireIcon />}
            background={"#eb4034"}
            text={text}
            size={size}
            ref={ref}
        />
    );
});

export const Mana = forwardRef(({ text, className, size }: ResourceInterface, ref) => {
    return <Icon className={classNames(className)} icon={ManaImage} text={text} size={size} ref={ref} />;
});

const useStaminaStyles = createUseStyles({
    root: {
        "& .icon": {
            marginTop: "-1px",
        },
    },
});

export const Stamina = forwardRef(({ text, className, size }: ResourceInterface, ref) => {
    const classes = useStaminaStyles();

    return <Icon className={classNames(classes.root, className)} icon={LeafImage} text={text} size={size} ref={ref} />;
});
