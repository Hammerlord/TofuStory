import classNames from "classnames";
import { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
import { ACTION_TYPES, EFFECT_TYPES } from "../ability/types";
import { Zzz, Dizzy, PointingDown, Heart, CrossedSwords } from "../images";
import HitIcon from "../icon/HitIcon";
import { getCharacterStatChanges } from "../battle/utils";
import { getActionType } from "../ability/utils";
import Icon from "../icon/Icon";
import Bleed from "../icon/Bleed";

const useStyles = createUseStyles({
    root: {
        minWidth: "20%",
        cursor: "pointer",
        position: "relative",
    },
    header: {
        textAlign: "center",
        left: "50%",
        top: "-16px",
        transform: "translateX(-50%)",
        position: "absolute",
    },
    inner: {
        padding: "16px 32px",
    },
    portrait: {
        maxWidth: "100%",
        maxHeight: "100%",
        minWidth: "50px",
        margin: "auto",
        alignSelf: "flex-end",
    },
    portraitContainer: {
        position: "relative",
        height: "140px",
        display: "flex",
    },
    HP: {
        position: "absolute",
        bottom: "-6%",
        left: "0",
    },
    damage: {
        position: "absolute",
        bottom: "-6%",
        right: "0",
    },
    hit: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translateX(-50%) translateY(-50%)",
    },
    "@keyframes upAndDown": {
        from: {
            transform: "translateY(0)",
        },
        to: {
            transform: "translateY(8px)",
        },
    },
    targetAffectedIndicatorContainer: {
        width: "24px",
        height: "24px",
        position: "absolute",
        top: "-64px",
        left: "50%",
        transform: "translateX(-50%)",
    },
    targetAffectedIndicator: {
        width: "100%",
        animationName: "$upAndDown",
        animationDuration: "0.5s",
        animationIterationCount: "infinite",
    },
    "@keyframes actionIcon": {
        from: {
            transform: "translateY(0)",
            opacity: 3,
        },
        to: {
            transform: "translateY(-24px)",
            opacity: 0,
        },
    },
    actionIcon: {
        width: "48px",
        height: "48px",
        position: "absolute",
        right: "8px",
        top: "24px",
        animation: "$actionIcon 1s forwards",
    },
    "@keyframes acting": {
        from: {
            transform: "translateY(0)",
        },
        to: {
            transform: "translateY(24px)",
        },
    },
    acting: {
        animationName: "$acting",
        animationDuration: "0.5s",
    },
    stun: {
        width: "48px",
        height: "48px",
        position: "absolute",
        left: "40%",
        top: "16px",
        animationName: "$upAndDown",
        animationDuration: "1s",
        animationIterationCount: "infinite",
        animationDirection: "alternate-reverse",
    },
    bleed: {
        display: "flex",
        position: "absolute",
        top: "-8px",
        left: "50%",
        transform: "translateX(-50%)",
    },
});

const EnemyView = ({ enemy, onClick, isAffectedByArea, action, ...other }) => {
    const [statChanges, setStatChanges]: [any, Function] = useState({});
    const [oldEnemyState, setOldEnemyState] = useState(enemy);
    const classes = useStyles();

    useEffect(() => {
        if (enemy === null || oldEnemyState === null) {
            setOldEnemyState(enemy);
            return;
        }

        const statChanges = getCharacterStatChanges({
            oldCharacter: oldEnemyState,
            newCharacter: enemy,
        });

        setStatChanges(statChanges);
        setOldEnemyState(enemy);
    }, [enemy]);

    const hasAilment = (type: EFFECT_TYPES) => {
        return enemy?.effects?.some((effect) => effect.type === type);
    };

    const isStunned = hasAilment(EFFECT_TYPES.STUN);
    const bleeds =
        enemy?.effects?.filter((effect) => effect.type === EFFECT_TYPES.BLEED) ||
        [];

    return (
        <div className={classes.root} onClick={onClick} {...other}>
            <div className={classes.inner}>
                {isAffectedByArea && (
                    <span className={classes.targetAffectedIndicatorContainer}>
                        <Icon
                            icon={<PointingDown />}
                            className={classes.targetAffectedIndicator}
                        />
                    </span>
                )}
                {enemy && (
                    <>
                        {enemy.HP > 0 && (
                            <div className={classes.header}>
                                <span>{enemy.name}</span>
                            </div>
                        )}
                        <div className={classes.portraitContainer}>
                            {enemy.HP > 0 && (
                                <>
                                    <img
                                        className={classNames(
                                            classes.portrait,
                                            {
                                                [classes.acting]:
                                                    getActionType(action) ===
                                                    ACTION_TYPES.DAMAGE,
                                            }
                                        )}
                                        src={enemy.image}
                                    />
                                    <Icon
                                        className={classes.HP}
                                        icon={<Heart />}
                                        size={"lg"}
                                        text={enemy.HP}
                                    />
                                    <Icon
                                        className={classes.damage}
                                        icon={<CrossedSwords />}
                                        size={"lg"}
                                        text={enemy.damage}
                                    />

                                    {isStunned && (
                                        <Icon
                                            icon={<Dizzy />}
                                            size="xl"
                                            className={classes.stun}
                                        />
                                    )}
                                    <div className={classes.bleed}>
                                        {bleeds.map((bleed, i: number) => (
                                            <Bleed
                                                key={i}
                                                amount={bleed.duration}
                                            />
                                        ))}
                                    </div>
                                    {getActionType(action) ===
                                        ACTION_TYPES.NONE && (
                                        <Icon
                                            icon={<Zzz />}
                                            size="xl"
                                            className={classes.actionIcon}
                                        />
                                    )}
                                </>
                            )}
                            {
                                <span className={classes.hit}>
                                    <HitIcon statChanges={statChanges} />
                                </span>
                            }
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default EnemyView;
