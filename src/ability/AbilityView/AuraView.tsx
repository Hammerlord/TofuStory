import { createUseStyles } from "react-jss";
import Icon from "../../icon/Icon";
import { CrossedSwordsIcon, FireworksIcon, HeartIcon, ShieldIcon } from "../../images/icons";
import { Aura } from "../types";

const useStyles = createUseStyles({
    root: {
        border: "1px solid rgba(0, 0, 0, 0.2)",
        borderRadius: "4px",
        paddingTop: "12px",
        marginTop: "16px",
        paddingBottom: "8px",
        width: "calc(100% - 2px)", // Minus borders
        position: "relative",
    },
    auraLabel: {
        position: "absolute",
        top: "0",
        left: "50%",
        transform: "translateX(-50%) translateY(-50%)",
        background: "rgba(0, 0, 0, 0.5)",
        color: "white",
        border: "1px solid rgba(0, 0, 0, 0.1)",
        padding: "2px 6px",
        borderRadius: "4px",
        fontSize: "0.7rem",
    },
});

const AuraView = ({ aura }: { aura: Aura }) => {
    const classes = useStyles();
    if (!aura) {
        return null;
    }

    const { attackPower: damage = 0, onTurnStart } = aura;
    const { healing = 0, armor = 0 } = onTurnStart || {};

    return (
        <div className={classes.root}>
            <span className={classes.auraLabel}>
                <Icon icon={<FireworksIcon />} size="sm" /> Aura
            </span>
            {damage > 0 && (
                <div>
                    Gain <Icon icon={<CrossedSwordsIcon />} text={damage} />
                </div>
            )}
            {healing > 0 && (
                <div>
                    Gain <Icon icon={<HeartIcon />} text={healing} /> per turn
                </div>
            )}
            {armor > 0 && (
                <div>
                    Gain <Icon icon={<ShieldIcon />} text={armor} /> per turn
                </div>
            )}
        </div>
    );
};

export default AuraView;
