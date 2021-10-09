import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
    root: {
        fontSize: "0.8rem",
    },
    area: {
        width: "14px",
        height: "14px",
        backgroundColor: "rgba(0, 0, 0, 0.25)",
        display: "inline-block",
        fontSize: "0.7rem",
        color: "white",
        verticalAlign: "bottom",

        "&:not(:last-child)": {
            marginRight: "4px",
        },
    },
    mainTarget: {
        width: "14px",
        height: "14px",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "inline-block",
        marginRight: "4px",
        color: "white",
        fontSize: "0.7rem",
        verticalAlign: "bottom",
    },
});

const Area = ({ area, damage, secondaryDamage }) => {
    const classes = useStyles();
    const areaIndicator = Array.from({ length: area }).map((_, i) => (
        <span className={classes.area} key={i}>
            {secondaryDamage || damage}
        </span>
    ));
    return (
        <div className={classes.root}>
            Area: {areaIndicator}
            <span className={classes.mainTarget}>{damage}</span>
            {areaIndicator}
        </div>
    );
};

export default Area;
