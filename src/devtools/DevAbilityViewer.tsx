import { useState } from "react";
import { createUseStyles } from "react-jss";
import * as uuid from "uuid";
import CardGrid from "../Menu/CardGrid";
import CardUpgradeGrid from "../Menu/CardUpgradeGrid";
import { PLAYER_CLASSES } from "../Menu/types";
import { JOB_CARD_MAP } from "../ability";
import { NEUTRAL_ABILITIES, shellThrow } from "../ability/neutralAbilities";
import Button from "../view/Button";
import { Ability, CombatAbility } from "../ability/types";
import { RARITIES } from "../item/types";
import { Box } from "@mui/material";

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

    const applyInstanceId = (cards?: Ability[]): CombatAbility[] => {
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

    const formatCards = (cards?: Ability[]): CombatAbility[] => {
        return applyInstanceId(cards).sort((a: Ability, b) => {
            return (rarityChart[a.rarity] || 0) - (rarityChart[b.rarity] || 0);
        });
    };

    const cardsByRarity: { [rarity: string]: Ability[] } = Object.values(RARITIES).reduce((acc, rarity: RARITIES) => {
        acc[rarity] = [];
        return acc;
    }, {});

    JOB_CARD_MAP[selectedClass]?.all?.forEach((card) => {
        if (JOB_CARD_MAP[selectedClass]?.starters.some((c) => c.name === card.name)) {
            cardsByRarity[RARITIES.STARTER].push(card);
            return;
        }
        cardsByRarity[card.rarity || RARITIES.COMMON].push(card);
    });

    return (
        <div>
            <Button variant="contained" color="primary" onClick={() => setIsViewingUpgrades((prev) => !prev)}>
                Toggle upgrades {isViewingUpgrades ? "off" : "on"}
            </Button>
            <Button variant="contained" onClick={onClose}>
                Close
            </Button>
            <div>
                {Object.values(PLAYER_CLASSES).map((className) => (
                    <div className={classes.class} onClick={() => setSelectedClass(className)}>
                        {className}
                    </div>
                ))}
            </div>
            {selectedClass && (
                <div className={classes.viewer}>
                    <p>Neutral Cards</p>
                    <Grid cards={formatCards(NEUTRAL_ABILITIES)} />
                    <hr />
                    <p>
                        {selectedClass} ({JOB_CARD_MAP[selectedClass]?.all.length})
                    </p>
                    {Object.entries(cardsByRarity).map(([rarity, cards]) => {
                        return (
                            <Box>
                                <p>
                                    {rarity} - {cards.length}
                                </p>
                                <Grid cards={cards} />
                            </Box>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default DevAbilityViewer;
