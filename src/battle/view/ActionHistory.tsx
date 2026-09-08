import { AnimatePresence, motion } from "framer-motion";
import { CombatAbility, CombatEffect } from "../../ability/types";
import { useAppSelector } from "../../hooks";
import { BattleState, EventGroup } from "../types";
import { createUseStyles } from "react-jss";
import Tooltip from "../../view/Tooltip";
import Icon from "../../icon/Icon";
import { HourglassIcon } from "../../images/icons";

const useItemStyles = createUseStyles({
    root: {
        width: "50px",
        height: "50px",
        position: "relative",
        border: "1px solid",
        background: "rgba(0,0,0,0.7)",
        borderRadius: "2px",
    },

    action: {
        minWidth: "30px",
        width: "100%",
        maxHeight: "100%",
    },
    actionContainer: {
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
    },
    actor: {
        width: "25px",
        position: "absolute",
        left: 0,
        top: 0,
    },
});

const useStyles = createUseStyles({
    root: {
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
    },
    hourglassContainer: {
        marginBottom: "4px",
    },
});

const ActionHistoryItem = ({ group }: { group: EventGroup }) => {
    const classes = useItemStyles();
    const event = group.events[0];
    if (!event) {
        return null;
    }

    const { actorName, actorImage, actionParent } = event;
    const image = (actionParent as CombatAbility)?.image || (actionParent as CombatEffect)?.icon;
    if (!image) {
        return null;
    }

    let actionImage;
    if (typeof image === "string") {
        actionImage = <img src={image} className={classes.action} />;
    } else if (typeof image === "function") {
        const ActionIcon = image;
        actionImage = <ActionIcon className={classes.action} />;
    }

    return (
        <Tooltip title={actionParent?.name || ""} placement="left">
            <div className={classes.root}>
                <div className={classes.actionContainer}>{actionImage}</div>
                {actorImage && <img src={actorImage} alt={actorName} className={classes.actor} />}
            </div>
        </Tooltip>
    );
};

const ActionHistory = () => {
    const classes = useStyles();
    // This component only renders if there is a battle state.
    const history: EventGroup[] = useAppSelector((state) => state.battle?.actionHistory)!;

    return (
        <div className={classes.root}>
            <div className={classes.hourglassContainer}>
                <Icon icon={HourglassIcon} />
            </div>
            <AnimatePresence mode="popLayout">
                {history.map((group) => (
                    <motion.div
                        key={group.id}
                        layout
                        initial={{
                            y: "-100%",
                            opacity: 0,
                        }}
                        animate={{
                            y: 0,
                            opacity: 1,
                        }}
                        exit={{
                            y: "100%",
                            opacity: 0,
                        }}
                        transition={{
                            duration: 0.3,
                        }}
                    >
                        <ActionHistoryItem group={group} key={group.id} />
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default ActionHistory;
