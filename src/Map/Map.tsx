import { Fragment, useState } from "react";
import { createUseStyles } from "react-jss";
import { CrossedSwords, map } from "../images";
import Overlay from "../view/Overlay";
import { generateWaves } from "./encounters";
import Pan from "./Pan";

export enum NODE_TYPES {
    encounter = "encounter",
    event = "event",
    restingZone = "restingZone",
}

export interface RouteNode {
    x: number;
    y: number;
    type: NODE_TYPES;
    difficulty?: "low" | "medium" | "high";
    //next: RouteNode[];
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
const route: RouteNode[] = [
    { x: 1702, y: 351, type: NODE_TYPES.encounter, difficulty: "low" },
    { x: 1722, y: 462, type: NODE_TYPES.encounter, difficulty: "low" },
    { x: 1614, y: 467, type: NODE_TYPES.encounter, difficulty: "medium" },
    { x: 1500, y: 447, type: NODE_TYPES.restingZone },
    { x: 1398, y: 493, type: NODE_TYPES.encounter, difficulty: "medium" },
    { x: 1285, y: 509, type: NODE_TYPES.encounter, difficulty: "high" },
];

const Map = ({ onSelectNode, currentLocation, playerImage }) => {
    const classes = useStyles();
    const [generatedRoute] = useState(
        route.map((node) => {
            if (node.type === NODE_TYPES.encounter) {
                return { ...node, waves: generateWaves({ difficulty: node.difficulty }) };
            }
            return node;
        })
    );
    const handleClickMap = (e) => {
        e.preventDefault();
    };

    const handleClickNode = (node, i: number) => {
        if (i - (currentLocation || 0) === 1) {
            onSelectNode(node, i);
        }
    };

    const placePlayerMarker = (i: number) => {
        if (currentLocation < 0) {
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
                        {generatedRoute.map((node, i) => (
                            <Fragment key={i}>
                                {i < route.length - 1 && (
                                    <line
                                        x1={node.x}
                                        y1={node.y}
                                        x2={route[i + 1]?.x}
                                        y2={route[i + 1]?.y}
                                        stroke="black"
                                        strokeWidth={2}
                                        style={{ position: "absolute" }}
                                    />
                                )}
                                <g x={node.x - 8} y={node.y - 8} onClick={() => handleClickNode(node, i)} className={classes.routeNode}>
                                    <circle cx={node.x} cy={node.y} r="18" fill={"rgba(50, 50, 50, 0.95)"} />
                                    {node.type === NODE_TYPES.encounter && (
                                        <CrossedSwords width={16} height={16} x={node.x - 8} y={node.y - 8} />
                                    )}
                                </g>
                                {placePlayerMarker(i) && (
                                    <image
                                        href={playerImage}
                                        className={classes.playerLocationMarker}
                                        height="36"
                                        width="36"
                                        x={node.x - 18}
                                        y={node.y - 50}
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
