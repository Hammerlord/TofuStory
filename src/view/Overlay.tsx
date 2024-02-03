import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
    root: {
        width: "100%",
        height: "100%",
        left: 0,
        top: 0,
        position: "fixed",
        background: "rgba(10, 10, 10, 0.7)",
        zIndex: "3",
    },
});

const Overlay = ({ children }) => {
    const classes = useStyles();
    return <div className={classes.root}>{children}</div>;
};

export default Overlay;
