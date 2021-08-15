import { createUseStyles } from "react-jss";
import MainMenu from "./Menu/MainMenu";

const useStyles = createUseStyles({
    app: {
        fontFamily: "Barlow, Arial",
        "& button": {
            fontFamily: "Barlow, Arial",
            cursor: "pointer",
            "&:active": {
                transform: "translateX(1px) translateY(1px)",
                transition: "transform 0.2s",
            },
        },
    },
});

export const App = () => {
    const classes = useStyles();

    return (
        <div className={classes.app}>
            <MainMenu />
        </div>
    );
};
