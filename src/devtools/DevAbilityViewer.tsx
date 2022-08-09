import { Button } from "@material-ui/core";
import { useState } from "react";
import { createUseStyles } from "react-jss";
import { JOB_CARD_MAP } from "../ability";
import CardGrid from "../Menu/CardGrid";
import { PLAYER_CLASSES, SECONDARY_JOBS } from "../Menu/types";

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
});

const DevAbilityViewer = ({ onClose }) => {
    const [selectedClass, setSelectedClass] = useState(null);
    const classes = useStyles();

    return (
        <div>
            <Button variant="contained" onClick={onClose}>
                Close
            </Button>
            <div className={classes.class} onClick={() => setSelectedClass(PLAYER_CLASSES.WARRIOR)}>
                {PLAYER_CLASSES.WARRIOR}
            </div>
            {selectedClass && (
                <div>
                    <p>{selectedClass}</p>
                    <CardGrid cards={JOB_CARD_MAP[selectedClass]?.all || []} />
                    {Object.values(SECONDARY_JOBS[selectedClass])?.map((secondaryClass: string) => (
                        <div>
                            <hr />
                            <p>{secondaryClass}</p>
                            <CardGrid cards={JOB_CARD_MAP[secondaryClass]?.all || []} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DevAbilityViewer;
