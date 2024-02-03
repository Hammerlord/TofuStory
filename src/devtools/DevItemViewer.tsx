import { createUseStyles } from "react-jss";
import { glassShoe, goldenHammer, incense, leatherSandals } from "../item/items";
import { ITEMS } from "../Map/routes/eventList";

const useStyles = createUseStyles({
    root: {
        marginTop: 64,
        overflowY: "scroll",
        maxHeight: "calc(100% - 64px)",
        "& hr": {
            opacity: 0.7,
        },
    },
    item: {
        display: "inline-block",
        borderRadius: "8px",
        margin: 16,
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

export const ITEM_MASTERLIST = [goldenHammer, incense, leatherSandals, glassShoe, ...ITEMS];

const DevItemViewer = () => {
    const classes = useStyles();
    return (
        <div className={classes.root}>
            <p>{ITEM_MASTERLIST.length} Items</p>
            {ITEM_MASTERLIST.map((item) => (
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
