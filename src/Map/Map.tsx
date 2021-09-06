import { Fragment } from "react";
import { createUseStyles } from "react-jss";
import { map } from "../images";
import { challenge } from "../Menu/challenges";
import tutorial, { Wave } from "../Menu/tutorial";
import Overlay from "../view/Overlay";
import Pan from "./Pan";

/**
 * Node in a route tree.
 */
export interface RouteNode {
    x: number;
    y: number;
    encounter?: Wave[];
    routeEvent?: object;
    next: RouteNode[];
}

const useStyles = createUseStyles({
    imageContainer: {
        width: "300%",
        height: "300%",
    },
    image: {
        width: "100%",
        objectFit: "contain",
    },
    root: {
        "& .react-transform-wrapper": {
            width: "100%",
            height: "100%",
        },
    },
    routeContainer: {
        position: "absolute",
        left: 0,
        top: 0,
        height: "100%",
        width: "100%",
    },
    routeNode: {
        position: "absolute",
        WebkitFilter: "drop-shadow(0 0 2px rgba(255, 255, 230, 0.8)) drop-shadow(0 0 2px rgba(255, 255, 230, 0.8))",
        filter: "drop-shadow(0 0 2px rgba(255, 255, 230, 0.8)) drop-shadow(0 0 2px rgba(255, 255, 230, 0.8))",
        cursor: "pointer",
    },
    playerLocationMarker: {
        maxWidth: "36px",
        maxHeight: "36px",
        position: "absolute",
        "& img": {
            maxWidth: "36px",
            maxHeight: "36px",
        },
    },
});

// Assuming a map width of 2880 -- TODO make this relative
const route = [
    { x: 1702, y: 351 },
    { x: 1722, y: 462 },
    { x: 1614, y: 467 },
    { x: 1500, y: 447 },
    { x: 1398, y: 493 },
    { x: 1369, y: 556 },
    { x: 1285, y: 509 },
];

const testRoute = () => {
    const numPossibleNodes = [1, 1, 2];
};

const Map = ({ onSelectNode, currentLocation, playerImage }) => {
    const classes = useStyles();
    const handleClickMap = (e) => {
        e.preventDefault();
    };

    const handleClickNode = (i: number) => {
        console.log("clicked", i);

        if (i === 0) {
            onSelectNode(i, tutorial);
        } else {
            onSelectNode(i, challenge);
        }
    };

    const placePlayerMarker = (i) => {
        if (!currentLocation) {
            return i === 0;
        }

        return currentLocation === i;
    };

    return (
        <Overlay>
            <div className={classes.root}>
                <Pan>
                    <img src={map} className={classes.image} onMouseDown={handleClickMap} />
                    <svg className={classes.routeContainer}>
                        {route.map(({ x, y }, i) => (
                            <Fragment key={i}>
                                <div
                                    style={{
                                        transform: `translate(${x}px, ${y}px)`,
                                    }}
                                    className={classes.routeNode}
                                    onClick={() => handleClickNode(i)}
                                >
                                    {i + 1}
                                </div>
                                {i < route.length - 1 && (
                                    <line
                                        x1={x}
                                        y1={y}
                                        x2={route[i + 1]?.x}
                                        y2={route[i + 1]?.y}
                                        stroke="black"
                                        style={{ position: "absolute" }}
                                    />
                                )}
                                <circle
                                    cx={x}
                                    cy={y}
                                    r="18"
                                    fill={"rgba(50, 50, 50, 0.95)"}
                                    className={classes.routeNode}
                                    onClick={() => handleClickNode(i)}
                                />
                                {placePlayerMarker(i) && (
                                    <image
                                        href={playerImage}
                                        className={classes.playerLocationMarker}
                                        height="36"
                                        width="36"
                                        style={{
                                            transform: `translate(${x - 18}px, ${y - 50}px)`,
                                        }}
                                    />
                                )}
                            </Fragment>
                        ))}
                    </svg>
                </Pan>
            </div>
        </Overlay>
    );
};

export default Map;
