import Button from "../view/Button";
import classNames from "classnames";
import { useState } from "react";
import { createUseStyles } from "react-jss";
import { getRandomItem, shuffle } from "../utils";
import Overlay from "../view/Overlay";
import { ITEM_TYPES, Item } from "./types";
import { ITEMS } from "../Map/routes/eventList";
import ItemView from "./ItemView";
import { Player } from "../character/types";
import { rollItemPool } from "./utils";
import { mesoItem } from "./items";

const useStyles = createUseStyles({
    inner: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translateX(-50%) translateY(-50%)",
        textAlign: "center",
        width: "100%",
    },
    titleContainer: {
        display: "inline-block",
        background:
            "linear-gradient(90deg, rgba(0,212,255,0) 0%, rgba(0,0,0,0.75) 30%, rgba(0,0,0,0.75) 50%, rgba(0,0,0,0.75) 70%, rgba(0,212,255,0) 100%)",
        padding: "8px 96px",
        color: "white",
        marginBottom: "24px",
    },
    container: {
        margin: "64px 0",
        verticalAlign: "top",
    },
    item: {
        margin: 16,
        display: "inline-block",
        borderRadius: 8,

        "&.selected": {
            filter: "drop-shadow(0 0 4px #45ff61) drop-shadow(0 0 4px #45ff61)",
            WebkitFilter: "drop-shadow(0 0 4px #45ff61) drop-shadow(0 0 4px #45ff61)",
        },
    },
});

const ItemSelection = ({
    items = [],
    numChoices,
    disableItemReplacements,
    bonuses,
    player,
    onSelectClick,
    onClose,
}: {
    items?: Item[];
    numChoices: number;
    disableItemReplacements?: boolean;
    bonuses?: { uncommon: number; rare: number };
    player: Player;
    onSelectClick: (item: Item) => void;
    onClose: () => void;
}) => {
    /**
     * If an event offers preset item choices, the items which have already been obtained from the preset are swapped
     * for an unobtained item
     */
    const getInitItems = () => {
        const alreadyObtained = player.items.reduce((acc, item: Item) => {
            if (item.type === ITEM_TYPES.EQUIPMENT) {
                acc[item.name] = true;
            }
            return acc;
        }, {});

        const itemSelection = items.filter((item: Item) => !alreadyObtained[item.name]);

        if (!disableItemReplacements) {
            for (let i = itemSelection.length; i < numChoices; ++i) {
                const itemPool = rollItemPool({ player, excludeItems: itemSelection, bonuses });
                const equipment = getRandomItem(itemPool);
                if (equipment) {
                    itemSelection.push(equipment);
                }
            }
        }

        if (itemSelection.length === 0) {
            itemSelection.push(mesoItem);
        }

        return shuffle(itemSelection).slice(0, numChoices);
    };

    const [choices] = useState(getInitItems());
    const [selectedIndex, setSelectedIndex] = useState(null);
    const classes = useStyles();

    const handleSelectClick = () => {
        onSelectClick(choices[selectedIndex]);
    };

    return (
        <Overlay>
            <div className={classes.inner}>
                <div className={classes.titleContainer}>
                    <h1>Pick an item to acquire</h1>
                </div>
                <div className={classes.container}>
                    {choices.map((choice: Item, i) => (
                        <div
                            onClick={() => setSelectedIndex(i)}
                            className={classNames({ selected: i === selectedIndex }, classes.item)}
                            key={[choice.name, i].join("-")}
                        >
                            <ItemView item={choice} />
                        </div>
                    ))}
                </div>
                <Button variant={"contained"} color="primary" disabled={!choices[selectedIndex]} onClick={handleSelectClick}>
                    Select!
                </Button>{" "}
                <Button variant={"contained"} onClick={onClose}>
                    Exit without taking anything
                </Button>
            </div>
        </Overlay>
    );
};

export default ItemSelection;
