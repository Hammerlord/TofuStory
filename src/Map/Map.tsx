import { createRef, Fragment, useEffect, useRef, useState } from "react";
import { createUseStyles } from "react-jss";
import { Camping, CrossedSwords, House, map, Medal, MoneyBag, QuestionMark, treasureChest2Image } from "../images";
import Overlay from "../view/Overlay";
import Pan from "./Pan";
import { NODE_TYPES } from "./types";

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
        zIndex: 3,
    },
});

const NODE_ICON_SIZE = 24;

const Map = ({ onSelectNode, currentNode, generatedRoute, playerImage }) => {
    const classes = useStyles();
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

    const handleClickNode = (node) => {
        onSelectNode(node);
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

    // prev and current are the output of generateTravelRoute
    const drawRouteNode = ({ prev, current, routeNodes, lines }: any) => {
        const { width = 0, height = 0 } = container as { width: number; height: number };
        const x = current.x * width;
        const y = current.y * height;

        if (prev) {
            lines.push(
                <line
                    key={`${prev.id}-${current.id}-line`}
                    x1={prev.x * width}
                    y1={prev.y * height}
                    x2={x}
                    y2={y}
                    stroke="black"
                    strokeWidth={2}
                    style={{ position: "absolute", zIndex: 1 }}
                />
            );
        }

        const iconProps = {
            width: NODE_ICON_SIZE,
            height: NODE_ICON_SIZE,
            x: x - NODE_ICON_SIZE / 2,
            y: y - NODE_ICON_SIZE / 2,
        };

        routeNodes.push(
            <g x={x - 8} y={y - 8} onClick={() => handleClickNode(current)} className={classes.routeNode} key={`${current.id}-node`}>
                <circle cx={x} cy={y} r="24" fill={"rgba(50, 50, 50, 0.95)"} />
                {current.type === NODE_TYPES.ENCOUNTER && <CrossedSwords {...iconProps} />}
                {current.type === NODE_TYPES.ELITE_ENCOUNTER && <Medal {...iconProps} />}
                {current.type === NODE_TYPES.RESTING_ZONE && <Camping {...iconProps} />}
                {current.type === NODE_TYPES.SHOP && <MoneyBag {...iconProps} />}
                {current.type === NODE_TYPES.TREASURE && <image {...iconProps} href={treasureChest2Image} />}
                {current.type === NODE_TYPES.EVENT && <QuestionMark {...iconProps} />}
                {current.type === NODE_TYPES.TOWN && <House {...iconProps} />}

                {current.id === currentNode?.id && <image href={playerImage} height="36" width="36" x={x - 18} y={y - 50} />}
            </g>
        );
        if (current.next) {
            current.next.forEach((node) => drawRouteNode({ prev: current, current: node, routeNodes, lines }));
        }
    };

    const routeNodes = [];
    const lines = [];
    drawRouteNode({ current: generatedRoute, routeNodes, lines });

    return (
        <Overlay>
            <div className={classes.root}>
                <Pan>
                    <img src={map} className={classes.image} onMouseDown={handleClickMap} ref={containerRef} onLoad={handleImageLoad} />
                    <svg className={classes.routeContainer} onClick={handleDraw}>
                        {lines}
                        {routeNodes}
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
