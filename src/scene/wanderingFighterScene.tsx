import classNames from "classnames";
import { createUseStyles } from "react-jss";
import { BATTLE_TYPES } from "../battle/types";
import { martialArtist } from "../enemy/martialArtist";
import { HenesysHuntingGroundImage } from "../images";
import { SCENE_STYLES } from "./constants";
import { EventScene, SCENE_CONDITION_TYPES, SceneEncounter } from "./types";

const fight: SceneEncounter = {
    waves: [
        {
            enemies: [null, null, martialArtist, null, null],
        },
    ],
    type: BATTLE_TYPES.BOSS,
    backgroundMusic: "https://maplestory.io/api/GMS/210.1.1/music/BgmCN/DragonTigerDungeon",
};

const useStyles = createUseStyles({
    ...SCENE_STYLES,
    player: {
        ...SCENE_STYLES.player,
        top: 298,
        left: 377,
    },
    other: {
        top: 276,
        left: 500,
    },
});

const WanderingFighterBackdrop = ({ player }) => {
    const classes = useStyles();
    return (
        <div>
            <img src={HenesysHuntingGroundImage} alt="Henesys Hunting Ground" className={classes.backdrop} />
            <img src={martialArtist.image} alt="Fighter" className={classNames(classes.character, classes.other)} />
            <img src={player.image} alt="Player" className={classNames(classes.character, classes.player)} />
        </div>
    );
};

export const wanderingFighterScene: EventScene = {
    conditions: [
        {
            type: SCENE_CONDITION_TYPES.INFAMY,
            comparator: "gt",
            value: 7,
        },
    ],
    id: "wandering-fighter",
    script: [
        {
            scene: WanderingFighterBackdrop,
            speaker: martialArtist,
            dialog: ["You there! I sense your aura... It speaks to me of great misdeeds. Yes, you look like a worthy opponent."],
        },
        {
            scene: WanderingFighterBackdrop,
            speaker: martialArtist,
            dialog: ["I've been waiting for an opportunity like this. Face me!"],
            responses: [
                {
                    text: "Defend yourself.",
                    encounter: fight,
                    infamy: 3,
                },
            ],
        },
    ],
};
