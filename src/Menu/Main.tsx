import { useState } from "react";
import { createUseStyles } from "react-jss";
import uuid from "uuid";
import { Ability } from "../ability/types";
import BattlefieldContainer from "../battle/BattleView";
import Rewards from "../battle/Rewards";
import JobUp from "../character/JobUp";
import { warmush } from "../images";
import { halfEatenHotdog } from "../item/items";
import { ITEM_TYPES } from "../item/types";
import Camp from "../Map/Camp";
import Map from "../Map/Map";
import { NODE_TYPES } from "../Map/types";
import ScenePlayer from "../scene/ScenePlayer";
import ClassSelection from "./ClassSelection";
import Header from "./Header";
import { PLAYER_CLASSES } from "./types";

const useStyles = createUseStyles({
    mapContainer: {
        zIndex: -1,
    },
    activityContainer: {
        position: "fixed",
        zIndex: 5,
        width: "100%",
        height: "100%",
        "& > *": {
            position: "fixed",
        },
    },
});

const Main = () => {
    const [player, setPlayer] = useState(null);
    const [deck, setDeck] = useState([]);
    const [scene, setScene] = useState(null);
    const [encounter, setEncounter] = useState(null);
    const [isResting, setIsResting] = useState(false);
    const [location, setLocation] = useState(-1);
    const [isSelectingSecondaryJob, setIsSelectingSecondaryJob] = useState(true);
    // TESTING: Allow selection of one reward at the start
    const [rewardsOpen, setRewardsOpen] = useState(true);
    const classes = useStyles();

    const handleSelectNode = (node, newLocation: number) => {
        setLocation(newLocation);
        if (node.type === NODE_TYPES.encounter) {
            setEncounter(node);
        } else {
            setIsResting(true);
        }
    };

    const handleBattleEnd = () => {
        setEncounter(null);
        setPlayer((prev) => ({
            ...prev,
            resources: 0,
            armor: 0,
            effects: [],
            turnHistory: [],
        }));
    };

    const handleSelectClass = (selectedClass: PLAYER_CLASSES, deck: Ability[]) => {
        setPlayer({
            id: uuid.v4(),
            class: selectedClass,
            secondaryClass: null,
            image: warmush,
            HP: 25,
            maxHP: 25,
            resourcesPerTurn: 3,
            maxResources: 3,
            resources: 3,
            armor: 0,
            effects: [],
            turnHistory: [],
            items: [halfEatenHotdog],
            isPlayer: true,
        });
        setDeck(deck);
    };

    const handleUseItem = (index: number) => {
        const newInventory = player.items.slice();
        const [item] = newInventory.splice(index, 1);
        if (item.type === ITEM_TYPES.CONSUMABLE) {
            const healing = item.HP || 0;
            setPlayer({
                ...player,
                HP: Math.min(player.maxHP, player.HP + healing),
                inventory: newInventory,
            });
        }
    };

    const handleOnSelectClass = ({ job, jobUpAbilities }) => {
        setDeck([...deck, ...jobUpAbilities]);
        setPlayer({
            ...player,
            secondaryClass: job,
        });
        setIsSelectingSecondaryJob(false);
    };

    if (!player) {
        return <ClassSelection onSelectClass={handleSelectClass} />;
    }

    const isActivityOpen = encounter || isResting || scene;

    return (
        <>
            {!isActivityOpen && (
                <div className={classes.mapContainer}>
                    <Map onSelectNode={handleSelectNode} currentLocation={location} playerImage={player.image} />
                    <Header player={player} deck={deck} onUseItem={handleUseItem} />
                </div>
            )}
            {isActivityOpen && (
                <div className={classes.activityContainer}>
                    {scene && (
                        <>
                            <ScenePlayer
                                scene={scene}
                                player={player}
                                updatePlayer={setPlayer}
                                onExit={() => setScene(null)}
                                onBattle={setEncounter}
                            />
                            <Header player={player} deck={deck} />
                        </>
                    )}
                    {encounter && (
                        <BattlefieldContainer
                            player={player}
                            updatePlayer={setPlayer}
                            onBattleEnd={handleBattleEnd}
                            waves={encounter.waves}
                            rewards={encounter.rewards}
                            initialDeck={deck}
                            onUpdateDeck={setDeck}
                        />
                    )}
                    {isResting && (
                        <>
                            <Camp
                                onExit={() => setIsResting(false)}
                                player={player}
                                deck={deck}
                                updateDeck={setDeck}
                                updatePlayer={setPlayer}
                            />
                            <Header player={player} deck={deck} onUseItem={handleUseItem} />
                        </>
                    )}
                </div>
            )}
            {isSelectingSecondaryJob && <JobUp player={player} onSelectClass={handleOnSelectClass} />}
            {!isSelectingSecondaryJob && rewardsOpen && (
                <Rewards deck={deck} player={player} updateDeck={setDeck} onClose={() => setRewardsOpen(false)} />
            )}
        </>
    );
};

export default Main;
