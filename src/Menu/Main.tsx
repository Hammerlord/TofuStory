import classNames from "classnames";
import { cloneDeep } from "lodash";
import { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
import uuid from "uuid";
import { Ability, Effect } from "../ability/types";
import BattlefieldContainer from "../battle/BattleView";
import Rewards from "../battle/Rewards";
import { updateHP } from "../battle/utils";
import JobUp from "../character/JobUp";
import { warmush } from "../images";
import { blackScroll } from "../item/items";
import { Item, ITEM_TYPES } from "../item/types";
import Camp from "../Map/Camp";
import Map from "../Map/Map";
import generateTravelRoute from "../Map/routes/generateTravelRoute";
import { routeLith } from "../Map/routes/routes";
import { NODE_TYPES } from "../Map/types";
import ScenePlayer from "../scene/ScenePlayer";
import TreasureBox from "../scene/TreasureBox/TreasureBox";
import { NPC } from "../scene/types";
import ClassSelection from "./ClassSelection";
import GameOver from "./GameOver";
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

const aggregateItemEffects = (items: Item[]): Effect[] => {
    const effects = [];
    items.forEach((item) => {
        const itemEffects = item.effects?.map(cloneDeep) || [];
        effects.push(...itemEffects);
    });
    return effects;
};

const Main = () => {
    const [player, setPlayer] = useState(null);
    const [deck, setDeck] = useState([]);
    const [scene, setScene] = useState(null);
    const [encounter, setEncounter] = useState(null);
    const [encounterVictoryCallback, setEncounterVictoryCallback] = useState(null);
    const [isResting, setIsResting] = useState(false);
    const [route, setRoute] = useState(generateTravelRoute({ route: routeLith, notoreity: 0, numRoutesComplete: 0 }));
    const [locationNode, setLocationNode] = useState(null);
    const [isSelectingSecondaryJob, setIsSelectingSecondaryJob] = useState(true);
    // TESTING: Allow selection of one reward at the start
    const [rewardsOpen, setRewardsOpen] = useState(false);
    const [shop, setShop] = useState(null);
    const [treasure, setTreasure] = useState(null);
    const [visitedNPCs, setVisitedNPCs] = useState({});
    const [showTransitionOverlay, setShowTransitionOverlay] = useState(null);
    const [isGameOver, setIsGameOver] = useState(false);
    const [town, setTown] = useState(null);
    const classes = useStyles();

    useEffect(() => {
        // Check game over when player updates
        if (player?.HP <= 0) {
            setTimeout(() => {
                const callback = () => {
                    setIsGameOver(true);
                };
                handleTransition(callback);
            }, 2000);
        }
    }, [player]);

    const handleEventNode = ({ npc }: { npc: NPC }) => {
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

    const handleSelectNode = (node) => {
        const callback = () => {
            setLocationNode(node);
            if (node.type === NODE_TYPES.ENCOUNTER || node.type === NODE_TYPES.ELITE_ENCOUNTER) {
                setEncounter({ waves: node.encounter, rewards: [] });
            } else if (node.type === NODE_TYPES.EVENT) {
                handleEventNode(node);
            } else if (node.type === NODE_TYPES.TREASURE) {
                setTreasure(node.treasure);
            } else if (node.type === NODE_TYPES.RESTING_ZONE) {
                setIsResting(true);
            } else if (node.type === NODE_TYPES.TOWN) {
                setTown(node.town);
            }
        };
        handleTransition(callback);
    };

    const handleBattleWon = () => {
        setRewardsOpen(true);
    };

    const handleCloseRewards = () => {
        setRewardsOpen(false);
        if (encounter) {
            setEncounter(null);
            setPlayer((prev) => ({
                ...prev,
                resources: 0,
                armor: 0,
                effects: aggregateItemEffects(prev.items),
                turnHistory: [],
            }));

            if (encounterVictoryCallback) {
                encounterVictoryCallback();
                setEncounterVictoryCallback(null);
            }
        }
    };

    const handleSelectClass = (selectedClass: PLAYER_CLASSES, deck: Ability[]) => {
        const starterItems = [blackScroll, blackScroll, blackScroll];
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
            effects: aggregateItemEffects(starterItems),
            turnHistory: [],
            items: starterItems,
            mesos: 0,
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
                HP: updateHP(player, healing),
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

    const handleLootTreasureBox = ({ mesos = 0, items = [] }: { mesos?: number; items?: Item[] }) => {
        setPlayer((prev) => {
            const newItems = [...prev.items, ...items];
            return {
                ...prev,
                mesos: (prev.mesos += mesos),
                effects: aggregateItemEffects(newItems),
                items: newItems,
            };
        });
    };

    const isActivityOpen = encounter || isResting || scene || shop || rewardsOpen || treasure;

    return (
        <>
            {!isActivityOpen && (
                <div className={classes.mapContainer}>
                    <Map onSelectNode={handleSelectNode} generatedRoute={route} currentNode={locationNode} playerImage={player.image} />
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
                            onBattleWon={handleBattleWon}
                            waves={encounter.waves}
                            rewards={encounter.rewards}
                            initialDeck={deck}
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
                    {shop && (
                        <Shop
                            player={player}
                            mesos={player.mesos}
                            {...shop}
                            onExit={() => setShop(null)}
                            deck={deck}
                            updateDeck={setDeck}
                            updatePlayer={setPlayer}
                        />
                    )}
                    {!isSelectingSecondaryJob && rewardsOpen && (
                        <Rewards deck={deck} player={player} updateDeck={setDeck} onClose={handleCloseRewards} />
                    )}

                    {treasure && (
                        <TreasureBox
                            onExit={() => setTreasure(null)}
                            onLoot={handleLootTreasureBox}
                            items={treasure.items}
                            mesos={treasure.mesos}
                            Puzzle={treasure.puzzle}
                        />
                    )}
                </div>
            )}
            {isSelectingSecondaryJob && <JobUp player={player} onSelectClass={handleJobUp} />}
            {isGameOver && <GameOver player={player} onExit={() => setPlayer(null)} />}
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
