import classNames from "classnames";
import { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
import CardRemovalGrid from "../Menu/CardRemovalGrid";
import CardUpgradeGrid from "../Menu/CardUpgradeGrid";
import { Ability, CombatAbility } from "../ability/types";
import { getMaxHP } from "../battle/utils";
import { Player } from "../character/types";
import { CampfireImage, HerbsImage, PerionCampImage, PersonalAnvilImage, WeaponMasteryImage } from "../images";
import { Item } from "../item/types";
import { TransmutationView } from "../shops/Transmutation";
import Button from "../view/Button";

const useStyles = createUseStyles({
    root: {
        width: "100%",
        height: "100%",
        background: "rgba(25, 25, 25, 0.95)",
        color: "white",
    },
    inner: {
        textAlign: "center",
        margin: "auto",
        position: "absolute",
        top: "45%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        fontSize: "1.2rem",
    },
    scene: {
        position: "relative",
        margin: "36px 0",
        background: `url(${PerionCampImage}) no-repeat`,
        width: "600px",
        height: "450px",
    },
    player: {
        position: "absolute",
        left: "280px",
        bottom: "227px",
        filter: "drop-shadow(0 0 3px #fffee8) drop-shadow(0 0 3px #fffee8)",
    },
    bonfire: {
        position: "absolute",
        left: "200px",
        top: "150px",
        filter: "drop-shadow(0 0 3px #fffee8) drop-shadow(0 0 3px #fffee8)",
    },
    activity: {
        width: "175px",
        margin: "16px",
        background: "#555",
        padding: "24px",
        borderRadius: "8px",
        fontSize: "1rem",
        cursor: "pointer",
        boxShadow: "1px 1px 4px rgba(0, 0, 0, 0.3)",
        transition: "0.1s",

        "&:hover:not(.disabled)": {
            filter: "drop-shadow(0 0 4px #45ff61)",
        },
        "&.disabled": {
            opacity: 0.5,
            cursor: "default",
        },
    },
    activityName: {
        fontSize: "16px",
        marginBottom: "8px",
        paddingBottom: "8px",
        borderBottom: "1px solid rgba(255, 255, 255, 0.5)",
    },
    activitySection: {
        position: "absolute",
        top: "400px",
        left: "50%",
        transform: "translateX(-50%)",
    },
    activityContainer: {
        display: "flex",
    },
    abilitySection: {
        width: "80vw",
        height: "70vh",
        overflow: "auto",
    },
    exitSection: {
        marginTop: "2rem",
    },
    iconContainer: {
        marginBottom: "8px",
        textAlign: "center",
        "& img": {
            maxWidth: "32px",
        },
    },
});

const HEALTH_REGAINED = 0.2;

const CAMP_ACTIVITIES = {
    REMOVE_CARD: "remove-card",
    TRANSMUTE_CARD: "transmute-card",
    UPGRADE_CARD: "upgrade-card",
};

const Camp = ({
    onExit,
    deck,
    player,
    updateDeck,
    updatePlayer,
}: {
    onExit: () => void;
    deck: CombatAbility[];
    player: Player;
    updateDeck: (updated: Ability[]) => void;
    updatePlayer: (updated: any) => void;
}) => {
    const classes = useStyles();

    // Map of { [activityName: string]: number }, number counting how many times that activity has been performed
    const [completedActivities, setCompletedActivities] = useState({});
    const [isRemovingAbility, setIsRemovingAbility] = useState(false);
    const [isUpgradingAbility, setIsUpgradingAbility] = useState(false);
    const [isTransmutingAbility, setIsTransmutingAbility] = useState(false);
    const [numActivitiesRemaining, setNumActivitiesRemaining] = useState(
        1 + player.items.reduce((acc: number, item: Item) => acc + (item?.camp?.extraActivities || 0), 0)
    );

    useEffect(() => {
        const maxHP = getMaxHP(player);
        const additionalHealing = player.items.reduce((acc: number, item: Item) => acc + (item.camp?.healing || 0), 0);
        const healthRegained = Math.floor(maxHP * HEALTH_REGAINED) + additionalHealing;
        updatePlayer({
            HP: Math.min(maxHP, player.HP + healthRegained),
        });
    }, []);

    const completeActivity = (activityKey: string) => {
        setCompletedActivities((prev) => ({
            ...prev,
            [activityKey]: (prev[activityKey] || 0) + 1,
        }));
    };

    const handleRemoveAbility = (updatedDeck: Ability[]) => {
        completeActivity(CAMP_ACTIVITIES.REMOVE_CARD);
        setIsRemovingAbility(false);
        updateDeck(updatedDeck);
        setNumActivitiesRemaining((prev) => prev - 1);
    };

    const doneTransmute = () => {
        completeActivity(CAMP_ACTIVITIES.TRANSMUTE_CARD);
        setNumActivitiesRemaining((prev) => prev - 1);
        setIsTransmutingAbility(false);
    };

    const handleTransmute = (options: { card: string; for: CombatAbility }) => {
        const { card: cardId, for: forCard } = options || {};
        const cardIndex = deck.findIndex((ability) => ability.instanceId === cardId);
        if (cardIndex > -1) {
            const newDeck = deck.slice();
            newDeck[cardIndex] = forCard;
            updateDeck(newDeck);
            doneTransmute();
        }
    };

    if (isRemovingAbility) {
        return <CardRemovalGrid cards={deck} onRemoveAbility={handleRemoveAbility} onCancel={() => setIsRemovingAbility(false)} />;
    }

    const hasTransmutationItem = player.items.some((item) => item.camp?.allowTransmute);
    const canTransmuteAbility = !completedActivities[CAMP_ACTIVITIES.TRANSMUTE_CARD] && numActivitiesRemaining > 0 && hasTransmutationItem;

    if (isTransmutingAbility) {
        return (
            <TransmutationView
                onTransmute={handleTransmute}
                onCancel={doneTransmute}
                deck={deck}
                player={player}
                onExit={() => setIsTransmutingAbility(false)}
                numTransmutations={canTransmuteAbility ? 2 : 0}
                disableBackdrop={true}
            />
        );
    }

    if (isUpgradingAbility) {
        return (
            <CardUpgradeGrid
                cards={deck}
                onCancel={() => setIsUpgradingAbility(false)}
                onConfirm={(updatedDeck) => {
                    updateDeck(updatedDeck);
                    completeActivity(CAMP_ACTIVITIES.UPGRADE_CARD);
                    setIsUpgradingAbility(false);
                    setNumActivitiesRemaining((prev) => prev - 1);
                }}
            />
        );
    }

    const hasMeditateItem = player.items.some((item) => item.camp?.allowAbilityRemoval);
    const canRemoveAbility = !completedActivities[CAMP_ACTIVITIES.REMOVE_CARD] && numActivitiesRemaining > 0 && hasMeditateItem;
    const canUpgradeAbility = numActivitiesRemaining > 0;

    return (
        <div className={classes.root}>
            <div className={classes.inner}>
                <h3>Camp</h3>
                <p>You've regained {HEALTH_REGAINED * 100}% of your HP.</p>
                <div className={classes.scene}>
                    <img src={player.image} className={classes.player} />
                    <img src={CampfireImage} className={classes.bonfire} />
                </div>
                <div className={classes.activitySection}>
                    <div className={classes.activityContainer}>
                        {hasTransmutationItem && (
                            <div
                                className={classNames(classes.activity, {
                                    disabled: !canTransmuteAbility,
                                })}
                                onClick={() => {
                                    if (canTransmuteAbility) {
                                        setIsTransmutingAbility(true);
                                    }
                                }}
                            >
                                <div className={classes.iconContainer}>
                                    <img src={PersonalAnvilImage} />
                                </div>
                                <div className={classes.activityName}>TRANSMUTE</div>
                                Replace an ability with 1 of 3 options.
                            </div>
                        )}
                        {hasMeditateItem && (
                            <div
                                className={classNames(classes.activity, {
                                    disabled: !canRemoveAbility,
                                })}
                                onClick={() => {
                                    if (canRemoveAbility) {
                                        setIsRemovingAbility(true);
                                    }
                                }}
                            >
                                <div className={classes.iconContainer}>
                                    <img src={HerbsImage} />
                                </div>
                                <div className={classes.activityName}>MEDITATE</div>
                                Remove an ability.
                            </div>
                        )}
                        <div
                            className={classNames(classes.activity, {
                                disabled: !canUpgradeAbility,
                            })}
                            onClick={() => {
                                if (canUpgradeAbility) {
                                    setIsUpgradingAbility(true);
                                }
                            }}
                        >
                            <div className={classes.iconContainer}>
                                <img src={WeaponMasteryImage} />
                            </div>
                            <div className={classes.activityName}>HONE</div>
                            Upgrade an ability.
                        </div>
                    </div>
                    <p>Activities remaining: {numActivitiesRemaining}</p>
                    <div className={classes.exitSection}>
                        <Button color={numActivitiesRemaining === 0 ? "primary" : "warning"} onClick={onExit}>
                            Exit
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Camp;
