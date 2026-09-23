import { useMemo, useState } from "react";
import { createUseStyles } from "react-jss";
import { FormControlLabel, IconButton, Radio, RadioGroup, Typography } from "@mui/material";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import { isOffensiveAbility } from "../ability/AbilityView/utils";
import { CombatAbility } from "../ability/types";
import { RARITIES } from "../item/types";

const useStyles = createUseStyles({
    sortControls: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "8px",
    },
});

export type CardSortType = "rarity" | "cost" | "type" | "level";
export type SortDirection = "asc" | "desc";

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

export const sortCards = (
    cards: CombatAbility[],
    sortBy: CardSortType,
    sortDirection: SortDirection,
): CombatAbility[] => {
    return cards.slice().sort((a, b) => {
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
};

/**
 * Local sort state (wiped when the owning component unmounts) plus the sorted card list.
 */
export const useCardSort = (cards: CombatAbility[]) => {
    const [sortBy, setSortBy] = useState<CardSortType>("cost");
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

    const toggleSortDirection = () => setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));

    const sortedCards = useMemo(
        () => sortCards(cards, sortBy, sortDirection),
        [cards, sortBy, sortDirection],
    );

    return { sortedCards, sortBy, setSortBy, sortDirection, toggleSortDirection };
};

const SORT_OPTIONS: { value: CardSortType; label: string }[] = [
    { value: "rarity", label: "Rarity" },
    { value: "cost", label: "Cost" },
    { value: "type", label: "Type" },
    { value: "level", label: "Level" },
];

const CardSortControls = ({
    sortBy,
    onSortByChange,
    sortDirection,
    onSortDirectionChange,
}: {
    sortBy: CardSortType;
    onSortByChange: (sortBy: CardSortType) => void;
    sortDirection: SortDirection;
    onSortDirectionChange: () => void;
}) => {
    const classes = useStyles();

    return (
        <div className={classes.sortControls}>
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
            <RadioGroup
                row
                value={sortBy}
                onChange={(event) => onSortByChange(event.target.value as CardSortType)}
            >
                {SORT_OPTIONS.map(({ value, label }) => (
                    <FormControlLabel
                        key={value}
                        value={value}
                        control={
                            <Radio
                                size="small"
                                sx={{
                                    color: "rgba(255, 255, 255, 0.7)",
                                    "&.Mui-checked": { color: "#02c7f4" },
                                }}
                            />
                        }
                        label={label}
                        sx={{ color: sortBy === value ? "#02c7f4" : "white" }}
                    />
                ))}
            </RadioGroup>
            <IconButton
                onClick={onSortDirectionChange}
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
    );
};

export default CardSortControls;
