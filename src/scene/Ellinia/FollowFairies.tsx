import { useEffect, useState } from "react";
import {
    FungalStumpImage,
    GreenFairiesImage,
    HonorableRockImage,
    ReturningRockImage,
    SmallTreeStumpImage,
    SparklingCrystalImage,
} from "../../images";
import { getRandomInt, getRandomItem } from "../../utils";
import { createUseStyles } from "react-jss";
import classNames from "classnames";
import Button from "../../view/Button";

const useStyles = createUseStyles({
    propContainer: {
        display: "inline-block",
        position: "relative",
        margin: 24,
        cursor: "pointer",
        filter: "saturate(0.5)",
        transition: "transform 1s",
        minWidth: "150px",
    },
    propImage: {
        width: "100%",
    },
    inactive: {
        filter: "saturate(0.1)",
    },
    "@keyframes flash": {
        from: {
            WebkitFilter: "saturate(0.5) brightness(0.75) drop-shadow(0 0 5px #fffee8) drop-shadow(0 0 3px #fffee8)",
            filter: "saturate(0.5) brightness(0.75) drop-shadow(0 0 5px #fffee8) drop-shadow(0 0 3px #fffee8)",
        },
        to: {
            WebkitFilter: "saturate(0.5) brightness(1.25) drop-shadow(0 0 5px #fffee8) drop-shadow(0 0 3px #fffee8)",
            filter: "saturate(0.5) brightness(1.25) drop-shadow(0 0 5px #fffee8) drop-shadow(0 0 3px #fffee8)",
        },
    },
    flash: {
        animation: "$flash",
        transitionTimingFunction: "ease-in-out",
        animationIterationCount: "infinite",
        animationDuration: 750,
    },
    lightup: {
        WebkitFilter: "brightness(1.5) drop-shadow(0 0 5px #fffee8) drop-shadow(0 0 1px #fffee8)",
        filter: "brightness(1.5) drop-shadow(0 0 5px #fffee8) drop-shadow(0 0 1px #fffee8)",
        position: "absolute",
        left: "50%",
        transform: "translateX(-50%)",
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
        animationDuration: "1.5s",
        animationDelay: "1s",
    },
    resetContainer: {
        marginTop: "64px",
    },
});

const envProps = {
    Wellspring: SmallTreeStumpImage,
    "Sparkling Crystal": SparklingCrystalImage,
    "Returning Rock": ReturningRockImage,
    "Honorable Rock": HonorableRockImage,
    "Fungal Stump": FungalStumpImage,
};

const getOrderToFollow = () => {
    const numHits = getRandomInt(6, 7);
    const propNames = Object.keys(envProps);
    const order = [];
    Array.from({ length: numHits }).forEach((_, i) => {
        // It cannot have the same prop twice in a row
        const prop = getRandomItem(propNames.filter((name) => name !== order[i - 1]));
        order.push(prop);
    });

    return order;
};

// It's just Simon Says.
const FollowFairies = ({ onComplete }) => {
    const [order, setOrder] = useState(getOrderToFollow);
    const [blockUI, setBlockUI] = useState(false);
    const [response, setResponse] = useState([]);
    const [lightUpProp, setLightUpProp] = useState(null);
    const [initialized, setInitialized] = useState(false);
    const classes = useStyles();

    useEffect(() => {
        setBlockUI(true);
        let i = 0;
        const playIndicator = () => {
            setLightUpProp(order[i]);
            setTimeout(() => {
                i += 1;
                if (order[i]) {
                    playIndicator();
                } else {
                    setLightUpProp(null);
                    setBlockUI(false);
                }
            }, 2000);
        };

        const timeout = setTimeout(() => {
            playIndicator();
            setInitialized(true);
        }, 2000);

        return () => clearTimeout(timeout);
    }, [order]);

    const isComplete = JSON.stringify(response) === JSON.stringify(order);

    useEffect(() => {
        if (!isComplete) {
            return;
        }
        setTimeout(() => {
            onComplete();
        }, 2000);
    }, [isComplete]);

    const handleClickProp = (name: string) => {
        if (isComplete || blockUI) {
            return;
        }
        const newResponse = [...response, name];
        if (newResponse[newResponse.length - 1] !== order[newResponse.length - 1]) {
            // Wrong answer
            setResponse([]);
        } else {
            setResponse(newResponse);
        }
    };

    console.log(order);

    return (
        <div>
            <h2>Follow the Fairies</h2>
            {Object.entries(envProps).map(([name, image], i) => (
                <>
                    {i === 2 && <br />}
                    <div
                        onClick={() => handleClickProp(name)}
                        className={classNames(classes.propContainer, {
                            [classes.inactive]: !response.length && !lightUpProp && initialized,
                            [classes.flash]: !isComplete && (response[response.length - 1] === name || lightUpProp === name),
                            [classes.complete]: isComplete,
                        })}
                        key={name}
                    >
                        <img src={image} alt={name} className={classes.propImage} />
                        {(lightUpProp === name || isComplete) && (
                            <img
                                src={GreenFairiesImage}
                                className={classNames(classes.lightup, {
                                    [classes.fadeOut]: true,
                                })}
                            />
                        )}
                    </div>
                </>
            ))}
            <div className={classes.resetContainer}>
                <Button
                    onClick={() => {
                        setOrder(getOrderToFollow());
                    }}
                    disabled={blockUI || isComplete}
                    color="primary"
                >
                    Reset
                </Button>
            </div>
        </div>
    );
};

export default FollowFairies;
