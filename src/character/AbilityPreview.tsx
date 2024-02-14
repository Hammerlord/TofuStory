import classNames from "classnames";
import { createUseStyles } from "react-jss";
import Icon from "../icon/Icon";
import { CrossedSwordsIcon } from "../images/icons";

const useStyles = createUseStyles({
    "@keyframes fadeIn": {
        "0%": {
            opacity: 0,
        },
        "100%": {
            opacity: 1,
        },
    },
    previewIconContainer: {
        filter: "drop-shadow(0 0 1px black) drop-shadow(0 0 1px black) drop-shadow(0 0 1px black)",
        margin: "0 4px",
    },
    statUpdatePreview: {
        zIndex: 5,
        fontSize: "18px",
        fontWeight: "bold",
        background: "rgba(125, 15, 15, 0.8)",
        padding: "8px",
        position: "absolute",
        left: "50%",
        transform: "translateX(-50%)",
        color: "white",
        borderRadius: "4px",
        animationName: "$fadeIn",
        animationDuration: "0.5s",
        animationFillMode: "forwards",
        display: "flex",
        top: 10,
        "&.nondeterministic": {
            background: "rgba(100, 70, 70, 0.7)",
        },
    },
    statUpdate: {
        display: "inline-block",
        margin: "0 4px",
        whiteSpace: "nowrap",
        filter: "drop-shadow(0 0 1px black) drop-shadow(0 0 1px black) drop-shadow(0 0 1px black)",
    },
});

const AbilityPreview = ({ previewStatUpdate }) => {
    const classes = useStyles();

    if (!previewStatUpdate) {
        return null;
    }

    const isNondeterministic = previewStatUpdate[0].nondeterministic;
    // Just show the first item, for abilities like Tribolt
    if (isNondeterministic) {
        previewStatUpdate = previewStatUpdate.slice(0, 1);
    }

    return (
        <div
            className={classNames(classes.statUpdatePreview, {
                nondeterministic: previewStatUpdate.some((p) => p.nondeterministic),
            })}
        >
            <div className={classes.previewIconContainer}>
                <Icon icon={CrossedSwordsIcon} size="sm" />
            </div>
            {previewStatUpdate.map((preview, i) => (
                <div className={classes.statUpdate} key={["statUpdate", i].join("-")}>
                    {preview.statUpdate.rawDamage || 0}
                    {preview.nondeterministic && "?"}
                </div>
            ))}
        </div>
    );
};

export default AbilityPreview;
