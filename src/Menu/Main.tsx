import { Button } from "@material-ui/core";
import { useState } from "react";
import { createUseStyles } from "react-jss";
import uuid from "uuid";
import { Ability } from "../ability/types";
import BattlefieldContainer from "../battle/BattleView";
import Rewards from "../battle/Rewards";
import { warmush } from "../images";
import Camp from "../Map/Camp";
import Map, { NODE_TYPES } from "../Map/Map";
import ClassSelection from "./ClassSelection";
import DeckViewer from "./DeckViewer";
import { PLAYER_CLASSES } from "./types";

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
    activityContainer: {
        position: "fixed",
        zIndex: 5,
        width: "100%",
        height: "100%",
    },
});

const Main = () => {
    const [player, setPlayer] = useState(null);
    const [deck, setDeck] = useState([]);
    const [encounter, setEncounter] = useState(null);
    const [isResting, setIsResting] = useState(false);
    const [isRewardsOpen, setIsRewardsOpen] = useState(false);
    const [isAbilitiesOpen, setIsAbilitiesOpen] = useState(false);
    const [location, setLocation] = useState(-1);
    const classes = useStyles();

    const handleSelectNode = (node, newLocation: number) => {
        setLocation(newLocation);
        if (node.type === NODE_TYPES.encounter) {
            setEncounter(node);
        } else {
            setIsResting(true);
        }
    };

    const handleBattleEnd = ({ loot, updatedPlayer }) => {
        setEncounter(null);
        // Obviously, only if we won
        setIsRewardsOpen(true);
        //setPlayer(updatedPlayer);
    };

    const handleSelectClass = (selectedClass: PLAYER_CLASSES, deck: Ability[]) => {
        setPlayer({
            id: uuid.v4(),
            class: selectedClass,
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
        setDeck(deck);
    };

    const handleUpdatePlayerHP = (newHP: number) => {
        setPlayer({
            ...player,
            HP: newHP < 0 ? 0 : newHP,
        });
    };

    if (!player) {
        return <ClassSelection onSelectClass={handleSelectClass} />;
    }

    const isActivityOpen = encounter || isRewardsOpen || isAbilitiesOpen || isResting;

    return (
        <>
            <div className={classes.mapContainer}>
                <Map onSelectNode={handleSelectNode} currentLocation={location} playerImage={player.image} />
            </div>
            {isActivityOpen && (
                <div className={classes.activityContainer}>
                    {encounter && (
                        <BattlefieldContainer
                            initialAllies={[null, null, player, null, null]}
                            onBattleEnd={handleBattleEnd}
                            waves={encounter.waves}
                            initialDeck={deck}
                            updatePlayerHP={handleUpdatePlayerHP}
                        />
                    )}
                    {isRewardsOpen && <Rewards deck={deck} updateDeck={setDeck} onClose={() => setIsRewardsOpen(false)} />}
                    {isResting && <Camp onExit={() => setIsResting(false)} player={player} deck={deck} updateDeck={setDeck} />}
                </div>
            )}
            <div className={classes.headerBar}>
                <img src={player.image} className={classes.playerPortrait} />{" "}
                <div className={classes.stats}>
                    {player.HP} / {player.maxHP} HP{" "}
                    <Button variant="contained" color="primary" onClick={() => setIsAbilitiesOpen((prev) => !prev)}>
                        {deck.length} abilities
                    </Button>
                </div>
                {isAbilitiesOpen && <DeckViewer deck={deck} onClose={() => setIsAbilitiesOpen(false)} />}
            </div>
        </>
    );
};

export default Main;
