import classNames from "classnames";
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
import KerningCity from "../Map/KerningCity";
import Map from "../Map/Map";
import { NODE_TYPES } from "../Map/types";
import ScenePlayer from "../scene/ScenePlayer";
import { NPC } from "../scene/types";
import ClassSelection from "./ClassSelection";
import Header from "./Header";
import Shop from "./Shop";
import { NPCTracker, PLAYER_CLASSES } from "./types";

const TRANSITION_TIME = 0.25; // Seconds

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
    "@keyframes fadeIn": {
        "0%": {
            opacity: 0,
        },
        "100%": {
            opacity: 1,
        },
    },
    "@keyframes fadeOut": {
        "0%": {
            opacity: 1,
        },
        "100%": {
            opacity: 0,
        },
    },
    transitionOverlay: {
        width: "100%",
        height: "100%",
        background: "rgba(25, 25, 25, 1)",
        position: "fixed",
        left: 0,
        top: 0,
        pointerEvents: "none",
        zIndex: "1000",
        opacity: 0,
        "&.show": {
            animationName: "$fadeIn",
            animationDuration: `${TRANSITION_TIME}s`,
            pointerEvents: "auto",
            animationTimingFunction: "ease-in",
            animationFillMode: "forwards",
        },
        "&.hide": {
            animationName: "$fadeOut",
            animationDuration: `${TRANSITION_TIME}s`,
            pointerEvents: "none",
        },
    },
});

const Main = () => {
    const [player, setPlayer] = useState(null);
    const [deck, setDeck] = useState([]);
    const [scene, setScene] = useState(null);
    const [encounter, setEncounter] = useState(null);
    const [encounterVictoryCallback, setEncounterVictoryCallback] = useState(null);
    const [isResting, setIsResting] = useState(false);
    const [location, setLocation] = useState(-1);
    const [isSelectingSecondaryJob, setIsSelectingSecondaryJob] = useState(true);
    // TESTING: Allow selection of one reward at the start
    const [rewardsOpen, setRewardsOpen] = useState(false);
    const [shop, setShop] = useState(null);
    const [visitedNPCs, setVisitedNPCs] = useState({});
    const [showTransitionOverlay, setShowTransitionOverlay] = useState(null);
    const classes = useStyles();

    const handleShopNode = ({ npc }: { npc: NPC }) => {
        const { character, scenes } = npc;
        const visited = visitedNPCs[character] as NPCTracker;
        if (!visited) {
            setScene(scenes.intro);
            setVisitedNPCs((prev) => ({
                ...prev,
                [character]: {
                    ...prev[character],
                    spoken: 1,
                },
            }));
            return;
        }

        // @ts-ignore - Using defaults if it doesn't exist
        const { spoken = 0, fought = 0, helped = 0 } = visited || {}; //TODO
        if (fought > 0) {
            setScene(scenes.fought);
            return;
        }

        setScene(scenes.notorious);
    };

    const handleTransition = (callback: Function = () => {}) => {
        setShowTransitionOverlay(true);
        setTimeout(() => {
            callback();
            setTimeout(() => {
                setShowTransitionOverlay(false);
            }, TRANSITION_TIME * 1000);
        }, TRANSITION_TIME * 1000);
    };

    const handleSelectNode = (node, newLocation: number) => {
        const callback = () => {
            setLocation(newLocation);
            if (node.type === NODE_TYPES.ENCOUNTER) {
                setEncounter(node);
            } else if (node.type === NODE_TYPES.SHOP) {
                handleShopNode(node);
            } else {
                setIsResting(true);
            }
        };
        handleTransition(callback);
    };

    const handleBattleEnd = () => {
        const callback = () => {
            if (encounterVictoryCallback) {
                encounterVictoryCallback();
                setEncounterVictoryCallback(null);
            }

            setEncounter(null);
            setPlayer((prev) => ({
                ...prev,
                resources: 0,
                armor: 0,
                effects: [],
                turnHistory: [],
            }));
        };
        handleTransition(callback);
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

    const handleJobUp = ({ job, jobUpAbilities }) => {
        setDeck([...deck, ...jobUpAbilities]);
        setPlayer({
            ...player,
            secondaryClass: job,
        });
        setIsSelectingSecondaryJob(false);
    };

    const handleSceneBattle = (encounter, onVictory: Function) => {
        const callback = () => {
            const { characters = [], ...other } = encounter;
            setEncounter(other);
            setEncounterVictoryCallback(() => onVictory);
            const newVisited = characters.reduce((acc, character: string) => {
                return {
                    ...acc,
                    [character]: {
                        ...visitedNPCs[character],
                        fought: (visitedNPCs[character]?.fought || 0) + 1,
                    },
                };
            }, visitedNPCs);
            setVisitedNPCs(newVisited);
        };

        handleTransition(callback);
    };

    if (!player) {
        return <ClassSelection onSelectClass={handleSelectClass} />;
    }

    const isActivityOpen = encounter || isResting || scene || isSelectingSecondaryJob || shop || rewardsOpen || true;

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
                    <KerningCity onClickScene={setScene} player={player} onExit={() => setScene(null)} />
                    {scene && (
                        <>
                            <ScenePlayer
                                scene={scene}
                                player={player}
                                updatePlayer={setPlayer}
                                onExit={() => setScene(null)}
                                onBattle={handleSceneBattle}
                                onShop={setShop}
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
                    {shop && <Shop player={player} mesos={0} {...shop} onExit={() => setShop(null)} deck={deck} updateDeck={setDeck} />}
                    {isSelectingSecondaryJob && <JobUp player={player} onSelectClass={handleJobUp} />}
                    {!isSelectingSecondaryJob && rewardsOpen && (
                        <Rewards deck={deck} player={player} updateDeck={setDeck} onClose={() => setRewardsOpen(false)} />
                    )}
                </div>
            )}
            <div
                className={classNames(classes.transitionOverlay, {
                    show: showTransitionOverlay,
                    hide: showTransitionOverlay === false,
                })}
            />
        </>
    );
};

export default Main;
