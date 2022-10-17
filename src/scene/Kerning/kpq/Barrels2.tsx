import classNames from "classnames";
import { createUseStyles } from "react-jss";
import { BarrelsSceneImage, KingSlimeImage, ShoImage, StefaImage, WessImage } from "../../../images";
import { SceneProps } from "../../types";

const useStyles = createUseStyles({
    root: {
        position: "relative",
        background: `url(${BarrelsSceneImage}) no-repeat`,
        width: "1050px",
        height: "525px",
    },
    character: {
        position: "absolute",
        WebkitFilter: "drop-shadow(0 0 3px #fffee8) drop-shadow(0 0 3px #fffee8)",
        filter: "drop-shadow(0 0 3px #fffee8) drop-shadow(0 0 3px #fffee8)",
    },
    player: {
        top: 239,
        left: 283,
        height: "70px",
    },
    sho: {
        top: 231,
        left: 129,
        transform: "scale(-1, 1)",
    },
    stefa: {
        top: 241,
        left: 202,
        transform: "scale(-1, 1)",
    },
    wess: {
        top: 234,
        left: 238,
        transform: "scale(-1, 1)",
    },
    kingSlime: {
        top: 170,
        left: 550,
    },
});

const Barrels2 = ({ player }: SceneProps) => {
    const classes = useStyles();

    return (
        <div className={classes.root}>
            <img src={player.image} className={classNames(classes.player, classes.character)} />
            <img src={StefaImage} className={classNames(classes.stefa, classes.character)} />
            <img src={ShoImage} className={classNames(classes.sho, classes.character)} />
            <img src={WessImage} className={classNames(classes.wess, classes.character)} />
            <img src={KingSlimeImage} className={classNames(classes.kingSlime, classes.character)} />
        </div>
    );
};

export default Barrels2;
