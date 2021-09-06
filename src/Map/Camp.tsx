import { Button } from "@material-ui/core";
import { createUseStyles } from "react-jss";
const useStyles = createUseStyles({
    root: {
        width: "100%",
        height: "100%",
        background: "rgba(50, 50, 50, 0.9)",
        color: "white",
        position: "fixed",
        zIndex: 5,
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
});
const Camp = ({ onExit }) => {
    const classes = useStyles();
    return (
        <div className={classes.root}>
            <div className={classes.inner}>
                <h2>Camp</h2>
                TODO
                <br />
                <Button onClick={onExit} variant={"contained"} color={"primary"}>
                    Continue
                </Button>
            </div>
        </div>
    );
};

export default Camp;
