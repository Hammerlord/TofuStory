import classNames from "classnames";
import { createUseStyles } from "react-jss";
import { GreenMushroomImage, HornyMushroomImage, KittenBarrelsImage, ShoImage, StefaImage, WessImage } from "../../../images";
import { SceneProps } from "../../types";

const useStyles = createUseStyles({
    root: {
        position: "relative",
        background: `url(${KittenBarrelsImage}) no-repeat`,
        width: "1050px",
        height: "525px",
    },
    character: {
        position: "absolute",
        filter: "drop-shadow(0 0 3px #fffee8) drop-shadow(0 0 3px #fffee8)",
    },
    player: {
        top: 317,
        left: 283,
        height: "70px",
    },
    sho: {
        top: 309,
        left: 139,
        transform: "scale(-1, 1)",
    },
    stefa: {
        top: 318,
        left: 403,
        transform: "scale(-1, 1)",
    },
    wess: {
        top: 267,
        left: 523,
        transform: "scale(-1, 1)",
    },
    mushroom1: {
        top: 170,
        left: 700,
    },
    mushroom2: {
        top: 170,
        left: 780,
    },
    mushroom3: {
        top: 170,
        left: 730,
    },
    mushroom4: {
        top: 170,
        left: 830,
    },
    mushroom5: {
        top: 170,
        left: 870,
    },
});

const KittenBarrels2 = ({ player }: SceneProps) => {
    const classes = useStyles();

    return (
        <div className={classes.root}>
            <img src={player.image} className={classNames(classes.player, classes.character)} />
            <img src={StefaImage} className={classNames(classes.stefa, classes.character)} />
            <img src={ShoImage} className={classNames(classes.sho, classes.character)} />
            <img src={WessImage} className={classNames(classes.wess, classes.character)} />
            <img src={GreenMushroomImage} className={classNames(classes.mushroom1, classes.character)} />
            <img src={GreenMushroomImage} className={classNames(classes.mushroom2, classes.character)} />
            <img src={HornyMushroomImage} className={classNames(classes.mushroom3, classes.character)} />
            <img src={HornyMushroomImage} className={classNames(classes.mushroom4, classes.character)} />
            <img src={GreenMushroomImage} className={classNames(classes.mushroom5, classes.character)} />
        </div>
    );
};

export default KittenBarrels2;
