import Button from "../view/Button";
import classNames from "classnames";
import { useState } from "react";
import { createUseStyles } from "react-jss";
import { shuffle } from "../utils";
import Overlay from "../view/Overlay";
import { Item } from "./types";

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
        display: "inline-block",
        borderRadius: "8px",
        margin: "0 24px",
        verticalAlign: "bottom",
        background: "#666",
        width: "200px",
        minHeight: "150px",
        cursor: "pointer",

        "&.selected": {
            boxShadow: "0 0 8px 4px #45ff61",
        },
    },
});

const ItemSelection = ({
    items,
    numChoices,
    onSelectClick,
    onClose,
}: {
    items: Item[];
    numChoices: number;
    onSelectClick: (item: Item) => void;
    onClose: () => void;
}) => {
    const [choices] = useState(shuffle(items).slice(0, numChoices));
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
                            key={i}
                        >
                            <div>{choice.name}</div>
                            <img src={choice.image} />
                            <div>{choice.description}</div>
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
