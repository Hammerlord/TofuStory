import classNames from "classnames";
import { createUseStyles } from "react-jss";
import {
    BananaGrahamPieImage,
    CakeSliceImage,
    HenesysTownstreetStageImage,
    HotdogSupremeImage,
    MayaImage,
    MiniBeanImage,
    UnagiImage,
} from "../../images";

import { SceneProps } from "../types";

const useStyles = createUseStyles({
    root: {
        position: "relative",
        background: `url(${HenesysTownstreetStageImage}) no-repeat`,
        width: "900px",
        height: "700px",
    },
    character: {
        position: "absolute",
        WebkitFilter: "drop-shadow(0 0 3px #fffee8) drop-shadow(0 0 3px #fffee8)",
        filter: "drop-shadow(0 0 3px #fffee8) drop-shadow(0 0 3px #fffee8)",
    },
    player: {
        top: "434px",
        left: "636px",
        height: "70px",
    },
    maya: {
        top: "427px",
        left: "300px",
        transform: "scale(-1, 1)",
    },
    miniBean: {
        left: "437px",
        top: "270px",
    },
    cake: {
        top: 466,
        left: 400,
        maxHeight: "40px",
    },
    pie: {
        top: 465,
        left: 430,
        maxHeight: "40px",
    },
    hotdog: {
        top: 470,
        left: 460,
        maxWidth: "60px",
        maxHeight: "40px",
    },
    unagi: {
        top: 470,
        left: 490,
        maxWidth: "60px",
        maxHeight: "40px",
    },
    "@keyframes upAndDown": {
        from: {
            transform: "translateY(0)",
        },
        to: {
            transform: "translateY(-8px)",
        },
    },
    item: {
        animationName: "$upAndDown",
        animationDuration: "1s",
        animationIterationCount: "infinite",
        animationDirection: "alternate-reverse",
        position: "absolute",
        WebkitFilter: "drop-shadow(0 0 3px #fffee8) drop-shadow(0 0 3px #fffee8)",
        filter: "drop-shadow(0 0 3px #fffee8) drop-shadow(0 0 3px #fffee8)",
    },
});

const Pantry = ({ player }: SceneProps) => {
    const classes = useStyles();

    return (
        <div className={classes.root}>
            <img src={player?.image} className={classNames(classes.player, classes.character)} />
            <img src={MayaImage} className={classNames(classes.maya, classes.character)} />
            <img src={MiniBeanImage} className={classNames(classes.miniBean, classes.character)} />
            <img src={BananaGrahamPieImage} className={classNames(classes.pie, classes.item)} />
            <img src={CakeSliceImage} className={classNames(classes.cake, classes.item)} style={{ animationDelay: "0.1s" }} />
            <img src={UnagiImage} className={classNames(classes.unagi, classes.item)} />
            <img src={HotdogSupremeImage} className={classNames(classes.hotdog, classes.item)} style={{ animationDelay: "0.2s" }} />
        </div>
    );
};

export default Pantry;
