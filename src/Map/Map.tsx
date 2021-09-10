import { createRef, Fragment, useEffect, useRef, useState } from "react";
import { createUseStyles } from "react-jss";
import { Camping, CrossedSwords, map } from "../images";
import Overlay from "../view/Overlay";
import { generateWaves } from "./encounters";
import Pan from "./Pan";
import { routeLithToKerning } from "./routes";
import { NODE_TYPES, RouteNode } from "./types";

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

const NODE_ICON_SIZE = 16;

const Map = ({ onSelectNode, currentLocation, playerImage }) => {
    const classes = useStyles();
    const [generatedRoute] = useState(
        routeLithToKerning.nodes.map((node) => {
            if (node.type === NODE_TYPES.encounter) {
                return { ...node, waves: generateWaves(node, routeLithToKerning.enemies) };
            }
            return node;
        })
    );

    const [containerRef] = useState(useRef(createRef() as any));
    const [positions, setPositions] = useState([]);
    const [enableDraw] = useState(false);
    const [container, setContainer] = useState({});

    const handleImageLoad = () => {
        setContainer(containerRef.current.getBoundingClientRect());
    };

    useEffect(() => {
        const onResize = () => {
            if (containerRef.current?.getBoundingClientRect) {
                setContainer(containerRef.current.getBoundingClientRect());
            }
        };
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, [containerRef.current]);

    const handleClickMap = (e) => {
        e.preventDefault();
    };

    const handleClickNode = (node, i: number) => {
        //if (i - (currentLocation || 0) === 1) {
        onSelectNode(node, i);
        //}
    };

    const placePlayerMarker = (i: number) => {
        if (currentLocation < 0) {
            return i === 0;
        }

        return currentLocation === i;
    };

    // This is just for generating routes
    const handleDraw = (e) => {
        if (enableDraw && e.button === 0) {
            const { left, width, top, height } = containerRef.current.getBoundingClientRect();
            const newPositions = [...positions, [(e.clientX - left) / width, (e.clientY - top) / height]];
            console.log(newPositions);
            setPositions(newPositions);
        }
    };

    const handleErase = (e, i) => {
        if (enableDraw && e.button === 2) {
            const newPositions = positions.slice();
            newPositions.splice(i, 1);
            setPositions(newPositions);
            e.stopPropagation();
            e.preventDefault();
        }
    };
    const route = generatedRoute; // TODO

    return (
        <Overlay>
            <div className={classes.root}>
                <Pan>
                    <img src={map} className={classes.image} onMouseDown={handleClickMap} ref={containerRef} onLoad={handleImageLoad} />
                    <svg className={classes.routeContainer} onClick={handleDraw}>
                        {route.map((node, i) => {
                            const { width = 0, height = 0 } = container as { width: number; height: number };
                            if (!width || !height || enableDraw) {
                                return;
                            }
                            const x = node.x * width;
                            const y = node.y * height;

                            return (
                                <Fragment key={i}>
                                    {i < route.length - 1 && (
                                        <line
                                            x1={x}
                                            y1={y}
                                            x2={route[i + 1]?.x * width}
                                            y2={route[i + 1]?.y * height}
                                            stroke="black"
                                            strokeWidth={2}
                                            style={{ position: "absolute" }}
                                        />
                                    )}
                                    <g x={x - 8} y={y - 8} onClick={() => handleClickNode(node, i)} className={classes.routeNode}>
                                        <circle cx={x} cy={y} r="18" fill={"rgba(50, 50, 50, 0.95)"} />
                                        {node.type === NODE_TYPES.encounter && (
                                            <CrossedSwords
                                                width={NODE_ICON_SIZE}
                                                height={NODE_ICON_SIZE}
                                                x={x - NODE_ICON_SIZE / 2}
                                                y={y - NODE_ICON_SIZE / 2}
                                            />
                                        )}
                                        {node.type === NODE_TYPES.restingZone && (
                                            <Camping
                                                width={NODE_ICON_SIZE}
                                                height={NODE_ICON_SIZE}
                                                x={x - NODE_ICON_SIZE / 2}
                                                y={y - NODE_ICON_SIZE / 2}
                                            />
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
                            );
                        })}
                        {enableDraw &&
                            positions.map(([x, y], i) => {
                                const { width = 0, height = 0 } = container as { width: number; height: number };
                                if (!width || !height) {
                                    return;
                                }
                                return (
                                    <circle
                                        onMouseDown={(e) => handleErase(e, i)}
                                        key={i}
                                        cx={x * width}
                                        cy={y * height}
                                        r={9}
                                        fill={"red"}
                                    />
                                );
                            })}
                    </svg>
                </Pan>
            </div>
        </Overlay>
    );
};

export default Map;
