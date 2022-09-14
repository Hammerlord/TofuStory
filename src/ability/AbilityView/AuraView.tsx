import { createUseStyles } from "react-jss";
import Icon from "../../icon/Icon";
import { CrossedSwords, Fireworks, Heart, Shield } from "../../images";
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

    const { damage = 0, onTurnStart } = aura;
    const { healing = 0, armor = 0 } = onTurnStart?.effectOwner || {};

    return (
        <div className={classes.root}>
            <span className={classes.auraLabel}>
                <Icon icon={<Fireworks />} size="sm" /> Aura
            </span>
            {damage > 0 && (
                <div>
                    Gain <Icon icon={<CrossedSwords />} text={damage} />
                </div>
            )}
            {healing > 0 && (
                <div>
                    Gain <Icon icon={<Heart />} text={healing} /> per turn
                </div>
            )}
            {armor > 0 && (
                <div>
                    Gain <Icon icon={<Shield />} text={armor} /> per turn
                </div>
            )}
        </div>
    );
};

export default AuraView;
