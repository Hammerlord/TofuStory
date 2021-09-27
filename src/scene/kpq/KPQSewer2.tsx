import classNames from "classnames";
import { createUseStyles } from "react-jss";
import { kpqSwamp, ligatorImage, shoImage, stefaImage, wessImage } from "../../images";

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
    ligator: {
        left: 690,
        top: 330,
    },
    ligator2: {
        left: 750,
        top: 330,
    },
});

const KPQSewer2 = ({ player }) => {
    const classes = useStyles();

    return (
        <div className={classes.root}>
            <img src={player.image} className={classNames(classes.player, classes.character)} />
            <img src={stefaImage} className={classNames(classes.stefa, classes.character)} />
            <img src={shoImage} className={classNames(classes.sho, classes.character)} />
            <img src={wessImage} className={classNames(classes.wess, classes.character)} />
            <img src={ligatorImage} className={classNames(classes.ligator, classes.character)} />
            <img src={ligatorImage} className={classNames(classes.ligator2, classes.character)} />
        </div>
    );
};

export default KPQSewer2;
