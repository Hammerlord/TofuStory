import { Button } from "@material-ui/core";
import { createUseStyles } from "react-jss";
import { map } from "../images";
import Overlay from "../view/Overlay";
import Pan from "./Pan";

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
        backgroundColor: "red",
        textAlign: "center",
        color: "white",
        borderRadius: "2vh",
        width: "2vh",
        height: "2vh",
    },
});

// Assuming a map width of 2880
const route = [
    { x: 1702, y: 351 },
    { x: 1722, y: 462 },
    { x: 1614, y: 467 },
    { x: 1500, y: 447 },
    { x: 1398, y: 493 },
    { x: 1369, y: 556 },
    { x: 1285, y: 509 },
];

const Map = () => {
    const classes = useStyles();
    const handleClick = (e) => {
        console.log("click");
        console.log(e);
        e.preventDefault();
    };

    return (
        <Overlay>
            <div className={classes.root}>
                <Pan>
                    <img src={map} className={classes.image} onMouseDown={handleClick} />
                    <div className={classes.routeContainer}>
                        {route.map(({ x, y }, i) => (
                            <div
                                key={i}
                                style={{
                                    transform: `translate(${x}px, ${y}px)`,
                                }}
                                className={classes.routeNode}
                            >
                                {i + 1}
                            </div>
                        ))}
                    </div>
                </Pan>
            </div>
        </Overlay>
    );
};

export default Map;
