import { createUseStyles } from "react-jss";
import { clear } from "../images";
import Overlay from "../view/Overlay";

const useStyles = createUseStyles({
    container: {
        position: "absolute",
        top: "40%",
        left: "50%",
        transform: "translateX(-50%) translateY(-50%)",
        color: "white",
        fontSize: "1.3rem",
        fontWeight: "600",
        textAlign: "center",
    },
    "@keyframes down": {
        from: {
            opacity: 0,
            transform: "translateY(-20%)",
        },
        to: {
            opacity: 1,
            transform: "translateY(0)",
        },
    },
    clearContainer: {
        marginBottom: "2vh",
        height: "130px",
    },
    clear: {
        animationName: "$down",
        animationDuration: "0.5s",
        WebkitFilter: "drop-shadow(0 0 5px black)",
        filter: "drop-shadow(0 0 5px black)",
    },
    labelContainer: {
        background:
            "linear-gradient(90deg, rgba(0,212,255,0) 0%, rgba(0,0,0,0.75) 70%, rgba(0,0,0,0.75) 50%, rgba(0,0,0,0.75) 70%, rgba(0,212,255,0) 100%)",
        padding: "8px 16px",
    },
});

const ClearOverlay = ({ labelText }) => {
    const classes = useStyles();
    return (
        <Overlay>
            <div className={classes.container}>
                <div className={classes.clearContainer}>
                    <img src={clear} className={classes.clear} />
                </div>
                <div className={classes.labelContainer}>{labelText}</div>
            </div>
        </Overlay>
    );
};

export default ClearOverlay;
