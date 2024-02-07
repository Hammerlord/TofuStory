import classNames from "classnames";
import { useState } from "react";
import { createUseStyles } from "react-jss";
import { BlueSnailImage, OrangeMushroomImage, PigImage, RedSnailImage, ShroomImage, SlimeImage, SnailImage } from "../../images";
import { shuffle } from "../../utils";
import { PuzzleProps } from "./types";

const useStyles = createUseStyles({
    iconContainer: {
        display: "inline-block",
        background: "rgba(25, 25, 25, 0.3)",
        borderRadius: "8px",
        border: "1px solid rgba(0, 0, 0, 0.25)",
        height: 50,
        width: 50,
        position: "relative",
        "&.selected": {
            border: "1px solid rgba(214, 214, 128, 0.8)",
        },
    },
    icon: {
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: "translateX(-50%) translateY(-50%)",
        maxWidth: 40,
    },
});

const allOptions = [SnailImage, BlueSnailImage, ShroomImage, RedSnailImage, SlimeImage, PigImage, OrangeMushroomImage];
const optionsOrder = allOptions.reduce((acc, imagePath: string, i) => {
    acc[imagePath] = i;
    return acc;
}, {});

const SortingPuzzle = ({ onComplete, completed, onInteraction }: PuzzleProps) => {
    const [tiles, setTiles] = useState(shuffle(allOptions).slice(0, 5));

    const [answer] = useState(
        tiles.slice().sort((a, b) => {
            return optionsOrder[a] - optionsOrder[b];
        })
    );

    const [selectedTile, setSelectedTile] = useState(null);
    const classes = useStyles();

    const handleClickTile = (clickedTile: string) => {
        if (completed) {
            return;
        }

        if (!selectedTile) {
            setSelectedTile(clickedTile);
            return;
        }
        if (selectedTile === clickedTile) {
            setSelectedTile(null);
            return;
        }

        const selectedTileIndex = tiles.findIndex((tile) => tile === selectedTile);
        const newTileIndex = tiles.findIndex((tile) => tile === clickedTile);
        let temp = tiles[newTileIndex];
        const updatedTiles = [...tiles];
        updatedTiles[newTileIndex] = selectedTile;
        updatedTiles[selectedTileIndex] = temp;
        setTiles(updatedTiles);
        setSelectedTile(null);

        const isWinCondition = updatedTiles.every((tile: string, i: number) => answer[i] === tile);
        if (isWinCondition) {
            onComplete();
        }

        onInteraction && onInteraction();
    };

    return (
        <>
            {tiles.map((tile: string, i) => (
                <div
                    className={classNames(classes.iconContainer, {
                        selected: tile === selectedTile,
                    })}
                    key={tile}
                    onClick={() => handleClickTile(tile)}
                >
                    <img src={tile} className={classes.icon} key={tile} />
                </div>
            ))}
        </>
    );
};

export default SortingPuzzle;
