import classNames from "classnames";
import { createUseStyles } from "react-jss";
import Icon from "../icon/Icon";
import { LockIcon } from "../images/icons";

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
    backgroundContainer: {
        position: "relative",
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
    locked: {
        filter: "saturate(0.1) brightness(0.6)",
        cursor: "unset",
    },
    lockIconContainer: {
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
        filter: Array.from({ length: 3 })
            .map(() => "drop-shadow(0 0 2px rgba(0, 0, 0, 0.8))")
            .join(" "),
    },
});

const TownNode = ({
    isVisited,
    isLocked,
    onClick,
    icon,
    nodeImage,
    nodeEl,
    label,
}: {
    isVisited: boolean;
    isLocked?: boolean;
    onClick: () => void;
    icon;
    nodeImage?: string;
    nodeEl?: JSX.Element;
    label: string;
}) => {
    const classes = useStyles();

    const handleClick = () => {
        if (!isLocked) {
            onClick();
        }
    };
    return (
        <div className={classNames(classes.node, { [classes.visited]: isVisited })} onClick={handleClick}>
            <div className={classNames(classes.backgroundContainer, { [classes.locked]: isLocked })}>
                {nodeImage && <img src={nodeImage} alt={label} />}
                {nodeEl && nodeEl}
            </div>
            <span className={classes.iconWrapper}>
                <Icon icon={icon} size="md" className={classes.icon} />
            </span>
            <br />
            <span className={classes.nodeLabel}>{label}</span>
            {isLocked && (
                <span className={classes.lockIconContainer}>
                    <Icon icon={LockIcon} size="xl" />
                </span>
            )}
        </div>
    );
};

export default TownNode;
