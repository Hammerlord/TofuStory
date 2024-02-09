import { useState } from "react";
import { createUseStyles } from "react-jss";
import uuid from "uuid";
import CardGrid from "../Menu/CardGrid";
import CardUpgradeGrid from "../Menu/CardUpgradeGrid";
import { PLAYER_CLASSES, SECONDARY_JOBS } from "../Menu/types";
import { JOB_CARD_MAP } from "../ability";
import { shellThrow } from "../ability/neutralAbilities";
import Button from "../view/Button";
import { Ability, HandAbility } from "../ability/types";
import { RARITIES } from "../item/types";

const useStyles = createUseStyles({
    class: {
        width: "175px",
        margin: "16px",
        background: "#666",
        padding: "24px",
        borderRadius: "8px",
        fontSize: "1rem",
        cursor: "pointer",
        display: "inline-block",

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

    const applyInstanceId = (cards?: Ability[]): HandAbility[] => {
        if (!cards) {
            return [];
        }

        return cards.map((card) => ({ ...card, instanceId: uuid.v4() }));
    };

    const rarityChart = {
        [RARITIES.COMMON]: 1,
        [RARITIES.UNCOMMON]: 2,
        [RARITIES.RARE]: 3,
    };

    const formatCards = (cards?: Ability[]): HandAbility[] => {
        return applyInstanceId(cards).sort((a: Ability, b) => {
            return (rarityChart[a.rarity] || 0) - (rarityChart[b.rarity] || 0);
        });
    };
    return (
        <div>
            <Button variant="contained" color="primary" onClick={() => setIsViewingUpgrades((prev) => !prev)}>
                Toggle upgrades {isViewingUpgrades ? "off" : "on"}
            </Button>
            <Button variant="contained" onClick={onClose}>
                Close
            </Button>
            <div>
                <div className={classes.class} onClick={() => setSelectedClass(PLAYER_CLASSES.WARRIOR)}>
                    {PLAYER_CLASSES.WARRIOR}
                </div>
                <div className={classes.class} onClick={() => setSelectedClass(PLAYER_CLASSES.MAGICIAN)}>
                    {PLAYER_CLASSES.MAGICIAN}
                </div>
            </div>
            {selectedClass && (
                <div className={classes.viewer}>
                    <p>Neutral Cards</p>
                    <Grid cards={formatCards([shellThrow])} />
                    <hr />
                    <p>
                        {selectedClass} ({JOB_CARD_MAP[selectedClass]?.all.length})
                    </p>
                    <Grid cards={formatCards(JOB_CARD_MAP[selectedClass]?.all)} />
                    {Object.values(SECONDARY_JOBS[selectedClass])?.map((secondaryClass: string) => (
                        <div key={secondaryClass}>
                            <hr />
                            <p>{secondaryClass}</p>
                            <Grid cards={formatCards(JOB_CARD_MAP[secondaryClass]?.all)} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DevAbilityViewer;
