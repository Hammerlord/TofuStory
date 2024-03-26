import { createUseStyles } from "react-jss";
import { CLASS_ITEMS, ITEMS } from "../Map/routes/eventList";
import ItemView from "../item/ItemView";
import { glassShoe, goldenHammer, incense, unsignedLetter } from "../item/items";
import { RARITIES } from "../item/types";
import { PLAYER_CLASSES } from "../Menu/types";

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

export const ITEM_MASTERLIST = [goldenHammer, incense, glassShoe, unsignedLetter, ...ITEMS];

const DevItemViewer = () => {
    const classes = useStyles();

    const listItems = (list) => {
        return list
            .sort((a, b) => {
                const rarityChart = {
                    [RARITIES.COMMON]: 1,
                    [RARITIES.UNCOMMON]: 2,
                    [RARITIES.RARE]: 3,
                };
                return rarityChart[a.rarity || RARITIES.COMMON] - rarityChart[b.rarity || RARITIES.COMMON];
            })
            .map((item) => (
                <div className={classes.item}>
                    <ItemView item={item} />
                </div>
            ));
    };
    return (
        <div className={classes.root}>
            <p>{ITEM_MASTERLIST.length} Items</p>
            {listItems(ITEM_MASTERLIST)}

            <p>
                {PLAYER_CLASSES.WARRIOR} Items: {CLASS_ITEMS[PLAYER_CLASSES.WARRIOR].length}
            </p>
            {listItems(CLASS_ITEMS[PLAYER_CLASSES.WARRIOR])}

            <p>
                {PLAYER_CLASSES.MAGICIAN} Items: {CLASS_ITEMS[PLAYER_CLASSES.MAGICIAN].length}
            </p>
            {listItems(CLASS_ITEMS[PLAYER_CLASSES.MAGICIAN])}
        </div>
    );
};

export default DevItemViewer;
