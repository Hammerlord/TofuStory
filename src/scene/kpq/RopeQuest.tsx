import classNames from "classnames";
import { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
import { ClickIndicator, ropequestBG, shoImage, shoRopeImage, stefaImage, stefaRopeImage, swampBG, wessImage } from "../../images";
import { getRandomInt } from "../../utils";
import Tooltip from "../../view/Tooltip";

const getCorrectCombination = (length = 4) => {
    const nums = Array.from({ length }).map((_, i) => true);
    const index = getRandomInt(0, nums.length - 1);
    nums[index] = null;
    return nums;
};

const useStyles = createUseStyles({
    root: {
        background: `url(${swampBG}) no-repeat`,
        position: "relative",
        width: "100%",
        height: "100%",
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
    rope: {
        width: 30,
        height: 150,
        position: "absolute",
        cursor: "pointer",
        "& img": {
            left: "50%",
            transform: "translateX(-50%)",
            position: "absolute",
        },
    },
    rope1: {
        left: 338,
        top: 75,
    },
    rope2: {
        left: 474,
        top: 96,
    },
    rope3: {
        left: 304,
        top: 289,
    },
    rope4: {
        left: 578,
        top: 291,
    },
    character: {
        WebkitFilter: "drop-shadow(0 0 3px #fffee8) drop-shadow(0 0 3px #fffee8)",
        filter: "drop-shadow(0 0 3px #fffee8) drop-shadow(0 0 3px #fffee8)",
        cursor: "pointer",
    },
    stefa: {
        left: 450,
        top: 479,
        position: "absolute",
    },
    wess: {
        left: 800,
        top: 260,
        position: "absolute",
    },
    player: {
        position: "absolute",
        left: 657,
        top: 447,
    },
    playerImage: {
        maxHeight: 80,
    },
    sho: {
        left: 150,
        top: 462,
        transform: "scale(-1, 1)",
        position: "absolute",
    },
    selected: {
        WebkitFilter: "drop-shadow(0 0 3px #45ff61) drop-shadow(0 0 3px #45ff61)",
        filter: "drop-shadow(0 0 3px #45ff61) drop-shadow(0 0 3px #45ff61)",
    },
    clickIndicator: {
        position: "absolute",
        top: -40,
        left: "50%",
        transform: "translateX(-50%)",
    },
});

/**
 * Rope ID assignments are:
 * 1  2
 * 3  4
 */
const RopeQuest = ({ player, onComplete }) => {
    const [correctCombination] = useState(getCorrectCombination());
    const [answer, setAnswer] = useState([null, null, null, null]);
    const [selectedPartyMember, setSelectedPartyMember] = useState(null);
    const [blockUI, setBlockUI] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [wrongAnswer, setWrongAnswer] = useState(false);
    const [movedPlayerTimes, setMovedPlayerTimes] = useState(0);
    const [shoDialog, setShoDialog] = useState("");

    const classes = useStyles();

    useEffect(() => {
        if (answer.filter((a) => a).length === correctCombination.filter((c) => c).length) {
            setBlockUI(true);
            setTimeout(() => {
                const isCorrectAnswer = answer.every((answer, i) => Boolean(correctCombination[i]) === Boolean(answer));
                if (isCorrectAnswer) {
                    setCompleted(true);
                    setTimeout(() => {
                        onComplete();
                    }, 2000);
                } else {
                    setWrongAnswer(true);
                    setBlockUI(false);
                    setTimeout(() => {
                        setWrongAnswer(false);
                    }, 2000);
                }
            }, 3000);
        }
    }, [answer]);

    const handleClickPartyMember = (partyMemberName: string) => {
        if (blockUI) {
            return;
        }
        if (selectedPartyMember === partyMemberName) {
            setSelectedPartyMember(null);
        } else if (!selectedPartyMember) {
            setSelectedPartyMember(partyMemberName);
        }
    };

    const onPlayerMoved = () => {
        const newMovedTimes = movedPlayerTimes + 1;
        setMovedPlayerTimes(newMovedTimes);
        if (newMovedTimes === 1) {
            setShoDialog("Seriously?");
            setTimeout(() => {
                setShoDialog("");
            }, 2000);
        }
    };

    const handleClickRope = (ropeId: number) => {
        if (!selectedPartyMember || blockUI) {
            return;
        }
        const newAnswer = answer.slice();
        const prevIndex = newAnswer.findIndex((val) => val === selectedPartyMember);
        if (prevIndex > -1) {
            newAnswer[prevIndex] = null;
        }
        newAnswer[ropeId] = selectedPartyMember;
        setAnswer(newAnswer);
        setSelectedPartyMember(null);
        if (selectedPartyMember === "player") {
            onPlayerMoved();
        }
    };

    const PARTYMEMBER_BASE_IMAGE_MAP = {
        player: player.image,
        stefa: stefaImage,
        sho: shoImage,
    };

    const PARTY_MEMBER_ROPE_MAP = {
        player: player.image,
        stefa: stefaRopeImage,
        sho: shoRopeImage,
    };

    const isUnassigned = (partyMemberName: string): boolean => {
        return answer.every((memberName: string | null) => partyMemberName !== memberName);
    };

    const wessDialog = (() => {
        if (completed) {
            return "We got it!";
        }
        if (blockUI) {
            return "Alright, I'm checking if this is the right answer...";
        }
        if (wrongAnswer) {
            return "Looks like that wasn't it. Let's try another combination.";
        }
        return "";
    })();

    const getDialog = (memberName: "sho" | string) => {
        if (memberName === "sho") {
            return shoDialog;
        }

        return "";
    };

    return (
        <div className={classes.root}>
            <div className={classes.overlay}>
                <div className={classes.inner}>
                    <img src={ropequestBG} />
                    {answer.map((memberName: string | null, i: number) => (
                        <div className={classNames(classes[`rope${i + 1}`], classes.rope)} onClick={() => handleClickRope(i)} key={i}>
                            {selectedPartyMember && <img src={ClickIndicator} className={classes.clickIndicator} />}
                            {memberName && (
                                <Tooltip title={getDialog(memberName)} open={Boolean(getDialog(memberName))} placement={"top"}>
                                    <img
                                        src={PARTY_MEMBER_ROPE_MAP[memberName]}
                                        onClick={() => handleClickPartyMember(memberName)}
                                        className={classNames({
                                            [classes.selected]: selectedPartyMember === memberName,
                                            [classes.playerImage]: memberName === "player",
                                        })}
                                    />
                                </Tooltip>
                            )}
                        </div>
                    ))}
                    {Object.keys(PARTYMEMBER_BASE_IMAGE_MAP).map((memberName) => {
                        if (isUnassigned(memberName)) {
                            return (
                                <div className={classes[memberName]} key={memberName}>
                                    {!selectedPartyMember && <img src={ClickIndicator} className={classes.clickIndicator} />}
                                    <Tooltip title={getDialog(memberName)} open={Boolean(getDialog(memberName))} placement={"top"}>
                                        <img
                                            src={PARTYMEMBER_BASE_IMAGE_MAP[memberName]}
                                            onClick={() => handleClickPartyMember(memberName)}
                                            className={classNames(classes.character, {
                                                [classes.selected]: selectedPartyMember === memberName,
                                                [classes.playerImage]: memberName === "player",
                                            })}
                                        />
                                    </Tooltip>
                                </div>
                            );
                        }
                    })}
                    <Tooltip title={wessDialog} open={Boolean(wessDialog)} placement={"top"}>
                        <img src={wessImage} className={classNames(classes.wess)} />
                    </Tooltip>
                </div>
            </div>
        </div>
    );
};

export default RopeQuest;
