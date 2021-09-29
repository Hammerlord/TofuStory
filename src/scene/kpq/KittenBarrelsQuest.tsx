import classNames from "classnames";
import { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
import { ClickIndicator, kittenBarrelsImage, shoImage, sleepywoodBG, stefaImage, wessImage } from "../../images";
import Tooltip from "../../view/Tooltip";
import generateCombination from "./generateCombination";

const useStyles = createUseStyles({
    root: {
        background: `url(${sleepywoodBG}) no-repeat`,
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
    character: {
        position: "absolute",
        WebkitFilter: "drop-shadow(0 0 3px #fffee8) drop-shadow(0 0 3px #fffee8)",
        filter: "drop-shadow(0 0 3px #fffee8) drop-shadow(0 0 3px #fffee8)",
        left: "50%",
        transform: "translateX(-50%)",
        cursor: "pointer",
    },
    player: {
        top: 308,
        left: 319,
        height: "70px",
        position: "absolute",
    },
    sho: {
        top: 309,
        left: 139,
        transform: "scale(-1, 1)",
        position: "absolute",
    },
    stefa: {
        top: 257,
        left: 486,
        position: "absolute",
    },
    wess: {
        top: 148,
        left: 700,
        position: "absolute",
    },
    basket: {
        width: 125,
        height: 65,
        position: "absolute",
        cursor: "pointer",
        "& img": {
            left: "50%",
            transform: "translateX(-50%)",
            position: "absolute",
            bottom: 0,
        },
    },
    basket1: {
        top: 144,
        left: 108,
    },
    basket2: {
        top: 207,
        left: 287,
    },
    basket3: {
        top: 144,
        left: 470,
    },
    basket4: {
        top: 83,
        left: 380,
    },
    basket5: {
        top: 83,
        left: 200,
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
    playerImage: {
        maxHeight: 80,
    },
});

const KittenBarrelsQuest = ({ player, onComplete }) => {
    const [correctCombination] = useState(generateCombination({ length: 5, remove: 2 }));
    const [answer, setAnswer] = useState(correctCombination.map(() => null));
    const [selectedPartyMember, setSelectedPartyMember] = useState(null);
    const [blockUI, setBlockUI] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [wessDialog, setWessDialog] = useState("");

    const classes = useStyles();

    const PARTY_MEMBER_IMAGE_MAP = {
        player: player.image,
        stefa: stefaImage,
        sho: shoImage,
    };

    useEffect(() => {
        console.log(correctCombination);
        if (answer.filter((a) => a).length === correctCombination.filter((c) => c).length) {
            setBlockUI(true);
            setWessDialog("Alright, I'm checking if this is the right answer...");
            setTimeout(() => {
                const isCorrectAnswer = answer.every((answer, i) => Boolean(correctCombination[i]) === Boolean(answer));
                if (isCorrectAnswer) {
                    setCompleted(true);
                    setWessDialog("We got it!");
                    setTimeout(() => {
                        onComplete();
                    }, 2000);
                } else {
                    setWessDialog("Looks like that wasn't it. Let's try another combination.");
                    setBlockUI(false);
                    setTimeout(() => {
                        setWessDialog("");
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

    const handleClickSlot = (index: number) => {
        if (!selectedPartyMember || blockUI) {
            return;
        }
        const newAnswer = answer.slice();
        const prevIndex = newAnswer.findIndex((val) => val === selectedPartyMember);
        if (prevIndex > -1) {
            newAnswer[prevIndex] = null;
        }
        newAnswer[index] = selectedPartyMember;
        setAnswer(newAnswer);
        setSelectedPartyMember(null);
    };

    const isUnassigned = (partyMemberName: string): boolean => {
        return answer.every((memberName: string | null) => partyMemberName !== memberName);
    };

    return (
        <div className={classes.root}>
            <div className={classes.overlay}>
                <div className={classes.inner}>
                    <img src={kittenBarrelsImage} />
                    {Object.keys(PARTY_MEMBER_IMAGE_MAP).map((memberName) => {
                        if (isUnassigned(memberName)) {
                            return (
                                <div className={classes[memberName]} key={memberName}>
                                    {!selectedPartyMember && <img src={ClickIndicator} className={classes.clickIndicator} />}
                                    <img
                                        src={PARTY_MEMBER_IMAGE_MAP[memberName]}
                                        onClick={() => handleClickPartyMember(memberName)}
                                        className={classNames(classes.character, {
                                            [classes.selected]: selectedPartyMember === memberName,
                                            [classes.playerImage]: memberName === "player",
                                        })}
                                    />
                                </div>
                            );
                        }
                    })}
                    <Tooltip title={wessDialog} open={Boolean(wessDialog)} placement={"top"}>
                        <img src={wessImage} className={classNames(classes.wess)} />
                    </Tooltip>
                    {answer.map((memberName: string | null, i: number) => (
                        <div key={i} className={classNames(classes.basket, classes[`basket${i + 1}`])} onClick={() => handleClickSlot(i)}>
                            {selectedPartyMember && <img src={ClickIndicator} className={classes.clickIndicator} />}

                            {memberName && (
                                <img
                                    src={PARTY_MEMBER_IMAGE_MAP[memberName]}
                                    onClick={() => handleClickPartyMember(memberName)}
                                    className={classNames({
                                        [classes.selected]: selectedPartyMember === memberName,
                                        [classes.playerImage]: memberName === "player",
                                    })}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default KittenBarrelsQuest;
