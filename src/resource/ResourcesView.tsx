import classNames from "classnames";
import { Ref } from "react";
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
    ref?: Ref<HTMLSpanElement>;
}

export const Fury = ({ text, className, size, ref }: ResourceInterface) => {
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
};

export const Mana = ({ text, className, size, ref }: ResourceInterface) => {
    return (
        <Icon
            className={classNames(className)}
            icon={ManaImage}
            text={text}
            size={size}
            ref={ref}
        />
    );
};

const useStaminaStyles = createUseStyles({
    root: {
        "& .icon": {
            marginTop: "-1px",
        },
    },
});

export const Stamina = ({ text, className, size, ref }: ResourceInterface) => {
    const classes = useStaminaStyles();

    return (
        <Icon
            className={classNames(classes.root, className)}
            icon={LeafImage}
            text={text}
            size={size}
            ref={ref}
        />
    );
};
