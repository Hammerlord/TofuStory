import classNames from "classnames";
import { createUseStyles } from "react-jss";
import { kpqSwamp, shoImage, stefaImage, wessImage } from "../../images";

const useStyles = createUseStyles({
    root: {
        position: "relative",
        background: `url(${kpqSwamp}) no-repeat`,
        width: "892px",
        height: "539px",
    },
    character: {
        position: "absolute",
        WebkitFilter: "drop-shadow(0 0 3px #fffee8) drop-shadow(0 0 3px #fffee8)",
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

const KPQSewer = ({ player }) => {
    const classes = useStyles();

    return (
        <div className={classes.root}>
            <img src={player.image} className={classNames(classes.player, classes.character)} />
            <img src={stefaImage} className={classNames(classes.stefa, classes.character)} />
            <img src={shoImage} className={classNames(classes.sho, classes.character)} />
            <img src={wessImage} className={classNames(classes.wess, classes.character)} />
        </div>
    );
};

export default KPQSewer;
