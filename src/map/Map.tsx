import classNames from "classnames";
import { ReactElement, useEffect, useRef, useState } from "react";
import { createUseStyles } from "react-jss";
import { ClickIndicatorImage, FlagImage, GrassPlatformImage, PersonalAnvilImage, TreasureChestImage } from "../images";
import {
    CampingIcon,
    CrossedSwordsIcon,
    HouseIcon,
    JapaneseOgreIcon,
    MedalIcon,
    MoneyBagIcon,
    QuestionMarkIcon,
    XIcon,
} from "../images/icons";
import Overlay from "../view/Overlay";
import { REGION_PLATFORMS, TOWN_NODE_BACKGROUNDS } from "./constants";
import Legend from "./Legend";
import Pan from "./Pan";
import { BG_MAP, GeneratedRouteNode, NODE_TYPES, RouteNode } from "./types";
import { getRandomItem } from "../utils";

const useStyles = createUseStyles({
    imageContainer: {
        position: "relative",
        width: "3600px",
        height: "1800px",
    },
    root: {
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        "& .react-transform-wrapper": {
            width: "100%",
            height: "100%",
        },
    },
    bgImage: {
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        zIndex: 0,
    },
    tint: {
        position: "fixed",
        inset: 0,
        background: "rgba(125, 125, 125, 0.6)",
        zIndex: 1,
    },
    canvasLayer: {
        position: "relative",
        zIndex: 2,
        height: "100%",
    },
    routeContainer: {
        position: "absolute",
        left: 0,
        top: 0,
        height: "100%",
        width: "100%",
    },
    routeNodeBG: {
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: "translateX(-50%) translateY(-50%)",
    },
    routeNode: {
        position: "absolute",
        filter: Array.from({ length: 2 })
            .map(() => "drop-shadow(0 0 2px rgba(255, 255, 230, 0.8))")
            .join(" "),
        cursor: "pointer",
        zIndex: 3,
    },
    visited: {
        filter: "saturate(0)",
    },
});

const NODE_ICON_SIZE = 24;
const X_SIZE = 32;
const NODE_MARGIN = 300; // Buffer for the "map size" so that elements/nodes don't get cut off
const toPixel = (fraction: number = 0, size: number) => NODE_MARGIN + fraction * Math.max(size - NODE_MARGIN * 2, 0);

const Map = ({
    onSelectNode,
    playerLocationNode,
    generatedRoute,
    playerImage,
    visited = {},
    disableClick,
}: {
    onSelectNode?: (node: GeneratedRouteNode) => void;
    playerLocationNode?: GeneratedRouteNode;
    generatedRoute?; // Fix me: route is typeof the return value of generateTravelRoute, not Route (mistakenly written)
    playerImage?: string;
    visited?: { [nodeId: string]: true };
    disableClick?: boolean;
}) => {
    const classes = useStyles();
    const containerRef = useRef(null) as any;
    const [container, setContainer] = useState({});

    const updateContainer = () => {
        if (containerRef.current?.getBoundingClientRect) {
            const newContainer = containerRef.current.getBoundingClientRect();
            setContainer(newContainer);
        }
    };

    useEffect(() => {
        updateContainer();
        window.addEventListener("resize", updateContainer);
        return () => window.removeEventListener("resize", updateContainer);
    }, [containerRef.current]);

    const handleClickNode = (node: RouteNode) => {
        if (disableClick) {
            return;
        }
        onSelectNode(node);
    };

    const drawRouteNode = ({
        prev,
        current,
        nodeBGs,
        routeNodes,
        lines,
        visitedIds,
    }: {
        prev?: GeneratedRouteNode;
        current: GeneratedRouteNode;
        nodeBGs: ReactElement[];
        routeNodes: ReactElement[];
        lines: ReactElement[];
        visitedIds: Set<string>;
    }) => {
        if (!current) {
            return;
        }
        const { width = 0, height = 0 } = container as { width: number; height: number };
        const x = toPixel(current.x, width);
        const y = toPixel(current.y, height);

        if (prev) {
            lines.push(
                <line
                    key={`${prev.id}-${current.id}-line`}
                    x1={toPixel(prev.x, width)}
                    y1={toPixel(prev.y, height)}
                    x2={x}
                    y2={y}
                    stroke="rgba(5,5,5,0.5)"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    strokeLinecap="round"
                    style={{ position: "absolute", zIndex: 1 }}
                />
            );
        }

        if (visitedIds.has(current.id)) {
            return;
        }
        visitedIds.add(current.id);

        const isPlayerPosition = playerLocationNode && current.id === playerLocationNode.id;
        const isNext = playerLocationNode?.next?.some((node) => node.id === current.id) || (isPlayerPosition && !visited[current.id]);
        let handleClickNodeCallback;
        if (isNext) {
            handleClickNodeCallback = () => handleClickNode(current);
        }

        const iconProps = {
            width: NODE_ICON_SIZE,
            height: NODE_ICON_SIZE,
            x: x - NODE_ICON_SIZE / 2,
            y: y - NODE_ICON_SIZE / 2,
        };
        const node = (
            <g x={x - 8} y={y - 8} onClick={handleClickNodeCallback} className={classNames(classes.routeNode)} key={`${current.id}-node`}>
                <circle cx={x} cy={y} r="24" fill={"rgba(50, 50, 50, 0.95)"} />
                <g
                    className={classNames({
                        [classes.visited]: visited[current.id],
                    })}
                >
                    {current.type === NODE_TYPES.ENCOUNTER && <CrossedSwordsIcon {...iconProps} />}
                    {current.type === NODE_TYPES.ELITE_ENCOUNTER && <MedalIcon {...iconProps} />}
                    {current.type === NODE_TYPES.RESTING_ZONE && <CampingIcon {...iconProps} />}
                    {current.type === NODE_TYPES.SHOP && <MoneyBagIcon {...iconProps} />}
                    {current.type === NODE_TYPES.TRADING_POST && <image {...iconProps} href={FlagImage} />}
                    {current.type === NODE_TYPES.TRANSMUTE && <image {...iconProps} href={PersonalAnvilImage} />}
                    {current.type === NODE_TYPES.TREASURE && <image {...iconProps} href={TreasureChestImage} />}
                    {current.type === NODE_TYPES.EVENT && <QuestionMarkIcon {...iconProps} />}
                    {current.type === NODE_TYPES.TOWN && <HouseIcon {...iconProps} />}
                    {current.type === NODE_TYPES.BOSS && <JapaneseOgreIcon {...iconProps} />}
                </g>
                {isPlayerPosition && <image href={playerImage} height="36" width="36" x={x - 18} y={y - 50} />}
                {visited[current.id] && !isPlayerPosition && (
                    <XIcon
                        {...{
                            width: X_SIZE,
                            height: X_SIZE,
                            x: x - X_SIZE / 2,
                            y: y - X_SIZE / 2,
                        }}
                    />
                )}
                {isNext && !disableClick && <image href={ClickIndicatorImage} {...iconProps} y={y - 75} />}
            </g>
        );

        const townNodeBG = current.town && TOWN_NODE_BACKGROUNDS[current.town];
        if (townNodeBG) {
            const size = 400;
            nodeBGs.push(
                <image
                    key={`${current.id}-BG`}
                    href={townNodeBG}
                    x={x - size / 2}
                    y={y - size / 2}
                    width={size}
                    height={size}
                    style={{ position: "absolute", zIndex: 0 }}
                />
            );
        } else {
            const size = 54;
            let platformImage: string = GrassPlatformImage;
            const platformImageFromMap = REGION_PLATFORMS[current.region];
            if (Array.isArray(platformImageFromMap)) {
                platformImage = getRandomItem(platformImageFromMap);
            }

            nodeBGs.push(
                <image
                    key={`${current.id}-BG`}
                    href={platformImage}
                    x={x - size / 2}
                    y={y}
                    width={size}
                    height={size}
                    style={{ position: "absolute", zIndex: 0 }}
                />
            );
        }

        routeNodes.push(node);

        if (current.next) {
            current.next.forEach((node) => drawRouteNode({ prev: current, current: node, routeNodes, nodeBGs, lines, visitedIds }));
        }
    };

    const routeNodes: ReactElement[] = [];
    const lines: ReactElement[] = [];
    const nodeBGs: ReactElement[] = [];
    drawRouteNode({ current: generatedRoute, routeNodes, nodeBGs: nodeBGs, lines, visitedIds: new Set() });

    const { width: mapWidth, height: mapHeight } = container as { width: number; height: number };
    const screenCentre = { x: window.innerWidth / -2, y: window.innerHeight / -2 };
    const absoluteNodeLocation = {
        x: -toPixel(playerLocationNode?.x, mapWidth),
        y: -toPixel(playerLocationNode?.y, mapHeight),
    };
    const panPosition = { x: absoluteNodeLocation.x - screenCentre.x, y: absoluteNodeLocation.y - screenCentre.y };
    const bgRegion: keyof typeof BG_MAP = playerLocationNode?.region || generatedRoute?.region;

    return (
        <Overlay>
            <div className={classes.root}>
                {bgRegion && <img src={BG_MAP[bgRegion]} className={classes.bgImage} />}
                <div className={classes.tint} />
                <div className={classes.canvasLayer}>
                    <Pan userPosition={panPosition}>
                        <div className={classes.imageContainer} ref={containerRef}>
                            <svg className={classes.routeContainer} onContextMenu={(e) => e.preventDefault()}>
                                {nodeBGs}
                                {lines}
                                {routeNodes}
                            </svg>
                        </div>
                    </Pan>
                </div>
                <Legend />
            </div>
        </Overlay>
    );
};

export default Map;
