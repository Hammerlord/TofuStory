import { createUseStyles } from "react-jss";
import Area from "./AreaView";
import Debuffs from "./Debuffs";

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

const RadiateView = ({ ability }) => {
    const classes = useStyles();
    const radiate = ability.actions.find(({ radiate }) => radiate)?.radiate;
    if (!radiate) {
        return null;
    }

    const { damage = 0, secondaryDamage = 0, area, effects = [] } = radiate;

    return (
        <div className={classes.root}>
            <span className={classes.auraLabel}>Radiate</span>
            <Area area={area} damage={damage} secondaryDamage={secondaryDamage} />
            <Debuffs effects={effects} />
        </div>
    );
};

export default RadiateView;
