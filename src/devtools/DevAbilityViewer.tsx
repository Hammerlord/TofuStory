import Button from "../view/Button";
import { useState } from "react";
import { createUseStyles } from "react-jss";
import { JOB_CARD_MAP } from "../ability";
import CardGrid from "../Menu/CardGrid";
import CardUpgradeGrid from "../Menu/CardUpgradeGrid";
import { PLAYER_CLASSES, SECONDARY_JOBS } from "../Menu/types";
import { shellThrow } from "../ability/neutralAbilities";

const useStyles = createUseStyles({
    class: {
        width: "175px",
        margin: "16px",
        background: "#666",
        padding: "24px",
        borderRadius: "8px",
        fontSize: "1rem",
        cursor: "pointer",

        "&.disabled": {
            opacity: 0.5,
            cursor: "default",
        },
    },
    viewer: {
        height: "85%",
        overflowY: "scroll",
    },
});

const DevAbilityViewer = ({ onClose }) => {
    const [selectedClass, setSelectedClass] = useState(PLAYER_CLASSES.WARRIOR);
    const [isViewingUpgrades, setIsViewingUpgrades] = useState(false);
    const classes = useStyles();

    const Grid = isViewingUpgrades ? CardUpgradeGrid : CardGrid;

    return (
        <div>
            <Button variant="contained" color="primary" onClick={() => setIsViewingUpgrades((prev) => !prev)}>
                Toggle upgrades {isViewingUpgrades ? "off" : "on"}
            </Button>
            <Button variant="contained" onClick={onClose}>
                Close
            </Button>
            <div className={classes.class} onClick={() => setSelectedClass(PLAYER_CLASSES.WARRIOR)}>
                {PLAYER_CLASSES.WARRIOR}
            </div>
            {selectedClass && (
                <div className={classes.viewer}>
                    <p>Neutral Cards</p>
                    <Grid cards={[shellThrow]} />
                    <hr />
                    <p>{selectedClass}</p>
                    <Grid cards={JOB_CARD_MAP[selectedClass]?.all || []} />
                    {Object.values(SECONDARY_JOBS[selectedClass])?.map((secondaryClass: string) => (
                        <div key={secondaryClass}>
                            <hr />
                            <p>{secondaryClass}</p>
                            <Grid cards={JOB_CARD_MAP[secondaryClass]?.all || []} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DevAbilityViewer;
