import classNames from "classnames";
import { cloneDeep } from "lodash";
import { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
import { Ability, Effect } from "../ability/types";
import { startBattle } from "../battle/actions/actions";
import BattlefieldContainer from "../battle/BattleView";
import { battleStateSlice } from "../battle/reducer";
import Rewards from "../battle/Rewards";
import JobUp from "../character/JobUp";
import { playerStateSlice } from "../character/playerReducer";
import { useAppDispatch, useAppSelector } from "../hooks";
import { Item } from "../item/types";
import Camp from "../Map/Camp";
import Henesys from "../Map/Henesys";
import KerningCity from "../Map/KerningCity";
import LithHarbor from "../Map/LithHarbor";
import Map from "../Map/Map";
import generateTravelRoute from "../Map/routes/generateTravelRoute";
import { routeLith, toLith } from "../Map/routes/routes";
import { NODE_TYPES, TOWNS } from "../Map/types";
import ScenePlayer from "../scene/ScenePlayer";
import TreasureBox from "../scene/TreasureBox/TreasureBox";
import { NPC } from "../scene/types";
import ClassSelection from "./ClassSelection";
import GameOver from "./GameOver";
import Header from "./Header";
import Shop from "./Shop";
import { NPCTracker, PLAYER_CLASSES } from "./types";
import { aggregateItemEffects } from "./utils";

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

const { updatePlayer, onSelectClass, updateDeck, restartGame } = playerStateSlice.actions;
const { closeBattle } = battleStateSlice.actions;

const Main = () => {
    const [scene, setScene] = useState(null);
    const [encounterVictoryCallback, setEncounterVictoryCallback] = useState(null);
    const [isResting, setIsResting] = useState(false);
    const [route, setRoute] = useState(null);
    const [locationNode, setLocationNode] = useState(null);
    const [isSelectingSecondaryJob, setIsSelectingSecondaryJob] = useState(false);
    // TESTING: Allow selection of one reward at the start
    const [rewardsOpen, setRewardsOpen] = useState(true);
    const [shop, setShop] = useState(null);
    const [treasure, setTreasure] = useState(null);
    const [visitedNPCs, setVisitedNPCs] = useState({});
    const [showTransitionOverlay, setShowTransitionOverlay] = useState(null);
    const [isGameOver, setIsGameOver] = useState(false);
    const [town, setTown] = useState(null);
    const classes = useStyles();
    const dispatch = useAppDispatch();
    const { character, battle } = useAppSelector((state) => state);
    const { player, deck } = character || {};

    useEffect(() => {
        const route = generateTravelRoute({ route: toLith, notoreity: 0, numRoutesComplete: 0 });
        setRoute(route);
        setLocationNode(route);
    }, []);

    useEffect(() => {
        // Check game over when player updates
        if (player?.HP <= 0) {
            setTimeout(() => {
                setIsGameOver(true);
            }, 1500);
        }
    }, [player]);

    useEffect(() => {
        if (battle?.isEnded) {
            setRewardsOpen(true);
        }
    }, [battle?.isEnded]);

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
        setLocationNode(node);

        const callback = () => {
            if (node.type === NODE_TYPES.ENCOUNTER || node.type === NODE_TYPES.ELITE_ENCOUNTER || node.type === NODE_TYPES.BOSS) {
                dispatch(startBattle({ waves: node.encounter }));
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

    const handleCloseRewards = () => {
        setRewardsOpen(false);
        if (battle) {
            dispatch(closeBattle());

            dispatch(
                updatePlayer({
                    effects: aggregateItemEffects(player.items),
                })
            );

            if (encounterVictoryCallback) {
                encounterVictoryCallback();
                setEncounterVictoryCallback(null);
            }
        }
    };

    const handleSelectClass = (selectedClass: PLAYER_CLASSES, deck: Ability[]) => {
        dispatch(onSelectClass({ selectedClass, deck }));
    };

    /*
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
    */

    const handleJobUp = ({ job, jobUpAbilities }) => {
        dispatch(
            updatePlayer({
                secondaryClass: job,
            })
        );
        dispatch(updateDeck([...deck, ...jobUpAbilities]));
        setIsSelectingSecondaryJob(false);
    };

    const handleSceneBattle = (encounter, onVictory: Function) => {
        const callback = () => {
            const { characters = [], ...other } = encounter;
            startBattle({ waves: other.waves });
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
        const newItems = [...player.items, ...items];
        dispatch(
            updatePlayer({
                mesos: player.mesos + mesos,
                effects: aggregateItemEffects(newItems),
                items: newItems,
            })
        );
    };

    const getTown = () => {
        const TOWN_MAP = {
            [TOWNS.KERNING]: KerningCity,
            [TOWNS.LITH_HARBOUR]: LithHarbor,
            [TOWNS.HENESYS]: Henesys,
        };

        const Town = TOWN_MAP[town];
        return <Town player={player} onExit={() => setTown(null)} onClickScene={setScene} />;
    };

    const setPlayer = (player) => dispatch(updatePlayer(player));
    const setDeck = (deck) => dispatch(updateDeck(deck));

    const isActivityOpen = battle || isResting || scene || shop || rewardsOpen || treasure || town;

    return (
        <>
            <div className={classes.mapContainer}>
                <Map onSelectNode={handleSelectNode} generatedRoute={route} currentNode={locationNode} playerImage={player.image} />
                <Header player={player} deck={deck} />
            </div>
            {isActivityOpen && (
                <div className={classes.activityContainer}>
                    {town && getTown()}

                    {scene && (
                        <>
                            <ScenePlayer
                                scene={scene}
                                player={player}
                                updatePlayer={setPlayer}
                                onExit={() => setScene(null)}
                                onBattle={handleSceneBattle}
                                onShop={setShop}
                                onTransition={handleTransition}
                            />
                            <Header player={player} deck={deck} />
                        </>
                    )}
                    {battle && <BattlefieldContainer />}
                    {isResting && (
                        <>
                            <Camp
                                onExit={() => setIsResting(false)}
                                player={player}
                                deck={deck}
                                updateDeck={setDeck}
                                updatePlayer={setPlayer}
                            />
                            {/** TODO re-enable item usage */}
                            <Header player={player} deck={deck} />
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
            {isGameOver && (
                <GameOver
                    player={player}
                    onExit={() => {
                        const callback = () => {
                            setIsGameOver(false);
                            dispatch(closeBattle());
                            dispatch(restartGame());
                        };

                        handleTransition(callback);
                    }}
                />
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
