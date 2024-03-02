import classNames from "classnames";
import { createUseStyles } from "react-jss";
import Icon from "../icon/Icon";

const useStyles = createUseStyles({
    node: {
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
        margin: "auto",
        position: "relative",
        cursor: "pointer",
        display: "inline-block",
        padding: "0 64",
        verticalAlign: "middle",
    },
    nodeLabel: {
        position: "absolute",
        left: "50%",
        transform: "translateX(-50%)",
        top: "50",
        backgroundColor: "rgba(20, 20, 20, 0.85)",
        padding: "6px 16px",
        borderRadius: 4,
        textShadow: Array.from({ length: 10 })
            .map(() => "0 0 3px black")
            .join(", "),
        whiteSpace: "nowrap",
    },
    iconWrapper: {
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        color: "white",
        width: "48px",
        height: "48px",
        fontSize: "32px",
        borderRadius: "48px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        position: "absolute",
        left: "50%",
        transform: "translateX(-50%)",
        top: "0",
    },
    icon: {
        margin: "auto",
    },
    visited: {
        filter: "saturate(0.25) brightness(0.6)",
        cursor: "unset",
    },
});

const TownNode = ({
    visited,
    onClick,
    icon,
    nodeImage,
    nodeEl,
    label,
}: {
    visited: boolean;
    onClick: () => void;
    icon;
    nodeImage?: string;
    nodeEl?: JSX.Element;
    label: string;
}) => {
    const classes = useStyles();
    return (
        <div className={classNames(classes.node, { [classes.visited]: visited })} onClick={onClick}>
            <span className={classes.iconWrapper}>
                <Icon icon={icon} size="md" className={classes.icon} />
            </span>
            <br />

            <span className={classes.nodeLabel}>{label}</span>
            {nodeImage && <img src={nodeImage} alt={label} />}
            {nodeEl && nodeEl}
        </div>
    );
};

export default TownNode;
