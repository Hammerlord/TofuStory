import classNames from "classnames";
import { cloneDeep } from "lodash";
import { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";

const NUM_ROWS = 3;

const useStyles = createUseStyles({
    tile: {
        margin: 8,
        background: "#999",
        width: "56px",
        height: "56px",
        borderRadius: "4px",
        display: "inline-block",
    },
    lightup: {
        background: "#fffee8",
    },
    complete: {
        filter: "brightness(1.2) drop-shadow(0 0 2px #fffee8) drop-shadow(0 0 1px #fffee8)",
    },
});

const DimPath = ({ player, onComplete }) => {
    const [rows, setRows] = useState(() => {
        let initialLit = 4;
        return Array.from({ length: NUM_ROWS }).map(() =>
            Array.from({ length: NUM_ROWS }).map(() => {
                --initialLit;
                return Math.random() < 0.5 && initialLit > 0;
            })
        );
    });
    const isComplete = rows.every((row) => row.every((col) => col));

    useEffect(() => {
        if (isComplete) {
            const timeout = setTimeout(() => {
                onComplete();
            }, 1500);

            return () => clearTimeout(timeout);
        }
    }, [isComplete]);

    const handleClickTile = (i, j) => {
        if (isComplete) {
            return;
        }

        const lit = rows[i][j];
        const newRows = cloneDeep(rows);
        newRows[i][j] = !lit;
        if (newRows[i + 1]?.[j + 1] !== undefined) {
            newRows[i + 1][j + 1] = !newRows[i + 1][j + 1];
        }
        if (newRows[i - 1]?.[j + 1] !== undefined) {
            newRows[i - 1][j + 1] = !newRows[i - 1][j + 1];
        }
        if (newRows[i + 1]?.[j - 1] !== undefined) {
            newRows[i + 1][j - 1] = !newRows[i + 1][j - 1];
        }
        if (newRows[i - 1]?.[j - 1] !== undefined) {
            newRows[i - 1][j - 1] = !newRows[i - 1][j - 1];
        }
        setRows(newRows);
    };

    const classes = useStyles();
    return (
        <div>
            <h2>A Dark Path</h2>
            <p>Restore the light.</p>
            {rows.map((row, i) => (
                <div key={i}>
                    {row.map((col, j) => (
                        <div
                            key={`${i}-${j}`}
                            className={classNames(classes.tile, {
                                [classes.lightup]: col,
                                [classes.complete]: isComplete,
                            })}
                            onClick={() => handleClickTile(i, j)}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
};

export default DimPath;
