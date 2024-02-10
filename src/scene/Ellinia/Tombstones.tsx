import classNames from "classnames";
import { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
import { GreenFairiesImage } from "../../images";
import { TombstoneIcon } from "../../images/icons";
import { shuffle } from "../../utils";
import Tooltip from "../../view/Tooltip";

const useStyles = createUseStyles({
    tombstoneContainer: {
        display: "inline-block",
        width: 100,
        height: 100,
        position: "relative",
        margin: 16,
        cursor: "pointer",
    },
    tombstone: {
        width: "100%",
        height: "100%",
    },
    lightup: {
        WebkitFilter: "brightness(1.5) drop-shadow(0 0 5px #fffee8) drop-shadow(0 0 1px #fffee8)",
        filter: "brightness(1.5) drop-shadow(0 0 5px #fffee8) drop-shadow(0 0 1px #fffee8)",
        width: "100%",
        height: "100%",
        position: "absolute",
        left: 0,
    },
    complete: {
        WebkitFilter: "brightness(1.2) drop-shadow(0 0 2px #fffee8) drop-shadow(0 0 1px #fffee8)",
        filter: "brightness(1.2) drop-shadow(0 0 2px #fffee8) drop-shadow(0 0 1px #fffee8)",
    },
    "@keyframes fadeOut": {
        "0%": {
            opacity: 1,
        },
        "100%": {
            opacity: 0,
        },
    },
    fadeOut: {
        animationName: "$fadeOut",
        animationDuration: "1s",
        animationDelay: "0.5s",
    },
});

const gravesData = [
    { name: "Naeri", description: "The greatest Ranger in the history of oneselves." }, // R
    { name: "Erylen", description: "Long live the Immortal queen. <The grave itself is empty.>" }, // I
    { name: "Merusa", description: "First one to rise against the curse, kind Merusa was only 17 when she Succumbed to its effects." }, // S
    { name: "Bronwen", description: "Bravely held off a horde of infected ones Alone." }, // A
    { name: "Adelen", description: "May Valiant Adelen rest eternal." }, // V
    { name: "Eldwen", description: "Though human, a steadfast friend to Oneselves." }, // O
];

// S A V I O R
const correctOrder = ["Merusa", "Bronwen", "Adelen", "Erylen", "Eldwen", "Naeri"];

const Tombstones = ({ player, onComplete }) => {
    const [graves] = useState(shuffle(gravesData));
    const classes = useStyles();
    const [selectedOrder, setSelectedOrder] = useState([]);
    const [blockUI, setBlockUI] = useState(false);

    const aCorrectAnswer = correctOrder[selectedOrder.length - 1];
    const wrongAnswer = selectedOrder[selectedOrder.length - 1] !== aCorrectAnswer;
    const complete = JSON.stringify(correctOrder) === JSON.stringify(selectedOrder);

    useEffect(() => {
        if (selectedOrder.length === 0) {
            return;
        }

        setBlockUI(true);
        const cb = () => {
            if (complete) {
                onComplete();
                return;
            }

            if (wrongAnswer) {
                setSelectedOrder([]);
            }

            setBlockUI(false);
        };
        const timeout = setTimeout(() => {
            cb();
        }, 1400);

        return () => {
            clearTimeout(timeout);
        };
    }, [selectedOrder]);

    const handleClickTombstone = (name: string) => {
        if (selectedOrder.includes(name) || blockUI) {
            return;
        }

        setSelectedOrder((prev) => [...prev, name]);
    };

    const getTitle = ({ name, description }) => {
        return (
            <div>
                {name} <hr /> {description}
            </div>
        );
    };
    return (
        <div>
            <h2>Forlorn Gravesite</h2>
            <p>Pay respects to fallen heroes.</p>
            {graves.map((grave, i) => (
                <span key={grave.name}>
                    {i === 3 && <br />}
                    <Tooltip title={getTitle(grave)} key={grave.name}>
                        <div
                            onClick={() => handleClickTombstone(grave.name)}
                            className={classNames(classes.tombstoneContainer, {
                                [classes.complete]: complete,
                            })}
                        >
                            <TombstoneIcon className={classes.tombstone} />
                            {selectedOrder.includes(grave.name) && (
                                <img
                                    src={GreenFairiesImage}
                                    className={classNames(classes.lightup, {
                                        [classes.fadeOut]: wrongAnswer,
                                    })}
                                />
                            )}
                        </div>
                    </Tooltip>
                </span>
            ))}
        </div>
    );
};

export default Tombstones;
