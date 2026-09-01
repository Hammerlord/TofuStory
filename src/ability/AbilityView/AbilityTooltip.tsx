import { createUseStyles } from "react-jss";
import { KeywordsTooltips, TooltipSection } from "../../view/KeywordsTooltip";
import { fireSpirit } from "../magician/magicianAbilities";
import { Ability, ActionSummon } from "../types";
import { soulBlade } from "../warrior/warriorAbilities";
import AbilityView from "./AbilityView";
import { chargingStone } from "../../item/starterItems";
import { Tooltip } from "@mui/material";
import { ReactElement, useMemo } from "react";
import { GREEN } from "./constants";
import classNames from "classnames";
import { getCardsTooltipConfig } from "../../view/tooltipUtils";

const useTooltipStyles = createUseStyles({
    tooltip: {
        "&&": {
            maxWidth: "400px",
            background: "none",
            minHeight: "200px",
        },
    },
    container: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
    },
    cards: {
        display: "flex",
        background: "rgba(25, 25, 25, 0.9)",
        borderRadius: "8px",
        padding: "16px",
        marginBottom: 8,
        "& > .card-container:not(:last-child)": {
            marginRight: 8,
        },
    },
    diamond: {
        width: "24px",
        height: "24px",
        transform: "rotate(45deg)",
        display: "inline-block",
    },

    minion: {
        background: GREEN,
    },
});

const AbilityTooltip = ({ ability, children }: { ability: Ability; children: ReactElement }) => {
    const classes = useTooltipStyles();

    const tooltips = [];

    const stringified = useMemo(() => JSON.stringify(ability), [ability]);

    if (ability.tooltip) {
        const { title, description, icon } = ability.tooltip;
        tooltips.push(<TooltipSection title={title} description={description} icon={icon} key={title} />);
    }

    if (ability.overrideTooltip) {
        return (
            <Tooltip
                title={tooltips}
                placement={"right-end"}
                classes={{ tooltip: classes.tooltip }}
                enterDelay={500}
                disableInteractive={true}
            >
                {children}
            </Tooltip>
        );
    }

    if (stringified.includes('"Charged"')) {
        // exclude Charged Shot (Bowman ability)
        const chargedTooltip = {
            title: "Charged Ability",
            icon: chargingStone.image,
            description: "Consumes Charged for a bonus.",
        };
        tooltips.push(<TooltipSection {...chargedTooltip} key={chargedTooltip.title} />);
    }

    const cardsToAddMap = getCardsTooltipConfig(ability);

    const minionTooltip = ability.tooltip?.minion;
    if (minionTooltip) {
        const minionCardDisplay = {
            name: minionTooltip.name,
            description: minionTooltip.description,
            minion: minionTooltip,
            actions: [],
            overrideBodyText: true,
        };
        cardsToAddMap[minionTooltip.name] = minionCardDisplay;
    }

    const cardsToAdd = Object.values(cardsToAddMap);
    if (cardsToAdd.length > 0) {
        tooltips.push(
            <div className={classes.cards} key={"cards"}>
                {cardsToAdd.map((card: Ability, i) => (
                    <div className={"card-container"} key={[card.name, i].join("-")}>
                        <AbilityView ability={card} />
                    </div>
                ))}
            </div>
        );
    }

    if (ability.minion || stringified.includes("summon")) {
        const diamond = <span className={classNames(classes.diamond, classes.minion)} />;
        tooltips.push(
            <TooltipSection
                title={"Summon"}
                description={
                    "A minion fights alongside you. Most minions auto-attack at the end of your turn. Each Summon card can only be played once per battle."
                }
                icon={diamond}
                key="summon"
            />
        );
    }

    tooltips.push(<KeywordsTooltips object={ability} key={"keywords-tooltips"} />);

    return (
        <Tooltip title={tooltips} placement={"right-end"} classes={{ tooltip: classes.tooltip }} enterDelay={500} disableInteractive={true}>
            {children}
        </Tooltip>
    );
};

export default AbilityTooltip;
