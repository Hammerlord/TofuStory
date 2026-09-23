import { useState } from "react";
import { createUseStyles } from "react-jss";
import AbilityView from "../ability/AbilityView/AbilityView";
import { isOffensiveAbility } from "../ability/AbilityView/utils";
import {
    ClickAwayListener,
    FormControlLabel,
    IconButton,
    Radio,
    RadioGroup,
    Typography,
} from "@mui/material";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import { CombatAbility } from "../ability/types";
import { RARITIES } from "../item/types";

const useStyles = createUseStyles({
    root: {
        background: "rgba(15, 15, 15, 0.9)",
        width: "calc(80vw)",
        height: "calc(80vh)",
        position: "absolute",
        top: "88px",
        zIndex: 5,
        borderRadius: "8px",
        padding: "24px",
        paddingTop: "0",
        left: "50%",
        transform: "translateX(-50%)",
        overflow: "auto",
        textAlign: "center",
    },
    abilityContainer: {
        margin: "16px",
        marginTop: "32px",
        display: "inline-block",
        verticalAlign: "top",
    },
    closeBar: {
        width: "100%",
        color: "white",
        fontWeight: 500,
        background: "none",
        border: "none",
        borderBottom: "1px solid rgba(255, 255, 255, 0.6)",
        paddingBottom: "16px",
        paddingTop: 24,
        fontSize: "1.1rem",
        fontFamily: "barlow",
        cursor: "pointer",
    },
    sortControls: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "8px",
        marginTop: "16px",
    },
});

type DeckSortType = "rarity" | "cost" | "type" | "level";
type SortDirection = "asc" | "desc";

const RARITY_ORDER = [RARITIES.STARTER, RARITIES.COMMON, RARITIES.UNCOMMON, RARITIES.RARE];

const getRarityRank = (ability: CombatAbility): number => {
    const rank = ability.rarity ? RARITY_ORDER.indexOf(ability.rarity) : -1;
    return rank === -1 ? RARITY_ORDER.indexOf(RARITIES.COMMON) : rank;
};

const getResourceCost = (ability: CombatAbility): number => {
    if (ability.resourceCost === "x") {
        return Infinity;
    }

    if (!ability.resourceCost) {
        return 0;
    }

    return ability.resourceCost;
};

const getAbilityTypeRank = (ability: CombatAbility): number => {
    if (ability.minion) {
        return 2;
    }

    if (isOffensiveAbility(ability)) {
        return 0;
    }

    return 1;
};

const DeckViewer = ({
    deck,
    onClose,
    onClickAbility = () => {},
}: {
    deck: CombatAbility[];
    onClose: () => void;
    onClickAbility?: (card: CombatAbility) => void;
}) => {
    const classes = useStyles();
    const [sortBy, setSortBy] = useState<DeckSortType>("cost");
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

    const sortedDeck = deck.slice().sort((a, b) => {
        let comparison = 0;
        switch (sortBy) {
            case "rarity":
                comparison = getRarityRank(a) - getRarityRank(b);
                break;
            case "cost":
                comparison = getResourceCost(a) - getResourceCost(b);
                break;
            case "type":
                comparison = getAbilityTypeRank(a) - getAbilityTypeRank(b);
                break;
            case "level":
                comparison = (a.level || 1) - (b.level || 1);
                break;
        }

        return sortDirection === "asc" ? comparison : -comparison;
    });

    return (
        <ClickAwayListener onClickAway={onClose}>
            <div className={classes.root}>
                <button className={classes.closeBar} onClick={onClose}>
                    Close
                </button>
                <div className={classes.sortControls}>
                    <RadioGroup
                        row
                        value={sortBy}
                        onChange={(event) => setSortBy(event.target.value as DeckSortType)}
                    >
                        <Typography
                            component="span"
                            sx={{
                                mr: 2,
                                color: "white",
                                verticalAlign: "bottom",
                                lineHeight: 2.5,
                                fontWeight: "bold",
                            }}
                        >
                            Sort by:
                        </Typography>
                        <FormControlLabel
                            value="rarity"
                            control={
                                <Radio
                                    size="small"
                                    sx={{
                                        color: "rgba(255, 255, 255, 0.7)",
                                        "&.Mui-checked": { color: "#02c7f4" },
                                    }}
                                />
                            }
                            label="Rarity"
                            sx={{ color: sortBy === "rarity" ? "#02c7f4" : "white" }}
                        />
                        <FormControlLabel
                            value="cost"
                            control={
                                <Radio
                                    size="small"
                                    sx={{
                                        color: "rgba(255, 255, 255, 0.7)",
                                        "&.Mui-checked": { color: "#02c7f4" },
                                    }}
                                />
                            }
                            label="Cost"
                            sx={{ color: sortBy === "cost" ? "#02c7f4" : "white" }}
                        />
                        <FormControlLabel
                            value="type"
                            control={
                                <Radio
                                    size="small"
                                    sx={{
                                        color: "rgba(255, 255, 255, 0.7)",
                                        "&.Mui-checked": { color: "#02c7f4" },
                                    }}
                                />
                            }
                            label="Type"
                            sx={{ color: sortBy === "type" ? "#02c7f4" : "white" }}
                        />
                        <FormControlLabel
                            value="level"
                            control={
                                <Radio
                                    size="small"
                                    sx={{
                                        color: "rgba(255, 255, 255, 0.7)",
                                        "&.Mui-checked": { color: "#02c7f4" },
                                    }}
                                />
                            }
                            label="Level"
                            sx={{ color: sortBy === "level" ? "#02c7f4" : "white" }}
                        />
                    </RadioGroup>
                    <IconButton
                        onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
                        title={sortDirection === "asc" ? "Ascending" : "Descending"}
                        aria-label={sortDirection === "asc" ? "Ascending" : "Descending"}
                        size="small"
                        sx={{ color: "white" }}
                    >
                        {sortDirection === "asc" ? (
                            <ArrowUpwardIcon fontSize="small" />
                        ) : (
                            <ArrowDownwardIcon fontSize="small" />
                        )}
                    </IconButton>
                </div>
                {sortedDeck.map((card: CombatAbility) => (
                    <div className={classes.abilityContainer} key={card.instanceId}>
                        <AbilityView
                            ability={card}
                            disableGlow={true}
                            disableBattleBonuses={true}
                            onClick={() => onClickAbility(card)}
                        />
                    </div>
                ))}
            </div>
        </ClickAwayListener>
    );
};

export default DeckViewer;
