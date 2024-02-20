import classNames from "classnames";
import { createUseStyles } from "react-jss";
import { LigatorImage, ShoImage, StefaImage, SwampKPQImage, WessImage } from "../../../images";
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
        left: 410,
        top: 290,
        height: "70px",
    },
    sho: {
        left: 250,
        top: "282px",
        transform: "scale(-1, 1)",
    },
    stefa: {
        left: 572,
        top: "293px",
        transform: "scale(-1, 1)",
    },
    wess: {
        left: 221,
        top: 284,
        transform: "scale(-1, 1)",
    },
});

const KPQSewer3 = ({ player }: SceneProps) => {
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

export default KPQSewer3;
