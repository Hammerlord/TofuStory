import { LinearProgress } from "@material-ui/core";
import { createUseStyles } from "react-jss";
import Tooltip from "../view/Tooltip";

const useStyles = createUseStyles({
    root: {
        maxWidth: "50px",
        margin: "8px auto",
        "& .MuiLinearProgress-root": {
            height: "10px",
            borderRadius: "2px",
            border: "2px solid rgba(0, 0, 0, 0.5)",
            backgroundColor: "rgba(255, 255, 255, 0.5)",

            "& .MuiLinearProgress-bar": {
                backgroundColor: "#fc4503",
            },
        },
    },
});

const ResourceBar = ({ resources = 0, maxResources = 0 }) => {
    const tooltipContents = <div>Accumulating energy for a special ability...</div>;
    const classes = useStyles();
    return (
        <Tooltip title={tooltipContents}>
            <div className={classes.root}>
                <LinearProgress color="secondary" value={(resources / maxResources) * 100} variant="determinate" />
            </div>
        </Tooltip>
    );
};

export default ResourceBar;
