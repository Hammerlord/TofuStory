import { createUseStyles } from "react-jss";
import { GachaponImage } from "../../images";

const useStyles = createUseStyles({
    root: {
        position: "relative",
        width: "800px",
        height: "400px",
    },
});

const GachaponScene = () => {
    const classes = useStyles();
    return (
        <div className={classes.root}>
            <img src={GachaponImage} alt="gachapon" />
        </div>
    );
};

export default GachaponScene;
