import classNames from "classnames";
import { clamp } from "ramda";
import { MutableRefObject, useEffect, useRef, useState } from "react";
import { createUseStyles } from "react-jss";
import Camp from "../map/Camp";
import Map from "../map/Map";
import { REGIONS } from "../map/regions";
import { events } from "../map/routes/eventList";
import generateTravelRoute from "../map/routes/generateTravelRoute";
import { ROUTE_ID_MAP, routeHenesysEllinia, routeKerningToPerion, toLith } from "../map/routes/routes";
import { BG_MAP, GeneratedRouteNode, NODE_TYPES, RouteNode, TOWNS, TownProperties } from "../map/types";
import { Ability, CombatAbility } from "../ability/types";
import BattlefieldContainer from "../battle/BattleView";
import { updateCombatant } from "../battle/actions/actions";
import { startBattle } from "../battle/actions/phases";
import { passesValueComparison } from "../battle/passesConditions";
import { BATTLE_STATES, battleStateSlice } from "../battle/reducer";
import { BATTLE_TYPES } from "../battle/types";
import { getMaxHP } from "../battle/utils";
import { playerStateSlice } from "../character/playerReducer";
import { INTRO_PAN_TIME, REGULAR_BATTLE_LOOT_CHANCE } from "../constants";
import { useAppDispatch, useAppSelector } from "../hooks";
import { VictoriaIslandImage } from "../images";
import { Item, RARITIES } from "../item/types";
import ScenePlayer from "../scene/ScenePlayer";
import TradingPost from "../shops/TradingPost";
import TreasureBox from "../scene/TreasureBox/TreasureBox";
import { introScene, startJourneyScene } from "../scene/misc";
import { EventScene, SCENE_CONDITION_TYPES, SceneCondition } from "../scene/types";
import { getRandomItem } from "../utils";
import Overlay from "../view/Overlay";
import CardRemovalGrid from "./CardRemovalGrid";
import CardRewards from "./CardRewards";
import CardUpgradeGrid from "./CardUpgradeGrid";
import ClassSelection from "./ClassSelection";
import GameOver from "./GameOver";
import Header from "./Header";
import ItemRewards from "./ItemRewards";
import Shop from "../shops/Shop";
import Sound from "./Sound";
import { PLAYER_CLASSES } from "./types";
import { aggregateItemEffects } from "./utils";
import { TOWN_MAP } from "../map/townMap";
import ReelLockPuzzle from "../scene/TreasureBox/ReelLockPuzzle";
import OnOffPuzzle from "../scene/TreasureBox/OnOffPuzzle";
import RowPuzzle from "../scene/TreasureBox/RowPuzzle";
import { OVERWORLD_BOSS_ID_MAP } from "../map/routes/overworldBosses";
import { generateElites, generateWaves } from "../map/encounters";
import { saveGame } from "./gameFiles";

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
    soundContainer: {
        position: "absolute",
        left: 16,
        bottom: 16,
        zIndex: 5,
    },
});

const {
    updatePlayer,
    onSelectClass,
    updateDeck,
    restartGame,
    useConsumable,
    acquireItems,
    updateMesos,
    incrementEncounterTypeWon,
    logVisitedEvent,
    newGame,
    selectMapNode: selectNode,
    setRoute,
    setTown,
    setNumNormalEncountersSinceLoot,
} = playerStateSlice.actions;
const { closeBattle, useConsumable: battleUseConsumable } = battleStateSlice.actions;

// These activities are considered to be exclusive with each other
enum ACTIVITIES {
    SHOP = "shop",
    CAMP = "camp",
    TRADING_POST = "trading-post",
}

// Used to prevent re-renders of the element when going from class selection to the main UI.
const TRANSITION_OVERLAY_KEY = "transition-overlay";

const Main = () => {
    const [sceneRegion, setSceneRegion]: [REGIONS, any] = useState(null);
    const [scene, setScene]: [EventScene | null, Function] = useState(null);
    const [encounterVictoryCallback, setEncounterVictoryCallback] = useState(null);
    const [cardRewardsOpen, setCardRewardsOpen] = useState(false);
    const [itemRewardsOptions, setItemRewardsOptions] = useState(null);
    const [activity, setActivity] = useState(null);
    const [showTransitionOverlay, setShowTransitionOverlay] = useState(null);
    const [usingItem, setUsingItem]: [Item, Function] = useState(null);
    const [treasure, setTreasure] = useState(null);
    const [isGameOver, setIsGameOver] = useState(false);
    const classes = useStyles();
    const dispatch = useAppDispatch();
    const { character, battle } = useAppSelector((state) => state);
    const {
        player,
        deck,
        visitedEvents,
        infamy,
        route,
        currentMapLocation: currentLocation,
        nodesVisited,
        currentTown: town,
        battleHistory = [],
        numNormalEncountersSinceLoot = 0,
    } = character || {};
    const [openClassSelection, setOpenClassSelection] = useState(true);
    const [hideMapClickIndicator, setHideMapClickIndicator] = useState(false);

    const transitionRef: MutableRefObject<ReturnType<typeof setTimeout> | null> = useRef(null);

    const resetTravels = () => {
        dispatch(newGame());
        setSceneRegion(null);
        setScene(null);
        setIsGameOver(false);
        setActivity(null);
        setOpenClassSelection(true);
    };

    useEffect(() => {
        resetTravels();
        // Preload the overworld map
        const mapImage: string = VictoriaIslandImage;
        const newImage = new Image();
        newImage.src = mapImage;
        window[mapImage] = newImage;
    }, []);

    useEffect(() => {
        // Check game over when player updates
        if (player?.HP <= 0 && (battle?.eventQueue || []).length === 0) {
            const timeout = setTimeout(() => {
                handleTransition(() => setIsGameOver(true));
            }, 1500);

            return () => clearTimeout(timeout);
        }
    }, [player, battle?.eventQueue]);

    useEffect(() => {
        if (battle?.state !== BATTLE_STATES.VICTORY) {
            return;
        }

        if (battle?.disableCardRewards) {
            handleExitBattle();
        } else {
            setCardRewardsOpen(true);
        }
    }, [battle?.state]);

    const handleEventNode = (node) => {
        const passesConditions = (event: EventScene) => {
            if (!event.conditions) {
                return true;
            }

            return event.conditions.every((condition: SceneCondition) => {
                const { type, value, comparator } = condition;

                switch (type) {
                    case SCENE_CONDITION_TYPES.PLAYER_CLASS:
                        return passesValueComparison({ val: player.class, otherVal: value, comparator });
                    case SCENE_CONDITION_TYPES.INFAMY:
                        return passesValueComparison({ val: infamy, otherVal: value, comparator });
                    case SCENE_CONDITION_TYPES.VISITED_SCENES:
                        // visitedEvents is stored as a map of IDs
                        return passesValueComparison({ val: Object.keys(visitedEvents), otherVal: value, comparator });
                    case SCENE_CONDITION_TYPES.MESOS:
                        return passesValueComparison({ val: player.mesos, otherVal: value, comparator });
                    case SCENE_CONDITION_TYPES.ITEMS:
                        return passesValueComparison({ val: player.items.map(({ name }) => name), otherVal: value, comparator });
                }
            });
        };

        const getRandomEvent = (): EventScene | undefined => {
            return getRandomItem(
                events.filter((e: EventScene) => {
                    return !visitedEvents[e.id] && passesConditions(e);
                })
            );
        };

        const scene = node.event || getRandomEvent();
        if (scene) {
            dispatch(logVisitedEvent(scene.id));
            setScene(scene);
        }
    };

    const handleTransition = (callback: Function = () => {}) => {
        if (transitionRef.current) {
            // Just call the callback immediately
            callback();
            return;
        }
        setShowTransitionOverlay(true);
        transitionRef.current = setTimeout(() => {
            callback();
            setTimeout(() => {
                setShowTransitionOverlay(false);
                transitionRef.current = null;
            }, TRANSITION_TIME * 1000);
        }, TRANSITION_TIME * 1000);
    };

    const handleBattleNode = (node: GeneratedRouteNode) => {
        const previousEncounters = battleHistory.map(({ waves }) => waves).filter((v) => v);
        let encounter;
        if (node.type === NODE_TYPES.BOSS && node.encounter) {
            encounter = OVERWORLD_BOSS_ID_MAP[node.encounter]?.waves;
        } else if (node.type === NODE_TYPES.ELITE_ENCOUNTER) {
            encounter = generateElites(ROUTE_ID_MAP[node.routeId], previousEncounters);
        } else if (node.type === NODE_TYPES.ENCOUNTER) {
            encounter = generateWaves({
                route: ROUTE_ID_MAP[node.routeId],
                fallbackRoute: ROUTE_ID_MAP[node.previousRouteId],
                previousEncounters,
            });
        }

        if (!encounter) {
            return;
        }

        dispatch(
            startBattle({
                waves: encounter,
                backgroundImage: BG_MAP[node.region],
                type: node.type as unknown as BATTLE_TYPES, // NODE_TYPES.ENCOUNTER, ELITE_ENCOUNTER, BOSS are enums equivalent to BATTLE_TYPES
                cardRewards: node.cardRewards,
            })
        );
    };

    const handleSelectNode = (node: GeneratedRouteNode) => {
        dispatch(selectNode(node));

        const callback = () => {
            if ([NODE_TYPES.ENCOUNTER, NODE_TYPES.ELITE_ENCOUNTER, NODE_TYPES.BOSS].includes(node.type)) {
                handleBattleNode(node);
            } else if (node.type === NODE_TYPES.EVENT) {
                handleEventNode(node);
            } else if (node.type === NODE_TYPES.TREASURE) {
                setTreasure({ ...node.treasure, puzzle: getRandomItem([ReelLockPuzzle, OnOffPuzzle, RowPuzzle]) });
            } else if (node.type === NODE_TYPES.RESTING_ZONE) {
                setActivity(ACTIVITIES.CAMP);
            } else if (node.type === NODE_TYPES.TOWN) {
                dispatch(setTown(node.town));
            }
        };
        handleTransition(callback);
    };

    const handleExitBattle = () => {
        if (battle) {
            dispatch(incrementEncounterTypeWon(battle.type));
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

            // Only if we're not in the middle of a scene (which could consist of multiple battles), save the game.
            // Otherwise, refreshing or crashing in the middle of the scene could cause some content to get locked out.
            if (!scene) {
                saveGame(character);
            }
        }
    };

    // Opens item rewards if applicable.
    const handleCloseCardRewards = () => {
        setCardRewardsOpen(false);
        if (battle?.disableItemRewards) {
            handleExitBattle();
            return;
        }

        const itemRewardProps = {
            rewardType: battle.type,
            itemRewards: battle.itemRewards,
            overrideItemChoices: battle.overrideItemChoices,
            disableAttainConsumable: battle.isTutorial,
        };

        if ([BATTLE_TYPES.ELITE_ENCOUNTER, BATTLE_TYPES.BOSS].includes(battle?.type)) {
            setItemRewardsOptions({ numChoicesOffered: 3, ...itemRewardProps });
            return;
        }

        if (numNormalEncountersSinceLoot > 0) {
            const isCrossedPityThreshold = numNormalEncountersSinceLoot * REGULAR_BATTLE_LOOT_CHANCE >= 1;
            if (Math.random() < REGULAR_BATTLE_LOOT_CHANCE || isCrossedPityThreshold) {
                dispatch(setNumNormalEncountersSinceLoot(0));
                setItemRewardsOptions({ numChoicesOffered: 1, ...itemRewardProps });
                return;
            }
        }

        dispatch(setNumNormalEncountersSinceLoot(numNormalEncountersSinceLoot + 1));

        handleExitBattle();
    };

    const handleCloseItemRewards = () => {
        setItemRewardsOptions(false);
        handleExitBattle();
    };

    const handleSelectClass = (selectedClass: PLAYER_CLASSES, deck: Ability[]) => {
        dispatch(onSelectClass({ selectedClass, deck }));
    };

    let handleUseItem;
    if (battle) {
        if (battle.isPlayerTurn) {
            handleUseItem = (item: Item) => {
                const { upgradeCard, removeCard } = item;
                if (!upgradeCard && !removeCard) {
                    dispatch(battleUseConsumable(item));
                    dispatch(useConsumable(item));
                }
            };
        }
    } else {
        handleUseItem = (item: Item) => {
            const { upgradeCard, removeCard } = item;
            if (upgradeCard || removeCard) {
                setUsingItem(item);
                return;
            }

            dispatch(useConsumable(item));
        };
    }

    const handleSceneBattle = (encounter, onVictory: Function) => {
        const callback = () => {
            dispatch(startBattle({ ...encounter, backgroundImage: encounter.backgroundImage || BG_MAP[currentLocation?.region] }));
            setEncounterVictoryCallback(() => onVictory);
        };

        handleTransition(callback);
    };

    const handleCloseClassSelection = (reloadedRun: boolean) => {
        setOpenClassSelection(false);

        if (!reloadedRun) {
            // Don't want distracting clicky when there is about to be dialog on the overworld map
            setHideMapClickIndicator(true);

            setTimeout(() => {
                setScene(introScene);
                setHideMapClickIndicator(false);
            }, INTRO_PAN_TIME + 500);
        }
    };

    if (!player || openClassSelection) {
        return (
            <>
                <ClassSelection onSelectClass={handleSelectClass} onClose={handleCloseClassSelection} onTransition={handleTransition} />
                <div
                    key={TRANSITION_OVERLAY_KEY}
                    className={classNames(classes.transitionOverlay, {
                        show: showTransitionOverlay,
                        hide: showTransitionOverlay === false,
                    })}
                />
            </>
        );
    }

    const handleObtainLoot = ({ mesos = 0, items = [] }: { mesos?: number; items?: Item[] }) => {
        dispatch(updateMesos(mesos));
        dispatch(acquireItems(items));
    };

    const handleTownBattle = (battleConfig, callback: () => void) => {
        handleTransition(() => {
            dispatch(startBattle(battleConfig));
            callback();
        });
    };

    const handleClickScene = (scene: EventScene, callback?: Function) => {
        handleTransition(() => {
            setScene(scene);
            callback && callback();
        });
    };

    const handleExitTown = (options: { eventsSkipped?: boolean } = {}) => {
        handleTransition(() => dispatch(setTown(null)));

        if (town === TOWNS.LITH_HARBOR) {
            // We completed the intro. Load the rest of the route.
            const route = generateTravelRoute({ startingRoute: toLith });
            dispatch(setRoute(route));

            if (!options?.eventsSkipped) {
                // Don't want distracting clicky when there is about to be dialog on the overworld map
                setHideMapClickIndicator(true);
                setTimeout(() => {
                    setScene(startJourneyScene);
                    setHideMapClickIndicator(false);
                }, 1500);
            }

            return;
        }

        if (town === TOWNS.KERNING) {
            const route = generateTravelRoute({ startingRoute: routeKerningToPerion });
            dispatch(setRoute(route));
            return;
        }

        if (town === TOWNS.HENESYS) {
            const route = generateTravelRoute({ startingRoute: routeHenesysEllinia });
            dispatch(setRoute(route));
        }
    };

    const getTown = () => {
        const Town = TOWN_MAP[town];

        if (!Town) {
            return null;
        }

        return (
            <Town
                player={player}
                deck={deck}
                updateDeck={handleUpdateDeck}
                onExit={handleExitTown}
                onClickScene={handleClickScene}
                onBattle={handleTownBattle}
                onTransition={handleTransition}
                onCamp={() => setActivity(ACTIVITIES.CAMP)}
            />
        );
    };

    const setPlayer = (player) => dispatch(updatePlayer(player));
    const handleUpdateDeck = (deck) => dispatch(updateDeck(deck));
    const handleSelectWeaponSkin = (weaponSkin: string) => {
        if (battle) {
            dispatch(
                updateCombatant({
                    combatantId: player.id,
                    newProperties: {
                        weapon: weaponSkin,
                    },
                })
            );
        }

        dispatch(updatePlayer({ weapon: weaponSkin }));
    };

    const isActivityOpen = activity || battle || scene || cardRewardsOpen || itemRewardsOptions || usingItem || treasure;

    return (
        <>
            <div className={classes.mapContainer}>
                <Map
                    onSelectNode={handleSelectNode}
                    generatedRoute={route}
                    playerLocationNode={currentLocation}
                    playerImage={player?.image}
                    visited={nodesVisited}
                    disableClick={Boolean(scene) || hideMapClickIndicator || showTransitionOverlay}
                />
            </div>
            {town && <div className={classes.activityContainer}>{getTown()}</div>}
            {isActivityOpen && (
                <div className={classes.activityContainer}>
                    {scene && (
                        <ScenePlayer
                            deck={deck}
                            updateDeck={handleUpdateDeck}
                            scene={scene}
                            player={player}
                            updatePlayer={setPlayer}
                            onExit={() => {
                                setScene(null);
                                setSceneRegion(null);
                                saveGame(character);
                            }}
                            onBattle={handleSceneBattle}
                            onShop={() => setActivity(ACTIVITIES.SHOP)}
                            onTransition={handleTransition}
                            onChangeRegion={setSceneRegion}
                            region={sceneRegion || currentLocation?.region}
                        />
                    )}
                    {activity === ACTIVITIES.CAMP && (
                        <Camp
                            onExit={() => setActivity(null)}
                            player={player}
                            deck={deck}
                            updateDeck={handleUpdateDeck}
                            updatePlayer={setPlayer}
                        />
                    )}
                    {activity === ACTIVITIES.SHOP && <Shop onExit={() => setActivity(null)} />}
                    {cardRewardsOpen && (
                        <CardRewards
                            deck={deck}
                            player={player}
                            updateDeck={handleUpdateDeck}
                            onClose={handleCloseCardRewards}
                            cardRewardOptions={battle.cardRewards}
                            rewardType={battle.type}
                            disableRarities={(battle.isTutorial && [RARITIES.RARE]) || undefined}
                            disableIgnoreButton={battle.isTutorial}
                        />
                    )}
                    {itemRewardsOptions && (
                        <ItemRewards onLoot={handleObtainLoot} onClose={handleCloseItemRewards} player={player} {...itemRewardsOptions} />
                    )}

                    {treasure && (
                        <TreasureBox
                            onExit={() => setTreasure(null)}
                            onLoot={handleObtainLoot}
                            /**Puzzle={treasure.puzzle}**/
                            initItems={treasure.items}
                            initMesos={treasure.mesos}
                            curse={treasure.curse}
                            player={player}
                        />
                    )}
                    {battle && <BattlefieldContainer />}
                    {usingItem?.upgradeCard && (
                        <Overlay>
                            <CardUpgradeGrid
                                cards={deck}
                                onCancel={() => setUsingItem(null)}
                                onConfirm={(updatedDeck) => {
                                    dispatch(updateDeck(updatedDeck));
                                    dispatch(useConsumable(usingItem));
                                    setUsingItem((prev) => {
                                        if (prev.stacks > 1) {
                                            return {
                                                ...prev,
                                                stacks: prev.stacks - 1,
                                            };
                                        }

                                        return null;
                                    });
                                }}
                            />
                        </Overlay>
                    )}
                    {usingItem?.removeCard && (
                        <Overlay>
                            <CardRemovalGrid
                                cards={deck}
                                onCancel={() => setUsingItem(null)}
                                onRemoveAbility={(updatedDeck) => {
                                    dispatch(updateDeck(updatedDeck));
                                    dispatch(useConsumable(usingItem));
                                    setUsingItem((prev) => {
                                        if (prev.stacks > 1) {
                                            return {
                                                ...prev,
                                                stacks: prev.stacks - 1,
                                            };
                                        }

                                        return null;
                                    });
                                }}
                            />
                        </Overlay>
                    )}
                    {activity === ACTIVITIES.TRADING_POST && <TradingPost onExit={() => setActivity(null)} />}
                </div>
            )}
            {<Header onUseItem={handleUseItem} onSelectWeaponSkin={handleSelectWeaponSkin} />}

            {isGameOver && (
                <GameOver
                    player={player}
                    onExit={() => {
                        const callback = () => {
                            dispatch(restartGame());
                            resetTravels();
                            dispatch(closeBattle());
                        };

                        handleTransition(callback);
                    }}
                />
            )}
            <div className={classes.soundContainer}>
                <Sound playlist={sceneRegion || currentLocation?.region} playTrack={battle?.backgroundMusic} isGameOver={isGameOver} />
            </div>
            <div
                key={TRANSITION_OVERLAY_KEY}
                className={classNames(classes.transitionOverlay, {
                    show: showTransitionOverlay,
                    hide: showTransitionOverlay === false,
                })}
            />
        </>
    );
};

export default Main;
