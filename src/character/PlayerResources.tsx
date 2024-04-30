import { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
import { ResourceIcon } from "../ability/AbilityView/ResourceIcon";
import Tooltip from "../view/Tooltip";
import { Player } from "./types";
import { resourceClassNameMap } from "../ability/AbilityView/constants";
import { getMaxResources } from "../battle/utils";

const useStyles = createUseStyles({
    "@keyframes animation": {
        "0%": {
            transform: "translateY(-25px)",
            opacity: 0.75,
        },
        "50%": {
            transform: "translateY(-50px)",
            opacity: 0.75,
        },
        "100%": {
            transform: "translateY(-50px)",
            opacity: 0,
        },
    },
    resourceGainText: {
        position: "absolute",
        animationName: "$animation",
        animationDuration: "1s",
        zIndex: "3",
        color: "white",
        textShadow: Array.from({ length: 10 })
            .map(() => "0 0 3px black")
            .join(", "),
        fontSize: "24px",
        fontWeight: "bold",
        left: 4,
        bottom: 0,
    },
    maxResources: {
        color: "white",
        textShadow: Array.from({ length: 10 })
            .map(() => "0 0 3px black")
            .join(", "),
        fontSize: "15px",
        right: -1,
        bottom: -1,
        position: "absolute",
    },
    bold: {
        fontWeight: "bold",
    },
});

const PlayerResources = ({ player }: { player: Player }) => {
    const [oldResources, setOldResources] = useState(player.resources);
    const classes = useStyles();

    useEffect(() => {
        const timeout = setTimeout(() => {
            setOldResources(player.resources);
        }, 1000);

        return () => {
            clearTimeout(timeout);
            setOldResources(player.resources);
        };
    }, [player.resources]);

    const maxResources = getMaxResources(player);

    const resourceElement = <ResourceIcon size="sm" playerClass={player.class} />;

    const tooltipContents = (
        <div>
            {player.resources} / {maxResources} {resourceElement} {resourceClassNameMap[player.class]} <br />
            Restoring up to {player.resourcesPerTurn}
            {resourceElement} per turn.
            <hr />
            {resourceElement} gained from effects can go over the cap, but the excess will be lost at turn end.
        </div>
    );
    return (
        <Tooltip title={tooltipContents}>
            <div>
                <ResourceIcon text={player.resources} size="lg" playerClass={player.class} />
                {player.resources > oldResources && <span className={classes.resourceGainText}>+{player.resources - oldResources}</span>}
                <span className={classes.maxResources}>
                    /<span className={classes.bold}>{maxResources}</span>
                </span>
            </div>
        </Tooltip>
    );
};

export default PlayerResources;
