import { useState } from "react";
import {
    anger,
    bash,
    block,
    bloodthirst,
    charge,
    cleave,
    rampage,
    rend,
    shieldStrike,
    slam,
} from "./ability/Abilities";
import BattleView from "./battle/BattleView";
import { createUseStyles } from "react-jss";
import uuid from "uuid";

enum PLAYER_STATE {
    CLASS_SELECTION = 0,
    ACTIVITY_MENU = 1,
    BATTLE = 2,
}

const useStyles = createUseStyles({
    app: {
        fontFamily: "Barlow, Arial",
        "& button": {
            fontFamily: "Barlow, Arial",
            cursor: "pointer",
            "&:active": {
                transform: "translateX(1px) translateY(1px)",
                transition: "transform 0.2s",
            },
        },
    },
});

export const App = () => {
    const classes = useStyles();
    const [player, setPlayer] = useState({
        id: uuid.v4(),
        deck: [
            cleave,
            cleave,
            charge,
            bash,
            bash,
            bash,
            slam,
            slam,
            anger,
            rampage,
            shieldStrike,
            block,
            block,
            rend,
            rend,
            bloodthirst,
        ],
        HP: 25,
        maxHP: 25,
        resources: 0,
        resourcesPerTurn: 3,
        maxResources: 10,
        armor: 0,
        effects: [],
    });
    const [playerState, setPlayerState] = useState(PLAYER_STATE.ACTIVITY_MENU);
    const updatePlayer = (updatedPlayer) => {
        setPlayer({
            ...player,
            ...updatedPlayer,
        });
    };

    return (
        <div className={classes.app}>
            <BattleView player={player} />
        </div>
    );
};
