import { createUseStyles } from "react-jss";
import { ITEMS } from "../Map/routes/eventList";
import ItemView from "../item/ItemView";
import { glassShoe, goldenHammer, incense, leatherSandals, redHeadband } from "../item/items";
import { RARITIES } from "../item/types";

const useStyles = createUseStyles({
    root: {
        marginTop: 64,
        overflowY: "scroll",
        maxHeight: "calc(100% - 64px)",
    },
    item: {
        display: "inline-block",
        borderRadius: "8px",
        margin: 16,
    },
});

export const ITEM_MASTERLIST = [goldenHammer, incense, leatherSandals, glassShoe, redHeadband, ...ITEMS];

const DevItemViewer = () => {
    const classes = useStyles();
    return (
        <div className={classes.root}>
            <p>{ITEM_MASTERLIST.length} Items</p>
            {ITEM_MASTERLIST.sort((a, b) => {
                const rarityChart = {
                    [RARITIES.COMMON]: 1,
                    [RARITIES.UNCOMMON]: 2,
                    [RARITIES.RARE]: 3,
                };
                return rarityChart[a.rarity || RARITIES.COMMON] - rarityChart[b.rarity || RARITIES.COMMON];
            }).map((item) => (
                <div className={classes.item}>
                    <ItemView item={item} />
                </div>
            ))}
        </div>
    );
};

export default DevItemViewer;
