import { Fury } from "../resource/ResourcesView";
import Tooltip from "../view/Tooltip";
import { Combatant } from "./types";

const PlayerResources = ({ player }: { player: Combatant }) => {
    const tooltipContents = (
        <div>
            Your current resources. Abilities often cost resources in order to be used. <hr />
            Gaining a baseline <Fury text={player.resourcesPerTurn} /> per turn.
        </div>
    );
    return (
        <Tooltip title={tooltipContents}>
            <span>
                <Fury text={player.resources} size="lg" />
            </span>
        </Tooltip>
    );
};

export default PlayerResources;
