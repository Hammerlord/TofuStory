import classNames from "classnames";
import { createUseStyles } from "react-jss";
import Icon from "../icon/Icon";
import { FireIcon } from "../images/icons";
import { ManaImage, NimbleJewelImage } from "../images";
import { forwardRef } from "react";

const useStyles = createUseStyles({
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
    const classes = useStyles();
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
