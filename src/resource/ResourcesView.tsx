import classNames from "classnames";
import { createUseStyles } from "react-jss";
import Icon from "../icon/Icon";
import { Fire } from "../images/";

const useStyles = createUseStyles({
    root: {
        "& .icon": {
            width: "80%",
            height: "80%",
        },
    },
});

interface FuryInterface {
    text?: string | number;
    className?: string;
}

export const Fury = ({ text, className }: FuryInterface) => {
    const classes = useStyles();
    return (
        <Icon
            className={classNames(classes.root, className)}
            icon={<Fire />}
            background={"#eb4034"}
            text={text}
        />
    );
};
