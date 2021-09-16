import { useState } from "react";
import { createUseStyles } from "react-jss";
import uuid from "uuid";
import { Ability } from "../ability/types";
import BattlefieldContainer from "../battle/BattleView";
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
    const [inventory, setInventory] = useState([halfEatenHotdog]);
    const [scene, setScene] = useState(null);
    const [encounter, setEncounter] = useState(null);
    const [isResting, setIsResting] = useState(false);
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

    const handleBattleEnd = () => {
        setEncounter(null);
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

    const handleUseItem = (index: number) => {
        const newInventory = inventory.slice();
        const [item] = newInventory.splice(index, 1);
        if (item.type === ITEM_TYPES.CONSUMABLE) {
            const healing = item.HP || 0;
            setPlayer({
                ...player,
                HP: Math.min(player.maxHP, player.HP + healing),
            });
        }
        setInventory(newInventory);
    };

    if (!player) {
        return <ClassSelection onSelectClass={handleSelectClass} />;
    }

    const isActivityOpen = encounter || isResting || scene;

    return (
        <>
            <div className={classes.mapContainer}>
                <Map onSelectNode={handleSelectNode} currentLocation={location} playerImage={player.image} />
            </div>
            {isActivityOpen && (
                <div className={classes.activityContainer}>
                    {scene && (
                        <ScenePlayer
                            scene={scene}
                            player={player}
                            onExit={() => setScene(null)}
                            inventory={inventory}
                            updateInventory={setInventory}
                            onBattle={setEncounter}
                        />
                    )}
                    {encounter && (
                        <BattlefieldContainer
                            initialAllies={[null, null, player, null, null]}
                            onBattleEnd={handleBattleEnd}
                            waves={encounter.waves}
                            rewards={encounter.rewards}
                            initialDeck={deck}
                            onUpdateDeck={setDeck}
                            updatePlayerHP={handleUpdatePlayerHP}
                        />
                    )}
                    {isResting && (
                        <Camp
                            onExit={() => setIsResting(false)}
                            player={player}
                            deck={deck}
                            updateDeck={setDeck}
                            updatePlayer={setPlayer}
                        />
                    )}
                </div>
            )}
            <Header inventory={inventory} player={player} deck={deck} onUseItem={handleUseItem} />
        </>
    );
};

export default Main;
