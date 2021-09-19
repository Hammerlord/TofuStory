import { Button } from "@material-ui/core";
import { useState } from "react";
import { createUseStyles } from "react-jss";
import AbilityView from "../ability/AbilityView/AbilityView";
import { Ability } from "../ability/types";
import { JOB_CARD_MAP, WARRIOR_SECONDARY_JOBS } from "../ability";
import { PLAYER_CLASSES } from "../Menu/types";
import Overlay from "../view/Overlay";
import classNames from "classnames";
import Tooltip from "../view/Tooltip";

const CLASS_UP_MAP = {
    [PLAYER_CLASSES.WARRIOR]: WARRIOR_SECONDARY_JOBS,
};

const useStyles = createUseStyles({
    inner: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translateX(-50%) translateY(-50%)",
        textAlign: "center",
        width: "100%",
        color: "rgba(255, 255, 255, 0.9)",
    },
    job: {
        display: "inline-block",
        width: "calc(25% - 32px)",
        maxWidth: "375px",
        margin: "0 16px",
        background: "rgba(75, 75, 75, 0.9)",
        padding: "32px",
        borderRadius: "4px",
        cursor: "pointer",
    },
    selected: {
        boxShadow: "0 0 8px 4px #45ff61",
    },
    jobTitle: {
        borderBottom: "1px solid rgba(255, 255, 255, 0.9)",
        marginBottom: "16px",
        paddingBottom: "8px",
        textTransform: "uppercase",
    },
    titleContainer: {
        display: "inline-block",
        background:
            "linear-gradient(90deg, rgba(0,212,255,0) 0%, rgba(0,0,0,0.75) 70%, rgba(0,0,0,0.75) 50%, rgba(0,0,0,0.75) 70%, rgba(0,212,255,0) 100%)",
        padding: "8px 96px",
        color: "white",
        marginBottom: "24px",
    },
    ability: {
        display: "inline-block",
        margin: "16px 8px",
    },
    abilityIcon: {
        display: "inline-block",
        margin: "8px 4px",
        "& img": {
            maxWidth: "40px",
        },
    },
    selectButtonContainer: {
        marginTop: "48px",
    },
});

const JobUp = ({ player, onSelectClass }) => {
    const secondaryJobs = Object.values(CLASS_UP_MAP[player.class]);
    const classes = useStyles();
    const [selectedJob, setSelectedJob] = useState(null);

    const handleClickSelect = () => {
        //onSelectClass({ job: selectedJob, jobUpAbilities: JOB_CARD_MAP[selectedJob].onJobUp });
        // Testing
        onSelectClass({ job: selectedJob, jobUpAbilities: JOB_CARD_MAP[selectedJob].all });
    };

    return (
        <Overlay>
            <div className={classes.inner}>
                <div>
                    <div className={classes.titleContainer}>
                        <h2>Job Up!</h2>
                    </div>
                    <div>
                        {secondaryJobs.map((job: string) => (
                            <div
                                className={classNames(classes.job, {
                                    [classes.selected]: selectedJob === job,
                                })}
                                key={job}
                                onClick={() => setSelectedJob(job)}
                            >
                                <div className={classes.jobTitle}>{job}</div>
                                You acquire
                                <div>
                                    {JOB_CARD_MAP[job].onJobUp.map((card: Ability) => (
                                        <div className={classes.ability} key={card.name}>
                                            <AbilityView ability={card} />
                                        </div>
                                    ))}
                                </div>
                                With the potential to learn
                                <div>
                                    {JOB_CARD_MAP[job].all.map((card: Ability) => (
                                        <Tooltip title={<AbilityView ability={card} />} key={card.name}>
                                            <div className={classes.abilityIcon}>
                                                <img src={card.image} />
                                            </div>
                                        </Tooltip>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className={classes.selectButtonContainer}>
                    <Button variant="contained" color="primary" disabled={!selectedJob} onClick={handleClickSelect}>
                        Select!
                    </Button>
                </div>
            </div>
        </Overlay>
    );
};

export default JobUp;
