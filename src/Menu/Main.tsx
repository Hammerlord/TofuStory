import classNames from "classnames";
import { clamp } from "ramda";
import { MutableRefObject, useEffect, useRef, useState } from "react";
import { createUseStyles } from "react-jss";
import Camp from "../Map/Camp";
import Map from "../Map/Map";
import { REGIONS } from "../Map/regions";
import { events } from "../Map/routes/eventList";
import generateTravelRoute from "../Map/routes/generateTravelRoute";
import { toLith } from "../Map/routes/routes";
import { BG_MAP, NODE_TYPES, Route, RouteNode, TOWNS, TOWN_MAP } from "../Map/types";
import { Ability } from "../ability/types";
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
import TradingPost from "../scene/TradingPost";
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
import Shop from "./Shop";
import Sound from "./Sound";
import { PLAYER_CLASSES } from "./types";
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
} = playerStateSlice.actions;
const { closeBattle, useConsumable: battleUseConsumable } = battleStateSlice.actions;

const Main = () => {
    const [sceneRegion, setSceneRegion]: [REGIONS, any] = useState(null);
    const [scene, setScene]: [EventScene | null, Function] = useState(null);
    const [encounterVictoryCallback, setEncounterVictoryCallback] = useState(null);
    const [isResting, setIsResting] = useState(false);
    const [route, setRoute]: [Route, Function] = useState(null);
    const [locationNode, setLocationNode] = useState(null);
    const [nodesVisitedMap, setNodesVisitedMap] = useState({});
    const [cardRewardsOpen, setCardRewardsOpen] = useState(false);
    const [itemRewardsOpen, setItemRewardsOpen] = useState(false);
    const [shop, setShop] = useState(null);
    const [treasure, setTreasure] = useState(null);
    const [showTransitionOverlay, setShowTransitionOverlay] = useState(null);
    const [upgradingAbility, setUpgradingAbility] = useState(null);
    const [removingAbility, setRemovingAbility] = useState(null);
    const [tradingPost, setTradingPost] = useState(null);
    const [isGameOver, setIsGameOver] = useState(false);
    const [town, setTown]: [TOWNS | null, Function] = useState(null);
    const classes = useStyles();
    const dispatch = useAppDispatch();
    const { character, battle } = useAppSelector((state) => state);
    const { player, deck, visitedEvents, infamy } = character || {};
    const [openClassSelection, setOpenClassSelection] = useState(true);
    const [hideMapClickIndicator, setHideMapClickIndicator] = useState(false);

    const transitionRef: MutableRefObject<ReturnType<typeof setTimeout> | null> = useRef(null);

    const resetTravels = () => {
        const route = generateTravelRoute({ startingRoute: { ...toLith, next: [] } });
        //const route = generateTravelRoute({ startingRoute: { ...toLith } });

        setRoute(route);
        setLocationNode(route);
        setSceneRegion(null);
        setScene(null);
        setTown(null);
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
            handleTransition(() => setIsGameOver(true));
            const timeout = setTimeout(() => {
                setIsGameOver(true);
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

    const handleSelectNode = (node: RouteNode) => {
        setLocationNode(node);
        setNodesVisitedMap((prev) => ({ ...prev, [node.id]: true }));

        const callback = () => {
            if ([NODE_TYPES.ENCOUNTER, NODE_TYPES.ELITE_ENCOUNTER, NODE_TYPES.BOSS].includes(node.type)) {
                dispatch(
                    startBattle({
                        waves: node.encounter,
                        backgroundImage: BG_MAP[node.region],
                        type: node.type as unknown as BATTLE_TYPES, // NODE_TYPES.ENCOUNTER, ELITE_ENCOUNTER, BOSS are enums equivalent to BATTLE_TYPES
                        cardRewards: node.cardRewards,
                    })
                );
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
        }
    };

    // Opens item rewards if applicable.
    const handleCloseCardRewards = () => {
        setCardRewardsOpen(false);
        if (battle?.disableItemRewards) {
            handleExitBattle();
            return;
        }

        if ([BATTLE_TYPES.ELITE_ENCOUNTER, BATTLE_TYPES.BOSS].includes(battle?.type) || Math.random() < REGULAR_BATTLE_LOOT_CHANCE) {
            setItemRewardsOpen(true);
        } else {
            handleExitBattle();
        }
    };

    const handleCloseItemRewards = () => {
        setItemRewardsOpen(false);
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
            if (upgradeCard) {
                setUpgradingAbility(() => () => dispatch(useConsumable(item)));
                return;
            }

            if (removeCard) {
                setRemovingAbility(() => () => dispatch(useConsumable(item)));
                return;
            }

            dispatch(useConsumable(item));
        };
    }

    const handleSceneBattle = (encounter, onVictory: Function) => {
        const callback = () => {
            dispatch(startBattle({ ...encounter, backgroundImage: encounter.backgroundImage || BG_MAP[locationNode?.region] }));
            setEncounterVictoryCallback(() => onVictory);
        };

        handleTransition(callback);
    };

    const handleCloseClassSelection = () => {
        setOpenClassSelection(false);
        // Don't want distracting clicky when there is about to be dialog on the overworld map
        setHideMapClickIndicator(true);

        setTimeout(() => {
            setScene(introScene);
            setHideMapClickIndicator(false);
        }, INTRO_PAN_TIME + 500);
    };

    if (openClassSelection) {
        return <ClassSelection onSelectClass={handleSelectClass} onClose={handleCloseClassSelection} />;
    }

    const handleBuyItem = ({
        items,
        mesosSpent,
        type,
        statChanges = {},
    }: {
        items: Item[] | Ability[];
        mesosSpent: number;
        type: "item" | "ability";
        statChanges?: { maxHP?: number; HP?: number };
    }) => {
        const { maxHP = 0, HP = 0 } = statChanges;
        const effectiveMaxHP = getMaxHP(player) + maxHP;
        const newHP = clamp(0, effectiveMaxHP, player.HP + HP);
        dispatch(updateMesos(-mesosSpent));
        dispatch(
            updatePlayer({
                HP: newHP,
                maxHP: player.maxHP + maxHP,
            })
        );

        if (type === "ability") {
            dispatch(updateDeck([...items, ...deck]));
            return;
        }

        if (type === "item") {
            dispatch(acquireItems(items as Item[]));
        }
    };

    const handleTrade = ({ playerItem, forItem }) => {
        if (!playerItem || !forItem) {
            return;
        }
        dispatch(
            updatePlayer({
                items: player.items.filter((item) => item.name !== playerItem.name),
            })
        );

        dispatch(acquireItems([forItem]));
    };

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
        handleTransition(() => setTown(null));

        if (town === TOWNS.LITH_HARBOR) {
            // We completed the intro. Load the rest of the route.
            const route = generateTravelRoute({ startingRoute: toLith });
            // Don't want distracting clicky when there is about to be dialog on the overworld map
            setHideMapClickIndicator(true);

            setRoute(route);
            setLocationNode(route);
            setTimeout(() => {
                if (!options?.eventsSkipped) {
                    setScene(startJourneyScene);
                }
                setHideMapClickIndicator(false);
            }, 1500);
        }
    };

    const getTown = () => {
        const Town: any = TOWN_MAP[town];
        if (!Town) {
            setTown(null);
            return null;
        }
        return (
            <Town
                player={player}
                deck={deck}
                updateDeck={handleUpdateDeck}
                updatePlayer={updatePlayer}
                onExit={handleExitTown}
                onClickScene={handleClickScene}
                onClickShop={setShop}
                onClickTradingPost={() => setTradingPost(true)}
                onBattle={handleTownBattle}
                onTransition={handleTransition}
                onCamp={() => setIsResting(true)}
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

    const isActivityOpen =
        battle || isResting || scene || shop || cardRewardsOpen || treasure || upgradingAbility || removingAbility || tradingPost;

    return (
        <>
            <div className={classes.mapContainer}>
                <Map
                    onSelectNode={handleSelectNode}
                    generatedRoute={route}
                    playerLocationNode={locationNode}
                    playerImage={player.image}
                    visited={nodesVisitedMap}
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
                            }}
                            onBattle={handleSceneBattle}
                            onShop={setShop}
                            onTransition={handleTransition}
                            onChangeRegion={setSceneRegion}
                            region={sceneRegion || locationNode?.region}
                        />
                    )}
                    {isResting && (
                        <Camp
                            onExit={() => setIsResting(false)}
                            player={player}
                            deck={deck}
                            updateDeck={handleUpdateDeck}
                            updatePlayer={setPlayer}
                        />
                    )}
                    {shop && <Shop player={player} mesos={player.mesos} {...shop} onExit={() => setShop(null)} onBuyItem={handleBuyItem} />}
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
                    {itemRewardsOpen && (
                        <ItemRewards
                            playerCurrentItems={player.items}
                            overrideItemChoices={battle.itemRewards}
                            onLoot={handleObtainLoot}
                            onClose={handleCloseItemRewards}
                            rewardType={battle.type}
                            player={player}
                            disableAttainConsumable={battle.isTutorial}
                        />
                    )}

                    {treasure && (
                        <TreasureBox
                            onExit={() => setTreasure(null)}
                            onLoot={handleObtainLoot}
                            Puzzle={treasure.puzzle}
                            initItems={treasure.items}
                            initMesos={treasure.mesos}
                            curse={treasure.curse}
                            player={player}
                        />
                    )}
                    {battle && <BattlefieldContainer />}
                    {upgradingAbility && (
                        <Overlay>
                            <CardUpgradeGrid
                                cards={deck}
                                onCancel={() => setUpgradingAbility(null)}
                                onConfirm={(updatedDeck) => {
                                    dispatch(updateDeck(updatedDeck));
                                    if (typeof upgradingAbility === "function") {
                                        upgradingAbility();
                                    }
                                    setUpgradingAbility(null);
                                }}
                            />
                        </Overlay>
                    )}
                    {removingAbility && (
                        <Overlay>
                            <CardRemovalGrid
                                cards={deck}
                                onCancel={() => setRemovingAbility(null)}
                                onRemoveAbility={(updatedDeck) => {
                                    dispatch(updateDeck(updatedDeck));
                                    if (typeof removingAbility === "function") {
                                        removingAbility();
                                    }
                                    setRemovingAbility(null);
                                }}
                            />
                        </Overlay>
                    )}
                    {tradingPost && <TradingPost player={player} onExit={() => setTradingPost(null)} onTrade={handleTrade} />}
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
                            setIsGameOver(false);
                        };

                        handleTransition(callback);
                    }}
                />
            )}
            <div className={classes.soundContainer}>
                <Sound playlist={sceneRegion || locationNode?.region} playTrack={battle?.backgroundMusic} />
            </div>
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
