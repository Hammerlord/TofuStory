import { Button } from "@material-ui/core";
import classNames from "classnames";
import { useState } from "react";
import { createUseStyles } from "react-jss";
import { campfire, perioncamp } from "../images";
import CardGrid from "../Menu/CardGrid";
const useStyles = createUseStyles({
    root: {
        width: "100%",
        height: "100%",
        background: "rgba(50, 50, 50, 0.9)",
        color: "white",
    },
    inner: {
        textAlign: "center",
        margin: "auto",
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        fontSize: "1.2rem",
    },
    scene: {
        position: "relative",
        margin: "36px 0",
        background: `url(${perioncamp}) no-repeat`,
        width: "600px",
        height: "450px",
    },
    player: {
        position: "absolute",
        left: "280px",
        top: "112px",
        WebkitFilter: "drop-shadow(0 0 3px #fffee8) drop-shadow(0 0 3px #fffee8)",
        filter: "drop-shadow(0 0 3px #fffee8) drop-shadow(0 0 3px #fffee8)",
    },
    bonfire: {
        position: "absolute",
        left: "200px",
        top: "150px",
        WebkitFilter: "drop-shadow(0 0 3px #fffee8) drop-shadow(0 0 3px #fffee8)",
        filter: "drop-shadow(0 0 3px #fffee8) drop-shadow(0 0 3px #fffee8)",
    },
    activity: {
        width: "175px",
        margin: "16px",
        background: "#666",
        padding: "24px",
        borderRadius: "8px",
        fontSize: "1rem",
        cursor: "pointer",

        "&.disabled": {
            opacity: 0.5,
            cursor: "default",
        },
    },
    activityName: {
        fontSize: "20px",
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
});
const Camp = ({ onExit, deck, player, updateDeck }) => {
    const classes = useStyles();
    const [isRemovingAbility, setIsRemovingAbility] = useState(false);
    const [hasRemovedAbility, setHasRemovedAbility] = useState(false);
    const [selectedAbilityIndexToRemove, setSelectedAbilityIndexToRemove] = useState(null);

    const handleRemoveAbility = () => {
        if (selectedAbilityIndexToRemove === null) {
            return;
        }
        setHasRemovedAbility(true);
        setIsRemovingAbility(false);
        const updatedDeck = deck.slice();
        updatedDeck.splice(selectedAbilityIndexToRemove, 1);
        updateDeck(updatedDeck);
    };

    if (isRemovingAbility) {
        return (
            <div className={classes.root}>
                <div className={classes.inner}>
                    <h3>Select an ability to remove</h3>
                    <div>Keep your skills focused by removing an ability from your deck. This action is permanent.</div>
                    <div className={classes.abilitySection}>
                        <CardGrid
                            deck={deck}
                            selectedAbilityIndex={selectedAbilityIndexToRemove}
                            highlightColour={"#45ff61"}
                            onClickAbility={(_, i: number) => setSelectedAbilityIndexToRemove(i)}
                        />
                    </div>
                    <Button variant={"contained"} color={"secondary"} onClick={handleRemoveAbility}>
                        Ommmmmm (confirm)
                    </Button>
                    <Button variant={"contained"} onClick={() => setIsRemovingAbility(false)}>
                        Cancel
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className={classes.root}>
            <div className={classes.inner}>
                <h3>Camp</h3>
                <div className={classes.scene}>
                    <img src={player.image} className={classes.player} />
                    <img src={campfire} className={classes.bonfire} />
                </div>
                <div className={classes.activitySection}>
                    <div className={classes.activityContainer}>
                        <div
                            className={classNames(classes.activity, {
                                disabled: hasRemovedAbility,
                            })}
                            onClick={() => {
                                if (!hasRemovedAbility) {
                                    setIsRemovingAbility(true);
                                }
                            }}
                        >
                            <div className={classes.activityName}>Meditate</div>
                            Remove one of your abilities.{" "}
                        </div>
                        <div className={classes.activity}>Not yet available</div>
                        <div className={classes.activity} onClick={onExit}>
                            Continue journey
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Camp;
