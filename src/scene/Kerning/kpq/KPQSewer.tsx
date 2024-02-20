import classNames from "classnames";
import { createUseStyles } from "react-jss";
import { ShoImage, StefaImage, SwampKPQImage, WessImage } from "../../../images";
import { SceneProps } from "../../types";

const useStyles = createUseStyles({
    root: {
        position: "relative",
        background: `url(${SwampKPQImage}) no-repeat`,
        width: "892px",
        height: "539px",
    },
    character: {
        position: "absolute",
        filter: "drop-shadow(0 0 3px #fffee8) drop-shadow(0 0 3px #fffee8)",
    },
    player: {
        left: "334px",
        top: "285px",
        height: "70px",
    },
    sho: {
        left: "470px",
        top: "282px",
    },
    stefa: {
        left: "437px",
        top: "293px",
    },
    wess: {
        top: 284,
        left: 198,
        transform: "scale(-1, 1)",
    },
});

const KPQSewer = ({ player }: SceneProps) => {
    const classes = useStyles();

    return (
        <div className={classes.root}>
            <img src={player.image} className={classNames(classes.player, classes.character)} />
            <img src={StefaImage} className={classNames(classes.stefa, classes.character)} />
            <img src={ShoImage} className={classNames(classes.sho, classes.character)} />
            <img src={WessImage} className={classNames(classes.wess, classes.character)} />
        </div>
    );
};

export default KPQSewer;
