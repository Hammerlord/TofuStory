import { LinearProgress } from "@material-ui/core";
import classNames from "classnames";
import { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
import uuid from "uuid";
import { bystanderImage, ClickIndicator, kerningBG, kerningSewerEntranceFull, lakelisImage } from "../../../images";
import { getRandomArbitrary, getRandomInt } from "../../../utils";
import Tooltip from "../../../view/Tooltip";
import { SceneProps } from "../../types";
import getBystanderDialogue from "./getBystanderDialogue";

const lakelisX = 772;

const useStyles = createUseStyles({
    root: {
        background: `url(${kerningBG}) no-repeat`,
        position: "relative",
        width: "100%",
        height: "100%",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
    },
    overlay: {
        width: "100%",
        height: "100%",
        background: "rgba(25, 25, 25, 0.8)",
        position: "absolute",
    },
    inner: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translateX(-50%) translateY(-50%)",
        textAlign: "center",
    },
    scene: {
        position: "relative",
        background: `url(${kerningSewerEntranceFull}) no-repeat`, // placeholder...
        width: "1200px",
        height: "616px",
    },
    character: {
        position: "absolute",
        WebkitFilter: "drop-shadow(0 0 3px #fffee8) drop-shadow(0 0 3px #fffee8)",
        filter: "drop-shadow(0 0 3px #fffee8) drop-shadow(0 0 3px #fffee8)",
        cursor: "pointer",
    },
    lakelis: {
        top: 303,
        left: lakelisX,
    },
    flip: {
        transform: "scale(-1, 1)",
    },
    bystander: {
        top: 303,
        width: 48,
    },
    speechBubble: {
        "&&": {
            maxWidth: "100px",
        },
    },
    clickIndicator: {
        position: "fixed",
        zIndex: 10000,
        top: 265,
        left: lakelisX + 30,
        transform: "translateX(-50%)",
    },
    spinLeft: {
        animation: "$rotation 0.5s infinite linear",
    },
    "@keyframes rotation": {
        "100%": {
            transform: "rotate(360deg)",
        },
    },
    progressContainer: {},
});

const MAX_BYSTANDERS = 8;
const CLICKS_TO_COMPLETE = 10;

const LakelisClickQuest = ({ onComplete }: SceneProps) => {
    const [clickedLakelisTimes, setClickedLakelisTimes] = useState(0);
    const [timer, setTimer] = useState(0);
    const classes = useStyles();
    const makeBystander = (left?: number) => {
        return {
            id: uuid.v4(),
            left: left || 772 + getRandomArbitrary(-100, 100),
            flip: Math.random() < 0.5,
            text: Math.random() < 0.7 ? getBystanderDialogue() : "",
            clicked: null,
            trajectory: [0, 0],
            top: 303,
        };
    };
    const [bystanders, setBystanders] = useState(
        Array.from({ length: 4 }).map((_, i) => makeBystander(650 + i * getRandomArbitrary(20, 40)))
    );

    useEffect(() => {
        const intervalTime = 10;
        const interval = setInterval(() => {
            const doFlip = (left: number, flipped: boolean) => {
                if (flipped) {
                    return Math.random() < (left - lakelisX) / 3000;
                } else {
                    return Math.random() < (lakelisX - left) / 3000;
                }
            };
            const newBystanders = bystanders
                .filter(({ clicked }) => {
                    return !clicked || Date.now() - clicked < 2000;
                })
                .map((bystander) => {
                    const { left, top, flip, clicked, trajectory } = bystander;
                    const [velocityX, velocityY] = trajectory;

                    if (clicked) {
                        return {
                            ...bystander,
                            left: left + velocityX,
                            top: top + velocityY,
                        };
                    }

                    const flipped = doFlip(left, flip) ? !flip : flip;
                    return {
                        ...bystander,
                        flip: flipped,
                        left: left + 2 * (flipped ? 1 : -1),
                    };
                });

            const newTimer = timer + intervalTime;
            if (newTimer >= 700) {
                if (bystanders.length <= MAX_BYSTANDERS) {
                    const numBystandersToGenerate = getRandomInt(1, Math.min(MAX_BYSTANDERS - bystanders.length, 3));
                    for (let i = 0; i < numBystandersToGenerate; ++i) {
                        newBystanders.push(makeBystander());
                    }
                }

                setTimer(0);
            } else {
                setTimer(newTimer);
            }

            setBystanders(newBystanders);
        }, intervalTime);

        return () => clearInterval(interval);
    }, [bystanders]);

    const getVelocityDimension = () => {
        return getRandomInt(3, 7) * 2 * (Math.random() < 0.5 ? -1 : 1);
    };

    const handleClickBystander = (clickedId: string) => {
        setBystanders((prev) =>
            prev.map((bystander) => {
                const { id } = bystander;
                if (clickedId !== id) {
                    return bystander;
                }

                return {
                    ...bystander,
                    clicked: Date.now(),
                    trajectory: [getVelocityDimension(), getVelocityDimension()],
                };
            })
        );
    };

    const handleClickLakelis = () => {
        const clickedTimes = clickedLakelisTimes + 1;
        if (clickedTimes >= CLICKS_TO_COMPLETE) {
            onComplete();
        }
        setClickedLakelisTimes(clickedTimes);
    };

    return (
        <div className={classes.root}>
            <div className={classes.overlay}>
                <div className={classes.inner}>
                    <div className={classes.scene}>
                        <div className={classNames(classes.lakelis, classes.character)}>
                            <img src={lakelisImage} onClick={handleClickLakelis} />
                        </div>

                        {bystanders.map(({ flip, left, top, text, clicked, id }, i) => {
                            const bystanderImg = (
                                <img
                                    src={bystanderImage}
                                    className={classNames(classes.character, classes.bystander, {
                                        [classes.flip]: flip && !clicked,
                                        [classes.spinLeft]: clicked,
                                    })}
                                    style={{ left, top }}
                                    onClick={() => handleClickBystander(id)}
                                    key={id}
                                />
                            );
                            if (text) {
                                return (
                                    <Tooltip
                                        placement={"top"}
                                        arrow
                                        title={text}
                                        open={Boolean(text)}
                                        key={id}
                                        classes={{ tooltip: classes.speechBubble }}
                                        PopperProps={{ disablePortal: true }}
                                    >
                                        {bystanderImg}
                                    </Tooltip>
                                );
                            }

                            return bystanderImg;
                        })}

                        <div className={classes.progressContainer}>
                            <LinearProgress
                                color="secondary"
                                value={(clickedLakelisTimes / CLICKS_TO_COMPLETE) * 100}
                                variant="determinate"
                            />
                        </div>

                        <img src={ClickIndicator} className={classes.clickIndicator} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LakelisClickQuest;
