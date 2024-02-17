import { EventScene, SCENE_CONDITION_TYPES } from "../types";
import WantedPoster from "./WantedPoster";

export const wantedPosterScene: EventScene = {
    id: "wanted-poster",
    conditions: [
        {
            type: SCENE_CONDITION_TYPES.INFAMY,
            comparator: "gt",
            value: 5,
        },
    ],
    repeatable: true,
    script: [
        {
            dialog: ["[You pass a sign with something stuck on it.]"],
            puzzle: WantedPoster,
        },
        {
            dialog: ["[You continue on.]"],
        },
    ],
};
