import { createUseStyles } from "react-jss";
import { GachaponImage, HenesysGachaponFullImage } from "../../images";
import classNames from "classnames";

const useStyles = createUseStyles({
    root: {
        position: "relative",
        background: `url(${HenesysGachaponFullImage}) no-repeat`,
        width: "1000px",
        height: "600px",
    },
    character: {
        position: "absolute",
        filter: "drop-shadow(0 0 3px #fffee8) drop-shadow(0 0 3px #fffee8)",
    },
    gachapon: {
        top: 228,
        left: 484,
    },
    player: {
        maxHeight: 65,
        top: 303,
        left: 385,
    },
});

const GachaponScene = ({ player }) => {
    const classes = useStyles();
    return (
        <div className={classes.root}>
            <img src={GachaponImage} alt="gachapon" className={classNames(classes.character, classes.gachapon)} />
            <img src={player.image} alt="Player" className={classNames(classes.character, classes.player)} />
        </div>
    );
};

export default GachaponScene;
