import { createUseStyles } from "react-jss";
import { ALL_ITEMS } from "../Map/routes/eventList";

const useStyles = createUseStyles({
    root: {
        marginTop: 64,
        "& hr": {
            opacity: 0.7,
        },
    },
    item: {
        display: "inline-block",
        borderRadius: "8px",
        margin: 24,
        padding: 24,
        verticalAlign: "bottom",
        background: "#666",
        width: "200px",
        minHeight: "150px",
    },
    itemImage: {
        margin: "8px 0",
    },
});

const DevItemViewer = () => {
    const classes = useStyles();
    return (
        <div className={classes.root}>
            {ALL_ITEMS.map((item) => (
                <div key={item.name} className={classes.item}>
                    <img src={item.image} className={classes.itemImage} />
                    <div>{item.name}</div>
                    <hr />
                    <div>{item.description}</div>
                </div>
            ))}
        </div>
    );
};

export default DevItemViewer;
