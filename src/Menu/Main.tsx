import { useState } from "react";
import { warmush } from "../images";
import uuid from "uuid";
import { bash, block, slam, slashBlast, warLeap } from "../ability/Abilities";
import BattlefieldContainer from "../battle/BattleView";
import Rewards from "../battle/Rewards";
import Map from "../Map/Map";
import { Button } from "@material-ui/core";
import DeckViewer from "./DeckViewer";
import { createUseStyles } from "react-jss";

enum PLAYER_STATE {
    CLASS_SELECTION = 0,
    ACTIVITY_MENU = 1,
    EDIT_DECK = 2,
    BATTLE = 3,
}

enum PLAYER_CLASSES {
    WARRIOR = "Warrior",
}

const warriorStarterDeck = [bash, bash, bash, warLeap, slashBlast, slashBlast, slam, block, block, block];

const useStyles = createUseStyles({
    headerBar: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: "1000",
        background: "rgba(0, 0, 0, 0.7)",
        padding: "8px 32px",
        height: "56px",
        color: "white",
        fontWeight: 500,
        display: "flex",
    },
    playerPortrait: {
        maxHeight: "100%",
        marginRight: "32px",
    },
    stats: {
        lineHeight: "56px",
    },
    mapContainer: {
        zIndex: -1,
    },
});

const Main = () => {
    const [player, setPlayer] = useState({
        id: uuid.v4(),
        class: PLAYER_CLASSES.WARRIOR,
        image: warmush,
        HP: 20,
        maxHP: 20,
        resourcesPerTurn: 3,
        maxResources: 3,
        armor: 0,
        effects: [],
        turnHistory: [],
        isPlayer: true,
    });
    const [deck, setDeck] = useState(warriorStarterDeck);
    const [challenge, setChallenge] = useState(null);
    const [isRewardsOpen, setIsRewardsOpen] = useState(false);
    const [isAbilitiesOpen, setIsAbilitiesOpen] = useState(false);
    const classes = useStyles();

    const handleClickNode = (location, event) => {};

    const handleBattleEnd = ({ loot, updatedPlayer }) => {
        setChallenge(null);
        // Obviously, only if we won
        setIsRewardsOpen(true);
        //setPlayer(updatedPlayer);
    };

    return (
        <>
            <div className={classes.mapContainer}>
                <Map />
            </div>
            {challenge && (
                <BattlefieldContainer
                    initialAllies={[null, null, player, null, null]}
                    onBattleEnd={handleBattleEnd}
                    waves={challenge.waves}
                    initialDeck={deck}
                />
            )}
            {isRewardsOpen && <Rewards deck={deck} updateDeck={setDeck} onClose={() => setIsRewardsOpen(false)} />}
            {isAbilitiesOpen && <DeckViewer deck={deck} onClose={() => setIsAbilitiesOpen(false)} />}
            <div className={classes.headerBar}>
                <img src={player.image} className={classes.playerPortrait} />{" "}
                <div className={classes.stats}>
                    {player.HP} / {player.maxHP} HP{" "}
                    <Button variant="contained" color="primary" onClick={() => setIsAbilitiesOpen((prev) => !prev)}>
                        {deck.length} abilities
                    </Button>
                </div>
            </div>
        </>
    );
};

export default Main;
