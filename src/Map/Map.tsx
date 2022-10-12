import { createRef, useEffect, useRef, useState } from "react";
import { createUseStyles } from "react-jss";
import { TreasureChestImage, VictoriaIslandImage } from "../images";
import { CampingIcon, CrossedSwordsIcon, HouseIcon, JapaneseOgreIcon, MedalIcon, MoneyBagIcon, QuestionMarkIcon } from "../images/icons";
import Overlay from "../view/Overlay";
import Pan from "./Pan";
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
        WebkitFilter: Array.from({ length: 3 })
            .map(() => "drop-shadow(0 0 2px rgba(255, 255, 230, 0.8))")
            .join(" "),
        filter: Array.from({ length: 3 })
            .map(() => "drop-shadow(0 0 2px rgba(255, 255, 230, 0.8))")
            .join(" "),
        cursor: "pointer",
        zIndex: 3,
    },
});

const NODE_ICON_SIZE = 24;

const Map = ({
    onSelectNode,
    currentNode,
    generatedRoute,
    playerImage,
    enableDraw = false,
}: {
    onSelectNode?: (node: RouteNode) => void;
    currentNode?: RouteNode;
    generatedRoute?: RouteNode;
    playerImage?: string;
    enableDraw?: boolean;
}) => {
    const classes = useStyles();
    const containerRef = useRef() as any;
    const [positions, setPositions] = useState([]);
    const [container, setContainer] = useState({});

    const updateContainer = () => {
        if (containerRef.current?.getBoundingClientRect) {
            const newContainer = containerRef.current.getBoundingClientRect();
            setContainer(newContainer);
        }
    };

    useEffect(() => {
        window.addEventListener("resize", updateContainer);
        return () => window.removeEventListener("resize", updateContainer);
    }, [containerRef.current]);

    const handleClickNode = (node: RouteNode) => {
        onSelectNode(node);
    };

    // This is just for generating routes
    const handleDraw = (e) => {
        if (enableDraw && e.button === 0) {
            const { left, width, top, height } = containerRef.current.getBoundingClientRect();
            const newPositions = [...positions, { x: (e.clientX - left) / width, y: (e.clientY - top) / height }];
            console.log(JSON.stringify(newPositions));
            setPositions(newPositions);
        }
    };

    const handleErase = (e, i) => {
        if (enableDraw && e.button === 2) {
            const newPositions = positions.slice();
            newPositions.splice(i, 1);
            setPositions(newPositions);
            console.log(JSON.stringify(newPositions));
            e.stopPropagation();
            e.preventDefault();
        }
    };

    // prev and current are the output of generateTravelRoute
    const drawRouteNode = ({ prev, current, routeNodes, lines }: any) => {
        if (!current) {
            return;
        }
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
                {current.type === NODE_TYPES.ENCOUNTER && <CrossedSwordsIcon {...iconProps} />}
                {current.type === NODE_TYPES.ELITE_ENCOUNTER && <MedalIcon {...iconProps} />}
                {current.type === NODE_TYPES.RESTING_ZONE && <CampingIcon {...iconProps} />}
                {current.type === NODE_TYPES.SHOP && <MoneyBagIcon {...iconProps} />}
                {current.type === NODE_TYPES.TREASURE && <image {...iconProps} href={TreasureChestImage} />}
                {current.type === NODE_TYPES.EVENT && <QuestionMarkIcon {...iconProps} />}
                {current.type === NODE_TYPES.TOWN && <HouseIcon {...iconProps} />}
                {current.type === NODE_TYPES.BOSS && <JapaneseOgreIcon {...iconProps} />}

                {currentNode && current.id === currentNode.id && <image href={playerImage} height="36" width="36" x={x - 18} y={y - 50} />}
            </g>
        );
        if (current.next) {
            current.next.forEach((node) => drawRouteNode({ prev: current, current: node, routeNodes, lines }));
        }
    };

    const routeNodes = [];
    const lines = [];
    drawRouteNode({ current: generatedRoute, routeNodes, lines });

    const { width: mapWidth, height: mapHeight } = container as { width: number; height: number };
    const screenCentre = { x: window.innerWidth / -2, y: window.innerHeight / -2 };
    const absoluteNodeLocation = { x: (currentNode?.x || 0) * -mapWidth, y: (currentNode?.y || 0) * -mapHeight };
    const pan = { x: absoluteNodeLocation.x - screenCentre.x, y: absoluteNodeLocation.y - screenCentre.y };

    return (
        <Overlay>
            <div className={classes.root}>
                <Pan defaultPosition={pan}>
                    <img src={VictoriaIslandImage} className={classes.image} ref={containerRef} onLoad={updateContainer} />
                    <svg className={classes.routeContainer} onClick={handleDraw} onContextMenu={(e) => e.preventDefault()}>
                        {lines}
                        {routeNodes}
                        {enableDraw &&
                            positions.map(({ x, y }, i) => {
                                if (!mapWidth || !mapHeight) {
                                    return;
                                }
                                return (
                                    <circle
                                        onMouseDown={(e) => handleErase(e, i)}
                                        key={i}
                                        cx={x * mapWidth}
                                        cy={y * mapHeight}
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
