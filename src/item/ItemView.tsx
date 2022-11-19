import { createUseStyles } from "react-jss";
import { Item } from "./types";

const useStyles = createUseStyles({
    item: {
        display: "inline-block",
        borderRadius: "8px",
        padding: 24,
        verticalAlign: "bottom",
        background: "#666",
        width: "200px",
        minHeight: "150px",
        color: "white",
        cursor: "pointer",
        boxShadow: "1px 1px 4px rgba(0, 0, 0, 0.3)",
        "& hr": {
            opacity: 0.6,
        },
    },
    itemImage: {
        margin: "8px 0",
    },
});

const ItemView = ({ item }: { item: Item }) => {
    const classes = useStyles();
    return (
        <div key={item.name} className={classes.item}>
            <img src={item.image} className={classes.itemImage} />
            <div>{item.name}</div>
            <hr />
            <div>{item.description}</div>
        </div>
    );
};

export default ItemView;
