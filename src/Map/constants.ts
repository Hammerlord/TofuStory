export const TOWN_PLACES = {
    SHOP: "shop",
    TRADING_POST: "trading-post",
    CLASS_LEADER: "class-leader",
    CAMPAIGN: "campaign",
};

export const TOWN_STYLES = {
    bg: {
        width: "100%",
        height: "100%",
        position: "fixed",
        background: "rgba(50, 50, 50, 0.8)",
    },
    inner: {
        textAlign: "center",
        margin: "auto",
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        fontSize: "1.2rem",
        width: "100%",
        minWidth: 1500,
    },
    node: {
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
        margin: "auto",
        position: "relative",
        cursor: "pointer",
        display: "inline-block",
        padding: "0 64",
        verticalAlign: "middle",
    },
    nodeLabel: {
        position: "absolute",
        left: "50%",
        transform: "translateX(-50%)",
        top: "50",
        backgroundColor: "rgba(20, 20, 20, 0.85)",
        padding: "6px 16px",
        borderRadius: 4,
        textShadow: Array.from({ length: 10 })
            .map(() => "0 0 3px black")
            .join(", "),
        whiteSpace: "nowrap",
    },
    townCenter: {
        cursor: "grab",
    },
    townHeader: {
        position: "absolute",
        left: "50%",
        transform: "translateX(-50%)",
        textShadow: Array.from({ length: 10 })
            .map(() => "0 0 3px black")
            .join(", "),
    },
    iconWrapper: {
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        color: "white",
        width: "48px",
        height: "48px",
        fontSize: "32px",
        borderRadius: "48px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        position: "absolute",
        left: "50%",
        transform: "translateX(-50%)",
        top: "0",
    },
    icon: {
        margin: "auto",
    },
    visited: {
        filter: "saturate(0.25) brightness(0.6)",
        cursor: "unset",
    },
};
