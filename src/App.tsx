import { createUseStyles } from "react-jss";
import Main from "./Menu/Main";
import { getConfiguredStore, store } from "./store";
import { Provider } from "react-redux";
import DevToolButton from "./devtools/DevToolButton";
import { useMemo } from "react";
import classNames from "classnames";
import { createTheme, ThemeProvider } from "@material-ui/core/styles";

const useStyles = createUseStyles({
    app: {
        fontFamily: "Barlow, Arial",
        userSelect: "none",
        letterSpacing: "0.02rem",
        "& ::-webkit-scrollbar": {
            width: "10px",
        },

        "& ::-webkit-scrollbar-track": {
            background: "transparent",
        },

        "& ::-webkit-scrollbar-thumb": {
            background: "rgba(0, 0, 0, 0.25)",
            borderRadius: "10px",
            border: "4px solid transparent",
        },

        "& ::-webkit-scrollbar-thumb:hover": {
            background: "rgba(0, 0, 0, 0.4)",
        },

        "& img": {
            userDrag: "none",
        },
        "& hr": {
            borderTop: 0,
            borderLeft: 0,
            borderRight: 0,
        },
    },
    root: {
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        right: 0,
    },
});

const theme = createTheme({
    palette: {
        primary: {
            main: "#790",
            contrastText: "white",
        },
        secondary: {
            main: "#d58a00",
            contrastText: "white",
        },
    },
});

export const App = () => {
    const classes = useStyles();
    const isDevToolEnabled = false;
    const devStore = useMemo(() => (isDevToolEnabled ? getConfiguredStore() : undefined), [isDevToolEnabled]);

    return (
        <ThemeProvider theme={theme}>
            <Provider store={store}>
                <div className={classNames(classes.app, classes.root)}>
                    <Main />
                </div>
            </Provider>
            {isDevToolEnabled && (
                <Provider store={devStore}>
                    <div className={classes.app}>
                        <DevToolButton />
                    </div>
                </Provider>
            )}
        </ThemeProvider>
    );
};
