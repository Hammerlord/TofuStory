import classNames from "classnames";
import { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
import { ACTION_TYPES } from "../ability/types";
import { getActionType } from "../ability/utils";
import { getCharacterStatChanges } from "../battle/utils";
import Armor from "../icon/Armor";
import HealIcon from "../icon/HealIcon";
import HitIcon from "../icon/HitIcon";
import Icon from "../icon/Icon";
import { Heart, PointingDown } from "../images";
import warmush from "../images/warmush.png";
import { Fury } from "../resource/ResourcesView";

const useStyles = createUseStyles({
    header: {
        marginBottom: "8px",
    },
    inner: {
        padding: "16px",
    },
    portrait: {
        maxWidth: "100%",
    },
    portraitContainer: {
        position: "relative",
        cursor: "pointer",
        width: "175px",
        height: "125px",
        margin: "auto",
    },
    center: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translateX(-50%) translateY(-50%)",
        height: "100%",
        width: "100%",
        pointerEvents: "none", // Should be able to interact with the player character through this element
    },
    HP: {
        position: "absolute",
        bottom: "0",
        left: "6%",
    },
    armor: {
        position: "absolute",
        bottom: "0",
        right: "6%",
    },
    "@keyframes indicator": {
        from: {
            transform: "translateY(0)",
        },
        to: {
            transform: "translateY(8px)",
        },
    },
    targetAffectedIndicatorContainer: {
        position: "absolute",
        top: "-56px",
        left: "50%",
        transform: "translateX(-50%)",
    },
    targetAffectedIndicator: {
        animationName: "$indicator",
        animationDuration: "0.5s",
        animationIterationCount: "infinite",
    },
    "@keyframes acting": {
        from: {
            transform: "translateY(0)",
        },
        to: {
            transform: "translateY(-24px)",
        },
    },
    acting: {
        animationName: "$acting",
        animationDuration: "0.5s",
    },
    resource: {
        margin: "0 1px",
    },
    resourceContainer: {
        marginTop: "4px",
    },
});

const PlayerView = ({ player, onClick, action, isAffectedByArea }) => {
    const [oldPlayerState, setOldPlayerState] = useState(player);
    const [statChanges, setStatChanges]: [any, Function] = useState({});
    const classes = useStyles();
    const [isMousingOver, setIsMousingOver] = useState(false);

    useEffect(() => {
        const statChanges = getCharacterStatChanges({
            oldCharacter: oldPlayerState,
            newCharacter: player,
        });

        setStatChanges(statChanges);
        setOldPlayerState(player);
    }, [player]);

    return (
        <div>
            {isAffectedByArea && isMousingOver && (
                <span className={classes.targetAffectedIndicatorContainer}>
                    <Icon
                        icon={<PointingDown />}
                        className={classes.targetAffectedIndicator}
                    />
                </span>
            )}
            <div
                className={classes.portraitContainer}
                onMouseEnter={() => setIsMousingOver(true)}
                onMouseLeave={() => setIsMousingOver(false)}
            >
                {player.HP > 0 && (
                    <img
                        className={classNames(classes.portrait, {
                            [classes.acting]:
                                getActionType(action) === ACTION_TYPES.DAMAGE,
                        })}
                        src={warmush}
                        onClick={onClick}
                    />
                )}
                {
                    <span className={classes.center}>
                        <HitIcon statChanges={statChanges} />
                    </span>
                }
                {
                    <span className={classes.center}>
                        <HealIcon statChanges={statChanges} />
                    </span>
                }
                {
                    <Icon
                        size="lg"
                        icon={<Heart />}
                        text={player.HP}
                        className={classes.HP}
                    />
                }
                <Armor amount={player.armor} className={classes.armor} />
            </div>
            <div className={classes.resourceContainer}>
                {Array.from({ length: player.resources }).map((_, i) => (
                    <Fury key={i} className={classes.resource} />
                ))}
            </div>
        </div>
    );
};

export default PlayerView;
