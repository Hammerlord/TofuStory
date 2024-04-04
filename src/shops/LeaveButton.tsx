import { createUseStyles } from "react-jss";
import Icon from "../icon/Icon";
import { DoorIcon } from "../images/icons";
import Button from "../view/Button";

const useStyles = createUseStyles({
    leaveText: {
        marginLeft: 8,
    },
});

const LeaveButton = ({ onClick, text = "Leave Shop" }) => {
    const classes = useStyles();
    return (
        <Button color="secondary" variant="contained" onClick={onClick}>
            <Icon icon={DoorIcon} size="sm" /> <span className={classes.leaveText}>{text}</span>
        </Button>
    );
};

export default LeaveButton;
