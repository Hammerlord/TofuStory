import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
    root: {
        padding: "16px 0",
        fontWeight: "bold",
        background:
            "linear-gradient(90deg, rgba(0,212,255,0) 0%, rgba(0,0,0,0.9) 30%, rgba(0,0,0,0.9) 50%, rgba(0,0,0,0.9) 30%, rgba(0,212,255,0) 100%)",
        color: "white",
        textAlign: "center",
        fontSize: "24px",
    },
});

const BannerNotice = ({ children }) => {
    const classes = useStyles();
    return <div className={classes.root}>{children}</div>;
};

export default BannerNotice;
