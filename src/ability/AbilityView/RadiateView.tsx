import { createUseStyles } from "react-jss";
import Area from "./AreaView";
import Debuffs from "./Debuffs";

const useStyles = createUseStyles({
    root: {
        margin: "4 0",
    },
    auraLabel: {
        fontWeight: "bold",
    },
});

const RadiateView = ({ ability, playerInfo, hand, deck, discard }) => {
    const classes = useStyles();
    const radiate = ability.actions.find(({ radiate }) => radiate)?.radiate;
    if (!radiate) {
        return null;
    }

    const { effects = [] } = radiate;

    return (
        <div className={classes.root}>
            <span className={classes.auraLabel}>Radiate</span>
            <Area ability={{ actions: [radiate] }} playerInfo={playerInfo} hand={hand} deck={deck} discard={discard} />
            <Debuffs effects={effects} />
        </div>
    );
};

export default RadiateView;
