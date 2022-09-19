import { createUseStyles } from "react-jss";
import Main from "./Menu/Main";
import { getConfiguredStore, store } from "./store";
import { Provider } from "react-redux";
import DevToolButton from "./devtools/DevToolButton";
import { useMemo } from "react";
import classNames from "classnames";

const useStyles = createUseStyles({
    app: {
        fontFamily: "Barlow, Arial",
        userSelect: "none",
        "& button": {
            fontFamily: "Barlow, Arial",
            cursor: "pointer",
            "&:active": {
                transform: "translateX(1px) translateY(1px)",
                transition: "transform 0.2s",
            },
        },
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
    },
    root: {
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        right: 0,
    },
    button: {
        padding: "8px 32px",
        fontFamily: "Barlow, Arial",
        fontSize: "1.1rem",
        fontWeight: 500,
        border: 0,
    },
});

export const App = () => {
    const classes = useStyles();
    const isDevToolEnabled = true;
    const devStore = useMemo(() => (isDevToolEnabled ? getConfiguredStore() : undefined), [isDevToolEnabled]);

    return (
        <>
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
        </>
    );
};
