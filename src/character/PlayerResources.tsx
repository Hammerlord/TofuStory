import { ResourceIcon } from "../ability/AbilityView/ResourceIcon";
import { Fury } from "../resource/ResourcesView";
import Tooltip from "../view/Tooltip";
import { Combatant } from "./types";

const PlayerResources = ({ player }: { player: any }) => {
    const tooltipContents = (
        <div>
            {player.resources} / {player.maxResources} <ResourceIcon size="sm" playerClass={player.class} /> <br />
            Gaining a baseline <ResourceIcon text={player.resourcesPerTurn} size="sm" playerClass={player.class} /> per turn.
            <hr />
            These are your current resources. Abilities often cost resources in order to be used.
        </div>
    );
    return (
        <Tooltip title={tooltipContents}>
            <span>
                <ResourceIcon text={player.resources} size="lg" playerClass={player.class} />
            </span>
        </Tooltip>
    );
};

export default PlayerResources;
