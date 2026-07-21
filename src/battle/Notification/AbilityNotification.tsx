import { FC, MouseEventHandler, useMemo } from "react";
import * as uuid from "uuid";
import Notification from "./Notification";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles({
    abilityIcon: {
        maxWidth: "24px",
        maxHeight: "24px",
        verticalAlign: "bottom",
    },
});

const AbilityNotification = ({
    ability,
    onClick,
}: {
    ability: { image?: string; name?: string };
    onClick?: MouseEventHandler<HTMLDivElement>;
}) => {
    const { image, name } = ability;
    const id = useMemo(() => uuid.v4(), [ability]);
    const classes = useStyles();
    if (!name) {
        return null;
    }
    let imageNode;
    if (typeof image === "string") {
        imageNode = <img src={image} className={classes.abilityIcon} />;
    } else if (typeof image === "function") {
        const ImageNode: FC<{ className?: string }> = image;
        imageNode = <ImageNode className={classes.abilityIcon} />;
    }

    return (
        <Notification onClick={onClick} id={id} duration={1250}>
            <>
                {imageNode} {name}
            </>
        </Notification>
    );
};

export default AbilityNotification;
