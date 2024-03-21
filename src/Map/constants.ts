export const TOWN_PLACES = {
    SHOP: "shop",
    TRADING_POST: "trading-post",
    CLASS_LEADER: "class-leader",
    CAMPAIGN: "campaign",
    REST: "resting-spot",
    GACHAPON: "gachapon",
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
    townCenter: {
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
        margin: "auto",
        position: "relative",
        display: "inline-block",
        verticalAlign: "middle",
    },
    townCenterImage: {
        filter: "saturate(0.5)",
        opacity: 0.8,
    },
    townHeader: {
        position: "absolute",
        left: "50%",
        top: 0,
        transform: "translateX(-50%)",
        textShadow: Array.from({ length: 10 })
            .map(() => "0 0 3px black")
            .join(", "),
    },
    thoughtBubbleContainer: {
        width: 100,
        position: "absolute",
        top: "20%",
        left: "50%",
        filter: "drop-shadow(0 0 3px black) drop-shadow(0 0 5px black)",
    },
    thought: {
        position: "absolute",
        top: "40%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        fontSize: "16px",
    },
    player: {
        height: 65,
        position: "absolute",
        left: "50%",
        transform: "translateX(-50%)",
    },
};
